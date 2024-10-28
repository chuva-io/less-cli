import fs from 'fs';
import path from 'path';

import check_resources from '../check_resources/index.js';
import add_to_package_json from '../add_to_package_json/index.js';

const kvs_handler_code = `const { #kvs-table-module# } = require('lessSqliteDB');
const topics = #topics-import#;

const client = new #kvs-table-module#();

const events = {
  created: 'created',
  updated: 'updated',
  deleted: 'deleted'
};

const publish_kvs_event = async (new_value, topic, event) => {
  const data = {
    key: new_value.id
  };

  if (event === events.created || event === events.updated) {
    data.new_value = typeof new_value.value  !== 'string'
      ? JSON.parse(new_value.value)
      : new_value.value;
  }

  if (event === events.deleted || event === events.updated) {
    const item = await client.getOne({ id: new_value.id });
    data.old_value = JSON.parse(item.value);
  }

  topic.publish(data);
};

const kvs_get = async (key) => {
  if (!key) {
    throw new Error('Error: The param "key" must be provided');
  }

  if (typeof key !== 'string') {
    throw new Error('Error: The param "key" must be of type string');
  }

  const item = await client.getOne({ id: key });

  return item ? JSON.parse(item.value) : null;
};

const kvs_set = async (key, value, ttl) => {
  let date;
  if (!key) {
    throw new Error('Error: The param "key" must be provided');
  }
  
  if (typeof key !== 'string') {
    throw new Error('Error: The param "key" must be of type string');
  }

  if (!value) {
    throw new Error('Error: The param "value" must be provided');
  }

  if (ttl) {
    if (typeof ttl !== 'number') {
      throw new Error('Error: The param "ttl" must be of type number');
    }

    date = new Date(Date.now() + ttl).toISOString();
  }

  const params = { id: key, value: JSON.stringify(value) };
  if (date) {
    params.ttl = date;
  }

  const item = await client.getOne({ id: key });

  if (item) {
    if (topics.kvs_updated) {
      await publish_kvs_event(params, topics.kvs_updated, events.updated);
    }

    delete params.id;
    await client.update({
      columns: params,
      where: { id: key }
    });
  } else {
    await client.create(params);

    if (topics.kvs_created) {
      await publish_kvs_event(params, topics.kvs_created, events.created);
    }
  }
};

const kvs_delete = async (key) => {
  if (!key) {
    throw new Error('Error: The param "key" must be provided');
  }
  
  if (typeof key !== 'string') {
    throw new Error('Error: The param "key" must be of type string');
  }

  const params = { id: key };

  if (topics.kvs_deleted) {
    await publish_kvs_event(params, topics.kvs_deleted, events.deleted);
  }

  await client.delete(params);
};

module.exports = {
  get: kvs_get,
  set: kvs_set,
  delete: kvs_delete
};
`;

const chuva_depenencies_code = `const kvs = require(\'./kvs\');
#imports#
module.exports = {
  kvs,
  #exports#
};`

const python_handler_code = `const { exec } = require('child_process');

const execute_python_handler = async (data, current_dir_path) => {
  const response = await new Promise(
    (resolve, reject) => (
      exec(
        \`python3 \${current_dir_path}/python_handler.py --data \${JSON.stringify(data)}\`,
        (error, stdout, stderr) => {
          if (error) {
            reject(error);
            return;
          }

          const response = stdout
            .match(
              /#LESS-EXPRESS::RETURNING-RESPONSE::<\{.*\}>::RETURNING-RESPONSE::LESS-EXPRESS#/
            )[0]
            .replace('#LESS-EXPRESS::RETURNING-RESPONSE::<{', '')
            .replace('}>::RETURNING-RESPONSE::LESS-EXPRESS#', '');

          resolve(response);
        }
      )
    )
  );

  return response;
};

module.exports = execute_python_handler;
`;

const cron_delete_key_value_storage_items_code = `const { CronJob } = require('cron');
const { kvs } = require('@chuva.io/less');
const { #kvs-table-module# } = require('lessSqliteDB');

const time_zone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const cron = new CronJob(
  '* * * * * *',
  async () => {
    const client = new #kvs-table-module#();
    const items = await client.getAll({ ttl: { '<=': new Date().toISOString() } });
    await Promise.all(items.map(item => kvs.delete(item.id)));
    client.close();
    if (items.length) {
      console.log(
        \`#less-local-info-tag#The items (\${items.map(item => item.id).join(', ')}) were deleted from kvs after reaching their ttl limit.#less-local-info-tag#\`
      );
    }
  },
  null, 
  false,
  time_zone
);

module.exports = () => {
  cron.start();
};
`;

const build = (config) => {
  const resources_checked = check_resources(
    config.project_less_resources_location,
    config.less_resources
  );

  fs.mkdirSync(
    config.chuva_dependency_path,
    { recursive: true }
  );

  const topics_import = !fs.existsSync(path.resolve(
    config.project_less_resources_location,
    config.less_resources.topics
  ))
    ? '{}'
    : 'require(\'./topics\')';

  fs.writeFileSync(
    config.chuva_dependency_path + '/kvs.js',
    kvs_handler_code
      .replace('#topics-import#', topics_import)
      .replaceAll('#kvs-table-module#', config.less_sqlite_tables.kvs.model)
  );
  
  const resources_found =  [
    config.less_resources.topics,
    config.less_resources.sockets,
    config.less_resources.functions
  ].filter(
    resource => Object.keys(resources_checked).includes(resource)
  );

  fs.writeFileSync(
    config.chuva_dependency_path + '/index.js',
    chuva_depenencies_code
      .replace(
        '#imports#',
        resources_found.map(resource => `const ${resource} = require('./${resource}');\n`).join('')
      )
      .replace(
        '#exports#',
        resources_found.map(resource => resource).join(',\n  ')
      )
  );

  const python_handler_path = path.resolve(
    config.project_build_path,
    config.python_handler_dependency
  );

  fs.mkdirSync(python_handler_path, { recursive: true });
  fs.writeFileSync(
    python_handler_path + '/index.js',
    python_handler_code
  );

  const crons_path = path.resolve(
    config.project_build_path,
    'cron_delete_key_value_storage_items'
  );

  fs.mkdirSync(crons_path, { recursive: true });
  fs.writeFileSync(
    crons_path + '/index.js',
    cron_delete_key_value_storage_items_code
      .replaceAll('#less-local-info-tag#', config.less_local_info_flag)
      .replaceAll('#kvs-table-module#', config.less_sqlite_tables.kvs.model)
  );

  config.app_imports += 'const cron_delete_key_value_storage_items = require(\'./cron_delete_key_value_storage_items\');\n';
  config.app_callers += 'cron_delete_key_value_storage_items();\n';

  config.content_paths_to_delete.push(config.chuva_dependency_path);
  add_to_package_json(config, {
    devDependencies: {
      [config.chuva_dependency]: `file:./${config.chuva_dependency}`,
      [config.python_handler_dependency]: `file:./${config.python_handler_dependency}`
    }
  });
}

export default build;
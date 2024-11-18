import fs from 'fs';
import path from 'path';

import map_dirs_recursive from '../map_dirs_recursive/index.js';

const publishers_code = `const fs = require('fs');
const path = require('path');
const { #topics-table-module# } = require('#database-dependency#');
const { randomUUID } = require('crypto');
  
const topic_handler = async (topic_name, topic_data) => {
  const topic_path = path.resolve(
    __dirname,
    'handlers',
    topic_name
  );

  const topic_processors_names = fs.readdirSync(topic_path);

  const processors = topic_processors_names
    .map(
      processor_name => require(\`./#topics-handlers#/\${topic_name}/\${processor_name}\`)
    );

  Promise.all(processors.map(
    async (processor, index) => {
      try {
        await processor.process(topic_data);

        console.log(
          \`#less-local-info-tag#Processor "\${topic_processors_names[index]}" from topic "\${topic_name}" was successfully processed.#less-local-info-tag#\`
        );
      } catch(error) {
        const message_id = randomUUID();
        console.log(
          \`#less-local-error-tag#Failed to process topic '\${topic_name}' processor '\${topic_processors_names[index]}.The message has been stored for later processing. Error: <#\${error}#>#less-local-error-tag#'\`
        );

        const topics = new #topics-table-module#();
  
        await topics.create({
          retrying: false,
          id: message_id,
          times_retried: 0,
          topic: topic_name,
          message: JSON.stringify(topic_data),
          created_at: new Date().toISOString(),
          processor: topic_processors_names[index],
        });

        topics.close();
      }
    }
  ));
}

module.exports = {
  #exports#
}
`;

const topic_publisher_snipped_code = `#topic#: {
    publish: async (data) => {
      topic_handler('#topic#', data);
    }
  }`;

const cron_retry_failed_processors_code = `const { CronJob } = require('cron');
const { #topics-table-module# } = require('lessSqliteDB');

const time_zone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const process_topic_queue = async (data, db_client) => {
  const topic_name = data.topic;
  const processor_name = data.processor;

  try {
    const topic_data = JSON.parse(data.message);
  
    const processor = require(\`@chuva.io/less/topics/handlers/\${topic_name}/\${processor_name}\`);
    
    await processor.process(topic_data);
    await db_client.delete({ id: data.id });

    console.log(
      \`#less-local-info-tag#Processor "\${processor_name}" from topic "\${topic_name}" was successfully processed after \${data.times_retried + 1} retries.#less-local-info-tag#\`
    );
  } catch(error) {
    console.log(
      \`#less-local-error-tag#Processor "\${processor_name}" from topic "\${topic_name}" failed to process after \${data.times_retried + 1} retries. Error: <#\${error}#>#less-local-error-tag#\`
    );

    await db_client.update({
      columns: {
        retrying: false,
        times_retried: data.times_retried + 1
      },
      where: {
        id: data.id
      }
    });
  }
};

const cron = new CronJob(
  '*/5 * * * * *',
  async () => {
    const client = new #topics-table-module#();
    const items = await client.getAll({ retrying: false });
    
    if (items.length) {
      await client.update({
        columns: { retrying: true },
        where: { 
          id: { 'in': items.map(item => item.id) } 
        } 
      });
  
      await Promise.all(items.map(item => process_topic_queue(item, client)));
    }
    
    client.close();
  },
  null, 
  false,
  time_zone
);

module.exports = () => {
  cron.start();
};
`;

const build_topics = (config) => {
  const topics_handlers_name = 'handlers';
  const project_topics_path = path.resolve(
    config.project_less_resources_location,
    config.less_resources.topics
  );

  if (!fs.existsSync(project_topics_path)) {
    return;
  }

  const topics_handlers = map_dirs_recursive(project_topics_path);
  const topics_path = path.resolve(
    config.chuva_dependency_path,
    config.less_resources.topics
  );

  if (!fs.existsSync(topics_path)) {
    fs.mkdirSync(topics_path, { recursive: true });
  }

  const module_exports = Object
    .keys(topics_handlers)
    .map(
      element => topic_publisher_snipped_code
        .replaceAll('#topic#', element)
    ).join(',\n  ');
  
  const handlers_path = path.resolve(
    topics_path,
    topics_handlers_name
  );

  fs.mkdirSync(handlers_path, { recursive: true });
  fs.writeFileSync(
    topics_path + '/index.js',
    publishers_code
      .replace('#exports#', module_exports)
      .replaceAll('#topics-handlers#', topics_handlers_name)
      .replaceAll('#less-local-info-tag#', config.less_local_info_flag)
      .replaceAll('#less-local-error-tag#', config.less_local_error_flag)
      .replaceAll('#database-dependency#', config.sqlite_database_dependency)
      .replaceAll('#topics-table-module#', config.less_sqlite_tables.topics.model)
  );
  
  fs.cpSync(
    path.join(
      config.project_less_resources_location,
      config.less_resources.topics
    ),
    handlers_path,
    { recursive: true }
  );

  const cron_retry_failed_topic_processors_name = 'cron_retry_failed_topic_processors';
  const cron_retry_failed_processors_path = path.resolve(
    config.project_build_path,
    cron_retry_failed_topic_processors_name
  );

  config.app_imports += `const ${cron_retry_failed_topic_processors_name} = require(\'./${cron_retry_failed_topic_processors_name}\');\n`;
  config.app_callers += `${cron_retry_failed_topic_processors_name}();\n`;

  fs.mkdirSync(cron_retry_failed_processors_path, { recursive: true });
  fs.writeFileSync(
    cron_retry_failed_processors_path + '/index.js',
    cron_retry_failed_processors_code
      .replaceAll('#less-local-info-tag#', config.less_local_info_flag)
      .replaceAll('#less-local-error-tag#', config.less_local_error_flag)
      .replaceAll('#topics-table-module#', config.less_sqlite_tables.topics.model)
  );
};

export default build_topics;
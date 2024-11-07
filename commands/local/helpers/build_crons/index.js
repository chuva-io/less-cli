import fs from 'fs';
import path from 'path';
import map_dirs_recursive from '../map_dirs_recursive/index.js';

const crons_handlers_code = `#crons-imports#
    
module.exports = {
  #crons-exports#
};`;

const cron_config_code = `const job_#cron-handler# = new CronJob(
  process.env.CRON_#cron-uppercase#.replace('?', '*'),
  async () => {
    try{
      await handlers.#cron-handler#.process();
      console.log(\`#less-local-info-tag#Cron '#cron-handler#' was successfully processed.#less-local-info-tag#\`);
    } catch(error) {
      console.log(\`#less-local-error-tag#Failed to process cron '#cron-handler#'. ERROR: <#\${error}#>#less-local-error-tag#\`);
    }
  },
  null,
  false,
  time_zone
);`

const crons_code = `const { CronJob } = require('cron');
const handlers = require('./handlers');

const time_zone = Intl.DateTimeFormat().resolvedOptions().timeZone;

#crons-configs#

module.exports = async () => {
  #crons-starts#
};`

const build = (config) => {
  const project_crons_path = path.join(
    config.project_less_resources_location,
    config.less_resources.crons,
  );
  
  if (!fs.existsSync(project_crons_path)) {
    return;
  }

  const crons = Object.keys(map_dirs_recursive(project_crons_path));
  
  const less_built_crons_path = path.join(
    config.project_build_path,
    config.less_resources.crons
  );

  const crons_handlers_path = path.join(
    less_built_crons_path,
    'handlers'
  );

  fs.mkdirSync(crons_handlers_path, { recursive: true });
  fs.cpSync(
    project_crons_path,
    crons_handlers_path,
    { recursive: true }
  );

  fs.writeFileSync(
    crons_handlers_path + '/index.js',
    crons_handlers_code
    .replace('#crons-exports#', crons.join(',\n'))
    .replace(
      '#crons-imports#',
      crons.map(cron => `const ${cron} = require('./${cron}');`).join('\n')
    )
  );

  fs.writeFileSync(
    less_built_crons_path + '/index.js',
    crons_code
      .replace(
        '#crons-configs#',
        crons.map(cron => cron_config_code
          .replaceAll('#cron-handler#', cron)
          .replace('#cron-uppercase#', cron.toUpperCase())
          .replaceAll(
            '#less-local-error-tag#',
            config.less_local_error_flag
          )
          .replaceAll(
            '#less-local-info-tag#',
            config.less_local_info_flag
          )
        ).join('\n\n')
      )
      .replace(
        '#crons-starts#',
        crons.map(cron => `job_${cron}.start();`).join('\n  ')
      )
    );

  config.app_imports += 'const crons = require(\'./crons\');\n';
  config.app_callers += 'crons();\n'
}

export default build;
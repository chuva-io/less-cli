import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

import readYamlFile from 'read-yaml-file';
import add_to_package_json from '../add_to_package_json/index.js';

import { LESS_LOCAL_FLAG } from '../../constants/index.js'

const create_dotenv_based_on_less_config = async  (config) => {
  const less_config_path = path.join(config.project_location, 'less.config');
  
  if (!fs.existsSync(less_config_path)) {
    return;
  }

  const less_config_env_vars = await readYamlFile(less_config_path);

  const env_file = less_config_env_vars.env_vars.map(
    env_var => {
      if (!process.env[env_var]) {
        const less_local_flag = chalk.yellowBright(LESS_LOCAL_FLAG);
        process.exitCode = 1;

        console.log(
          less_local_flag,
          chalk.redBright(`Error: Could not find the env_var "${env_var}" exported to your terminal.`)
        );

        throw Error('env var not found');
      }

      return `${env_var}=${process.env[env_var]}`
    }
  ).join('\n');

  fs.mkdirSync(config.project_build_path, { recursive: true });
  fs.writeFileSync(
    path.join(config.project_build_path, '.env'),
    env_file
  );

  add_to_package_json(config, {
    dependencies: {
      dotenv: "^16.4.5"
    }
  });

  config.app_imports = 
    `require(\'dotenv\').config({ path: '${config.project_build_path}/.env' });\n`
    + config.app_imports;
}

export default create_dotenv_based_on_less_config;

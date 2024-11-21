import fs from 'fs';
import path from 'path';
import cron_validator from 'cron-validator';
import read_yaml_file from 'read-yaml-file';

import validate_resource_instance_name from '../../validate_resources_instances_names.js';
import { ResourceNameInvalidException, ResourceHandlerNotFoundException } from '../errors/index.js';

export default async (project_less_path) => {
  const crons_path = path.join(project_less_path, 'crons');
  
  if (!fs.existsSync(crons_path)) {
    return;
  }

  const crons = fs.readdirSync(crons_path)
    .filter((element) => fs.statSync(path.join(crons_path, element)).isDirectory());

  if (!crons.length) {
    return;
  }

  const less_config_path = path.join(project_less_path, '..', 'less.config');

  const less_config_env_vars = fs.existsSync(less_config_path) 
    ? (await read_yaml_file(less_config_path)).env_vars
    : [];

  crons.forEach((cron) => {
    if (!validate_resource_instance_name(cron)) {
      throw new ResourceNameInvalidException(
        `Invalid cron name "${cron}". ${validate_resource_instance_name.regexConstrainMessage}`
      );
    }

    const cron_items = fs.readdirSync(path.join(crons_path, cron));

    if (
      !cron_items.length
      || !cron_items.find((item) => (
        fs.statSync(path.join(crons_path, cron, item)).isFile()
        && /^(index\.js|__init__\.py)$/.test(item)
      ))
    ) {
      throw new ResourceHandlerNotFoundException(
        `Cron "${cron}" doesn't have a handler file named "index.js" or "__init__.py".`
      );
    }

    const cron_env_var = `CRON_${cron.toUpperCase()}`;

    const cron_value = process.env[cron_env_var];

    if (!less_config_env_vars.includes(cron_env_var) || !cron_value) {
      throw new Error(`The CRON expression for \`less/crons/${cron}\` was not found. Make sure to add \`${cron_env_var}\` to your less.config file and export it to your environment variables.\nYou can learn more in the documentation: https://docs.less.chuva.io/cron-jobs#set-cron-schedule`);
    }

    if (!cron_validator.isValidCron(cron_value)) {
      throw new Error(`Invalid CRON expression \`${cron_value}\` for CRON \`less/crons/${cron}\`.\nCheck out the following links for help in creating valid CRON expressions:\n\t- http://crontab.org\n\t- https://crontab.guru`);
    }
  });
}
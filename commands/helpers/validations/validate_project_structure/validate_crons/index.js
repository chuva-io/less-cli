import fs from 'fs';
import path from 'path';

import validate_resource_instance_name from '../../validate_resources_instances_names.js';
import { ResourceNameInvalidException, ResourceHandlerNotFoundException } from '../errors/index.js';

export default (project_less_path) => {
  const crons_path = path.join(project_less_path, 'crons');
  
  if (!fs.existsSync(crons_path)) {
    return;
  }

  const crons = fs.readdirSync(crons_path)
    .filter((element) => fs.statSync(path.join(crons_path, element)).isDirectory());

  if (!crons.length) {
    return;
  }

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
        && /^(index\.js|index\.ts|__init__\.py)$/.test(item)
      ))
    ) {
      throw new ResourceHandlerNotFoundException(
        `Cron "${cron}" doesn't have a handler file named "index.js", "index.ts", or "__init__.py".`
      );
    }
  });
}
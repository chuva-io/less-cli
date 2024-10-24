import fs from 'fs';
import path from 'path';

import validate_resource_instance_name from '../../validate_resources_instances_names.js';
import { ResourceNameInvalidException, ResourceHandlerNotFoundException } from '../errors/index.js';

export default (project_less_path) => {
  const cloud_functions_path = path.join(project_less_path, 'functions');
  
  if (!fs.existsSync(cloud_functions_path)) {
    return;
  }

  const cloud_functions = fs.readdirSync(cloud_functions_path)
    .filter((element) => fs.statSync(path.join(cloud_functions_path, element)).isDirectory());

  if (!cloud_functions.length) {
    return;
  }

  cloud_functions.forEach((cloud_function) => {
    if (!validate_resource_instance_name(cloud_function)) {
      throw new ResourceNameInvalidException(
        `Invalid cloud function name "${cloud_function}". ${validate_resource_instance_name.regexConstrainMessage}`
      );
    }

    const cloud_function_items = fs.readdirSync(
      path.join(cloud_functions_path, cloud_function)
    );

    if (
      !cloud_function_items.length
      || !cloud_function_items.find((item) => (
        fs.statSync(path.join(cloud_functions_path, cloud_function, item)).isFile()
        && /^(index\.js|__init__\.py)$/.test(item)
      ))
    ) {
      throw new ResourceHandlerNotFoundException(
        `Cloud function "${cloud_function}" doesn't have a handler file named "index.js" or "__init__.py".`
      );
    }
  });
}
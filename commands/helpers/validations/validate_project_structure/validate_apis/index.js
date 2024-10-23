import fs from 'fs';
import path from 'path';

import validate_api_route_path from './validate_api_routes/index.js';
import { ResourceNameInvalidException } from '../errors/index.js';
import validate_resource_instance_name from '../../validate_resources_instances_names.js';

export default (project_less_path) => {
  const apis_path = path.join(project_less_path, 'apis');
  
  if (!fs.existsSync(apis_path)) {
    return;
  }

  const apis = fs.readdirSync(apis_path);

  if (!apis.length) {
    return;
  }

  apis.forEach((api) => {
    if (!validate_resource_instance_name(api)) {
      throw new ResourceNameInvalidException(
        `Invalid API name "${api}". ${validate_resource_instance_name.regexConstrainMessage}.`
      );
    }

    validate_api_route_path(api);
  });
}
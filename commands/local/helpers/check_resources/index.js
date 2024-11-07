import fs from 'fs';
import path from 'path';
import map_dirs_recursive from '../map_dirs_recursive/index.js';

const find_languges_file = (item) => {
  if (item && Object.keys(item).find(el => /^__init__\.py|index\.js$/.test(el))) {
    return true;
  }

  if (item === null) {
    return false;
  }

  return Boolean(Object.keys(item).find(el => find_languges_file(item[el])));
}

const check_resources = (project_less_resources_location, less_resources) => {
  const resources = fs.readdirSync(project_less_resources_location);
  
  let found;
  resources
    .filter(
      item => Object.keys(less_resources).includes(item)
    ).forEach(resource => {
      found = {
        ...(found || {}),
        [resource]: find_languges_file(map_dirs_recursive(
          path.resolve(
            project_less_resources_location,
            resource
          )
        ))
      };
    });

  return found;
};

export default check_resources;
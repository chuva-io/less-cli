import fs from 'fs';
import path from 'path';
import map_dirs_recursive from '../map_dirs_recursive/index.js';
import add_to_package_json from '../add_to_package_json/index.js';

const build = (config) => {
  const shared_path = path.resolve(
    config.project_less_resources_location,
    config.less_resources.shared
  );

  if (!fs.existsSync(shared_path)) {
    return;
  }

  const shared_modules = map_dirs_recursive(shared_path);

  if (!shared_modules || shared_modules.length) {
    return;
  }

  const devDependencies = {};
  Object.keys(shared_modules).forEach(element => {
    if (shared_modules[element]['index.js'] === null) {
      config.shared.push(element);
      devDependencies[element] = `${path.join(shared_path, element)}`;
    }
  });

  add_to_package_json(config, { devDependencies });
}

export default build;
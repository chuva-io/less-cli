import fs from 'fs';
import path from 'path';

/**
 * Store new information on the package json located to the build path
 * @param {Object} config - All the project build config data
 * @param {Object} data - The information to store on the package_json
 */
const add_to_package_json = (config, data) => {
  let package_json_path = path.join(
    config.project_build_path,
    config.javascript_dependencies_file_name
  );
  
  let package_json_readed_content = {
    name: config.project_name,
    version: '1.0.0',
    main: 'app.js',
    license: 'MIT',
    dependencies: { },
    devDependencies: { }
  };

  if (!fs.existsSync(package_json_path)) {
    package_json_path = path.join(
      config.project_location,
      config.javascript_dependencies_file_name
    );

    if (fs.existsSync(package_json_path)) {
      const project_package_json_content = JSON.parse(
        fs.readFileSync(package_json_path, 'utf-8')
      );
  
      project_package_json_content.devDependencies = {};
      package_json_readed_content = project_package_json_content;
    }
  } else {
    package_json_readed_content = JSON.parse(
      fs.readFileSync(package_json_path, 'utf-8')
    );
  }

  Object.keys(data).forEach(element => {
    Object.keys(data[element]).forEach(item => {
      if (!package_json_readed_content[element]) {
        package_json_readed_content[element] = {};
      }
      package_json_readed_content[element][item] = data[element][item];
    });
  });

  const express_package_json_path = path.join(
    config.project_build_path,
    config.javascript_dependencies_file_name
  );

  if (!fs.existsSync(config.project_build_path)) {
    fs.mkdirSync(config.project_build_path);
  }

  fs.writeFileSync(
    express_package_json_path,
    JSON.stringify(package_json_readed_content, null, 2)
  );
};

export default add_to_package_json;
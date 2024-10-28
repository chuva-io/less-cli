import fs from 'fs';
import path from 'path';
import { APP_CONFIG_FILE } from '../../constants/index.js';

const get = (build_path) => {
  const config_file_path = path.resolve(build_path, APP_CONFIG_FILE);

  if (!fs.existsSync(config_file_path)) {
    return {};
  }

  return JSON.parse(fs.readFileSync(config_file_path, 'utf-8'));
}

const set = (build_path, new_data) => {
  const config_file_path = path.resolve(build_path, APP_CONFIG_FILE);

  let data = {};
  if (fs.existsSync(config_file_path)) {
    data = JSON.parse(fs.readFileSync(config_file_path, 'utf-8'));
  }

  Object.keys(new_data).forEach(key => {
    data[key] = new_data[key];
  });

  fs.writeFileSync(config_file_path, JSON.stringify(data, null, 2));
};

export default {
  get,
  set
};
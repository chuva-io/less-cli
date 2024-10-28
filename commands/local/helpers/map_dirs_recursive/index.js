import fs from 'fs';
import path from 'path';

const map_dirs_recursive = (dir_path) => {
  if (!fs.statSync(dir_path).isDirectory()) {
    return null;
  }

  const path_dirs = fs.readdirSync(dir_path);

  const dirs = {};
  path_dirs.forEach(item => {
    const new_path = path.join(dir_path, item);

    const result = map_dirs_recursive(new_path);

    dirs[item] = result;
  });

  return dirs;
}

export default map_dirs_recursive;
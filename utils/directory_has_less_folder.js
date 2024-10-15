import fs from 'fs';
import path from 'path';

const directory_has_less_folder = () => {
  const project_dir_path = process.cwd();
  const project_less_path = path.resolve(project_dir_path, 'less');

  if (fs.existsSync(project_less_path)) {
    return fs.statSync(project_less_path).isDirectory();
  }
}

export default directory_has_less_folder;

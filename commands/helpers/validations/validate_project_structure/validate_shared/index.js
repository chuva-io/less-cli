import fs from 'fs';
import path from 'path';

export default (project_less_path) => {
  const shared_path = path.join(project_less_path, 'shared');
  
  if (!fs.existsSync(shared_path)) {
    return;
  }

  const shareds = fs.readdirSync(shared_path)

  if (!shareds.length) {
    return;
  }

  if (shareds.find(elemet => fs.statSync(path.join(shared_path, elemet)).isFile())) {
    throw new Error('The shared folder "less/shared" should only contain directories.');
  }
}
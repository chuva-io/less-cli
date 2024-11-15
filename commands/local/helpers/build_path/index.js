import os from 'os';
import fs from 'fs';
import path from 'path';

export const get = () => {
  const builds_path = path.join(
    os.homedir(),
    '.less-cli',
    'builds'
  );

  if (!fs.existsSync(builds_path)) {
    fs.mkdirSync(builds_path, { recursive: true });
  }

  return builds_path;
};
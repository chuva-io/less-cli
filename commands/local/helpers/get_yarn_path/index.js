import path from 'path';
import { fileURLToPath } from 'url';

export default () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const yarn_path = path.resolve(__dirname, '../../../..', 'node_modules', '.bin', 'yarn');

  return yarn_path;
}
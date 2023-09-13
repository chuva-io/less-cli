import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export default function create() {
  console.log('Creating MongoDB shared JS template...');
  create_mongodb_client();
  console.log('\nCreated template successfully.');
  console.log('Remember to export your `MONGO_DB_URI` and `MONGO_DB_NAME` variables.');
}

const create_mongodb_client = () => {
  const working_directory = process.cwd();
  
  const folder_path = '/src/shared/mongodb_client';
  const destination_folder = path.join(working_directory, folder_path);

  const script_directory = path.dirname(fileURLToPath(import.meta.url));
  const template_directory = path.join(script_directory, '..', '..', '..', '/template_code/js/mongodb_js_shared_client');

  copyFolderRecursive(template_directory, destination_folder);
};

const copyFolderRecursive = (source, destination) => {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }
  else {
    console.error(`Unable to create template. \`${destination}\` already exists.`);
    process.exit(1);
  }

  const files = fs.readdirSync(source);
  for (const file of files) {
    const sourcePath = path.join(source, file);
    const destinationPath = path.join(destination, file);

    if (fs.lstatSync(sourcePath).isDirectory()) {
      copyFolderRecursive(sourcePath, destinationPath);
    } 
    else {
      fs.copyFileSync(sourcePath, destinationPath);
    }

    console.log(`Created \`${destinationPath}\`.`);
  }
};
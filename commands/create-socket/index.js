import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export default function create_socket(name) {
  console.log('Creating web socket...');
  
  const working_directory = process.cwd();
  
  const folder_path = `/src/sockets/${name}`;
  const destination_folder = path.join(working_directory, folder_path);

  const script_directory = path.dirname(fileURLToPath(import.meta.url));
  const template_directory = path.join(script_directory, '..', '..', '/template_code/js/socket');

  copyFolderRecursive(template_directory, destination_folder);

  console.log('Created socket successfully.');
}

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
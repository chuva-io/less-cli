import * as fs from 'node:fs';
import path from 'node:path';

export default function create(rootDir) {
  console.log('Creating MongoDB shared JS template...');
  createMongodbClient(rootDir);
  console.log('\nCreated template successfully.');
  console.log('Remember to export your `MONGO_DB_URI` and `MONGO_DB_NAME` variables.');
}

const createMongodbClient = (rootDir) => {
  const workingDirectory = process.cwd();

  const folderPath = path.join('src', 'shared', 'mongodb_client');
  const destinationFolder = path.join(workingDirectory, folderPath);

  const templateDirectory = path.join(rootDir, 'src', 'template_code', 'js', 'mongodb_js_shared_client');

  copyFolderRecursive(templateDirectory, destinationFolder);
};

const copyFolderRecursive = (source, destination) => {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  } else {
    console.error(`Unable to create template. \`${destination}\` already exists.`);
    process.exit(1);
  }

  const files = fs.readdirSync(source);
  for (const file of files) {
    const sourcePath = path.join(source, file);
    const destinationPath = path.join(destination, file);

    if (fs.lstatSync(sourcePath).isDirectory()) {
      copyFolderRecursive(sourcePath, destinationPath);
    } else {
      fs.copyFileSync(sourcePath, destinationPath);
    }

    console.log(`Created \`${destinationPath}\`.`);
  }
};

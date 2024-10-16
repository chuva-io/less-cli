import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import chalk from 'chalk';

// Get __dirname in ES module
const __dirname = dirname(fileURLToPath(import.meta.url));

// Get package version
const package_path = path.join(__dirname, '..', 'package.json');
const package_content = JSON.parse(fs.readFileSync(package_path, 'utf-8'));
const version = package_content?.version;

// Function to fetch the latest version from npm
async function check_for_updates() {
  const tag = 'https://api.github.com/repos/chuva-io/less-cli/tags'
  try {
    const response =  await axios.get(tag);
    const latest_version = response.data[0].name.replace('v', '');

    if (latest_version !== version) {
      console.log(chalk.yellowBright(`WARNING: You are using version ${version} of the Less CLI but the latest version is ${latest_version}.\nPlease update to have the best experience possible and take advantage of the latest features.`));
    }
  } catch (error) {
      return ;
  }
}

export default check_for_updates;
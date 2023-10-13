import AdmZip from 'adm-zip';
import axios from 'axios';
import chalk from 'chalk';
import FormData from 'form-data';
import fs from 'fs';
import * as glob from 'glob';
import ora from 'ora';
import path from 'path';
import WebSocket from 'ws';
import yaml from 'js-yaml';

const spinner = ora({ text: '' });

function loadEnvironmentVariables(configFile) {
  if (!fs.existsSync(configFile)) {
    console.error(chalk.redBright(`Config file not found: ${configFile}`));
    process.exit(1);
  }

  const configFileContent = fs.readFileSync(configFile, 'utf8');
  const config = yaml.load(configFileContent);

  if (!config.hasOwnProperty('env_vars')) {
    console.error(chalk.redBright("Key 'env_vars' not found in the less.config file"));
    process.exit(1);
  }

  const keys = config.env_vars;
  const envVars = {};

  for (const key of keys) {
    const value = process.env[key];
    if (value === undefined) {
      console.error(chalk.redBright(`Environment variable '${key}' must be defined`));
      process.exit(1);
    }
    envVars[key] = value;
  }

  return envVars;
}

async function deployProject(projectPath, projectName, envVars) {
  let connectionId;
  const tempZipFilename = 'temp_project.zip';
  const zip = new AdmZip();

  const itemsToZip = glob.sync('{src,requirements.txt,yarn.lock,package.lock,less.config,package.json}', {
    cwd: projectPath,
  });

  for (const item of itemsToZip) {
    const itemPath = path.join(projectPath, item);

    if (fs.statSync(itemPath).isDirectory()) {
      zip.addLocalFolder(itemPath, item);
    } else {
      zip.addLocalFile(itemPath);
    }
  }

  await zip.writeZipPromise(tempZipFilename);

  const serverUrl = 'https://less-server.chuva.io/v1/deploys';
  const socket = new WebSocket('wss://less-server.chuva.io');

  socket.on('open', async () => { });

  socket.on('message', async (data) => {
    const message = JSON.parse(data);

    if (message.event === 'deploymentStatus') {
      const statusData = message.data;
      const { status, resources, error } = statusData;

      if (status?.includes('Building...')) {
        spinner.stop();
      }

      console.log(chalk.yellowBright('[less-cli]'), chalk.greenBright(status));

      if (status?.includes('Deploy completed')) {
        console.log(chalk.yellowBright('[less-cli]'), '🇨🇻');
      }

      if (resources) {
        const { apis, websockets } = resources;

        if (apis?.length) {
          console.log(chalk.yellowBright('[less-cli]'), chalk.greenBright('\t- API URLs'));
          apis.forEach(api => {
            console.log(chalk.yellowBright('[less-cli]'), chalk.greenBright(`\t\t- ${api.api_name}: ${api.url}`));
          });
        }

        if (websockets?.length) {
          console.log(chalk.yellowBright('[less-cli]'), chalk.greenBright('\t- WEBSOCKET URLs'));
          websockets.forEach(websocket => {
            console.log(chalk.yellowBright('[less-cli]'), chalk.greenBright(`\t\t- ${websocket.api_name}: ${websocket.url}`));
          });
        }

        socket.close();
        process.exit(0);
      }

      if (error) {
        socket.close();
        process.exit(1); // Non-success exit code for failure
      }
    }

    if (message.event === 'conectionInfo') {
      connectionId = message.data?.connectionId;
      try {
        const formData = new FormData();
        formData.append('zipFile', fs.createReadStream(tempZipFilename));
        formData.append('env_vars', JSON.stringify(envVars));
        formData.append('project_name', JSON.stringify(projectName));

        const headers = {
          Authorization: `Bearer ${process.env.LESS_TOKEN}`,
          'connection_id': connectionId,
          ...formData.getHeaders(),
        };

        const response = await axios.post(serverUrl, formData, { headers });

        if (response.status === 202) {
          return response.data;
        }
      } catch (error) {
        spinner.stop();
        console.error(chalk.redBright('Error:'), error?.response?.data || 'Deployment failed');
        socket.close();
        process.exit(1); // Non-success exit code for failure
      } finally {
        fs.unlinkSync(tempZipFilename);
      }
    }
  });
}

export default async function deploy(projectName) {
  spinner.start('[less-cli] Connecting to the Less Server... ⚙️');
  spinner.start();
  try {
    const currentWorkingDirectory = process.cwd();
    const configFile = path.join(currentWorkingDirectory, 'less.config');
    const envVars = loadEnvironmentVariables(configFile);

    await deployProject(currentWorkingDirectory, projectName, envVars);
  } catch (error) {
    spinner.stop();
    console.error(chalk.redBright('Error: '), error.message || 'An error occurred');
    process.exit(1); // Non-success exit code for any error
  }
}

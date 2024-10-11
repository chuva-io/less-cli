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

import validate_project_folder from '../helpers/validations/validate_project_folder.js';
import { get_less_token, verify_auth_token } from '../helpers/credentials.js';
import validate_project_name from '../helpers/validations/validate_project_name.js';
import handleError from '../helpers/handle_error.js';

const spinner = ora({ text: '' });

function loadEnvironmentVariables(configFile, cronsPath) {
  if (!fs.existsSync(configFile)) {
    if (fs.existsSync(cronsPath)) {
      const files = fs.readdirSync(cronsPath);
      const dirs = files.filter((file) =>
        fs.statSync(path.join(cronsPath, file)).isDirectory(),
      );
  
      if (dirs?.length) {
        const missingEnvVars = dirs
          .map(
            (dir) =>
              `CRON_${dir
                .replace(/[A-Z]/g, (match) => `_${match}`)
                .toUpperCase()}`,
          )
          .join("\n  ");
  
        console.error(
          chalk.redBright(
            `\nMust create the less.config file and define the follow environment variables on 'env_vars':\n  ${missingEnvVars}`,
          ),
        );
        process.exitCode = 1;
        return ;
      }
    }
  
    return {};
  }
  

  const configFileContent = fs.readFileSync(configFile, 'utf8');
  const config = yaml.load(configFileContent);

  if (!config?.hasOwnProperty('env_vars')) {
    console.error(chalk.redBright("\nKey 'env_vars' not found in the less.config file"));
    process.exitCode = 1;
    return ;
  }

  const keys = config.env_vars;
  const envVars = {};

  // Verifying if the less config file has env vars
  if (!keys || !keys?.length) {
    console.error(chalk.redBright(`\nEnvironment variables must be defined in 'env_vars' on less.config file`));
    process.exitCode = 1;
    return ;
  }

  for (const key of keys) {
    const value = process.env[key];
    if (value === undefined) {
      console.error(chalk.redBright(`\nEnvironment variable '${key}' must be defined`));
      process.exitCode = 1;
      return ;
    }
    envVars[key] = value;
  }

  return envVars;
}

async function deployProject(projectPath, projectName, envVars) {
  let connectionId;
  const tempZipFilename = 'temp_project.zip';
  const zip = new AdmZip();

  const itemsToZip = glob.sync('{less,requirements.txt,yarn.lock,package.lock,less.config,package.json}', {
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
  
  await new Promise((resolve) => {
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
          resolve();
          return ;
        }
  
        if (error) {
          socket.close();
          process.exitCode = 1; // Non-success exit code for failure
          resolve();
          return ;
        }
      }
  
      if (message.event === 'conectionInfo') {
        connectionId = message.data?.connectionId;
        try {
          const formData = new FormData();
          formData.append('zipFile', fs.createReadStream(tempZipFilename));
          formData.append('env_vars', JSON.stringify(envVars));
          formData.append('project_name', JSON.stringify(projectName));
  
          const LESS_TOKEN = await get_less_token();
  
          const headers = {
            Authorization: `Bearer ${LESS_TOKEN}`,
            'connection_id': connectionId,
            ...formData.getHeaders(),
          };
  
          const response = await axios.post(serverUrl, formData, { headers });
  
          if (response.status === 202) {
            return response.data;
          }
        } catch (error) {
          spinner.stop();
          console.error(chalk.redBright('Error:'), error?.response?.data?.error || 'Deployment failed');
          socket.close();
          process.exitCode = 1; // Non-success exit code for failure
        } finally {
          if (process.exitCode && process.exitCode !== 0) {
            return ;
          }
          fs.unlinkSync(tempZipFilename);
        }
      }
    });
  });
}

export default async function deploy(projectName) {
  spinner.start('[less-cli] Connecting to the Less Server... ⚙️');
  spinner.start();
  try {
    const currentWorkingDirectory = process.cwd();
    const configFile = path.join(currentWorkingDirectory, 'less.config');
    const cronsDir = path.join(currentWorkingDirectory, 'less', 'crons');
    const envVars = loadEnvironmentVariables(configFile, cronsDir);

    if (!envVars) {
      return ;
    }

    verify_auth_token()
    validate_project_name(projectName)
    validate_project_folder(currentWorkingDirectory)

    await deployProject(currentWorkingDirectory, projectName, envVars);
  } catch (error) {
    spinner.stop();
    handleError(error.message)
  }
}

import AdmZip from 'adm-zip';
import axios from 'axios';
import chalk from 'chalk';
import FormData from 'form-data';
import fs from 'fs';
import * as glob from 'glob';
import ora from 'ora';
import path from 'path';
import WebSocket from 'ws';

import { get_less_token, verify_auth_token } from '../helpers/credentials.js';
import handleError from '../helpers/handle_error.js';
import validate_project_name from '../helpers/validations/validate_project_name.js';
import create_server_url from '../helpers/create_server_url.js';
import CONFIG from '../../utils/config.js';

const spinner = ora({ text: '' });

const CLI_PREFIX = '[less-cli]';

async function deployProject(organization_id, projectPath, projectName, envVars) {
  let connectionId;
  const tempZipFilename = 'temp_project.zip';
  const zip = new AdmZip();

  const itemsToZip = glob.sync('less/statics/*', {
    cwd:  projectPath,
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

  const socket = new WebSocket(CONFIG.LESS_SERVER_SOCKET_URL);

  await new Promise((resolve) =>{
    socket.on('open', async () => { });

    socket.on('message', async (data) => {
      const message = JSON.parse(data);
  
      if (message.event === 'deploymentStatus') {
        const statusData = message.data;
        const { status, resources, error } = statusData;
  
        if (status?.includes('Building...')) {
          spinner.stop();
        }
  
        console.log(chalk.yellowBright(CLI_PREFIX), chalk.greenBright(status));
  
        if (status?.includes('Deploy completed')) {
          console.log(chalk.yellowBright(CLI_PREFIX), '🇨🇻');
        }
  
        if (resources) {
          const { websites } = resources;
  
          if (websites?.length) {
            console.log(chalk.yellowBright(CLI_PREFIX), chalk.greenBright('\t- Websites URLs'));
            websites.forEach(website => {
              console.log(chalk.yellowBright(CLI_PREFIX), chalk.greenBright(`\t\t- ${website}`));
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
  
          const less_static_deployment_route = create_server_url(organization_id, 'deploy-statics');
          const response = await axios.post(less_static_deployment_route, formData, { headers });
  
          if (response.status === 202) {
            return response.data;
          }
        } catch (error) {
          spinner.stop();
          socket.close();
          resolve();
          handleError('Deployment failed')
        } finally {
          if (process.exitCode && process.exitCode !== 0) {
            resolve();
            return ;
          }
          fs.unlinkSync(tempZipFilename);
        }
      }
    });
  });
}

export default async function deploy(organization_id, projectName) {
  spinner.start(`${CLI_PREFIX} Connecting to the Less Server... ⚙️`);
  spinner.start();
  try {
    const currentWorkingDirectory = process.cwd();
    verify_auth_token();
    validate_project_name(projectName);

    await deployProject(organization_id, currentWorkingDirectory, projectName, {});
  } catch (error) {
    spinner.stop();
    handleError(error.message)
  }
}

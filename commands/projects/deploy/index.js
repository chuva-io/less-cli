import AdmZip from 'adm-zip';
import FormData from 'form-data';
import fs from 'fs';
import * as glob from 'glob';
import ora from 'ora';
import path from 'path';
import yaml from 'js-yaml';
import WebSocket from 'ws';

import config from '../../../config.js';
import { authorizedPost } from '../../../service/authorizedRequests.js';
import { validateProjectName } from '../../../utils/validators.js';
import { getOrganizationId } from '../../../utils/getOrganizationId.js';
import { logError, logInfo } from '../../../utils/logger.js';

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
  
          logError(
            `Must create the less.config file and define the follow environment variables on 'env_vars':\n  ${missingEnvVars}`
          );
        process.exit(1);
      }
    }
  
    return {};
  }
  

  const configFileContent = fs.readFileSync(configFile, 'utf8');
  const config = yaml.load(configFileContent);

  if (!config?.hasOwnProperty('env_vars')) {
    logError("Key 'env_vars' not found in the less.config file");
    process.exit(1);
  }

  const keys = config.env_vars;
  const envVars = {};

  // Verifying if the less config file has env vars
  if (!keys || !keys?.length) {
    logError(`Environment variables must be defined in 'env_vars' on less.config file`);
    process.exit(1); 
  }

  for (const key of keys) {
    const value = process.env[key];
    if (value === undefined) {
      logError(`Environment variable '${key}' must be defined`);
      process.exit(1);
    }
    envVars[key] = value;
  }

  return envVars;
}

/**
 * Deploys a Less project to a specified organization.
 *
 * @param {Object} params - The parameters required to deploy the project.
 * @param {string} params.projectPath - The path to the project directory.
 * @param {string} params.projectName - The name of the project.
 * @param {Object} params.envVars - An object containing the environment variables required for the project.
 * @param {string} params.organizationId - The ID of the organization to which the project will be deployed.
 *
 * @returns {Promise} A Promise that resolves when the project has been successfully deployed.
 */
async function deployProject({ projectPath, projectName, envVars, organizationId }) {
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


  const socket = new WebSocket(config.WEBSOCKET_URL);

  socket.on('message', async (data) => {
    const message = JSON.parse(data);

    if (message.event === 'deploymentStatus') {
      const statusData = message.data;
      const { status, resources, error } = statusData;

      if (status?.includes('Building...')) {
        spinner.stop();
      }

      logInfo(status);

      if (status?.includes('Deploy completed')) {
        logInfo('🇨🇻');
      }

      if (resources) {
        const { apis, websockets } = resources;

        if (apis?.length) {
          logInfo('\t- API URLs');
          apis.forEach(api => {
            logInfo(`\t\t- ${api.api_name}: ${api.url}`);
          });
        }

        if (websockets?.length) {
          logInfo('\t- WEBSOCKET URLs');
          websockets.forEach(websocket => {
            logInfo(`\t\t- ${websocket.api_name}: ${websocket.url}`);
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
          'connection_id': connectionId,
          ...formData.getHeaders(),
        };

        const response = await authorizedPost({
          url: `/v1/organizations/${organizationId}/projects`, data: formData, 
          headers
        });

        if (response.status === 202) {
          return response.data;
        }
      } catch (error) {
        spinner.stop();
        logError(error?.response?.data?.error || 'Deployment failed');
        socket.close();
        process.exit(1); // Non-success exit code for failure
      } finally {
        fs.unlinkSync(tempZipFilename);
      }
    }
  });
}

export default async function deploy({ name: projectName, organization }) {
  validateProjectName(projectName);
  const organizationId = await getOrganizationId(organization);

  spinner.start('[less-cli] Connecting to the Less Server... ⚙️ \n');
  spinner.start();
  try {
    const currentWorkingDirectory = process.cwd();
    const configFile = path.join(currentWorkingDirectory, 'less.config');
    const cronsDir = path.join(currentWorkingDirectory, 'less', 'crons');
    const envVars = loadEnvironmentVariables(configFile, cronsDir);

    await deployProject({ projectPath: currentWorkingDirectory, projectName, envVars,  organizationId });
  } catch (error) {
    spinner.stop();
    logError(error.message || 'An error occurred');
    process.exit(1); // Non-success exit code for any error
  }
}

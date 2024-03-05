import AdmZip from 'adm-zip';
import FormData from 'form-data';
import fs from 'fs';
import * as glob from 'glob';
import ora from 'ora';
import path from 'path';
import WebSocket from 'ws';

import config from '../../../config.js';
import { authorizedPost } from '../../../service/authorizedRequests.js';
import { validateProjectName } from '../../../utils/validators.js';
import { getOrganizationId } from '../../../utils/getOrganizationId.js';
import { logError, logInfo } from '../../../utils/logger.js';


const spinner = ora({ text: '' });

const CLI_PREFIX = '[less-cli]';

/**
* Deploys a static website to a specified organization.
* 
* @param {object} params - Object with the following properties:
* @param {string} params.projectPath - Absolute path to the directory.
* @param {string} params.projectName - Name of the project to be deployed.
* @param {object} params.envVars - Object with environment variables to be defined in the project.
* @param {string} params.organizationId - The ID of the organization where the project will be deployed.
* @returns {Promise} - A Promise that resolves when the project has been successfully deployed.
*/
async function deployProject({ projectPath, projectName, envVars, organizationId }) {
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
        const { websites } = resources;

        if (websites?.length) {
          logInfo('\t- Websites URLs');
          websites.forEach(website => {
            logInfo(`\t\t- ${website}`);
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
          url: `/v1/organizations/${organizationId}/websites`, 
          data: formData, 
          headers 
        });

        if (response.status === 202) {
          return response.data;
        }
      } catch (error) {
        spinner.stop();
        logError(error?.response?.data || 'Deployment failed');
        socket.close();
        process.exit(1); // Non-success exit code for failure
      } finally {
        fs.unlinkSync(tempZipFilename);
      }
    }
  });
}

/**
 * Deploys a static website to a specified organization using Less.
 *
 * @param {object} params - Object with the following properties:
 * @param {string} params.name - Name of the project to be deployed.
 * @param {string} [params.organization] - The ID of the organization where the project will be deployed.
 * @returns {Promise} - A Promise that resolves when the project has been successfully deployed.
 */
export default async function deploy({ name: projectName, organization }) {
  validateProjectName(projectName);
  const organizationId = await getOrganizationId(organization);
  
  spinner.start(`${CLI_PREFIX} Connecting to the Less Server... ⚙️`);
  spinner.start();
  try {
    const currentWorkingDirectory = process.cwd();

    await deployProject({ projectPath: currentWorkingDirectory, projectName, envVars: {}, organizationId });
  } catch (error) {
    spinner.stop();
    logError(error.message || 'An error occurred');
    process.exit(1); // Non-success exit code for any error
  }
}

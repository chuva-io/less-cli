import ora from 'ora';
import Websocket from 'ws';

import config from '../../../config.js';
import { authorizedPost } from '../../../service/authorizedRequests.js';
import { logError, logInfo } from '../../../utils/logger.js';
import { getOrganizationId } from '../../../utils/getOrganizationId.js';
import { 
  validateProjectName, 
  validateStaticName, 
  validateCustomDomain 
} from '../../../utils/validators.js';

const spinner = ora({ text: '' });

const CLI_PREFIX = '[less-cli]';

/**
 * Creates a custom domain for static website.
 * @param {object} params - The parameters for creating a custom domain. 
 * @param {string} params.projectName - The name of the static project.
 * @param {string} params.staticFolder - The name of the static site.
 * @param {string} params.customDomain - The custom domain to be created.
 * @param {string} params.organizationId - The ID of the organization.
 * @returns {Promise} A Promise that resolves when the custom domain is created.
 * @throws {Error} If there is an error while creating the custom domain. 
 */
async function _create_custom_domain({
  projectName,
  staticFolder,
  customDomain,
  organizationId
}) {
  let connectionId;

  const socket = new Websocket(config.WEBSOCKET_URL);

  socket.on('message', async (data) => {
    const message = JSON.parse(data);

    if (message.event === 'conectionInfo') {
      connectionId = message.data?.connectionId;

      try {
        const headers = {
          'connection_id': connectionId,
        };

        const websiteId = `${projectName}.${staticFolder}`;
        const response = await authorizedPost({
          url: `/v1/organizations/${organizationId}/websites/${websiteId}/domains`,
          data: {
            custom_domain: customDomain
          },
          headers 
        });
        spinner.stop();
        logInfo('NS Records');
        console.table({ ...response.data });

        socket.close();
        process.exit();
      } catch (error) {
        spinner.stop();
        logError(error?.response?.data || 'Something went wrong');
        socket.close();
        process.exit(1); // Non-success exit code for failure
      }
    }
  });
}

/**
 * Creates a custom domain for static website.
 * @param {Object} params - The parameters for creating a custom domain.
 * @param {string} params.projectName - The name of the static project.
 * @param {string} params.staticFolder - The name of the static site.
 * @param {string} params.customDomain - The custom domain to be created.
 * @param {string} params.organization - The ID of the organization.
 * @throws {Error} If there is an error while creating the custom domain.
 */
export default async function create_custom_domain({
  organization,
  projectName,
  staticFolder,
  customDomain
}) {
  validateProjectName(projectName);
  validateStaticName(staticFolder);
  validateCustomDomain(customDomain);

  const organizationId = await getOrganizationId(organization);

  spinner.start(`${CLI_PREFIX} Connecting to the Less Server... ⚙️`);
  spinner.start();
  try {
    await _create_custom_domain({
      projectName,
      staticFolder,
      customDomain,
      organizationId
    });
  } catch (error) {
    spinner.stop();
    logError(error.message || 'An error occurred');
    process.exit(1); // Non-success exit code for any error
  }
};

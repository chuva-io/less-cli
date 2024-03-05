import { authorizedGet } from '../../service/authorizedRequests.js';
import { getOrganizationId } from '../../utils/getOrganizationId.js';
import { validateProjectName } from '../../utils/validators.js';
import { logError, logInfo } from '../../utils/logger.js';

/**
 * Retrieves a project resources by its ID.
 * @param {Object} params - The parameters for retrieving the project.
 * @param {string} params.organization - The ID of the organization where the project is deployed.
 * @param {string} params.name - The name of the project.
 * @throws {Error} If there is an error while retrieving the project resources.
 */
export default async function get_by_id({ organization, name }) {
    const organizationId = await getOrganizationId(organization);
    validateProjectName(name);

    try {
        const response = await authorizedGet({ 
          url: `/v1/organizations/${organizationId}/projects/${name}` 
        });

        if (response.status === 200) {
            if (response.data.apis?.length) {
                logInfo('API URLs');
                response.data.apis.forEach(api => {
                  logInfo(`\t- ${api.api_name}: ${api.url}`);
                });
              }

              if (response.data.websockets?.length) {
                logInfo('WEBSOCKET URLs');
                response.data.websockets.forEach(websocket => {
                  logInfo(`\t- ${websocket.api_name}: ${websocket.url}`);
                });
              }
        }
        process.exit(0);
    } catch (error) {
        logError(error?.response?.data?.error || 'Get projects failed');
        process.exit(1);
    }
}

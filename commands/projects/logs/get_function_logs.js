import { authorizedGet } from '../../../service/authorizedRequests.js';
import { getOrganizationId } from '../../../utils/getOrganizationId.js';
import { validateProjectName } from '../../../utils/validators.js';
import { logError, logSuccess } from '../../../utils/logger.js';

/**
 * Validates the options object to ensure it contains the required properties.
 * @param {Object} options - The options object.
 * @param {string} options.name - The project name.
 * @param {string} options.resourcePath - The path to the resource.
 */
async function validateOptions({ name, resourcePath }) {
    validateProjectName(name);
    
    if (!resourcePath) {
        logError('resource-path is required');
        process.exit(1);
    }
}

/**
 * Fetches and logs the function logs for a given project and resource path.
 * @param {Object} options - The options object.
 * @param {string} options.name - The project name.
 * @param {string} [options.organization] - The organization name.
 * @param {string} options.resourcePath - The path to the resource.
 */
export default async function fetch_and_log_function_logs({ organization, name, resourcePath }) {
    validateOptions({ name, resourcePath });
    const organizationId = await getOrganizationId(organization);

    try {
        const resource_id = resourcePath.replace(/.*?less\//, '').replaceAll('/', '.');
        const { status, data } = await authorizedGet({
            url: `/v1/organizations/${organizationId}/projects/${name}/resources/${resource_id}/logs`
        });

        if (status === 200) {
            if (!data || data.length === 0) {
                logError(`No logs found for the path ${resourcePath} in project ${name}`);
            }

            data.forEach(log => {
                logSuccess(`${log.timestamp} ${log.message.slice(0, -1).replaceAll('\t', ' ')}`);
            });
            process.exit(0);
        }
    } catch (error) {
        logError(error?.response?.data?.error || `Get logs for the path ${resourcePath} in project ${name} failed`);
        process.exit(1);
    }
}

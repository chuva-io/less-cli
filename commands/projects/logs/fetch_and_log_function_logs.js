import chalk from 'chalk';
import api from '../../service/api.js'
import { verify_auth_token, get_less_token } from '../../helpers/credentials.js';
import handle_error from '../../helpers/handle_error.js';

/**
 * Validates the options object to ensure it contains the required properties.
 * @param {Object} options - The options object.
 * @param {string} options.project - The project name.
 * @param {string} options.path - The path to the resource.
 */
function validateOptions(options) {
    const { project, path } = options;

    if (!project) {
        handle_error('Project is required');
    }

    if (!path) {
        handle_error('Path is required');
    }
}

/**
 * Fetches and logs the function logs for a given project and resource path.
 * @param {Object} options - The options object.
 * @param {string} options.project - The project name.
 * @param {string} options.path - The path to the resource.
 */
export default async function fetch_and_log_function_logs(options) {
    validateOptions(options);

    const { project, path } = options;
    await verify_auth_token();

    try {
        const LESS_TOKEN = await get_less_token();
        const headers = {
            Authorization: `Bearer ${LESS_TOKEN}`
        };

        const resource_id = path.replace(/.*?less\//, '').replaceAll('/', '.');
        const { status, data } = await api.get(`/v1/projects/${project}/resources/${resource_id}/logs`, { headers });

        if (status === 200) {
            if (!data || data.length === 0) { 
                handle_error(`No logs found for the path ${path} in project ${project}`);
            }
            
            data.forEach(log => {
                console.log(chalk.bold.greenBright(log.timestamp), log.message.slice(0, -1).replaceAll('\t',' '));
            });
            process.exit(0);
        }
    } catch (error) {
        handle_error(error?.response?.data?.error || `Get logs for the path ${path} in project ${project} failed`);
    }
}

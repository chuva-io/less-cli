import chalk from 'chalk';
import { verify_auth_token, get_less_token } from '../helpers/credentials.js';
import validate_project_name from '../helpers/validations/validate_project_name.js';
import create_server_url from '../helpers/create_server_url.js';
import axios from 'axios';

export default async function delete_project(organization_id, project_name) {
    validate_project_name(project_name);
    await verify_auth_token();
    const serverUrl = create_server_url(organization_id, `projects/${project_name}`);

    try {
        const LESS_TOKEN = await get_less_token();
        const headers = {
            Authorization: `Bearer ${LESS_TOKEN}`
        };

        const response = await axios.delete(serverUrl, { headers });

        if (response.status === 202) {
          console.log(chalk.yellowBright('[less-cli]'), chalk.bold.greenBright(response.data.message));
        }
    } catch (error) {
        console.error(chalk.redBright('Error:'), error?.response?.data || 'Delete project failed');
        process.exitCode = 1;
    }
}

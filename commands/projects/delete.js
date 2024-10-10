import chalk from 'chalk';
import { verify_auth_token, get_less_token } from '../helpers/credentials.js';
import validate_project_name from '../helpers/validations/validate_project_name.js';
import api from '../service/api.js';

export default async function delete_project(project_name) {
    validate_project_name(project_name);
    await verify_auth_token();

    const api_endpoint = `/v1/projects/${project_name}`;

    try {
        const LESS_TOKEN = await get_less_token();
        const headers = {
            Authorization: `Bearer ${LESS_TOKEN}`
        };

        const response = await api.delete(api_endpoint, { headers });

        if (response.status === 202) {
          console.log(chalk.yellowBright('[less-cli]'), chalk.bold.greenBright(response.data.message));
        }
        process.exit(0);
    } catch (error) {
        console.error(chalk.redBright('Error:'), error?.response?.data || 'Delete project failed');
        process.exit(1);
    }
}

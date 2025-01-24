import axios from 'axios';
import chalk from 'chalk';
import { verify_auth_token, get_less_token } from '../helpers/credentials.js';
import create_server_url from '../helpers/create_server_url.js';

export default async function get_by_id(project_name, _, command) {
    const organization_id = command.parent.opts().organization;
    if (!/^[a-zA-Z][-a-zA-Z0-9]*$/.test(project_name)) {
        console.log(chalk.redBright('Error:'), 'The project_name must satisfy regular expression pattern: [a-zA-Z][-a-zA-Z0-9]');
        process.exitCode = 1;
        return ;
    }

    await verify_auth_token();
    const serverUrl = create_server_url(organization_id, `projects/${project_name}`);

    try {
        const LESS_TOKEN = await get_less_token();
        const headers = {
            Authorization: `Bearer ${LESS_TOKEN}`
        };

        const response = await axios.get(serverUrl, { headers });

        if (response.status === 200) {
            if (response.data.apis?.length) {
                console.log(chalk.yellowBright('[less-cli]'), chalk.bold.greenBright('API URLs'));
                response.data.apis.forEach(api => {
                  console.log(chalk.yellowBright('[less-cli]'), chalk.cyanBright(`\t- ${api.api_name}: ${api.url}`));
                });
              }

              if (response.data.websockets?.length) {
                console.log(chalk.yellowBright('[less-cli]'), chalk.bold.greenBright('WEBSOCKET URLs'));
                response.data.websockets.forEach(websocket => {
                  console.log(chalk.yellowBright('[less-cli]'), chalk.cyanBright(`\t- ${websocket.api_name}: ${websocket.url}`));
                });
              }
        }
    } catch (error) {
        console.error(chalk.redBright('Error:'), error?.response?.data?.error || 'Get projects failed');
        process.exitCode = 1;
    }
}

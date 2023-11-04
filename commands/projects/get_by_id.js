import axios from 'axios';
import chalk from 'chalk';
import config from '../../utils/config.js';
import { verify_auth_token, get_less_token } from '../helpers/credentials.js';

export default async function get_by_id(project_name) {
    if (!/^[a-zA-Z][-a-zA-Z0-9]*$/.test(project_name)) {
        console.log(chalk.redBright('Error:'), 'The project_name must satisfy regular expression pattern: [a-zA-Z][-a-zA-Z0-9]');
        process.exit(1);
    }

    await verify_auth_token();

    const serverUrl = `${config.SERVER_URL}/v1/projects/${project_name}`;

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
        process.exit(0);
    } catch (error) {
        console.error(chalk.redBright('Error:'), error?.response?.data?.error || 'Get projects failed');
        process.exit(1);
    }
}

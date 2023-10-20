import axios from 'axios';
import chalk from 'chalk';
import config from '../../utils/config.js';

export default async function get_by_id(project_name) {
    if (!/^[a-zA-Z][-a-zA-Z0-9]*$/.test(project_name)) {
        console.log(chalk.redBright('Error:'), 'The project_name must satisfy regular expression pattern: [a-zA-Z][-a-zA-Z0-9]');
        process.exit(1);
    }

    if (!process.env.LESS_TOKEN) {
        console.log(chalk.redBright('Error:'), 'Environment variable LESS_TOKEN must be defined');
        process.exit(1);
    }

    const serverUrl = `${config.SERVER_URL}/v1/projects/${project_name}`;

    try {
        const headers = {
            Authorization: `Bearer ${process.env.LESS_TOKEN}`
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
        console.error(chalk.redBright('Error:'), error?.response?.data || 'Get projects failed');
        process.exit(1);
    }
}

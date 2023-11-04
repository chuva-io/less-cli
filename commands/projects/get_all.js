import axios from 'axios';
import chalk from 'chalk';
import config from '../../utils/config.js';
import { verify_auth_token, get_less_token } from '../helpers/credentials.js';

export default async function get_all() {
    await verify_auth_token();

    const serverUrl = `${config.SERVER_URL}/v1/projects`;

    try {
        const LESS_TOKEN = await get_less_token();
        const headers = {
            Authorization: `Bearer ${LESS_TOKEN}`
        };

        const response = await axios.get(serverUrl, { headers });

        if (response.status === 200) {
            response.data.forEach(item => {
                console.log(chalk.bold.greenBright('ID:'), chalk.cyanBright(item.id));
                console.log(chalk.bold.greenBright('Created At:'), chalk.cyanBright(item.created_at));
                console.log(chalk.bold.greenBright('Updated At:'), chalk.cyanBright(item.updated_at));
                item.error && console.log(chalk.bold.redBright('Error:'), chalk.cyanBright(item.error));
                console.log('');
            });
        }
        process.exit(0);
    } catch (error) {
        console.error(chalk.redBright('Error:'), error?.response?.data?.error || 'Get projects failed');
        process.exit(1);
    }
}

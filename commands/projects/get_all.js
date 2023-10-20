import axios from 'axios';
import chalk from 'chalk';
import config from '../../utils/config.js';

export default async function get_all() {
    if (!process.env.LESS_TOKEN) {
        console.log(chalk.redBright('Error:'), 'Environment variable LESS_TOKEN must be defined');
        process.exit(1);
    }

    const serverUrl = `${config.SERVER_URL}/v1/projects`;

    try {
        const headers = {
            Authorization: `Bearer ${process.env.LESS_TOKEN}`
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
        console.error(chalk.redBright('Error:'), error?.response?.data || 'Get projects failed');
        process.exit(1);
    }
}

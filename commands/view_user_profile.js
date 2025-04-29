import axios from 'axios';
import chalk from 'chalk';
import { verify_auth_token, get_less_token } from './helpers/credentials.js';
import config from '../utils/config.js';
import Table from 'cli-table3';

export default async function get_all(organization_id) {
    await verify_auth_token();

    const apiUrl = `${config.LESS_API_BASE_URL}/v1/users/me`;

    try {
        const LESS_TOKEN = await get_less_token();
        const headers = {
            Authorization: `Bearer ${LESS_TOKEN}`
        };

        const response = await axios.get(apiUrl, { headers });
        if (response.status === 200) {
            // Prepare table for CLI output
            
            // Prepare the table headers
            const headers = [
                "Name",
                "Email",
            ].map(title => chalk.bold.greenBright(title)); // Set header colors
    
            const table = new Table({ 
                head: headers
            });

            // Set table colors for each item
            const user = response.data;
            table.push([
                    user.name,
                    user.email
                ]
                .map(item => chalk.cyanBright(item)) // Set item colors)
            );

            console.log(table.toString());
        }
    } catch (error) {
        console.error(chalk.redBright('Error:'), error?.response?.data?.error || 'Get projects failed');
        console.error(chalk.redBright('Error:'), error);
        process.exitCode = 1;
    }
}

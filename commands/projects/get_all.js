import axios from 'axios';
import chalk from 'chalk';
import create_api_url from '../helpers/create_api_url.js';
import { verify_auth_token, get_less_token } from '../helpers/credentials.js';
import Table from 'cli-table3';

export default async function get_all(organization_id) {
    await verify_auth_token();

    const apiUrl = create_api_url(organization_id, 'projects');

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
                "Project Name", 
                "Created", 
                "Updated", 
                "Status"
            ].map(title => chalk.bold.greenBright(title)); // Set header colors
    
            const table = new Table({ 
                head: headers
            });

            // Set table colors for each item
            table.push(
                ...response.data.data
                    .map(item => ([
                        item.id,
                        item.created_at,
                        item.updated_at,
                        item.status
                    ]
                    .map(item => chalk.cyanBright(item)) // Set item colors
                ))
            );

            console.log(table.toString());
        }
    } catch (error) {
        console.error(chalk.redBright('Error:'), error?.response?.data?.error || 'Get projects failed');
        process.exitCode = 1;
    }
}

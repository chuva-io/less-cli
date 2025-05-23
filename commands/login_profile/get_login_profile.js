import axios from 'axios';
import chalk from 'chalk';

import { get_less_token, verify_auth_token } from '../helpers/credentials.js';
import create_server_url from '../helpers/create_server_url.js';

export default async function get_login_profile(_, command) {
    const organization_id = command.parent.opts().organization;
    await verify_auth_token();

    const serverUrl = create_server_url(organization_id, 'aws-login-profiles');

    try {
        const LESS_TOKEN = await get_less_token();
        const headers = {
            Authorization: `Bearer ${LESS_TOKEN}`
        };

        const response = await axios.get(serverUrl, { headers });

        if (response.status === 200) {
            const credentials = response.data
            console.log(chalk.bold.greenBright('IAM username:'), chalk.whiteBright(credentials.user_name));
            console.log(chalk.bold.greenBright('Password:'), chalk.whiteBright(credentials.password));
            console.log(chalk.bold.greenBright('AWS access portal URL:'), chalk.whiteBright(credentials.iam_login_url));
            
        }
    } catch (error) {
        console.error(chalk.redBright('Error:'), error?.response?.data?.error || 'Get login profile failed');
        process.exitCode = 1;
    }
}

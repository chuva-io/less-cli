import chalk from 'chalk';
import { authorizedGet } from '../../service/authorizedRequests.js';
import { getOrganizationId } from '../../utils/getOrganizationId.js';
import { logError, logSuccess } from '../../utils/logger.js';

export default async function get_all({ organization }) {
    const organizationId = await getOrganizationId(organization);

    try {
        const response = await authorizedGet({ 
            url: `/v1/organizations/${organizationId}/projects` 
        });

        if (response.status === 200) {
            response.data.forEach(item => {
                logSuccess(`ID: ${chalk.cyanBright(item.id)}`);
                logSuccess(`Created At: ${chalk.cyanBright(item.created_at)}`);
                logSuccess(`Updated At: ${chalk.cyanBright(item.updated_at)}`);
                item.error && logError(`${item.error}\n`);
            });
        }
        process.exit(0);
    } catch (error) {
        logError(error?.response?.data?.error || 'Get projects failed');
        process.exit(1);
    }
}

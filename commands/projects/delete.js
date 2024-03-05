import { getOrganizationId } from '../../utils/getOrganizationId.js';
import { validateProjectName } from '../../utils/validators.js';
import { logError, logSuccess } from '../../utils/logger.js';
import { authorizedDelete } from '../../service/authorizedRequests.js';

export default async function delete_project({ organization, name }) {
    const organizationId = await getOrganizationId(organization);
    validateProjectName(name);

    const url_path = `/v1/organizations/${organizationId}/projects/${name}`;

    try {
        const response = await authorizedDelete({ url: url_path});

        if (response.status === 202) {
            logSuccess(response.data.message);
        }
        process.exit(0);
    } catch (error) {
        logError(error?.response?.data || 'Delete project failed');
        process.exit(1);
    }
}

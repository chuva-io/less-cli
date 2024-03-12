import { getOrganizationId } from '../../utils/getOrganizationId.js';
import { validateEmail } from '../../utils/validators.js';
import { logError, logInfo } from '../../utils/logger.js';
import { authorizedPost } from '../../service/authorizedRequests.js';

export default async function add({ organization, email }) {
  try {
    validateEmail(email);
  
    const organizationId = await getOrganizationId(organization);
  
    const url = `/v1/organizations/${organizationId}/members`;
    const data = {
      email,
    };
    const response = await authorizedPost({
      url,
      data,
    });

    if (response.status === 201) {
      logInfo(
        'The member has been added to the organization with success.'
      );
    }
    process.exit(0);
  } catch (error) {
    logError(error?.response?.data?.message || 'Add member to the organization failed');
    process.exit(1);
  }
}

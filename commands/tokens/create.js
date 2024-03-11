import { getOrganizationId } from "../../utils/getOrganizationId.js";
import { validateTokenDescription } from "../../utils/validators.js";
import { logError, logInfo } from "../../utils/logger.js";
import { authorizedPost } from "../../service/authorizedRequests.js";

export default async function create({ organization, description }) {
  validateTokenDescription(description);

  const organizationId = await getOrganizationId(organization);

  const url = `/v1/organizations/${organizationId}/tokens`;
  const data = {
    description,
  };

  try {
    const response = await authorizedPost({
      url,
      data,
    });

    if (response.status === 201) {
      logInfo(
        'The token has been successfully created for your organization. Please make sure to copy your token now. You will not have access to it again.'
      );
      logInfo(`Token secret: ${response.data.token}`);
    }
    process.exit(0);
  } catch (error) {
    logError(error?.response?.data?.error || "Create token failed");
    process.exit(1);
  }
}

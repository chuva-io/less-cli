import { selectOrganization } from "../service/selectOrganization.js";

/**
 * This function returns the organization ID based on the provided organization.
 * If the organization exists, it selects the organization; otherwise, it returns 'me'.
 *
 * @param {Object} organization - The organization object.
 * @returns {Promise<string>} The ID of the organization.
 */
export async function getOrganizationId(organization) {
  return organization ? organization : await selectOrganization();
}

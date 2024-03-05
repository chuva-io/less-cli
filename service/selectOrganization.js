import { fetchOrganizations } from "./fetchOrganizations.js";
import { promptToSelectOrg } from "../utils/prompts.js";

/**
 * This asynchronous function fetches organizations and selects an organization based on the fetched data.
 * If there is only one organization, it selects that organization.
 * Otherwise, it prompts the user to select an organization.
 *
 * @returns {Promise<string>} The ID of the selected organization.
 */
export async function selectOrganization() {
  let orgId;
  const organizations = await fetchOrganizations();
  if (organizations.length === 1) {
    orgId = organizations[0]?.id;
  } else {
    orgId = await promptToSelectOrg(organizations);
  }
  return orgId;
}

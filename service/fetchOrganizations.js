import { authorizedGet } from "./authorizedRequests.js";

/**
 * Fetches a list of organizations from the API.
 *
 * @returns {Promise<{ id: string; name: string; email: string; }[]>} A promise that resolves to an array of organization objects.
 * Each organization object contains the following properties:
 *   - id: The unique identifier of the organization.
 *   - name: The name of the organization.
 *   - email: The email address associated with the organization.
 */
export async function fetchOrganizations() {
  const { data } = await authorizedGet({
    url: `/v1/organizations`,
  });

  return data;
}

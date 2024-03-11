import chalk from "chalk";
import { fetchOrganizations } from "../../service/fetchOrganizations.js";
import { logError, logSuccess } from "../../utils/logger.js";

export default async function get_all() {
  try {
    const organizations = await fetchOrganizations();

    organizations.forEach((organization, index) => {
      
      logSuccess(`ID: ${chalk.cyanBright(organization.id)}`);
      logSuccess(`Name: ${chalk.cyanBright(organization.name)}`);
      logSuccess(`Email: ${chalk.cyanBright(organization.email)} \n`);
    });
    process.exit(0);
  } catch (error) {
    logError(error?.response?.data?.error || "List all organizations failed");
    process.exit(1);
  }
}

import inquirer from 'inquirer';

/**
 * Prompts the user to select an organization from a list of available organizations.
 *
 * @param {{ id: string; name: string; email: string; }[]} organizations - An array of objects representing the organizations info. 
 * @return {Promise<String>} A promise that resolves to the id of the selected organization.
 */
export async function promptToSelectOrg(organizations) {
  const choices = organizations.map(org => ({ name: `${org.name} - ${org.email}`, value: org.id }));
  const questions = [{
    type: 'list',
    name: 'orgId',
    message: 'Please select an organization:',
    choices: choices
  }];

  const { orgId } = await inquirer.prompt(questions);
  return orgId;
}

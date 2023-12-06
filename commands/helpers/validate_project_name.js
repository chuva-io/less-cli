export default function validate_project_name(project_name) {
  if (!/^[a-z][-a-z0-9]*$/.test(project_name)) {
    console.log(chalk.redBright('Error:'), 'The project_name must satisfy regular expression pattern: [a-z][-a-z0-9]');
    process.exit(1);
  }
}

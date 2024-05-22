export default function validate_project_name(project_name) {
  if (!/^[a-z][-a-z0-9]*$/.test(project_name)) {
    throw new Error('The project_name must satisfy regular expression pattern: [a-z][-a-z0-9]');
  }
}

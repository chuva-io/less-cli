export default function validate_static_folder_name(name) {
  if (!/^[a-z][-a-z0-9]*$/.test(name)) {
    throw new Error('The project_name must satisfy regular expression pattern: [a-z][-a-z0-9]');
  }
}

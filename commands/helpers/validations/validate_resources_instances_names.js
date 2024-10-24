const validate_resource_instance_name = (resource_instance_name) =>  /^[A-Za-z][A-Za-z0-9_]*$/.test(resource_instance_name);
validate_resource_instance_name.regexConstrainMessage = 
  'Should start with a letter and contain only letters, numbers and underscores';

export default validate_resource_instance_name;
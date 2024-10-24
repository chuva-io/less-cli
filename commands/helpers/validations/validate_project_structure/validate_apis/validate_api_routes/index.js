import fs from 'fs';
import path from 'path';
import { ResourceNameInvalidException, ResourceHandlerNotFoundException } from '../../errors/index.js';
import validate_resource_instance_name from '../../../validate_resources_instances_names.js';

const http_method_extensions = ['js', 'py', 'rs'];
const http_methods = ['get', 'post', 'put', 'patch', 'delete'];

const validate_route_method_handler = (method_handler_name) =>
  RegExp(`^(${http_methods.join('|')})\.(${http_method_extensions.join('|')})$`).test(method_handler_name);

const validate_api_routes = (api, current_route = '') => {
  const current_route_path = path.join(process.cwd(), 'less/apis', api, current_route);
  const directory_items = fs.readdirSync(current_route_path);

  const path_segments = directory_items.filter(
    (item) => fs.statSync(path.join(current_route_path, item)).isDirectory()
  );
  const http_method_handlers = directory_items.filter(
    (method_handler) => fs.statSync(path.join(current_route_path, method_handler)).isFile()
      && validate_route_method_handler(method_handler)
  );

  path_segments.forEach((path_segment) => {
    const route = path.join(current_route, path_segment);

    const cleaned_path_segment = path_segment.replace('{', '').replace('}', '');
    if (!validate_resource_instance_name(cleaned_path_segment)) {
      throw new ResourceNameInvalidException(
        `Invalid path segment "${path_segment}" from route "${route}" on API "${api}". ${validate_resource_instance_name.regexConstrainMessage}, and can be wrapped by curly braces to be treated as a dynamic path segment.`
      );
    }

    validate_api_routes(api, route);
  });

  if (!path_segments.length && !http_method_handlers.length) {
    throw new ResourceHandlerNotFoundException(
      `No method handlers files found on route "${current_route}" from API "${api}".
Should contain one of the following:${http_methods.map(method => `\n\t- ${method}.(${http_method_extensions.join('|')})`).join('')}`
    );
  }
};

export default validate_api_routes;

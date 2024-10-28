import fs from 'fs';
import path from 'path';

const callers_code = `
const path = require('path');
const python_handler = require('#python-handler-dependency#');

const handler = async (data, function_path) => {
  let response;
  if (!function_path.endsWith('.js')) {
    response = await python_handler(JSON.stringify(data), function_path);
  } else {
    response = await require(function_path).process(data);
  }

  return JSON.parse(response);
};

module.exports = {
  #exports#
}
`;

const functions_callers_exports = `#function#: async (data) => handler(data, path.resolve(__dirname, '#function_path#'))`;

const build = (config) => {
  const functions_handlers_name = 'handlers';
  const project_functions_path = path.resolve(
    config.project_less_resources_location,
    config.less_resources.functions
  );

  if (!fs.existsSync(project_functions_path)) {
    return;
  }

  const functions = fs.readdirSync(project_functions_path);
  
  const built_functions_path = path.resolve(
    config.chuva_dependency_path,
    config.less_resources.functions
  );
  const handlers_path = path.resolve(
    built_functions_path,
    functions_handlers_name
  );

  fs.mkdirSync(handlers_path, { recursive: true });
  const module_exports = functions
    .map(
      element => {
        const project_function_path = path.resolve(
          project_functions_path,
          element
        );
        
        let function_handler_path = `${functions_handlers_name}/${element}`;

        if (fs.existsSync(project_function_path + '/__init__.py')) {
          const handler_path = path.join(handlers_path + `/${element}`);

          fs.mkdirSync(handler_path);
          fs.cpSync(
            project_functions_path + `/${element}`,
            handler_path,
            { recursive: true, filter: (src, dest) => !src.endsWith('__init__.py') }
          );

          const handler_function_name = `${element}_handler`;
          fs.writeFileSync(
            path.join(handler_path, `${handler_function_name}.py`),
            fs.readFileSync(
              project_functions_path + `/${element}/__init__.py`,
              'utf-8'
            )
          );
          
          fs.writeFileSync(
            path.join(handler_path, 'python_handler.py'),
            config.python_handler
              .replace(
                '#python-import#',
                `import ${handler_function_name}`
              )
              .replace('#python-snipped-code#', '')
              .replace('#python-function-call#', `return ${handler_function_name}.process(json.loads(data))`)
          );

        } else {
          fs.cpSync(
            project_functions_path + `/${element}`,
            handlers_path + `/${element}`,
            { recursive: true }
          );

          function_handler_path += '/index.js';
        }

        return functions_callers_exports
          .replace('#function#', element)
          .replace('#function_path#', function_handler_path)
      }
    ).join(',\n  ');
  
  

  fs.writeFileSync(
    built_functions_path + '/index.js',
    callers_code
      .replace('#python-handler-dependency#', config.python_handler_dependency)
      .replace('#exports#', module_exports)
  );
};

export default build;

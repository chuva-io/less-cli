import fs from 'fs';
import path from 'path';
import map_dirs_recursive from '../map_dirs_recursive/index.js';
import add_to_package_json from '../add_to_package_json/index.js';

const api_code = `const cors = require('cors');
const routes = require('./routes');
const express = require('express');

const app = express();

const port = #port#;

module.exports = () => {
  app.all('/', (req, res) => {
    res
      .status(403)
      .json({ error: 'Missing authentication token' });
  });

  app.use(cors());
  app.use((req, res, next) => {
    // Store the headers in a custom object
    req.headers = {};
    req.rawHeaders.forEach((value, index, array) => {
        if (index % 2 === 0) {
            req.headers[array[index]] = array[index + 1];
        }
    });
    next();
  });

  app.use('/', async (req, res, next) => {
      const body = []
      req.body = await new Promise((resolve) => req.on('data', (chunk) => {
        body.push(chunk);
      }).on('end', () => {
        resolve(Buffer.concat(body).toString());
      })).then();

      next();
  }, routes);

  app.listen(port);
};
`;

const apis_code = `#apis-import#

module.exports = async () => {
  #apis-uses#
};
`;

const method_handler_snipped_code = `!#method-handler#.middlewares
    ? [(req, res, next) => next()]
    : #method-handler#.middlewares.map(middleware => route_handler(middleware)),
  route_handler(#method-handler#.process)`;

const python_snipped_code = `def useMiddleware(middlewares, controller):
  def handler(req, res):
    middleware = middlewares[0] if middlewares else None
    response = None
    controller_to_execute = None

    for i in range(len(middlewares)):
      next_middleware = None

      def set_next():
        nonlocal next_middleware
        if i + 1 < len(middlewares):
          nonlocal next_middleware
          next_middleware = middlewares[i + 1]
        else:
          nonlocal controller_to_execute
          controller_to_execute = controller

      response = middleware(req, res, set_next)

      if not next_middleware and not controller_to_execute:
        return response

      middleware = next_middleware

    response = controller_to_execute(req, res)
    return response

  return handler

class InvalidMiddlewareError(Exception):
  def __init__(self, middleware_position):
    super().__init__(f"The middleware on index {{middleware_position}} is not a function.")
`;

const python_function_call = `
  req = json.loads(data)
  res = {}

  route_handler = None
  process = #python-import#.process
  if hasattr(#python-import#, 'middlewares') and isinstance(#python-import#.middlewares, list):
    middlewares = #python-import#.middlewares

    for middleware in middlewares:
      if not callable(middleware):
        raise InvalidMiddlewareError(middlewares.index(middleware))

    route_handler = useMiddleware(middlewares, process)
  else:
    route_handler = process

  response = route_handler(req, res)

  return response
`;

const javascript_calling_python_code = `const python_handler = require('#python-handler-dependency#');

exports.process = async (req, res) => {
  const response = await python_handler(
  JSON.stringify({ headers: req.headers, body: req.body }), 
  '#handler-dir-path#'
  );

  return JSON.parse(response);
};
`;

const route_handler_code = `const route_handler = (handler) => async (req, res, next) => {
  try {
    Object
      .keys(req.query || {})
      .forEach(
        query => req.options.query[query] =
          req.originalUrl.split('?').pop()
            .split('&').find(item => item.startsWith(\`\${query}=\`))
            .replace(\`\${query}=\`, '')
      );

    req.params = { ...req.options.params };
    req.query = { ...req.options.query };
    
    const _res = { headers: {} };
    const response = await handler(req, _res, next);
    
    if (!response && Object.keys(_res.headers).length) {
      res.set(_res.headers);
    }

    if (response) {
      if (typeof response.body === 'object') {
        console.log("The body response cannot be an object");
        return res.status(502).send();
      }

      if (response.headers) {
        res.set(response.headers);
      }

      return res
        .status(response.statusCode || 200)
        .send(typeof response.body !== 'number'
          ? response.body
          : JSON.stringify(response.body)
        );
    }
  } catch(error) {
    console.error(error);

    return res.status(502).send('Internal Server Error');
  }
}`

const api_routes_code = `const { Router } = require('express');

const less_routes = Router();

#route-handler#
#routes#

module.exports = less_routes;
`;

const route_use_handler_code = `less_routes.use(
  '/#route-url#',
  (req, res, next) => {
    const current_route = '#route-url#';

    if (req.options) {
      req.options.path = (req.options.path || '/') + \`/\${current_route}\`;
      req.options.params = { ...req.options.params, ...req.params };
      req.options.query = { ...req.options.query, ...req.query };
      
    } else {
      req.options = {
        path: \`/\${current_route}\`,
        params: req.params,
        query: req.query || {}
      };
    }

    if (/^:.*$/.test(current_route)) {
      req.options.params[current_route.split(':')[1]] = 
        req.originalUrl.split('/')[req.options.path.split('/').indexOf(current_route)];
    }

    next();
  },
  #route-handler#
);`

const construct_api_routes = (config, data) => {
  const { api_routes_mapped, stack_path, less_built_api_path, less_api_path } = data;
  const methods_import_joined = [];
  const routes_handlers_import_joined = [];
  const methods_joined = [];
  const routes_handlers_joined = [];
  
  Object.keys(api_routes_mapped).forEach(api_route_mapped => {
    const [route] = api_route_mapped.split('.');

    if (/^(get|post|put|patch|delete)\.(js|py)$/.test(api_route_mapped)) {
      const stack_path_splited = stack_path.split('/');
      stack_path_splited.shift();

      const project_route_method_code = fs.readFileSync(path.resolve(
        less_api_path,
        stack_path_splited.join('/'),
        api_route_mapped
      ), 'utf-8');

      const method_handler = `${route}_handler`;

      if (api_route_mapped.endsWith('.js')) {
        const build_route_path =  path.resolve(
          less_built_api_path,
          stack_path
        );

        fs.mkdirSync(build_route_path, { recursive: true });
        fs.writeFileSync(
          path.resolve(
            build_route_path,
            `${method_handler}.js`
          ),
          project_route_method_code
        );
      } else {
        const handler_dir_path = path.resolve(
          less_built_api_path,
          stack_path,
          method_handler
        );
        const python_method_handler =`${route.split('.')[0]}_method`;

        fs.mkdirSync(handler_dir_path, { recursive: true });

        fs.writeFileSync(
          path.resolve(
            handler_dir_path,
            `${python_method_handler}.py`
          ),
          project_route_method_code
        );
        
        fs.writeFileSync(
          path.resolve(
            handler_dir_path,
            `python_handler.py`
          ),
          config.python_handler
            .replace('#python-import#', `import ${python_method_handler}`)
            .replace('#python-snipped-code#', python_snipped_code)
            .replace('#python-function-call#', python_function_call.replaceAll('#python-import#', python_method_handler))
        );

        fs.writeFileSync(
          path.resolve(
            handler_dir_path,
            `index.js`
          ),
          javascript_calling_python_code
            .replace(
              '#handler-dir-path#',
              handler_dir_path
            )
            .replace(
              '#python-handler-dependency#',
              config.python_handler_dependency
            )
        );
      }

      methods_import_joined.push(`const ${method_handler} = require('./${method_handler}');`);
      methods_joined.push(
        `less_routes.${route}(\n  '/',\n  ${
          method_handler_snipped_code
            .replaceAll('#method-handler#', method_handler)
        });`
      );

      return;
    }

    if (/\..*$/.test(api_route_mapped)) {
      const method_handler_code = fs.readFileSync(path.resolve(
        less_api_path,
        stack_path.replace(`${config.api_routes}/`, ''),
        api_route_mapped
      ), 'utf-8');

      fs.writeFileSync(
        path.resolve(
          less_built_api_path,
          stack_path,
          api_route_mapped
        ),
        method_handler_code
      );
      return;
    }
    
    const new_path = path.resolve(
      less_built_api_path,
      stack_path,
      api_route_mapped
    )

    fs.mkdirSync(new_path, { recursive: true });
    
    const route_handler_name = `less_route_${api_route_mapped.replace('{', '').replace('}', '')}`;
    
    routes_handlers_import_joined.push(`const ${route_handler_name} = require('./${api_route_mapped}');`);
    routes_handlers_joined.push(route_use_handler_code
      .replace('#route-handler#', route_handler_name)
      .replaceAll('#route-url#', api_route_mapped.replace('{', ':').replace('}', ''))
    );
  
    const new_data = {
      api_routes_mapped: api_routes_mapped[api_route_mapped],
      stack_path: stack_path + `/${api_route_mapped}`,
      less_built_api_path,
      less_api_path
    };
  
    construct_api_routes(config, new_data);
  });

  const all_import_joined = [];
  if (methods_import_joined.length) {
    all_import_joined.push(methods_import_joined.join('\n'))
  }
  if (routes_handlers_import_joined.length) {
    all_import_joined.push(routes_handlers_import_joined.join('\n'))
  }

  const all_uses_joined = [];
  if (methods_joined.length) {
    all_uses_joined.push(methods_joined.join('\n'))
  }
  if (routes_handlers_joined.length) {
    all_uses_joined.push(routes_handlers_joined.join('\n'))
  }

  fs.writeFileSync(
    path.resolve(
      less_built_api_path,
      stack_path,
      'index.js'
    ),
    api_routes_code
      .replace('#route-handler#', all_uses_joined.find(item => /route_handler(.*)/.test(item)) ? `${route_handler_code}\n` : '')
      .replace('#routes#', [
        all_import_joined.join('\n\n'),
        all_uses_joined.join('\n\n')
      ].join('\n\n\n'))
  );

  add_to_package_json(config, {
    dependencies: {
      express: '^4.18.3',
      ws: "^8.16.0",
    }
  });
}

export default (config) => {
  const apis_path = path.resolve(
    config.project_less_resources_location,
    config.less_resources.apis,
  );
  
  if (!fs.existsSync(apis_path)) {
    return;
  }

  config.app_imports += 'const apis = require(\'./apis\');\n';
  config.app_callers += 'apis();\n';

  const apis = fs.readdirSync(apis_path);

  
  let apis_uses = '';
  let apis_imports = '';
  apis.forEach((api, index) => {
    config.apis[api] = {
      port: config.rest_api_port + index
    };

    const less_built_api_path = path.resolve(
      config.project_build_path,
      config.less_resources.apis,
      api
    );
    
    const less_api_path = path.resolve(
      config.project_less_resources_location,
      config.less_resources.apis,
      api
    );

    fs.mkdirSync(less_built_api_path, { recursive: true });

    const api_resources = map_dirs_recursive(less_api_path);
    
    const data = {
      api_routes_mapped: api_resources,
      stack_path: config.api_routes,
      less_built_api_path,
      less_api_path
    };
    
    construct_api_routes(config, data);

    apis_imports += `\n`;
    apis_uses += `\n\n`;

    fs.writeFileSync(
      path.resolve(
        config.project_build_path,
        config.less_resources.apis,
        api,
        'index.js'
      ),
      api_code
        .replace(
          '#port#',
          config.rest_api_port + index
        )
        .replace(
          '#api#',
          api
        )
    )
  });

  fs.writeFileSync(
    path.resolve(
      config.project_build_path,
      config.less_resources.apis,
      'index.js'
    ),
    apis_code
      .replace(
        '#apis-import#',
        apis.map(api => `const ${api} = require('./${api}');`).join('\n')
      )
      .replace(
        '#apis-uses#',
        apis.map(api => `${api}();`).join('\n  ')
      )
  );
}

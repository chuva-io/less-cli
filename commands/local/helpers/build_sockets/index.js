import fs from 'fs';
import path from 'path';
import map_dirs_recursive from '../map_dirs_recursive/index.js';
import add_to_package_json from '../add_to_package_json/index.js';
import convert_snake_to_camel_case from '../convert_snake_to_camel_case/index.js';

const socket_client_class_code = `class #client-class# {
  constructor() {
    if (#client-class#.exists) {
      console.log('#client-class# already exists');
      return #client-class#.instance;
    }
  
    this.clients = new Map();
    #client-class#.exists = true;
    #client-class#.instance = this.clients;
    return this.clients;
  }
};`

const connect_handler_code = `const response = await require('./connect').process({ connection_id });
    const verify_status_code_in_range = (range, status) => Array(100)
      .fill(range)
      .map((n, i) => n + i)
      .includes(status);

    if (
      verify_status_code_in_range(400, (response && response.statusCode) || null)
      || verify_status_code_in_range(500, (response && response.statusCode) || null)
    ) {
      socket.close(1008, \`HTTP/1.1 \${response.statusCode} \\r\\n\\r\\n\`);
      return;
    }`;

const message_handler_code = `const body_message = JSON.parse(data.toString('utf-8'));
      const channels = require('./channels');
      if (!channels[body_message.channel]) {
        socket.message(\`HTTP/1.1 404 Channel not found \\r\\n\\r\\n\`);
        return;
      }
      await channels[body_message.channel].process({ connection_id, data: body_message.data });`;

const socket_code = `const Websocket = require('ws');
const { randomUUID } = require('crypto');
const { #client-class# } = require('#client-classes-import#');

const port = #socket-port#;
const ws = new Websocket.WebSocketServer({ port });

module.exports = () => {
  ws.on('connection', async (socket) => {
    const client = new #client-class#();
    const connection_id = randomUUID();
    socket.id = connection_id;
  
    #connect-handler-code#
  
    client.set(connection_id, { socket });
    
    socket.on('close', async () => {
      #disconnect-handler-code#
    });
  
    socket.on('message', async (data) => {
      #message-handler-code#
    });
  });
};
`;

const socket_publisher_code = `const { #client-class# } = require('#client-classes-import#');

const clients = new #client-class#();

module.exports = async (message, connections) => {
  const sockets = [];
  if (connections && message) {
    for (let i = 0; i < connections.length; i++) {
      if (clients.has(connections[i])) {
        sockets.push(clients.get(connections[i]));
      }
    }

    await Promise.all(
      sockets.map(
        async ({ socket }) => socket.send(JSON.stringify(message))
      )
    );
  }
};`;

const construct_socket_clients_maping = (config, sockets) => {
  const clients_path = path.join(
    config.project_build_path,
    config.less_websocket_clients
  );
  
  const clients = [];
  const module_exports = [];

  sockets.forEach(socket => {
    const client_class = `${convert_snake_to_camel_case(socket)}Client`;

    clients.push(
      socket_client_class_code.replaceAll('#client-class#', client_class)
    );

    module_exports.push(`${client_class}`);
  });

  fs.mkdirSync(clients_path, { recursive: true });
  fs.writeFileSync(
    clients_path + '/index.js',
    `${clients.join('\n\n')}

module.exports = {
  ${module_exports.join(',\n  ')}
};`);

  add_to_package_json(config,{
    devDependencies: {
      [config.less_websocket_clients]: `./${config.less_websocket_clients}`
    }
  });

  config.content_paths_to_delete.push(path.join(
    config.project_build_path,
    config.less_websocket_clients
  ));
}

const construct_sockets_handlers = (config, data) => {
  const { sockets_resources, stack_path, port } = data;

  const stack_path_splited = stack_path.split('/');
  const less_socket_path = path.join(
    config.project_less_resources_location,
    stack_path
  );
  const less_built_socket_path = 
    path.join(config.project_build_path, stack_path);

  if (stack_path_splited.length > 1) {
    let less_built_channels_path;
    let less_built_channels_imports = '';
    let less_built_channels_exports = '';
    const client_class = `${convert_snake_to_camel_case(stack_path_splited[1])}Client`;

    let connect_handler = `console.log('Client with connection_d \${connection_id} has connected.')`;
    let disconnect_handler = `console.log('Client with connection_d \${connection_id} has disconnected.');`
    let message_handler = `socket.send(\`HTTP/1.1 404 Channel not found \\r\\n\\r\\n\`);`

    const connect = 'connect';
    const disconnect = 'disconnect';
    Object.keys(sockets_resources).forEach(handler => {
      const less_built_socket_handler_path = 
        path.join(less_built_socket_path, handler);

      fs.mkdirSync(less_built_socket_handler_path, { recursive: true });
      if (handler === connect) {
        fs.cpSync(
          path.join(less_socket_path, connect),
          less_built_socket_handler_path,
          { recursive: true }
        );

        connect_handler = connect_handler_code;
        return;
      }
      if (handler === disconnect) {
        fs.cpSync(
          path.join(less_socket_path, disconnect),
          less_built_socket_handler_path,
          { recursive: true }
        );

        disconnect_handler = `await require('./disconnect').process({ connection_id });`
        return;
      }

      less_built_channels_path = 
        path.join(less_built_socket_path, 'channels');

      const less_built_channel_path = 
        path.join(less_built_channels_path, handler);

      fs.mkdirSync(less_built_channel_path, { recursive: true });
      fs.cpSync(
        path.join(less_socket_path, handler),
        less_built_channel_path,
        { recursive: true }
      );

      less_built_channels_imports += `const ${handler} = require('./${handler}');\n`;
      less_built_channels_exports += `  ${handler},\n`;

      message_handler = message_handler_code;
    });

    if (less_built_channels_path) {
      fs.writeFileSync(
        less_built_channels_path + '/index.js',
        `${less_built_channels_imports}
module.exports = {
${less_built_channels_exports}}`);
    }

    fs.writeFileSync(
      less_built_socket_path + '/index.js',
      socket_code
        .replaceAll('#client-class#', client_class)
        .replace('#client-classes-import#', config.less_websocket_clients)
        .replace('#socket-port#', port)
        .replace('#socket-name#', stack_path_splited.at(-1))
        .replace('#connect-handler-code#', connect_handler)
        .replace('#disconnect-handler-code#', disconnect_handler)
        .replace('#message-handler-code#', message_handler)
    );

    return;
  }

  Object.keys(sockets_resources).forEach((socket, index) => {
    const socket_port = port + index;
    config.sockets[socket] = {
      port: socket_port
    };

    const new_data = {
      port: socket_port,
      stack_path: stack_path + `/${socket}`,
      sockets_resources: sockets_resources[socket]
    };

    construct_sockets_handlers(config, new_data);
  });
}

const construct_socket_publishers = (config, sockets) => {
  const socket_publishers_path = path.join(
    config.project_build_path,
    config.chuva_dependency,
    config.less_resources.sockets
  );

  sockets.forEach(socket => {
    const client = `${convert_snake_to_camel_case(socket)}Client`;

    const socket_publisher_path = 
      path.join(socket_publishers_path, socket);

    fs.mkdirSync(socket_publisher_path, { recursive: true });
    fs.writeFileSync(
      socket_publisher_path + '/index.js',
      socket_publisher_code
        .replaceAll('#client-class#', client)
        .replace('#client-classes-import#', config.less_websocket_clients)
    );
  });

  fs.writeFileSync(
    socket_publishers_path + '/index.js',
    `${sockets.map(socket => `const ${socket} = require('./${socket}');`).join('\n')}

module.exports = {
  ${sockets.map(socket => `${socket}: {
    publish: ${socket}
  }`).join(',\n  ')}
};`)
}

const build = (config) => {
  const less_built_sockets_path = path.join(
    config.project_build_path,
    config.less_resources.sockets
  );

  const less_project_sockets_path = path.join(
    config.project_less_resources_location,
    config.less_resources.sockets
  );

  if (!fs.existsSync(less_project_sockets_path)) {
    return;
  }

  config.app_imports += 'const sockets = require(\'./sockets\');\n';
  config.app_callers += 'sockets();\n'

  const sockets_resources =
    map_dirs_recursive(less_project_sockets_path);
  const sockets = Object.keys(sockets_resources);

  construct_socket_clients_maping(config, sockets);

  const handlers_data = {
    sockets_resources,
    port: config.socket_port,
    stack_path: config.less_resources.sockets
  };

  construct_sockets_handlers(config, handlers_data);

  fs.writeFileSync(
    less_built_sockets_path + '/index.js',
    `${sockets.map(socket => `const ${socket} = require('./${socket}');`).join('\n')}

module.exports = async () => {
  ${sockets.map(socket => `${socket}();`).join('\n  ')}
};
`
  );

  construct_socket_publishers(config, sockets);

  add_to_package_json(config, {
    dependencies: {
      ws: "^8.16.0",
    }
  });
};

export default build;

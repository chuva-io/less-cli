import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

import validate_resource_instance_name from '../../validate_resources_instances_names.js';
import { ResourceNameInvalidException, ResourceHandlerNotFoundException } from '../errors/index.js';

export default (project_less_path) => {
  const sockets_path = path.join(project_less_path, 'sockets');

  if (!fs.existsSync(sockets_path)) {
    return;
  }

  const sockets = fs
    .readdirSync(sockets_path)
    .filter(element => fs
      .statSync(path.join(sockets_path, element))
      .isDirectory()
    );

  if (!sockets.length) {
    return;
  }

  sockets.forEach(socket => {
    if (!validate_resource_instance_name(socket)) {
      throw new ResourceNameInvalidException(
        `Invalid socket name "${socket}". ${validate_resource_instance_name.regexConstrainMessage}.`
      );
    }

    const socket_path = path.join(sockets_path, socket);
    const socket_channels = fs
      .readdirSync(socket_path)
      .filter(element => fs
        .statSync(path.join(socket_path, element))
        .isDirectory()
      );
    
    const connections_handlers = ['connect', 'disconnect'];
    const connections_handlers_filtered = connections_handlers
      .filter(handler => !socket_channels.includes(handler));

    if (connections_handlers_filtered.length) {
      console.log(chalk.yellowBright(
        `WARNING: Socket "${socket}" does not contain the ${connections_handlers_filtered.join(' and ')} ${connections_handlers_filtered.length === 2 ? 'handlers' : 'handler'}.`
      ))
    }

    socket_channels.forEach(channel => {
      if (!validate_resource_instance_name(channel)) {
        throw new ResourceNameInvalidException(
          `Invalid channel name "${channel}" from socket "${socket}". ${validate_resource_instance_name.regexConstrainMessage}.`
        );
      }

      const channel_path = path.join(socket_path, channel);
      const channel_handler = fs
        .readdirSync(channel_path)
        .filter(element =>
          fs.statSync(path.join(channel_path, element)).isFile()
          && /^(index\.js|__init__\.py)$/.test(element)
        );

      if (!channel_handler.length) {
        throw new ResourceHandlerNotFoundException(
          `The ${connections_handlers.includes(channel) ? `${channel} handler`: `channel "${channel}"`} from socket "${socket}", doesn't have a handler file named "index.js" or "__init__.py".`
        );
      }
    })
  });
}
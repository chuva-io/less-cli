import chalk from 'chalk';
import ora from 'ora';
import WebSocket from 'ws';
import { get_less_token, verify_auth_token } from '../helpers/credentials.js';
import validate_project_name from '../helpers/validations/validate_project_name.js';
import validate_static_folder_name from '../helpers/validations/validate_static_folder_name.js';
import validate_static_domain_name from '../helpers/validations/validate_static_domain_name.js';
import handleError from '../helpers/handle_error.js';
import create_server_url from '../helpers/create_server_url.js';
import axios from 'axios';

const spinner = ora({ text: '' });

const CLI_PREFIX = '[less-cli]';

async function _create_custom_domain({
  organization_id,
  projectName,
  staticName,
  customDomain
}) {
  let connectionId;

  const socket = new WebSocket('wss://less-server.chuva.io');
  await new Promise((resolve) => {
    socket.on('open', async () => { });

    socket.on('message', async (data) => {
      const message = JSON.parse(data);
  
      if (message.event === 'conectionInfo') {
        connectionId = message.data?.connectionId;
  
        const LESS_TOKEN = await get_less_token();
  
        try {
          const headers = {
            Authorization: `Bearer ${LESS_TOKEN}`,
            'connection_id': connectionId,
          };
  
          const serverUrl = create_server_url(organization_id, 'domains/static');
          const response = await axios.post(
            serverUrl,
            {
              project_name: projectName,
              static_name: staticName,
              custom_domain: customDomain
            },
            { headers }
          );
  
          console.log();
          console.log(chalk.yellowBright(CLI_PREFIX), chalk.greenBright('\t- NS Records'));
          console.table({ ...response.data });
  
          spinner.stop();
          socket.close();
          resolve();
        } catch (error) {
          spinner.stop();
          handleError('Something went wrong');
          socket.close();
          process.exitCode = 1; // Non-success exit code for failure
          resolve();
        }
      }
    });
  });
}

export default async function create_custom_domain({
  projectName,
  staticName,
  customDomain
}, command) {
  spinner.start(`${CLI_PREFIX} Connecting to the Less Server... ⚙️`);
  spinner.start();
  const organization_id = command.parent.opts().organization;
  try {
    verify_auth_token()
    validate_project_name(projectName)
    validate_static_folder_name(staticName)
    validate_static_domain_name(customDomain)
    
    await _create_custom_domain({
      organization_id,
      projectName,
      staticName,
      customDomain
    });
  } catch (error) {
    spinner.stop();
    handleError(error.message)
  }
}

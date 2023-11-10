import chalk from 'chalk';
import ora from 'ora';
import WebSocket from 'ws';
import { get_less_token } from '../helpers/credentials.js';
import api from '../service/api.js';

const spinner = ora({ text: '' });

const CLI_PREFIX = '[less-cli]';

async function _create_custom_domain({
  projectName,
  staticName,
  customDomain
}) {
  let connectionId;

  const socket = new WebSocket('wss://less-server.chuva.io');

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

        const response = await api.post(
          '/v1/domains/static',
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
        process.exit();
      } catch (error) {
        spinner.stop();
        console.error(chalk.redBright('Error:'), error?.response?.data || 'Something went wrong');
        socket.close();
        process.exit(1); // Non-success exit code for failure
      }
    }
  });
}

export default async function create_custom_domain({
  projectName,
  staticName,
  customDomain
}) {
  spinner.start(`${CLI_PREFIX} Connecting to the Less Server... ⚙️`);
  spinner.start();
  try {
    await _create_custom_domain({
      projectName,
      staticName,
      customDomain
    });
  } catch (error) {
    spinner.stop();
    console.error(chalk.redBright('Error: '), error.message || 'An error occurred');
    process.exit(1); // Non-success exit code for any error
  }
}

import AdmZip from 'adm-zip';
import axios from 'axios';
import chalk from 'chalk';
import FormData from 'form-data';
import fs from 'fs';
import * as glob from 'glob';
import ora from 'ora';
import path from 'path';
import WebSocket from 'ws';

const spinner = ora({ text: '' });

const CLI_PREFIX = '[less-cli]';

async function deployProject(projectPath, projectName, envVars) {
  let connectionId;
  const tempZipFilename = 'temp_project.zip';
  const zip = new AdmZip();

  const itemsToZip = glob.sync('less/statics/*', {
    cwd:  projectPath,
  });
  
  for (const item of itemsToZip) {
    const itemPath = path.join(projectPath, item);

    if (fs.statSync(itemPath).isDirectory()) {
      zip.addLocalFolder(itemPath, item);
    } else {
      zip.addLocalFile(itemPath);
    }
  }

  await zip.writeZipPromise(tempZipFilename);

  const serverUrl = 'https://less-server.chuva.io/v1/deploy-statics';
  const socket = new WebSocket('wss://less-server.chuva.io');

  socket.on('open', async () => { });

  socket.on('message', async (data) => {
    const message = JSON.parse(data);

    if (message.event === 'deploymentStatus') {
      const statusData = message.data;
      const { status, resources, error } = statusData;

      if (status?.includes('Building...')) {
        spinner.stop();
      }

      console.log(chalk.yellowBright(CLI_PREFIX), chalk.greenBright(status));

      if (status?.includes('Deploy completed')) {
        console.log(chalk.yellowBright(CLI_PREFIX), '🇨🇻');
      }

      if (resources) {
        const { websites } = resources;

        if (websites?.length) {
          console.log(chalk.yellowBright(CLI_PREFIX), chalk.greenBright('\t- Websites URLs'));
          websites.forEach(website => {
            console.log(chalk.yellowBright(CLI_PREFIX), chalk.greenBright(`\t\t- ${website}`));
          });
        }

        socket.close();
        process.exit(0);
      }

      if (error) {
        socket.close();
        process.exit(1); // Non-success exit code for failure
      }
    }

    if (message.event === 'conectionInfo') {
      connectionId = message.data?.connectionId;
      try {
        const formData = new FormData();
        formData.append('zipFile', fs.createReadStream(tempZipFilename));
        formData.append('env_vars', JSON.stringify(envVars));
        formData.append('project_name', JSON.stringify(projectName));

        const headers = {
          Authorization: `Bearer ${process.env.LESS_TOKEN}`,
          'connection_id': connectionId,
          ...formData.getHeaders(),
        };

        const response = await axios.post(serverUrl, formData, { headers });

        if (response.status === 202) {
          return response.data;
        }
      } catch (error) {
        spinner.stop();
        console.error(chalk.redBright('Error:'), error?.response?.data || 'Deployment failed');
        socket.close();
        process.exit(1); // Non-success exit code for failure
      } finally {
        fs.unlinkSync(tempZipFilename);
      }
    }
  });
}

export default async function deploy(projectName) {
  spinner.start(`${CLI_PREFIX} Connecting to the Less Server... ⚙️`);
  spinner.start();
  try {
    const currentWorkingDirectory = process.cwd();

    await deployProject(currentWorkingDirectory, projectName, {});
  } catch (error) {
    spinner.stop();
    console.error(chalk.redBright('Error: '), error.message || 'An error occurred');
    process.exit(1); // Non-success exit code for any error
  }
}

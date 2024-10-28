import ora from 'ora';
import chalk from 'chalk';
import { spawn } from 'child_process';

import { LESS_LOCAL_FLAG } from '../../constants/index.js';
import less_app_config_file from '../less_app_config_file/index.js';

const run_app = async (config) => {
  const less_local_flag = chalk.yellowBright(LESS_LOCAL_FLAG);
  const app_config = less_app_config_file.get(config.project_build_path);

  const spinner = ora(chalk.gray(LESS_LOCAL_FLAG + 'Running app...'));
  spinner.start();
  await new Promise((resolve) => {
    const app = spawn('node', ['app.js'], { cwd: config.project_build_path });

    app.stdout.on('data', (data) => {
      if (data.includes(app_config.app_running_flag)) {
        spinner.stop();
        console.log(less_local_flag, chalk.greenBright(`App "${config.project_build_path.split('/').pop()}" is running ✅`))
        console.log(less_local_flag, chalk.greenBright('Resources:'));
        if (Object.keys(app_config.apis).length) {
          console.log(less_local_flag, chalk.greenBright('\tList of APIs:'));
          Object.keys(app_config.apis).forEach(api => {
            console.log(less_local_flag, chalk.greenBright(`\t\t- ${api}: http://localhost:${app_config.apis[api].port}`));
          });
        }

        if (Object.keys(app_config.sockets).length) {
          console.log(less_local_flag);
          console.log(less_local_flag, chalk.greenBright('\tList of Sockets:'));
          Object.keys(app_config.sockets).forEach(socket => {
            console.log(less_local_flag, chalk.greenBright(`\t\t- ${socket}: ws://localhost:${app_config.sockets[socket].port}`));
          });
        }

        console.log(less_local_flag, '🇨🇻\n\n');
        return;
      }

      if (data.includes(config.less_local_error_flag) || data.includes(config.less_local_info_flag)) {
        let data_string = data.toString('utf-8');
        const errors = data_string.match(
          new RegExp(`${config.less_local_error_flag}.*${config.less_local_error_flag}`, 'g')
        );

        const infos = data_string.match(
          new RegExp(`${config.less_local_info_flag}.*${config.less_local_info_flag}`, 'g')
        );

        if (errors) {
          errors.forEach(error => {
            data_string = data_string.replaceAll(error, '');
            const error_message = error.match(/<\#(.*)\#>/)[1];
            error = error.replace(error_message, '');

            console.log(chalk.redBright(
              error
                .replace('<##>', '')
                .replace(error_message, '')
                .replaceAll(config.less_local_error_flag, '')
            ));
            console.log(error_message, '\n');
          });
        }

        if (infos) {
          infos.forEach(info => {
            data_string = data_string.replaceAll(info, '');
            console.log(chalk.greenBright(info.replaceAll(config.less_local_info_flag, '')), '\n');
          });
        }

        console.log(data_string);
        return;
      }
      
      console.log(`${data}`.replace('\n', ''));
    });

    app.stderr.on('data', (data) => {
      console.error(chalk.redBright('Error on app execution:'), data.toString('utf-8')); 
    });

    app.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
      resolve()
    });
    
  });
}

export default run_app;
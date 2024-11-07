import fs from 'fs';
import path from 'path';
import ora from 'ora';
import chalk from 'chalk';
import { get as get_build_path } from '../helpers/build_path/index.js';

import { LESS_LOCAL_FLAG } from '../constants/index.js';
import less_app_config_file from '../helpers/less_app_config_file/index.js';

const list_apps = () => {
  const builts_path = get_build_path();

  const spinner = ora(chalk.gray(`${LESS_LOCAL_FLAG} Listing built projects...`));
  spinner.start();

  const less_local_flag = chalk.yellowBright(LESS_LOCAL_FLAG);

  let apps = fs.readdirSync(builts_path);
  apps = apps.filter(app => fs.statSync(builts_path + `/${app}`).isDirectory());

  if (apps.length === 0) {
    console.log(
      less_local_flag,
      chalk.greenBright('There are no built projects.')
    );

    return;
  }
  spinner.stop();
  apps.forEach(app => {
    const app_info = less_app_config_file.get(path.join(builts_path, app));

    console.log(chalk.bold.greenBright('ID:'), chalk.cyanBright(app));
    console.log(chalk.bold.greenBright('Created At:'), chalk.cyanBright(app_info.created_at));
    console.log(chalk.bold.greenBright('Updated At:'), chalk.cyanBright(app_info.updated_at), '\n');
  });
};

export default list_apps;
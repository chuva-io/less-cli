import fs from 'fs';
import ora from 'ora';
import path from 'path';
import chalk from 'chalk';
import { get as get_build_path } from '../helpers/build_path/index.js';

import { LESS_LOCAL_FLAG } from '../constants/index.js';

const delete_app = async (project_name) => {
  const built_path = path.join(
    get_build_path(),
    project_name
  );
    
  const spinner = ora(chalk.gray(`${LESS_LOCAL_FLAG} Deleting built project...`));
  spinner.start();

  const less_local_flag = chalk.yellowBright(LESS_LOCAL_FLAG);
  if (!fs.existsSync(built_path)) {
    spinner.stop();
    console.log(
      less_local_flag,
      chalk.redBright(`The built with name "${project_name}" does not exist.`)
    );
    process.exitCode = 1;
    return;
  }

  
  fs.rmSync(built_path, { recursive: true, force: true });

  spinner.stop();
  console.log(
    less_local_flag,
    chalk.greenBright(`The built with name "${project_name}" has been deleted. ✅`)
  );
};

export default delete_app;
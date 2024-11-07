import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import run_app_helper from '../helpers/run_app/index.js';
import { get as get_build_path } from '../helpers/build_path/index.js';

import { LESS_LOCAL_FLAG, LESS_LOCAL_INFO_FLAG, LESS_LOCAL_ERROR_FLAG } from '../constants/index.js';

const run_app = async (project_name) => {
  const project_build_path = path.join(
    get_build_path(),
    project_name
  );
  
  const less_local_flag = chalk.yellowBright(LESS_LOCAL_FLAG);
  if (!fs.existsSync(project_build_path)) {
    console.log(
      less_local_flag,
      chalk.redBright(`The project_name "${project_name}" does not exist.`)
    );
    process.exitCode = 1;
    return;
  }
  const config = {
    project_build_path,
    less_local_info_flag: LESS_LOCAL_INFO_FLAG,
    less_local_error_flag: LESS_LOCAL_ERROR_FLAG
  };

  await run_app_helper(config);
};

export default run_app;
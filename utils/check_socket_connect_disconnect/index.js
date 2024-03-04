import fs from 'fs/promises';
import inquirer from 'inquirer';
import chalk from 'chalk';

/**
 * Checks if all sockets in the specified path have both 'connect' and 'disconnect' processors.
 * If any socket is missing either of the processors, it prompts the user for confirmation before deployment.
 *
 * @param {string} sockets_path - The path to the directory containing socket directories.
 * @returns {Promise<boolean>} - A Promise resolving to a boolean indicating whether to proceed with deployment.
 */
const check_socket_connect_disconnect = async (sockets_path) => {
  const sockets = await fs.readdir(sockets_path);

  const sockets_without_processors = [];
  for (const socket of sockets) {
    // Reads the contents of each socket directory.
    const processors = await fs.readdir(`${sockets_path}/${socket}`);

    // Checks if 'connect' or 'disconnect' processors are missing.
    if (!processors.includes('connect') || !processors.includes('disconnect')) {
      sockets_without_processors.push(socket);
    }
  }

  // If any sockets are missing processors, prompt the user for confirmation.
  if (sockets_without_processors.length) {
    // Generates a message with the list of sockets without one or both the processors.
    let message = `The follows sockets does not have the connect or disconnect processors:\n`
    for (const socket of sockets_without_processors) {
      message = `${message} - ${socket}\n`;
    }
    console.log(chalk.yellowBright(message));
  
    let answer;
    // Prompts the user for confirmation until a valid answer is provided.
    while (true) {
      if (answer) {
        console.error(chalk.redBright('Invalid answer\n'));
      }

      answer = (await inquirer.prompt([{
        type: 'input',
        name: 'answer',
        message: 'Are you sure you want to deploy your project ?[Y/N]',
      }])).answer.toUpperCase();
  
      if (answer === 'Y' || answer === 'N') {
        break;
      }
    }

    // Returns true if all sockets have both 'connect' and 'disconnect' processors.
    return answer === 'Y';
  }

  // Returns true if all sockets have both 'connect' and 'disconnect' processors.
  return true;
};

export default check_socket_connect_disconnect;

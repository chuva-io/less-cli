import fs from 'fs/promises';
import inquirer from 'inquirer';
import chalk from 'chalk';

/**
 * Checks if all sockets in the specified path have both 'connect' and 'disconnect' processors.
 * If any socket is missing either of the processors, it prompts the user a warning message 
 * indicating the ones that is missing
 * 
 * @async
 * @param {string} sockets_path - The path to the directory containing socket directories.
 * @returns {VoidFunction} 
 */
async function check_sockets_connect_disconnect_processors(sockets_path) {
  const sockets = await fs.readdir(sockets_path);

  const sockets_without_connect = [];
  const sockets_without_disconnect = [];
  for (const socket of sockets) {
    // Reads the contents of each socket directory.
    const processors = await fs.readdir(`${sockets_path}/${socket}`);

    // Checks if 'connect' or 'disconnect' processors are missing.
    if (!processors.includes('connect')) {
      sockets_without_connect.push(socket);
    }  
    if (!processors.includes('disconnect')) {
      sockets_without_disconnect.push(socket);
    }
  }

  // If any sockets are missing processors, prompt the user for confirmation.
  if (sockets_without_connect.length) {
    // Generates a message with the list of sockets without one or both the processors.
    let message = `The follow sockets does not have the connect processor:\n`
    for (const socket of sockets_without_connect) {
      message = `${message} - ${socket}\n`;
    }
    console.log(chalk.yellowBright(message));
  }

  if (sockets_without_disconnect.length) {
    let message = `The follow sockets does not have the disconnect processor:\n`
    for (const socket of sockets_without_disconnect) {
      message = `${message} - ${socket}\n`;
    }
    console.log(chalk.yellowBright(message));
  }
};

export default check_sockets_connect_disconnect_processors;

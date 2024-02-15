import { default as chalk } from "chalk";

/**
 * Logs an informational message with a yellow label.
 * @param {string} message - The message to log.
 */
export function logInfo(message) {
  console.log(chalk.yellowBright('[less-cli]'), message);
}

/**
* Logs a success message with a green label.
* @param {string} message - The message to log.
*/
export function logSuccess(message) {
  console.log(chalk.greenBright(message));
}

/**
* Logs an error message with a red label.
* @param {string} message - The error message.
*/
export function logError(message) {
  console.error(chalk.redBright('Error:'), `${message}\n`);
}

/**
 * Logs a warning message with a yellow label.
 * @param {string} message - The warning message.
 */
export function logWarning(message) {
  console.log(chalk.yellow('Warning:'), message);
}

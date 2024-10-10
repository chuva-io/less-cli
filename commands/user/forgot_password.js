import inquirer from 'inquirer';
import chalk from 'chalk';
import api from '../service/api.js';

/**
 * Validates an email address.
 * @param {string} input - The email address to validate.
 * @returns {(boolean|string)} True if the email is valid, otherwise a string with an error message.
 */
const email_validation = (input) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)
    ? true
    : 'Please enter a valid email address.';

/**
 * Validates a password.
 * @param {string} input - The password to validate.
 * @returns {(boolean|string)} True if the password is valid, otherwise a string with an error message.
 */
const password_validation = (input) => {
  if (input.trim() === '') return 'Password is required.';
  if (input.length < 8) return 'Password must be at least 8 characters long.';
  if (!/[A-Z]/.test(input))
    return 'Password must contain at least one uppercase letter.';
  if (!/[a-z]/.test(input))
    return 'Password must contain at least one lowercase letter.';
  if (!/[0-9]/.test(input)) return 'Password must contain at least one number.';
  if (!/[^A-Za-z0-9]/.test(input))
    return 'Password must contain at least one special symbol.';
  return true;
};

/**
 * Resets the password for a user account.
 * @param {string} email - The email address of the user.
 * @param {string} new_password - The new password for the user.
 * @param {string} verification_code - The verification code sent to the user's email.
 * @returns {Promise<boolean|string>} True if the password is reset successfully, otherwise an error message.
 */
async function reset_password(email, new_password, verification_code) {
  try {
    await api.post(`v1/confirm_password`, {
      email,
      new_password,
      verification_code,
    });
    return true;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      return error.response.data.error;
    }
    console.error(
      chalk.redBright('\nError:'),
      error.message || 'An error occurred'
    );
  }
}

/**
 * Initiates the password recovery process.
 * @param {string} email - The email address of the user.
 */
async function recover(email) {
  try {
    const response = await api.post('v1/forgot_password', { email });

    if (response.status === 201) {
      const answers = await inquirer.prompt([
        {
          type: 'password',
          name: 'verificationCode',
          mask: '*',
          message: 'Enter the verification code sent to your email:',
          validate: (input) => {
            if (input.trim() === '') return 'Verification code is required.';
            if (input.length < 6)
              return 'Verification code must be at least 6 characters long.';
            return true;
          },
        },
        {
          type: 'password',
          name: 'newPassword',
          message: 'Enter new password:',
          mask: '*',
          validate: password_validation,
        },
      ]);

      await reset_password(
        email,
        answers.newPassword,
        answers.verificationCode
      );
      console.log(
        chalk.yellowBright('[less-cli]'),
        chalk.green('Password reset successfully')
      );
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log(chalk.redBright('Error:'), error.response.data.error);
    } else {
      console.error(
        chalk.redBright('Error:'),
        error.message || 'An error occurred'
      );
    }
    process.exitCode = 1;
  }
}

/**
 * Initiates the password recovery process by prompting the user for their email.
 */
async function forgot_password() {
  const { email } = await inquirer.prompt([
    {
      type: 'input',
      name: 'email',
      message: 'Enter your email:',
      validate: email_validation,
    },
  ]);

  await recover(email);
}

export default forgot_password;

import inquirer from 'inquirer';
import chalk from 'chalk';
import api from '../service/api.js'

const questions = [
  {
    type: 'input',
    name: 'name',
    message: 'Enter your name:',
    validate: (input) => (input.trim() !== '' ? true : 'Name is required.'),
  },
  {
    type: 'input',
    name: 'email',
    message: 'Enter your email:',
    validate: (input) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) ? true : 'Please enter a valid email address.',
  },
  {
    type: 'password',
    name: 'password',
    message: 'Enter your password:',
    mask: '*',
    validate: (input) => {
      if (input.trim() === '') return 'Password is required.';
      if (input.length < 8) return 'Password must be at least 8 characters long.';
      if (!/[A-Z]/.test(input)) return 'Password must contain at least one uppercase letter.';
      if (!/[a-z]/.test(input)) return 'Password must contain at least one lowercase letter.';
      if (!/[0-9]/.test(input)) return 'Password must contain at least one number.';
      if (!/[^A-Za-z0-9]/.test(input)) return 'Password must contain at least one special symbol.';
      return true;
    },
  }
];

async function create(user) {
  try {
    const response = await api.post('v1/users', user);

    if (response.status === 201) {
      await inquirer
        .prompt([
          {
            type: 'password',
            name: 'verificationCode',
            mask: '*',
            message: 'Enter the verification code sent to your email:',
            validate: async input => await verify_user(input, response.data.id)
          },
        ]);

        console.log(chalk.yellowBright('[less-cli]'), chalk.green('Account verified!'));
    }

  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log(chalk.redBright('Error:'), error.response.data.error);
    } else {
      console.error(chalk.redBright('Error:'), error.message || 'An error occurred');
    }
  }
}

async function verify_user(code, user_id) {
  try {
    await api.post(`v1/users/${user_id}/verify`, { code });
    return true;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      return error.response.data.error;
    }

    console.error(chalk.redBright('\nError:'), error.message || 'An error occurred');
  }
}

export default async function create_account() {
  const answers = await inquirer.prompt(questions);
  await create(answers)
}

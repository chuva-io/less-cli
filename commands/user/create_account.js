import inquirer from 'inquirer';
import api from '../../service/api.js';
import { logError, logInfo } from '../../utils/logger.js';

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
    const response = await api.post('/v1/users', user);

    if (response.status === 201) {
      inquirer
        .prompt([
          {
            type: 'password',
            name: 'verificationCode',
            mask: '*',
            message: 'Enter the verification code sent to your email:',
            validate: async input => await verify_user(input, response.data.id)
          },
        ])
        .then((answers) => {
          logInfo('Account verified!');
          process.exit(0);
        });
    }

  } catch (error) {
    if (error.response && error.response.status === 400) {
      logError(error.response.data.error);
    } else {
      logError(error.message || 'An error occurred');
    }
    process.exit(1);
  }
}

async function verify_user(code, user_id) {
  try {
    await api.post(`/v1/users/${user_id}/verify`, { code });
    return true;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      return error.response.data.error;
    }
    logError(error.message || 'An error occurred');
  }
  process.exit(1);
}

export default async function create_account() {
  inquirer.prompt(questions).then(async (answers) => await create(answers));
}

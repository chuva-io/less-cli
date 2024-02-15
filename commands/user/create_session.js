import inquirer from 'inquirer';

import api from '../../service/api.js'
import { 
    set_credentials, 
} from '../../utils/credentials.js';
import { logError, logInfo } from '../../utils/logger.js';

const questions = [
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
      return true;
    },
  }
];

async function login(user) {
  try {
    const response = await api.post('/v1/sessions', user);

    if (response.status === 201) {
        await set_credentials({ 
            LESS_TOKEN: response.data.token 
        });
        logInfo('Login successful! Your LESS_TOKEN has been exported to your environment.');
        process.exit(0);
    }

  } catch (error) {
    if (error.response && error.response.status === 401) {
      logError(error.response.data.error);
    } else {
      logError(error.message || 'An error occurred');
    }
    process.exit(1);
  }
}

export default async function create_session() {
  inquirer.prompt(questions).then(async (answers) => await login(answers));
}

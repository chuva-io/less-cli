import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const filter_unanswered_questions = (options, questions) => {
  const options_set = new Set(Object.keys(options));
  return questions.filter(question => !options_set.has(question.name));
};

const inquire_unanswered_questions = async (options, questions) => {
  const unanswered_questions = filter_unanswered_questions(options, questions);
  const answers = await inquirer.prompt(unanswered_questions);
  return { ...options, ...answers }; // Return all answers
};

const create_file = (folder_path, file_name, file_content = '') => {
  // Create the route directory if it doesn't exist
	if (!fs.existsSync(folder_path)) {
		fs.mkdirSync(folder_path, { recursive: true });
	}

  // Create the file if it doesn't exist
  const file_path = path.join(folder_path, file_name);
  if (!fs.existsSync(file_path)) {
    fs.writeFileSync(file_path, file_content);
    console.log(chalk.green('File created:'), `${file_path}`);
  } else {
    console.log(chalk.yellow('File already exists:'), `${file_path}`);
  }
};

const create_folder = (folder_path) => {
  // Create the route directory if it doesn't exist
	if (!fs.existsSync(folder_path)) {
		fs.mkdirSync(folder_path, { recursive: true });
    console.log(chalk.green('Folder created:'), `${folder_path}`);
	} else {
    console.log(chalk.yellow('Folder already exists:'), `${folder_path}`);
  }
};

const language_file_names = {
  js: 'index.js',
  ts: 'index.ts',
  py: '__init__.py'
};

export {
  inquire_unanswered_questions,
  create_file,
  create_folder,
  language_file_names
};

import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';

export default async function project_structure() {
	const questions = [
		{
			type: 'input',
			name: 'projectName',
			message: 'Enter the name of your project:',
			validate: function (input) {
				if (!/^[a-zA-Z][-a-zA-Z0-9]*$/.test(input)) {
					return 'The projectName only supports alphanumeric characters and "-"';
				}
				return true;
			},
		},
	];

	const answers = await inquirer.prompt(questions);
	const projectName = answers.projectName;
	const projectDir = path.join(process.cwd(), projectName);

	// Create the project directory if it doesn't exist
	if (!fs.existsSync(projectDir)) {
		fs.mkdirSync(projectDir);
		console.log(chalk.green('Success:'), `Project directory '${projectName}' created.`);
	} else {
		console.log(chalk.yellow('Warning:'), `Project directory '${projectName}' already exists.`);
	}

	// Create the necessary subdirectories
	const subdirectories = [
		'src/apis/demo/messages',
		'src/sockets',
		'src/external_topics',
		'src/shared',
		'src/crons',
		'src/topics/project_created',
	];

	subdirectories.forEach((subdir) => {
		const dirPath = path.join(projectDir, subdir);
		if (!fs.existsSync(dirPath)) {
			fs.mkdirSync(dirPath, { recursive: true });
		} else {
			console.log(chalk.yellow('Warning:'), `Directory '${subdir}' already exists.`);
		}
	});

	// Create a config.less file
	const configFilePath = path.join(projectDir, 'config.less');
	if (!fs.existsSync(configFilePath)) {
		const configContent = `
env_vars:
  - LESS_TOKEN
`;

		fs.writeFileSync(configFilePath, configContent);
	} else {
		console.log(chalk.yellow('Warning:'), 'config.less file already exists.');
	}

	// Create a package.json file
	const packageJsonPath = path.join(projectDir, 'package.json');
	if (!fs.existsSync(packageJsonPath)) {
		const packageJsonContent = {
			name: projectName,
			version: '1.0.0',
			description: 'Your Less project description',
			main: 'index.js',
			scripts: {
				"test": "echo \"Error: no test specified\" && exit 1"
			},
			keywords: ['less'],
			author: 'Your Name'
		};

		fs.writeFileSync(packageJsonPath, JSON.stringify(packageJsonContent, null, 4));
	} else {
		console.log(chalk.yellow('Warning:'), 'package.json file already exists.');
	}

	// Create src/apis/demo/messages/index.js
	const messagesIndexPath = path.join(projectDir, 'src', 'apis', 'demo', 'messages', 'index.js');
	if (!fs.existsSync(messagesIndexPath)) {
		const messagesIndexContent = `
const { route } = require('@chuva.io/less');

module.exports = {
    get: route(async (req, res) => {

        res.body = JSON.stringify({ 
            message: "Hello from Less demo!"
        });
        res.statusCode = 200;
        return res;
    }, [])
}
`;

		fs.writeFileSync(messagesIndexPath, messagesIndexContent);
	} else {
		console.log(chalk.yellow('Warning:'), 'src/apis/demo/messages/index.js file already exists.');
	}

	console.log(chalk.green('Success:'), 'Project initialization complete.');
}

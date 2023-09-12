#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';

import deploy from '../commands/deploy/index.js';
import add_template from '../commands/add-template/index.js';
import create_socket from '../commands/create-socket/index.js';

const program = new Command();

// Setting the name and description of the CLI tool
program
    .name('less-cli')
    .description('CLI to interact with Less')
    .version('0.0.1')
    .usage('[COMMAND]');

program
    .command('deploy <project_name>')
    .description('Deploy your less project.')
    .action((project_name) => {
        if (!/^[a-zA-Z][-a-zA-Z0-9]*$/.test(project_name)) {
            console.log(chalk.redBright('Error:'), 'The project_name must satisfy regular expression pattern: [a-zA-Z][-a-zA-Z0-9]');
            process.exit(1);
        }

        if (!process.env.LESS_TOKEN) {
            console.log(chalk.redBright('Error:'), 'Environment variable LESS_TOKEN must be defined');
            process.exit(1);
        }

        deploy(project_name)
    });

const template = program
    .command('template')
    .description('Use templates to help you get your boilerplate code set up for common tasks.');
    
template
    .command('add')
    .description('Add a template to your project.')
    .option('-n, --name <name>', 'The template you want to add. Options are "mongodb-js-shared-client".')
    .action((str, options) => {
        if (!options.name) {
            console.log(chalk.redBright('Error:'), 'The template name is required.');
            process.exit(1);
        }

        switch (options.name) {
            case 'mongodb-js-shared-client':
                add_template.create_mongodb_js_shared_client();
                process.exit(0);
            default:
                console.log(chalk.redBright('Error:'), 'Invalid template provided.');
                process.exit(1);
        }
    });

const socket = program
    .command('socket')
    .description('Manage web sockets.');

socket
    .command('create <name>')
    .description('Add new web socket to your project.')
    .option('-l, --language <language>', 'The programming language to use for the `connect` and `disconnect` handlers. Options are "js".', 'js')
    .action(async (name, options) => {
        switch (options.language) {
            case 'js':
                create_socket(name);
                process.exit(0);
            default:
                console.log(chalk.redBright('Error:'), 'Invalid language provided.');
                process.exit(1);
        }
    });

// Parsing the command-line arguments and executing the corresponding actions
program.parse();

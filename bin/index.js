#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';

import deploy from '../commands/deploy/index.js';
import deploy_static from '../commands/deploy_static/index.js';
import add_template from '../commands/add-template/index.js';
import init_project_structure from '../commands/init/project_structure.js';
import get_all from '../commands/projects/get_all.js';
import get_by_id from '../commands/projects/get_by_id.js';
import create_account from '../commands/user/create_account.js';
import create_session from '../commands/user/create_session.js';
import { verify_auth_token } from '../commands/helpers/credentials.js';

const program = new Command();

// Setting the name and description of the CLI tool
program
    .name('less-cli')
    .description('CLI to interact with Less')
    .version('1.0.0-beta.14')
    .usage('[COMMAND]');

program
    .command('deploy <project_name>')
    .description('Deploy your less project.')
    .option('--static', 'Deploy your less static websites')
    .action(async (project_name, options) => {
        verify_auth_token();

        if (!/^[a-z][-a-z0-9]*$/.test(project_name)) {
            console.log(chalk.redBright('Error:'), 'The project_name must satisfy regular expression pattern: [a-z][-a-z0-9]');
            process.exit(1);
        }

        if (options.static) {
            deploy_static(project_name);
            return;
        };

        deploy(project_name);
    });

program
    .command('list')
    .description('List all projects.')
    .action(get_all)
    .command('resources <project_id>')
    .description('List resources by project_id')
    .action(get_by_id);

program
    .command('register')
    .description('Create your less account')
    .action(create_account);

program
    .command('login')
    .description('Log in with email and password.')
    .option('-u, --user <email>', 'User email address')
    .option('-p, --password <password>', 'User password', '*')
    .action(create_session);

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

program
    .command('init')
    .description('Create your initial Less project structure.')
    .action(init_project_structure);

// Parsing the command-line arguments and executing the corresponding actions
program.parse();

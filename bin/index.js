#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';

import deploy from '../commands/deploy/index.js'

const program = new Command();

// Setting the name and description of the CLI tool
program
    .name('less-cli')
    .description('CLI to interact with Less')
    .version('0.0.1')
    .usage('[COMMAND]');

program
    .command('deploy <projectName>')
    .description('deploy your less project')
    .action((projectName) => {
        if (!/^[a-zA-Z][-a-zA-Z0-9]*$/.test(projectName)) {
            console.log(chalk.redBright('Error:'), 'The projectName must satisfy regular expression pattern: [a-zA-Z][-a-zA-Z0-9]');
            process.exit(1);
        }

        if (!process.env.LESS_TOKEN) {
            console.log(chalk.redBright('Error:'), 'Environment variable LESS_TOKEN must be defined');
            process.exit(1);
        }

        deploy(projectName)
    });

// Parsing the command-line arguments and executing the corresponding actions
program.parse();

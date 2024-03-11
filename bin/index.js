#!/usr/bin/env node
import path from 'path';
import fs from 'fs';
import { Command } from 'commander';

import deploy from '../commands/projects/deploy/index.js';
import deploy_static from '../commands/websites/deploy_static/index.js';
import init_project_structure from '../commands/projects/init/project_structure.js';
import get_all from '../commands/projects/get_all.js';
import get_by_id from '../commands/projects/get_by_id.js';
import create_account from '../commands/user/create_account.js';
import create_session from '../commands/user/create_session.js';
import create_custom_domain from '../commands/websites/create_custom_domain/index.js';
import get_function_logs from '../commands/projects/logs/get_function_logs.js';
import delete_project from '../commands/projects/delete.js';
import create_token from '../commands/tokens/create.js';
import get_organizations from '../commands/organizations/get_all.js'; 

const program = new Command();

// Get package.json version
const packagePath = path.join(process.cwd(), 'package.json');
const packageContent = JSON.parse(fs.readFileSync(packagePath).toString());
const version = packageContent?.version;

// Setting the name and description of the CLI tool
program
    .name('less-cli')
    .description('CLI to interact with Less.')
    .version(version)
    .usage('[COMMAND]');

//  ORGANIZATIONS - Commands
const organizations = program.command('organizations')
    .description('Manage organizations.');

organizations
    .command('list')
    .description('list your organizations.')
    .action(get_organizations);

//  PROJECTS - Commands
const projects = program.command('projects')
    .description('Manage projects.');

projects
    .command('deploy')
    .description('Deploy your project.')
    .option('-o, --organization <organizationId>', 'Organization ID')
    .option('-n, --name <projectName>', 'Project name')
    .action(deploy);

projects
    .command('list')
    .description('List all projects.')
    .option('-o, --organization <organizationId>', 'Organization ID')
    .action(get_all);

projects
    .command('list_resources')
    .description('List all resources for a project.')
    .option('-o, --organization <organizationId>', 'Organization ID')
    .option('-n, --name <projectName>', 'Project Name')
    .action(get_by_id);

projects
    .command('log')
    .description('List logs from a project.')
    .option('-o, --organization <organizationId>', 'Organization ID')
    .option('-n, --name <projectName>', 'Project name')
    .option('-p, --resource-path <resourcePath>', 'Resource path')
    .action(get_function_logs);

projects
    .command('delete')
    .description('Delete your project.')
    .option('-o, --organization <organizationId>', 'Organization ID')
    .option('-n, --name <projectName>', 'Project Name')
    .action(delete_project);

projects
    .command('init')
    .description('Create your initial Less project structure.')
    .action(init_project_structure);

const websites = program.command('websites')
    .description('Manage websites');

// STATICS WEBSITES - commands
websites
    .command('deploy')
    .description('Deploy your less project.')
    .option('-o, --organization <organizationId>', 'Organization ID')
    .option('-n, --name <projectName>', 'Website Name')
    .action(deploy_static);
    
websites
    .command('create-domain')
    .description('Configure custom domains for websites.')
    .option('-o, --organization <organizationId>', 'Organization ID')
    .option('-p, --project-name <projectName>', 'Name of your project')
    .option('-f, --static-folder <staticFolder>', 'Static folder')
    .option('-d, --custom-domain <customDomain>', 'Your custom domain')
    .action(create_custom_domain);

// USER - commands
const users = program;

users
    .command('register')
    .description('Create your less account.')
    .action(create_account);

users
    .command('login')
    .description('Log in with email and password.')
    .option('-u, --user <email>', 'User email address')
    .option('-p, --password <password>', 'User password', '*')
    .action(create_session);

// TOKENS - commands
const tokens = program
    .command('tokens')
    .description('Manage tokens');

tokens
    .command('create')
    .description("Create token")
    .option('-o, --organization <organizationId>', 'Organization ID')
    .option('-d, --description <tokenDescription>', 'Token description')
    .action(create_token);

// Parsing the command-line arguments and executing the corresponding actions
program.parse();

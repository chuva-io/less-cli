#!/usr/bin/env node
import { fileURLToPath } from 'url';
import path, { dirname }  from 'path';
import fs from 'fs';
import { Command, Option } from 'commander';
import chalk from 'chalk';

import deploy from '../commands/deploy/index.js';
import deploy_static from '../commands/deploy_static/index.js';
import create_route from '../commands/create/route/index.js';
import create_socket from '../commands/create/socket/index.js';
import create_topic from '../commands/create/topic/index.js';
import create_subscribers from '../commands/create/subscribers/index.js';
import create_cron from '../commands/create/cron/index.js';
import create_shared_module from '../commands/create/shared_module/index.js';
import create_cloud_function from '../commands/create/cloud_function/index.js';
import get_all from '../commands/projects/get_all.js';
import get_by_id from '../commands/projects/get_by_id.js';
import create_account from '../commands/user/create_account.js';
import create_session from '../commands/user/create_session.js';
import forgot_password from '../commands/user/forgot_password.js';
import { verify_auth_token } from '../commands/helpers/credentials.js';
import create_custom_domain from '../commands/create_custom_domain/index.js';
import fetch_and_log_function_logs from '../commands/projects/logs/fetch_and_log_function_logs.js';
import delete_project from '../commands/projects/delete.js';

const program = new Command();

// Get the directory of the current module file
const __dirname = dirname(fileURLToPath(import.meta.url));

// Get package.json version
const packagePath = path.join(__dirname, '..', 'package.json');
const packageContent = JSON.parse(fs.readFileSync(packagePath).toString());
const version = packageContent?.version;

// Setting the name and description of the CLI tool
program
    .name('less-cli')
    .description('CLI to interact with Less')
    .version(version)
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
    .command('domains')
    .description('Use custom domains')
    .option('--project-name <projectName>', 'Name of your project')
    .option('--static-name <staticName>', 'Name of your static folder')
    .option('--custom-domain <customDomain>', 'Your custom domain')
    .action((_, options) => {
        verify_auth_token();

        const { 
            projectName,
            staticName,
            customDomain
        } = options._optionValues;

        if (
            !projectName ||
            !/^[a-z][-a-z0-9]*$/.test(projectName) 
        ) {
            console.log(chalk.redBright('Error:'), 'The projectName must satisfy regular expression pattern: [a-z][-a-z0-9]');
            process.exit(1);
        }

        if (
            !staticName ||
            !/^[a-z][-a-z0-9]*$/.test(staticName)
        ) {
            console.log(chalk.redBright('Error:'), 'The staticName must satisfy regular expression pattern: [a-z][-a-z0-9]');
            process.exit(1);
        }

        if (
            !customDomain ||
            !/^(?!https?:\/\/)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(customDomain)
        ) {
            console.log(chalk.redBright('Error:'), 'The customDomain must satisfy regular expression pattern: (?!https?:\/\/)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
            console.log(chalk.redBright('Error:'), 'Example: example.com, subdomain.example.com, sub.subdomain.example.com');
            process.exit(1);
        }

        create_custom_domain({
            projectName,
            staticName,
            customDomain
        });
    });

program
    .command('list')
    .description('List all projects.')
    .action(get_all)
    .command('resources <project_id>')
    .description('List resources by project_id')
    .action(get_by_id);

program
    .command('log')
    .description('List logs by project. Example usage: less-cli log --project hello-api --path apis/demo/hello/get')
    .option('--project <projectName>', 'Specify the name of your project for which you want to list the logs')
    .option('--path <functionPath>', 'Specify the path of the function for which you want to log')
    .action(fetch_and_log_function_logs);

program
    .command('register')
    .description('Create your less account')
    .action(create_account);

program
    .command('forgot-password')
    .description("This command will send a message to the end user with a confirmation code that is required to change the user's password.")
    .action(forgot_password);

program
    .command('login')
    .description('Log in with email and password.')
    .option('-u, --user <email>', 'User email address')
    .option('-p, --password <password>', 'User password', '*')
    .action(create_session);

program
    .command('delete <project_name>')
    .description('Delete your project. Example usage: less-cli delete hello-api')
    .action(delete_project);

const create = program
    .command('create')
    .summary('Creates your Less files/resources and boilerplate code for you.')
    .description('Streamline your development by creating your Less files/resources and boilerplate code automatically.');

create
    .command('route')
    .summary('Creates your HTTP routes.')
    .description('Creates your HTTP routes.\n\nRequired options: For options marked as required, if you do not specify an option you will be asked to specify it in interactive mode instead.\n\nRead the REST API Documentation: https://less.chuva.io/rest-apis')
    .option('-n, --name <name>', 'Required: The name of the API to create the route for. (E.g. "store_api")')
    .option('-p, --path <path>', 'Required: The HTTP route path to create. (E.g. "/orders/{order_id}")')
    .addOption(
        new Option('-l, --language <language>', 'Required: The programming language to use for the code.')
            .choices(['js', 'py'])
    )
    .addOption(
        new Option('-v, --verb <verb>', 'Required: The HTTP verb to use for the route.')
            .choices(['get', 'post', 'put', 'patch', 'delete'])
    )
    .action(create_route);

create
    .command('socket')
    .summary('Creates your Web Sockets and socket channels or adds channels to existing sockets.')
    .description('Creates your Web Sockets and socket channels or adds channels to existing sockets.\n\nRequired options: For options marked as required, if you do not specify an option you will be asked to specify it in interactive mode instead.\n\nRead the Web Socket Documentation: https://less.chuva.io/web-sockets')
    .option('-n, --name <name>', 'Required: The name of the Web Socket to create or to add channels to. (E.g. "--name realtime_chat")')
    .addOption(
        new Option('-l, --language <language>', 'Required: The programming language to use for the code.')
            .choices(['js', 'py'])
    )
    .option('-c, --channels <channels...>', 'A list of channels to create, allowing clients to send messages to the server. (E.g. "--channels public_chatroom private_chatroom")')
    .action(create_socket);

create
    .command('topic')
    .summary('Creates Topics and Subscribers.')
    .description('Creates Topics and Subscribers.\n\nRequired options: For options marked as required, if you do not specify an option you will be asked to specify it in interactive mode instead.\n\nRead the Topics / Subscribers (Pub / Sub) Documentation: https://less.chuva.io/topics_subscribers')
    .option('-n, --name <name>', 'Required: The name of the Topic to create or to add Subscribers to. (E.g. "--name user_created")')
    .addOption(
        new Option('-l, --language <language>', 'Required: The programming language to use for the code.')
            .choices(['js', 'py'])
    )
    .option('-s, --subscribers <subscribers...>', 'A list of Subscribers to create for a Topic. (E.g. "--subscribers send_welcome_email send_to_analytics")')
    .option('-ex, --external-topic <external-name>', 'The name of the external service to connect to. Use this option to create subscribers to external services. (E.g. "--external-name iot_sensor_stream_service")')
    .action(create_topic);

create
    .command('subscribers')
    .summary('Creates Subscribers to Topics.')
    .description('Creates Subscribers to Topics.\n\nRead the Topics / Subscribers (Pub / Sub) Documentation: https://less.chuva.io/topics_subscribers')
    .option('-n, --names <subscribers...>', 'Required: A list of Subscribers to create. (E.g. "--names send_welcome_email send_to_analytics")')
    .option('-t, --topic <topic>', 'Required: The name of the Topic to create or subscribe to. (E.g. "--name user_created")')
    .addOption(
        new Option('-l, --language <language>', 'Required: The programming language to use for each subscriber\'s code.')
            .choices(['js', 'py'])
    )
    .option('-ex, --external-topic <external-name>', 'The name of the external service to subscribe to. Use this option to create subscribers to external services. (E.g. "--external-name iot_sensor_stream_service")')
    .action(create_subscribers);

create
    .command('cron')
    .summary('Creates your CRON Jobs.')
    .description('Creates your CRON Jobs.\n\nRead the CRON Jobs Documentation: https://less.chuva.io/cron-jobs')
    .option('-n, --name <name>', 'Required: Enter The name of the CRON Job to create. (E.g. "--name generate_report")')
    .addOption(
        new Option('-l, --language <language>', 'Required: The programming language to use for the code.')
            .choices(['js', 'py'])
    )
    .action(create_cron);

create
    .command('shared-module')
    .summary('Creates your Shared Code Modules.')
    .description('Creates your Shared Code Modules.\n\nRead the Shared Modules Documentation: https://less.chuva.io/shared-modules')
    .option('-n, --name <name>', 'Required: The name of the Module to create. (E.g. "--name orm_models")')
    .addOption(
        new Option('-l, --language <language>', 'Required: The programming language to use for the code.')
            .choices(['js', 'py'])
    )
    .action(create_shared_module);

create
    .command('cloud-function')
    .summary('Creates your Cloud Functions.')
    .description('Creates your Cloud Functions.\n\nRead the Cloud Functions Documentation: https://less.chuva.io/cloud-functions')
    .option('-n, --name <name>', 'Required: The name of the Cloud Function to create. (E.g. "--name add_numbers")')
    .addOption(
        new Option('-l, --language <language>', 'Required: The programming language to use for the code.')
            .choices(['js', 'py'])
    )
    .action(create_cloud_function);

// Parsing the command-line arguments and executing the corresponding actions
program.parse();

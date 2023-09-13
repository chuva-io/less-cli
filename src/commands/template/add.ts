import { Flags, Command } from '@oclif/core';
import chalk from 'chalk';
import addTemplate from '../../helpers/addTemplate';

export default class Add extends Command {
  static description = 'Use templates to help you get your boilerplate code set up for common tasks.';

  static examples = [
    '$ less-cli template add --name awesome-template',
  ];

  static flags = {
    name: Flags.string({ char: 'n', description: 'The template you want to add. Options are "mongodb-js-shared-client".' }),
  };

  static args = {};

  async run(): Promise<void> {
    const { flags } = await this.parse(Add);

    const { name } = flags;

    if (!name) {
      console.log(chalk.redBright('Error:'), 'The template name is required.');
      this.exit(1);
    }

    switch (name) {
    case 'mongodb-js-shared-client':
      addTemplate.create_mongodb_js_shared_client(this.config.root);
      break;
    default:
      console.log(chalk.redBright('Error:'), 'Invalid template provided.');
      this.exit(1);
    }
  }
}

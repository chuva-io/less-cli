import { Args, Command } from '@oclif/core';
import chalk from 'chalk';
import deploy from '../../helpers/deploy';

export default class Deploy extends Command {
  static description = 'Deploy your less project'

  static examples = [
    '$ less-cli deploy my-awesome-api',
  ]

  static flags = {}

  static args = {
    projectName: Args.string({ description: 'Name of your project', required: true }),
  }

  async run(): Promise<void> {
    const { args } = await this.parse(Deploy);
    const projectName = args.projectName;

    if (!/^[A-Za-z][\dA-Za-z-]*$/.test(projectName)) {
      console.log(chalk.redBright('Error:'), 'The projectName must satisfy regular expression pattern: [a-zA-Z][-a-zA-Z0-9]');
      this.exit(1);
    }

    if (!process.env.LESS_TOKEN) {
      console.log(chalk.redBright('Error:'), 'Environment variable LESS_TOKEN must be defined');
      this.exit(1);
    }

    await deploy(projectName);
  }
}

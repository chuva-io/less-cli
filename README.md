[![npm version](https://badge.fury.io/js/@chuva.io%2Fless-cli.svg)](https://badge.fury.io/js/@chuva.io%2Fless-cli)


`less-cli` is a CLI tool that allows you to deploy your Less projects to AWS while providing several other tools to facilitate your interaction with Less.

- [Learn about Less](https://chuva-io.notion.site/Less-44d98337e08a46af934364700da05e3a)
- [Less developer documentation](https://chuva-io.notion.site/Developer-documentation-ddbab90913494721b58eca81b3fb7552)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @chuva.io/less-cli
$ less-cli COMMAND
running command...
$ less-cli (--version)
@chuva.io/less-cli/1.0.0-beta.5 darwin-x64 node-v16.20.0
$ less-cli --help [COMMAND]
USAGE
  $ less-cli COMMAND
...
```
<!-- usagestop -->
*Note: Before deploying your project make sure to `export` your `LESS_TOKEN`.*

```bash
$ export LESS_TOKEN=your-less-token
```

# Commands
<!-- commands -->
* [`less-cli deploy PROJECTNAME`](#less-cli-deploy-projectname)
* [`less-cli help [COMMANDS]`](#less-cli-help-commands)
* [`less-cli template add`](#less-cli-template-add)

## `less-cli deploy PROJECTNAME`

Deploy your less project

```
USAGE
  $ less-cli deploy PROJECTNAME

ARGUMENTS
  PROJECTNAME  Name of your project

DESCRIPTION
  Deploy your less project

EXAMPLES
  $ less-cli deploy my-awesome-api
```

_See code: [dist/commands/deploy/index.ts](https://github.com/chuva-io/less-cli/blob/v1.0.0-beta.5/dist/commands/deploy/index.ts)_

## `less-cli help [COMMANDS]`

Display help for less-cli.

```
USAGE
  $ less-cli help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for less-cli.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.19/src/commands/help.ts)_

## `less-cli template add`

Use templates to help you get your boilerplate code set up for common tasks.

```
USAGE
  $ less-cli template add [-n <value>]

FLAGS
  -n, --name=<value>  The template you want to add. Options are "mongodb-js-shared-client".

DESCRIPTION
  Use templates to help you get your boilerplate code set up for common tasks.

EXAMPLES
  $ less-cli template add --name awesome-template
```

_See code: [dist/commands/template/add.ts](https://github.com/chuva-io/less-cli/blob/v1.0.0-beta.5/dist/commands/template/add.ts)_
<!-- commandsstop -->
Do more with Less.
🇨🇻

[![npm version](https://badge.fury.io/js/@chuva.io%2Fless-cli.svg)](https://badge.fury.io/js/@chuva.io%2Fless-cli)

`less-cli` is a CLI tool that allow you to deploy your Less projects to AWS while providing several other tools to facilitate your interaction with Less.

- [Learn about Less](https://chuva-io.notion.site/Less-44d98337e08a46af934364700da05e3a)
- [Less developer documentation](https://docs.less.chuva.io/)

# Commands

## `register`

To start using LESS, first you must create your account, you can do this using the command `register`.

```bash
$ less-cli register
```

#### Example:
```bash
$ less-cli register

[less-cli] Enter your name: Cesaria Evora
[less-cli] Enter your email: cesaria@chuva.io
[less-cli] Enter your password: ************
[less-cli] Enter the verification code sent to your email: ******
[less-cli] Account verified! Please check your email for your Less credentials.
```

## `login`

After your account being created you need to sign in in order to retrieve your **LESS token** that will enable you to use all the rest of the commands. To do this you need to use the command `login`.

*Note: The LESS token will be exported to your environment variables*

```bash
$ less-cli login
```

#### Example:
```bash
$ less-cli login

[less-cli] Enter your email: cesaria@chuva.io
[less-cli] Enter your password: ************
[less-cli] Login successful! Your LESS_TOKEN has been exported to your environment.
```

## `deploy`

The `deploy` command allow you to deploy your Less project to AWS.

```bash
$ less-cli deploy <projectName>
```

#### Example:

```bash
$ less-cli deploy my-application

[less] Building... ⚙️
[less] Build complete ✅
[less] Deploying... 🚀
[less] Deployment complete ✅
[less] Resources
[less]   - API URLs
[less]     - chat: https://a2m1n3.execute-api.eu-west-1.amazonaws.com
[less]     - webhooks: https://n2s9n5.execute-api.eu-west-1.amazonaws.com
[less]   - Web Socket URLs
[less]     - realtime_chat: wss://10l06n.execute-api.eu-west-1.amazonaws.com
[less] 🇨🇻
```

### Parameters

`<projectName>`
The name of your Less project.

*Note: Supports alphanumeric characters and "-".*

### Options

` --static <static-website-name>`

Less also allow you to deploy your static websites, with the option `--static` that proceedes the `deploy` command.

```bash
$ less-cli deploy --static <static-website-name>
```

#### Example:
```bash
$ less-cli deploy --static my-application

[less] Building... ⚙️
[less] Build complete ✅
[less] Deploying... 🚀
[less] Deployment complete ✅
[less] Resources
[less] 	 - Websites URLs
[less] 	   - http://my-application-demo-website.s3-website-eu-west-1.amazonaws.com
[less] 🇨🇻
```

## `list`

The `list` command allow you to fetch and list all your projects deployed to AWS.

```bash
$ less-cli list
```

#### Example:
```bash
$ less-cli list

ID: demo-api
Created At: 2023-11-14T12:20:51.828Z
Updated At: 2023-11-14T13:38:00.619Z

ID: ping
Created At: 2023-11-09T20:20:42.183Z
Updated At: 2023-11-10T11:41:38.740Z

ID: samba
Created At: 2023-11-04T11:44:39.595Z
Updated At: 2023-11-08T11:44:45.850Z
```

## `delete`

The `delete` command allow you to delete a project deployed to AWS.

```bash
$ less-cli delete <projectName>
```

#### Example:
```bash
$ less-cli delete my-api

[less-cli] The process has started. Wait a few minutes and list the projects to see the changes.
```

### Parameters

`<projectName>`  
The name of your Less project.  

*Note: Supports alphanumeric characters and "-".*

## `list resources`

The command `list resources` allow you to list your project resources after you deployed it. On this list includes your apis and websockets endpoints.

```bash
$ less-cli list resources <projectName>
```

#### Example:
```bash
$ less-cli list resources my-api

[less-cli] API URLs
[less-cli]      - Demo: https://3izstmbced.execute-api.eu-west-1.amazonaws.com/production
[less-cli] WEBSOCKET URLs
[less-cli]      - ChatSocketApi: wss://pr9fbdgwve.execute-api.eu-west-1.amazonaws.com/production
```

### Parameters

`<projectName>`  
The name of your Less project.  

*Note: Supports alphanumeric characters and "-".*

## `log`

The command `log` is used to fetches and logs the function logs based on the specified project and function path.

```bash
$ less-cli log --project <projectName> --path <functionPath>
```

#### Example:
```bash
$ less-cli log --project my-api --path apis/demo/hello/get

2023-11-29 15:00:22.938 START RequestId: 15e6099b-b101-4574-ab62-b848c967ee29 Version: $LATEST
2023-11-29 15:00:22.956 2023-11-29T16:00:22.956Z 15e6099b-b101-4574-ab62-b848c967ee29 ERROR Error: test error
    at Object.process (/var/task/get.js:9:15)
    at Runtime.exports.handler (/var/task/handler_get.js:27:38)
    at Runtime.handleOnceNonStreaming (file:///var/runtime/index.mjs:1173:29)
2023-11-29 15:00:22.997 END RequestId: 15e6099b-b101-4574-ab62-b848c967ee29
2023-11-29 15:00:22.997 REPORT RequestId: 15e6099b-b101-4574-ab62-b848c967ee29 Duration: 58.87 ms Billed Duration: 59 ms Memory Size: 128 MB Max Memory Used: 58 MB Init Duration: 177.97 ms 
2023-11-29 15:00:28.006 2023-11-29T16:00:28.006Z 009b82d3-41a6-4b3e-abba-35e6d1628939 ERROR Error: test error
    at Object.process (/var/task/get.js:9:15)
    at Runtime.exports.handler (/var/task/handler_get.js:27:38)
    at Runtime.handleOnceNonStreaming (file:///var/runtime/index.mjs:1173:29)
2023-11-29 15:00:28.006 START RequestId: 009b82d3-41a6-4b3e-abba-35e6d1628939 Version: $LATEST
2023-11-29 15:00:28.017 END RequestId: 009b82d3-41a6-4b3e-abba-35e6d1628939
2023-11-29 15:00:28.017 REPORT RequestId: 009b82d3-41a6-4b3e-abba-35e6d1628939 Duration: 12.37 ms Billed Duration: 13 ms Memory Size: 128 MB Max Memory Used: 59 MB
```

### Options

The command `log` requires two options.

`--project <projectName>`
This option allow you to specify the name of your project for which you want to list the logs.

`--path <functionPath>`
This option allow you to specify the path of the function for which you want to see its logs.

---

Do more with Less.  
🇨🇻

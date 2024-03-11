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

## `projects`
Manage your Less projects.

### `deploy`

The `deploy` command allow you to deploy your Less project to AWS.

```bash
$ less-cli projects deploy -o <organizationId> -n <projectName>
```
#### Parameters

- `-o, --organization <organizationId>`: Your Less organization ID (optional), if omitted, Less will use your personal account ID
- `-n, --name <projectName>`: The name of your Less project (required)

*Note: Supports alphanumeric characters and "-".*

#### Example:

```bash
$ less-cli deploy -o org123 -n my-application

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

### `list`

The `list` command allow you to fetch and list all your projects deployed to AWS.

```bash
$ less-cli projects list -o <organizationId>
```
#### Parameters

- `-o, --organization <organizationId>`: Your Less organization ID (optional), if omitted, Less will use your personal account ID

#### Example:
```bash
$ less-cli projects list -o org123

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

### `delete`

The `delete` command allow you to delete a project deployed to AWS.

```bash
$ less-cli projects delete -o <organizationId> -n <projectName>
```
#### Parameters

- `-o, --organization <organizationId>`: Your Less organization ID (optional), if omitted, Less will use your personal account ID
- `-n, --name <projectName>`: The name of your Less project (required)

*Note: Supports alphanumeric characters and "-".*

#### Example:
```bash
$ less-cli projects delete my-api -o org123 -n my-application

[less-cli] The process has started. Wait a few minutes and list the projects to see the changes.
```

### `list_resources`

The command `list resources` allow you to list your project resources after you deployed it. On this list includes your apis and websockets endpoints.

```bash
$ less-cli projects list_resources -o <organizationId> -n <projectName>
```

#### Parameters

- `-o, --organization <organizationId>`: Your Less organization ID (optional), if omitted, Less will use your personal account ID
- `-n, --name <projectName>`: The name of your Less project (required)

*Note: Supports alphanumeric characters and "-".*

#### Example:
```bash
$ less-cli projects list_resources -o org123 -n my-application

[less-cli] API URLs
[less-cli]      - Demo: https://3izstmbced.execute-api.eu-west-1.amazonaws.com/production
[less-cli] WEBSOCKET URLs
[less-cli]      - ChatSocketApi: wss://pr9fbdgwve.execute-api.eu-west-1.amazonaws.com/production
```

### `log`

The command `log` is used to fetches and logs the function logs based on the specified project and function path.

```bash
$ less-cli projects log -o <organizationId> -n <projectName> -p <resourcePath>
```

#### Parameters

- `-o, --organization <organizationId>`: Your Less organization ID (optional), if omitted, Less will use your personal account ID
- `-n, --name <projectName>`: The name of your Less project (required) for which you want to list the logs.

- `--p <resourcePath>`: The path of the function for which you want to see its logs.

*Note: Supports alphanumeric characters and "-".*

#### Example:
```bash
$ less-cli projects log -o org123 -n my-application -p apis/demo/hello/get

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

## `websites`

Manage websites.

### `deploy`
The `deploy` command allow you to deploy your static websites

```bash
$ less-cli websites deploy -n <staticWebsiteName>
```

#### Parameters

- `-o, --organization <organizationId>`: Your Less organization ID (optional), if omitted, Less will use your personal account ID
- `-n, --name <staticWebsiteName>`: The name of your website (required).

*Note: Supports alphanumeric characters and "-".*

#### Example:
```bash
$ less-cli websites deploy -o org123 -n myWebsite

[less] Building... ⚙️
[less] Build complete ✅
[less] Deploying... 🚀
[less] Deployment complete ✅
[less] Resources
[less] 	 - Websites URLs
[less] 	   - http://my-application-demo-website.s3-website-eu-west-1.amazonaws.com
[less] 🇨🇻
```

### `create-domain`
Command to configure custom domains for websites.

```bash
$ less-cli websites create-domain -o <organizationId> -p <projectName> -f <staticFolder> -d <customDomain>
```

#### Parameters

- `-o, --organization <organizationId>`: Your Less organization ID (optional), if omitted, Less will use your personal account ID
- `-n, --name <projectName>`: The name of your Less project (required).
- `-f, --static-folder <staticFolder>`: The name of your static folder (required)
- `-d, --custom-domain <customDomain>`: Your custom domain (required)

*Note: Supports alphanumeric characters and "-".*

#### Example:
```bash
$ less-cli websites create-domain -o org123 -p myWebsite -f demo-website -d demo-website.com

[less-cli] Connecting to the Less Server...
[less-cli] NS Records
┌─────────┬──────┬───────────────────────────────────┬───────────────────────────┐
│ (index) │ type │                name               │           value           │
├─────────┼──────┼───────────────────────────────────┼───────────────────────────┤
│    0    │ 'NS' │ 'demo-website.com'                │ 'ns-000.exampledns.org'   │
│    1    │ 'NS' │ 'demo-website.com'                │ 'ns-000.exampledns.net'   │
│    2    │ 'NS' │ 'demo-website.com'                │ 'ns-000.exampledns.co.uk' │
│    3    │ 'NS' │ 'demo-website.com'                │ 'ns-000.exampledns.com'   │
└─────────┴──────┴───────────────────────────────────┴───────────────────────────┘
```

## `tokens`

Manage tokens.

### `create`
This command will create a new token for the specified organization.

```bash
$ less-cli tokens create -o <organizationId> -d <description>
```

#### Parameters

- `-o, --organization <organizationId>`: Your Less organization ID (optional), if omitted, Less will use your personal account ID
- `-d, --description <tokenDescription>`: The description of the token (required).

#### Example:
```bash
$ less-cli tokens create -d "CI-CD"

[less-cli] The token has been successfully created for your organization. Please make sure to copy your token now. You will not have access to it again.
[less-cli] Token secret: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9eyJ0b3Bp
```

---

Do more with Less.  
🇨🇻

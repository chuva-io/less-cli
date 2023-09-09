[![npm version](https://badge.fury.io/js/@chuva.io%2Fless-cli.svg)](https://badge.fury.io/js/@chuva.io%2Fless-cli)

`less-cli` is a CLI tool that allows you to deploy your Less projects to AWS while providing several other tools to facilitate your interaction with Less.

- [Learn about Less](https://chuva-io.notion.site/Less-44d98337e08a46af934364700da05e3a)
- [Less developer documentation](https://chuva-io.notion.site/Developer-documentation-ddbab90913494721b58eca81b3fb7552)

# Commands

## `deploy`

The `deploy` command allows you to deploy your Less project to AWS.

*Note: Before deploying your project make sure to `export` your `LESS_TOKEN`.*

```bash
$ export LESS_TOKEN=your-less-token
$ less-cli deploy <projectName>
```

### Parameters

`<projectName>`  
The name of your Less project.  

*Note: Supports alphanumeric characters and "-".*

```bash
$ export LESS_TOKEN=your-less-token
$ less-cli deploy invoice-microservice
```

---

Do more with Less.  
🇨🇻

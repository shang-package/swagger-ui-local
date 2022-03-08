const prompts = require("prompts");
const commander = require("commander");
const { resolve } = require("path");
const utils = require("./utils");
const constants = require("./constants");

const { program, Option } = commander;

const projectDir = process.cwd();

program
  .addOption(new Option("-P, --prompts", "提示"))
  .addOption(new Option("-s, --stop", "停止后台脚本"))
  .addOption(new Option("-O, --no-open", "不需要打开浏览器"))
  .addOption(new Option("-B, --no-background", "后台运行"))
  .addOption(new Option("-p, --port <port>", "运行端口"))
  .addOption(new Option("-u, --url <url>", "swagger service url"))
  .addOption(new Option("-f, --file <openapi.config.js>", "openapi 配置文件"));

program.parse(process.argv);
const options = program.opts();
prompts.override(options);
console.log(options);

const questions = [
  {
    type: "confirm",
    name: "open",
    message: "是否不需要打开浏览器",
    initial: true,
  },
  {
    type: "confirm",
    name: "background",
    message: "是否后台运行",
    initial: true,
  },
  {
    type: "text",
    name: "port",
    message: "运行端口",
    validate: (v) => {
      if (!v) {
        return "端口未输入";
      }

      if (!/^\d+$/.test(v)) {
        return "端口纯数字";
      }

      const nu = parseInt(v, 10);

      if (nu < 3000) {
        return "端口需要大于等于 3000";
      }

      return true;
    },
  },
  {
    type: "text",
    name: "url",
    message: "swagger service url",
  },
  {
    type: (prev) => {
      if (!prev) {
        return "text";
      }

      return null;
    },
    name: "file",
    message: "openapi 配置文件路径",
    validate: (p) => {
      if (!p) {
        return true;
      }

      const full = resolve(process.cwd(), p);

      if (utils.checkPathIsExist(full)) {
        return true;
      }

      return `${full} 文件不存在`;
    },
  },
];

function requireFile(p = resolve(projectDir, "openapi.config.js")) {
  let openapi;
  try {
    openapi = require(p);
  } catch (e) {}

  return openapi;
}

async function parse() {
  let { stop, open, background, port, url, file } = options;
  if (options.prompts) {
    ({ background, port, url, file } = await prompts(questions, {
      onCancel: () => {
        process.exit();
      },
    }));
  }

  background = background === undefined ? true : background;
  port = port || 23333;

  let json = {};

  if (url) {
    const name = url.replace(/.*group=/, "") || "api-doc";
    json = {
      [name]: url,
    };
  } else {
    const openapi = requireFile(file);

    if (openapi) {
      openapi.forEach((item) => {
        json[item.projectName] = item.schemaPath;
      });
    } else {
      url = url || constants.DefaultUrl;

      const name = url.replace(/.*group=/, "") || "api-doc";
      json = {
        [name]: url,
      };
    }
  }

  return {
    stop,
    open,
    background,
    port,
    config: json,
  };
}

module.exports = parse;

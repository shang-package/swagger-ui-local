const parse = require("./src/parse");
const startServer = require("./src/server");
const daemonize = require("daemonize-process");
const kill = require("tree-kill");
const fs = require("fs");
const path = require("path");
const os = require("os");

const pidPath = path.resolve(os.tmpdir(), "swagger-local.pid");

(async () => {
  const { stop, open, background, port, config } = await parse();

  // 杀死上一次的程序
  try {
    const pid = fs.readFileSync(pidPath, { encoding: "utf8" });
    kill(pid, "SIGKILL");
  } catch (e) {}

  // 如果仅仅是杀死, 返回
  if (stop) {
    return;
  }

  // 后台运行
  if (background) {
    daemonize();
    fs.writeFileSync(pidPath, `${process.pid}`);
  }

  startServer({ open, port, config });
})().catch(console.warn);

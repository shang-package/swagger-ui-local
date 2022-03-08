const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { URL } = require("url");
const path = require("path");
const fs = require("fs");
const openUrl = require("open");

const app = express();

function startServer({ open, port, config }) {
  console.log(config);
  const list = Object.entries(config).map(([name, url]) => {
    const pathName = `/api-docs/${encodeURIComponent(name)}`;
    const u = new URL(url);

    return {
      proxy: [
        pathName,
        createProxyMiddleware({
          target: u.toString(),
          changeOrigin: true,
          pathRewrite: {
            [`^${pathName}`]: "",
          },
        }),
      ],
      font: {
        name: name,
        url: pathName,
        location: pathName,
        swaggerVersion: "2.0",
      },
    };
  });

  // 前端 font
  fs.writeFileSync(
    path.resolve(__dirname, "../font/static/services.json"),
    JSON.stringify(
      list.map(({ font }) => font),
      null,
      2
    )
  );

  // 代理
  list.forEach(({ proxy }) => {
    app.use(...proxy);
  });

  app.get("/", (_req, res) => {
    res.redirect("/doc.html");
  });

  app.use(express.static(path.resolve(__dirname, "../font/")));
  app.listen(port);
  const u = `http://127.0.0.1:${port}`;

  if (open) {
    openUrl(u);
  }
}

module.exports = startServer;

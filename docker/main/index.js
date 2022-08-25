// Copyright (c) Alex Ellis 2021. All rights reserved.
// Copyright (c) OpenFaaS Author(s) 2021. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

"use strict";

const express = require("express");
const app = express();
// const handler = require("./function/handler");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const defaultMaxSize = "100kb"; // body-parser default

app.disable("x-powered-by");

const rawLimit = process.env.MAX_RAW_SIZE || defaultMaxSize;
const jsonLimit = process.env.MAX_JSON_SIZE || defaultMaxSize;

app.use(function addDefaultContentType(req, res, next) {
  // When no content-type is given, the body element is set to
  // nil, and has been a source of contention for new users.

  if (!req.headers["content-type"]) {
    req.headers["content-type"] = "text/plain";
  }
  next();
});

if (process.env.RAW_BODY === "true") {
  app.use(bodyParser.raw({ type: "*/*", limit: rawLimit }));
} else {
  app.use(bodyParser.text({ type: "text/*" }));
  app.use(bodyParser.json({ limit: jsonLimit }));
  app.use(bodyParser.urlencoded({ extended: true }));
}
app.use(cookieParser());

// const middleware = async (req, res) => {
//   Promise.resolve(handler(req, res));
// };

// app.post("/*", middleware);
// app.get("/*", middleware);
// app.patch("/*", middleware);
// app.put("/*", middleware);
// app.delete("/*", middleware);
// app.options("/*", middleware);

const port = process.env.http_port || 3000;

app.listen(port, () => {
  console.log(`node16 listening on port: ${port}`);
});

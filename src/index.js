const express = require("express");
const http = require("http");

const app = express();

const server = http.createServer(app);

server.listen(process.env.PORT, () => {
  console.log(`listening on Port ${process.env.PORT}`);
});

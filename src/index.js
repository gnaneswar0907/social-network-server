const express = require("express");
const http = require("http");
const app = express();
const cors = require("cors");
const server = http.createServer(app);

require("./database/mongoose");

const userRouter = require("./routes/user");
const postRouter = require("./routes/post");

app.use(cors());
app.use(express.json());
app.use(userRouter);
app.use(postRouter);

server.listen(process.env.PORT, () => {
  console.log(`listening on Port ${process.env.PORT}`);
});

const http = require("http");
const express = require("express");
const app = express();
const morgan = require("morgan");
const WebSocket = require("ws");

/*
const fs = require("fs").promises;
const requestListener = (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.writeHead(200);
  const object = {
    message: "Hello"
  };
  res.end(JSON.stringify(object));
};

const requestListener = async (req, res) => {
  console.log(req.url);
  if (req.url !== '/') {
    res.writeHead(404);
    res.end();
    return;
  }
  const data = await fs.readFile(__dirname + "/index.html");
  res.setHeader("Content-Type", "text/html");
  res.writeHead(200);
  res.end(data);
}
*/
const server = http.createServer(requestListener);
const wss = WebSocket.Server({ server });

app.use(morgan("combined"));
app.use(express.static("."));

const clients = [];
wss.on("connection", (ws) => {
  console.log("Client connected");
  uniqueId++;
  clients.push(ws);
  ws.send(`Your id is ${uniqueId}`);
  ws.on("message", (msg) => {
    console.log(`Message received from client: ${msg}`);
    ws.send("Response from server");
  })
})

app.get("/pml30", (req, res) => {
  res.send("Hello World!");
})

const host = "loclhost";
const port = 8002;
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
})
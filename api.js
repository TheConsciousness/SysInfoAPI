const port = process.env.SYSINFOAPI_PORT || 1337;
const express = require('express');
const https = require('https');
const fs = require('fs');
const PC = require("./classes/PC");

const app = express();
const currentPC = new PC();


app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.header('Access-Control-Allow-Origin', '*');
    res.send("<a href=/cpu>CPU</a><br/><a href=/memory>Memory</a><br/><a href=/hdd>HDDs</a><br/><a href=/all>All</a>");
});
app.get('/memory', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.header('Access-Control-Allow-Origin', '*');
    res.send(JSON.stringify(currentPC.getMemory(true), null, 2));
});
app.get('/cpu', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.header('Access-Control-Allow-Origin', '*');
    res.send(JSON.stringify(await currentPC.getCPU(true), null, 2));
});
app.get('/hdd', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.header('Access-Control-Allow-Origin', '*');
    res.send(JSON.stringify(await currentPC.getHDDs(true), null, 2));
});
app.get('/all', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.header('Access-Control-Allow-Origin', '*');
    res.send(JSON.stringify(await currentPC.getAll(), null, 2));
});
app.get('/current', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.header('Access-Control-Allow-Origin', '*');
    res.send(JSON.stringify(currentPC, null, 2));
});

const options = {
  key: fs.readFileSync('api_cert.key'),
  cert: fs.readFileSync('api_cert.cert'),
};

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.status(404).send("Not found.");
  });

const server = https.createServer(options, app);

server.listen(port, () => {
  console.log(`Server is running on https://localhost:${port}`);
});
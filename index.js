const express = require('express');
const app = express();
const os = require("os");

app.get('/', (req,res)=> {
    console.log(req.socket);
    res.send("hello");
});

app.get('/memory', (req,res)=> {
    //const output = '{"Memory": ["Free": '+os.freemem()+'],["Total": '+os.totalmem()+']}';
    var output = [];
    output.push({"Free":os.freemem()});
    output.push({"Total":os.totalmem()});
    res.setHeader('content-type', 'application/json');
    res.send(output);
});

const server = app.listen(8081, ()=> {
    const host = server.address().address;
    const port = server.address().port;
    console.log("Server is listening at: " + host + ":" + port);
});
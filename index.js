const port = process.env.SYSINFOAPI_PORT || 1337;
const http = require('http');
const fs = require('fs');
const PC = require("./classes/PC");

http.createServer(async (req,res)=> {
    const currentPC = new PC();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    let faviconPath = require('path').join(__dirname, 'favicon.ico');

    switch (req.url) {
        case "/":
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end("<a href=/cpu>CPU</a><br/><a href=/memory>Memory</a><br/><a href=/all>All</a>");
            break;
        case "/favicon.ico":
            res.setHeader('Content-Type', 'image/x-icon');
            fs.readFile(faviconPath, (err, data) => {
                if (err) {
                    res.statusCode = 500;
                    res.end('Error reading favicon.ico');
                } else {
                    res.end(data);
                }
            })
            break;
        case "/memory":
            res.end(JSON.stringify(currentPC.getMemory(true), null, 2));
            break;
        case "/cpu":
            res.end(JSON.stringify(await currentPC.getCPU(true), null, 2));
            break;
        case "/hdd":
            res.end(JSON.stringify(await currentPC.getHDDs(true), null, 2));
            break;
        case "/all":
            res.end(JSON.stringify(await currentPC.getAll(), null, 2));
            break;
        default:
            res.setHeader('Content-Type', 'text/html');
            res.statusCode = 404;
            res.end("<span style=font-size:50vw;>404!</span>");
            break;
    }
    
}).listen(port);
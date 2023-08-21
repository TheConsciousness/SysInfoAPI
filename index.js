const port = process.env.SYSINFOAPI_PORT || 1337;
const http = require('http');
const fs = require('fs');
const PC = require("./classes/PC");

http.createServer(async (req,res)=> {
    const currentPC = new PC();

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;

    switch (req.url) {
        case "/":
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end("<a href=/cpu>CPU</a><br/><a href=/memory>Memory</a><br/><a href=/all>All</a>");
            break;
        case "/favicon.ico":
            res.setHeader('Content-Type', 'image/x-icon');
            const faviconPath = require('path').join(__dirname, 'favicon.ico');

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
            res.end(JSON.stringify(currentPC.freshMemory(), null, 2));
            break;
        case "/cpu":
            res.end(JSON.stringify(await currentPC.freshCPU(), null, 2));
            break;
        case "/hdd":
            res.end(JSON.stringify(await currentPC.freshHDDs(), null, 2));
            break;
        case "/all":
            res.end(JSON.stringify(await currentPC.allStats(), null, 2));
            break;
        default:
            res.setHeader('Content-Type', 'text/plain');
            res.statusCode = 404;
            res.end("404");
            break;
    }
    
}).listen(port);
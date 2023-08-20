const port = process.env.PORT || 6420;
const http = require('http');
const os = require('os');
const fs = require('fs');
const util = require('util');
const exec = require("child_process").exec;

var memObject = {};
var cpuObject = {};
cpuObject.CPU = {};

const execa = util.promisify(exec);

http.createServer(async (req,res)=> {

    function getMemory() {
        memObject.Memory = {};
        memObject.Memory.Free = os.freemem();
        memObject.Memory.Total = os.totalmem();
        memObject.Memory.PercentUsed = Math.round((os.freemem()/os.totalmem())*100) + "%";
        return memObject;
    }
    async function asyncGetCPU() {
        try {
            const output = await execa('top -l 1 | grep -E "^CPU"');
            //console.log(JSON.stringify(output.stdout));
    
            res.statusCode = 200;
            let splittin = output.stdout.split(':');
            splittin = splittin[1].split(",");
    
            cpuObject.CPU.User = splittin[0].replace(" user", "").trim();
            cpuObject.CPU.System = splittin[1].replace(" sys", "").trim();
            cpuObject.CPU.Used = Math.round((parseFloat(cpuObject.CPU.User) + parseFloat(cpuObject.CPU.System))) + "%";
            cpuObject.CPU.Free = splittin[2].replace(" idle \n", "").trim();
    
            //console.log(cpuObject);
            return cpuObject
        }
        catch (err) {
            console.log(`Catch: ${err}`);
            res.statusCode = 500;
            res.end(`${err}`);
        }
    }

    if (req.url === "/memory") {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        getMemory();
        res.end(JSON.stringify(memObject, null, 2));
    }
    else if (req.url === "/cpu") {
        res.setHeader('Content-Type', 'application/json');
        asyncGetCPU().then((data)=>{
            res.end(JSON.stringify(data, null, 2));
        });
        
    }
    else if (req.url === "/") {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.statusCode = 200;
        res.end("<a href=/cpu>CPU</a><br/><a href=/memory>Memory</a>");
    }
    else if (req.url === "/favicon.ico") {
        res.end("");
    }
    else if (req.url === "/both") {
        asyncGetCPU().then((data)=>{
            getMemory();
            let bothObject = {...data, ...memObject};
            //console.log(bothObject);
            res.end(JSON.stringify(bothObject, null, 2));
        });
    }
}).listen(port);
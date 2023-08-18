const port = process.env.PORT || 6420;
const http = require('http');
const os = require('os');
const { memoryUsage } = require('process');

var memObject = {};
var cpuObject = {};
cpuObject.CPU = {};

http.createServer((req,res)=> {

    function getMemory() {
        memObject.Memory = {};
        memObject.Memory.Free = os.freemem();
        memObject.Memory.Total = os.totalmem();
        memObject.Memory.Percentage = Math.round((os.freemem()/os.totalmem())*100);
    }
    async function getCPU () {
        const { exec } = require("child_process");
        
        try {
            await exec('top -l 1 | grep -E "^CPU"', (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    res.statusCode = 500;
                    res.end(`${error.message}`);
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    res.statusCode = 500;
                    res.end(`${stderr}`);
                    return;
                }
                res.statusCode = 200;

                let splittin = stdout.split(':');
                splittin = splittin[1].split(",");

                cpuObject.CPU.User = splittin[0].replace(" user", "").trim();
                cpuObject.CPU.System = splittin[1].replace(" sys", "").trim();
                cpuObject.CPU.Used = Math.round((parseFloat(cpuObject.CPU.User) + parseFloat(cpuObject.CPU.System))) + "%";
                cpuObject.CPU.Free = splittin[2].replace(" idle \n", "").trim();
                return cpuObject;
                //console.log(cpuObject);
            })
        } catch (err) {
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
        getCPU().then(() => {
            res.end(JSON.stringify(cpuObject, null, 2));
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
        getCPU().then(()=>{
            getMemory();
            let bothObject = {...cpuObject, ...memObject};
            //console.log(bothObject);
            res.end(JSON.stringify(bothObject, null, 2));
        });
    }
}).listen(port);
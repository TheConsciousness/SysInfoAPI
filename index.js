const port = process.env.PORT || 6420;
const http = require('http');
const os = require('os');
const { memoryUsage } = require('process');

var memObject = {};
var cpuOutput = {};
cpuOutput.CPU = {};

http.createServer((req,res)=> {

    function getMemory() {
        memObject.Memory = {};
        memObject.Memory.Free = os.freemem();
        memObject.Memory.Total = os.totalmem();
        memObject.Memory.Percentage = Math.round((os.freemem()/os.totalmem())*100);
    }
    function getCPU() {

    }

    if (req.url === "/memory") {
        
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        getMemory();
        res.end(JSON.stringify(memObject, null, 2));
    }
    else if (req.url === "/cpu") {
        
        res.setHeader('Content-Type', 'application/json');

        /* cpuObject = {};
        cpuObject.CPU = {};
        //cpuObject.CPU.What = os.cpus();

        os.cpus().forEach(cpu => {
            ourTimes = Object.values(cpu.times).reduce((a, b) => a + b, 0);
            console.log(ourTimes);
        });

        const usage = process.cpuUsage();
        const currentCPUUsage = (usage.user + usage.system) * 1000;
        // Find out the percentage used for this specific CPU
        const perc = currentCPUUsage / ourTimes[0] * 100;
        console.log(usage); */

        getCPU();        
        const { exec } = require("child_process");
        exec('top -l 1 | grep -E "^CPU"', (error, stdout, stderr) => {
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

            cpuOutput.CPU.User = splittin[0].replace(" user", "").trim();
            cpuOutput.CPU.System = splittin[1].replace(" sys", "").trim();
            cpuOutput.CPU.Used = (parseFloat(cpuOutput.CPU.User) + parseFloat(cpuOutput.CPU.System)) + "%";
            cpuOutput.CPU.Free = splittin[2].replace(" idle \n", "").trim();
            console.log(cpuOutput);
        });

        console.log(cpuOutput);
        res.end(JSON.stringify(cpuOutput, null, 2));
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
        fetch("http://127.0.0.1:6420/cpu")
        .then((response) => response.text())
        .then((body) => {
            res.end(body);
        });
    }
}).listen(port);
const port = process.env.SYSINFOAPI_PORT || 6420;
const http = require('http');
const os = require('os');
const fs = require('fs');
const util = require('util');
const exec = require("child_process").exec;
const nodeDiskInfo = require('node-disk-info');

var hddObject = {};
var allObject = {};
var memObject = {};
var cpuObject = {};

cpuObject.CPU = {};

const execa = util.promisify(exec);

http.createServer(async (req,res)=> {

    function getMemory() {
        memObject.Memory = {};
        memObject.Memory.Free = formatBytes(os.freemem());
        memObject.Memory.Total = formatBytes(os.totalmem());
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
            return err;
        }
    }
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    // ------ Routes ------
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
        res.end("<a href=/cpu>CPU</a><br/><a href=/memory>Memory</a><br/><a href=/both>Both</a>");
    }
    else if (req.url === "/favicon.ico") {
        res.statusCode = 404;
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
    else if (req.url === "/hdd") {
        nodeDiskInfo.getDiskInfo()
        .then(disks => {
            hddObject.HDDs = disks;
            res.end(JSON.stringify(hddObject, null, 2));
        })
        .catch(reason => {
            res.end(JSON.stringify(reason, null, 2));
        });
    }
    else if (req.url === "/test") {
        asyncGetCPU().then((data)=>{
            getMemory();
            allObject = {...data, ...memObject};
            return nodeDiskInfo.getDiskInfo();
        }).then(disks => {

            const newDisks = disks.map(disk => {
                return {
                    ...disk,
                    _available: formatBytes(disk._available),
                    _blocks: formatBytes(disk._blocks),
                    _used: formatBytes(disk._used)
                };
            });

            hddObject.HDDs = newDisks;
            allObject = {...allObject, ...hddObject};
            res.end(JSON.stringify(allObject, null, 2));
        })
    }
}).listen(port);
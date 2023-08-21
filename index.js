const port = process.env.SYSINFOAPI_PORT || 6420;
const http = require('http');
const os = require('os');
const fs = require('fs');
const util = require('util');
const exec = require("child_process").exec;
const nodeDiskInfo = require('node-disk-info');
const path = require('path');

const execa = util.promisify(exec);

var hddObject = {};
var allObject = {};
var memObject = {};
var cpuObject = {};

cpuObject.CPU = {};

const getMemory = () => {
    memObject.Memory = {};
    memObject.Memory.Free = formatBytes(os.freemem());
    memObject.Memory.Total = formatBytes(os.totalmem());
    memObject.Memory.PercentUsed = Math.round((os.freemem()/os.totalmem())*100) + "%";
    return memObject;
}
const asyncGetCPU = async () => {
    try {
        const output = await execa('top -l 1 | grep -E "^CPU"');
        let splittin = output.stdout.split(':');
        splittin = splittin[1].split(",");

        cpuObject.CPU.User = splittin[0].replace(" user", "").trim();
        cpuObject.CPU.System = splittin[1].replace(" sys", "").trim();
        cpuObject.CPU.Used = Math.round((parseFloat(cpuObject.CPU.User) + parseFloat(cpuObject.CPU.System))) + "%";
        cpuObject.CPU.Free = splittin[2].replace(" idle \n", "").trim();

        return cpuObject
    }
    catch (err) {
        console.log(`Catch: ${err}`);
        return err;
    }
}
const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

http.createServer(async (req,res)=> {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    
    if (req.url === "/memory") {
        getMemory();
        res.end(JSON.stringify(memObject, null, 2));
    }
    else if (req.url === "/cpu") {
        const cpuData = await asyncGetCPU();
        res.end(JSON.stringify(cpuData, null, 2));
    }
    else if (req.url === "/") {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end("<a href=/cpu>CPU</a><br/><a href=/memory>Memory</a><br/><a href=/all>All</a>");
    }

    else if (req.url === "/favicon.ico") {
        res.setHeader('Content-Type', 'image/x-icon');
        const faviconPath = path.join(__dirname, 'favicon.ico');

        fs.readFile(faviconPath, (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.end('Error reading favicon.ico');
            } else {
                res.end(data);
            }
        })
    }

    else if (req.url === "/all") {
        const [cpuData, hddData] = await Promise.all([asyncGetCPU(), nodeDiskInfo.getDiskInfo()]);
        
        allObject = {
            ...cpuData,
            ...getMemory(),
            HDDs: hddData.map(disk => {
                return {
                    ...disk,
                    _available: formatBytes(disk._available),
                    _blocks: formatBytes(disk._blocks),
                    _used: formatBytes(disk._used)
                }
            })
        //  }).slice(0,-1) // Use this is the last value is garbage
        };
        res.end(JSON.stringify(allObject, null, 2));
    }

    else if (req.url === "/hdd") {
        const disks = await nodeDiskInfo.getDiskInfo();

        hddObject = {
            HDDs: disks.map(disk => {
                return {
                    ...disk,
                    _available: formatBytes(disk._available),
                    _blocks: formatBytes(disk._blocks),
                    _used: formatBytes(disk._used)
                }
            })
        }
        res.end(JSON.stringify(hddObject, null, 2));
    }

    else if (req.url === "/test") {
        const [cpuData, hddData] = await Promise.all([asyncGetCPU(), nodeDiskInfo.getDiskInfo()]);

        allObject = {
            ...cpuData,
            ...getMemory(), 
            HDDs: hddData.map(disk => {
                return {
                    ...disk,
                    _available: formatBytes(disk._available),
                    _blocks: formatBytes(disk._blocks),
                    _used: formatBytes(disk._used)
                }
            })
        };
        res.end(JSON.stringify(allObject, null, 2));
    }
}).listen(port);
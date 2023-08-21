const port = process.env.SYSINFOAPI_PORT || 6420;
const http = require('http');
const os = require('os');
const fs = require('fs');
const nodeDiskInfo = require('node-disk-info');
const { memoryUsage } = require('process');

class PC {
    Hostname = "";
    HDDs = {};
    Memory = {};
    CPU = {};
    constructor(name) {
        this.Hostname = name;
    }
    freshCPU() {

    }
    freshHDDs() {

    }
    freshMemory() {
        try {
            this.Memory.Free = formatBytes(os.freemem());
            this.Memory.Total = formatBytes(os.totalmem());
            this.Memory.PercentUsed = Math.round((os.freemem()/os.totalmem())*100) + "%";
            return this.Memory;
        } catch (err) {
            console.log(`PC.freshMemory(): ${err}`);
            this.Memory = err.message;
            return this.Memory;
        }
    }
}

var hddObject = {};
var allObject = {};
var memObject = {};
var cpuObject = {};

cpuObject[os.hostname()] = {};
memObject[os.hostname()] = {};
hddObject[os.hostname()] = {};

cpuObject[os.hostname()].CPU = {};
memObject[os.hostname()].Memory = {};
hddObject[os.hostname()].HDDs = {};

const getMemory = () => {
    try {
        //throw new Error('Couldnt retrieve memory stats.');
        memObject[os.hostname()].Memory = {};
        memObject[os.hostname()].Memory.Free = formatBytes(os.freemem());
        memObject[os.hostname()].Memory.Total = formatBytes(os.totalmem());
        memObject[os.hostname()].Memory.PercentUsed = Math.round((os.freemem()/os.totalmem())*100) + "%";

        return memObject;
    } catch (err) {
        console.log(`Catch: ${err}`);
        memObject[os.hostname()].Memory = err.message;
        return memObject;
    }
    
}
const asyncGetCPU = async () => {
    try {
        //throw new Error('Couldnt retrieve CPU stats.');
        const { stdout } = await require('util').promisify(require('child_process').exec)('top -l 1 | grep -E "^CPU"');
        let splittin = stdout.split(':');
        splittin = splittin[1].split(",");

        cpuObject[os.hostname()].CPU.User = splittin[0].replace(" user", "").trim();
        cpuObject[os.hostname()].CPU.System = splittin[1].replace(" sys", "").trim();
        cpuObject[os.hostname()].CPU.Used = Math.round((parseFloat(cpuObject[os.hostname()].CPU.User) + parseFloat(cpuObject[os.hostname()].CPU.System))) + "%";
        cpuObject[os.hostname()].CPU.Free = splittin[2].replace(" idle \n", "").trim();

        return cpuObject
    }
    catch (err) {
        console.log(`Catch: ${err}`);
        cpuObject[os.hostname()].CPU = err.message;
        return cpuObject;
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

    if (req.url === "/") {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end("<a href=/cpu>CPU</a><br/><a href=/memory>Memory</a><br/><a href=/all>All</a>");
    }
    else if (req.url === "/favicon.ico") {
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
    }
    else if (req.url === "/memory") {
        const memData = getMemory();
        res.end(JSON.stringify(memData, null, 2));
    }

    else if (req.url === "/cpu") {
        const cpuData = await asyncGetCPU();
        res.end(JSON.stringify(cpuData, null, 2));
    }

    else if (req.url === "/hdd") {
        try {
            const disks = await nodeDiskInfo.getDiskInfo();
            hddObject = {
                [os.hostname()]:{
                HDDs: disks.map(disk => {
                    return {
                        ...disk,
                        _available: formatBytes(disk._available),
                        _blocks: formatBytes(disk._blocks),
                        _used: formatBytes(disk._used)
                    }
                })
            }}
        } catch (error) {
            hddObject[os.hostname()].HDDs = error.message;
        }
        res.end(JSON.stringify(hddObject, null, 2));
    }

    else if (req.url === "/all") {
        try {
            const [cpuData, hddData] = await Promise.all([asyncGetCPU(), nodeDiskInfo.getDiskInfo()]);
            const memData = getMemory();
            allObject = {
                [os.hostname()]:{
                    ...cpuData[os.hostname()],
                    ...memData[os.hostname()],
                    HDDs: hddData.map(disk => {
                        return {
                            ...disk,
                            _available: formatBytes(disk._available),
                            _blocks: formatBytes(disk._blocks),
                            _used: formatBytes(disk._used)
                        }
                    })
                //  }).slice(0,-1) // Use this is the last value is garbage
            }}
        } catch (error) {
            allObject[os.hostname()] = error.message;
        }
        res.end(JSON.stringify(allObject, null, 2));
    }

    
}).listen(port);
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
    async freshCPU() {
        try {
            //throw new Error('Couldnt retrieve CPU stats.');
            const { stdout } = await require('util').promisify(require('child_process').exec)('top -l 1 | grep -E "^CPU"');
            let splittin = stdout.split(':');
            splittin = splittin[1].split(",");

            this.CPU.User = splittin[0].replace(" user", "").trim();
            this.CPU.System = splittin[1].replace(" sys", "").trim();
            this.CPU.Used = Math.round((parseFloat(this.CPU.User) + parseFloat(this.CPU.System))) + "%";
            this.CPU.Free = splittin[2].replace(" idle \n", "").trim();
            this.CPU.LastRefresh = formatDate(Date.now());

            return {CPU: this.CPU};
        }
        catch (err) {
            console.log(`Catch: ${err}`);
            this.CPU = err.message;
            return {CPU: this.CPU};
        }
    }
    async freshHDDs() {
        try {
            const disks = await nodeDiskInfo.getDiskInfo();
            this.HDDs = 
                {
                HDDs: disks.map(disk => {
                    return {
                        ...disk,
                        _available: formatBytes(disk._available),
                        _blocks: formatBytes(disk._blocks),
                        _used: formatBytes(disk._used)
                    }
                }),
                LastRefresh: formatDate(Date.now())
            }
            return this.HDDs;
        } catch (err) {
            console.log(`PC.freshHDDs(): ${err}`);
            this.HDDs = err.message;
            return this.HDDs;
        }
    }
    freshMemory() {
        try {
            this.Memory.Free = formatBytes(os.freemem());
            this.Memory.Total = formatBytes(os.totalmem());
            this.Memory.PercentUsed = Math.round((os.freemem()/os.totalmem())*100) + "%";
            this.Memory.LastRefresh = formatDate(Date.now());
            return {Memory: this.Memory};
        } catch (err) {
            console.log(`PC.freshMemory(): ${err}`);
            this.Memory = err.message;
            return {Memory: this.Memory};
        }
    }
    async allStats() {
        try {
            //throw new Error("CPU");
            var cpuData = await this.freshCPU();
        } catch (cpuerr) {
            var cpuData = {CPUs:cpuerr.message};
        }
        try {
            //throw new Error("HDD");
            var hddData = {};
            hddData.HDDs = await nodeDiskInfo.getDiskInfo();
            hddData.HDDs.push({LastRefresh: formatDate(Date.now())});
        } catch (hdderr) {
            var hddData = {HDDs:hdderr.message,
                LastRefresh: formatDate(Date.now())};
        }

        try {
            var memData = await this.freshMemory();
            //throw new Error("Memory");
        } catch (memerr) {
            memData = {Memory:memerr.message};
        }

        try {
            throw new Error("All error!");
            allObject = {
                [os.hostname()]:{
                    ...cpuData,
                    ...memData,
                    ...hddData
                    
                //  }).slice(0,-1) // Use this is the last value is garbage
            }}
        } catch (error) {
            allObject[os.hostname()] = error.message;
        }
        return allObject;
    }
}


const currentPC = new PC();

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

const asyncGetCPU = async () => {
    
}
const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const formattedMonth = String(date.getMonth() + 1).padStart(2, '0');
    const formattedDay = String(date.getDate()).padStart(2, '0');
    const formattedYear = String(date.getFullYear() % 100).padStart(2, '0');
    const formattedHours = String(date.getHours()).padStart(2, '0');
    const formattedMinutes = String(date.getMinutes()).padStart(2, '0');
    const formattedSeconds = String(date.getSeconds()).padStart(2, '0');
    return `${formattedMonth}/${formattedDay}/${formattedYear} ${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
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
        res.end(JSON.stringify(currentPC.freshMemory(), null, 2));
    }

    else if (req.url === "/cpu") {
        res.end(JSON.stringify(await currentPC.freshCPU(), null, 2));
    }

    else if (req.url === "/hdd") {
        res.end(JSON.stringify(await currentPC.freshHDDs(), null, 2));
    }

    else if (req.url === "/all") {
        res.end(JSON.stringify(await currentPC.allStats(), null, 2));
    }

    
}).listen(port);
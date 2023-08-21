const os = require('os');
const nodeDiskInfo = require('node-disk-info');
const { memoryUsage } = require('process');

const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

class PC {
    
    allObject = {};
    Hostname = "";
    HDDs = {};
    Memory = {};
    CPU = {};

    constructor(name) {
        this.Hostname = os.hostname();
    }
    async getCPU() {
        this.CPU = {};
        try {
            //throw new Error('Couldnt retrieve CPU stats.');
            const { stdout } = await require('util').promisify(require('child_process').exec)('top -l 1 | grep -E "^CPU"');
            let splittin = stdout.split(':');
            splittin = splittin[1].split(",");

            this.CPU.User = splittin[0].replace(" user", "").trim();
            this.CPU.System = splittin[1].replace(" sys", "").trim();
            this.CPU.Used = Math.round((parseFloat(this.CPU.User) + parseFloat(this.CPU.System))) + "%";
            this.CPU.Free = splittin[2].replace(" idle \n", "").trim();

            return this.CPU;
        }
        catch (err) {
            console.log(`PC.freshCPU(): ${err}`);
            this.CPU = err.message;
            return this.CPU;
        }
    }
    async getHDDs() {
        this.HDDs = {};
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
                })
            }
            return this.HDDs;
        } catch (err) {
            console.log(`PC.freshHDDs(): ${err}`);
            this.HDDs = err.message;
            return this.HDDs;
        }
    }
    getMemory() {
        try {
            this.Memory = {};
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
    async getAll() {
        try {
            //throw new Error("CPU");
            this.CPU = {CPU: await this.getCPU()};
        } catch (cpuerr) {
            this.CPU = {CPU: cpuerr.message};
        }
        try {
            //throw new Error("HDD");
            this.HDDs = {HDDs: await nodeDiskInfo.getDiskInfo()};
        } catch (hdderr) {
            this.HDDs = {HDDs: hdderr.message};
        }

        try {
            this.Memory = {Memory: this.getMemory()};
            //throw new Error("Memory");
        } catch (memerr) {
            this.Memory = {Memory: memerr.message};
        }

        try {
            //throw new Error("All error!");
            this.allObject = {
                [os.hostname()]:{
                    ...this.CPU,
                    ...this.Memory,
                    ...this.HDDs
                //  }).slice(0,-1) // Use this is the last value is garbage
            }}
        } catch (error) {
            this.allObject[os.hostname()] = error.message;
        }
        return this.allObject;
    }
}

module.exports = PC;
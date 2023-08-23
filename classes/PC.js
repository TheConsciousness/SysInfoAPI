const os = require('os');
const nodeDiskInfo = require('node-disk-info');

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

    cpuData = {};
    hddData = {};
    memData = {};

    constructor() {
        this.Hostname = os.hostname();
    }
    async getCPU(withPCName=false) {
        this.CPU = {};
        try {
            //throw new Error('Couldnt retrieve CPU stats.');
            const { stdout } = await require('util').promisify(require('child_process').exec)('sudo top -l 1 | grep -E "^CPU"');
            let splittin = stdout.split(':');
            splittin = splittin[1].split(",");

            this.CPU.User = splittin[0].replace(" user", "").trim();
            this.CPU.System = splittin[1].replace(" sys", "").trim();
            this.CPU.Used = Math.round((parseFloat(this.CPU.User) + parseFloat(this.CPU.System))) + "%";
            this.CPU.Free = splittin[2].replace(" idle \n", "").trim();

            if (withPCName) return {[this.Hostname]:{CPU:this.CPU}}
            return {CPU:this.CPU};
        }
        catch (err) {
            console.error(`PC.freshCPU(): ${err}`);
            this.CPU = err.message;
            return this.CPU;
        }
    }
    async getHDDs(withPCName=false) {
        this.HDDs = {};
        try {
            const disks = await nodeDiskInfo.getDiskInfo();
            this.HDDs = 
                disks.map(disk => {
                    return {
                        ...disk,
                        _available: formatBytes(disk._available),
                        _blocks: formatBytes(disk._blocks),
                        _used: formatBytes(disk._used)
                    }
                }).slice(0,-1);
            
            if (withPCName) return {[this.Hostname]:{HDDs:this.HDDs}}
            
            return {HDDs:this.HDDs};
        } catch (err) {
            console.error(`PC.freshHDDs(): ${err}`);
            return {HDDs:err.message};
        }
    }
    getMemory(withPCName=false) {
        try {
            this.Memory = {};
            this.Memory.Free = formatBytes(os.freemem());
            this.Memory.Total = formatBytes(os.totalmem());
            this.Memory.PercentUsed = Math.round((os.freemem()/os.totalmem())*100) + "%";
            if (withPCName) return {[this.Hostname]:{Memory:this.Memory}};
            return {Memory:this.Memory};
        } catch (err) {
            console.error(`PC.freshMemory(): ${err}`);
            return {Memory:err.message};
        }
    }
    async getAll() {

        try {
            //throw new Error("CPU");
            this.cpuData = await this.getCPU();
        } catch (cpuerr) {
            this.cpuData = {CPU: cpuerr.message};
        }
        try {
            //throw new Error("HDD");
            this.hddData = await this.getHDDs();
        } catch (hdderr) {
            this.hddData = {HDDs: hdderr.message};
        }

        try {
            this.memData = this.getMemory();
            //throw new Error("Memory");
        } catch (memerr) {
            this.memData = {Memory: memerr.message};
        }

        try {
            //throw new Error("All error!");
            this.allObject = {
                [os.hostname()]:{
                    ...this.cpuData,
                    ...this.memData,
                    ...this.hddData
                //  }).slice(0,-1) // Use this is the last value is garbage
            }}
        } catch (error) {
            this.allObject[os.hostname()] = error.message;
        }
        return this.allObject;
    }
}

module.exports = PC;
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
//Create function to get CPU information
function cpuAverage() {

    //Initialise sum of idle and time of cores and fetch CPU info
    var totalIdle = 0, totalTick = 0;
    var cpus = os.cpus();
  
    //Loop through CPU cores
    for (var i = 0, len = cpus.length; i < len; i++) {
  
      //Select CPU core
      var cpu = cpus[i];
  
      //Total up the time in the cores tick
      for (var type in cpu.times) {
        totalTick += cpu.times[type];
      }
  
      //Total up the idle time of the core
      totalIdle += cpu.times.idle;
    }
  
    //Return the average Idle and Tick times
    return {idle: totalIdle / cpus.length, total: totalTick / cpus.length};
  }
  
  // function to calculate average of array
  const arrAvg = function (arr) {
    if (arr && arr.length >= 1) {
      const sumArr = arr.reduce((a, b) => a + b, 0)
      return sumArr / arr.length;
    }
  };
  
  // load average for the past 1000 milliseconds calculated every 100
  function getCPULoadAVG(avgTime = 1000, delay = 100) {
    return new Promise((resolve, reject) => {
      const n = ~~(avgTime / delay);
      if (n <= 1) {
        reject(new Error('Interval too small!'));
      }
  
      let i = 0;
      let samples = [];
      const avg1 = cpuAverage();
  
      let interval = setInterval(() => {
        if (i >= n) {
          clearInterval(interval);
          resolve(~~((arrAvg(samples) * 100)));
        }
  
        const avg2 = cpuAverage();
        const totalDiff = avg2.total - avg1.total;
        const idleDiff = avg2.idle - avg1.idle;
  
        samples[i] = (1 - idleDiff / totalDiff);
        i++;
      }, delay);
    });
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
            var cpuLoad = await getCPULoadAVG(1000,100);
            if (withPCName) {
                this.CPU = {[this.Hostname]:{CPU:{Used: cpuLoad+"%"}}};
            } else {
                this.CPU = {CPU:{Used: cpuLoad+"%"}};
            }
            //throw new Error("Failed CPU try statement!");
        } catch (err) {
            console.error(`PC.getCPU(): ${err.message}`);
            if (withPCName) {
                this.CPU = {[this.Hostname]:{CPU:{Error: err.message}}};
            } else {
                this.CPU = {CPU:{Error: err.message}};
            }
        }
        return this.CPU;
    }
    async getHDDs(withPCName=false) {
        this.HDDs = {};
        try {
            const disks = await nodeDiskInfo.getDiskInfo();
            const mappedDisks = 
                disks.map(disk => {
                    return {
                        ...disk,
                        _available: formatBytes(disk._available),
                        _blocks: formatBytes(disk._blocks),
                        _used: formatBytes(disk._used)
                    }
                }).slice(0,-1);
                
            if (withPCName) {
                this.HDDs = {[this.Hostname]:{HDDs:mappedDisks}}
            } else {
                this.HDDs = {HDDs:mappedDisks};
            }

        } catch (err) {
            console.error(`PC.getHDDs(): ${err.message}`);
            if (withPCName) {
                this.HDDs = {[this.Hostname]:{HDDs:err.message}};
            } else {
                this.HDDs = {HDDs:err.message};
            }
        }

        //throw new Error("Failed HDD try statement!");
        return this.HDDs;
    }
    getMemory(withPCName=false) {
        this.memItem = {};

        try {
            const freeMemory = os.freemem();
            const totalMemory = os.totalmem();

            if (withPCName) {
                this.memItem[this.Hostname] = {};
                this.memItem[this.Hostname].Memory = {};
                this.memItem[this.Hostname].Memory.Free = formatBytes(freeMemory);
                this.memItem[this.Hostname].Memory.Total = formatBytes(totalMemory);
                this.memItem[this.Hostname].Memory.PercentUsed = Math.round((freeMemory/totalMemory)*100) + "%";
            } else {
                this.memItem.Memory = {};
                this.memItem.Memory.Free = formatBytes(freeMemory);
                this.memItem.Memory.Total = formatBytes(totalMemory);
                this.memItem.Memory.PercentUsed = Math.round((freeMemory/totalMemory)*100) + "%";
            }
            return this.memItem;

        } catch (err) {
            console.error(`PC.getMemory(): ${err.message}`);
            if (withPCName) {
                this.Memory[this.Hostname] = err.message;
            } else {
                this.Memory = err.message;
            }
        }
        return this.Memory;
    }
    async getAll() {
        try {
            //throw new Error("CPU");
            this.cpuData = await this.getCPU(false);
        } catch (cpuerr) {
            this.cpuData = {CPU: cpuerr.message};
        }
        try {
            //throw new Error("HDD");
            this.hddData = await this.getHDDs(false);
        } catch (hdderr) {
            this.hddData = {HDDs: hdderr.message};
        }

        try {
            //throw new Error("Memory");
            this.memData = this.getMemory(false);
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
                //  }).slice(0,-1) // Use this if the last value is garbage
            }}
        } catch (error) {
            this.allObject[os.hostname()] = error.message;
        }
        return this.allObject;
    }
}

module.exports = PC;
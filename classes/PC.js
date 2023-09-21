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
    //allObject = {};
    Hostname = "";
    HDDs = {};
    Memory = {};
    CPU = {};

    constructor() {
        this.Hostname = os.hostname();
    }

    async getCPU() {
        this.CPU = {};
        this.CPU.Used = "";

        try {
            var cpuLoad = await getCPULoadAVG(1000,100);
            this.CPU.Used = cpuLoad + "%";

            //throw new Error("Failed CPU try statement!");

        } catch (err) {
            console.error(`PC.getCPU(): ${err.message}`);
            this.CPU = {"Error": err.message};
        }
        return this.CPU;
    }
    async getHDDs() {
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
                })
            //throw new Error("Failed HDD try statement!");

        } catch (err) {
            console.error(`PC.getHDDs(): ${err.message}`);
            this.HDDs = {"Error": err.message};
        }
        return this.HDDs;
    }
    getMemory() {

        try {
            const freeMemory = parseInt(os.freemem());
            const totalMemory = parseInt(os.totalmem());
			const usedMemory = totalMemory - freeMemory;

            this.Memory = {};
            this.Memory.Free = formatBytes(freeMemory);
            this.Memory.Used = formatBytes(usedMemory);
            this.Memory.Total = formatBytes(totalMemory);
            this.Memory.PercentUsed = Math.round((usedMemory/totalMemory)*100)+"%";

            //throw new Error("Failed Memory try statement!");

        } catch (err) {
            console.error(`PC.getMemory(): ${err.message}`);
            this.Memory = {"Error": err.message};
        }
        return this.Memory;
    }
    async getAll() {
        try {
            //throw new Error("Test CPU Error");
            this.CPU = await this.getCPU(false);
        } catch (cpuerr) {
            this.CPU = {"Error": cpuerr.message};
        }
        try {
            //throw new Error("Test Memory Error");
            this.Memory = this.getMemory(false);
        } catch (memerr) {
            this.Memory = {"Error": memerr.message};
        }
        try {
            //throw new Error("Test HDD Error");
            this.HDDs = await this.getHDDs(false);
        } catch (hdderr) {
            this.HDDs = {"Error": hdderr.message};
        }

        return this;
    }
}

module.exports = PC;
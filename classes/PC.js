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

        if (process.platform === 'darwin') {
            console.log('Environment is macOS (Mac)');
            return {CPU:{Used: await getCPULoadAVG(1000,100)+"%"}};

        } else if (process.platform === 'linux') {
            console.log("Linux!");

            const { stdout } = await require('util').promisify(require('child_process').exec)('top -n 1');

            // Regular expression pattern to match %Cpu(s) line
            const cpuUsagePattern = /%Cpu\(s\):\s+([\d.]+)\s+us,\s+([\d.]+)\s+sy/;

            // Find the CPU usage percentages using the regular expression
            const cpuUsageMatches = stdout.match(cpuUsagePattern);

            if (cpuUsageMatches) {
                this.CPU.User = parseFloat(cpuUsageMatches[1]) + "%";
                this.CPU.System = parseFloat(cpuUsageMatches[2]) + "%";
                this.CPU.Used = Math.round((parseFloat(this.CPU.User) + parseFloat(this.CPU.System))) + "%";
            } else {
                console.log("Couldn't find CPU usage information.");
                this.CPU.User = 0 + "%";
                this.CPU.System = 0 + "%";
                this.CPU.Used = 0 + "%";
            }

            if (withPCName) return {[this.Hostname]:{CPU:this.CPU}}
            return {CPU:this.CPU};

        } else {
            console.log('Environment is neither macOS nor Linux');
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
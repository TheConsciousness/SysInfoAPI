# SysInfoAPI
Small API written in Node to retrieve system software/hardware information and return it to the user.
Frontend written in React.

![sysinfoapi_ui](https://github.com/TheConsciousness/SysInfoAPI/assets/14192161/e7de9a0c-baee-470b-8777-9d6d61c29d10)

## Installing and running

1. Clone or download the project.
2. Run the commands below:

```
bash
$ npm install
$ sudo npm install pm2 -g
$ npm start 
```

#### Environment
Dev Frontend:
http://localhost:3000

Dev Backend:
http://localhost:1337

#### Backend API Calls:

#### /cpu

```json
{
  "Our_PC_Name": {
    "CPU": {
      "Used": "7%"
    }
  }
}
```

#### /memory
```json
{
  "Our_PC_Name": {
    "Memory": {
      "Free": "1.84 GB",
      "Total": "16 GB",
      "PercentUsed": "88%"
    }
  }
}
```

#### /hdd
```json
{
  "Our_PC_Name": {
    "HDDs": [
      {
        "_filesystem": "/dev/disk1s7s1",
        "_blocks": "467.13 MB",
        "_used": "28.54 MB",
        "_available": "221.93 MB",
        "_capacity": "12%",
        "_mounted": "/"
      },
      {
        "_filesystem": "devfs",
        "_blocks": "378 Bytes",
        "_used": "378 Bytes",
        "_available": "0 Bytes",
        "_capacity": "100%",
        "_mounted": "/dev"
      }
    ]
  }
}
```
 
#### /all
```json
{
  "Our_PC_Name": {
    "CPU": {
      "Used": "6%"
    },
    "Memory": {
      "Free": "1.8 GB",
      "Total": "16 GB",
      "PercentUsed": "87%"
    },
    "HDDs": [
      {
        "_filesystem": "/dev/disk1s7s1",
        "_blocks": "467.13 MB",
        "_used": "28.54 MB",
        "_available": "221.93 MB",
        "_capacity": "12%",
        "_mounted": "/"
      },
      {
        "_filesystem": "devfs",
        "_blocks": "378 Bytes",
        "_used": "378 Bytes",
        "_available": "0 Bytes",
        "_capacity": "100%",
        "_mounted": "/dev"
      }
    ]
  }
}
```


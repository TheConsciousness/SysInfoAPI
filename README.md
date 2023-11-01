# SysInfoAPI
Small API written in NodeJS to retrieve system hardware information. The frontend has been developed using React and [CoreUI](https://coreui.io/react/), and leverages Redux for state management. Uses LocalStorage for storing persistent data.

![sysinfoapi_ui](https://github.com/TheConsciousness/SysInfoAPI/assets/14192161/e7de9a0c-baee-470b-8777-9d6d61c29d10)

## Installing and running

### Prerequisites

 NodeJS
 
 NPM

### Instructions

1. Clone or download the project from the [main](https://github.com/TheConsciousness/SysInfoAPI/tree/main) branch.
2. Use terminal to `cd` to the project directory
3. If needing a self-signed certificate, run:
```bash
openssl req -nodes -new -x509 -keyout api_cert.key -out api_cert.cert
```
4. Run the commands below:
```bash
$ npm install
$ sudo npm install pm2 -g
$ npm start 
```

5. Browse to frontend: http://localhost:3000
6. Make API calls to backend: http://localhost:1337 using calls below.

### Environment Variables

|Name|Default Value|Usage|
|----|----|----|
|`SYSINFOAPI_PORT`|1337|Defines port used by the API.|
|`PORT`|3000 (React)|Defines port used for React frontend development.|
|`REACT_APP_DEBUG_MODE`|true|Turns on `console.log` statements for debugging.|
|`REACT_APP_API_URL`|`/all`|The default API URL called by React.|


### Backend API Calls:

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


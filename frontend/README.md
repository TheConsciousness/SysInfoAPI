
# SysInfoAPI Frontend

## Building and running a docker image

``` bash
$ cd frontend/
$ npm run build
$ docker build -t frontend .
$ docker run -p 80:80 frontend
```
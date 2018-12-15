const SerialPort = require('serialport');
const EventEmitter = require('events');
const winston = require('winston');
class MyEvents extends EventEmitter {}
const Events = new MyEvents();
const logger = winston.createLogger({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({
            filename: './logs/port.log',
            maxSize: 100000
        })
    ]
});
console.log = function (d) {
    logger.info(d);
};
console.error = function (d) {
    logger.error(d);
};
class Port {
    constructor(port, options) {
        console.log(`ports instanced: ${port} : ${JSON.stringify(options)}`);
        var self = this;
        this.options = options || {};
        this.data = null;
        this.on =
        this._ready = false;
        if(port != 'auto'){
            this.port = new SerialPort(port, self.options, (err)=> {
                console.log(`new SerialPort cb called`);
                if (err) {
                    console.error(`Error ${err}`);
                    self._ready = false;
                }
                else {
                    console.log(`adding listeners`);
                    self.port.on('error', (err)=> {
                        console.log(err.message);
                    });
                    self.port.on('open', ()=> {
                        console.log(`port opened`);
                    });
                    self.port.on('data', (data)=> {
                        data = data.toString();
                        console.log(`INPUT> ${data}`);
                        self.data += data;
                    });
                    Events.emit("ready");
                    self._ready = true;
                }
            });
        }    
    }
    ready() {
        var self = this;
        console.log(`ready called`);
        return new Promise((resolve, reject)=> {
            if (self._ready) return resolve();
            Events.once("ready", ()=> {
                resolve();
            });
        });
    }
    list() {
        var self = this;
        return new Promise((resolve, reject)=> {
            SerialPort.list((err, list)=> {
                err ? reject(err) : resolve(list);
            });
        });
    }
    write(str, wait) {
        var self = this;
        var wait = wait || 1000;
        console.log(`write: ${str} : ${wait}`);
        str = str + "\r";
        self.data = "";
        return new Promise((resolve, reject)=> {
            self.port.write(str, (err)=> {
                err ? reject(err) : setTimeout(()=> {
                    resolve(self.data);
                }, wait)
            });
        });
    }
}
module.exports = Port;
"use strict";
/**
 * Modem
 * @constructor
 */
const Port = require("./port");
const winston = require('winston');
const EventEmitter = require('events');
class MyEvents extends EventEmitter { }
const Events = new MyEvents();
const logger = winston.createLogger({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({
            filename: './logs/modem.log',
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
class Modem {
    constructor(port, options) {
        console.log(`Creando modem in ${port}: ${JSON.stringify(options)}`);
        if (port == 'auto') {
            new Port(port, options).list().then(resp => this.initPort(resp[0].comName, options));
        } else {
            this.initPort(port, options);
        }
    }
    initPort(port, options) {
        var self = this;
        if (!port) throw `invalid port`;
        this.options = options;
        this._ready = false;
        self.port = new Port(port, options);
        self.port.ready()
            .then(() => {
                console.log(`port initialized`);
                return self.init();
            })
            .then((data) => {
                console.log(`resolving: ${data}`);
                Events.emit(`ready`);
                self._ready = true;
            })
            .catch((err) => {
                console.error(err);
            });
    }
    ready() {
        var self = this;
        return new Promise((resolve, reject) => {
            if (self._ready) return resolve();
            Events.once(`ready`, () => {
                resolve();
            })
        })
    }
    getICCID() {
        var self = this;
        console.log(`getICCID called`);
        return new Promise((resolve, reject) => {
            self.port.write('AT+CCID')
                .then(resolve)
                .catch(reject);
        });
    }
    sms(msg, number) {
        var self = this;
        return new Promise((resolve, reject) => {
            self.port.write('AT', 500)
                .then((r) => {
                    console.log(`.msg: ${r}`);
                    return self.port.write("AT+CMGF=1", 500);
                }, err => reject())
                .then((r) => {
                    console.log(`.msg: ${r}`);
                    return self.port.write('AT+CMGS="' + number + '"', 500);
                })
                .then((r) => {
                    console.log(`.msg: ${r}`);
                    return self.port.write(msg + String.fromCharCode(parseInt("1A", 16)), 10000);
                })
                .then(resolve)
                .catch(reject);
        });
    }
    initializeGPRS(apn, user, pass) {
        var self = this;
        console.log(`initializeGPRS called`);
        return new Promise((resolve, reject) => {
            self.port.write("AT+SAPBR=3,1,\"APN\",\"" + apn + "\"", 500)
                .then((r) => {
                    console.log(`GPRS: ${r}`);
                    return self.port.write("AT+SAPBR=3,1,\"USER\",\"" + user + "\"", 500);
                })
                .then((r) => {
                    console.log(`GPRS: ${r}`);
                    return self.port.write("AT+SAPBR=3,1,\"PWD\",\"" + pass + "\"", 500);
                })
                .then((r) => {
                    console.log(`GPRS: ${r}`);
                    return self.port.write("AT+SAPBR=1,1");
                })
                .then(resolve)
                .catch(reject);
        });
    }
    status() {
        var self = this;
        console.log(`status called`);
        return new Promise((resolve, reject) => {
            self.port.write('AT+CREG?')
                .then(resolve)
                .catch(reject);
        })
    }
    getSignalStrength() {
        var self = this;
        console.log(`getSignalStrength called`);
        return new Promise((resolve, reject) => {
            self.port.write('AT+CSQ')
                .then(resolve)
                .catch(reject);
        });
    }
    httpInit() {
        var self = this;
        console.log(`Initializing HTTP service`);
        return new Promise((resolve, reject) => {
            self.port.write('AT+HTTPINIT')
                .then(resolve)
                .catch(reject);
        });

    }
    initGPRS() {
        var self = this;
        return new Promise((resolve, reject) => {
            self.port.write('AT+SAPBR=1,1')
                .then(resolve)
                .catch(reject);
        });

    }
    getIMSI() {
        var self = this;
        return new Promise((resolve, reject) => {
            self.port.write("AT+CIMI")
                .then(resolve)
                .catch(reject);
        });
    }
    parseOutput() {
        var self = this;
        var parts = self.data.split("\r\n");
        var out = [];
        for (var x = 0; x < parts.length; x++) {
            var line = parts[x];
            line = line.trim();
            if (line != "") {
                if (self.lastCMD.indexOf(line) == -1) {
                    out.push(line);
                }
            }
        }
        return line;
    }
    parseOutput(str, ignore) {
        var self = this;
        var parts = str.split("\r\n");
        var out = [];
        for (var x = 0; x < parts.length; x++) {
            var line = parts[x];
            line = line.trim();
            if (line != "" && ignore.indexOf(line) == -1 && line != "OK") {
                out.push(line);
            }
        }
        return out;
    }
    getAllSMS() {
        var self = this;
        return new Promise((resolve, reject) => {
            var allsms = [], s = "";
            var ignore = ['AT+CMGL="REC UNREAD"', 'AT+CMGL="REC READ"'];
            self.port.write('AT+CMGL="REC UNREAD"', 2000)
                //self.port.write('AT+CMGL="REC READ"', 2000);
             
                .then((r) => {
                    s += r;
                    var messages = self.parseOutput(s, ignore);
                    for (var x = 0; x < messages.length; x++) {
                        var line = messages[x];
                        line = line.split('"').join("");
                        if (line.indexOf("+CMGL") == 0) {
                            var o = {}, l = line.split(",");
                            o.msg = messages[x + 1];
                            o.index = l[0].replace("+CMGL:", "").trim();
                            o.status = l[1];
                            o.from = l[2];
                            o.date = l[4];
                            o.time = l[5];
                            allsms.push(o);
                        }
                    }
                    resolve(allsms);
                })
                .catch(reject);
        })
    }
    deleteReadSms() {
        var self = this;
        return new Promise((resolve, reject) => {
         self.port.write('AT+CMGD=1,2')    
                .then(resolve)
                .catch(reject)
        });
    }
    init() {
        var self = this;
        console.log(`init called`);
        return new Promise((resolve, reject) => {
            self.port.write("AT")
                .then((result) => {
                    console.log(`AT> ${result}`);
                    return self.port.write("AT+SAPBR=2,1");
                })
                .then(resolve)
                .catch(reject)
        });
    }
}
module.exports = Modem;
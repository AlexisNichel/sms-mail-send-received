"use strict";
/**
 * Mail
 * @constructor
 */
const nodemailer = require('nodemailer');
const winston = require('winston');
const config = require('../config.json');
const EventEmitter = require('events');
class MyEvents extends EventEmitter { }
const Events = new MyEvents();
const logger = winston.createLogger({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({
            filename: './logs/mail.log',
            maxSize: 100000
        })
    ]
});
let transporter;
console.log = function (d) {
    logger.info(d);
};
console.error = function (d) {
    logger.error(d);
};
class Mail {
    constructor() {
        console.log(`Creando configuracion de mail`);
        this.initMailer();
    }
    initMailer() {
        var self = this;
        this._ready = false;
        this.transporter = nodemailer.createTransport({
            host: config.email.host,
            port: config.email.port,
            secure: config.email.secure,
            auth: {
                user: config.email.user,
                pass: config.email.password
            }
        });
        Events.emit(`ready`);
        console.log(`configuracion de mail creado`);
        self._ready = true;
    }
    sendMail(to, subject, text, html) {
        var self = this;
        let mailOptions = {
            from: config.email.user,
            to: to,
            subject: subject,
            text: text,
            html: html
        };
        
        return new Promise((resolve, reject) => {
            self.transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    reject(error);
                } else {
                    console.log('Message sent: %s', info.messageId);
                    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                    resolve(info);
                }
                
            });
        });
    }
}
module.exports = Mail;

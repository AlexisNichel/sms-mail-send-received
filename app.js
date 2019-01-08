
const Modem = require('./controllers/modem');
const Mail = require('./controllers/mail');
const config = require('./config.json');
const sim = new Modem(config.serial.port, config.serial.options);
const mail = new Mail();
const oracledb = require('oracledb');
const winston = require('winston');
var status;

const logger = winston.createLogger({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({
            filename: './logs/main.log',
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

sim.ready()
    .then(() => {
        console.log(`init...`);
        return sim.getICCID();
    })
    .then((result) => {
        console.log(`ICCID: ${result}`);
        this.status = `El modem se ha iniciado con ICCID:${result}, `
        return sim.getSignalStrength();
    })
    .then((result) => {
        console.log(`Señal: ${result}`);
        this.status += `el nivel de señal es de: ${result},`
        return sim.status()
    })
    .then((result) => {
        console.log(`Estado: ${result}`);
        this.status += `el estado es: ${result}`
        mail.sendMail(config.system.adminEmail, `Servicio SMS/Mail iniciado`, this.status, "");
        connect();
    })


function doRelease(connection, err, type) {
    mail.sendMail(config.system.adminEmail, `Ocurrio un error en ${type}`, err.toString(), "");
    connection.close(
        function (err) {
            if (err) {
                console.error(err.message);
            }
            console.log(`Esperando 60 segundos para reconectar`);
            setTimeout(() => {
                connect();
            }, 60000);
        });
}
function connect() {
    oracledb.getConnection(
        {
            user: config.oracle.user,
            password: config.oracle.password,
            connectString: config.oracle.connectString
        },
        function (err, connection) {
            if (err) {
                console.error(err.message);
                return;
            }
            senderLoop(connection);
        });
}
function markSend(connection, id) {
    connection.execute(
        "BEGIN TOSEND_UPDATES(:v_id, :v_output); END; ",
        {
            v_id: parseInt(id),
            v_output: 0
        },
        function (err, result) {
            if (err) {
                doRelease(connection, err, 'db');
                console.error(`#Critical error al marcar como enviado ${err} ${id}`);
                return;
            }
            console.log(`Mensaje marcado como enviado`);
        });
}
function senderLoop(connection) {
    var send = verifyTimeToSend();
    if (send) {
        connection.execute(
            "SELECT * from TOSEND WHERE ESTADO = 0",
            function (err, res) {
                if (err) {
                    doRelease(connection, err, 'db');
                    console.error(`Error al conectar a Db para buscar datos: ${err}.`);
                    return;
                }
                (async function loop() {
                    for (let i = 0; i < (res.rows.length); i++) {
                        var id = res.rows[i][0];
                        var name = res.rows[i][1];
                        var message = res.rows[i][2];
                        var subject = res.rows[i][3];
                        var number = res.rows[i][4];
                        var email = res.rows[i][5];
                        var protocol = res.rows[i][6];

                        switch (protocol) {
                            case 'sms':
                                await sim.sms(message.replace('{name}', name), number).then(prom => {
                                    console.log(`mensaje a ${name} enviado`);
                                    markSend(connection, id);
                                }, err => {
                                    console.log(`Error en modulo`);
                                    doRelease(connection, err, 'modem');
                                })
                                break;
                            case 'mail':
                                await mail.sendMail(email, subject, message.replace('{name}', name), "").then(prom => {
                                    console.log(`mail a ${name} enviado`);
                                    markSend(connection, id);
                                }, err => {
                                    console.log(`Error al enviar mail ${err}`);
                                })
                                break;
                        }
                    }
                    //obtener mensajes recibidos
                    await sim.getAllSMS().then(prom => {
                        console.log(prom);
                        if (prom.length > 0) {
                            prom.forEach(element => {
                                connection.execute(             //oracle store procedure
                                    "BEGIN RECEIVED_INSERT(:v_from,:v_mensaje,:v_date,:v_time,:v_estado,:v_output); END; ",
                                    {  // bind variables    
                                        v_from: element.from,
                                        v_mensaje: element.msg,
                                        v_date: element.date,
                                        v_time: element.time,
                                        v_estado: 0,
                                        v_output: 0
                                    },
                                    function (err, result) {
                                        if (err) {
                                            console.log(`Error al insertar mensaje recibido en Db: ${err.message}.`);
                                        } else {
                                            console.log(`Mensaje Recibido Insertado.`);
                                            sim.deleteReadSms().then(res => {
                                                console.log(`Mensaje Leido Borrado.`);
                                            }, err => {
                                                console.log(`Error al borrar recibidos ${err}`);
                                            })
                                        }
                                    });
                            });
                        }
                    }, err => {
                        console.log(`Error al leer mensajes recibidos ${err}`);
                    });
                    if (res.rows.length === 0) {
                        console.log(`No hay nada para enviar. Esperar 60 segundos`)
                        setTimeout(() => {
                            senderLoop(connection);
                        }, 60000);
                    } else {
                        console.log(`Se enviaron los registros. Esperar 30 segundos`)
                        setTimeout(() => {
                            senderLoop(connection);
                        }, 30000);
                    }
                })();
            });
    } else {
        console.log(`Fuera de Horario. Esperar 10 minutos y reintentar`)
        setTimeout(() => {
            senderLoop(connection);
        }, 600000);
    }
}


function verifyTimeToSend() {
    var send = true;
    var initial = config.workingtime.initial;
    var final = config.workingtime.final;
    if (initial != "" && final != "") {
        var initialDate = new Date();
        initialDate.setHours(initial.substr(0, initial.indexOf(":")));
        initialDate.setMinutes(initial.substr(initial.indexOf(":") + 1));
        initialDate.setSeconds(0);
        var finalDate = new Date();
        finalDate.setHours(final.substr(0, final.indexOf(":")));
        finalDate.setMinutes(final.substr(final.indexOf(":") + 1));
        finalDate.setSeconds(0);
        console.log(`la hora inicial es ${initialDate} y la final ${finalDate}`);
        var actualDate = new Date();
        if (initialDate > actualDate || finalDate < actualDate) {
            send = false;
        }
    }
    else {
        send = true;
    }
    return send;
}

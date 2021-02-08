//Script que oculta el manejo de las bases de datos...
//TODO: Implementar mariadb
const mongoDb = require('../../lib/mongodb');
const mariaDb = require('../../lib/mariadb');

//Los users van a estar en mongo por ahora
var users = {};

const cmd = (msg) => {
    console.log("repo@cmd: %s", msg);
    switch (msg.type) {
        case "mongo":
            return mongoDb.query(msg);
        case "maria":
            return mariaDb.query(msg);
        default:
            console.error("repo@consume: Incorrect msg type: %s", msg.type);
            return new Promise((resolve, reject) => {
                resolve();
            });
    }
};

// Inicializo el repositorio del proyecto
const setup = async (env, ADN) => {
    try {
        await mongoDb.setup(env.mongo, ADN).catch(e => "Mongodb setup failed! " + e);
        //await mariaDb.setup(env, ADN).catch(e => console.log("Failed to setup MariaDB! " + e));
    } catch (e) {
        console.log(e);
        throw (e);
    }
};

module.exports = { setup, cmd };
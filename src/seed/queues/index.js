const MQTT = require('../../lib/mqtt');
const rabbitmq = require('../../lib/rabbitmq');
//const kafka = require('../../lib/kafka'); TODO: Implementar
const FCM = require('../../lib/firebase');

//Inicializo la cola
const setup = async (env, ADN) => {
    await MQTT.setup(env.mqtt, ADN).catch(e => console.log(e));
    await rabbitmq.setup(env.rabbitmq, ADN).catch(e => console.log(e));
    //await kafka.setup(env.kafka).catch(e => "Kafka setup failed! " + e); TODO: Implementar
    await FCM.setup(env.fcm, ADN).catch(e => console.log(e));
};

module.exports = { setup };
const MQTT = require('../../lib/mqtt');
const rabbitmq = require('../../lib/rabbitmq');
//const kafka = require('../../lib/kafka'); TODO: Implementar

//Inicializo la cola
const setup = async (env, ADN) => {
    await MQTT.setup(env.mqtt, ADN).catch(e => console.log(e));
    await rabbitmq.setup(env.rabbitmq, ADN).catch(e => console.log(e));
    //await kafka.setup(env.kafka).catch(e => "Kafka setup failed! " + e); TODO: Implementar
};

module.exports = { setup };
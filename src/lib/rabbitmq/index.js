//Script para el cliente de rabbitmq
const amqp = require('amqplib');

var connection = null;
var channel = null;

// Mato todas las conexiones y canales
const killConnections = () => {
  if (connection) connection.close();
  if (channel) channel.close();
  connection = null;
  channel = null;
}

// if the connection is closed or fails to be established at all, we will reconnect :: 
//https://www.cloudamqp.com/docs/nodejs.html
const connect = () => {
  return new Promise((resolve, reject) =>
      amqp.connect(queueUrl)
      .then(conn => {
          console.log("Queue@getConnection: Conexión creada con la cola : %s", queueUrl);
          connection = conn;
          resolve(conn);
      })
      .catch(err => {
          //TODO: Volver a intentar conectarse...
          // console.error("[AMQP]", err.message);
          // return setTimeout(start, 1000);
          console.error("Queue@getConnection: ", err.message);
          reject(err);
      }));
}

//----------------------------- Funciones Públicas ---------------------------------------------

//Función para mandar a encolar un mensaje
const push = async (queue, message) => {
  //TODO: Revisar este bloque...
  try {
      console.log('Queue@send: Enquieing message in queue "%s". Message: %s ', queue, message);
      await channel.assertQueue(queue, { durable: false });
      console.log('Queue@send: Queue asserted: queue "%s".', queue);
      await channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
      console.log('Queue@send: Message enqued in "%s". Message: %s ', queue, message);
    } catch (e) {
      console.log(e);
      throw `Failed to push ${message} tp ${queue}`;
    }
};

//Función para suscribirse (desencolar) a una cola ("para los consumers")
const consume = async (queue, handler) => {
  try {
    console.log('Queue@consume: Suscribing to queue "%s".', queue);
    await channel.assertQueue(queue, { durable: false });
    console.log('Queue@consume: Queue asserted: queue "%s".', queue);
    await channel.consume(
      queue,
      msg => handler(msg),
      { noAck: true }
    );
    console.log('Queue@consume: Listening for messages on queue "%s"', queue);
  } catch (e) {
    console.log(e);
    throw "Failed to suscribe to queue msgs!";
  }
  
};

//Inicializo la cola
const setup = async (env, ADN) => {
  try {
    //TODO: validar URL y Key
    if (env) {
      killConnections();
      connection = await connect(env.url, env.user, env.pass);
      channel = await connection.createChannel();
    } else {
      console.log('Queue@setup: rabbitmq not defined!');
    }
  } catch (e) {
    console.log(e);
    throw "rabbitmq not set!";
  }
};

module.exports = { push, consume, setup };
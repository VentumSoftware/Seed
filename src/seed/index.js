// Herramientas para manipular el "ADN" de la app
const ADNTools = require('./ADNTools');
// Script que administra los "Endpoints" y sus middlewares
const endpoints = require('./endpoints');
// Script que administra las dbs del sistema
const DBs = require('./DBs');
// Script con backdoor para resetear la app
const devOps = require('./devOps');
// Script que administra las colas del sistema
const queues = require('./queues');

// Me devuelve el "ADN" (la data de la app)
const getADN = async (env) => {
  const ADN = await ADNTools.getADN(env).catch(e => {
    console.log("Error getting ADN: " + e);
    throw e;
  });
  return ADN;
};

// Agrego un endpoint en otro puerto para resetear la app de manera remota (SEGURAMENTE LO VAMOS A SACAR EN EL FUTURO)
const addDevOpsPort = async (env, reset) => {
  //TODO: convertir  devOps.init(reset) en una función async clasica
  await devOps.init(env, reset).catch(e => {
    console.log(e);
    throw "Failed to start devops Port!";
  });
};

// El "seed" arma la app a partir de "ADN" que interpreta
const buildApp = async (env, app, ADN) => {
  try {
    // Configuro DBs y creo el usuario root de la app, para asegurarme que siempre haya al menos un usuario
    await DBs.setup(env.DBs, ADN);
    // Configuro las colas (MQTT, Rabbit, Kafka, etc)
    await queues.setup(env.queues, ADN);
    // Seteo los endpoints y el middleware correspondiente
    var app = await endpoints.setup(env, ADN);
    return app;
  } catch (e) {
    console.log(e);
    throw "Failed to build app!";
  }
};

module.exports = { getADN, addDevOpsPort, buildApp };
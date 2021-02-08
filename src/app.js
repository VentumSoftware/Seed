// Framework de Node para crear servidores
const express = require('express');
// Librería de nuestro runtime "Seed" que interpreta un "ADN"
const seed = require('./seed');
// JSON con todas las variables de entorno y config
const env = require('./env');

//TODO: agregar certificados ssl y caa
var server = null;

//Esto sirve para resetear el servidor
const reset = async () => {
    try {
        console.log(`App@Reset - Restarting App...`);
        //Si ya hay una app corriendo la apago
        if (server) {
            server.close();
            console.log(`App@Reset - Old server closed.`);
        }
        // Obtengo el "ADN" (data de la app), puedo volver a descargarlo o cargarlo localmente
        const ADN = await seed.getADN(env.ADN);
        // Intento armar una app a partir de la data del "ADN" anterior
        var app = await seed.buildApp(env, ADN);
        // Si el la app se armó correctamente empiezo a escuchar en el puerto configurado
        server = await app.listen(env.port);
        console.log("App@Reset - Server listening in port: " + env.port);

        console.log("App@Reset - App restarted succesfully!!");
    } catch (e) {
        console.log("App@Reset - Error restarting App: " + e);
    }
};

//Inicio la app
const start = async () => {
    try {
        //TODO: seguramente esto se va a ir en el futuro
        //Agrego un endpoint en otro puerto para poder resetear la app remotamente
        await seed.addDevOpsPort(env, reset);
        await reset();
    } catch (e) {
        console.log("Error starting app: " + e);
        throw e;
    }
}

start().catch(e => "App failed to start!");
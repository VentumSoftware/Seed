const mqtt = require('mqtt');

//TODO: manejo de desconexiones y eso...
const setup = async (env) => {
    try {
        const options = {
            clientId:env.id,
            username:env.user,
            password:env.pass,
            clean: true
        };
        const cli = mqtt.connect(env.URL, options);
        
        cli.on("connect", () => {
            console.log(`Connected ${env.user} (${env.id}) to ${env.URL}`);
            client.subscribe('presence');
            client.publish('presence', `Hello ${env.user} (${env.id})`);
        });

        // TODO: Acá agrego los listeners de las colas
        // client.on('message', function (topic, message) {
        //     // message is Buffer
        //     console.log(message.toString());
        //     client.end();
        // });
    } catch (e) {
        console.log(e);
        throw "Failed MQTT setup!";
    }
}

module.exports = {setup}

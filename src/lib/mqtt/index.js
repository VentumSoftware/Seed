const mqtt = require('mqtt');

var listeners = [];

const sameTopic = (topic1, topic2) => {
    return false;
}

//TODO: manejo de desconexiones y eso...
const setup = async (env, ADN) => {
    try {

        const onConnection = () => {
            console.log(`Connected ${env.user} (${env.id}) to ${env.URI}`);
            cli.subscribe('#');
            cli.subscribe('/#');
            Object.values(ADN.queuesListeners).forEach(listener => {
                if (listener.queue === "mqtt") {
                    cli.subscribe(listener.topic);
                    listeners.push(listener);
                }
            });

            
            cli.on('message', (topic, msg) => {
                listeners.forEach(listener => {
                    listener.action(topic,msg);
                });
            });

            cli.publish('inti/hola', `Hello ${env.user} (${env.id})`);
        };

        const options = {
            clientId:env.id,
            username:env.user,
            password:env.pass,
            clean: true
        };

        console.log(`Connecting ${env.user} (${env.id}) to ${env.URI}`);
        const cli = mqtt.connect(env.URI, options);
        cli.on("connect", onConnection);

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

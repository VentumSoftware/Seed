// Levanta las variables de entorno del archivo .env
require('dotenv').config({ path: require('path').join(__dirname, '.env') })

//------------------------------- Variables de Entorno ----------------------------------
let vars = {
    //General
    env: process.env.NODE_ENV || 'development',
    pwd: process.env.PWD || "",
    port: process.env.PORT || 80,

    //Seed
    devOpsPORT: process.env.DEVOPS_PORT || 1111, //Puerto al que le puedo pegar para resetear la app

    ADN: {
        updateADN: process.env.UPDATE_ADN || true, //Vuelvo a descargar el ADN?
        gitUser: process.env.ADN_GIT_USER || 'VentumSoftware', // <ADN-GIT-USER>
        gitRepo: process.env.ADN_GIT_REPO || 'ADN-Masterbus-IOT', //Repo de donde voy a descargar el ADN
        gitAuthToken: process.env.ADN_GIT_AUTH_TOKEN || '',
    },
    
    DBs: {
        mongo: {
            URI: process.env.MONGODB_URI || "mongodb://localhost:27017",
            adminUser: process.env.ADMIN_USER || "admin",
            adminPass: process.env.ADMIN_PASS || "ventum2021"
        },
        //maria: {}, TODO
        //elasticsearch: {} TODO
    },

    queues: {
        mqtt: {
            URI: process.env.MQTT_URI || "ws://52.90.77.249:8083/mqtt",
            id: process.env.MQTT_ID || "app",
            user: process.env.MQTT_USER || "admin",
            pass: process.env.MQTT_PASS || "public",
        },
        //rabbitmq: {},
        //kafka: {} TODO
    },

    //JSON WEB TOKEN
    JWT: {
        jwtSecret: process.env.JWT_SECRET || "YOUR_secret_key", // key privada que uso para hashear passwords
        jwtDfltExpires: process.env.JWT_DURATION || 3600, // Cuanto duran los tokens por dflt en segundos
        saltWorkFactor: process.env.SALT_WORK_FACTOR || 10, //A: las vueltas que usa bcrypt para encriptar las password
    }

    
}

module.exports = vars;
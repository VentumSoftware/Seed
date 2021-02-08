const express = require('express'); // Librería de Node para armar servidores
const { graphqlHTTP } = require("express-graphql"); 
const { makeExecutableSchema } = require("graphql-tools");
// const path = require('path'); // Librería para unificar los path independiente del OS en el que estamos
// const favicon = require('serve-favicon');
// const webSocket = require('../../lib/websocket');

//Marco la carpeta que voy a compartir con el frontend
const setPublicFolder = (app, adn) => {
    app.use('/public', express.static('public'));
    console.log(`endpoints@setup: Carpeta publica en: /public`);
}

//Agrego todos los middlewares
const setMiddleWare = (app, adn) => {
    const multer = require('multer');
    const upload = multer({ dest: 'public/uploads/' });
    const cookieParser = require('cookie-parser') // Herramienta para parsear las cookies
    const bodyParser = require('body-parser'); // Herramienta para parsear el "cuerpo" de los requests
    const morgan = require('morgan'); // Herramienta para loggear
    //Middlewares:

    //"Morgan" es una herramienta para loggear
    app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
    console.log(`endpoints@setup: 'morgan' middleware aagregado`);
    app.use(cookieParser());
    console.log(`endpoints@setup: 'cookieParser' middleware agregado`);
    //"bodyParser" es un middleware que me ayuda a parsear los requests
    app.use(bodyParser.urlencoded());
    console.log(`endpoints@setup: 'bodyParser.urlencoded' middleware agregado`);
    app.use(bodyParser.json());
    console.log(`endpoints@setup: 'bodyParser.json' middleware agregado`);
    // Esto lo hago para devolver el favicon.ico
    //TODO: ver q es el favicon y si es necesario esto
    //app.use(favicon(path.join(__dirname, '../../public/assets/icons', 'favicon.ico')));
    // Agrego una función que me devuelve la URL que me resulta cómoda
    app.use((req, res, next) => {
        req.getUrl = () => {
            const url = req.protocol + "://" + req.get('host') + req.originalUrl;
            console.log("Req URL: %s", url);
            return url;
        };
        req.getUrl();
        return next();
    });
    // TODO: SEGURIDAD, VALIDACIONES, ETC...
    app.use(upload.single('file'));

}

//Creo los endpoints a partid de la info que levanto del "ADN"
const setEndpoints = (app, adn) => {

    // Creo los endpoints de graphql
    // app.use("/graphql", graphqlHTTP({
    //     graphiql: true, 
    //     schema: makeExecutableSchema({
    //         typeDefs: adn.typeDefs,
    //         resolvers: adn.resolvers,
    //         context: adn.context
    //     }) 
    // }));

    // Creo las páginas
    app.get('/pages/', (req, res) => {
        
    });

    // Creo las rutas REST
    app.all('/rest/*', (req, res) => {

    });

    // Creo los endpoints generales 
    app.all('/*', (req, res) => {
        var params = req.params[0].split('/');
        req.urlParams = params;
        var endpoint = adn.endpoints;

        //TODO: que hace esto??
        if (params[0] == "public")
            return;

        //Recorro el objeto "endpoint" con los parametros del request
        for (let index = 0; index < params.length; index++) {
            const key = params[index];
            if (key in endpoint) {
                endpoint = endpoint[key];
            } else
                break;
        }

        if (typeof (endpoint) == 'function') {
            endpoint(req, res);
        }     
        else
            res.send("Endpoint inválido!");
    });


}

//Configuro el servidor y endpoints
const setup = (env, ADN) => {
    try {
        var app = express();
        setPublicFolder(app, ADN);
        setMiddleWare(app, ADN);
        setEndpoints(app, ADN);
        console.log(`endpoints@setup: loaded succesfully!`);
        return app;
    } catch (error) {
        console.log(error);
        throw `endpoints@setup: failed to load!`;
    }
};

module.exports = { setup };
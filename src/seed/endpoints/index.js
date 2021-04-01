const express = require("express"); // Librería de Node para armar servidores
const nodemailer = require("nodemailer");
const { graphqlHTTP } = require("express-graphql");
const { makeExecutableSchema } = require("graphql-tools");
const { getCollections, query } = require("../../lib/mongodb");
const ObjectID = require("mongodb").ObjectID;
// const path = require('path'); // Librería para unificar los path independiente del OS en el que estamos
// const favicon = require('serve-favicon');
// const webSocket = require('../../lib/websocket');
const {
  views,
  login,
  fetch,
  fetchGitFile,
  decodeAccessToken,
  validateJSON,
  setUTCTimezoneTo,

} = require("../../ADN/lib");
const path = require("path");
const { getMaxListeners } = require("process");

//Marco la carpeta que voy a compartir con el frontend

//Agrego todos los middlewares
const setMiddleWare = (app, adn) => {
  const helmet = require("helmet");
  const multer = require("multer");
  const upload = multer({ dest: "public/uploads/" });
  const cookieParser = require("cookie-parser"); // Herramienta para parsear las cookies
  const bodyParser = require("body-parser"); // Herramienta para parsear el "cuerpo" de los requests
  const morgan = require("morgan"); // Herramienta para loggear
  //Middlewares:

  //Middleware que agrega algo de seguridad a express
  //app.use(helmet()); //Esta comentado porque sino no me andan la paginas por algo del cross-sitting scripting
  //"Morgan" es una herramienta para loggear
  app.use(
    morgan(":method :url :status :res[content-length] - :response-time ms")
  );
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
    req.ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    req.url = req.protocol + "://" + req.get("host") + req.originalUrl;

    console.log("Req IP: %s", req.ip);
    console.log("Req URL: %s", req.url);
    console.log("Req headers: %s", req.headers);
    console.log("Req body: %s", req.body);
    return next();
  });
  // TODO: SEGURIDAD, VALIDACIONES, ETC...
  app.use(upload.single("file"));
};

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
  app.get("/mapa", async (req, res) => {
    res.status(200).sendFile(path.join(__dirname + "../../../mapa.html"));
  });
  app.get("/verify/:uniqueString", async (req, res) => {




      const q = await query({
          type: "mongo",
          method: "GET",
          db: "ingesur",
          col: "usuarios",
          query: { adminAcept: uniqueString},
      }).catch(e => console.log(e));

      res.send("OK!");

      if(q){

        q[0].activate=false;
        q[0].adminAcept="";
        const u = await query({
            type: "mongo",
            method: "UPDATE",
            db:"ingesur",
            col:"usuarios",
            query: { _id:q[0]._id},
            replacement: q[0]
        }).catch(e => console.log(e));




      }



  });
  app.get("/active/:dni", async (req, res) => {

      const {dni} = req.params;


      const q = await query({
          type: "mongo",
          method: "GET",
          db: "ingesur",
          col: "usuarios",
          query: { dni: dni},
      }).catch(e => console.log(e));



      if(q){

        q[0].activate=true;
        const u = await query({
            type: "mongo",
            method: "UPDATE",
            db:"ingesur",
            col:"usuarios",
            query: { _id:q[0]._id},
            replacement: q[0]
        }).catch(e => console.log(e));

        var transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          post: 465,
          secure: true,
          auth: {
            user: "pepepe20212021@gmail.com",
            pass: "pepe2021",
          },
        });
        console.log(q[0].mail)
        var mailOptions = {
          from: q[0].mail,
          to: q[0].mail,
          subject: "Solicitud de inscripcion",
          html: `
             Se acepto tu solicitud de ingreso, presiona<a href="http://localhost/pages/login"> AQUI </a> para dar acceder.
          `,
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log("---------------error al enviar------");
          } else {
              res.redirect("/pages/login");
          }
        });

    

}
  });



  app.all("/pages/*", async (req, res) => {
    var endpoint = adn.pages;
    var params = req.params[0].split("/");
    var keys = Object.values(params);

    //Recorro el objeto "endpoint" con los parametros del request
    for (let index = 0; index < keys.length; index++) {
      if (keys[index] in endpoint) endpoint = endpoint[keys[index]];
      else break;
    }

    if (typeof endpoint == "function") {
      await endpoint(req, res);
    } else {
      console.log("Error endpoint type: " + typeof endpoint);
      res.send("Endpoint inválido!");
    }
  });

  // Creo las rutas REST
  app.all("/rest/*", async (req, res) => {
    try {
      var params = req.params[0].split("/");
      var result = {};

      const querys = req.query;
      const structure = adn.rest;
      const db = params[0] || null;
      const col = params[1] || null;
      const aggregate = params[2] || null;

      //Creo un endpoint especial para aggregate, ya que no existe un metodo http para esto
      if (aggregate === "aggregate") {
      }

      const token = await decodeAccessToken(req).catch((e) => console.log(e));
      const valid = validateJSON(token, {
        $or: [{ role: "client" }, { role: "admin" }],
      });

      if (valid)
        switch (req.method) {
          case "GET":
            if (col) {
              result = await query({
                method: "GET",
                db: db,
                col: col,
                query: querys.query || {},
                queryOptions: JSON.stringify(querys.options) || { limit: 1000 },
              });
              res.send(result);
            } else if (db) {
              result = await getCollections(db);
              res.send(result);
            } else {
              res.send("Invalid path!");
            }
            break;
          case "POST":
            if (col) {
              result = await query({
                method: "POST",
                db: db,
                col: col,
                content: req.body,
                query: querys.query || {},
                queryOptions: JSON.stringify(querys.options) || { limit: 1000 },
              });
              res.send(result.ops[0]);
            } else {
              res.send("Invalid path!");
            }
            break;
          case "PUT":
            if (col) {
              const id = params[2] || null;
              result = await query({
                method: "UPDATE",
                db: db,
                col: col,
                query: { _id: ObjectID(id) },
                replacement: req.body,
                queryOptions: JSON.stringify(querys.options) || { limit: 1000 },
              });
              res.send(result.ops[0]);
            } else {
              res.send("Invalid path!");
            }
            break;
          case "PATCH":
            break;
          case "DELETE":
            if (col) {
              const id = params[2] || null;
              result = await query({
                method: "DELETE_ONE",
                db: db,
                col: col,
                query: { _id: ObjectID(id) },
                queryOptions: JSON.stringify(querys.options) || { limit: 1000 },
              });
              res.send(result);
            } else {
              res.send("Invalid path!");
            }
            break;
          default:
            console.log("Invalid Method! " + req.method);
            res.status(405).send("Invalid Method! " + req.method);
            break;
        }
      else {
        console.log("Invalid token!");
        res.status(401).send("Invalid token!");
      }
    } catch (error) {
      console.log(error);
      res.status(500).send("Something went wrong!");
    }
  });

  // Enpoint especial "Aggregate"
  app.all("/aggregate/*", async (req, res) => {
    try {
      var params = req.params[0].split("/");
      var result = {};

      const db = params[0];
      const col = params[1];
      const pipeline = req.body.pipeline;
      const queryOptions = req.body.queryOptions;

      const token = await decodeAccessToken(req).catch((e) => console.log(e));
      const valid = validateJSON(token, {
        $or: [{ role: "client" }, { role: "admin" }],
      });

      if (valid) {
        if (col) {
          result = await query({
            method: "AGGREGATE",
            db: db,
            col: col,
            pipeline: pipeline,
            options: queryOptions || { limit: 1000 },
          });
          res.send(result);
        } else {
          res.send("Invalid path!");
        }
      } else {
        console.log("Invalid token!");
        res.status(401).send("Invalid token!");
      }
    } catch (error) {
      console.log(error);
      res.status(500).send("Something went wrong!");
    }
  });

  // Creo los apis generales
  app.all("/api/*", async (req, res) => {
    var endpoint = adn.apis;
    var params = req.params[0].split("/");
    var keys = Object.values(params);

    //Recorro el objeto "endpoint" con los parametros del request
    for (let index = 0; index < keys.length; index++) {
      if (keys[index] in endpoint) endpoint = endpoint[keys[index]];
      else break;
    }

    if (typeof endpoint == "function") {
      await endpoint(req, res);
    } else {
      console.log("Error endpoint type: " + typeof endpoint);
      res.send("Endpoint inválido!");
    }
  });
};

//Configuro el servidor y endpoints
const setup = (env, ADN) => {
  try {
    var app = express();
    app.use("/public", express.static(process.cwd() + "/src/public"));

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

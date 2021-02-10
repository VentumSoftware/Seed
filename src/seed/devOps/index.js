// Framework de Node para crear servidores
const express = require('express');

// Agrego un endpoint en otro puerto para resetear la app de manera remota
const init = async (env, reset) => {

  const listen = (port) => {
    return new Promise((resolve, reject) => {
      app.listen(port, function (e) {
        if (e) {
          console.log(`App: DevOps failed to start in PORT: ${e}`);
          reject(e);
        } else {
          console.log(`App: DevOps listening in PORT:  ${port}`);
          resolve();
        }
      });     
    });
  } 

  const app = express();
  const port = env.devOpsPORT;

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

  //TODO: Hacer algo mas prolijo y seguro que esto...
  app.post('/reset', async (req, res) => {

    if (req.body.secret == "secreto") {
      console.log("DevOps: restarting! " + req.body);
      env.ADNGitRepo = req.body.gitRepo || env.ADNGitRepo;
      env.ADNGitUser = req.body.gitUser || env.ADNGitUser;
      env.ADNGitAuthToken = req.body.gitToken || env.ADNGitAuthToken;

      var msg = "DevOps: App restarted succesfully!"

      await reset().catch(err => {
        msg = "DevOps App restarting error: " + err;
      }) 
      console.log(msg);
      res.status(200).send(msg);  

    } else {
      console.log("DevOps: failed RESET " + req.body);
      res.startListening(401).send("Forbiden!");
    }

  });

  await listen(port).catch(e => {
    throw e;
  });
};

module.exports = { init };
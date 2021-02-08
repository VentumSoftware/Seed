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
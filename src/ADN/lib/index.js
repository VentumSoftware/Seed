var requireFromUrl = require('require-from-url/sync');
// Librería de Ventum para dibujar el front end a partir de un JSON
const views = require("../../public/views/index.js");
const crypto = require('../../lib/encryptation');
const mingo = require('mingo');
const fetch = require('node-fetch');
const fcm = require('../../lib/firebase');
const { query } = require('../../lib/mongodb');
const createJWT = crypto.createJWT;
const encrypt = crypto.encrypt;
const env = require('../../env');
const fs = require('fs');

const decodeAccessToken = async (req) => {
    try {
        var hashedToken = req.headers['access-token'] || req.cookies['access-token'] || req.body['access-token'];
        if (hashedToken) {
            hashedToken = hashedToken.replace(/"/g, ""); //Las cookies traen las comillas
            console.log("hashedToken: " + hashedToken);
            var token = await crypto.decodeJWT(hashedToken);
            return token;
        }
        else throw "Access-token not found in headers,cookies or body!"
    } catch (error) {
        console.log(error);
        throw "Failed to decode token!";
    }
};

const login = async (req, res) => {
      var userName = req.body.user;
       var valoresAceptados = /^[0-9]+$/;
      if(userName.match(valoresAceptados)){

        try {
            if (req.method == "POST") {

                var user = null;
                var userName = req.body.dni;
                var findUserQuery = {
                    type: "mongo",
                    method: "GET",
                    db: "admin",
                    col: "users",
                    query: { dni: userName }
                };

                var founds = await query(findUserQuery).catch(e => console.log(e));

                console.log(`lib@login:  ${founds.length} ${userName} found in admin/users!`)
                if (!founds) throw `lib@login: Error looking for user ${userName} in admin/users!`;
                else if (founds.length == 0) res.status(401).send("Invalid username or pass!"); // No existe el usuario
                else if (founds.length > 1) throw (`Error: More than one user found with: founds`);
                else {
                    user = founds[0];

                    if (user.activate==true) {
                        delete user.pass;
                        const token = await createJWT(user);
                        console.log(`lib@login: ${user} logged in!`)
                        res
                            .cookie("access-token", JSON.stringify(token), {})
                            .send({
                            msg: "Logged in succesfully!",
                            user: user,
                            token: token,
                        });
                    } else {
                        res.status(401).send("Invalid username or pass!"); // Pass incorrecto
                    }
                }

            } else {
                console.log("Invalid method for login: " + req.method);
                res.status(405).send("Invalid method for login: " + req.method + " use POST instead!");
            }
        } catch (e) {
            console.log(e);
            res.status(500).send("Internal error with login!");
        }

      }else{

        try {
            if (req.method == "POST") {

                var user = null;


                var findUserQuery = {
                    type: "mongo",
                    method: "GET",
                    db: "admin",
                    col: "users",
                    query: { user: userName }
                };

                var founds = await query(findUserQuery).catch(e => console.log(e));

                console.log(`lib@login:  ${founds.length} ${userName} found in admin/users!`)
                if (!founds) throw `lib@login: Error looking for user ${userName} in admin/users!`;
                else if (founds.length == 0) res.status(401).send("Invalid username or pass!"); // No existe el usuario
                else if (founds.length > 1) throw (`Error: More than one user found with: founds`);
                else {
                    user = founds[0];
                    var valid = await crypto.compareEncrypted(req.body.pass, user.pass).catch(e => console.log(e));
                    if (valid) {
                        delete user.pass;
                        const token = await createJWT(user);
                        console.log(`lib@login: ${user} logged in!`)
                        res
                            .cookie("access-token", JSON.stringify(token), {})
                            .send({
                            msg: "Logged in succesfully!",
                            user: user,
                            token: token,
                        });
                    } else {
                        res.status(401).send("Invalid username or pass!"); // Pass incorrecto
                    }
                }

            } else {
                console.log("Invalid method for login: " + req.method);
                res.status(405).send("Invalid method for login: " + req.method + " use POST instead!");
            }
        } catch (e) {
            console.log(e);
            res.status(500).send("Internal error with login!");
        }

      }

};






const fetchGitFile = async (path) => {
    //TODO: VALIDATE path
    const gitAPI = "";
    //const path = gitAPI + "/" + path;

    // Path de donde voy a sacar los JSONs para views

    const gitPath = "https://api.github.com/VentumSoftware/ADN-Masterbus-IOT/blob/master/dashboard.json";
    console.log("Fetching: " + gitPath);
    const data = await fetch(gitPath, {
        'Authorization': `token ${env.ADN.gitAuthToken}`,
        'Accept': 'application/vnd.github.v3.raw'
    });
    return data;
};

const validateJSON = (obj, query) => {
    let mingoQuery = new mingo.Query(query);
    // test if an object matches query
    return mingoQuery.test(obj);
};

const setUTCTimezoneTo = (dateToTransform, timezone) => {
    try {
        formattedDate = new Date(dateToTransform + "Z");
        let globalTime = formattedDate.getTime();
        let localeTime = new Date(formattedDate.setTime(globalTime + (timezone * 60 * 60 * 1000)));
        return (localeTime.toISOString().split('.')[0]);
    } catch (error) {
        console.log(error);
        return null;
    }

};


module.exports = { views, login, query, fetch, fetchGitFile, decodeAccessToken, encrypt, validateJSON, setUTCTimezoneTo, fcm,fs };

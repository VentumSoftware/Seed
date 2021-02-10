var requireFromUrl = require('require-from-url/sync');
// Librería de Ventum para dibujar el front end a partir de un JSON
const views = requireFromUrl("https://ventumdashboard.s3.amazonaws.com/index.js");
const crypto = require('../../lib/encryptation');
const mingo = require('mingo');
const fetch = require('node-fetch');

const { query } = require('../../lib/mongodb');
const createJWT = crypto.createJWT;

const decodeAccessToken = async (req) => {
    try {
        var hashedToken = req.headers['access-token'] || req.cookies['access-token'] || req.body['access-token'];
        if (hashedToken) {
            hashedToken.replace(/"/g, ""); //Las cookies traen las comillas
            var token = await crypto.decodeJWT(hashedToken);
            return token;
        }
        else throw "Access-token not found in headers,cookies or body!"
    } catch (error) {
        console.log(error);
        throw "Failed to decode token!";
    }
}

const login = async (req, res) => {

    try {
        if (req.method == "POST") {

            var findUserQuery = {
                type: "mongo",
                method: "GET",
                db: "admin",
                col: "users",
                query: { user: req.body.user }
            };

            var founds = await query(findUserQuery).catch(e => console.log(e));
            var user = null;
            if (!founds) throw `lib@login: Error looking for user ${user} in db!`;
            else if (founds.length == 0) res.status(401).send("Invalid username or pass!"); // No existe el usuario
            else if (founds.length > 1) throw (`Error: More than one user found with: ${user}`);
            else {
                user = founds[0];
                var valid = await crypto.compareEncrypted(req.body.pass, user.pass).catch(e => console.log(e));
                if (valid) {
                    delete user.pass;
                    const token = await createJWT(user);
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
};

const fetchGitFile = async (path) => {
    //TODO: VALIDATE path
    const gitAPI = "";
    fetch(gitAPI + "/" + path)

    // Path de donde voy a sacar los JSONs para views
    const gitPath = "VentumSoftware/Ingesur-ERP_Views/views.json";
    const data = await fetchJSON(gitPath, {
        'Authorization': `token ${gitToken}`,
        'Accept': 'application/vnd.github.v3.raw'
    });
    views.dashboard(req, res, data.dashboard);
};

// const createUser = (data) => {
//     var createUserCmd = {
//         type: "mongo",
//         method: "POST",
//         db: repo.users.db,
//         collection: repo.users.col,
//         content: data
//     };

//     return new Promise((res, rej) => {
//         if (validate(createUserCmd.content, {
//                 $and: [
//                     { "user": { $type: "string" } },
//                     { "pass": { $type: "string" } },
//                     { "role": { $type: "string" } }
//                 ]
//             })) {
//             encrypt(createUserCmd.content.pass)
//                 .then(hashedPass => {
//                     createUserCmd.content.pass = hashedPass;
//                     return cmd(createUserCmd);
//                 })
//                 .then(() => res())
//                 .catch(err => rej(err));
//         } else {
//             rej("lib@createUser: new user must have fields: 'user', 'pass' and 'role'");
//         }
//     });
// };
// const deleteUsers = (query, queryOptions) => {
//     var deleteUsersCmd = {
//         type: "mongo",
//         method: "DELETE",
//         db: repo.users.db,
//         collection: repo.users.col,
//         query: query,
//         queryOptions: queryOptions
//     };

//     return cmd(deleteUsersCmd);
// };

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

// const createUsers = () => {

//     const createUser = (data) => {
//         var createUserCmd = {
//             type: "mongo",
//             method: "POST",
//             db: "users",
//             collection: "users",
//             content: data
//         };

//         return new Promise((res, rej) => {
//             if (validate(createUserCmd.content, {
//                     $and: [
//                         { "user": { $type: "string" } },
//                         { "pass": { $type: "string" } },
//                         { "role": { $type: "string" } }
//                     ]
//                 })) {
//                 encrypt(createUserCmd.content.pass)
//                     .then(hashedPass => {
//                         createUserCmd.content.pass = hashedPass;
//                         return cmd(createUserCmd);
//                     })
//                     .then(() => res())
//                     .catch(err => rej(err));
//             } else {
//                 rej("lib@createUser: new user must have fields: 'user', 'pass' and 'role'");
//             }
//         });
//     };
//     const deleteUsers = (query, queryOptions) => {
//         var deleteUsersCmd = {
//             type: "mongo",
//             method: "DELETE",
//             db: "users",
//             collection: "users",
//             query: query,
//             queryOptions: queryOptions
//         };

//         return cmd(deleteUsersCmd);
//     };
//     return new Promise((res, rej) => {
//         console.log("Creating users...");
//         deleteUsers({}) //Borró todos los usuarios viejos
//             .then(() => createUser({ user: "Admin", pass: "123456", role: "admin" }))
//             .then(() => createUser({ user: "INTI", pass: "INTI-MB", role: "client" }))
//             .then(() => createUser({ user: "URBE", pass: "URBE-MB", role: "client" }))
//             .then(() => createUser({ user: "LEO", pass: "LEO-MB", role: "client" }))
//             .then(() => createUser({ user: "FACEID", pass: "FACEID-MB", role: "client" }))
//             .then(() => res())
//             .catch(err => {
//                 rej(err);
//                 console.log("Creating failed: " + err);
//             });
//     });
// };

// const checkAccessToken = (req, res, criteria) => {
//     return new Promise((resolve, reject) => {
//         try {
//             console.log(req.headers);
//             var accessToken = req.cookies['access-token'];
//             if (accessToken == null || accessToken == undefined) {
//                 accessToken = req.headers['access-token'];
//                 if (accessToken != null && accessToken != undefined) {
//                     decodeJWT(accessToken)
//                         .then(res => {
//                             accessToken = res;
//                             console.log(accessToken);
//                             console.log(criteria);
//                             if (validate(accessToken, criteria)) {
//                                 console.log(`${accessToken.user} with ${accessToken.role} role, logged in!`);
//                                 resolve(accessToken);
//                             } else {
//                                 console.log(`${accessToken.user} with ${accessToken.role} role, failed to logged in!`);
//                                 reject("access-token invalid");
//                             }
//                         })
//                         .catch(err => reject(err));
//                 } else
//                     reject("no access-token");
//             } else {
//                 decodeJWT(accessToken.replace(/"/g, ""))
//                     .then(res => {
//                         accessToken = res;
//                         if (validate(accessToken, criteria)) {
//                             console.log(`${accessToken.user} with ${accessToken.role} role, logged in!`);
//                             resolve(accessToken);
//                         } else {
//                             console.log(`${accessToken.user} with ${accessToken.role} role, failed to logged in!`);
//                             reject("access-token invalid");
//                         }
//                     })
//                     .catch(err => reject(err));
//             }
//         } catch (error) {
//             reject(error);
//         }
//     });
// };


module.exports = { views, login, query, fetch, fetchGitFile, decodeAccessToken, validateJSON, setUTCTimezoneTo };
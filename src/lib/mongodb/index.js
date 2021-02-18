const crypto = require('../encryptation');
const MongoClient = require('mongodb').MongoClient;

var client = null;
var runs = [];

/*---------------------------------INICIALIZACION DE MONGODB -------------------------------------------------
--------------------------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------------------------*/

const setClient = async (uri) => {

    try {

        const connect = (() => {
            return new Promise((resolve, reject) => {
                client = new MongoClient(uri, { useUnifiedTopology: true, useNewUrlParser: true });
                client.connect(err => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(client);
                    }
                });
            });
        })

        return await connect().catch(e => {
            console.log(e);
            throw "Failed to setClient!";
        });

    } catch (error) {
        console.log(e);
        throw "Failed to setClient!";
    }
    
};

const initPool = (dbName) => {
    return new Promise((resolve, reject) => {
        getClient()
            .then((cli) => {
                const db = cli.db(dbName);
                dbs[dbName] = db;
                resolve(db);
            }).catch((err) => {
                reject(err);
            });
    })
};

const getDb = async (db) => {
    //TODO: si se desconecto o algo
    try {
        if (!client.isConnected)
            await client.connect();
        var res = await client.db(db);
        return res;
    } catch (error) {
        console.log(error);
        throw "Failed to getDb";
    }
    
};

//----------------------------------- IMPLEMENTACION DE FUNCIONES AUXILIARES ---------------------------------------
//----------------------------------------------- DE CONSULTA -----------------------------------------------------

//Me aseguro de que el query y el query options sean objetos
function formatQuery(query) {
    try {
        query = query || {};
        if (typeof query === 'string') query = JSON.parse(query);
        console.log(query);
        return query;
    } catch (error) {
        console.log(error);
        return {};
    }
};

//TODO: reemplazar get y getcount por este metodo generico
function aggregate(database, collection, pipeline, options) {
    console.log(`mongo@aggregate: db: ${database} col: ${collection} pipeline: ${pipeline} options:${options}`);
    // pipeline = formatQuery(pipeline);
    //options = formatQuery(options);
    options.allowDiskUse = true; // con esto me deja hacer querys q usen mas de 100mb
    return new Promise((resolve, reject) => {
        getDb(database)
            .then((db) => {
                return db.collection(collection);
            })
            .then((col) => {
                return col.aggregate(JSON.parse(pipeline), { "allowDiskUse": true }).toArray();
            })
            .then((res) => {
                console.log(`mongo@aggregate: result: ${res}`);
                resolve(res);
            })
            .catch((err) => {
                console.log(`mongo@aggregate: error:${err}`);
                reject(err);
            });
    })
}

//U: guardar un documento en la colleccion 
const post = async(database, collection, document) => {
    try {
        console.log(`mongo@post: db: ${database} col: ${collection} doc: ${document}`);
        var db = await getDb(database);
        var col = await db.collection(collection);
        if (typeof(document) === "object") {
            return col.insertOne(document);
        } else if (typeof(document) === "array") {
            return col.insertMany(document);
        } else {
            if (document) throw "mongoDbHelpers: error in document type: " + document.toString();
            else throw "mongoDbHelpers: error: document is null!";
        }
    } catch (error) {
        console.log(error);
        throw "Failed to post!";
    }
   


    
};

// Funcion que me devuelve un array de todos los elementos de la collecion que coinciden con el query
const get = async (database, collection, query, queryOptions) => {
    try {
        console.log(`mongo@get: db: ${database} col: ${collection} q: ${query} qo:${queryOptions}`);
        query = formatQuery(query);
        queryOptions = formatQuery(queryOptions);

        var db = await getDb(database);
        var col = await db.collection(collection);
        var res = await col.find(query, queryOptions);
        return res.toArray();
    } catch (error) {
        console.log(error);
        throw `Failed to get from: ${database}/${collection}`;
    }
    
};
//FUNCION PARA ACTUALIZAR LOS VALORES DE UN DOCUMENTO
const updateOne = async (database,collection, filter, update, options) => {
    try {
        console.log(`mongo@get: db: ${database} col: ${collection} q: ${filter} qo:${options} updValues:${update}`);
        query = formatQuery(filter);
        queryOptions = formatQuery(options);
        update = formatQuery(update);

        let db = await getDb(database);
        let col = await db.collection(collection);
        let res = await col.updateOne(query, update, queryOptions);
        return res;
    } catch (err) {
        console.log(err);
        throw `Failed to update!`;
    }  
};

//FUNCION PARA ACTUALIZAR LOS VALORES DE UN DOCUMENTO
//TODO: Este update no es un update (replaceOne)
const update = async (database, collection, replacement, query, queryOptions) => {
    try {
        console.log(`mongo@Update: db: ${database} col: ${collection} q: ${query} qo: ${queryOptions}`);
        query = formatQuery(query);
        queryOptions = formatQuery(queryOptions);

        var db = await getDb(database);
        var col = await db.collection(collection);
        var res = await col.replaceOne(query, replacement, { upsert: true });
        return res;
    } catch (error) {
        console.log(error);
        throw `Failed to get from: ${database}/${collection}`;
    }
    

    // console.log(`mongo@Update: db: ${database} col: ${collection} q: ${query} values: ${updateValues}`);
    // query = formatQuery(query);
    // valuesToUpdate = formatQuery(updateValues); //$set operator PARA HACER UPDATE
    // return new Promise((resolve, reject) => {
    //     getDb(database)
    //         .then((db) => {
    //             return db.collection(collection);
    //         })
    //         .then((col) => { //TODO: VERIFICAR QUE LA QUERY TENGA LA ESTRUCTURA SIGUIENTE: updateOne(queryFilter, queryToUpdate) 
    //             //queryToUpdate es una expresión con el operador $set.
    //             return col.updateOne(query, valuesToUpdate); // {usuario: "Pepito"} , {$set: {codigos: [920,910]}}
    //         })
    //         .then((res) => {
    //             console.log(`mongo@update: result: ${res}`);
    //             resolve(res);
    //         })
    //         .catch((err) => {
    //             console.log(`mongo@update: error:${err}`);
    //             reject(err);
    //         })
    // });
}

// Funcion que me devuelve la cantidad de elementos de la collecion que coinciden con el query
function getCount(database, collection, query, queryOptions) {
    console.log(`mongo@getCount: db: ${database} col: ${collection} q: ${query} qo:${queryOptions}`);
    query = formatQuery(query);
    queryOptions = formatQuery(queryOptions);

    return new Promise((resolve, reject) => {
        getDb(database)
            .then((db) => {
                return db.collection(collection);
            })
            .then((col) => {
                return col.count(query, queryOptions);
            })
            .then((res) => {
                console.log(`mongo@getCount: result: ${res}`);
                resolve(res);
            })
            .catch((err) => {
                console.log(`mongo@getCount: error:${err}`);
                reject(err);
            });
    })
};

// Funcion que usamos para borrar un elemento de una bs/collection
const deleteOne = async (database, collection, query, queryOptions) => {
    try {
        console.log(`mongo@deleteOne: db: ${database} col: ${collection} q: ${query} qo:${queryOptions}`);
        query = formatQuery(query);
        queryOptions = formatQuery(queryOptions);

        var db = await getDb(database);
        var col = await db.collection(collection);
        var res = await col.deleteOne(query, queryOptions);
        return res;
    } catch (error) {
        console.log(error);
        throw `Failed to delete one from: ${database}/${collection}`;
    }
};

// Funcion que usamos para borrar todos los elementos de una bs/collection
const deleteMany = async (database, collection, query, queryOptions) => {
    try{
        console.log(`mongo@deleteMany: db: ${database} col: ${collection} q: ${query} qo:${queryOptions}`);
        var db = await getDb(database);
        var col = await db.collection(collection);
        await col.deleteMany(query, queryOptions);
    } catch (error) {
        console.log(error);
        throw "Failed to deletmany!";
    }
};

//----------------------------- IMPLEMENTACION DE LAS FUNCIONES A INVOCAR EXTERNAMENTE ------------------------------------

// TODO: Verifico que el msg tenga el formato correcto
const validateMsg = (msg) => {
    return true;
};

const query = async (msg) => {
    try {
        console.log("Mongodb query: " + JSON.stringify(msg));
        if (validateMsg(msg))
            switch (msg.method) {
                case 'AGGREGATE':
                    return aggregate(msg.db, msg.col, msg.pipeline, msg.options)
                case 'POST':
                    return await post(msg.db, msg.col, msg.content)
                case 'GET':
                    return await get(msg.db, msg.col, msg.query, msg.queryOptions)
                case 'UPDATE_ONE':
                    return await updateOne(msg.db, msg.col, msg.filter, msg.update, msg.options);    
                case 'UPDATE':
                    return await update(msg.db, msg.col, msg.replacement, msg.query, msg.content);
                case 'DELETE_ONE':
                    return deleteOne(msg.db, msg.col, msg.query, msg.queryOptions)
                case 'DELETE':
                    return deleteMany(msg.db, msg.col, msg.query, msg.queryOptions)
                case 'COUNT':
                    return getCount(msg.db, msg.col, msg.query, msg.queryOptions)
                default:
                    throw "Invalid method for mongodb: " + msg.method;
            }
        else {
            throw "Invalid query format for mongodb: " + msg;
        }
    } catch (error) {
        console.log(error);
        throw "Failed query!";
    }
    
};

const getCollections = async (dbName) => {
    try {
        var result = [];
        var db = await client.db(dbName);
        var collections = await db.collections();
        collections.forEach(col => {
            result.push(col.s.namespace.collection)
        });
        return result;
    } catch (error) {
        console.log(error);
        throw "Failed to get collection!"
    }
};

const setRecorridos = (ADN) => {
    Object.values(ADN.queuesListeners).forEach(async (listener) => {
        if (listener.queue === "recorridos") {
            console.log("Seteando Runs...");
            return await listener.action();
        }
    });
}


const setup = async (env, ADN) => {

    try {
        if (client) client.close();
        client = await setClient(env.URI).catch(e => {
            console.log(e);
            throw "Failed to connecto to client at: " + env.URI;
        });
        console.log(`Mongodb: cliente connected succesfully to ${env.URI}`);
        //Popula la base de datos con los recorridos a partir de los eventos de INTI
        //console.log("Iniciando Runs");
        //await setRecorridos(ADN);

        //Borro admins anteriores
        await deleteMany("admin",
            "users",
            {
                role: "admin",
            },
            {}
        );

        var hashedPass = await crypto.encrypt(env.adminPass);
        await post("admin",
            "users",
            {
                user: env.adminUser,
                role: "admin",
                pass: hashedPass
            });
        
    } catch (err) {
        console.log(err);
        throw "Failed to setup MongoDB!";
    }
};

// Interfaz con la bd de MongoDb
module.exports = { setup, query, getCollections }
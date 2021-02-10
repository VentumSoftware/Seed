const path = require('path');
const github = require('../../lib/github');

// Cargo el modulo ADN desde la carpeta donde se decargó
const loadModule = (ADNAbsFolder) => {
    try {
        console.log("ADNTools@loadModule: loading ADN from: " + ADNAbsFolder);
        var ADN = require(ADNAbsFolder);
        return ADN;
    } catch (e) {
        console.log(`Error loading ADN: ${e}`);
        throw e;
    }
}

// Descargo un nuevo ADN desde github
const downloadADN = async (env) => {
    try {
        const user = env.gitUser;
        const repo = env.gitRepo;
        const token = env.gitAuthToken;
        
        console.log("ADNTools@downloadADN: downloading 'ADN' from github repo: " + user + "/" + repo);
        const res = await github.cloneRepo(user, repo, "", token, "./src/ADN");
        return res;
    } catch (e) {
        console.log("error downloading ADN: " + e);
        throw e;
    }
}

//-------------------------------------------------------------

// Me devuelve el "ADN" de la App con todas las reglas de negocios e información para su creación
const getADN = async (env) => {
    try {
        var ADNAbsFolder = path.join(__dirname, "../../ADN");
        console.log("ADN dir: " + ADNAbsFolder);
        if (env.updateADN)
            await downloadADN(env);
        var ADN = loadModule(ADNAbsFolder);
        return ADN;
    } catch (e) {
        console.log("getADN@ADNTools: Error getting ADN: " + e);
        throw e;
    }
}

module.exports = { getADN };
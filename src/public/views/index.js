const { JSDOM } = require('jsdom');
const path = require('path');

const views = {
    dashboard: (req, res, data) => {
        console.log("Dashboard!");
        const originPath = "http://localhost/public/views/dashboard/dashboard.html";
        try {
            JSDOM.fromURL(originPath)
                .then(dom => {
                    var script = dom.window.document.createElement("script");
                    script.type = "module";
                    var innerHTML = `import views from "http://localhost/public/views/views.js";`;
                    innerHTML += `var globalState = {};`;
                    innerHTML += `globalState.dashboard = views.create(${JSON.stringify(data)});`;
                    innerHTML += `console.log(JSON.stringify(globalState));`;
                    innerHTML += `views.show(globalState.dashboard, document.body);`;
                    script.innerHTML = innerHTML;
                    dom.window.document.body.appendChild(script);
                    res.send((dom.serialize()));
                })
                .catch(err => reject(err));
        } catch (error) {
            res.status(500).send(error);
        }
    },
    login: (req, res, data) => {
        console.log("Login!");
        const dirPath = 'http://localhost/public/views/login/login.html';
        console.log(dirPath)
        try {
            JSDOM.fromURL(dirPath)
                .then(dom => {


                    res.send((dom.serialize()));
                })
                .catch(err => console.log(err));
        } catch (error) {
            res.status(500).send(error);
        }
    },
    signup: (req, res, data) => {
        console.log("Signup!");
        const originPath = "http://localhost/public/views/signup/signup.html";
        try {
            JSDOM.fromURL(originPath)
                .then(dom => {
                    res.send((dom.serialize()));
                })
                .catch(err => reject(err));
        } catch (error) {
            res.status(500).send(error);
        }
    }
};

module.exports = views;

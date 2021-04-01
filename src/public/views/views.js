//Herramientas utiles que usamos por ahí
import utils from 'http://localhost/public/views/lib/utils.js';

//Componente "root" del view
import dashboard from "http://localhost/public/views/dashboard/dashboard.js";

//Componentes que pueden ser hijos del "dashboard"
import category from 'http://localhost/public/views/dashboard/category.js';
import categoryParent from 'http://localhost/public/views/dashboard/categoryParent.js';

//Componentes que pueden ser hijos del "category"
import form from 'http://localhost/public/views/dashboard/forms/form.js';
import table from 'http://localhost/public/views/dashboard/table/table.js';
import wizard from 'http://localhost/public/views/dashboard/wizard/wizard.js';
import map from 'http://localhost/public/views/dashboard/maps/maps.js';
import modal from 'http://localhost/public/views/dashboard/modal/modal.js';
import chart from 'http://localhost/public/views/dashboard/chart/chart.js';

//Comandos genéricos para cualquier elemento
var cmds = {
  getState: (state, msg, res) => {
    return new Promise((resolve, reject) => {
      resolve(state);
    });
  },
  parentCmd: (state, msg, res) => {
    try {
      return run(state.parentState, msg.msgs, res);
    } catch (error) {
      console.log(error);
      throw "Failed to run parentCmd";
    }
  },
  childCmd: (state, msg, res) => {
    try {
      var child = state.childs[msg.child];
      return run(child, msg.msgs, res);
    } catch (error) {
      console.log(error);
      throw "Failed to run childCmd";
    }
  },
  showModal: (state, msg, res) => {
    return new Promise((resolve, reject) => {
        try {
            modal.show(state.childs[msg.child], state);
            resolve();
        } catch (error) {
            console.log(error)
            reject("Failed to show modal!");
        }
    })
  },
  fetch: (state, msg, res) => {
    try {
      var options = {
        method: msg.method || 'GET',
        mode: msg.mode || 'cors',
        cache: msg.cache || 'no-cache',
        credentials: msg.credentials || 'same-origin',
        headers: msg.headers || { 'Content-Type': 'application/json' },
        redirect: msg.redirect || 'follow',
        referrerPolicy: msg.referrerPolicy || 'no-referrer',
      };
      if (options.method === "POST") {
        options.body = msg.body || {};
        if (typeof options.body === 'object') options.body = JSON.stringify(options.body);
        options.body = utils.evalString(options.body, { state: state, msg: msg, res: res });
      };
      console.log(`fetch url: ${msg.url}  options: ${JSON.stringify(options)}`);
      return fetch(msg.url, options);
    } catch (error) {
      console.log(error);
      return Promise.reject("Failed fetch cmd!");
    }
  },
  if: (state, msg, res) => {
    return new Promise((resolve, reject) => {
      if (eval(msg.condition)) {
          console.log("condicion cumplida!");
      } else {
          console.log("condicion NO cumplida!");
      }
      resolve("ok");
    });
  },
  showCmd: (state, msg, res) => {
    return new Promise((resolve, reject) => {
      try {
        eval(state.type).show(state, msg.parent);
        resolve("ok");
      } catch (error) {
        console.log(error);
        reject(`Failed to show: ${state}`);
      }
    });
  }
};

//Ejecuta una lista de comandos
const run = (state, msgs, res) => {
  return new Promise((resolve, reject) => {
    try {
      //Si msgs es un objeto lo convierto a un array
      if (typeof msgs === 'object') msgs = Object.values(msgs);

      //A: Si ya ejecuté todos los comandos termino
      if (Object.keys(msgs).length === 0) {
        //console.log(`run completed "state": ${JSON.stringify(state)}`);
        console.log(`run completed "state": ${state.type}`);
        console.log(`run completed "res": ${JSON.stringify(res)}`);
        resolve(res);
      } else {
        console.log(`run "state": ${JSON.stringify(state.type)}`);
        console.log(`run "msgs": ${JSON.stringify(msgs)}`);
        var msg = msgs.shift();
        var cmd = eval(state.type).cmds[msg.type] || cmds[msg.type];
        if (cmd === null || cmd === undefined) {
          reject(`Cmd: ${msg.type} not found!`);
        } else {
          var c = () => cmd(state, msg, res);
          c()
            .then((res) => {
              return run(state, msgs, res);
            })
            .then((res) => resolve(res))
            .catch(err => {
              console.log(err);
              reject("Failed to run msg!");
            });
        }
      }
    } catch (error) {
      console.log(error);
      reject(`run failed: ${JSON.stringify(msgs)}`)
    }
  });
};

const create = (newState) => {
  try {
    newState = utils.fillObjWithDflt(newState, eval(newState.type).dfltState);
    Object.entries(newState.childs).forEach(child => {
      if (eval(newState.type).childTypes.includes(child[1].type)) {
        child[1].path = newState.path + "/" + child[0];
        newState.childs[child[0]] = create(child[1]);
      } else {
        throw `Incorrect child type (${child[1].type}) for ${newState.type}`;
      }
      
    });
  } catch (error) {
    console.log(error);
    throw "Failed to create state: " + JSON.stringify(newState);
  }
  return newState;
};

const show = (state, parent) => {
  try {
    eval(state.type).show(state, parent);
  } catch (error) {
    console.log(error);
    throw "Failed to show state: " + JSON.stringify(state);
  }
  return state;
};


export default { cmds, run, create, show };
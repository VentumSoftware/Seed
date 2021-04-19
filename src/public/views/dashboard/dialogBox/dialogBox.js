import utils from '../../lib/utils.js';
import card from '../card/card.js';
import buttons from '../buttons/buttons.js';
import modal from '../modal/modal.js';
import dashboard from '../dashboard.js';

const dfltState = {
  type: "dialog-box",
  id: "noID",
  title: "Dialog Box",
  text: "",
  footerBtns: {
  },
};

var states = [];

//-----------------------------------------------------------------------------------------------

const cmd = (state, cmds, res, pos) => {

    const parentCmd = (state, payload, res) => {
        switch (state.parentState.type) {
            case "modal":
                payload.cmds = payload.cmds || res;
                return modal.cmd(state.parentState, payload.cmds, res, 0);
            default:
                return new Promise((resolve, reject) => {
                    reject("Error with type: " + key);
                })
        }
    };

    const pushForm = (state, payload, res) => {
        return new Promise((success, failed) => {
            try {
                console.log("cmd: pushForm. Payload: " + JSON.stringify(payload));
                modal.show(state, { spinner: {} });
                var options = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify(state)
                };
                fetch(payload.fetchPath, options)
                    .then(() => {
                        dashboard.reloadCat();
                        dismissModal();
                        success("ok");
                    })
                    .catch((err) => {
                        console.log(err);
                        failed(err);
                    });


            } catch (error) {
                console.log(error);
                failed(error);
            }
        });
    };

    // const dismissModal = (state, payload, res) => {
    //     return new Promise((success, failed) => {
    //         try {
    //             console.log("cmd: dismissModal. Payload: " + JSON.stringify(payload));
    //             const modalData = modal.getData();
    //             console.log("cmodalData: " + JSON.stringify(modalData));
    //             modal.close();
    //             success(modalData);
    //         } catch (error) {
    //             console.log(error);
    //             failed(error);
    //         }
    //     });
    // };

    const getData = (state, payload, res) => {
        return new Promise((resolve, reject) => {
            resolve(state.inputs);
        });
    };

    const getState = (state, payload, res) => {
        return new Promise((resolve, reject) => {
            resolve(state);
        });
    };

    

    return new Promise((resolve, reject) => {
        //A: Si ya ejecute todos los comandos termino
        if (Object.keys(cmds).length <= pos) {
            resolve(res);
        } else {
            console.log(`cmds´(${JSON.stringify(pos)}): ${JSON.stringify(cmds)}`);
            var c = null;
            var command = cmds[pos];
            switch (command.type) {
                case "parent-cmd":
                    c = () => parentCmd(state, command.payload, res);
                    break;
                case "push-form":
                    c = () => pushForm(state, command.payload, res);
                    break;
                case "dissmis-modal":
                    c = () => dismissModal(state, command.payload, res);
                    break;
                case "get-state":
                    c = () => getState(state, command.payload, res);
                    break;
                case "get-data":
                    c = () => getData(state, command.payload, res);
                    break;
                default:
                    console.log(`Cmd not found: ${command.type}`);
                    c = () => new Promise((res, rej) => { rej(`Cmd not found: ${command.type}`) });
                    break;
            }

            c()
                .then((res) => {
                    cmd(state, cmds, res, pos + 1);
                })
                .then((res) => resolve(res))
                .catch(err => {
                    console.log(err);
                    reject(err);
                });
        }
    })
};

const create = (newState, path) => {
    try {
        if (newState.type == "dialog-box") {
            newState = utils.fillObjWithDflt(newState, dfltState);
            newState.path = path;

            states.push(newState);
            return newState;
        } else {
            console.log("Error creating doalog box, incorrect type: " + newState.type);
            return null;
        }
    } catch (error) {
        console.log(error);
        return null;
    }
};

const show = (state, parent) => {
    const drawDialogBox = () => {
        try {
            var body = document.createElement("div");
            body.id = state.id + "-dialogbox";
            body.style.margin = "20px";
            body.innerHTML = state.text;
            cardParent.body.appendChild(body);

            var row = document.createElement("div");
            row.id = state.id + "-row";
            row.className = "row";
            form.appendChild(row);

            var btns = Object.entries(state.footerBtns);
            var btnsCount = 0;
            btns.forEach(([key, value]) => {
                if (value)
                    btnsCount++;
            });

            var btnsRow = document.createElement("div");
            btnsRow.className = "row";
            cardParent.footer.appendChild(btnsRow);

            console.log("btncount: " + btnsCount.toString());
            btns.forEach(([key, value]) => {
                if (btnsCount < 3)
                    value.showLabel = true;
                else
                    value.showLabel = false;
                var btnDiv = document.createElement("div");
                switch (btnsCount) {
                    case 1:
                        btnDiv.className += "col-12";
                        break;
                    case 2:
                        btnDiv.className += "col-6";
                        break;
                    case 3:
                        btnDiv.className += "col-4";
                        break;
                    case 4:
                        btnDiv.className += "col-3";
                        break;
                    case 5:
                        btnDiv.className += "col-2";
                        break;
                    case 6:
                        btnDiv.className += "col-2";
                        break;
                    default:
                        btnDiv.className += "col-12";
                        break;
                }
                btnsRow.appendChild(btnDiv);
                var btn = buttons.createBtn(value, state);
                btnDiv.appendChild(btn);
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    cmd(state, value.onClick.cmds, null, 0);
                });
            });
            return form;

        } catch (error) {
            console.log(error);
        }
    };
    console.log("Dialog box show: " + JSON.stringify(state));
    const cardParent = card.create({ title: state.title }, parent);
    drawDialogBox();
};

export default { create, show, cmd };
import card from '../card/card.js';
import buttons from '../buttons/buttons.js';
//import views from '../../views';
import views from "../../views.js";

//Caracteristicas de este componente (category)
const component = {
    //Dflt Dashboards State
    dfltState: {
        id: "noID",
        title: "Form",
        inputs: {},
        footerBtns: {},
        childs: {},
        html: {}
    },
    //Commandos específicos para el componente (dashboard)
    cmds: {
        getData : (state, payload, res) => {
            return new Promise((resolve, reject) => {
                resolve(state.inputs);
            });
        }
    },
    //Typos de hijos que puede tener el componente (dashboard)
    childTypes: ["modal"],
    //Función que dibuja al componente (dashboard)
    show: (state, parent) => {
        const drawForm = () => {
            try {
                var form = document.createElement("form");
                form.id = state.id + "-form";
                form.style.margin = "20px";
                cardParent.body.appendChild(form);
    
                var row = document.createElement("div");
                row.id = state.id + "-row";
                row.className = "row";
                form.appendChild(row);
    
                Object.values(state.cols).forEach(col => {
                    var inputCol = document.createElement("div");
                    inputCol.className = "col";
                    row.appendChild(inputCol);
                    state.inputs = {};
                    Object.values(col).forEach(input => {
                        var inputRow = document.createElement("div");
                        inputRow.className = "row";
                        inputRow.style.marginTop = "8px";
                        inputRow.style.marginBottom = "8px";
                        inputCol.appendChild(inputRow);
                        var label = document.createElement("label");
                        label.className = "col-md-4 col-form-label";
                        label.innerHTML = input.label;
                        inputRow.appendChild(label);
                        var inputDiv = document.createElement("div");
                        inputDiv.className = "col-md-8";
                        inputRow.appendChild(inputDiv);
                        // var inputSubDiv = document.createElement("div");
                        // inputSubDiv.className = "form-group";
                        // inputDiv.appendChild(inputSubDiv);
                        var inputIn = document.createElement("input");
                        state.inputs[input.name] = input.value;
    
                        //readonly class="form-control-plaintext" id="staticEmail" value="email@example.com"
                        switch (input.type) {
                            case "text":
                                inputIn.className = "form-control";
                                inputIn.placeholder = input.placeholder;
                                break;
                            case "date":
                                inputIn.className = "form-control";
                                inputIn.placeholder = input.placeholder;
                                inputIn.type = "date"
                                break;
                            case "fixed":
                                inputIn.readOnly = true;
                                inputIn.className = "form-control-plaintext";
                                inputIn.value = input.value;
                                break;
                            case "fixed-hour":
                                inputIn.readOnly = true;
                                inputIn.className = "form-control-plaintext";
                                //TODO: VER SI HAY UN MEMORY LEAK ACÁ, O SI TENGO Q GUARDAR LA REF PARA MATARLO
                                var d = new Date();
                                var n = `${("0" + d.getHours()).slice(-2)}:${("0" + d.getMinutes()).slice(-2)}:${("0" + d.getSeconds()).slice(-2)}`;
                                inputIn.value = n;
                                state.inputs[input.label] = inputIn.value;
                                setInterval(() => {
                                    var d = new Date();
                                    var n = `${("0" + d.getHours()).slice(-2)}:${("0" + d.getMinutes()).slice(-2)}:${("0" + d.getSeconds()).slice(-2)}`;
                                    inputIn.value = n;
                                    state.inputs[input.label] = inputIn.value;
                                }, 1000);
                                break;
                            case "fixed-date":
                                inputIn.readOnly = true;
                                inputIn.className = "form-control-plaintext";
                                var d = new Date();
                                var n = `${(d.getUTCFullYear())}/${("0" + (d.getUTCMonth() + 1)).slice(-2)}/${("0" + d.getUTCDate()).slice(-2)}`;
                                inputIn.value = n;
                                state.inputs[input.label] = inputIn.value;
                                setInterval(() => {
                                    var d = new Date();
                                    var n = `${(d.getUTCFullYear())}/${("0" + (d.getUTCMonth() + 1)).slice(-2)}/${("0" + d.getUTCDate()).slice(-2)}`;
                                    state.inputs[input.label] = inputIn.value;
                                }, 1000);
                                break;
                            default:
                                inputIn.className = "form-control";
                                inputIn.placeholder = input.placeholder;
                                break;
                        }
    
                        inputIn.addEventListener('change', (event) => {
                            state.inputs[input.name] = event.target.value;
                        });
    
                        inputDiv.appendChild(inputIn);
    
    
                    });
                });
    
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
                        views.run(state, value.onClick.msgs, null);
                    });
                });
                return form;
    
            } catch (error) {
                console.log(error);
            }
        };
        console.log("Form show: " + JSON.stringify(state));
        const cardParent = card.create({ title: state.title }, parent);
        state.inputs = {};
        drawForm();
    }
};

export default component;
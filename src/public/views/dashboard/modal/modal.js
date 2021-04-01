import utils from 'http://localhost/public/views/lib/utils.js';
import card from 'http://localhost/public/views/dashboard/card/card.js';
import form from 'http://localhost/public/views/dashboard/forms/form.js';
import buttons from 'http://localhost/public/views/dashboard/buttons/buttons.js';
//import views from '../../views';
import views from "http://localhost/public/views/views.js";

//Caracteristicas de este componente (modal)
const component = {
    //Dflt Modal State
    dfltState: {
        type: "modal",
        width: "auto",
        title: "NO TITLE",
        text: "",
        width: "50%",
        footerBtns: {},
        childs: {}
    },
    //Commandos específicos para el componente (modal)
    cmds: {
        showSpinner : (state, payload, res) => {
            //<div class="d-flex justify-content-center"></div>
    
            var justifyDiv = document.createElement("div");
            justifyDiv.className = "d-flex justify-content-center";
            parent.appendChild(justifyDiv);
    
            var spinnerBorder = document.createElement("div");
            spinnerBorder.className = "spinner-border text-light";
            spinnerBorder.role = "status";
            justifyDiv.appendChild(spinnerBorder);
    
            var span = document.createElement("div");
            span.className = "sr-only";
            span.innerHTML = "Loading...";
            spinnerBorder.appendChild(span);
        },
    
        hideSpinner : (state, payload, res) => {
            var justifyDiv = document.createElement("div");
            justifyDiv.className = "d-flex justify-content-center";
            parent.appendChild(justifyDiv);
    
            var spinnerBorder = document.createElement("div");
            spinnerBorder.className = "spinner-border text-light";
            spinnerBorder.role = "status";
            justifyDiv.appendChild(spinnerBorder);
    
            var span = document.createElement("div");
            span.className = "sr-only";
            span.innerHTML = "Loading...";
            spinnerBorder.appendChild(span);
        },
    
        closeModal : (state, payload, res) => {
            return new Promise((resolve, reject) => {
                $('#modal-root').modal('hide');
                resolve(payload.res);
            })
        }
    },
    //Typos de hijos que puede tener el componente (modal)
    childTypes: ["form", "table", "maps", "modal"],
    show: (state, parent) => {

        // const spinner = (payload, parent) => {
        //     //<div class="d-flex justify-content-center"></div>
    
        //     var justifyDiv = document.createElement("div");
        //     justifyDiv.className = "d-flex justify-content-center";
        //     parent.appendChild(justifyDiv);
    
        //     var spinnerBorder = document.createElement("div");
        //     spinnerBorder.className = "spinner-border text-light";
        //     spinnerBorder.role = "status";
        //     justifyDiv.appendChild(spinnerBorder);
    
        //     var span = document.createElement("div");
        //     span.className = "sr-only";
        //     span.innerHTML = "Loading...";
        //     spinnerBorder.appendChild(span);
        // }
    
        const showModal = () => {
    
            const createRow = (parent) => {
                const margins = 20;
                var row = document.createElement("div");
                row.style.position = 'relative';
                // row.style.left = margins + 'px';
                // row.style.right = margins + 'px';
                // row.style.top = margins + 'px';
                // row.style.bottom = margins + 'px';
                row.style.marginBottom = "20px";
                row.style.width = (parent.offsetWidth - margins) * 100 / parent.offsetWidth + '%';
                row.style.height = 'auto';
                row.className += " row";
                // tableRoot.style.height = (parent.offsetHeight - margins * 2) * 100 / parent.offsetHeight + '%';
                parent.appendChild(row);
                return row;
            };
    
            const createCol = (parent) => {
                const margins = 0;
                var col = document.createElement("div");
                col.style.position = 'relative';
                col.style.left = margins + 'px';
                col.style.right = margins + 'px';
                col.style.top = margins + 'px';
                col.style.bottom = margins + 'px';
                col.style.width = (parent.offsetWidth - margins * 2) * 100 / parent.offsetWidth + '%';
                col.style.height = 'auto';
                col.className += " col";
                // tableRoot.style.height = (parent.offsetHeight - margins * 2) * 100 / parent.offsetHeight + '%';
                parent.appendChild(col);
                return col;
            };
    
            const createFooterBtns = (parent) => {
                const footer = document.getElementById('modal-footer');
                footer.innerHTML = null;
                var btns = Object.entries(state.footerBtns);
                var btnsCount = 0;
                btns.forEach(([key, value]) => {
                    if (value)
                        btnsCount++;
                });
    
                var btnsRow = document.createElement("div");
                btnsRow.className = "row";
                btnsRow.style["justify-content"] = "flex-end";
                btnsRow.style.width = "100%";
                footer.appendChild(btnsRow);
    
                console.log("btncount: " + btnsCount.toString());
                btns.forEach(([key, value]) => {
                    // if (btnsCount < 3)
                    //     value.showLabel = true;
                    // else
                    //     value.showLabel = false;
                    var btnDiv = document.createElement("div");
                    btnDiv.className += "col-3";
                    // switch (btnsCount) {
                    //     case 1:
                    //         btnDiv.className += "col-12";
                    //         break;
                    //     case 2:
                    //         btnDiv.className += "col-6";
                    //         break;
                    //     case 3:
                    //         btnDiv.className += "col-4";
                    //         break;
                    //     case 4:
                    //         btnDiv.className += "col-3";
                    //         break;
                    //     case 5:
                    //         btnDiv.className += "col-2";
                    //         break;
                    //     case 6:
                    //         btnDiv.className += "col-2";
                    //         break;
                    //     default:
                    //         btnDiv.className += "col-12";
                    //         break;
                    // }
                    btnsRow.appendChild(btnDiv);
                    var btn = buttons.createBtn(value, state);
                    btnDiv.appendChild(btn);
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        views.run(state, value.onClick.msgs, null);
                    });
                });
            };
    
            //Limpio el modal anterior
            document.getElementById("modal-body").innerHTML = null;
            document.getElementById("modal-header").childNodes[1].innerHTML = state.title;
            document.getElementById("modal-footer").innerHTML = null;
            
            var modalDialog = document.getElementById("modal-dialog")
            modalDialog.style["max-width"] = "9999px"; // Esto es para sacar el maxwidth de la clase "modal-dialog"
            modalDialog.style.width = state.width;
    
            if (state.content != null) {
                const showContent = () => {
                    try {
                        const body = document.getElementById('modal-body');
                        Object.values(state.content.rows).forEach(row => {
                            var rowDiv = createRow(body);
                            Object.values(row.cols).forEach(col => {
                                var colDiv = createCol(rowDiv);
                                Object.values(col).forEach(element => {
                                    console.log("show child: " + element);
                                    var content = state.childs[element];
                                    console.log("content: " + JSON.stringify(content))
                                    switch (content.type) {
                                        case "wizard":
                                            wizard.show(content, colDiv);
                                            break;
                                        case "table":
                                            table.show(content, colDiv);
                                            break;
                                        case "form":
                                            form.show(content, colDiv);
                                            break;
                                        case "map":
                                            maps.show(content, colDiv);
                                            break;
                                        default:
                                            console.log("no se reconoce el tipo " + content.type)
                                            break;
                                    }
                                });
                            });
                        });
                    } catch (error) {
                        console.log("Error showing modal! " + error);
                    }
                };
    
                showContent();
            } else {
                document.getElementById("modal-body").innerHTML = state.text;
            }
    
            createFooterBtns(parent);
    
            $('#modal-root').modal('show');
        };
    
        console.log("Modal show: " + JSON.stringify(state));
    
        showModal();
    }
};

export default component;
import utils from 'http://localhost/public/views/lib/utils.js';
import form from 'http://localhost/public/views/dashboard/forms/form.js';
import modal from 'http://localhost/public/views/dashboard/modal/modal.js';
import table from 'http://localhost/public/views/dashboard/table/table.js';

//Caracteristicas de este componente (modal)
const component = {
    //Dflt Modal State
    dfltState: {
        id: "noId",
        name: "No Name",
        pages: {},
        selectedPage: 0,
        childs: {},
        html:{}
    },
    //Commandos específicos para el componente (modal)
    cmds: {
        goTo : (state, payload, res) => {
        
            return new Promise((resolve, reject) => {
                try {
                    state.selectedPage = payload.selectedPage;
                    show(state, null);
                    resolve("ok");
                } catch (error) {
                    reject(error);
                }
                
            })
        }
    },
    //Typos de hijos que puede tener el componente (modal)
    childTypes: ["form", "table", "maps", "modal"],
    show: (state, parent) => {

        const createRow = (parent) => {
            const margins = 20;
            var row = document.createElement("div");
            row.style.position = 'relative';
            row.style.left = margins + 'px';
            row.style.right = margins + 'px';
            row.style.top = margins + 'px';
            row.style.bottom = margins + 'px';
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
    
        console.log("Wizard show: " + JSON.stringify(state));
        
        try {
            if (parent == null) {
                parent = state.parent;
            } else {
                state.parent = parent;
            }
            
            parent.innerHTML = null;
            Object.values(state.pages[state.selectedPage].rows).forEach(row => {
                var rowDiv = createRow(parent);
                Object.values(row.cols).forEach(col => {
                    var colDiv = createCol(rowDiv);
                    Object.values(col).forEach(element => {
                        var element = state.childs[element];
                        switch (element.type) {
                            case "wizard":
                                wizard.show(element, colDiv);
                                break;
                            case "table":
                                table.show(element, colDiv);
                                break;
                            case "form":
                                form.show(element, colDiv);
                                break;
                            default:
                                console.log("Incorrect child type for wizard: " + element.type);
                                break;
                        }
                    });
                });
            });
        } catch (error) {
            console.log(error);
            return null;
        }
    }
};

export default component;
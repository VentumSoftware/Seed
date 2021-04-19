import views from "../views.js";

//Caracteristicas de este componente (category)
const component = {
    //Dflt Dashboards State
    dfltState: {
        id: "noId",
        name: "Category",
        access: {},
        childs: {},
        html: {}
    },
    //Commandos específicos para el componente (dashboard)
    cmds: {
        selectCategory: (state, payload, res) => {
            return new Promise((resolve, reject) => {
                try {
                    console.log("Category LOG:" + payload.catPath);
        
                    var dirs = payload.catPath.split('/');
                    var cat = state.childs[dirs[0]];
                    for (let i = 1; i < dirs.length; i++) {
                        cat = cat.childs[dirs[i]];
                    }
                    // var sidebar = document.getElementById(state.id + "-sidebar");
                    // sidebar.childNodes.forEach(child => {
                    //     child.childNodes.forEach(grandChild => {
                    //         grandChild.childNodes[0].style.color = "";
                    //     });
                    // });
        
                    // var sidebar = document.getElementById(state.id + "-sidebar");
                    // //el "+5" es por los elementos de arriba del sidebar: nombreEmpresa, usuario, lineas y espacios
        
                    // var selected = sidebar.childNodes[index + 5];
                    // console.log(selected);
        
                    // selected.childNodes.forEach(child => {
                    //     child.childNodes[0].style.color = "green";
                    // });
        
                    // if (dirs[1] != null) {
        
                    // }
                    var msgs = {
                        0: {
                            type: "parentCmd",
                            payload: {
                                type: "clearContent"
                            }
                        },
                        1: {
                            type: "parentCmd",
                            payload: {
                                type: "getState"
                            }
                        }
                    }

                    views.run(state, msgs, null)
                        .then((parentState) => {
                            console.log("showing selected Cat: " + state.name);
                            views.show(cat, parentState.html.contentDiv);
                            resolve(cat);
                        })
                        .catch(err => {
                            console.log(err);
                        });
        
                } catch (error) {
                    console.log("Error with selected cat! " + error);
                    reject(error);
                }
            });
        },
        logOut: (state, payload, res) => {
            return new Promise((resolve, reject) => {
                try {
                    document.cookie = "access-token=; expires=0; path=/";
                    location.reload();
                    resolve("logOut");
                } catch (error) {
                    console.log(error);
                    reject("logOut failed!");
                }
            });
        },
    },
    //Typos de hijos que puede tener el componente (dashboard)
    childTypes: ["form", "table", "map", "wizard", "chart"],
    //Función que dibuja al componente (dashboard)
    show: (state, parent) => {

        const showContent = () => {
    
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
    
            try {
                Object.values(state.content.rows).forEach(row => {
                    var rowDiv = createRow(parent);
                    Object.values(row.cols).forEach(col => {
                        var colDiv = createCol(rowDiv);
                        Object.values(col).forEach(element => {
                            console.log("show child: " + element);
                            var content = state.childs[element];
                            //console.log("content: " + JSON.stringify(content))
                            views.show(content, colDiv);
                        });
                    });
                });
            } catch (error) {
                console.log("Error showing category! " + error);
            }
        };
    
        //console.log("Category show: " + JSON.stringify(state));
        console.log("Category show: " + state.name);
        showContent();
    }
};

export default component;

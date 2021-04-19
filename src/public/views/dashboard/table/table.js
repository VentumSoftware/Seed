import views from "../../views.js";

import card from '../card/card.js';
import buttons from '../buttons/buttons.js';
//import views from '../../views';

//Caracteristicas de este componente (table)
const component = {
    //Dflt Dashboards State
    dfltState: {
        id: "noID",
        title: "Table",
        fetchPath: "/api/aggregate",
        headers: {},
        filters: {},
        headerBtns: {},
        initialStages: {},
        finalStages: {},
        footerBtns: {},
        rowsData: [],
        emptyCellChar: "-",
        selectedPage: 0,
        paginationIndex: 0,
        rowCount: 10,
        html: {} // Referencias de la UI, ignorar en la serialización
    },
    //Commandos específicos para el componente (table)
    cmds: {
        getRows: (state, payload, res) => {
            return new Promise((resolve, reject) => {
                resolve(state.inputs);
            });
        },
        getSelectedRows: (state, payload, res) => {
            var result = [];
            return new Promise((resolve, reject) => {
                try {
                    for (let index = 0; index < state.html.rowsCheckboxs.length; index++) {
                        if (state.html.rowsCheckboxs[index].checked) result.push(state.rowsData[index]);
                    }
                    resolve(result);
                } catch (error) {
                    console.log(error);
                    reject("Failed to get selected rows!");
                }
            })
        },
        filter: (state, payload, res) => {
            return new Promise((res, rej) => {
                state.selectedPage = 0;
                state.paginationIndex = 0;
                views.run(state, { 0: { type: "update" } })
                    .then(() => {
                        console.log("updated");
                        res();
                    })
                    .catch(err => {
                        console.log("failed update: " + err);
                        rej();
                    });
            });
    
        },
        //Updates table data and view
        update : (state, payload, res) => {

            const updateTargetedBtns = () => {
                    try {
                        const enableBtns = (enable) => {
                            var targetedBtns = state.html.targetedBtns;
                            targetedBtns.forEach((btn) => {
                                btn.disabled = !enable;
                            });
                            console.log(`enable targeted Btns (${targetedBtns.length}): " + ${(!enable).toString()}`);
                        };
        
                        var enable = false;
                        state.html.rowsCheckboxs.forEach((checkbox) => {
                            if (checkbox.checked) {
                                enable = true;
                            }
                        });
        
                        enableBtns(enable);
                    } catch (error) {
                        console.log(error);
                        throw "Failed to update targeted btns!";
                    }
            };

            const fetchData = () => {

                const getFiltersValues = () => {
                    try {
                        var result = {};
                        if (state.filterForm) {
                            const formData = new FormData(state.filterForm);
                            var i = 0;
                            for (var pair of formData.entries()) {
                                result[pair[0]] = pair[1];
                            }
                        };
                        console.log("filter values: " + JSON.stringify(result));
                        return result;
                    } catch (error) {
                        console.log(error);
                        throw "Failed to getFilterValues!";
                    }
                    
                };

                const getRows = () => {

                    const buildPipeline = (filters) => {

                        const buildStage = (key, value) => {

                            const getStageDefinition = () => {
                                try {
                                    var result = null;
                                    if (value == "")
                                        return result;
                                    Object.keys(state.filters).forEach((index) => {
                                        Object.keys(state.filters[index].inputs).forEach((filter) => {
                                            if (state.filters[index].inputs[filter].name == key) {
                                                result = state.filters[index].inputs[filter].stage;
                                                console.log(result);
                                            }
                                        })
                                    })
                                    return result;
                                } catch (error) {
                                    console.log(error);
                                    throw "Failed to getStageDefinition!"; 
                                }
                            };

                            try {
                                var result = "";
                                var stageDef = getStageDefinition();
                                if (stageDef != null) {
                                    switch (stageDef.type) {
                                        case "match":
                                            switch (stageDef.transform) {
                                                case "date":
                                                    value = formatDateToQuery(value);
                                                    break;
                                                case "number":
                                                    result += `{"$addFields":{"paquete.vel":{"$toInt": "$paquete.Velocidad"}}},`;
                                                    value = parseInt(value);
                                                    break;
                                                default:
                                                    break;
                                            }
                                            var op = "";
                                            switch (typeof (stageDef.op)) {
                                                case 'string':
                                                    if (stageDef.transform == "number") {
                                                        op = `{"${stageDef.op}":${value}}`;
                                                    } else {
                                                        op = `{"${stageDef.op}":"${value}"}`;
                                                    }
                                                    break;
                                                case 'undefined':
                                                    op = `"${value}"`;
                                                    break;
                                                case 'object':
                                                    //TODO
                                                    break;
                                                default:
                                                    break;
                                            }
                                            result += `{"$match":{"${stageDef.var}":${op}}},`;
                                            break;
                                        default:
                                            break;
                                    }
                                }
                                return result;
                            } catch (error) {
                                console.log(error);
                                throw "Failed to buildStage!"; 
                            }

                            
                        }

                        try {
                            var result = "[";
                            Object.keys(filters).forEach(key => {
                                result += buildStage(key, filters[key]);
                            });
                            Object.keys(state.finalStages).forEach((key) => {
                                result += state.finalStages[key] + ",";
                            });
                            result += `{"$skip": ${state.selectedPage * 10} },{"$limit": ${state.rowCount} }]`; //Ordenamiento descendente por Hora (de nuevo a viejo) -- Hasta 10 resultados.
                            console.log("Pipeline: " + result);
                            return result;
                        } catch (error) {
                            console.log(error);
                            throw "Failed to buildPipeline!";
                        }
                        
                    };

                    return new Promise((resolve, reject) => {
                        const filters = getFiltersValues(); //devuelve un string
                        const pipeline = buildPipeline(filters);//devuelve un string
                        const queryOptions = "{'collation':{'locale':'en_US','numericOrdering':true},'allowDiskUse':true}";
                        const path = state.fetchPath;

                        views.run(state,
                            {
                                0: {
                                    type: "fetch",
                                    url: path,
                                    method: "POST",
                                    body: {
                                        pipeline: pipeline,
                                        queryOptions: queryOptions
                                    }
                                }
                            },
                            null)
                            .then(response => response.json())
                            .then(rows => resolve(rows))
                            .catch(e => {
                                console.log(e);
                                reject("Failed to get Rows!");
                            });

                    });
                }

                const getCount = () => {
                    const buildPipeline = (filters) => {

                        const buildStage = (key, value) => {
                            console.log(key);
                            console.log(value);

                            const getStageDefinition = () => {
                                var result = null;
                                if (value == "")
                                    return result;
                                Object.keys(state.filters).forEach((index) => {
                                    Object.keys(state.filters[index].inputs).forEach((filter) => {
                                        if (state.filters[index].inputs[filter].name == key) {
                                            result = state.filters[index].inputs[filter].stage;
                                            console.log(result);
                                        }
                                    })
                                })
                                return result;
                            };

                            var result = "";
                            var stageDef = getStageDefinition();
                            console.log(stageDef);
                            if (stageDef != null) {
                                switch (stageDef.type) {
                                    case "match":
                                        switch (stageDef.transform) {
                                            case "number":
                                                result += `{"$addFields":{"paquete.vel":{"$toInt": "$paquete.Velocidad"}}},`;
                                                value = parseInt(value);
                                                break;
                                            case "date":
                                                value = formatDateToQuery(value);
                                                break;
                                            default:
                                                break;
                                        }
                                        var op = "";
                                        switch (typeof (stageDef.op)) {
                                            case 'string':
                                                if (stageDef.transform == "number") {
                                                    op = `{"${stageDef.op}":${value}}`;
                                                } else {
                                                    op = `{"${stageDef.op}":"${value}"}`;
                                                }
                                                break;
                                            case 'undefined':
                                                op = `"${value}"`;
                                                break;
                                            case 'object':
                                                //TODO
                                                break;
                                            default:
                                                break;
                                        }
                                        result += `{"$match":{"${stageDef.var}":${op}}},`;
                                        break;
                                    default:
                                        break;
                                }
                            }
                            return result;
                        }

                        var result = "[";
                        Object.keys(filters).forEach(key => {
                            result += buildStage(key, filters[key]);
                        });
                        Object.keys(state.finalStages).forEach((key) => {
                            result += state.finalStages[key] + ",";
                        })
                        result += `{ "$count": "count" }]`; //Ordenamiento descendente por Hora (de nuevo a viejo) -- Hasta 10 resultados.
                        console.log(result);
                        return result;
                    };
                    var path = state.fetchPath;
                    var filters = getFiltersValues();
                    var pipeline = buildPipeline(filters);

                    return new Promise((resolve, reject) => {
                        const queryOptions = `{"collation":{"locale":"en_US","numericOrdering":"true"},"allowDiskUse":"true"}`;

                        views.run(state,
                            {
                                0:{
                                    type: "fetch",
                                    url: path,
                                    method: "POST",
                                    body: {
                                        pipeline: pipeline,
                                        queryOptions: queryOptions
                                    }
                                }
                            },
                            null)
                            .then(res => {
                                console.log(res);
                                return res.json();
                            })
                            .then(res => {
                                console.log(res);
                                resolve(res);
                            })
                            .catch(err => {
                                console.log(err);
                                reject("Failed to get count!")
                            });
                    });
                };

                return new Promise((resolve, reject) => {
                    var result = {};
                    getRows()
                        .then(rows => {
                            result.rows = rows;
                            return getCount();
                        })
                        .then(count => {
                            if (count[0])
                                result.count = count[0].count;
                            else
                                result.count = 0;
                            resolve(result);
                        })
                        .catch(err => {
                            console.log(err);
                            reject("Failed to get Rows!");
                        });
                });
            };

            const drawRows = (data) => {
                try {

                    const getCellValue = (row, path) => {
                        if (row[path[0]] == null) {
                            return null;
                        } else if (path.length > 1) {
                            var temp = path.shift();
                            return getCellValue(row[temp], path);
                        } else {
                            return row[path[0]];
                        }
                    }

                    console.log("drawRows data: " + JSON.stringify(data));
                    console.log("drawRows headers: " + JSON.stringify(state.headers));

                    //Borro lo anterior
                    state.html.rowsRoot.innerHTML = "";
                    state.html.rowsCheckboxs = [];

                    data.forEach(row => {
                        
                        var tr = document.createElement("tr");
                        tr.className = "";
                        state.html.rowsRoot.appendChild(tr);

                        var addCheckbox = false;
                        //Si hay algun boton "targeted" agrego el checkbos a las filas
                        Object.values(state.headerBtns).forEach((btn) => {
                            if (btn.targeted)
                                addCheckbox = true;
                        });

                        if (addCheckbox) {
                            var th = document.createElement("th");
                            var checkbox = document.createElement("input");
                            checkbox.type = "checkbox";
                            checkbox.className = "";

                            state.html.rowsCheckboxs.push(checkbox);
                            checkbox.addEventListener('click', (e) => {
                                updateTargetedBtns(state);
                            })
                            th.appendChild(checkbox);
                            tr.appendChild(th);
                        }

                        state.html.rowBtns = [];
                        Object.keys(state.headers).forEach(headerKey => {
                            var th = document.createElement("th");
                            
                            if (state.headers[headerKey].btn) {
                                var value = state.headers[headerKey].btn;
                                var btn = buttons.createBtn(value);
                                btn.style["padding-top"] = "0px";
                                //btn.style["padding-right"] = "0px";
                                btn.style["padding-bottom"] = "0px";
                                btn.style["padding-toleftp"] = "0px";
                                btn.style["width"] = (0.07 * window.screen.width) + "px";
                                state.html.rowBtns.push(btn);
                                th.appendChild(btn);
                                btn.addEventListener('click', (e) => {
                                    e.preventDefault();
                                    views.run(state, value.onClick.msgs, null);
                                });
                            } else {
                                var cellValue = getCellValue(row, state.headers[headerKey].name.split('.'));
                                if (!Number.isNaN(cellValue)) {
                                    //cellValue = formatValue(cellValue);
                                    cellValue = cellValue || state.emptyCellChar;
                                    th.innerHTML = cellValue;                             
                                } else {
                                    cellValue = cellValue || state.emptyCellChar;
                                    th.innerHTML = cellValue;
                                }
                            } 
                            tr.appendChild(th);
                        });
                    });
                } catch (error) {
                    console.log(error);
                }
            };

            const drawPagination = (state, count) => {
                try {
                    state.paginationRoot.innerHTML = "";

                    const removeAllActives = () => {
                        state.paginationRoot.childNodes.forEach(el => el.classList.remove("active"));
                    }

                    //Creo el btn first
                    var first = document.createElement("li");
                    first.className = "page-item";
                    first.style.alignSelf = "center";
                    first.style.minWidth = "fit-content";
                    state.paginationRoot.appendChild(first);
                    var firstButton = document.createElement("button");
                    firstButton.className = "page-link ventum-pagination-btn";
                    firstButton.innerHTML = "Principio";

                    if (state.paginationIndex == 0) {
                        firstButton.disabled = true;
                        firstButton.style.color = "grey";
                    }
                    firstButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        state.paginationIndex = 0;
                        drawPagination(state, count);
                    })
                    first.appendChild(firstButton);

                    //Creo el btn <<
                    var previous = document.createElement("li");
                    previous.className = "page-item";
                    previous.style.alignSelf = "center";
                    previous.style.minWidth = "fit-content";
                    state.paginationRoot.appendChild(previous);
                    var previousButton = document.createElement("button");
                    previousButton.className = "page-link ventum-pagination-btn";
                    previousButton.innerHTML = "<<";
                    previousButton.style.alignSelf = "center";
                    previousButton.style.minWidth = "fit-content";
                    if (state.paginationIndex == 0) {
                        previousButton.disabled = true;
                        previousButton.style.color = "grey";
                    }
                    previousButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        state.paginationIndex -= 1;
                        drawPagination(state, count);
                    });
                    previous.appendChild(previousButton);

                    //Creo los indices...
                    for (let index = state.paginationIndex * 10;
                        (index < count / 10 && index < state.paginationIndex * 10 + 10); index++) {
                        console.log(index);
                        var li = document.createElement("li");
                        li.className = "page-item";
                        li.style.alignSelf = "center";
                        li.style.minWidth = "fit-content";
                        state.paginationRoot.appendChild(li);
                        var button = document.createElement("button");
                        button.className = "page-link ventum-pagination-btn";
                        button.innerHTML = (index + 1).toString();
                        button.style.alignSelf = "center";
                        button.style.minWidth = "fit-content";
                        const i = index;
                        button.addEventListener('click', (e) => {
                            e.preventDefault();
                            removeAllActives();
                            state.selectedPage = i;
                            state.paginationRoot.childNodes[state.selectedPage % 10 + 2].className += " active";
                            views.run(state, {0: {type: "update"}}, null)
                                .then(() => console.log("updated"))
                                .catch(err => console.log("failed update: " + err));
                        })
                        li.appendChild(button);
                    }

                    removeAllActives();
                    if (state.selectedPage >= state.paginationIndex * 10 && state.selectedPage <= (state.paginationIndex + 1) * 10 && state.paginationRoot.childNodes[state.selectedPage % 10 + 2])
                        state.paginationRoot.childNodes[state.selectedPage % 10 + 2].className += " active";

                    //Creo el btn >>
                    var next = document.createElement("li");
                    next.className = "page-item";
                    next.style.alignSelf = "center";
                    next.style.minWidth = "fit-content";
                    state.paginationRoot.appendChild(next);
                    var nextButton = document.createElement("button");
                    nextButton.className = "page-link ventum-pagination-btn";
                    nextButton.innerHTML = ">>";

                    if (Math.trunc(count / 100) == state.paginationIndex) {
                        nextButton.disabled = true;
                        nextButton.style.color = "grey";
                    }

                    nextButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        state.paginationIndex += 1;
                        drawPagination(state, count);
                    });
                    next.appendChild(nextButton);

                    //Creo el btn last
                    var last = document.createElement("li");
                    last.className = "page-item";
                    last.style.alignSelf = "center";
                    last.style.minWidth = "fit-content";
                    state.paginationRoot.appendChild(last);
                    var lastButton = document.createElement("button");
                    lastButton.className = "page-link ventum-pagination-btn";
                    lastButton.innerHTML = "Último";
                    if (Math.trunc(count / 100) == state.paginationIndex) {
                        lastButton.disabled = true;
                        lastButton.style.color = "grey";
                    }

                    lastButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        state.paginationIndex = Math.trunc(count / 100);
                        drawPagination(state, count);
                    })
                    last.appendChild(lastButton);

                    //Pagina n de N
                    var pages = document.createElement("li");
                    pages.className = "page-item";
                    pages.style["align-self"] = "center";
                    pages.style.float = "right";
                    pages.innerHTML = `${state.selectedPage + 1} de ${Math.trunc(count / 10 + 1)} &nbsp`;
                    pages.style.color = "grey";
                    pages.style.alignSelf = "center";
                    pages.style.minWidth = "fit-content";
                    state.paginationRoot.appendChild(pages);

                    //Input ir a
                    var goToLi = document.createElement("li");
                    goToLi.className = "page-item";
                    goToLi.style.width = '5%';
                    goToLi.style.alignSelf = "center";
                    // goToLi.style.minWidth = "fit-content";
                    state.paginationRoot.appendChild(goToLi);
                    var goTo = document.createElement("input");
                    goTo.className = "form-control";
                    goTo.style.width = '95%';

                    goToLi.appendChild(goTo);
                    var goToButton = document.createElement("button");
                    goToButton.className = "page-link ventum-pagination-btn";
                    goToButton.innerHTML = "Ir";
                    goToButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        var page = parseInt(goTo.value, 10);
                        if (page && page < count / 10) {
                            state.selectedPage = page - 1;
                            state.paginationIndex = Math.trunc(state.selectedPage / 10);
                            views.run(state, {0: {type: "update"}}, null)
                                .then(() => console.log("updated"))
                                .catch(err => console.log("failed update: " + err));
                        } else {
                            goTo.value = "";
                        }
                    })
                    state.paginationRoot.appendChild(goToButton);

                    //Agrego los botones del footer
                    var divBtns = document.createElement("div");
                    divBtns.id = state.id + "-card-footer-div-btns";
                    divBtns.className = "pagination ventum-table-footer-ul row";
                    divBtns.style.width = "75%";
                    //divBtns.style.paddingTop = "10px";
                    state.paginationRoot.appendChild(divBtns);

                    
                    var btns = Object.entries(state.footerBtns);
                    var btnsCount = 0;
                    btns.forEach(([key, value]) => {
                        if (value)
                            btnsCount++;
                    });
                    console.log("header buttons: " + btnsCount.toString());

                    //Si tengo un solo boton agrego uno invisible para correrlo a la derecha
                    if (btnsCount == 1) {
                        btns = [
                            [0, {
                                enabled: false,
                                type: "filter",
                                label: "filtrar",
                                onClick: {
                                    msgs: {}
                                }
                            }],
                            [1, btns[0][1]]
                        ]
                        btnsCount++;
                    }

                    btns.forEach(([key, value]) => {
                        if (btnsCount < 4)
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

                        divBtns.appendChild(btnDiv);
                        var btn = buttons.createBtn(value);
                        btnDiv.appendChild(btn);
                        btnDiv.style.alignSelf = "center";
                        btnDiv.style.minWidth = "fit-content";
                        if (!value.enabled) {
                            btn.style.display = "none";
                        }
                        btn.addEventListener('click', (e) => {
                            e.preventDefault();
                            views.run(state, value.onClick.msgs, null);
                        });

                        if (value.targeted) {
                            state.html.targetedBtns.push(btn);
                            btn.disabled = true;
                        }

                    });

                } catch (error) {
                    console.log(error);
                }
            };

            return new Promise((resolve, reject) => {
                
                fetchData()
                    .then(result => {
                        state.rowsData = result.rows;
                        drawRows(result.rows);
                        drawPagination(state, result.count);
                        updateTargetedBtns();
                        resolve("ok");
                    })
                    .catch(err => {
                        console.log(err);
                        reject(err);
                    });
            });
        }
    },
    //Tipos de hijos que puede tener el componente (table)
    childTypes: ["modal"],
    //Función que dibuja al componente (table)
    show: (state, parent) => {
        try {
            const createFilters = () => {
                try {
                    var div = document.createElement("div");
                    div.id = state.id + "-table-filters";
                    div.className = "ventum-table-filters ";
                    cardParent.body.appendChild(div);
    
                    state.filterForm = document.createElement("form");
                    state.filterForm.id = state.id + "-table-filters-form";
                    state.filterForm.className = "ventum-table-filters-form";
                    div.appendChild(state.filterForm);
    
                    var formRow = document.createElement("div");
                    formRow.id = state.id + "-table-filters-form-row";
                    formRow.className = "form-row ventum-table-filters-form-row";
                    state.filterForm.appendChild(formRow);
    
                    //TODO modificar para que se puedan poner mas de 5 filtros
                    for (let index = 0; index < 5; index++) {
                        var col = document.createElement("div");
                        col.id = state.id + "-table-filters-form-col-" + index.toString();
                        col.className = "col-2";
                        formRow.appendChild(col);
                        if (Object.keys(state.filters).length > index) {
                            var label = document.createElement("label");
                            label.id = state.id + "-table-filters-form-col-" + index.toString() + "-label";
                            label.innerHTML = state.filters[index].label;
                            col.appendChild(label);
    
                            var inputs = document.createElement("div");
                            inputs.className = "form-row";
                            col.appendChild(inputs);
    
                            var inputsArray = Object.values(state.filters[index].inputs);
                            inputsArray.forEach(input => {
                                var inputCol = document.createElement("div");
                                switch (inputsArray.length) {
                                    case 1:
                                        inputCol.className = "col-12";
                                        break;
                                    case 2:
                                        inputCol.className = "col-6";
                                        break;
                                    case 3:
                                        inputCol.className = "col-4";
                                        break;
                                    case 4:
                                        inputCol.className = "col-3";
                                        break;
                                    default:
                                        inputCol.className = "col-12";
                                        break;
                                }
                                inputs.appendChild(inputCol);
                                if (input.type == "dropdown") {
    
                                    var dropdownView = document.createElement("div");
                                    dropdownView.className = "dropdown";
                                    inputCol.appendChild(dropdownView);
    
                                    var dropdownBtn = document.createElement("button");
                                    dropdownBtn.className = "btn btn-secondary dropdown-toggle";
                                    dropdownBtn.type = "button";
                                    dropdownBtn.id = input.name;
                                    dropdownBtn.setAttribute('data-toggle', "dropdown");
                                    dropdownBtn.setAttribute('aria-haspopup', "true");
                                    dropdownBtn.setAttribute('aria-expanded', "false");
                                    dropdownBtn.innerHTML = input.placeholder;
                                    dropdownView.appendChild(dropdownBtn);
    
                                    var dropdownMenu = document.createElement("div");
                                    dropdownMenu.className = "dropdown-menu";
                                    dropdownMenu.setAttribute('aria-labelledby', input.name);
                                    dropdownView.appendChild(dropdownMenu);
    
                                    Object.values(input.options).forEach(option => {
                                        var dropdownLink = document.createElement("button");
                                        dropdownLink.href = "#";
                                        dropdownLink.innerHTML = option;
                                        dropdownMenu.appendChild(dropdownLink);
                                    });
    
    
                                } else {
                                    var field = document.createElement("input");
                                    field.ishoveredin = "0";
                                    field.isfocusedin = "0";
                                    field.name = input.name;
                                    field.type = input.type;
                                    field.className = "form-control";
                                    field.placeholder = input.placeholder;
                                    field.value = input.value;
                                    field.required = input.required;
                                    inputCol.appendChild(field);
                                }
                            });
                        }
                    }
    
                    //Dibujo columna con los botones del header
                    var col = document.createElement("div");
                    col.id = state.id + "-table-filters-form-col-" + "6";
                    col.className = "col-2";
                    col.style.textAlign = "center";
                    formRow.appendChild(col);
                    var label = document.createElement("label");
                    label.id = state.id + "-table-filters-form-col-" + "submit" + "-label";
                    label.innerHTML = "  &nbsp";
                    label.style.position = "relative";
                    label.style.width = '100%';
                    col.appendChild(label);
    
                    var inputs = document.createElement("div");
                    inputs.className = "form-row";
                    col.appendChild(inputs);
    
                    //Dibujo cada boton del header
                    var btns = Object.entries(state.headerBtns);
                    var btnsCount = 0;
                    btns.forEach(([key, value]) => {
                        if (value)
                            btnsCount++;
                    });
                    console.log("header buttons: " + btnsCount.toString());
                    
                    state.html.headerBtns = [];
                    btns.forEach(([key, value]) => {
                        if (value.enabled) {
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
                                default:
                                    btnDiv.className += "col-12";
                                    break;
                            }
                            inputs.appendChild(btnDiv);
                            var btn = buttons.createBtn(value);
                            state.html.headerBtns.push(btn);
                            btnDiv.appendChild(btn);
                            btn.addEventListener('click', (e) => {
                                e.preventDefault();
                                views.run(state, value.onClick.msgs, null);
                            });
    
                            if (value.targeted) {
                                state.html.targetedBtns.push(btn);
                                btn.disabled = true;
                            }
                        }
                    });
    
                    return div;
                } catch (error) {
                    console.log(error);
                    throw error;
                }
    
            };
            const createContent = () => {
                try {
                    var table = document.createElement("table");
                    table.id = state.id + "-table-content";
                    //Ahora uso table-sm pero deberÃ­a adaptarse a la contenedor...
                    table.className = "table table-sm table-striped table-hover ventum-table-content";
                    cardParent.body.appendChild(table);
    
                    //Creo los headers
                    var thead = document.createElement("thead");
                    thead.id = state.id + "-table-headers";
                    thead.className = "thead-dark";
                    table.appendChild(thead);

                    var addCheckbox = false;
                    //Si hay algun boton "targeted" agrego el checkbos a las filas
                    Object.values(state.headerBtns).forEach((btn) => {
                        if (btn.targeted)
                            addCheckbox = true;
                    });
                    
                    if (addCheckbox) {
                        var th = document.createElement("th");
                        th.id = state.id + "-table-headers-th";
                        th.className = "";
                        thead.appendChild(th);
                    } 
    
                    Object.keys(state.headers).forEach(key => {
                        var th = document.createElement("th");
                        th.id = state.id + "-table-headers-th";
                        th.className = "";
                        th.innerHTML = state.headers[key].label;
                        thead.appendChild(th);
                    });
    
                    //Creo las filas
                    var tbody = document.createElement("tbody");
                    tbody.id = state.id + "-table-body";
                    tbody.className = "";
                    state.html.rowsRoot = tbody;
                    table.appendChild(tbody);
    
                    return table;
                } catch (error) {
                    console.log(error);
                    throw error;
                }
    
            };
            const createFooter = () => {
                try {
                    var nav = document.createElement("nav");
                    nav.id = state.id + "-card-footer-nav";
                    nav.className = "ventum-table-footer";
                    cardParent.footer.appendChild(nav);
    
                    var ul = document.createElement("ul");
                    ul.id = state.id + "-card-footer-ul";
                    ul.className = "pagination ventum-table-footer-ul";
                    nav.appendChild(ul);
                    state.paginationRoot = ul;
                    return nav;
                } catch (error) {
                    console.log(error);
                    throw error;
                }
    
            };
    
            state.html = {}; // Borro las referencias anteriores al documento
            //console.log("Table show: " + JSON.stringify(state));
            const cardParent = card.create({ title: state.title }, parent);
    
            state.html.targetedBtns = [];
            createFilters();
            createContent();
            createFooter();
    
            views.run(state, { 0: { type: "update", payload: {} } }, null);
    
        } catch (error) {
            console.log("failed to show table: " + error.toString());
        }
    
    }
};

export default component;

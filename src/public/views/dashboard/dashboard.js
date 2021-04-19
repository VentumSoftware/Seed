import views from "../views.js";
//TODO: Ver como podemos hacer para no tener que referenciar esto acá (nos queda "doblemente enlazado")

//Caracteristicas de este componente (dashboard)
const component = {
    //Dflt Dashboards State
    dfltState: {
        id: "id",
        company: {
            name: "CompanyName"
        },
        user: {
            name: "UserName",
        },
        selectedCategory: "",
        childs: {},
        html: {} //Referencia a elementos del documento
    },
    //Commandos específicos para el componente (dashboard)
    cmds: {
        clearContent: (state, payload, res) => {
            return new Promise((resolve, reject) => {
                try {
                    if( state.html.contentDiv)
                        state.html.contentDiv.innerHTML = null;
                    console.log("ClearContent!");
                    resolve(state.html.contentDiv);
                } catch (error) {
                    reject(error);
                }
            });
        },
        selectCategory: (state, payload, res) => {
            return new Promise((resolve, reject) => {
                try {
                    var dirs = payload.catPath.replace(state.path + '/', '');
                    console.log("Category selected:" + dirs);
                    dirs = dirs.split('/');
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
        
                    component.cmds.clearContent(state, null, null)
                        .then(() => {
                            //console.log("show selected Cat: " + JSON.stringify(cat));
                            console.log("show selected Cat: " + cat.name);
                            const msgs = {
                                0: {
                                    type: "showCmd",
                                    parent: state.html.contentDiv
                                }
                            }
                            views.run(cat, msgs, null);
                            state.selectedCategory = payload.catPath;
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
    childTypes: ["category", "categoryParent"],
    //Función que dibuja al componente (dashboard)
    show: (state, parent) => {

        const createNav = () => {
            var nav = document.createElement("div");
            nav.id = state.id + "-nav";
            nav.className = 'ventum-nav '; //overflow-auto
            nav.style.height = window.innerHeight + "px";
            nav.style.overflowY = "auto";
            nav.style.overflowX = "hidden";
            return nav;
        };

        const createSidebar = () => {

            const companyInfo = () => {
                var companyDiv = document.createElement("div");
                companyDiv.id = state.id + "-sidebar-company-div";
                companyDiv.className = 'ventum-sidebar-company';

                var logoDiv = document.createElement("div");
                logoDiv.id = state.id + "-sidebar-company-logo-div";
                logoDiv.className = 'ventum-sidebar-company-logo';

                var logo = document.createElement("i");
                logo.id = state.id + "-sidebar-company-logo-icon";
                logo.className = 'icon-compass icon-2x ventum-sidebar-company-logo-i';

                logoDiv.appendChild(logo);
                companyDiv.appendChild(logoDiv);

                var nameDiv = document.createElement("div");
                nameDiv.id = state.id + "-sidebar-company-name-div";
                nameDiv.className = 'ventum-sidebar-company-name';

                var nameText = document.createElement("button");
                nameText.id = state.id + "-sidebar-company-name-text";
                nameText.className = 'ventum-sidebar-company-name-text';
                nameText.href = "";
                nameText.innerHTML = state.company.name;

                nameDiv.appendChild(nameText);
                companyDiv.appendChild(nameDiv);

                return companyDiv;
            };

            const separatorLine = () => {
                var line = document.createElement("div");
                line.className = 'ventum-sidebar-separator-line';
                return line;
            };

            const separatorSpace = (height) => {
                var companyDiv = document.createElement("div");
                companyDiv.className = 'ventum-sidebar-separator-space';
                companyDiv.style.height = (height || 3) + '%';
                return companyDiv;
            };

            const userInfo = () => {
                var userDiv = document.createElement("div");
                userDiv.id = state.id + "-sidebar-user-div";
                userDiv.className = 'ventum-sidebar-user';

                var logoDiv = document.createElement("div");
                logoDiv.id = state.id + "-sidebar-user-logo-div";
                logoDiv.className = 'ventum-sidebar-user-logo';

                var logo = document.createElement("i");
                logo.id = state.id + "-sidebar-user-logo-icon";
                logo.className = 'icon-compass icon-2x ventum-sidebar-user-logo-i';

                logoDiv.appendChild(logo);
                userDiv.appendChild(logoDiv);

                var nameDiv = document.createElement("div");
                nameDiv.id = state.id + "-sidebar-user-name-div";
                nameDiv.className = 'ventum-sidebar-user-name';

                var nameText = document.createElement("button");
                nameText.id = state.id + "-sidebar-user-name-text";
                nameText.className = 'ventum-sidebar-user-name-text';
                nameText.href = "";
                nameText.innerHTML = state.user.name;

                nameDiv.appendChild(nameText);
                userDiv.appendChild(nameDiv);

                return userDiv;
            };

            const createChild = (child, parent) => {

                const createCategory = () => {
                    var catCol = document.createElement("div");
                    catCol.id = state.id + "-" + child.name + "-sidebar-main-category-col";
                    catCol.className = 'col';
                    catCol.style.paddingTop = "5%";
                    parent.appendChild(catCol);

                    var catDiv = document.createElement("div");
                    catDiv.id = state.id + "-" + child.name + "-sidebar-main-category-div";
                    catDiv.className = 'ventum-sidebar-main-category row';
                    catCol.appendChild(catDiv);

                    var logoDiv = document.createElement("div");
                    logoDiv.id = state.id + "-" + child.name + "-sidebar-main-category-logo-div";
                    logoDiv.className = 'ventum-sidebar-main-category-logo';
                    catDiv.appendChild(logoDiv);

                    var logo = document.createElement("i");
                    logo.id = state.id + "-" + child.name + "-sidebar-main-category-logo-icon";
                    logo.className = 'icon-compass icon-2x ventum-sidebar-main-category-logo-i';
                    logoDiv.appendChild(logo);

                    var nameDiv = document.createElement("div");
                    nameDiv.id = state.id + "-" + child.name + "-sidebar-main-category-name-div";
                    nameDiv.className = 'ventum-sidebar-main-category-name';
                    catDiv.appendChild(nameDiv);

                    var nameText = document.createElement("button");
                    nameText.id = state.id + "-" + child.name + "-sidebar-main-category-name-text";
                    nameText.className = 'ventum-sidebar-main-category-name-text';
                    nameText.innerHTML = child.name;
                    nameDiv.appendChild(nameText);

                    nameText.onclick = (e) => {
                        e.preventDefault();
                        var catPath = Object.keys(state.childs).find(key => state.childs[key] === child)
                        console.log("catPath: " + catPath);
                        var msgs = {
                            0: {
                                type: "selectCategory",
                                catPath: catPath
                            }
                        }

                        views.run(state, msgs, null);
                    };

                };

                const createCategoryParent = () => {
                    var catCol = document.createElement("div");
                    catCol.id = state.id + "-" + child.name + "-sidebar-main-category-col";
                    catCol.className = 'col';
                    catCol.style.paddingTop = "6%";
                    catCol.style.paddingBottom = "4%";
                    parent.appendChild(catCol);

                    var catDiv = document.createElement("div");
                    catDiv.id = state.id + "-" + child.name + "-sidebar-main-category-div";
                    catDiv.className = 'ventum-sidebar-main-category row';
                    catDiv.style.paddingBottom = "3%";
                    catCol.appendChild(catDiv);

                    var logoDiv = document.createElement("div");
                    logoDiv.id = state.id + "-" + child.name + "-sidebar-main-category-logo-div";
                    logoDiv.className = 'ventum-sidebar-main-category-logo';
                    catDiv.appendChild(logoDiv);

                    var logo = document.createElement("i");
                    logo.id = state.id + "-" + child.name + "-sidebar-main-category-logo-icon";
                    logo.className = 'icon-compass icon-2x ventum-sidebar-main-category-logo-i';
                    logoDiv.appendChild(logo);

                    var nameDiv = document.createElement("div");
                    nameDiv.id = state.id + "-" + child.name + "-sidebar-main-category-name-div";
                    nameDiv.className = 'ventum-sidebar-main-category-name';
                    catDiv.appendChild(nameDiv);

                    var nameText = document.createElement("button");
                    nameText.id = state.id + "-" + child.name + "-sidebar-main-category-name-text";
                    nameText.className = 'ventum-sidebar-main-category-name-text';
                    nameText.innerHTML = child.name;
                    nameDiv.appendChild(nameText);

                    nameText.onclick = (e) => {
                        //TODO: Colapsar/expandir subcategorias
                    };

                    Object.values(child.childs).forEach((subCat) => {
                        var subCatsDiv = document.createElement("div");
                        subCatsDiv.id = state.id + "-" + subCat.name + "-sidebar-main-category-div-subcats";
                        subCatsDiv.className = 'row';
                        subCatsDiv.style.backgroundColor = "var(--grey-0)";
                        subCatsDiv.style.paddingLeft = "30%";
                        subCatsDiv.style.paddingTop = "1%";
                        subCatsDiv.style.paddingBottom = "1%";
                        catCol.appendChild(subCatsDiv);

                        var subCatBtn = document.createElement("button");
                        subCatBtn.id = state.id + "-" + subCat.name + "-sidebar-main-category-name-text";
                        subCatBtn.className = 'ventum-sidebar-main-category-name-text';
                        subCatBtn.innerHTML = subCat.name;
                        subCatBtn.style.fontSize = "0.8rem";
                        subCatsDiv.appendChild(subCatBtn);

                        subCatBtn.onclick = (e) => {
                            e.preventDefault();
                            var catParentPath = Object.keys(state.childs).find(key => state.childs[key] === child);
                            var subcatPath = Object.keys(child.childs).find(key => child.childs[key] === subCat);
                            var path = catParentPath + "/" + subcatPath;
                            console.log("path: " + path);
                            var msgs = {
                                0: {
                                    type: "selectCategory",
                                    catPath: path
                                }
                            }

                            views.run(state, msgs, null);
                        }
                    });
                };

                try {
                    if (child.type == "category")
                        createCategory();
                    else if (child.type == "categoryParent")
                        createCategoryParent();
                    else
                        console.log("Incorrect child type for dashboard: " + child.type);



                    // if (cat.subCategories != undefined) {

                    //     var topSpace = document.createElement("div");
                    //     topSpace.id = state.id + "-sidebar-main-subCategory-topSpace";
                    //     topSpace.className = 'ventum-sidebar-main-category';
                    //     topSpace.style.backgroundColor =  "rgba(31, 31, 31, 1)";
                    //     topSpace.style.height = "1%";
                    //     sidebar.appendChild(topSpace);

                    //     Object.values(cat.subCategories).forEach(subCat => {
                    //         var subCatDiv = document.createElement("div");
                    //         subCatDiv.id = state.id + "-" + subCat.name + "-sidebar-main-subCategory-div";
                    //         subCatDiv.className = 'ventum-sidebar-main-category';
                    //         subCatDiv.style.backgroundColor =  "rgba(31, 31, 31, 1)";
                    //         subCatDiv.style.textAlignLast = "start";
                    //         subCatDiv.style.height = "4%";
                    //         subCatDiv.style.fontSize = ".85rem";

                    //         var subCatNameDiv = document.createElement("div");
                    //         subCatNameDiv.id = state.id + "-" + subCat.name + "-sidebar-main-subCategory-name-div";
                    //         subCatNameDiv.className = 'ventum-sidebar-main-category-name';
                    //         subCatNameDiv.style.marginLeft = "25%";

                    //         var subCatNameText = document.createElement("button");
                    //         subCatNameText.id = state.id + "-" + subCat.name + "-sidebar-main-subCategory-name-text";
                    //         subCatNameText.className = 'ventum-sidebar-main-category-name-text';
                    //         subCatNameText.innerHTML = subCat.name;

                    //         subCatNameDiv.appendChild(subCatNameText);
                    //         subCatDiv.appendChild(subCatNameDiv);
                    //         sidebar.appendChild(subCatDiv);

                    //         subCatNameText.onclick = (e) => {
                    //             e.preventDefault();
                    //             var categories = state.categories;
                    //             var catPath = Object.keys(categories).find(key => categories[key] === cat);
                    //             var subCategories = state.categories[catPath].subCategories;
                    //             var subPath = Object.keys(subCategories).find(key => subCategories[key] === subCat)
                    //             catPath += `/${subPath}`;
                    //             console.log("catPath: " + catPath);
                    //             var msgs = {
                    //                 0: {
                    //                     type: "selectCategory",
                    //                     payload: {
                    //                         catPath: catPath
                    //                     }
                    //                 }
                    //             }

                    //             cmd(state, msgs, null, 0);
                    //         };
                    //     });

                    //     var bottomSpace = document.createElement("div");
                    //     bottomSpace.id = state.id + "-sidebar-main-subCategory-bottomSpace";
                    //     bottomSpace.className = 'ventum-sidebar-main-category';
                    //     bottomSpace.style.backgroundColor =  "rgba(31, 31, 31, 1)";
                    //     bottomSpace.style.height = "1%";
                    //     sidebar.appendChild(bottomSpace);

                    //     nameText.onclick = (e) => {
                    //         e.preventDefault();
                    //         var catPath = Object.keys(state.categories).find(key => state.categories[key] === cat)
                    //         console.log("expand: " + catPath);
                    //         // var msgs = {
                    //         //     0: {
                    //         //         type: "selectCategory",
                    //         //         payload: {
                    //         //             catPath: catPath
                    //         //         }
                    //         //     }
                    //         // }

                    //         // cmd(state, msgs, null, 0);
                    //     };

                    //     //DROPDOWN BUTTON - CATEGORY
                    //     var nameText = document.createElement("button");
                    //     nameText.className = 'ventum-sidebar-main-category-name-text dropdown-toggle';
                    //     nameText.type = "button";
                    //     nameText.id = state.id + "-" + cat.name + "-sidebar-main-category-name-text";
                    //     nameText.setAttribute('data-toggle', "dropdown");
                    //     nameText.setAttribute('aria-haspopup', "true");
                    //     nameText.setAttribute('aria-expanded', "false");
                    //     nameText.innerHTML = cat.name;
                    //     nameDiv.appendChild(nameText);

                    //     //---------- MENU DEL DROPDOWN ----------------//
                    //     var nameMenu = document.createElement("div");
                    //     nameMenu.className = "dropdown-menu";
                    //     nameMenu.setAttribute('aria-labelledby', state.id + "-" + cat.name + "-sidebar-main-category-name-text");
                    //     nameDiv.appendChild(nameMenu);
                    //     //----------ELEMENTOS DEL MENU------------------------//
                    //     Object.entries(cat).forEach(option => {
                    //         console.log(option);
                    //         console.log(option[0]);
                    //         if (!Number.isNaN(parseInt(option[0]))) {
                    //             var subCat = option[1];
                    //             var nameLink = document.createElement("button");
                    //             nameLink.href = "#";
                    //             nameLink.className = "dropdown-item";
                    //             nameLink.innerHTML = subCat.name;
                    //             nameMenu.appendChild(nameLink);
                    //             nameLink.onclick = (e) => {
                    //                 e.preventDefault();
                    //                 console.log("Option selected: " + subCat.name);
                    //                 selectCategory(subCat);
                    //             };
                    //         }else {
                    //             console.log("Error al renderizar elemento");
                    //         }

                    //     });

                    //     nameText.onclick = (e) => {
                    //         e.preventDefault();
                    //         var msgs = {
                    //             0: {
                    //                 type: "selectCategory",
                    //                 payload: {
                    //                     catPath: "0"
                    //                 }
                    //             }
                    //         }

                    //         cmd(state, msgs, null, 0);
                    //         console.log("Category selected: " + cat.name);
                    //         //selectCategory(cat);
                    //     };


                    // } else {
                    //     nameText.onclick = (e) => {
                    //         e.preventDefault();
                    //         var catPath = Object.keys(state.childs).find(key => state.childs[key] === cat)
                    //         console.log("catPath: " + catPath);
                    //         var msgs = {
                    //             0: {
                    //                 type: "select-category",
                    //                 payload: {
                    //                     catPath: catPath
                    //                 }
                    //             }
                    //         }

                    //         cmd(state, msgs, null, 0);
                    //     };
                    // }
                } catch (error) {
                    console.log(error);
                }
            };

            try {
                var sidebar = document.createElement("div");
                sidebar.id = state.id + "-sidebar";
                sidebar.className = 'ventum-sidebar overflow-auto';

                sidebar.appendChild(companyInfo());
                sidebar.appendChild(separatorLine());
                sidebar.appendChild(userInfo());
                sidebar.appendChild(separatorLine());
                sidebar.appendChild(separatorSpace(3));
                Object.keys(state.childs).forEach(key => {
                    //var access = state.categories[key].access;
                    createChild(state.childs[key], sidebar);
                });

                return sidebar;
            } catch (error) {
                console.log("Error creating sidebar: " + error);
                return null;
            }

        };

        const createContent = () => {

            const navBar = () => {
                var navbarDiv = document.createElement("div");
                navbarDiv.id = state.id + "-content-navbar-div";
                navbarDiv.className = 'ventum-content-navbar-div row';

                var empty = document.createElement("div");
                empty.id = state.id + "-content-navbar-div-exit";
                empty.className = 'col-11';
                navbarDiv.appendChild(empty);

                var exit = document.createElement("div");
                exit.id = state.id + "-content-navbar-div-exit";
                exit.style.position = "relative";
                exit.className = 'col-1 d-flex content-center';
                navbarDiv.appendChild(exit);
                var exitBtn = document.createElement("button");
                exitBtn.id = state.id + "-content-navbar-div-exit";
                exitBtn.className = "btn btn-danger btn-sm";
                exitBtn.style.color = "white";
                exitBtn.style.marginTop = "10%";
                exitBtn.style.marginBottom = "10%";
                exitBtn.innerHTML = "Log Out";
                exitBtn.addEventListener('click', () => {
                    logOut(state.logOut);
                });
                exit.appendChild(exitBtn);
                return navbarDiv;
            };

            const separatorLine = () => {
                var line = document.createElement("div");
                line.className = 'ventum-content-separator-line';

                return line;
            };

            try {
                var content = document.createElement("div");
                content.id = state.id + "-content";
                content.className = 'ventum-content '; //overflow-auto
                content.style.overflowY = "auto";
                content.style.overflowX = "hidden";
                content.appendChild(navBar());
                content.appendChild(separatorLine());
                var mainContent = document.createElement("div");
                mainContent.id = state.id + "-content-main";
                mainContent.className = 'ventum-main-content';
                mainContent.style.height = '91%';
                content.appendChild(mainContent);
                return content;
            } catch (error) {
                console.log("Error creating sidebar: " + error);
                return null;
            }

        };

        var nav = createNav();
        var sidebar = createSidebar();
        nav.appendChild(sidebar);
        var content = createContent();
        nav.appendChild(content);
        document.body.appendChild(nav);
        state.html.contentDiv = content.getElementsByClassName('ventum-main-content')[0];

        var firstCat = Object.values(state.childs)[0];
        var catPath = "";
        if (firstCat.type === 'categoryParent') catPath = Object.values(firstCat.childs)[0].path;
        else if (firstCat.type === 'category') catPath = firstCat.path;
        else throw `Incorrect child type for dashboard: ${firstCat.path}`;

        var msg = {
            type: "selectCategory",
            catPath: catPath
        }
    
        component.cmds.selectCategory(state, msg, null);
    
    }
};

export default component;
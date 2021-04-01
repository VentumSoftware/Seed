import utils from 'http://localhost/public/views/lib/utils.js';
import card from 'http://localhost/public/views/dashboard/card/card.js';
import buttons from 'http://localhost/public/views/dashboard/buttons/buttons.js';

//Caracteristicas de este componente (map)
const component = {
    //Dflt Modal State
    dfltState: {
        id: "noID",
        title: "Mapas",
        childs:{},
        headers: {},
        filters: {},
        headerBtns: {},
        childs: {},
        html: {}
    },
    //Commandos específicos para el componente (map)
    cmds: {},
    //Typos de hijos que puede tener el componente (modal)
    childTypes: ["modal"],
    show: (state, parent) => {
        const createFilters = () => {
            try {
                var div = document.createElement("div");
                div.id = state.id + "-map-filters";
                div.className = "ventum-table-filters ";
                cardParent.body.appendChild(div);
    
                state.filterForm = document.createElement("form");
                state.filterForm.id = state.id + "-map-filters-form";
                state.filterForm.className = "ventum-table-filters-form";
                div.appendChild(state.filterForm);
    
                var formRow = document.createElement("div");
                formRow.id = state.id + "-map-filters-form-row";
                formRow.className = "form-row ventum-table-filters-form-row";
                state.filterForm.appendChild(formRow);
    
                //TODO modificar para que se puedan poner mas de 5 filtros
                for (let index = 0; index < 5; index++) {
                    var col = document.createElement("div");
                    col.id = state.id + "-map-filters-form-col-" + index.toString();
                    col.className = "col-6";
                    formRow.appendChild(col);
                    if (Object.keys(state.filters).length > index) {
                        var label = document.createElement("label");
                        label.id = state.id + "-map-filters-form-col-" + index.toString() + "-label";
    
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
                                dropdownView.className = "";
                                inputCol.appendChild(dropdownView);
    
                          var dropdownBtn = document.createElement("select");
                                dropdownBtn.className = "form-control";
                                dropdownBtn.id=input.id;
                                dropdownBtn.text = input.name;
                                dropdownView.appendChild(dropdownBtn);
    
    
                          var dropdownOpt=document.createElement("option");
                                 dropdownBtn.selected=true;
                                 dropdownOpt.text = input.name;
                                 dropdownOpt.id= "Defecto";
    
                                dropdownBtn.appendChild(dropdownOpt);
                      if(input.id== "select-location"){
    
                        fetch('http://localhost:80/rest/inti/recorridos')
                                  .then(res=>res.json())
                                  .then(data=>{
    
                                       Object.values(data).forEach(option => {
    
                                          var dropdownRecorridos=document.createElement("option");
    
                                          dropdownRecorridos.text = option.imei;
                                          dropdownRecorridos.id= "imei";
    
                                          dropdownRecorridos.value=`${option.recorrido[0].inicioPos[0]},${option.recorrido[0].inicioPos[1]}`;
                                         dropdownBtn.appendChild(dropdownRecorridos);
    
    
                                   });
                                   });
    
    
                      }else{
    
                      Object.values(input.options).forEach(option => {
    
                                          var dropdownRecorridos=document.createElement("option");
    
                                          dropdownRecorridos.text = option.name;
                                          dropdownRecorridos.id= input.id;
    
                                          dropdownRecorridos.value=option.layer;
                                         dropdownBtn.appendChild(dropdownRecorridos);
    
    
                                   });
    
                      }
    
    
    
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
    
    
                return div;
            } catch (error) {
                console.log(error);
                throw error;
            }
    
        };
        const drawMap = () => {
            try {
                    //DIBUJA EL RECORRIDO DE UN SOLO IMEI ----- TODO: DIBUJAR PARA TODOS LOS IMEI
    
    
    
    
                var div = document.createElement("div");
                div.class = "";
                div.id =  state.id + "-map";
                div.style.width="100%";
                var height=screen.height*0.6
                div.style.height=height.toString()+"px";
                div.style.position="relative";
                cardParent.body.appendChild(div);
    
                var origin= JSON.parse(state.origin)
                const map =L.map(div.id).setView(origin,state.zoom);
                L.tileLayer(state.layer).addTo(map);
    
    
                document.getElementById('select-map').addEventListener('change',function(e){
    
                    L.tileLayer(e.target.value).addTo(map);
    
    
                })
    
    
                map.locate({enableHighAccuracy:true});
    
                map.on('locationfound',e=>{
                var coords=[e.latlng.lat, e.latlng.lng];
                var marker=L.marker(coords);
                marker.bindPopup('Ubicacion actual');
                var circle = L.circle(coords, {
                color: '#8fbbec',
                fillColor: '#b7c0ca',
                fillOpacity: 0.1,
                radius: 3000
                }).addTo(map);
    
                map.addLayer(marker);
                });
    
    
    
    
                map.on('dblclick', e =>{
                    let latLng = map.mouseEventToLatLng(e.originalEvent);
                    var coords=[latLng.lat, latLng.lng];
                    var marker=L.marker(coords);
                    marker.bindPopup(`[${latLng.lat}, ${latLng.lng}]`);
                    map.addLayer(marker);
                })
                map.doubleClickZoom.disable();
    
    
    
                document.getElementById('select-location').addEventListener('change',function(e){
                var coord=e.target.value.split(",");
                var name=e.target.id;
                const marker=L.marker(coord);
                marker.bindPopup('Ciudad de '+ name);
                map.addLayer(marker);
                map.flyTo(coord, 13)
    
    
                })
    
    
    
                      async function getRunCoordsFrom_(imeiNumber){
    
    var res = await fetch("http://localhost:80/rest/inti/recorridos");
    const response = await res.json();
    var coords = coordinatesFrom_(response, imeiNumber);
    return(coords);
    }
    
            async function drawRunOf(imeiNumber){
    
    
                var latlngs = await getRunCoordsFrom_(imeiNumber);
    
    
                var polyline = L.polyline(latlngs, {
                    color: '#75E87A',
                    weight: 3,
                    opacity: 1
    
                })
                .addTo(map);
            }
    
    
    
            function coordinatesFrom_(obj, imeiNumber){
                let listaDeCoords = []
    
                //ITERA SOBRE TODOS LOS ELEMENTOS TRAIDOS. TODO: ITERAR CONDICIONALMENTE.
                for (const element in obj) {
                    if (Object.hasOwnProperty.call(obj, element) && obj[element].imei === imeiNumber) {
                        var elem = (obj[element]);
    
                        let run = elem.recorrido;
                        for (let i = 0; i < run.length; i++) {
                            const element = run[i];
                            let position = Object.keys(element).toString();
    
                            switch (position) {
                                case "inicioPos":
                                    listaDeCoords.push(element.inicioPos);
                                    break;
                                case "runningPos":
                                    for (let i = 0; i < element.runningPos.length; i++) {
                                        const elem = element.runningPos[i];
                                        listaDeCoords.push(elem);
                                    }
                                    break;
                                case "finalPos":
                                    listaDeCoords.push(element.finalPos);
                                    break;
                                default:
                                    console.error("Valores incorrectos");
                                    break;
                            }
    
                            //listaDeCoords.push([element.inicioPos, element.runningPos, element.finalPos]);
                        }
    
                    }
                }
                return(listaDeCoords);
    
            }
             fetch('http://localhost:80/rest/inti/recorridos')
                                .then(res=>res.json())
                                .then(data=>{
    
                                     Object.values(data).forEach(option => {
    
                                   drawRunOf(option.imei)
    
                                 });
                                 });
    
    
            } catch (error) {
                console.log(error);
            }
        };
    
       const drawCard= () => {
          try {
    
               var div = document.createElement("div");
                 div.class = "";
                div.id =  state.id + "-map";
                div.style.width="100%";
                var height=screen.height*0.6
                div.style.height=height.toString()+"px";
                div.style.position="relative";
                div.appendChild(drawMap());
    
    
          } catch (error) {
              console.log(error);
          }
      };
        console.log("Map show: " + JSON.stringify(state));
        const cardParent = card.create({ title: state.title }, parent);
        createFilters();
        drawCard();
    
    }
};

export default component;

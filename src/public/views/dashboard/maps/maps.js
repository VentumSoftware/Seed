import utils from "../../lib/utils.js";
import card from "../card/card.js";
import buttons from "../buttons/buttons.js";

//Caracteristicas de este componente (map)
const component = {
  //Dflt Modal State
  dfltState: {
    id: "noID",
    title: "Mapas",
    childs: {},
    headers: {},
    filters: {},
    headerBtns: {},
    childs: {},
    html: {},
  },
  //Commandos específicos para el componente (map)
  cmds: {},
  //Typos de hijos que puede tener el componente (modal)
  childTypes: ["modal"],
  show: (state, parent) => {
    const createFiltersButtons = () => {
      try {
        var container = document.createElement("div");
        container.className = "container col-lg-12";
        cardParent.body.appendChild(container);

        var card = document.createElement("div");
        card.className = "card";
        container.appendChild(card);

        var cardBody = document.createElement("div");
        cardBody.className = "card-body";
        card.appendChild(cardBody);

        var cardContent = document.createElement("div");
        cardContent.className = "col-lg-5 margin-left";
        cardBody.appendChild(cardContent);

        var labelFecha = document.createElement("label");
        labelFecha.className = "label";
        labelFecha.innerHTML = "Filtrar por fecha";
        cardContent.appendChild("labelFecha");

        var inputFecha = document.createElement("input");
        inputFecha.type = "date";
        cardContent.appendChild(inputFecha);
      } catch (error) {
        console.log(error);
        throw error;
      }
    };

    const createFilters = () => {
      try {
        var divContainer = document.createElement("div");
        divContainer.className = "container mx-auto mt-25";
        divContainer.style.marginTop = "30px";
        divContainer.style.marginBottom = "30px";
        cardParent.body.appendChild(divContainer);

        var divCard = document.createElement("div");
        divCard.className = "col-lg-12";
        divContainer.appendChild(divCard);

        var divIndicaciones = document.createElement("div");
        divIndicaciones.className = "col-lg-12";
        divContainer.appendChild(divIndicaciones);

        var divInput = document.createElement("div");
        divInput.className = "col-12 row";
        divCard.appendChild(divInput);

        var label = document.createElement("label");
        label.className="col-12"
        var text = document.createTextNode("Buscar recorridos por patente");
        label.appendChild(text);
        divInput.appendChild(label);

        var divSelect=document.createElement("div");
        divSelect.className="col-12 col";
        divInput.appendChild(divSelect)

        var select = document.createElement("select");
        select.id = "recorrido";
        select.className="col col-12"
        divSelect.appendChild(select);
       
       
        var label = document.createElement("label");
        var text = document.createTextNode("Trazar nuevos recorridos");
        label.style.marginTop="20px"
        label.className = "col-12";
        label.appendChild(text);
        divIndicaciones.appendChild(label);

        var divContentInput = document.createElement("div");
        divContentInput.className = "row col";
        divIndicaciones.appendChild(divContentInput);

        var divInput1 = document.createElement("div");
        divInput1.className = "col-4";
        divContentInput.appendChild(divInput1);

        var input1 = document.createElement("input");
        input1.placeholder = "coordenadas iniciales";
        input1.className = "form-control";
        input1.id = "inicio";
        divInput1.appendChild(input1);

        var divInput2 = document.createElement("div");
        divInput2.className = "col-4";
        divContentInput.appendChild(divInput2);

        var input2 = document.createElement("input");
        input2.placeholder = "coordenadas finales";
        input2.className = "form-control";
        input2.id = "final";
        divInput2.appendChild(input2);

        var divInput3 = document.createElement("div");
        divInput3.className = "col-4";
        divContentInput.appendChild(divInput3);

        var input3 = document.createElement("button");
        var text = document.createTextNode("Calcular ruta");
        input3.appendChild(text);
        input3.className = "btn btn-dark btn-indicaciones";
        input3.id = "indicaciones";
        input3.type = "submit";
        divInput3.appendChild(input3);
      } catch (error) {
        console.log(error);
        throw error;
      }
    };

    const drawMap = () => {
      try {
        var div = document.createElement("div");
        div.className = "container";
        div.id = state.id + "-map";
        div.style.width = "100%";
        var height = screen.height * 0.6;
        div.style.height = height.toString() + "px";
        div.style.position = "relative";
        cardParent.body.appendChild(div);

        var origin = JSON.parse(state.origin);
        const map = L.map(div.id).setView(origin, state.zoom);
        L.tileLayer(state.layer).addTo(map);

        map.locate({ enableHighAccuracy: true });
        
        map.on('locationfound',e=>{
          const coords=[e.latlng.lat, e.latlng.lng];
          const marker=L.marker(coords);
          marker.bindPopup('Ubicacion actual');
          map.addLayer(marker);
      })
      

        var selecRecorrido = document.getElementById("recorrido");

        fetch("http://localhost/public/views/dashboard/maps/recorridos.json")
          .then((res) => res.json())
          .then((data) => {
            data.map((recorridos) => {
              var option = document.createElement("option");
              option.value = recorridos.imei;
              option.text = recorridos.patente + " ----- " + recorridos.date;
              selecRecorrido.appendChild(option);
            });
          });
        document
          .getElementById("recorrido")
          .addEventListener("change", function (e) {
            recorridos(e.target.value);
          });
        function recorridos(imei) {
          fetch("http://localhost/public/views/dashboard/maps/recorridos.json")
            .then((res) => res.json())
            .then((data) => data.filter((filtro) => filtro.imei == imei))
            .then((filtro) => filtro[0].recorrido)
            .then((filtro) => {
              var listCoords = [];
              Object.keys(filtro).forEach((key) => {
                var position = Object.keys(filtro[key]).toString();
                switch (position) {
                  case "inicioPos":
                    listCoords.push(filtro[key].inicioPos);
                    break;
                  case "runningPos":
                    for (let i = 0; i < filtro[key].runningPos.length; i++) {
                      const elem = filtro[key].runningPos[i];
                      listCoords.push(elem);
                    }
                    break;
                  case "finalPos":
                    listCoords.push(filtro[key].finalPos);
                    break;
                  default:
                    console.log("hubo un error");
                    break;
                }
              });
              map.flyTo(listCoords[0], 13);
              var polyline = L.polyline(listCoords, { color: "blue" }).addTo(
                map
              );
            });
        }

        var firstLatLng, secondLatLng;
        map.on("dblclick", function (e) {
          if (!firstLatLng) {
            firstLatLng = e.latlng;
            L.marker(firstLatLng)
              .addTo(map)
              .bindPopup("Point A<br/>" + e.latlng)
              .openPopup();
          } else {
            secondLatLng = e.latlng;
            L.marker(secondLatLng)
              .addTo(map)
              .bindPopup("Point B<br/>" + e.latlng)
              .openPopup();
          }
          if (firstLatLng && secondLatLng) {
            // Dibujamos una línea entre los dos puntos
            L.Routing.control({
              waypoints: [L.latLng(firstLatLng), L.latLng(secondLatLng)],
            }).addTo(map);
          }
        });

        map.on("click", (e) => {
          let latLng = map.mouseEventToLatLng(e.originalEvent);
          var coords = [latLng.lat, latLng.lng];
          var marker = L.marker(coords);
          marker.bindPopup(`${coords}`).openPopup();
          map.addLayer(marker);
        });
        var distPixelInicial, distPixelFinal;
        map.on("contextmenu", (e) => {
          if (!distPixelInicial) {
            distPixelInicial = e.latlng;
            console.log("llego la primera" + distPixelInicial);
          } else {
            distPixelFinal = e.latlng;
            console.log("llego a la segunda " + distPixelFinal);
          }
          if (distPixelInicial && distPixelFinal) {
            radio(distPixelInicial, distPixelFinal);
          }
        });
        function radio(inicio, final) {
          var distancia = L.GeometryUtil.distance(map, inicio, final);
          var distance = map.distance(inicio, final);
          var radioInicio = L.latLng(inicio),
            radioFinal = L.latLng(final);
          var bounds = L.latLngBounds(radioInicio, radioFinal);
          var center = map.fitBounds(bounds);
          if (center._animateToCenter && distance) {
            console.log(center._animateToCenter, distance);
            var circle = L.circle(center._animateToCenter, {
              color: "red",
              fillColor: "#f03",
              fillOpacity: 0.5,
              radius: distance,
            }).addTo(map);
          } else {
            console.log("esperando");
          }
        }
        map.doubleClickZoom.disable();

        var submit = document.getElementById("indicaciones");

        submit.addEventListener("click", (e) => {
          e.preventDefault();
          indicaciones(inicio.value, final.value);
        });

        function indicaciones(inicio, final) {
          var objetInicio = inicio.split(",");
          var objetFinal = final.split(",");
          var firstLatLng = new Object();
          firstLatLng.lat = objetInicio[0];
          firstLatLng.lng = objetInicio[1];
          var secondLatLng = new Object();
          secondLatLng.lat = objetFinal[0];
          secondLatLng.lng = objetFinal[1];
          L.Routing.control({
            waypoints: [L.latLng(firstLatLng), L.latLng(secondLatLng)],
          }).addTo(map);
        }
      } catch (error) {
        console.log(error);
      }
    };

    const drawCard = () => {
      try {
        var div = document.createElement("div");
        div.class = "";
        div.id = state.id + "-map";
        div.style.width = "100%";
        var height = screen.height * 0.6;
        div.style.height = height.toString() + "px";
        div.style.position = "relative";
        div.appendChild(drawMap());
      } catch (error) {
        console.log(error);
      }
    };
    console.log("Map show: " + JSON.stringify(state));
    const cardParent = card.create({ title: state.title }, parent);

    createFilters();
    drawCard();
  },
};

export default component;

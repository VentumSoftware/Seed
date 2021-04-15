import utils from 'https://ventumdashboard.s3.amazonaws.com/lib/utils.js';
import card from 'https://ventumdashboard.s3.amazonaws.com/dashboard/card/card.js';
import buttons from 'https://ventumdashboard.s3.amazonaws.com/dashboard/buttons/buttons.js';

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
      const createFiltersButtons = () => {
            try {

              var container = document.createElement("div");
              container.className="container col-lg-12";
              cardParent.body.appendChild(container);

              var card = document.createElement("div");
              card.className="card";
              container.appendChild(card);

              var cardBody= document.createElement("div");
              cardBody.className="card-body";
              card.appendChild(cardBody);

              var cardContent= document.createElement("div");
              cardContent.className="col-lg-5 margin-left";
              cardBody.appendChild(cardContent);

              var labelFecha = document.createElement("label");
              labelFecha.className="label";
              labelFecha.innerHTML="Filtrar por fecha";
              cardContent.appendChild("labelFecha");

              var inputFecha =document.createElement("input");
              inputFecha.type="date";
              cardContent.appendChild(inputFecha);







            } catch (error) {
                console.log(error);
                throw error;
            }

        };


        const createFilters = () => {

          try {
              var divContainer =document.createElement("div");
              divContainer.className="container mx-auto mt-25";
              divContainer.style.marginTop="30px";
              divContainer.style.marginBottom="30px";
              cardParent.body.appendChild(divContainer);

              var divCard=document.createElement("div");
              divCard.className="col-lg-12"
              divContainer.appendChild(divCard)

              var divInput= document.createElement("div");
              divInput.className=" input-group-append";
              divCard.appendChild(divInput);



              var input = document.createElement("input");
              input.type="text";
              input.className="form-control";
              input.placeholder="Numero de patente";

              divInput.appendChild(input);

              var divButton= document.createElement("div");
              divButton.className="input-group-append";
              divInput.appendChild(divButton);

              var button = document.createElement("button");
              button.className="btn btn-outline-secondary";
              button.type="button";
              button.innerHTML="Buscar";
              divButton.appendChild(button);

              var divSelect = document.createElement("div");
              divSelect.className= "input-group";
              divSelect.style.marginTop="20px";

              divCard.appendChild(divSelect)


              var select = document.createElement("select");
              select.className="custom-select";
              divSelect.appendChild(select);

              var optionSelected = document.createElement("option");
              optionSelected.select=true;
              optionSelected.text="Buscar por ciudad";
              optionSelected.id="select-location"
              select.appendChild(optionSelected);

              var optionTest1 = document.createElement("option");
              optionTest1.value="-34.60555305136257, -58.3812103401702"
              optionTest1.text="Ciudad de Buenos Aires";
              select.appendChild(optionTest1);





          } catch (error) {
              console.log(error);
              throw error;
          }

      };
    const createwidgets = () => {
        try {

          var divContainer = document.createElement("div");
          divContainer.className="col-md-12 container";
          cardParent.body.appendChild(divContainer);

          var divContent=document.createElement("div");
          divContent.className="col-lg-6";
          divContent.style.marginLeft="0px";
          divContent.style.paddingLeft="0px";
          divContent.style.marginTop="20px";
          divContainer.appendChild(divContent);

          var divCardContainer=document.createElement("div");
          divCardContainer.className="card l-bg-orange-dark";
          divContent.appendChild(divCardContainer)



          var divContentCard = document.createElement("div");
          divContentCard.className="card-statistic-3 p-4";
          divCardContainer.appendChild(divContentCard);

          var iconCard = document.createElement("div");
          iconCard.className="card-icon card-icon-large";
          iconCard.style.fontSize="110px";
          iconCard.style.textAlign="center";
          iconCard.style.lineHeight="50px";
          iconCard.style.marginLeft="15px";
          iconCard.style.color="#000";
          iconCard.style.position="absolute";
          iconCard.style.right="5px";
          iconCard.style.top="20px";
          iconCard.style.opacity="0,1";
          divContentCard.appendChild(iconCard);

          var icon =document.createElement("i");
          icon.className="fas fa-truck-moving";
          iconCard.appendChild(icon);


          var divText=document.createElement("div");
          divText.className="mb-4";
          divContentCard.appendChild(divText);

          var text = document.createElement("h5");
          text.className="card-title mb-0";
          text.innerHTML="hola mundo";

          divText.appendChild(text);












        } catch (error) {
            console.log(error);
            throw error;
        }

    };
    const drawMap = () => {
        try {


            var div = document.createElement("div");
            div.className = "container";
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

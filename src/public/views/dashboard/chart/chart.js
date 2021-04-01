import utils from 'http://localhost/public/views/lib/utils.js';
import card from 'http://localhost/public/views/dashboard/card/card.js';
import form from 'http://localhost/public/views/dashboard/forms/form.js';
import buttons from 'http://localhost/public/views/dashboard/buttons/buttons.js';
//import views from '../../views';
import views from "http://localhost/public/views/views.js";

//Caracteristicas de este componente (chart)
const component = {
    //Dflt Modal State
    dfltState: {
        type: "chart",
        title: "Chart",
        chart: {
            type: "pie"
        },
        childs: {}
    },
    //Commandos específicos para el componente (chart)
    cmds: {},
    //Typos de hijos que puede tener el componente (chart)
    childTypes: ["modal"],
    show: (state, parent) => {
        const drawChart = () => {

            const pieChart = () => {
                try {
                    var radius = width / 2;
                    var pie = d3.pie();
                    var arc = d3.arc()
                            .innerRadius(0)
                            .outerRadius(radius);
                } catch (error) {
                    
                }
            };

            const donutChart = () => {
                try {
                    var radius = width / 2;
                    var arc = d3.arc()
                            .innerRadius(radius - ((radius/100)*15))
                            .outerRadius(radius);
                } catch (error) {
                    
                }
            };

            const barChart = () => {
                try {
                    
                } catch (error) {
                    
                }
            };

            try {
                var type = state.chart.type;
                var data = state.chart.dataset;
                var width = state.chart.width;
                var height = state.chart.heigth;
                
                var svg = d3.select(cardBody.id)
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height);                        

                // Esto no entiendo bien que hace?
                g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
                    
                //ORDEN DE LOS COLORES EN ESCALA
                var color = d3.scaleOrdinal(['#4daf4a','#377eb8','#ff7f00','#984ea3','#e41a1c']);
                
                switch (type) {
                    case "pie":
                        pieChart();
                        break;
                    case "donut":
                        circleChart();
                        break;
                    case "bar":
                        barChart();
                        break;
                    default:
                        throw `Incorrect chart type: ${type}`;
                        break;
                }

                // Generate the pie
                var pie = d3.pie();
                
                // Generate the arcs
                if(type == "pie"){
                    var arc = d3.arc()
                            .innerRadius(0)
                            .outerRadius(radius);
                
                } else if(type == "donut"){
                    var arc = d3.arc()
                            .innerRadius(radius - ((radius/100)*15))
                            .outerRadius(radius);
                
                }else{
                    var arc = d3.arc()
                            .innerRadius(0)
                            .outerRadius(radius);    
                }
                    
                //Generate groups
                var arcs = g.selectAll("arc")
                            .data(pie(data))
                            .enter()
                            .append("g")
                            .attr("class", "arc")
                
                //Draw arc paths / los arcos de la torta hay que dibujarlos con path.
                arcs.append("path")
                    .attr("fill", function(d, i) {
                        return color(i);
                    })
                    .attr("d", arc);  
                    
                return svg;
                
            } catch (error) {
                console.log(error);
                throw "Chart rendering failed!";
            }
        };
        console.log("Chart show: " + JSON.stringify(state));
        const cardParent = card.create({ title: state.title }, parent);
        var cardBody = cardParent.getElementsByClassName("card-body")[0];
        cardBody.id = state.path + "/card-body";
        drawChart();        
    }
};

export default component;
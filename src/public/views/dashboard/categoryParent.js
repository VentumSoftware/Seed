//Caracteristicas de este componente (category-parent)
const component = {
  //Dflt Dashboards State
  dfltState: {
    id: "noId",
    name: "No Name",
    access: {},
    selectedChild : "",
    childs: {},
    html:{} //Referencia a elementos del documento
  },
  //Commandos específicos para el componente (category-parent)
  cmds: {},
  //Typos de hijos que puede tener el componente (category-parent)
  childTypes: ["category"],
  //Función que dibuja al componente (category-parent)
  show : (state, parent) => {

    console.log("Category-parent show: " + JSON.stringify(state));
    try {
      var child = state.categories[state.selectCategory];
  
      a = show(state, parent);
    } catch (error) {
      console.log("Error showing category! " + error);
    }
  }
};

export default component;
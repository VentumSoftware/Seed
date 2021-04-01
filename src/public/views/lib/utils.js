
const fillObjWithDflt = (object, dflt, options) => {
  options = options || {};
  options.includeNonDflt = options.includeNonDflt || true;
  object = object || {};
  dflt = dflt || {};
  var result = {};

  Object.keys(dflt).forEach(key => {
    if (key in object) {
      if (typeof (object[key]) == 'object')
        result[key] = fillObjWithDflt(object[key], dflt[key]);
      else
        result[key] = object[key];
    } else
      result[key] = dflt[key];
  })

  if (options.includeNonDflt) {
    Object.keys(object).forEach(key => {
      if (!(key in result)) {
        result[key] = object[key];
      }
    })
  }

  return result;
};

//TODO: Mover a un librería
const formatDateToQuery = (date) => {
  var dateToFormat = date.split("-");
  dateToFormat = dateToFormat[0] + dateToFormat[1] + dateToFormat[2];
  return (dateToFormat[0] + dateToFormat[1] + dateToFormat[2]);
};

function formatToDate(value) {
  let year = [], month = [], day = [], hours = [], minutes = [], seconds = [];
  let formattedDate;
  try {
      for (let i = 0; i < value.length; i++) {
          switch (true) {
              case (i < 4):
                  year.push(value[i]);
                  break;
              case (i < 6):
                  month.push(value[i]);
                  break;
              case (i < 8):
                  day.push(value[i]);
                  break;
              case (i < 10):
                  hours.push(value[i]);
                  break;
              case (i < 12):
                  minutes.push(value[i]);
                  break;
              case (i < 14):
                  seconds.push(value[i]);
                  break;
              default:
                  break;
          }
      }
      formattedDate = `${year.join('')}-${month.join('')}-${day.join('')} ${hours.join('')}:${minutes.join('')}:${seconds.join('')}`;
      const fecha = new Date(formattedDate);
      if (Number.isNaN(fecha.getTime())) {
          console.log('Invalid date: ' + fecha + ". Instead, value " + value + " will be returned.");
          return (value);
      } else {
          return (fecha);
      }
  } catch (error) {
      console.log('Error al formatear fecha: ' + error);
      return null;
  }

};

const formatValue = (value) => {
  const formattedValue = formatToDate(value); //formatToDate() devuelve un objeto Date en formato ISOString
  if (typeof formattedValue == 'object' && formattedValue !== null) {
    try {
      let newTime = new Date();
      let globalTime = formattedValue.getTime();
      let localeTime = new Date(newTime.setTime(globalTime + (-3 * 60 * 60 * 1000))); //Setea el valor ISOString a Hora Argentina UTC-3
      return (localeTime.toISOString().split('.')[0]);
    } catch (error) {
      console.log(error);
      return value;
    }
  } else {
    console.log("ERROR: " + value);
  }
};

const evalString = (str, vars) => {
  const getVars = (x, g) => {
    var result = "";
    console.log(`getVars g: ${g}`);
    if (vars[g] != null && vars[g] != undefined) result = vars[g];
    else result = eval(g);
    if (typeof result === 'object') result = JSON.stringify(result);
    console.log(`getVars result: ${result}`);
    return result;
  } 

  return str.replace(/\${(.*?)}/g, getVars);
}

export default { fillObjWithDflt, formatDateToQuery,  formatToDate, formatValue, evalString};
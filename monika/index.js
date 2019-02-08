/*!
  Author: Yukashimi
  Date: 07/06/2018
  File: index.js (Monika)
*/

module.exports = {
  init: (ids) => {
  //exports.init = function(ids){
    const index = {
      "actions": require("./bot-actions.js"),
      "analytic": require("./analytic.js"),
      "api": require("./api-handler.js"),
      "config": require("./config.js"),
      "console": require("./console-helper.js"),
      "dates": require("./dates.js"),
      "helper": require("./helper.js"),
      "http": require("./http.js"),
      "logs": require("./monika.js"),
      "notes": require("./notes.js"),
      "query": require("./query-lib.js"),
      "validator": require("./validator.js")
    };
    const keys = Object.keys(index);

    if(ids === "" || ids === undefined || ids === null){
      return index;
    }
  
    if(typeof ids === "string"){
      let aux = ids;
      ids = [];
      ids[0] = aux;
    }
    let exporting = {};
    for(let i = 0; i < ids.length; i++){
      exporting[ids[i]] = index[ids[i]];
    }
  
    return exporting;
  }
}
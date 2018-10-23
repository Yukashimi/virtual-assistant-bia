/*!
  Author: Yukashimi
  Date: 04/10/2018
  File: util.js
*/

let util = (() => {
  function inputOnEnter(event, callback){
    if (event.keyCode === 13 && event.target.value){
      callback();
    }
  }
  
  function protocol(p){
    return p.slice(0, 8) + "/" + p.slice(8, 12) + "." + p.slice(-1);
  }
  
  function today(){
    let today = new Date();
    let month = today.getMonth() + 1;
    let day = today.getDate();
    let year = today.getFullYear();
    return year + "-" + (month < 10 ? "0" : "") + month + "-" +
        (day < 10 ? "0" : "") + day;
  }
  
  return {
    inputOnEnter: inputOnEnter,
    protocol: protocol,
    today: today
  }
})();


/*!
  Author: Yukashimi
  Date: 04/10/2018
  File: util.js
*/

let util = (() => {
  const aux_info = {
    "eqtprev": {
      "logo": "eqtprev_logo_500x210.png",
      "href": "http://fascemar.org.br/"
    },
    "faceb": {
      "logo": "faceb_logo_500x210.png",
      "href": "http://faceb.com.br/"
    },
    "regius": {
      "logo": "regius_logo_500x210.png",
      "href": "http://www.regius.org.br/"
    }
  };
  
  function disabled(){
    return () => {};
  }
  
  function fixDisplay(date){
    date = parseInt(date, 10);
    return (date < 10 ? ("0" + date) : date);
  }
  
  function inputOnEnter(event, callback){
    if (event.keyCode === 13 && event.target.value){
      callback();
    }
  }
  
  function makeProtocol(){
    const id = new Date();
    return "" + id.getFullYear() + fixDisplay(id.getMonth() + 1) + fixDisplay(id.getDate()) + fixDisplay(id.getMinutes()) + fixDisplay(id.getSeconds());
  }
  
  function now(){
    const now = new Date();
    return fixDisplay(now.getHours()) + ":" + fixDisplay(now.getMinutes()) + ":" + fixDisplay(now.getSeconds());
  }
  
  function protocol(p){
    return p.slice(0, 8) + "/" + p.slice(8, 12) + "." + p.slice(-1);
  }
  
  function today(){
    const today = new Date();
    return today.getFullYear() + "-" + fixDisplay(today.getMonth() + 1) + "-" + fixDisplay(today.getDate());
  }
  
  function getVersion(){
    let url = window.location.pathname;
    //console.log(url.split("/")[1]);
    return url.split("/")[1];
    //url.replace(/\//g, "");
    //(url.substring(0, url.lastIndexOf('/'))).replace("/", "");
  }
  
  return {
    aux_info: aux_info,
    disabled: disabled,
    inputOnEnter: inputOnEnter,
    now: now,
    makeProtocol: makeProtocol,
    protocol: protocol,
    today: today,
    getVersion: getVersion
  }
})();


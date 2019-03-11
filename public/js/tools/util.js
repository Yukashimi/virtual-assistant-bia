/*!
  Author: Yukashimi
  Date: 04/10/2018
  File: util.js
*/

let util = (() => {
  function disabled(){
    return () => {};
  }
  
  const display_info = {
    "icon": {
      "ATE": "<i class='fas fa-headset'></i>",
      "VIR": "<i class='fas fa-desktop'></i>",
      "USU": "<i class='fas fa-user'></i>",
      "info": "<i class='fas fa-info'></i>",
      "pending": "<i class='fas fa-tasks'></i>",
      "convo": "<i class='far fa-comments'></i>",
      "general": "<i class='fas fa-info'></i>",
      "date": "<i class='far fa-calendar-alt'></i>",
      "clock" : "<i class='far fa-clock'></i>",
      "card": "<i class='far fa-address-card'></i>",
      "phone": "<i class='fas fa-phone'></i>",
      "email": "<i class='far fa-envelope'></i>"
    },
    "css": {
      "ATE": "bubble bot",
      "VIR": "bubble bot",
      "USU": "bubble user",
      "info": "bubble info",
      "pending": "bubble",
      /*"convo": "bubble info",
      "general": "bubble info",
      "date": "bubble info",
      "clock" : "bubble info",
      "card": "bubble info",
      "phone": "bubble info",
      "email": "bubble info"*/
    }
  }
  
  function firstName(nameToExtract){
    if(nameToExtract === null){
      return null;
    }
    let output_name = nameToExtract.split(" ")[0];
    return (output_name = output_name.charAt(0) + (output_name.slice(1)).toLowerCase());
  }
  
  function fixDisplay(date){
    date = parseInt(date, 10);
    return (date < 10 ? ("0" + date) : date);
  }
  
  const foundation_info = {
    "eqtprev": {
      "logo": "eqtprev_logo_500x210.png",
      "href": "http://fascemar.org.br/",
      // "sys": "advanced"
    },
    "faceb": {
      "logo": "faceb_logo_500x210.png",
      "href": "http://faceb.com.br/",
      // "sys": "advanced"
    },
    "regius": {
      "logo": "regius_logo_500x210.png",
      "href": "http://www.regius.org.br/",
      // "sys": "advanced"
    }
  };
  
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
    disabled: disabled,
    display_info: display_info,
    firstName: firstName,
    foundation_info: foundation_info,
    inputOnEnter: inputOnEnter,
    now: now,
    makeProtocol: makeProtocol,
    protocol: protocol,
    today: today,
    getVersion: getVersion
  }
})();


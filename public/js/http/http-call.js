/*!
  Author: Yukashimi
  Date: 12/07/2018
  File: http-call.js
*/
let http = {};

http.request = (function(){
  let options = {
    method: "",
    path: "/",
    asyncBool: true,
    crossDomain: false,
    responseType: "",
    header: {
      content: "",
      app: ""
    }
  };
  
  let normalizeFunction = function(funcToFix){
    if(funcToFix === "" || funcToFix === undefined || funcToFix === null){
      return function(){};
    }
    return funcToFix;
  }
  
  /* ??????????????????????? */
  
  function call(onloadOpt, dataOpt){
    let xhttp = new XMLHttpRequest();
    xhttp.open(options.method, options.path, options.asyncBool);
    xhttp.responseType = options.responseType;
    xhttp.setRequestHeader(options.header.content, options.header.app);
    let func = normalizeFunction(onloadOpt);
    xhttp.onload = func(xhttp);
    /*xhttp.onerror = function(){>:}*/
    xhttp.send(dataOpt);
  }
  
  function setOptions(met, pat, asy, res, con, ap){
    options.method = met;
    options.path = pat;
    options.asyncBool = asy;
    options.responseType = res;
    options.header.content = con;
    options.header.app = ap;
  }
  
  return{
    setOptions: setOptions,
    call: call
  }
})();

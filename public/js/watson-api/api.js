/*!
  Author: Yukashimi
  Date: 16/05/2018
  File: api.js
  Original file by IBM
*/

let Api = (() => {
  let payload = {
    request: null,
    response: null
  };
  
  let messageEndpoint = '/api/message';

  function sendRequest(text, context, altAction){
    let payloadToWatson = {
      context: context,
      input: {text: text},
      version: util.getVersion()
    };
    
    let params = JSON.stringify(payloadToWatson);
    if (Object.getOwnPropertyNames(payloadToWatson).length !== 0){
      Api.setPayload("request", params, true);
    }
    http.request.setOptions("POST", messageEndpoint);
    http.request.call(altAction || setRes, params);
  }
  
  function setRes(xhttp){
    return () => {
      Api.setPayload("response", xhttp.responseText, false);
    }
  }
  
  // function setEndpoint(newpoint){
    // messageEndpoint = `/api/message/${newpoint}`;
  // }
  
  function getPayload(kind){
    return payload[kind];
  }
  
  function setPayload(kind, value){
    payload[kind] = JSON.parse(value);
  }
  
  return{
    sendRequest: sendRequest,
    
    getPayload: getPayload,
    setPayload: setPayload
    // setEndpoint: setEndpoint
  }
})();

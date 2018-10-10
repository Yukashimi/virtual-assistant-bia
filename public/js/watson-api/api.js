var Api = (function() {
  var requestPayload;
  var responsePayload;
  var messageEndpoint = '/api/message';

  function sendRequest(text, context, altAction){
    var payloadToWatson = {};
    if(text){
      payloadToWatson.input = { text: text };
    }
    if(context){
      payloadToWatson.context = context;
    }
    
    function setRes(xhttp){
      return function(){
        Api.setResponsePayload(xhttp.responseText);
      }
    }
    
    var params = JSON.stringify(payloadToWatson);
     if (Object.getOwnPropertyNames(payloadToWatson).length !== 0){
      Api.setRequestPayload(params);
    }
    
    http.request.setOptions("POST", messageEndpoint, true, "text", "Content-type", "application/json");
    http.request.call(altAction || setRes, params);
  }
  
  return{
    sendRequest: sendRequest,
    getRequestPayload: function(){
      return requestPayload;
    },
    setRequestPayload: function(newPayloadStr){
      requestPayload = JSON.parse(newPayloadStr);
    },
    getResponsePayload: function(){
      return responsePayload;
    },
    setResponsePayload: function(newPayloadStr){
      responsePayload = JSON.parse(newPayloadStr);
    }
  }
}());

/*!
  Author: Yukashimi
  Date: 28/08/2018
  File: http.js
*/

/* Is this still in use? */
let monika = require("../monika").init(["config", "console"]);;

let requests = {
  GET: async function(options, isMonika){
    return await sendGetRequest(options, isMonika);
  },
  PUT: function(){
    console.log("you want a put http request");
  }
};

function getPort(port){
  if(port === 80){
    return "";
  }
  return ":" + port;
}

function getURL(req){
  var url = require('url');
  return url.parse(req.url, true).query;
}

function StatusOK(data, res){
  // 200s range
  if(199 < data.header.code && data.header.code < 300){
    return true;
  }/*
  // 100s range
  if(99 < data.header.code && data.header.code < 200){
    res.writeHead(data.header.code, monika.config.CONTENT);
    res.end(JSON.stringify(data.header));
    return false;
  }
  // 300s range
  if(299 < data.header.code && data.header.code < 400){
    res.writeHead(data.header.code, monika.config.CONTENT);
    res.end(JSON.stringify(data.header));
    return false;
  }
  // 400s range
  if(399 < data.header.code && data.header.code < 500){
    res.writeHead(data.header.code, monika.config.CONTENT);
    res.end(JSON.stringify(data.header));
    return false;
  }
  // 500s range
  if(499 < data.header.code && data.header.code < 600){
    res.writeHead(data.header.code, monika.config.CONTENT);
    res.end(JSON.stringify(data.header));
    return false;
  }*/
  res.writeHead(data.header.code, monika.config.CONTENT);
  res.end(JSON.stringify(data.header));
  return false;
}

function notImplementedYet(res, path){
  monika.console.log.blue(("The resource " + path + " is not ready just yet!"));
  res.writeHead(501, monika.config.api.CONTENT);
  res.end(JSON.stringify({"code": 501, "status": "Not Implemented", "msg": "I'm still working on this, so hold tight!"}));
}

function setPort(req){
  if(req){
    var query = getURL(req);
    var port = req.query.port;
    if(isNaN(port)){
      port = 80;
    }
    return port;
  }
  return 80;
}

function sendGetRequest(options, isMonika){
  return new Promise((resolve, reject) => {
    var http = require("http");
    let full_path = options.hostname + getPort(options.port) + options.path;
    let data = '';
    var req = http.get(full_path, (res) => {
      if(399 < res.statusCode && res.statusCode < 500){
        data = {"header": {"type": "Client Error", "msg": res.statusMessage,
           "code": res.statusCode}};
        monika.console.log.red("Error! Here is the data:", data);
        resolve(data);
      }
      else if(isMonika){
        monika.console.log.green("All good!");
        data = {"header":{"type": "Success", "msg": res.statusMessage,
            "code": res.statusCode}};
        resolve(data);
      }
      else{
        data = data + "{\"header\":{\"type\":\"Success\",\"msg\":\""
            + res.statusMessage + "\",\"code\":\"" + res.statusCode
            + "\"},\"data\":";
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          data = data + "}";
          data = JSON.parse(data);
          resolve(data);
          monika.console.log.green("API call successful, but the data is huge so no printing.");
          console.log("");
        });
      }
    }).on("error", (err) => {
      monika.console.log.red(("Error: " + err.message));
    });
  }); // end of promise
}

function setOptions(method, host, path, port){
  monika.console.log.green("Configuration complete, sending the request now...");
  return {
    "method": method,
    "hostname": host,
    "port": port || 80,
    "path": path,
    "headers": {}
  };
}

module.exports = {
  requests: requests,
  getPort: getPort,
  getURL: getURL,
  StatusOK: StatusOK,
  notImplementedYet: notImplementedYet,
  setPort: setPort,
  sendGetRequest: sendGetRequest,
  setOptions: setOptions
}
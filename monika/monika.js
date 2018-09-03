/*!
  Author: Yukashimi
  Date: 24/05/2018
  File: monika.js
*/

let date = require("./dates.js");;

const PATH = "logs/";
const INIT_NAME = "temp-";
const BASE_LOG = PATH + INIT_NAME;
const TYPE = [".txt", ".csv"];
const SUFFIX = ["-full", ""];

let fs = require("fs");
let os = require("os");

function log(response, ip){
  if(response.context.name == null){
    initLog(response, ip);
  }
  else{
    date.moveDate(response.context.name, ip);
    checkLogs(response.context.name, response);
  }
}

function serverHi(port){
  console.log("Hi, Monika here.");
  console.log("Okay, everyone! The club is at the port %d." + os.EOL, port);
}

function botText(response){
  //return (textToCheck.length > 0 ? ("[USER] " + textToCheck) : "");
  //(botText(response) != "" ? ("[BOT] " + botText(response)) : "")
  if(response.output.text.length > 0){
    let txt = "";
    for(let i = 0; i < response.output.text.length; i++){
      txt = txt + (response.output.text[i].length > 0 ? (response.output.text[i] + os.EOL) : "");
    }
    return txt;
  }
  return "";
}

function checkLogs(user, response){
  if((fs.existsSync(BASE_LOG + date.getDate(user) + SUFFIX[0] + TYPE[0]))
      && (fs.existsSync(BASE_LOG + date.getDate(user) + SUFFIX[1] + TYPE[0]))){
	  writer(BASE_LOG + date.getDate(user) + SUFFIX[0] + TYPE[0], combiner(response, 0), true);
    writer(BASE_LOG + date.getDate(user) + SUFFIX[1] + TYPE[0], combiner(response, 1), false);
    renamer(date.getDate(user), user, 0);
	  renamer(date.getDate(user), user, 1);
  }
  else{
    writer(PATH + date.getDate(user) + user.toLowerCase() + SUFFIX[0] + TYPE[0], combiner(response, 0), true);
    writer(PATH + date.getDate(user) + user.toLowerCase() + SUFFIX[1] + TYPE[0], combiner(response, 1), false);
  }
}

function clientText(response){
  return (response.input.hasOwnProperty('text') > 0 ? (response.input.text + os.EOL) : "");
}

function combiner(response, idt){
  if(idt === null || idt === undefined || idt === ""){
    idt = 0;
  }
  if(idt === 0){
    return (date.logDate() + os.EOL + intent(response) + tagger(clientText(response), "[USER]") + tagger(botText(response), "[BOT]"));
  }
  if(idt === 1){
    return (clientText(response) + botText(response));
  }
}

function createCSV(req){
  var exs = req.body.examples;
  let inte = req.body.intent;
  fs.appendFileSync(PATH + inte + TYPE[1], exs);
}

function end(user, ip){
  console.log("I recieved an attempt to end the conversation.");
  if(user === null || user === "Usuário não identificado"){
    date.removeDate(ip);
    console.log("Bye IP" + ip + "!" + os.EOL);
    return
  }
  date.removeDate(user);
  console.log("Bye " + user + "!" + os.EOL);
  return
}

function getFiles(user, ip){
  if(user === null || user === "Usuário não identificado"){
    return [
      {path: BASE_LOG + date.getDate(ip) + SUFFIX[0] + TYPE[0]},
      {path: BASE_LOG + date.getDate(ip) + SUFFIX[1] + TYPE[0]}
    ];
  }
  return [
    {path: PATH + date.getDate(user) + user + SUFFIX[0] + TYPE[0]},
    {path: PATH + date.getDate(user) + user + SUFFIX[1] + TYPE[0]}
  ];
}

function initLog(response, ip){
  if(date.getDate(ip) === undefined){
    date.setDate(ip);
    console.log("I recieved a new connection from %s.", ip);
    console.log("I created a temp log for you." + os.EOL);
  }
  writer(BASE_LOG + date.getDate(ip) + SUFFIX[0] + TYPE[0], combiner(response, 0), true);
  writer(BASE_LOG + date.getDate(ip) + SUFFIX[1] + TYPE[0], combiner(response, 1), false);
}

function intent(response){
  return (response.intents[0] != undefined ? readIntents(response.intents) : "");
}

function readIntents(intents){
  let output = "";
  for(let i = 0; i < intents.length; i++){
    output = output + ("[INTENT] #" + intents[i].intent + " [CONFIDENCE] "
        + intents[i].confidence + os.EOL)
  }
  return output;
}

function renamer(date, user, idt){
  let namedLog = PATH + date + user.toLowerCase() + SUFFIX[idt] + TYPE[0];
  fs.renameSync(BASE_LOG + date + SUFFIX[idt] + TYPE[0], namedLog);
}

function tagger(textToTag, tag){
  return (textToTag.length > 0 ? (tag + " " + textToTag) : "");
}

function writer(path, msg, boolLog){
  fs.appendFileSync(path, msg);
  if(boolLog){
    console.log("New entry to the log at:")
    console.log(path);
    console.log("I wrote:");
    console.log(msg);
  }
}

module.exports = {
  createCSV: createCSV,
  end: end,
  getFiles: getFiles,
  log: log,
  serverHi: serverHi
}

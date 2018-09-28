/*!
  Author: Yukashimi
  Date: 24/05/2018
  File: monika.js
*/

let monika = require("../monika").init(["console", "config", "dates"]);
let mysql = require('promise-mysql');
let fs = require("fs");
let os = require("os");

const PATH = "logs/";
const INIT_NAME = "temp-";
const BASE_LOG = PATH + INIT_NAME;
const TYPE = [".txt", ".csv"];
const SUFFIX = ["-full", ""];
const MONIKA_LOG = PATH + "monika-diary" + TYPE[0];
const USERS = ["User", "Bot"];

function log(response, ip){
  let date_id;
  if(response.context.name == null){
    initLog(response, ip);
    date_id = ip;
  }
  else{
    monika.dates.moveDate(response.context.name, ip);
    checkLogs(response.context.name, response);
    date_id = response.context.name;
  }
  dbLog(parseLogInfo(response, date_id));
}

function serverHi(port){
  monika.console.log(monika.dates.logDate());
  monika.console.log.green("Hi, Monika here.");
  monika.console.log.green("Okay, everyone! The club is at the port " + port);
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
  if((fs.existsSync(BASE_LOG + monika.dates.getDate(user) + SUFFIX[0] + TYPE[0]))
      && (fs.existsSync(BASE_LOG + monika.dates.getDate(user) + SUFFIX[1] + TYPE[0]))){
	  writer(BASE_LOG + monika.dates.getDate(user) + SUFFIX[0] + TYPE[0], combiner(response, 0), true);
    writer(BASE_LOG + monika.dates.getDate(user) + SUFFIX[1] + TYPE[0], combiner(response, 1), false);
    renamer(monika.dates.getDate(user), user, 0);
	  renamer(monika.dates.getDate(user), user, 1);
  }
  else{
    writer(PATH + monika.dates.getDate(user) + user.toLowerCase() + SUFFIX[0] + TYPE[0], combiner(response, 0), true);
    writer(PATH + monika.dates.getDate(user) + user.toLowerCase() + SUFFIX[1] + TYPE[0], combiner(response, 1), false);
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
    return (monika.dates.logDate() + os.EOL + intent(response) + tagger(clientText(response), "[USER]") + tagger(botText(response), "[BOT]"));
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

function debugMode(options){
  if(!options.consoleOn && !options.fileOn){
    monika.console.log.red("As requested, all logging is off.");
    console.log = function(){};
  }
  if(!options.consoleOn && options.fileOn){
    monika.console.log.green("As requested, I will only write to the server's logs.");
    console.log = function(){
      serverLog.apply(null, arguments);
    }
  }
  if(options.consoleOn && options.fileOn){
    monika.console.log.green("As requested, all logging is on.");
    var originalLog = console.log;
    console.log = function(){
      originalLog.apply(null, arguments);
      serverLog.apply(null, arguments);
    }
  }
}

function end(user, ip){
  monika.console.log("I recieved an attempt to end the conversation.");
  monika.dates.removeDate(user || ip);
  monika.console.log("Bye " + (user || ip) + "!" + os.EOL);
  return
}

function getFiles(user, ip){
  if(user === null || user === "Usuário não identificado"){
    return [
      {path: BASE_LOG + monika.dates.getDate(ip) + SUFFIX[0] + TYPE[0]},
      {path: BASE_LOG + monika.dates.getDate(ip) + SUFFIX[1] + TYPE[0]}
    ];
  }
  return [
    {path: PATH + monika.dates.getDate(user) + user + SUFFIX[0] + TYPE[0]},
    {path: PATH + monika.dates.getDate(user) + user + SUFFIX[1] + TYPE[0]}
  ];
}

function initLog(response, ip){
  if(monika.dates.getDate(ip) === undefined){
    monika.dates.setDate(ip);
    monika.console.log.yellow("I recieved a new connection from ", ip);
    monika.console.log.yellow("I created a temp log for you." + os.EOL);
  }
  writer(BASE_LOG + monika.dates.getDate(ip) + SUFFIX[0] + TYPE[0], combiner(response, 0), true, response.context.conversation_id);
  writer(BASE_LOG + monika.dates.getDate(ip) + SUFFIX[1] + TYPE[0], combiner(response, 1), false);
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

function serverLog(){
  for(let args = 0; args < arguments.length; args++){
    if(!(/\x1b\[/.test(arguments[args]))){
      fs.appendFileSync(MONIKA_LOG, JSON.stringify(arguments[args]) + os.EOL);
    }
  }
}

function tagger(textToTag, tag){
  return (textToTag.length > 0 ? (tag + " " + textToTag) : "");
}

function writer(path, msg, boolLog, id){
  fs.appendFileSync(path, msg);
  if(boolLog){
    monika.console.log.green("New entry to the log at:")
    monika.console.log(path);
    if(id){
      monika.console.log("The conversation ID is:");
      monika.console.log(id);
    }
    monika.console.log("I wrote:");
    monika.console.log(msg);
  }
}












function conversationStatus(response){
  if(response.context.error > 0){
    return 2;
  }
  return 1;
}

function parseLogInfo(response, date_id){
  return {
    id: response.context.conversation_id,
    status: conversationStatus(response),
    profile: {"user": 1, "bot": 2},
    name: response.context.name ? response.context.name : "Não Identificado",
    conversation_date: (monika.dates.getDate(date_id) !== undefined) ? monika.dates.sysToSqlDate(monika.dates.getDate(date_id)) : "2000-01-01 00:00:00",
    message_date: monika.dates.sysToSqlDate(monika.dates.sysDate()),
    intent: (response.intents.length > 0) ? response.intents[0].intent : "BOT",
    confidence_score: (response.intents.length > 0) ? response.intents[0].confidence : 0,
    input: clientText(response),
    output: botText(response),
    email: response.context.email,
    cpf: response.context.cpf,
    tel: response.context.tel
  }
}

function firstCheck(conn, info){
  connection = conn;
  return connection.query(monika.config.sql.query.check_convo_id, info.id);
}

function checkConversation(rows, info){
    let insert;
    if(rows.length === 0){
      let values = "(" + info.status + ", '" + info.name + "', '" +
          info.id + "', '" + info.conversation_date + "')";
      insert = connection.query(monika.config.sql.query.insert_convo_id + values);
    }
    insert = connection.query(monika.config.sql.query.check_convo_id, info.id);
    return insert;
  }

function getMsgIntent(rows, info){
    info.id = rows[0].idt_conversation;
    logContact(info.id, info.email, info.cpf, info.tel);
    updateConversation(info);
    return connection.query(monika.config.sql.query.get_intent, info.intent);
  }
  
function insertMsg(rows, info){
  info.intent = rows[0].intent;
  
  let user_msg = "(" + info.id + ", " + info.profile.user + ", " + info.intent +
        ", '" + info.confidence_score + "', '" + info.input + "', '" + info.message_date + "')";
        
  let bot_msg = "(" + info.id + ", " + info.profile.bot + ", " + info.intent +
        ", '" + info.confidence_score + "', '" + info.output + "', '" + info.message_date + "')";
  
  let msg = user_msg + "," + bot_msg;
  return connection.query(monika.config.sql.query.insert_msg + msg);
}
  
function report(){
  connection.end();
  monika.console.log.green("I loaded the message exchange to the database.");
}
  
function dbLog(conversation_info){
  let connection;
  let info = conversation_info;
  
  mysql.createConnection(monika.config.sql.settings)
    .then(conn => firstCheck(conn, info))
    .then(rows => checkConversation(rows, info))
    .then(rows => getMsgIntent(rows, info))
    
    .then(rows => insertMsg(rows, info))
    .then(last => report())
    .catch(err => dbErr(err, connection));
}

function dbErr(err, con){
  if (con && con.end) con.end();
  monika.console.log.red("Error! Here is the data:");
  monika.console.log.red(err.message);
  if(err.sqlMessage){
    monika.console.log.red(err.sqlMessage);
    monika.console.log.red(err.code + " (#" + err.errno + ")");
  }
}

function logContact(id, email, cpf, tel){
  if(email === null){
    //do nothing
    return;
  }
  var connection;
  mysql.createConnection(monika.config.sql.settings).then(function(conn){
    connection = conn;
    email = email || "Não informado";
    cpf = cpf || "Não informado";
    tel = tel || "Não informado";
    return connection.query(monika.config.sql.query.insert_contact, [id, cpf, tel, email]);
  }).then(function(cont){
    if(cont.insertId > 0){
      monika.console.log.green("Contact information logged successfully.");
    }
  });
}

function updateConversation(info){
  if(info.status === 1 && info.name === "Não Identificado"){
    return;
  }
  
  let base_query = monika.config.sql.query.update_convo;
  let temp_query = "";
  
  var connection;
  mysql.createConnection(monika.config.sql.settings)
  .then(function(conn){
    connection = conn;
    if(info.status !== 1){
      temp_query = base_query.replace(/\#/, " cod_status = " + info.status);
      temp_query = temp_query + " AND cod_status = 1";
      connection.query(temp_query, info.id).then(function(results){
        if(results.affectedRows > 0){
          monika.console.log.yellow("I have updated the conversation info.");
        }
      });
      temp_query = "";
    }
    
    if(info.name !== "Não Identificado"){
      temp_query = base_query.replace(/\#/, " nme_conversation = '" + info.name + "'");
      temp_query = temp_query + " AND nme_conversation = 'Não Identificado'";
      connection.query(temp_query, info.id).then(function(results){
        if(results.affectedRows > 0){
          monika.console.log.yellow("I have updated the conversation info.");
        }
      });
      temp_query = "";
    }
    
    connection.end();
  });
}

async function getWorkspaceIntents(){
  return new Promise((resolve, reject) => {
    let watson = require('watson-developer-cloud');
    let assistant = new watson.AssistantV1({
      username: process.env.ASSISTANT_USERNAME,
      password: process.env.ASSISTANT_PASSWORD,
      version: '2018-07-10'
    });
  
    let params = {
      workspace_id: process.env.WORKSPACE_OA,
    };
  
    let result = {};
  
    assistant.listIntents(params, function(err, response){
      if(err){
        monika.console.log.red(err);
        reject(err);
      }
      else{
        for(let i = 0; i < response.intents.length; i++){
          result[i] = response.intents[i].intent;
        }
        result["length"] = response.intents.length;
      }
      resolve(result);
      return result;
    });
  });
}

async function updateIntents(req, res){
  let result = {};
  let intents = await getWorkspaceIntents();
  let insert_string = "(\'" + intents[0];
  for(let h = 1; h < intents.length; h++){
    insert_string =  insert_string + "\'), (\'" + intents[h];
  }
  insert_string = insert_string + "\')";
  let connection;
  
  mysql.createConnection(monika.config.sql.settings).then(function(conn){
    connection = conn;
    return connection.query(monika.config.sql.query.insert_intents + insert_string);
  }).then(function(){
    return connection.query(monika.config.sql.query.get_all_intents);
  }).then(function(rows, fields){
    connection.end();
    for(let r = 0; r < rows.length; r++){
      result[rows[r].idt_intents] = rows[r].nme_intents;
    }
    res.writeHead(200, monika.config.api.CONTENT);
    res.end(JSON.stringify(result));
  });
  monika.console.log.green("Intents successfully inserted into the database.");
}

module.exports = {
  createCSV: createCSV,
  debugMode: debugMode,
  end: end,
  getFiles: getFiles,
  updateIntents: updateIntents,
  log: log,
  serverHi: serverHi
}

/*!
  Author: Yukashimi
  Date: 24/05/2018
  File: monika.js
*/

let monika = require("../monika").init(["console", "api", "config", "dates", "query"]);
const crypto = require('crypto');
const sql = require('mssql');
let connection;

let fs = require("fs");
let os = require("os");

const PATH = "logs/";
const DIR = "server/";
const INIT_NAME = "temp-";
const BASE_LOG = PATH + INIT_NAME;
const TYPE = [".txt", ".csv"];
const SUFFIX = ["-full", ""];
const MONIKA_LOG = PATH + DIR + "diary-";
const USERS = ["User", "Bot"];

/* ######## FILE WRITER ######## */

function log(response, ip, db_version){
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
  dbLog(parseLogInfo(response, date_id), db_version);
}

function serverHi(port){
  monika.console.log.green("Hi, Monika here.");
  monika.console.log.green(`Okay, everyone! The club is at the port ${port}`);
}

function botText(response){
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
  if(idt === null || idt === undefined || idt === "" || idt === 0){
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

function debugMode(requestedMode){
  const modes = {
    "silent": () => {
      monika.console.log.red("As requested, all logging is off.");
      console.log = () => {};
    },
    "file": () => {
      monika.console.log.green("As requested, I will only write to the server's logs.");
      console.log = (...args) => {
        serverLog.apply(null, args);
      }
    },
    "full": () => {
      monika.console.log.green("As requested, all logging is on.");
      var originalLog = console.log;
      console.log = (...args) => {
        originalLog.apply(null, args);
        serverLog.apply(null, args);
      }
    }
  };
  let run = modes[requestedMode] || (() => {});
  run();
}

function end(user, ip){
  monika.console.log("I recieved an attempt to end the conversation.");
  monika.dates.removeDate(user || ip);
  monika.console.log(`Bye ${(user || ip)}!${os.EOL}`);
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
    monika.console.log.yellow(`I recieved a new connection from ${ip}`);
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
    output = `${output}[INTENT] #${intents[i].intent} [CONFIDENCE] ${intents[i].confidence}${os.EOL}`;
  }
  return output;
}

function renamer(date, user, idt){
  let namedLog = PATH + date + user.toLowerCase() + SUFFIX[idt] + TYPE[0];
  fs.renameSync(BASE_LOG + date + SUFFIX[idt] + TYPE[0], namedLog);
}

function serverLog(){
  let output = `[${monika.dates.time()}] `;
  let name = "default";
  for(let args = 0; args < arguments.length; args++){
    if(!(/\x1b\[/.test(arguments[args]))){
      output = output + arguments[args];
    }
    if((/\x1b\[/.test(arguments[args]))){
      let index = Object.values(monika.console.colors).indexOf(arguments[args].split(/\%s|\%o/)[0]);
      name = (index > -1) ?
        (Object.keys(monika.console.colors)[index]) : "default";
    }
  }
  
  let icons = {
    "black": "fas fa-sync",
    "red": "far fa-times-circle",
    "green": "fas fa-check",
    "yellow": "fas fa-exclamation-triangle",
    "blue": "far fa-thumbs-up",
    "magenta": "far fa-comment",
    "cyan": "fas fa-quote-left",
    "white": "far fa-snowflake",
    "default": "fas fa-list"
  }
  
  if(output !== ""){
    let this_icon = `<span class='fa-li'><i class='${icons[name]}'></i></span>`;
    let li = `<li class='${name}'>${this_icon}${output}</li>`;
    fs.appendFileSync(MONIKA_LOG + monika.dates.date() + TYPE[0], li + os.EOL);
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

/* ######## END OF FILE WRITER ######## */



/* ######## SERVER LOG PAGE ######## */

function logList(req, res){
  let p = PATH + DIR;
  fs.readdir(p, (err, files) => {
    if(err){
      return monika.api.error(res, {"code": 404, "msg": "Log files not found!"});
    }
    if(files){
      for(let f = 0, l = files.length; f < l; f++){
        files[f] = files[f].substring(6, 16);
      }
      res.writeHead(200, monika.config.api.CONTENT);
      res.end(JSON.stringify(files.reverse()));
    }
  });
}

function loadLog(req){
  let p = PATH + DIR;
  let files = fs.readdirSync(p).reverse();
  files = files[req.query.file || 0];//(files.length - 1)]
  let log = p + files;
  
  if(!(fs.existsSync(log))){
    monika.console.log.red("I'm sorry, but I didn't find our logs...");
    return "No log found.";
  }
  if(fs.readFileSync(log, {encoding: 'utf-8'}).length === 0){
    monika.console.log.yellow("I opened the log, but it is empty.\n");
    return "Nothing to show for today.";
  }
  return {"date": files.substring(6, 16), "log": fs.readFileSync(log, {encoding: 'utf-8'}) };
}

/* ######## END OF SERVER LOG PAGE ######## */












/* ######## SQL LOG FUNCTIONS ######## */

function conversationStatus(response){
  return (response.context.error > 0) ? "PEN" : "FIN";
}

function parseLogInfo(response, date_id){
  return {
    id: 0,
    status: conversationStatus(response),
    profile: {"user": "USU", "bot": "VIR"},
    name: response.context.name ? response.context.name : "Não Identificado",
    conversation_date: (monika.dates.getDate(date_id) !== undefined) ? monika.dates.sysToSqlDate(monika.dates.getDate(date_id)) : "2000-01-01 00:00:00",
    message_date: monika.dates.sysToSqlDate(monika.dates.sysDate()),
    intent: (response.intents.length > 0) ? response.intents[0] : {"intent": "BOT", "confidence": 1},
    input: clientText(response),
    output: botText(response),
    
    cpf: response.context.cpf || "00000000000",
    protocol: response.context.protocol
  }
}

function dbLog(conversation_info, db_version){
  let info = conversation_info;
  monika.config.setDB(monika.config.sql.available_dbs[db_version].info);
  new sql.ConnectionPool(monika.config.sql.settings).connect()
  .then((conn) => {
    connection = conn;
    return connection.request()
      .input("informed_protocol", sql.VarChar(13), info.protocol)
      .query(monika.query().select.convo);
  })
  .then((rows) => {
    let insert;
    if(rows.rowsAffected[0] === 0){
      let values = `('${info.status}', 1, 'VIR', '${info.protocol}', '${info.name}', '${info.cpf}', '${info.conversation_date}')`;
      insert = connection.request().query(monika.query(values).insert.convo);
    }
    insert = connection.request()
      .input("informed_protocol", sql.VarChar(13), info.protocol)
      .query(monika.query().select.convo);
    return insert;
  })
  .then((result) => {
    info.id = result.recordset[0].id;
    updateConversation(info, db_version);
    let user_msg = `(${info.id}, '${info.profile.user}', '${info.input}', '${info.message_date}', '${info.intent.intent}', '${info.intent.confidence}')`;
        
    let bot_msg = `(${info.id}, '${info.profile.bot}', '${info.output}', '${info.message_date}', '${info.intent.intent}', '${info.intent.confidence}')`;
  
    let msg = user_msg + "," + bot_msg;
    return connection.request().query(monika.query(msg).insert.msgs);
  })
  .then((last) => {
    connection.close();
    monika.console.log.green("I loaded the message exchange to the database.");
  })
  .catch((err) => dbErr(err, connection));
}

function dbErr(err, con){
  if (con && con.end) con.end();
  monika.console.log.red("Error! Here is the data:" + os.EOL);
  monika.console.log.red(err);
  if(err.sqlMessage){
    monika.console.log.red(err.sqlMessage);
    monika.console.log.red(`${err.code} (#${err.errno})`);
  }
}
/*
function logContact(id, email, cpf, tel, db_version){
  var connection;
  monika.config.setDB(monika.config.sql.available_dbs[db_version].info);
  sql.connect(monika.config.sql.settings)
  .then((conn) => {
    connection = conn;
    email = email || "Não informado";
    cpf = cpf || "Não informado";
    tel = tel || "Não informado";
    return connection.request().query(monika.query().insert.contact, [id, cpf, tel, email]);
  })
  .then((cont) => {
    sql.close();
    if(cont.insertId > 0){
      monika.console.log.green("Contact information logged successfully.");
    }
  })
  .catch((err) => dbErr(err, connection));
}*/

function makeProtocol(stat=1){
  const id = new Date();
  const protocol = "" + id.getFullYear() + monika.dates.fixDisplay(id.getMonth() + 1) + monika.dates.fixDisplay(id.getDate()) + monika.dates.fixDisplay(id.getMinutes()) + monika.dates.fixDisplay(id.getSeconds()) + stat;
  monika.console.log.yellow(`The protocol number for this conversation is ${protocol}\.`);
  return protocol;
}

function updateConversation(info, db_version){
  if(info.status === "FIN" && info.name === "Não Identificado"
        && info.cpf === "00000000000"){
    return;
  }
  
  monika.config.setDB(monika.config.sql.available_dbs[db_version].info);
  new sql.ConnectionPool(monika.config.sql.settings).connect()
  .then((conn) => {
    connection = conn;
    
    if(info.status !== "FIN"){
      connection.request()
        .input("new_info", sql.VarChar(3), info.status)
        .input("idt", sql.Int, info.id)
        .query(monika.query({"set": "IND_STATUS =", "and": "IND_STATUS = 'FIN'"}).update.convo)
      .then((results) => {
        if(results.affectedRows > 0){
          monika.console.log.yellow("I have updated the conversation info.");
        }
      })
      .catch((err) => dbErr(err, connection));
    }
    
    if(info.name !== "Não Identificado"){
      connection.request()
        .input("new_info", sql.VarChar(100), info.name)
        .input("idt", sql.Int, info.id)
        .query(monika.query({"set": "NOM_USUARIO =", "and": "NOM_USUARIO = 'Não Identificado'"}).update.convo)
      .then((results) => {
        if(results.affectedRows > 0){
          monika.console.log.yellow("I have updated the conversation info.");
        }
      })
      .catch((err) => dbErr(err, connection));
    }
    
    if(info.cpf !== "00000000000"){
      connection.request()
        .input("new_info", sql.VarChar(11), info.cpf)
        .input("idt", sql.Int, info.id)
        .query(monika.query({"set": "CPF_USUARIO", "and": "CPF_USUARIO = '00000000000'"}).update.convo)
      .then((results) => {
        if(results.affectedRows > 0){
          monika.console.log.yellow("I have updated the conversation info.");
        }
      })
      .catch((err) => dbErr(err, connection));
    }
    
    sql.close();
  });
}

function login(req, res){
  const db_version = req.body.version;
  let user = req.body.user;
  let key = oddHash(req.body.password);
  let logged = false;
  
  let connection;
  
  monika.config.setDB(monika.config.sql.available_dbs[db_version].login);
  new sql.ConnectionPool(monika.config.sql.settings).connect()
  .then(pool => {
    connection = pool;
    return connection.request()
    .input("user", sql.VarChar(60), user)
    .query(monika.query().login);
  }).then(result => {
    connection.close();
    let huh = (result.recordset.length > 0) ? result.recordset[0].PWD_USUARIO : "";
    if(key !== huh){
      res.writeHead(401, monika.config.api.CONTENT);
      res.end(JSON.stringify({"msg": "Usuário e senha não confere..."}));
      return;
    }
    monika.console.log.green("Login successful");
    res.writeHead(200, monika.config.api.CONTENT);
    res.end(JSON.stringify({"msg": "gud"}));
  })
  .catch(err => {
    connection.close();
    throw err;
  });
  sql.on('error', err => {
    connection.close();
    throw err;
  });
}

/* ######## END OF SQL LOG FUNCTIONS ######## */

function oddHash(plainText=""){
  let q = crypto.createHash('md5').update(plainText).digest('hex');
  return q.substring(0, q.length - 2).toUpperCase();
}

module.exports = {
  createCSV: createCSV,
  dbErr: dbErr,
  debugMode: debugMode,
  end: end,
  getFiles: getFiles,
  makeProtocol: makeProtocol,
  updateConversation: updateConversation,
  log: log,
  login: login,
  logList: logList,
  load: loadLog,
  serverHi: serverHi
}

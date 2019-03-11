/*!
  Author: Yukashimi
  Date: 23/07/2018
  File: api-handler.js
*/

const sql = require('mssql');
const tokens = {};
let monika = require("../monika").init(["validator", "config", "console", "logs", "query"]);

/* In theory this should be in the http module but...*/
const http_status = {
  "400": {
    code: 400,
    msg: "Usuário e senha não podem ser em branco."
  },
  "401": {
    code: 401,
    msg: "Usuário e senha não confere."
  },
  "403": {
    code: 403,
    msg: "Falha ao autozição a requisição."
  },
  "404": {
    code: 404,
    msg: "Informação não encontrada?"
  }
};

function error(res, err){
  monika.console.log.red("Error! Here is the data:", err);
  res.writeHead(err.code, monika.config.api.CONTENT);
  res.end(JSON.stringify(err));
  return err;
}

function outputInfo(rows){
  // rows = rows.recordset[0]
  return {
    "celular": rows.celular,
    "cep": rows.cep,
    "cpf": rows.cpf,
    "email": rows.email,
    "gender": rows.gender,
    "mother": rows.mother,
    "name": rows.name,
    "phone": rows.phone,
    "user": rows.user
  };
}

async function testMonika(req, res){
  monika.console.log.magenta("Let's see if I'm still working.");
  var options = monika.http.setOptions("GET", "http://10.10.170.105", "/monika/ip", monika.http.setPort(req));
  let monika_info = await monika.http.requests[options.method](options, true);
  res.writeHead(monika_info.header.code, monika.config.api.CONTENT);
  res.end(JSON.stringify(monika_info));
}

function update(req, res){
  const user = req.body.user;
  const update = req.body.update;
  const value = req.body.value;
  const db_version = req.body.version;
  let connection;
  let success = false;
  let info = {};
  
  const methods = {
    "celular": "NR_CELULAR =",
    "cep": "NR_CEP =",
    "email": "NO_EMAIL =",
    "phone": "NR_FONE ="
  };
  
  // monika.console.log.yellow(tokens[user]);
  // monika.console.log.yellow(monika.logs.hasher(`${user}${req.body.stamp}${req.ip}`));
  
  if(tokens[user] !== monika.logs.hasher(`${user}${req.body.stamp}${req.ip}`)){
    return error(res, http_status["403"]);
  }
  
  monika.console.log.magenta(`${user} is trying to update their ${update}`);
  
  monika.config.setDB(monika.config.sql.available_dbs[db_version].login);
  new sql.ConnectionPool(monika.config.sql.settings).connect()
  .then((conn) => {
    connection = conn;
    return connection.query(monika.query(user).select.cod_person);
  }).then((rows) => {
    const cod = rows.recordset[0].cod;
    const ph = {
      "cod": cod,
      "method": methods[update],
      "value": value
    };
    return connection.query(monika.query(ph).update.user);
  }).then((rows) => {
    success = rows.rowsAffected.length > 0;
    return connection.query(monika.query(user).select.user);
  }).then((rows) => {
    connection.close();
    // monika.console.log.yellow(result);
    
    if(rows.rowsAffected > 0 && success){
      info = outputInfo(rows.recordset[0]);

      monika.console.log.green(`I have updated ${user}'s ${update} with the new value of: ${value}`);
      res.writeHead(200, monika.config.api.CONTENT);
      return res.end(JSON.stringify(info));
    }
    return error(res, http_status["400"]);
  });
  
  // monika.http.notImplementedYet(res, req.path);
}

function userData(req, res){
  const db_version = req.body.version;
  let user = req.body.user;
  let key = req.body.password;
  let logged = false;
  
  let connection;
  let err;
  let info = {};
  monika.console.log.magenta("I recieved an attempt to collect user data");
  // let err = monika.validator.query({"cpf": req.query.cpf});
  // if(err){
    // return error(res, err);
  // }
  // err = monika.validator.data(req.query.cpf, "cpf");
  // if(err){
    // return error(res, err);
  // }
  
  if(user === '' || key === ''){
    return error(res, http_status["400"]);
  }
  
  monika.config.setDB(monika.config.sql.available_dbs[db_version].login);
  new sql.ConnectionPool(monika.config.sql.settings).connect()
  .then((conn) => {
    connection = conn;
    return connection.request()
      .input("user", sql.VarChar(60), user)
      .query(monika.query().select.login);
  }).then(result => {
    let found = (result.recordset.length > 0);
    let cod = found ? result.recordset[0].cod : "";
    let secret = found ? result.recordset[0].secret : "";
    key = monika.logs.hasher(`${cod}${key}`);
    if(key !== secret){
      // res.writeHead(401, monika.config.api.CONTENT);
      // res.end(JSON.stringify({"msg": "Usuário e senha não confere..."}));
      // return connection.request().query("select 1");
      err = http_status["401"];
      // user = "";
    }
    return connection.request().query(monika.query(user).select.user);
  })
  .then((rows) => {
    connection.close();
    if(err){
      return error(res, err);
    }
    if(rows.rowsAffected === 0){
      return error(res, http_status["400"]);
    }
    if(rows.rowsAffected > 0){
      info = outputInfo(rows.recordset[0]);
      
      info.stamp = monika.logs.hasher(`${new Date()}`);
      tokens[user] = monika.logs.hasher(`${user}${info.stamp}${req.ip}`);
      // monika.console.log.yellow(tokens[user]);
      
      // info.token = tokens[user];
      monika.console.log.yellow(`I have created a new access token for ${user}`);
      
      res.writeHead(200, monika.config.api.CONTENT);
      return res.end(JSON.stringify(info));
    }
  });
}

module.exports = {
  // earningReport: earningReport,
  error: error,
  // informativeLoanData: informativeLoanData,
  // loanData: loanData,
  // payslip: payslip,
  testMonika: testMonika,
  update: update,
  userData: userData
};
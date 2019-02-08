/*!
  Author: Yukashimi
  Date: 18/09/2018
  File: analytic.js
*/

const sql = require('mssql');
let monika = require("../monika").init(["validator", "api", "dates", "config", "console", "http", "logs", "query"]);
let connection;

const methods = {
  "id": "AND A.OID_CONVERSA = @param",
  "protocol": "AND A.COD_PROTOCOLO = @param",
  "name": "AND NOM_USUARIO = @param",
  "date": "AND CONVERT(date, DTA_INI_CONVERSA) = @param",
  "type": "AND IND_TIPO_ATENDIMENTO = @param",
  "cpf": "AND CPF_USUARIO = @param",
  "range": "AND DTA_INI_CONVERSA >= '@param' AND CONVERT(date, DTA_INI_CONVERSA) <= '@param'",
  "default": ""
}

function datedGraph(dates, req, res){
  let err = monika.validator.query({"start": dates.start, "end": dates.end});
  let connection;
  let info = {};
  
  if(err){
    return monika.api.error(res, err);
  }
  err = monika.validator.date(dates.start, "min");
  if(err){
    return monika.api.error(res, err);
  }
  err = monika.validator.date(dates.end, "min");
  if(err){
    return monika.api.error(res, err);
  }
  
  let infoRange = monika.dates.range(dates.start, dates.end);
  for(let i = 0; i < infoRange.length; i++){
    info["" + infoRange[i]] = 0;
  }
  
  monika.config.setDB(monika.config.sql.available_dbs[req.query.db].info);
  new sql.ConnectionPool(monika.config.sql.settings).connect()
  .then((conn) => {
    connection = conn;
    return connection.request().query(monika.query({"start": dates.start, "end": dates.end}).select.dated_graph);
  })
  .then((data) => {
    connection.close();
    for(let d = 0; d < data.rowsAffected; d++){
      info[data.recordset[d].date_index] = data.recordset[d].amount;
    }
    res.writeHead(200, monika.config.api.CONTENT);
    res.end(JSON.stringify(info));
  })
  .catch((err) => monika.logs.dbErr(err, connection));
}

function detailedInfo(req, res){
  let param;
  let query;
  let info = {
    "msgs": [],
    "id": 0,
    "name": "",
    "protocol": "",
    "time": "",
    "date": "",
    "phone": "NA",
    "cpf": "NA",
    "email": "NA",
    "status": ""
  };
  let methodToUse;
  let err = monika.validator.query({"param": req.query.param, "method": req.query.method});
  
  if(err){
    return monika.api.error(res, err);
  }
  
  methodToUse = methods[req.query.method] || methods["id"];
  param = req.query.param;// || req.query.id;

  query = monika.query(methodToUse).select;
  
  monika.config.setDB(monika.config.sql.available_dbs[req.query.db].info);
  new sql.ConnectionPool(monika.config.sql.settings).connect()
  .then((conn) => {
    connection = conn;
    return connection.request()
      .input("param", param).query(query.summary);
  })
  .then((rows) => {
    if(rows.rowsAffected > 0){
      for(let i = 0; i < rows.rowsAffected; i++){
        info.msgs[i] = [rows.recordset[i].convo, rows.recordset[i].sender, rows.recordset[i].when];
      }
      info.id = rows.recordset[0].id;
      info.protocol = protocolToMask(rows.recordset[0].protocol);
      info.status = rows.recordset[0].status;
      info.name = rows.recordset[0].name;
    }
    if(rows.rowsAffected === 0){
      info.status = 0;
      info.name = "N/A";
    }
    return connection.request()
      .input("param", param).query(query.summary_time);
  })
  .then((rows) => {
    if(rows.rowsAffected > 0){
      info.time = rows.recordset[0].time;
      info.date = rows.recordset[0].date;
    }
    if(info.id === 0){
      info.time = "N/A";
      info.date = "N/A";
      info.protocol = "N/A";
      info.msgs[0] = ["Nenhum atendimento encontrado", "VIR"];
    }
    return connection.request().query(query.summary_contact, param);
  })
  .then((rows) => {
    connection.close();
    if(rows.rowsAffected > 0){
      info.phone = rows.recordset[0].telefone || "NA";
      info.cpf = rows.recordset[0].cpf || "NA";
      info.email = rows.recordset[0].email || "NA";
    }
    res.writeHead(200, monika.config.api.CONTENT);
    res.end(JSON.stringify(info));
  })
  .catch((err) => monika.logs.dbErr(err, connection));
}

function proceed(req, res){
  let connection;
  let id = req.body.id;
  let sqldate = monika.dates.rawStringToSqlDate(req.body.date);
  let protocol = req.body.protocol;
  
  monika.config.setDB(monika.config.sql.available_dbs[req.body.db].info);
  new sql.ConnectionPool(monika.config.sql.settings).connect()
  .then((conn) => {
    connection = conn;
    let values = `(${id}, 'VIR', '[Atendimento Iniciado]', '${monika.dates.rawStringToSqlDate(req.body.date)}', 'Bot', 1)`;
    return connection.request().query(monika.query(values).insert.msgs);
  })
  .then((last) => {
    connection.close();
    res.writeHead(200, monika.config.api.CONTENT);
    res.end(JSON.stringify({"msg": "all good!!", "id": id, "protocol": protocol}));
  })
  .catch((err) => monika.logs.dbErr(err, connection));
}

function insertNew(req, res){
  /*might want to divide this one- wait, didn't I do that already?*/
  let connection;
  let id;
  let protocol = monika.logs.makeProtocol(req.body.level);

  let sqldate = monika.dates.rawStringToSqlDate(req.body.date);

  monika.config.setDB(monika.config.sql.available_dbs[req.body.db].info);
  new sql.ConnectionPool(monika.config.sql.settings).connect()
  .then((conn) => {
    connection = conn;
    let values = `('PEN', ${req.body.level}, 'HUM', '${protocol}', '${req.body.name}', '${req.body.contact.cpf}', '${sqldate}')`;
    return connection.request().query(monika.query(values).insert.convo);
  })
  .then((rows) => {
    return connection.request()
      .input("informed_protocol", sql.VarChar(13), protocol)
      .query(monika.query().select.convo);
  })
  .then((rows) => {
    id = rows.recordset[0].id;
    let values = `(${id}, 'ATE', '[Atendimento Iniciado]', '${monika.dates.rawStringToSqlDate(req.body.date)}', 'Bot', 1)`;
    return connection.request().query(monika.query(values).insert.msgs);
  })
  .then((last) => {
    connection.close();
    
    res.writeHead(200, monika.config.api.CONTENT);
    res.end(JSON.stringify({"msg": "all good!!", "id": id, "protocol": protocol}));
  })
  .catch((err) => monika.logs.dbErr(err, connection));
}

function list(req, res){
  let err;
  let stats = {
    "all": "('FIN', 'PEN', 'RES')",
    "bad": "('PEN')"
  };
  let info = [];
  
  /* #### Default Values? #### */
  let param = "";
  let methodToUse = "default";
  let stat = stats.all;

  if(req.query.start && req.query.end){
    err = monika.validator.query({"start": req.query.start, "end": req.query.end, "status": req.query.status});
    if(err){
      return monika.api.error(res, err);
    }
    err = monika.validator.date(req.query.start, "min");
    if(err){
      return monika.api.error(res, err);
    }
    err = monika.validator.date(req.query.end, "min");
    if(err){
      return monika.api.error(res, err);
    }
    methodToUse = "range";
    param = [req.query.start, req.query.end];
  }
  
  if(req.query.param && req.query.method){
    err = monika.validator.query({"param": req.query.param, "method": req.query.method, "status": req.query.status});
    if(err){
      return monika.api.error(res, err);
    }
    methodToUse = req.query.method || "id";
    param = req.query.param;
    if(methodToUse === "protocol"){
      param = maskToProtocol(param);
    }
    if(methodToUse === "cpf"){
      param = maskToCpf(param);
    }
  }

  methodToUse = methods[methodToUse];
  stat = (stats[req.query.status] || stats.all)

  monika.config.setDB(monika.config.sql.available_dbs[req.query.db].info);
  new sql.ConnectionPool(monika.config.sql.settings).connect()
  .then((conn) => {
    connection = conn;
    return connection.request().input("param", /*sql.VarChar(13),*/ param)
      .query(monika.query({"stat": stat, "method": methodToUse}).select.list);
  })
  .then((rows) => {
    connection.close();
    for(let r = 0; r < rows.rowsAffected; r++){
      info[r] = {
        id: rows.recordset[r].id,
        name: rows.recordset[r].user,
        date: rows.recordset[r].formated_date,
        time: rows.recordset[r].diff_time,
        status: rows.recordset[r].status,
      }
    }
    info.length = rows.rowsAffected;
    if(rows.rowsAffected[0] === 0){
      info[0] = {
        id: 0,
        name: "Nenhuma atendimento encontrado",
        date: "N/A",
        time: "N/A",
        status: "FIN",
      }
    }
    res.writeHead(200, monika.config.api.CONTENT);
    res.end(JSON.stringify(info));
  })
  .catch((err) => monika.logs.dbErr(err, connection));
}

function header(req, res){
  //let isDated = (req.query.start && req.query.end);
  let info = {};
  //let param = "";
  //let temp_query = isDated ? monika.query().select.dated_header : monika.query().select.header;
  
  /*if(isDated){
    let err = monika.validator.query({"start": req.query.start, "end": req.query.end});
    if(err){
      return monika.api.error(res, err);
    }
    err = monika.validator.date(req.query.start, "min");
    if(err){
      return monika.api.error(res, err);
    }
    err = monika.validator.date(req.query.end, "min");
    if(err){
      return monika.api.error(res, err);
    }
    param = [req.query.start, req.query.end, req.query.start, req.query.end, req.query.start, req.query.end];
  }*/
  
  monika.config.setDB(monika.config.sql.available_dbs[req.query.db].info);
  new sql.ConnectionPool(monika.config.sql.settings).connect()
  .then((conn) => {
    connection = conn;
    return connection.request().query(monika.query().select.header);
    //temp_query, param);
  })
  .then((rows) => {
    connection.close();
    info["convo"] = rows.recordset[0].convo;
    info["msgs"] = rows.recordset[0].msgs;
    info["average"] = rows.recordset[0].average;
    res.writeHead(200, monika.config.api.CONTENT);
    res.end(JSON.stringify(info));
  })
  .catch((err) => monika.logs.dbErr(err, connection));
}

function loadGraph(req, res){
  if(req.query.start && req.query.end){
    return datedGraph(req.query, req, res);
  }
  let graph = {
    month: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    hours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    days: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
           0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
           0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    week: [0, 0, 0, 0, 0, 0, 0]
  }
  
  monika.config.setDB(monika.config.sql.available_dbs[req.query.db].info);
  new sql.ConnectionPool(monika.config.sql.settings).connect()
  .then((conn) => {
    connection = conn;
    return connection.request().query(monika.query().select.graph);
  })
  .then((rows) => {
    connection.close();
    for(let h = 0; h < rows.rowsAffected; h++){
      graph.month[(parseInt(rows.recordset[h].month, 10) - 1)]++;
      graph.hours[parseInt(rows.recordset[h].hours, 10)]++;
      graph.days[(parseInt(rows.recordset[h].days, 10) - 1)]++;
      let dayindex = (parseInt(rows.recordset[h].week, 10) - 1) > 0 ? (parseInt(rows.recordset[h].week, 10) - 2) : 6;
      graph.week[dayindex]++;
    }
    res.writeHead(200, monika.config.api.CONTENT);
    res.end(JSON.stringify(graph));
  })
  .catch((err) => monika.logs.dbErr(err, connection));
}

function maskToCpf(c){
  return c.replace(/\-|\./g, "");
}

function maskToProtocol(p){
  return p.replace(/\/|\./g, "");
}

function protocolToMask(p){
  return p.slice(0, 8) + "/" + p.slice(8, 12) + "." + p.slice(-1);
}

function updater(req, res){
  let sqldate = monika.dates.rawStringToSqlDate(req.body.log.date);
  let connection;
  let status_msg = {
    "PEN": "Atendimento encaminhado para o Nível 3.",
    "RES": "Atendimento Finalizado com sucesso."
  };
  
  monika.config.setDB(monika.config.sql.available_dbs[req.body.db].info);
  new sql.ConnectionPool(monika.config.sql.settings).connect()
  .then((conn) => {
    connection = conn;
    return connection.request()
      .input("status", sql.VarChar(3), req.body.update.status)
      .input("idt", sql.Int, req.body.update.id)
      .query(monika.query("OID_CONVERSA = @idt").update.status);
  })
  .then((rows) => {
    let values = `(${req.body.update.id}, 'ATE', '${req.body.log.msg}', '${sqldate}', 'Bot', 1)`;
    return connection.request().query(monika.query(values).insert.msgs);
  })
  .then((last) => {
    connection.close();
    res.writeHead(200, monika.config.api.CONTENT);
    res.end(JSON.stringify({"msg": status_msg[req.body.update.status]}));
  })
  .catch((err) => monika.logs.dbErr(err, connection));
}

module.exports = {
  detailedInfo: detailedInfo,
  insertNew: insertNew,
  list: list,
  header: header,
  loadGraph: loadGraph,
  proceed: proceed,
  updater: updater
}

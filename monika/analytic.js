/*!
  Author: Yukashimi
  Date: 18/09/2018
  File: analytic.js
*/

const sql = require('mssql');
let monika = require("../monika").init(["validator", "api", "dates", "config", "console", "logs", "query"]);
let connection;

const methods = {
  "id": "AND A.OID_CONVERSA = @param",
  "protocol": "AND A.COD_PROTOCOLO = @param",
  "name": "AND NOM_USUARIO LIKE @param",
  "date": "AND CONVERT(date, DTA_INI_CONVERSA) = @param",
  "type": "AND IND_TIPO_ATENDIMENTO = @param",
  "cpf": "AND CPF_USUARIO = @param",
  "range": "AND DTA_INI_CONVERSA >= '@param' AND CONVERT(date, DTA_INI_CONVERSA) <= '@param'",
  "default": ""
}

function getMethod(method, param){
  const methods = {
    "id": `AND A.OID_CONVERSA = ${param}`,
    "protocol": `AND A.COD_PROTOCOLO = ${param}`,
    "name": `AND NOM_USUARIO = ${param}`,
    "date": `AND CONVERT(date, DTA_INI_CONVERSA) = ${param}`,
    "type": `AND IND_TIPO_ATENDIMENTO = ${param}`,
    "cpf": `AND CPF_USUARIO = ${param}`,
    "range": "AND DTA_INI_CONVERSA >= '@param' AND CONVERT(date, DTA_INI_CONVERSA) <= '@param'",
    "default": ""
  };
  return methods[method] || methods["default"];
}







async function datedGraph(dates, req, res){
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
  
  try{
    monika.config.setDB(monika.config.sql.available_dbs[req.query.db].info);
    connection = await new sql.ConnectionPool(monika.config.sql.settings).connect()

    const data = await connection.request().query(monika.query({"start": dates.start, "end": dates.end}).select.dated_graph);

    connection.close();
    for(let d = 0; d < data.rowsAffected; d++){
      info[data.recordset[d].date_index] = data.recordset[d].amount;
    }
    res.writeHead(200, monika.config.api.CONTENT);
    res.end(JSON.stringify(info));
  }
  catch(err){
    monika.logs.dbErr(err, connection, res, ["analytic", "graph1"]);
  };
}

async function detailedInfo(req, res){
  let current_level = "summary";
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
  
  
  try{
    monika.config.setDB(monika.config.sql.available_dbs[req.query.db].info);
    connection = await new sql.ConnectionPool(monika.config.sql.settings).connect();

    // monika.console.log(query.summary);
    const rows_summary = await connection.request()
      .input("param", param).query(query.summary);

    current_level = "summary";
    if(rows_summary.rowsAffected > 0){
      for(let i = 0; i < rows_summary.rowsAffected; i++){
        // info.msgs[i] = [rows_summary.recordset[i].convo, rows_summary.recordset[i].sender, rows_summary.recordset[i].when];
        info.msgs[i] = {
          "convo": rows_summary.recordset[i].convo,
          "sender": rows_summary.recordset[i].sender,
          "when": rows_summary.recordset[i].when
        };
      }
      info.id = rows_summary.recordset[0].id;
      info.protocol = protocolToMask(rows_summary.recordset[0].protocol);
      info.status = rows_summary.recordset[0].status;
      info.name = rows_summary.recordset[0].name;
      info.cpf = rows_summary.recordset[0].cpf;
    }
    if(rows_summary.rowsAffected === 0){
      info.status = 0;
      info.name = "N/A";
    }
    // monika.console.log.yellow(query.summary_time);
    const rows_time = await connection.request()
      .input("param", param).query(query.summary_time);
  
    current_level = "time";
    connection.close();
    if(rows_time.rowsAffected > 0){
      info.time = rows_time.recordset[0].time;
      info.date = rows_time.recordset[0].date;
    }
    if(info.id === 0){
      info.time = "N/A";
      info.date = "N/A";
      info.protocol = "N/A";
      info.msgs[0] = ["Nenhum atendimento encontrado", "VIR"];
    }
    
    monika.config.setDB(monika.config.sql.available_dbs[req.query.db].login);
    connection = await new sql.ConnectionPool(monika.config.sql.settings).connect();
    
    // monika.console.log.blue(monika.query("USR_LOGIN").select.framer);
    const rows_closingframe = await connection.request().input("cpf", sql.VarChar(20), info.cpf).query(monika.query("USR_LOGIN").select.framer);
    
    current_level = "closingframe";
    // monika.console.log.magenta(rows);
    connection.close();
    if(rows_closingframe.rowsAffected > 0){
      info.phone = rows_closingframe.recordset[0].celular || rows_closingframe.recordset[0].phone || "NA";
      info.email = rows_closingframe.recordset[0].email || "NA";
    }
    res.writeHead(200, monika.config.api.CONTENT);
    res.end(JSON.stringify(info));
  }
  catch(err){
    monika.logs.dbErr(err, connection, res, ["analytic", current_level]);
  }
}

async function framer(req, res){
  let connection;
  let cpf = req.query.cpf;
  let info = {};
  
  try{
    monika.config.setDB(monika.config.sql.available_dbs[req.query.db].login);
    connection = await new sql.ConnectionPool(monika.config.sql.settings).connect()
  
    const rows = await connection.request()
      .input("cpf", sql.VarChar(20), cpf)
      .query(monika.query().select.framer);
  
    connection.close();
    const found = (rows.recordset.length > 0);
    
    if(found){
      info["name"] = rows.recordset[0].name;
      info["birth"] = monika.dates.sqlToDisplay(rows.recordset[0].birth);
      info["mother"] = rows.recordset[0].mother || "Nome não informado";
      info["email"] = rows.recordset[0].email || "Não Informado";
      info["phone"] = rows.recordset[0].celular || rows.recordset[0].phone || "Não Informado";
      res.writeHead(200, monika.config.api.CONTENT);
      res.end(JSON.stringify(info));
    }
    else{
      info["name"] = "Não Encontrado";
      info["birth"] = "Não Informado";
      info["mother"] = "Não Informado";
      info["email"] = "Não Informado";
      info["phone"] = "Não Informado";
      res.writeHead(404, monika.config.api.CONTENT);
      res.end(JSON.stringify(info));
    }
  }
  catch(err){
    monika.logs.dbErr(err, connection, res, ["analytic", "framer"]);
  }
}

async function proceed(req, res){
  let connection;
  let id = req.body.id;
  let sqldate = monika.dates.rawStringToSqlDate(req.body.date);
  let protocol = req.body.protocol;
  
  try{
    monika.config.setDB(monika.config.sql.available_dbs[req.body.db].info);
    connection = await new sql.ConnectionPool(monika.config.sql.settings).connect()

    let values = `(${id}, 'VIR', '[Atendimento Iniciado]', '${monika.dates.rawStringToSqlDate(req.body.date)}', 'Bot', 1)`;
    const last = await connection.request().query(monika.query(values).insert.msgs);
  
    connection.close();
    res.writeHead(200, monika.config.api.CONTENT);
    res.end(JSON.stringify({"msg": "all good!!", "id": id, "protocol": protocol}));
  }
  catch(err){
    monika.logs.dbErr(err, connection, res, ["analytic", "proceed"]);
  }
}

async function insertNew(req, res){
  /*might want to divide this one- wait, didn't I do that already?*/
  let connection;
  let id;
  let protocol = monika.logs.makeProtocol(req.body.level);

  let sqldate = monika.dates.rawStringToSqlDate(req.body.date);

  try{
    monika.config.setDB(monika.config.sql.available_dbs[req.body.db].info);
    connection = await new sql.ConnectionPool(monika.config.sql.settings).connect()

    let values = `('PEN', ${req.body.level}, 'HUM', '${protocol}', '${req.body.name}', '${maskToCpf(req.body.contact.cpf)}', '${sqldate}')`;
    
    await connection.request().query(monika.query(values).insert.convo);
  
    const rows = await connection.request()
      .input("informed_protocol", sql.VarChar(13), protocol)
      .query(monika.query().select.convo);
  
    id = rows.recordset[0].id;
    let values = `(${id}, 'ATE', '[Atendimento Iniciado]', '${monika.dates.rawStringToSqlDate(req.body.date)}', 'Bot', 1)`;
    
    await connection.request().query(monika.query(values).insert.msgs);
  
    connection.close();
    
    res.writeHead(200, monika.config.api.CONTENT);
    res.end(JSON.stringify({"msg": "all good!!", "id": id, "protocol": protocol}));
  }
  catch(err){
    monika.logs.dbErr(err, connection, res, ["analytic", "new"]);
  }
}

async function list(req, res){
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
    /* Can this be optimizated? */
    if(methodToUse === "protocol"){
      param = maskToProtocol(param);
    }
    if(methodToUse === "cpf"){
      param = maskToCpf(param);
    }
    if(methodToUse === "name"){
      param = `%${param}%`;
    }
  }

  methodToUse = methods[methodToUse];
  stat = (stats[req.query.status] || stats.all)

  try{
    monika.config.setDB(monika.config.sql.available_dbs[req.query.db].info);
    connection = await new sql.ConnectionPool(monika.config.sql.settings).connect()

    const rows = await connection.request().input("param", /*sql.VarChar(13),*/ param)
      .query(monika.query({"stat": stat, "method": methodToUse}).select.list);

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
  }
  catch(err){
    monika.logs.dbErr(err, connection, res, ["analytic", "list"]);
  }
}

async function header(req, res){
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
  
  try{
    monika.config.setDB(monika.config.sql.available_dbs[req.query.db].info);
    connection = await new sql.ConnectionPool(monika.config.sql.settings).connect()

    const rows = await connection.request().query(monika.query().select.header);
    //temp_query, param);
  
    connection.close();
    info["convo"] = rows.recordset[0].convo;
    info["msgs"] = rows.recordset[0].msgs;
    info["average"] = rows.recordset[0].average;
    info["top"] = rows.recordset[0].top;
    res.writeHead(200, monika.config.api.CONTENT);
    res.end(JSON.stringify(info));
  }
  catch(err){
    monika.logs.dbErr(err, connection, res, ["analytic", "header"]);
  }
}

async function loadGraph(req, res){
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
  
  try{
    monika.config.setDB(monika.config.sql.available_dbs[req.query.db].info);
    connection = await new sql.ConnectionPool(monika.config.sql.settings).connect()

    const rows = await connection.request().query(monika.query().select.graph);

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
  }
  catch(err){
    monika.logs.dbErr(err, connection, res, ["analytic", "graph2"]);
  }
}

function maskToCpf(c){
  return c.replace(/\-|\./g, "");
}

function maskToProtocol(p){
  return p.replace(/\/|\./g, "");
}

function protocolToMask(p){
  return `${p.slice(0, 8)}/${p.slice(8, 12)}.${p.slice(-1)}`;
}

async function updater(req, res){
  let sqldate = monika.dates.rawStringToSqlDate(req.body.log.date);
  let connection;
  let status_msg = {
    "PEN": "Atendimento encaminhado para o Nível 3.",
    "RES": "Atendimento Finalizado com sucesso."
  };
  
  try{
    monika.config.setDB(monika.config.sql.available_dbs[req.body.db].info);
    connection = await new sql.ConnectionPool(monika.config.sql.settings).connect()

    await connection.request()
      .input("status", sql.VarChar(3), req.body.update.status)
      .input("idt", sql.Int, req.body.update.id)
      .query(monika.query("OID_CONVERSA = @idt").update.status);
  
    let values = `(${req.body.update.id}, 'ATE', '${req.body.log.msg}', '${sqldate}', 'Bot', 1)`;
    await connection.request().query(monika.query(values).insert.msgs);
  
    connection.close();
    res.writeHead(200, monika.config.api.CONTENT);
    res.end(JSON.stringify({"msg": status_msg[req.body.update.status]}));
  }
  catch(err){
    monika.logs.dbErr(err, connection, res, ["analytic", "updater"]);
  }
}

module.exports = {
  detailedInfo: detailedInfo,
  framer: framer,
  header: header,
  insertNew: insertNew,
  list: list,
  loadGraph: loadGraph,
  proceed: proceed,
  updater: updater
}

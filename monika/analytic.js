/*!
  Author: Yukashimi
  Date: 18/09/2018
  File: analytic.js
*/

let mysql = require("promise-mysql");
let monika = require("../monika").init(["validator", "api", "dates", "config", "console", "http", "logs"]);

function datedGraph(dates, res){
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
  
  mysql.createConnection(monika.config.sql.settings).then(function(conn){
    connection = conn;
    return connection.query(monika.config.sql.select.dated_graph, [dates.start, dates.end]);
  }).then(function(data){
    connection.end();
    for(let d = 0; d < data.length; d++){
      info[data[d].date_index] = data[d].amount;
    }
    res.writeHead(200, monika.config.api.CONTENT);
    res.end(JSON.stringify(info));
  });
}

function detailedInfo(req, res){
  let param;
  let query = [
    "", ""
  ];
  let info = {
    "msgs": [],
    "id": 0,
    "name": "",
    "protocol": "",
    "time": "",
    "date": "",
    "phone": "",
    "cpf": "",
    "email": "",
    "ibm": "",
    "status": ""
  };
  let methods = {
    "id": "idt_conversation",
    "protocol": "pro_conversation",
    //"protocol2": "pro_conversation = CONCAT() OR pro_conversation = CONCAT()",
    "name": "nme_conversation",
    "date": "DATE(dte_conversation)",
    "type": "cod_type",
    "cpf": "cpf_contato"
  }
  let methodToUse;

  let errs = [
    monika.validator.query({"id": req.query.id}),
    monika.validator.query({"param": req.query.param, "method": req.query.method})
  ];

  if(!errs[0] && errs[1]){
    //valid id, invalid method
    methodToUse = methods["id"];
    param = req.query.id;
  }
  
  if(errs[0] && !errs[1]){
    //invalid id, valid method
    methodToUse = methods[req.query.method];
    param = req.query.param;
  }

  query[0] = monika.config.sql.select.summary.replace(monika.config.sql.PLACEHOLDER, methodToUse);
  query[1] = monika.config.sql.select.summary_time.replace(monika.config.sql.PLACEHOLDER, methodToUse);
  
  if(errs[0] && errs[1]){
    return monika.api.error(res, errs[0]);
  }

  mysql.createConnection(monika.config.sql.settings).then(function(conn){
    connection = conn;
    return connection.query(query[0], param);
  }).then(function(rows){
    if(rows.length > 0){
      for(let i = 0; i < rows.length; i++){
        info.msgs[i] = [rows[i].convo, rows[i].sender];
      }
      info.id = rows[0].id;
      info.protocol = protocolMask(rows[0].protocol);
      info.phone = rows[0].telefone;
      info.cpf = rows[0].cpf;
      info.email = rows[0].email;
      info.ibm = rows[0].ibm;
      info.status = rows[0].status;
      info.name = rows[0].name;
    }
    if(rows.length === 0){
      info.status = 0;
      info.name = "N/A";
    }
    return connection.query(query[1], param);
  }).then(function(rows){
    connection.end();
    info.time = rows[0].time || "N/A";
    info.date = rows[0].date || "N/A";
    if(info.id === 0){
      info.protocol = "N/A";
      info.msgs[0] = ["Nenhum atendimento encontrado", "Bot"];
    }
    res.writeHead(200, monika.config.api.CONTENT);
    res.end(JSON.stringify(info));
  });
}

function insertNew(req, res){
  //this user case doesnt cover the possibility
  //of the human agent later coming back
  let connection;
  let id;
  let protocol;
  let ibm = (req.body.ibm).replace("-", ".");
  let sqldate = monika.dates.rawStringToSqlDate(req.body.date);
  
  mysql.createConnection(monika.config.sql.settings).then(function(conn){
    connection = conn;
    return connection.query(monika.config.sql.select.convo, ibm);
  }).then(function(rows){
    let insert;
    if(rows.length === 0){
      let protocol = monika.logs.makeProtocol(req.body.id, sqldate, "2");
      let values = "(2, 2, 2, '" + protocol + "', '" + req.body.name + "', '" + ibm + "', '" + sqldate + "')";
      insert = connection.query(monika.config.sql.insert.convo + values);
    }
    insert = connection.query(monika.config.sql.select.convo, ibm);
    return insert;
  }).then(function(rows){
    monika.console.log.yellow(rows[0].protocol);
    protocol = rows[0].protocol;
    id = rows[0].id;
    return connection.query(monika.config.sql.insert.contact, [id, req.body.cpf, req.body.phone, req.body.email]);
  }).then(function(rows){
    let values = "(" + id + ", 2, 1, 1, '', '" + monika.dates.rawStringToSqlDate(req.body.date) + "')";
    return connection.query(monika.config.sql.insert.msg + values);
  }).then(function(last){
    connection.end();
    res.writeHead(200, monika.config.api.CONTENT);
    res.end(JSON.stringify({"msg": "all good!!", "id": id, "protocol": protocol}));
  });
}

function loadBody(req, res){
  let isDated = false;
  if(JSON.stringify(monika.http.getURL(req)).length > 2){
    isDated = true;
  }
  let connection;
  let dates = "";
  let info = {
    "id": [],
    "name": [],
    //"num_msgs": [],
    "date": [],
    "time": [],
    //"protocol": [],
    "status": []
  };
  
  if(isDated){
    dates = [req.query.start, req.query.end];
    let err = monika.validator.query({"start": dates[0], "end": dates[1]});
    if(err){
      return monika.api.error(res, err);
    }
    err = monika.validator.date(dates[0], "min");
    if(err){
      return monika.api.error(res, err);
    }
    err = monika.validator.date(dates[1], "min");
    if(err){
      return monika.api.error(res, err);
    }
  }
  
  let extra = isDated ? "AND dte_conversation >= ? AND DATE(dte_conversation) <= ?" : "";
  let temp_query = monika.config.sql.select.list.replace(monika.config.sql.PLACEHOLDER, extra);
  
  mysql.createConnection(monika.config.sql.settings).then(function(conn){
    connection = conn;
    return connection.query(temp_query, dates);
  }).then(function(rows){
    connection.end();
    for(let r = 0; r < rows.length; r++){
      info["id"][r] = rows[r].id;
      info["name"][r] = rows[r].user;
      info["date"][r] = rows[r].formated_date;
      info["time"][r] = rows[r].diff_time;
      info["status"][r] = rows[r].status;
    }
    info["length"] = rows.length;
    res.writeHead(200, monika.config.api.CONTENT);
    res.end(JSON.stringify(info));
  });
}

function loadHeader(req, res){
  let isDated = false;
  if(JSON.stringify(monika.http.getURL(req)).length > 2){
    isDated = true;
  }
  let connection;
  let info = {};
  let param = "";
  let temp_query = isDated ? monika.config.sql.select.dated_header : monika.config.sql.select.header;
  
  if(isDated){
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
  }
  
  mysql.createConnection(monika.config.sql.settings).then(function(conn){
    connection = conn;
    return connection.query(temp_query, param);
  }).then(function(rows){
    connection.end();
    info["convo"] = rows[0].convo;
    info["msgs"] = rows[0].msgs;
    info["average"] = rows[0].rounded;
    res.writeHead(200, monika.config.api.CONTENT);
    res.end(JSON.stringify(info));
  });
}

function loadGraph(req, res){
  if(JSON.stringify(monika.http.getURL(req)).length > 2){
    return datedGraph(req.query, res);
  }
  let connection;
  let graph = {
    month: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    hours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    days: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
           0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
           0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    week: [0, 0, 0, 0, 0, 0, 0]
  }
  
  mysql.createConnection(monika.config.sql.settings).then(function(conn){
    connection = conn;
    return connection.query(monika.config.sql.select.graph);
  }).then(function(rows){
    connection.end();
    for(let h = 0; h < rows.length; h++){
      graph.month[(parseInt(rows[h].month, 10) - 1)]++;
      graph.hours[parseInt(rows[h].hours, 10)]++;
      graph.days[(parseInt(rows[h].days, 10) - 1)]++;
      let dayindex = (parseInt(rows[h].week, 10) - 1) > 0 ? (parseInt(rows[h].week, 10) - 2) : 6;
      graph.week[dayindex]++;
    }
    res.writeHead(200, monika.config.api.CONTENT);
    res.end(JSON.stringify(graph));
  });
}

function protocolMask(p){
  return p.slice(0, 8) + "/" + p.slice(8, 12) + "." + p.slice(-1);
}

function updater(req, res){
  let sqldate = monika.dates.rawStringToSqlDate(req.body.log.date);
  let connection;
  let status_msg = ["", "", "Atendimento encaminhado para o Nível 3.", "Atendimento Finalizado com sucesso."]
  
  mysql.createConnection(monika.config.sql.settings).then(function(conn){
    connection = conn;
    return connection.query(monika.config.sql.update.status.replace(monika.config.sql.PLACEHOLDER, "idt_ibm_conversation = ?"), [req.body.update.status, req.body.update.ibm]);
  })
  
  .then(function(rows){
    return connection.query(monika.config.sql.update.status.replace(monika.config.sql.PLACEHOLDER, "idt_conversation = ?"), [req.body.update.status, req.body.update.id]);
  })
  
  .then(function(rows){
    let values = "(" + req.body.update.id + ", 2, 1, 1, '" + req.body.log.msg + "', '" + sqldate + "')";
    return connection.query(monika.config.sql.query.insert_msg + values);
  })
  
  .then(function(last){
    connection.end();
    res.writeHead(200, monika.config.api.CONTENT);
    res.end(JSON.stringify({"msg": status_msg[req.body.update.status]}));
  });
}

module.exports = {
  detailedInfo: detailedInfo,
  insertNew: insertNew,
  loadBody: loadBody,
  loadHeader: loadHeader,
  loadGraph: loadGraph,
  updater: updater
}
/*!
  Author: Yukashimi
  Date: 18/09/2018
  File: analytic.js
*/

let mysql = require("promise-mysql");
let monika = require("../monika").init(["validator", "api", "dates", "config", "console", "http"]);

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
    monika.console.log.magenta(dates);
    return connection.query(monika.config.sql.query.get_dated_graph, [dates.start, dates.end]);
  }).then(function(data){
    connection.end();
    for(let d = 0; d < data.length; d++){
      info[data[d].date_index] = data[d].amount;
    }
    monika.console.log.green("Data for the graph was parsed successfully.");
    res.writeHead(200, monika.config.api.CONTENT);
    res.end(JSON.stringify(info));
  });
}

function datedBody(dates, res){
  let err = monika.validator.query({"start": dates.start, "end": dates.end});
  let connection;
  let info = {
    "id": [],
    "name": [],
    //"num_msgs": [],
    "date": [],
    "time": [],
    //"protocol": [],
    "status": []
  };
  
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
  
  mysql.createConnection(monika.config.sql.settings).then(function(conn){
    connection = conn;
    return connection.query(monika.config.sql.query.get_convo_by_date, [dates.start, dates.end]);
  }).then(function(rows){
    connection.end();
    for(let r = 0; r < rows.length; r++){
      info["id"][r] = rows[r].id;
      info["name"][r] = rows[r].user;
      //info["num_msgs"][r] = rows[r].counter;
      info["date"][r] = rows[r].formated_date;
      info["time"][r] = rows[r].diff_time;
      //info["protocol"][r] = rows[r].idt_ibm_conversation;
      info["status"][r] = rows[r].status;
    }
    info["length"] = rows.length;
    monika.console.log.green("All the data for the analytic list was loaded.");
    res.writeHead(200, monika.config.api.CONTENT);
    res.end(JSON.stringify(info));
  });
}

function datedHeader(dates, res){
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

  mysql.createConnection(monika.config.sql.settings).then(function(conn){
    connection = conn;
    return connection.query(monika.config.sql.query.get_convo, [dates.start, dates.end]);
  }).then(function(rows){
    info["convo"] = rows[0].amount;
    return connection.query(monika.config.sql.query.get_msg, [dates.start, dates.end]);
  }).then(function(rows){
    info["msgs"] = rows[0].msgs;
    return connection.query(monika.config.sql.query.get_avg_time, [dates.start, dates.end]);
  }).then(function(rows){
    connection.end();
    info["average"] = rows[0].rounded;
    monika.console.log.green("Dated header loaded successfully.");
    res.writeHead(200, monika.config.api.CONTENT);
    res.end(JSON.stringify(info));
  });
}

function loadBody(req, res){
  if(JSON.stringify(monika.http.getURL(req)).length > 2){
    return datedBody(req.query, res);
  }
  let connection;
  let info = {
    "id": [],
    "name": [],
    //"num_msgs": [],
    "date": [],
    "time": [],
    //"protocol": [],
    "status": []
  };
  
  mysql.createConnection(monika.config.sql.settings).then(function(conn){
    connection = conn;
    return connection.query(monika.config.sql.query.get_body_info);
  }).then(function(rows){
    connection.end();
    for(let r = 0; r < rows.length; r++){
      info["id"][r] = rows[r].id;
      info["name"][r] = rows[r].user;
      //info["num_msgs"][r] = rows[r].counter;
      info["date"][r] = rows[r].formated_date;
      info["time"][r] = rows[r].diff_time;
      //info["protocol"][r] = rows[r].idt_ibm_conversation;
      info["status"][r] = rows[r].status;
    }
    info["length"] = rows.length;
    monika.console.log.green("All the data for the analytic list was loaded.");
    res.writeHead(200, monika.config.api.CONTENT);
    res.end(JSON.stringify(info));
  });
}

function loadHeader(req, res){
  if(JSON.stringify(monika.http.getURL(req)).length > 2){
    return datedHeader(req.query, res);
  }
  let connection;
  let info = {};
  
  mysql.createConnection(monika.config.sql.settings).then(function(conn){
    connection = conn;
    return connection.query(monika.config.sql.query.amount_convo);
  }).then(function(rows){
    info["convo"] = rows[0].amount;
    return connection.query(monika.config.sql.query.amount_msgs_total);
  }).then(function(rows){
    info["msgs"] = rows[0].amount;
    let ave = connection.query(monika.config.sql.query.average_time);
    connection.end();
    return ave;
  }).then(function(rows){
    info["average"] = rows[0].rounded;
    monika.console.log.green("Header loaded successfully.");
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
    return connection.query(monika.config.sql.query.get_graph_data);
  }).then(function(rows){
    connection.end();
    for(let h = 0; h < rows.length; h++){
      graph.month[(parseInt(rows[h].month, 10) - 1)]++;
      graph.hours[parseInt(rows[h].hours, 10)]++;
      graph.days[(parseInt(rows[h].days, 10) - 1)]++;
      graph.week[(parseInt(rows[h].week, 10) - 1)]++;
    }
    monika.console.log.green("Data for the graph was parsed successfully.");
    res.writeHead(200, monika.config.api.CONTENT);
    res.end(JSON.stringify(graph));
  });
}

module.exports = {
  loadBody: loadBody,
  loadHeader: loadHeader,
  loadGraph: loadGraph
}
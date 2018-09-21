/*!
  Author: Yukashimi
  Date: 18/09/2018
  File: analytic.js
*/

let mysql = require("promise-mysql");
let monika = require("../monika");

function loadBody(req, res){
  let connection;
  let info = {
    "id": [],
    "num_msgs": [],
    "date": [],
    "time": [],
    "protocol": [],
    "status": []
  };
  
  mysql.createConnection(monika.config.sql.settings).then(function(conn){
    connection = conn;
    return connection.query(monika.config.sql.query.get_body_info);
  }).then(function(rows){
    connection.end();
    for(let r = 0; r < rows.length; r++){
      info["id"][r] = rows[r].idt_conversation;
      info["num_msgs"][r] = rows[r].counter;
      info["date"][r] = rows[r].formated_date;// + " " + rows[r].time;
      info["time"][r] = rows[r].diff_time;
      info["protocol"][r] = rows[r].idt_ibm_conversation;
      info["status"][r] = rows[r].nme_status;
    }
    info["length"] = rows.length;
    monika.console.log.green("All the data for the analytic list was loaded.");
    res.writeHead(200, monika.config.api.CONTENT);
    res.end(JSON.stringify(info));
  });
}

function loadHeader(req, res){
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
  let connection;
  let graph = {
    hours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    days: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
           0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
           0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  }
  
  mysql.createConnection(monika.config.sql.settings).then(function(conn){
    connection = conn;
    return connection.query(monika.config.sql.query.get_graph_data);
  }).then(function(rows){
    connection.end();
    for(let h = 0; h < rows.length; h++){
      graph.hours[parseInt(rows[h].hours, 10)]++;
      graph.days[(parseInt(rows[h].days, 10) - 1)]++;
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
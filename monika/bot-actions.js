/*!
  Author: Yukashimi
  Date: 07/06/2018
  File: bot-actions.js
*/
module.exports = {
  check: check,
  ip: ip,
  sendSuggestion: sendSuggestion,
  setEndpoints: setEndpoints
}

let postgirl = require("./mailer.js");
let monika = require("../monika").init(["notes", "logs", "api", "analytic", "config", "console", "helper"]);;

function badFeedback(response, ip){
  var complement = response.context.lastMsg;
  let name = standardizeName(response.context.name);
  let user = {"name": name,
           "article": response.context.article};
  let mail = standardizeMail(response.context.email);
  monika.console.log.red("The bot recieved a negative feedback.");
  monika.console.log("Attempting to send an email for logging...");
  postgirl.mailer(user, mail, postgirl.getSubject(user, 2),
      postgirl.getBody(user, 2, complement), monika.logs.getFiles(user.name, ip));
}

function check(response, ip){
  if(response.output.action === 'error_mail'){
    sendEmail(response, ip);
  }
  if(response.output.action === 'end_conversation'){
    monika.logs.end(response.context.name, ip);
  }
  if(response.output.action === "bad_feedback"){
    badFeedback(response, ip);
  }
}

function ip(req){
  let div = "<div style='color: #660000'>"
  let ip = "O seu endereço de IP é " + req.ip + "<br>Estou sempre de olho em você.</div>";
  return div + ip;
}

function sendEmail(response, ip){
  var complement = response.context.lastMsg;
  let name = standardizeName(response.context.name);
  let user = {"name": name,
           "article": response.context.article.toLowerCase()};
  let mail = standardizeMail(response.context.email);
  monika.console.log.red("It seems there was a problem with the bot.");
  monika.console.log("Attempting to send an email with the info...");
  postgirl.mailer(user, mail, postgirl.getSubject(user, 0),
      postgirl.getBody(user, 0, complement), monika.logs.getFiles(user.name, ip));
}


function sendSuggestion(req){
  let user = req.body.user;
  monika.console.log.yellow("I have recieved a new suggestion!");
  monika.console.log("Attempting to send it...");
  postgirl.mailer(user, "chatbot@intech.com.br", postgirl.getSubject(user, 1),
      postgirl.getBody(user, 1, req.body.text), "");
}

function standardizeMail(mail){
  if(mail === "" || mail === null){
    return "not@found.com";
  }
  return mail;
}

function standardizeName(name){
  if(name === "Você" || name === "" || name === null || name === "Usuário"){
    return "Usuário não identificado";
  }
  return name;
}







function setEndpoints(app){
  // let host = monika.config.api.METRUS_TEST;

  //app.get("/db/logs/intents", (req, res) => monika.logs.updateIntents(req, res));

  app.get("/analytic/grapher", (req, res) => monika.analytic.graph(req, res));
  app.get("/analytic/list", (req, res) => monika.analytic.list(req, res));
  app.get("/analytic/detail", (req, res) => monika.analytic.detailedInfo(req, res));
  app.get("/analytic/header", (req, res) => monika.analytic.header(req, res));
  app.get("/analytic/graph", (req, res) => monika.analytic.loadGraph(req, res));
  app.get("/analytic/frame", (req, res) => monika.analytic.framer(req, res));
  app.get("/analytic/init", (req, res) => monika.analytic.init(req, res));
  
  app.put("/analytic/new", (req, res) => monika.analytic.insertNew(req, res));
  app.put("/analytic/proceed", (req, res) => monika.analytic.proceed(req, res));
  /* Merge? */
  
  app.post("/analytic/update", (req, res) => monika.analytic.updater(req, res));
  
  app.get("/api/", (req, res) => monika.helper.userDataApiInfo(req, res));
  app.post("/api/data/", (req, res) => monika.api.userData(req, res));
  app.put("/api/update/", (req, res) => monika.api.update(req, res));
  // app.get("/api/report/", (req, res) => monika.helper.metrusInfo(req, res, "report"));
  // app.get("/api/report/earning", (req, res) => monika.api.earningReport(req, res, host));
  // app.get("/api/report/loan/", (req, res) => monika.api.informativeLoanData(req, res, host));
  // app.get("/api/loan/", (req, res) => monika.api.loanData(req, res, host));
  // app.get("/api/payslip/", (req, res) => monika.api.payslip(req, res, host));
  // app.get("/api/test/", (req, res) => monika.api.testMonika(req, res));
  
  app.get("/monika/ip", (req, res) => res.send(ip(req)));
  // app.post("/monika/", (req, res) => res.send(sendSuggestion(req)));
  
  app.delete("/notepad/delete/", (req, res) => res.send(monika.notes.delet(req)));
  app.get("/notepad/load/", (req, res) => res.send(monika.notes.load()));
  app.put("/notepad/update/", (req, res) => res.send(monika.notes.update(req)));
  app.put("/notepad/write/", (req, res) => res.send(monika.notes.write(req)));
  app.post("/notepad/auth/", (req, res) => res.send(monika.notes.auth(req)));
  app.post("/csv/", (req, res) => res.send(monika.logs.createCSV(req)));

  app.post("/login/", (req, res) => monika.logs.login(req, res));
  
  app.get("/log/list/", (req, res) => monika.logs.logList(req, res));
  app.get("/log/load/", (req, res) => res.send(monika.logs.load(req)));
  
  app.get("/notepad/", (req, res) => monika.helper.redirects.notepad(req, res));
  
  app.get("/faceb/", (req, res) => monika.helper.redirects.login(req, res));
  app.get("/faceb/bot", (req, res) => monika.helper.redirects.bot(req, res));
  app.get("/faceb/analytic/", (req, res) => monika.helper.redirects.analytic(req, res));
  app.get("/faceb/pending/", (req, res) => monika.helper.redirects.pending(req, res));
  app.get("/faceb/login/", (req, res) => monika.helper.redirects.login(req, res));
  
  app.get("/regius/", (req, res) => monika.helper.redirects.login(req, res));
  app.get("/regius/bot", (req, res) => monika.helper.redirects.bot(req, res));
  app.get("/regius/analytic/", (req, res) => monika.helper.redirects.analytic(req, res));
  app.get("/regius/pending/", (req, res) => monika.helper.redirects.pending(req, res));
  app.get("/regius/login/", (req, res) => monika.helper.redirects.login(req, res));
  
  app.get("/eqtprev/", (req, res) => monika.helper.redirects.login(req, res));
  app.get("/eqtprev/bot", (req, res) => monika.helper.redirects.bot(req, res));
  app.get("/eqtprev/analytic/", (req, res) => monika.helper.redirects.analytic(req, res));
  app.get("/eqtprev/pending/", (req, res) => monika.helper.redirects.pending(req, res));
  app.get("/eqtprev/login/", (req, res) => monika.helper.redirects.login(req, res));
  app.get("/eqtprev/advanced/", (req, res) => monika.helper.redirects.advanced(req, res));
  
  
  app.get("/intech/", (req, res) => monika.helper.redirects.login(req, res));
  app.get("/intech/bot", (req, res) => monika.helper.redirects.bot(req, res));
  app.get("/intech/analytic/", (req, res) => monika.helper.redirects.analytic(req, res));
  app.get("/intech/pending/", (req, res) => monika.helper.redirects.pending(req, res));
  app.get("/intech/login/", (req, res) => monika.helper.redirects.login(req, res));
  
  
  app.get("/", (req, res) => monika.helper.redirects.root(req, res));
}

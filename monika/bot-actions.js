/*!
  Author: Yukashimi
  Date: 07/06/2018
  File: bot-actions.js
*/
let postgirl = require("./mailer.js");
let monika = require("../monika");

function badFeedback(response, ip){
  var complement = response.context.lastMsg;
  let name = standardizeName(response.context.name);
  let user = {"name": name,
           "article": response.context.article};
  let mail = standardizeMail(response.context.email);
  console.log("The bot recieved a negative feedback.");
  console.log("Attempting to send an email for logging...");
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

function compound(response){
  if(response.intents && response.intents[1]){
    if(response.intents[1].confidence > 0.7){
      console.log(response);
    }
  }
}

/*async function initContext(response){
  let cpf = response.context.cpf;
  let user_data = await monika.api.init(cpf, monika.config.api.metrusHostTests);
    response.context.name = user_data.NOME; 
    return user_data;
    //response.context.name = "Yuka";
  //console.log(response.context.name);
  //  response.context.article = "A";
  //  response.context.title = "Sra.";
  //  console.log("initted!");
    //return response;
    //console.log("inside init context");
    //console.log(response);
}*/

function ip(req){
  let div = "<div style='color: #660000'>"
  let ip = "O seu endereço de IP é " + req.ip + "<br>Estou sempre de olho em você.</div>";
  return div + ip;
}

function lowConfidence(response){
  if(response.intents && response.intents[0]){
    if(response.intents[0].confidence < 0.5 &&
        response.output.nodes_visited[0] !== 'Em outros casos' &&
        response.output.nodes_visited[0] !== 'node_1_1528725595789'){
      response.output.text[0] = ("Eu não entendi bem, mas eu acho que essa é a resposta: " +
          response.output.text[0]);
    }
  }
}

function sendEmail(response, ip){
  var complement = response.context.lastMsg;
  let name = standardizeName(response.context.name);
  let user = {"name": name,
           "article": response.context.article.toLowerCase()};
  let mail = standardizeMail(response.context.email);
  console.log("It seems there was a problem with the bot.");
  console.log("Attempting to send an email with the info...");
  postgirl.mailer(user, mail, postgirl.getSubject(user, 0),
      postgirl.getBody(user, 0, complement), monika.logs.getFiles(user.name, ip));
}


function sendSuggestion(req){
  let user = req.body.user;
  console.log("I have recieved a new suggestion!");
  console.log("Attempting to send it...");
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
  let host = monika.config.api.METRUS_TEST;

  app.get("/api/", (req, res) => monika.helper.metrusInfo(req, res));
  app.get("/api/data/", (req, res) => monika.api.userData(req, res, host));
  app.get("/api/report/", (req, res) => monika.helper.metrusInfo(req, res, "report"));
  app.get("/api/report/earning", (req, res) => monika.api.earningReport(req, res, host));
  app.get("/api/report/loan/", (req, res) => monika.api.informativeLoanData(req, res, host));
  app.get("/api/loan/", (req, res) => monika.api.loanData(req, res, host));
  app.get("/api/payslip/", (req, res) => monika.api.payslip(req, res, host));
  app.get("/api/test/", (req, res) => monika.api.testMonika(req, res));
  
  app.get("/monika/ip", (req, res) => res.send(monika.actions.ip(req)));
  app.post("/monika/", (req, res) => res.send(monika.actions.sendSuggestion(req)));
  app.delete("/notepad/delete/", (req, res) => res.send(monika.notes.delet(req)));
  app.get("/notepad/load/", (req, res) => res.send(monika.notes.load()));
  app.put("/notepad/update/", (req, res) => res.send(monika.notes.update(req)));
  app.put("/notepad/write/", (req, res) => res.send(monika.notes.write(req)));
  app.post("/notepad/auth/", (req, res) => res.send(monika.notes.auth(req)));
  app.post("/csv/", (req, res) => res.send(monika.logs.createCSV(req)));

  app.get("/notepad/", (req, res) => monika.helper.notepad(req, res));
}

module.exports = {
  check: check,
  compound: compound,
  ip: ip,
  lowConfidence: lowConfidence,
  sendSuggestion: sendSuggestion,
  setEndpoints: setEndpoints
}
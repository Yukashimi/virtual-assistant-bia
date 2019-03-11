/*!
  Author: Yukashimi
  Date: 28/08/2018
  File: helper.js
*/

let monika = require("../monika").init(["config", "console"]);

function userDataApiInfo(req, res, param){
  let route = param || req.query.route;
  let data = {
    "use": "Retrieve the participant's data, requires authetication via username and password as well as the foundation version ",
    "method": "POST",
    "POST data": {
      "user": "the username for authetication, this is also the username to get the info about",
      "password": "the user's password, please request the user input properly",
      "version" : "the version to use, such as eqtprev, faceb and others"
    },
    "examples": {
      "valid": "/data/",
      "invalid": "/data/02350729826"
    }
  };
  let update = {
    "use": "Update the user info as requested, such as their e-mail address",
    "method": "PUT",
    "PUT data": {
      "user": "the username for authetication, this is also the username to update the info about",
      "update": "the information that should be updated",
      "value": "the the value of the information to update",
      "version" : "the version to use, such as eqtprev, faceb and others"
    },
    "examples": {
      "valid": "/update/",
      "invalid": "/update/02350729826/email/some@mail.com"
    }
  };
  // let report_earning = {
    // "use": "Returns the participant's earning report information, requires the entid entid, using the optional 4 digit year retrieves more specific information of the given year",
    // "method": "GET",
    // "query string": {
      // "entid": "the same 4 digits string as 'entid' from /data/",
      // "year": "4 digits year, optinal"
    // },
    // "examples": {
      // "valid": "/report/earning?entid=1234",
      // "valid": "/report/earning?entid=1234&year=2015",
      // "invalid": "/report/earning?year=2018"
    // }
  // };
  // let report_loan = {
    // "use": "not implemented yet",
    // "method": "GET",
    // "query string": {
      
    // },
    // "examples": {
      // "valid": "",
      // "invalid": ""
    // }
  // };
  // let loan = {
    // "use": "not implemented yet",
    // "method": "GET",
    // "query string": {
      
    // },
    // "examples": {
      // "valid": "",
      // "invalid": ""
    // }
  // };
  // let payslip = {
    // "use": "Retrive the general info about payments done by the participants, or a more detailed info block of one specific payment done, requires the entidity code param as well as the plan code (entid, plano) while data is optional",
    // "method": "GET",
    // "query string": {
      // "entid": "the same 4 digits string as 'entid' from /data/",
      // "plano": "4 digits string, it identifies which retirement plan you want to know about",
      // "data": "the specific data in the dd.mm.yyyy format, it can utilize - and / as delimiters as well, such as 01.05.2018 or 04-12-2015 or 25/07/1999"
    // },
    // "examples": {
      // "valid": "/payslip?plano=0001&entid=667&data=01-01-2017",
      // "valid": "/payslip?plano=0001&entid=667",
      // "invalid": "/payslip?plano=000112&entid=667&data=01012017"
    // }
  // };
  
  let paths = {
    "/data/" : data,
    "/update/": update
  };
  res.writeHead(200, monika.config.api.CONTENT);
  let p = paths[route] || paths["/" + route + "/"] || paths;
  res.end(JSON.stringify(p));
  paths = null;
  monika.console.log.yellow("HELP! Do you need somebody's help?");
  monika.console.log.yellow(p);
  return p;
}

const redirects = {
  advanced: (req, res) => {
    res.sendFile("./template/advanced.html", {root: monika.config.server.root});
  },
  analytic: (req, res) => {
    res.sendFile("./template/analytic.html", {root: monika.config.server.root});
  },
  bot: (req, res) => {
    res.sendFile("./template/bot.html", {root: monika.config.server.root});
  },
  login: (req, res) => {
    res.sendFile("./template/login.html", {root: monika.config.server.root});
  },
  notepad: (req, res) => {
    res.sendFile("./notepad.html", {root: monika.config.server.root});
  },
  pending: (req, res) => {
    res.sendFile("./template/pending.html", {root: monika.config.server.root});
  }
}

module.exports = {
  userDataApiInfo: userDataApiInfo,
  redirects: redirects
}
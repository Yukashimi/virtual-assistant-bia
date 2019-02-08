/*!
  Author: Yukashimi
  Date: 28/08/2018
  File: helper.js
*/

let monika = require("../monika").init(["config", "console"]);

function metrusInfo(req, res, param){
  let route = param || req.query.route;
  let data = {
    "use": "Retrieve the participant's data, requires 1 of the 2 valid params",
    "method": "GET",
    "query string": {
      "cpf": "11 digits string, may be delimitered in blocks of 3 such as 12345678901 or 123.456.789-01",
      "entid": "4 digits string, calling this methods using cpf retrieves the entid, it's the base param for all the other paths"
    },
    "examples": {
      "valid": "/data?cpf=02350729826",
      "invalid": "/data?entid=74921"
    }
  };
  let report_earning = {
    "use": "Returns the participant's earning report information, requires the entid entid, using the optional 4 digit year retrieves more specific information of the given year",
    "method": "GET",
    "query string": {
      "entid": "the same 4 digits string as 'entid' from /data/",
      "year": "4 digits year, optinal"
    },
    "examples": {
      "valid": "/report/earning?entid=1234",
      "valid": "/report/earning?entid=1234&year=2015",
      "invalid": "/report/earning?year=2018"
    }
  };
  let report_loan = {
    "use": "not implemented yet",
    "method": "GET",
    "query string": {
      
    },
    "examples": {
      "valid": "",
      "invalid": ""
    }
  };
  let loan = {
    "use": "not implemented yet",
    "method": "GET",
    "query string": {
      
    },
    "examples": {
      "valid": "",
      "invalid": ""
    }
  };
  let payslip = {
    "use": "Retrive the general info about payments done by the participants, or a more detailed info block of one specific payment done, requires the entidity code param as well as the plan code (entid, plano) while data is optional",
    "method": "GET",
    "query string": {
      "entid": "the same 4 digits string as 'entid' from /data/",
      "plano": "4 digits string, it identifies which retirement plan you want to know about",
      "data": "the specific data in the dd.mm.yyyy format, it can utilize - and / as delimiters as well, such as 01.05.2018 or 04-12-2015 or 25/07/1999"
    },
    "examples": {
      "valid": "/payslip?plano=0001&entid=667&data=01-01-2017",
      "valid": "/payslip?plano=0001&entid=667",
      "invalid": "/payslip?plano=000112&entid=667&data=01012017"
    }
  };
  
  let paths = {
    "/data/" : data,
    "/report/": {
      "/earnings/": report_earning,
      "/loan/": report_loan
    },
    "/loan/": loan,
    "/payslip/": payslip
  };
  res.writeHead(200, monika.config.api.CONTENT);
  let p = paths[route] || paths["/" + route + "/"] || paths;
  res.end(JSON.stringify(p));
  paths = null;
  monika.console.log.yellow("HELP! Do you need somebody's help?", p);
  return p;
}

const redirects = {
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
  metrusInfo: metrusInfo,
  redirects: redirects
}
/*!
  Author: Yukashimi
  Date: 23/07/2018
  File: api-handler.js
*/

let monika = require("../monika").init(["validator", "config", "console", "http"]);;

function earningReport(req, res, host){
  let data = "";
  let isValidData = false;
  let path = monika.config.api.METRUS_BASE_PATH + "infoRend/";
  let err = monika.validator.query({"entid": req.query.entid});
  if(err){
    return error(res, err);
  }
  if(req.query.year !== undefined){
    [isValidData, data, err] = monika.validator.year(req.query.year);
  }
  if(err){
    return error(res, err);
  }
  
  monika.console.log.magenta("I recieved an attempt to connect to Metrus' API.");
  
  if(isValidData){
    return earningReportYear(req.query.entid, data, res, host);
  }
  return earningReportData(req.query.entid, res, host);
}

async function earningReportData(entid, res, host){
  let path = monika.config.api.METRUS_BASE_PATH + "infoRend/datasPorCodEntid/" + entid;
  monika.console.log.magenta("Accessing path: " + path);
  var options = monika.http.setOptions("GET", host, path);
  let report_data = await monika.http.requests[options.method](options, false);
  if(monika.http.StatusOK(report_data, res)){
    let final_data = JSON.stringify(report_data.data);
    res.writeHead(report_data.header.code, monika.config.api.CONTENT);
    res.end(final_data);
    return final_data;
  }
}

async function earningReportYear(entid, year, res, host){
  let path = monika.config.api.METRUS_BASE_PATH + "infoRend/porCodEntidAnoReferencia/" + entid + "/" + year;
  monika.console.log.magenta("Accessing path: " + path);
  var options = monika.http.setOptions("GET", host, path);
  let report_data = await monika.http.requests[options.method](options, false);
  if(monika.http.StatusOK(report_data, res)){
    let final_data = JSON.stringify(report_data.data);
    res.writeHead(report_data.header.code, monika.config.api.CONTENT);
    res.end(final_data);
    return final_data;
  }
}

function error(res, err){
  monika.console.log.red("Error! Here is the data:", err);
  res.writeHead(err.code, monika.config.api.CONTENT);
  res.end(JSON.stringify(err));
  return err;
}

function informativeLoanData(req, res, host){
  monika.http.notImplementedYet(res, req.path);
}

async function loanData(req, res, host){
  let path = monika.config.api.METRUS_BASE_PATH + "emprestimo/";
  let err = monika.validator.query({"entid": req.query.entid});
  if(err){
    return error(res, err);
  }
  monika.console.log.magenta("I recieved an attempt to connect to Metrus' API.");
  
  if(req.query.stat !== undefined){
    return loanDataStatus(req.query.entid, req.query.stat, res, host, path);
  }
  if(req.query.cont !== undefined && req.query.year !== undefined){
    return loanDataYear(req.query.entid, req.query.cont, req.query.year, res, host, path);
  }
  return loanDataAll(req.query.entid, res, host, path);
}

async function loanDataAll(entid, res, host, path){
  path = path + "porCodEntid/" + entid;
  monika.console.log.magenta("Accessing path: " + path);
  var options = monika.http.setOptions("GET", host, path);
  let loans = await monika.http.requests[options.method](options, false);
  if(monika.http.StatusOK(loans, res)){
    let final_data = JSON.stringify(loans.data);
    res.writeHead(loans.header.code, monika.config.api.CONTENT);
    res.end(final_data);
    return final_data;
  }
}

async function loanDataStatus(entid, stat, res, host, path){
  const STAT_RANGE = /\b[0-6]\b/;
  if(!STAT_RANGE.test(stat)){
    let err = {"type": "Bad Request", "msg": "Invalid stat code. The valid range is [0-6]",
        "code": 400}
    return error(res, err);
  }
  path = path + "porCodEntidSituacao/" + entid + "/" + stat;
  monika.console.log.magenta("Accessing path: " + path);
  var options = monika.http.setOptions("GET", host, path);
  let loans = await monika.http.requests[options.method](options, false);
  if(monika.http.StatusOK(loans, res)){
    let final_data = JSON.stringify(loans.data);
    //[0].SaldoDevedor.ValorPrincQuitacao);
    res.writeHead(loans.header.code, monika.config.api.CONTENT);
    res.end(final_data);
    return final_data;
  }
}

async function loanDataYear(entid, cont, year, res, host, path){
  //validate stuff maybe?
  path = path + "prestacoesPorCodEntidNumContratoAnoContrato/" + entid + "/" + cont + "/" + year;
  monika.console.log.magenta("Accessing path: " + path);
  var options = monika.http.setOptions("GET", host, path);
  let loans = await monika.http.requests[options.method](options, false);
  if(monika.http.StatusOK(loans, res)){
    let amount = 0;
    for(let a = 0; a < loans.data.length; a++){
      amount = amount + loans.data[a].VL_PRINCIPAL;
    }
    let final_data = JSON.stringify({"value": amount});//[0].SaldoDevedor.ValorPrincQuitacao);
    res.writeHead(loans.header.code, monika.config.api.CONTENT);
    res.end(final_data);
    return final_data;
  }
}

async function payslip(req, res, host){
  let data = "";
  let isValidData = false;
  let path = monika.config.api.METRUS_BASE_PATH + "contracheque/";
  
  let err = monika.validator.query({"entid": req.query.entid, "plano": req.query.plano});
  if(err){
    return error(res, err);
  }
  
  if(req.query.data !== undefined){
    [isValidData, data, err] = monika.validator.date(req.query.data, "metrus");
  }
  if(err){
    return error(res, err);
  }
  
  monika.console.log.magenta("I recieved an attempt to connect to Metrus' API.");
  
  if(isValidData){
    return payslipYear([req.query.entid, req.query.plano, data], res, host);
  }
  return payslipData([req.query.entid, req.query.plano], res, host);
  //monika.http.notImplementedYet(res, req.path);
}

async function payslipData(args, res, host){
  let path = monika.config.api.METRUS_BASE_PATH + "contracheque/datasPorCodEntidPlano/" + args[0] + "/" + args[1];
  monika.console.log.magenta("Accessing path: " + path);
  var options = monika.http.setOptions("GET", host, path);
  let slip_data = await monika.http.requests[options.method](options, false);
  if(monika.http.StatusOK(slip_data, res)){
    let final_data = JSON.stringify(slip_data.data);
    res.writeHead(slip_data.header.code, monika.config.api.CONTENT);
    res.end(final_data);
    return final_data;
  }
}

async function payslipYear(args, res, host){
  let path = monika.config.api.METRUS_BASE_PATH + "contracheque/porCodEntidPlanoReferencia/" + args[0] + "/" + args[1] + "/" + args[2]
  monika.console.log.magenta("Accessing path: " + path);
  var options = monika.http.setOptions("GET", host, path);
  let slip_data = await monika.http.requests[options.method](options, false);
  if(monika.http.StatusOK(slip_data, res)){
    let final_data = JSON.stringify(slip_data.data);
    res.writeHead(slip_data.header.code, monika.config.api.CONTENT);
    res.end(final_data);
    return final_data;
  }
}

async function testMonika(req, res){
  monika.console.log.magenta("Let's see if I'm still working.");
  var options = monika.http.setOptions("GET", "http://10.10.170.105", "/monika/ip", monika.http.setPort(req));
  let monika_info = await monika.http.requests[options.method](options, true);
  res.writeHead(monika_info.header.code, monika.config.api.CONTENT);
  res.end(JSON.stringify(monika_info));
}

function userData(req, res, host){
  monika.console.log.magenta("I recieved an attempt to connect to Metrus' API.");
  let err = monika.validator.query({"cpf": req.query.cpf});
  if(err){
    err = monika.validator.query({"entid": req.query.entid});
    if(err){
      return error(res, err);
    }
    return userDataEntid(req.query.entid, res, host);
  }
  return userDataCPF(req.query.cpf, res, host);
}

async function userDataCPF(cpf, res, host){
  cpf = cpf.replace(/\.|\-/g, "");
  let path = monika.config.api.METRUS_BASE_PATH + "dados/porCpf/" + cpf;
  
  monika.console.log.magenta("Accessing path: " + path);
  var options = monika.http.setOptions("GET", host, path);
  let api_data = await monika.http.requests[options.method](options, false);
  if(monika.http.StatusOK(api_data, res)){
    let final_data = JSON.stringify(api_data.data);
    //{"name": api_data.data.NOME}
    res.writeHead(api_data.header.code, monika.config.api.CONTENT);
    res.end(final_data);
    return final_data;
  }
  //monika.http.notImplementedYet(res, req.path);
}

async function userDataEntid(entid, res, host){
  let path = monika.config.api.METRUS_BASE_PATH + "dados/porCodEntid/" + entid;
  
  monika.console.log.magenta("Accessing path: " + path);
  var options = monika.http.setOptions("GET", host, path);
  let api_data = await monika.http.requests[options.method](options, false);
  if(monika.http.StatusOK(api_data, res)){
    let final_data = JSON.stringify(api_data.data);
    //{"name": api_data.data.NOME}
    res.writeHead(api_data.header.code, monika.config.api.CONTENT);
    res.end(final_data);
    return final_data;
  }
  //monika.http.notImplementedYet(res, req.path);
}

module.exports = {
  earningReport: earningReport,
  error: error,
  informativeLoanData: informativeLoanData,
  loanData: loanData,
  payslip: payslip,
  testMonika: testMonika,
  userData: userData
};

/* alternative approach to userData:
async function userData(req, res, host){
  let codigo = null;
  let path = monika.config.api.METRUS_BASE_PATH + "dados/";
  
  let err = monika.validator.query({"cpf": req.query.cpf});
  if(err){
    if(monika.validator.query({"cod": req.query.cod})){
      return error(res, err);
    }
  }
  codigo = err ? ("porCodEntid/" + req.query.cod) : ("porCpf/" + req.query.cpf);
  codigo = codigo.replace(/\.|\-/g, "");
  path = path + codigo;
  console.log("I recieved an attempt to connect to Metrus' API.");
  console.log("Accessing path: " + path);
  var options = monika.http.setOptions("GET", host, path);
  let api_data = await monika.http.requests[options.method](options, false);
  let final_data = "";
  if(399 < api_data.header.code && api_data.header.code < 500){
    final_data = JSON.stringify(api_data.header);
  }
  if(199 < api_data.header.code && api_data.header.code < 300){
    final_data = JSON.stringify(api_data.data);
    //{"name": api_data.data.NOME}
  }
  res.writeHead(api_data.header.code, monika.config.api.CONTENT);
  res.end(final_data);
  return final_data;
  //monika.http.notImplementedYet(res, req.path);
}
*/

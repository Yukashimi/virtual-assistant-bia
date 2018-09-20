/*!
  Author: Yukashimi
  Date: 07/07/2018
  File: dates.js
*/
var dates = {};

function stringlify(notstring){
  return (notstring + "");
}

function setDate(nameIdentifier){
  dates[stringlify(nameIdentifier)] = sysDate();
}

function getDate(nameIdentifier){
  return dates[stringlify(nameIdentifier)];
}

function moveDate(newIdentifier, oldIdentifier){
  if(dates[stringlify(oldIdentifier)]){
    dates[stringlify(newIdentifier)] = getDate(stringlify(oldIdentifier));
    removeDate(oldIdentifier);
  }
}

function removeDate(nameIdentifier){
  if(dates[stringlify(nameIdentifier)]){
    delete dates[stringlify(nameIdentifier)];
  }
}

function sysToSqlDate(sqldate){
  var tempDate = sqldate.split("-");
  //2018-09-18 09-48-33-
  return (tempDate[0] + "-" + tempDate[1] + "-" + tempDate[2] + " " + tempDate[3] + ":" + tempDate[4] + ":" + tempDate[5]);
}

function emailDate(){
  const DATE = new Date();
  let day = DATE.getDate();
  day = (day < 10 ? "0" : "") + day;
  let month = DATE.getMonth();
  month = month + 1;
  month = (month < 10 ? "0" : "") + month;
  let hour = DATE.getHours();
  hour = (hour < 10 ? "0" : "") + hour;
  let minute = DATE.getMinutes();
  minute = (minute < 10 ? "0" : "") + minute;
  return (day + "/" + month + " " + hour + ":" + minute);
}

function logDate(){
  const DATE = new Date();
  let day = DATE.getDate();
  day = (day < 10 ? "0" : "") + day;
  let month = DATE.getMonth();
  month = month + 1;
  month = (month < 10 ? "0" : "") + month;
  let year = DATE.getFullYear();
  let hour = DATE.getHours();
  hour = (hour < 10 ? "0" : "") + hour;
  let minute = DATE.getMinutes();
  minute = (minute < 10 ? "0" : "") + minute;
  let seconds = DATE.getSeconds();
  seconds = (seconds < 10 ? "0" : "") + seconds;
  return (day + "/" + month + "/" + year + " " + hour + ":" + minute + ":" + seconds);
}

function sysDate(){
  const DATE = new Date();
  let day = DATE.getDate();
  day = (day < 10 ? "0" : "") + day;
  let month = DATE.getMonth();
  month = month + 1;
  month = (month < 10 ? "0" : "") + month;
  let year = DATE.getFullYear();
  let hour = DATE.getHours();
  hour = (hour < 10 ? "0" : "") + hour;
  let minute = DATE.getMinutes();
  minute = (minute < 10 ? "0" : "") + minute;
  let seconds = DATE.getSeconds();
  seconds = (seconds < 10 ? "0" : "") + seconds;
  return (year + "-" + month + "-" + day + "-" + hour + "-" + minute + "-" + seconds + "-");
}

module.exports = {
  setDate: setDate,
  getDate: getDate,
  moveDate: moveDate,
  removeDate: removeDate,
  emailDate: emailDate,
  logDate: logDate,
  sysDate: sysDate,
  sysToSqlDate: sysToSqlDate
}

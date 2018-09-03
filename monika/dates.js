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
  sysDate: sysDate
}

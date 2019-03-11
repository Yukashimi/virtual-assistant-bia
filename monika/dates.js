/*!
  Author: Yukashimi
  Date: 07/07/2018
  File: dates.js
*/
var dates = {};

function date(){
  const DATE = new Date();
  return (`${DATE.getFullYear()}-${fixDisplay(DATE.getMonth() + 1)}-${fixDisplay(DATE.getDate())}`)
}

function emailDate(){
  const DATE = new Date();
  let day = DATE.getDate();
  day = fixDisplay(day);
  let month = DATE.getMonth();
  month = month + 1;
  month = fixDisplay(month);
  let hour = DATE.getHours();
  hour = fixDisplay(hour);
  let minute = DATE.getMinutes();
  minute = fixDisplay(minute);
  return (`${day}/${month} ${hour}:${minute}`);
}

function getDate(nameIdentifier){
  return dates[stringlify(nameIdentifier)];
}

function fixDisplay(date){
  date = parseInt(date, 10);
  return ((date < 10 ? "0" : "") + date);
}

function logDate(){
  const DATE = new Date();
  let day = DATE.getDate();
  day = fixDisplay(day);
  let month = DATE.getMonth();
  month = month + 1;
  month = fixDisplay(month);
  let year = DATE.getFullYear();
  let hour = DATE.getHours();
  hour = fixDisplay(hour);
  let minute = DATE.getMinutes();
  minute = fixDisplay(minute);
  let seconds = DATE.getSeconds();
  seconds = fixDisplay(seconds);
  return (`${day}/${month}/${year} ${hour}:${minute}:${seconds}`);
}

function moveDate(newIdentifier, oldIdentifier){
  if(dates[stringlify(oldIdentifier)]){
    dates[stringlify(newIdentifier)] = getDate(stringlify(oldIdentifier));
    removeDate(oldIdentifier);
  }
}

function range(startDate, stopDate){
  let dateArray = new Array();
  let currentDate = (new Date(startDate)).addDays(1);
  stopDate = (new Date(stopDate)).addDays(1);
  while(currentDate <= stopDate){
    let tempDate = currentDate;
    dateArray.push(tempDate.getFullYear() + "-" +
        fixDisplay((tempDate.getMonth() + 1)) + "-" +
        fixDisplay((tempDate.getDate() )));
    currentDate = currentDate.addDays(1);
    tempDate = null;
  }
  return dateArray;
}

function rawStringToSqlDate(rawobj){
  let aux = rawobj.split(".");
  aux = aux[0].replace("T", " ");
  return aux;
}

function removeDate(nameIdentifier){
  if(dates[stringlify(nameIdentifier)]){
    delete dates[stringlify(nameIdentifier)];
  }
}

function setDate(nameIdentifier){
  dates[stringlify(nameIdentifier)] = sysDate();
}

function stringlify(notstring){
  return (notstring + "");
}

function sqlToDisplay(sqldate){
  let tempDate = sqldate.split("-");
  return (`${tempDate[2]}/${tempDate[1]}/${tempDate[0]}`);
}

function sysDate(){
  const DATE = new Date();
  let day = DATE.getDate();
  day = fixDisplay(day);
  let month = DATE.getMonth();
  month = month + 1;
  month = fixDisplay(month);
  let year = DATE.getFullYear();
  let hour = DATE.getHours();
  hour = fixDisplay(hour);
  let minute = DATE.getMinutes();
  minute = fixDisplay(minute);
  let seconds = DATE.getSeconds();
  seconds = fixDisplay(seconds);
  return (`${year}-${month}-${day}-${hour}-${minute}-${seconds}-`);
}

function sysToSqlDate(sqldate){
  let tempDate = sqldate.split("-");
  return (`${tempDate[0]}-${tempDate[1]}-${tempDate[2]} ${tempDate[3]}:${tempDate[4]}:${tempDate[5]}`);
}

function time(){
  const DATE = new Date();
  return (`${fixDisplay(DATE.getHours())}:${fixDisplay(DATE.getMinutes())}:${fixDisplay(DATE.getSeconds())}`);
}

Date.prototype.addDays = function(days) {
  let date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}

module.exports = {
  date: date,
  emailDate: emailDate,
  getDate: getDate,
  fixDisplay: fixDisplay,
  logDate: logDate,
  moveDate: moveDate,
  range: range,
  rawStringToSqlDate: rawStringToSqlDate,
  removeDate: removeDate,
  setDate: setDate,
  sqlToDisplay: sqlToDisplay,
  sysDate: sysDate,
  sysToSqlDate: sysToSqlDate,
  time: time
}

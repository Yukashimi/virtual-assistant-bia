/*!
  Author: Yukashimi
  Date: 27/08/2018
  File: validator.js
*/

function date(unvalidatedDate, formatString){
  /* VALID_DD_MM_YYYY: validates day[01-31], month[01-12], year[1900-xxxx]*/
  const VALID_DD_MM_YYYY = /(0[1-9]|1[0-9]|2[0-9]|3[0-1])(-|\.|\/)(0[1-9]|1[1-2])(-|\.|\/)(19[0-9]{2}|[0-9]{4})/gm;
  const formats = {
    "metrus": {
      "regex": /(0[1-9]|1[0-9]|2[0-9]|3[0-1])(-|\.|\/)(0[1-9]|1[1-2])(-|\.|\/)(19[0-9]{2}|[0-9]{4})/gm,
      "example": "DD-MM-YYYY"
    },
    "YYYY-MM-DD": {
      "regex": /([0-9]{4})-(0[1-9]|1[1-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])/gm,
      "example": "YYYY-MM-DD"
    },
    "min": {
      "regex": /(198[8-9]|199[0-9]|[2-9][0-9]{3})-(0[1-9]|1[1-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])/gm,
      "example": "YYYY-MM-DD min:1988-01-01"
    }
  }
  let isValid = formats[formatString].regex.test(unvalidatedDate);
  if(formatString === "metrus"){
  let error = isValid ? [("/" + unvalidatedDate.replace(/(-|\.|\/)/gm, ".")), null]
      : ["", {"code": 400, "msg": "Invalid date. The expected input was " + formats[formatString].example + " but your input was "
      + unvalidatedDate, "status": "Bad Request"}];
  //let result = isValid ? "/" + unvalidatedDate.replace(/(-|\.|\/)/gm, ".") : "";
  return [isValid, error[0], error[1]];
  }
  let error = isValid ? null
      : {"code": 400, "msg": "Invalid date. The expected input was " + formats[formatString].example + " but your input was "
          + unvalidatedDate, "status": "Bad Request"};
  return error;
}

function query(items, data){
  let err = null;
  let e = 0;
  let names = Object.keys(items);
  let values = Object.values(items);
  while(err === null && e < values.length){
    if(values[e] === undefined){
      err = {"code": 400, "msg": ("The param named '" + names[e]
          + "' is required and was not supplied."), "status": "Bad Request"};
    }
    e++;
  }
  return err;
}

function year(year){
  const VALID_YYYY = /(?!0000)^\d{4}/;
  let is_yyyy = VALID_YYYY.test(year);
  if(is_yyyy){
    return [true, year, null];
  }
  return [false, "", {"code": 400,
        "msg": "Invalid year, please input a 4 digit year such as 2018.",
        "status": "Bad Request"}];
}

module.exports = {
  date: date,
  query: query,
  year: year
}

/*!
  Author: Yukashimi
  Date: 26/06/2018
  File: notes.js
*/
let fs = require("fs");
let os = require("os");
let monika = require("../monika");

const BASE_PATH = "monika/";
const DELE = "delet.txt";
const FILE = "notes.txt";
const PATH = BASE_PATH + FILE;
const PATH_DELE = BASE_PATH + DELE;

function auth(req){
  var crypto = require('crypto');
  let key = req.body.key;
  key = crypto.createHash('md5').update(key).digest('hex');
  if(key === process.env.NOTEPAD_PASS){
    monika.console.log.green("Authetication successful.");
    return true;
  }
  if(key !== process.env.NOTEPAD_PASS){
    monika.console.log.red("Unauthorizated user detected!");
    monika.console.log("The IP detected was " + req.ip);
    return false;
  }
  monika.console.log.yellow("Something rather wrong happened...");
  monika.console.log("What could it be?");
  return null;
}

function delet(req){
  if(!(fs.existsSync(PATH))){
    monika.console.log.red("I'm sorry, but I didn't find our notepad...");
    return "No notes found.";
  }
  if(!(fs.existsSync(PATH_DELE))){
    monika.console.log.yellow("I created a new splitted notepad for us.");
    //fs.closeSync(fs.openSync(PATH_DELE, 'w'));
  }
  let oldData = req.body.old;
  let newData = req.body.new;
  fs.appendFileSync(PATH_DELE, oldData,
      function(err){
        if(err) throw err;
	  });
  fs.writeFileSync(PATH, newData,
      function(err){
        if(err) throw err;
	  });
  monika.console.log.green("I have splitted the notepad.");
  return fs.readFileSync(PATH, {encoding: 'utf-8'});
}

function load(){
  if(!(fs.existsSync(PATH))){
    monika.console.log.red("I'm sorry, but I didn't find our notepad...");
    return "No notes found.";
  }
  if(fs.readFileSync(PATH, {encoding: 'utf-8'}).length === 0){
    monika.console.log.yellow("I opened the notepad, but it is empty.\n");
    return "Escreva uma nota.";
  }
  monika.console.log.magenta("I opened the notepad for us.");
  return fs.readFileSync(PATH, {encoding: 'utf-8'});
}

function update(req){
  if(!(fs.existsSync(PATH))){
    monika.console.log.red("I'm sorry, but I didn't find our notepad...");
    return "No notes found.";
  }
  let data = req.body.news;
  fs.writeFileSync(PATH, data,
      function(err){
        if(err) throw err;
	  });
  monika.console.log.green("I have updated the checkboxes.");
  return fs.readFileSync(PATH, {encoding: 'utf-8'});
}

function write(req){
  if(!(fs.existsSync(PATH))){
    monika.console.log.green("I created a new notepad for us.");
    fs.closeSync(fs.openSync(PATH, 'w'));
  }
  let item = req.body.item;
  let icon = req.body.icon;
  let newitem = "<li>" + icon + item + "</li>" + os.EOL;
  fs.appendFileSync(PATH, newitem,
      function(err){
        if(err) throw err;
	  });
  monika.console.log.green("I wrote \"" + item + "\" to the notepad.\n");
  return fs.readFileSync(PATH, {encoding: 'utf-8'});
}

module.exports = {
  auth: auth,
  delet: delet,
  load: load,
  update: update,
  write: write
}

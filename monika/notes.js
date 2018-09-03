/*!
  Author: Yukashimi
  Date: 26/06/2018
  File: notes.js
*/
let fs = require("fs");
let os = require("os");

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
    console.log("Authetication successful.");
    return true;
  }
  if(key !== process.env.NOTEPAD_PASS){
    console.log("Unauthorizated user detected!");
    console.log("The IP detected was " + req.ip);
    return false;
  }
  console.log("Something rather wrong happened...");
  console.log("What could it be?");
  return null;
}

function delet(req){
  if(!(fs.existsSync(PATH))){
    console.log("I'm sorry, but I didn't find our notepad...");
    return "No notes found.";
  }
  if(!(fs.existsSync(PATH_DELE))){
    console.log("I created a new splitted notepad for us.");
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
  console.log("I have splitted the notepad.");
  return fs.readFileSync(PATH, {encoding: 'utf-8'});
}

function load(){
  if(!(fs.existsSync(PATH))){
    console.log("I'm sorry, but I didn't find our notepad...");
    return "No notes found.";
  }
  if(fs.readFileSync(PATH, {encoding: 'utf-8'}).length === 0){
    console.log("I opened the notepad, but it is empty.\n");
    return "Escreva uma nota.";
  }
  console.log("I opened the notepad for us.");
  return fs.readFileSync(PATH, {encoding: 'utf-8'});
}

function update(req){
  if(!(fs.existsSync(PATH))){
    console.log("I'm sorry, but I didn't find our notepad...");
    return "No notes found.";
  }
  let data = req.body.news;
  fs.writeFileSync(PATH, data,
      function(err){
        if(err) throw err;
	  });
  console.log("I have updated the checkboxes.");
  return fs.readFileSync(PATH, {encoding: 'utf-8'});
}

function write(req){
  if(!(fs.existsSync(PATH))){
    console.log("I created a new notepad for us.");
    fs.closeSync(fs.openSync(PATH, 'w'));
  }
  let item = req.body.item;
  let icon = req.body.icon;
  let newitem = "<li>" + icon + item + "</li>" + os.EOL;
  fs.appendFileSync(PATH, newitem,
      function(err){
        if(err) throw err;
	  });
  console.log("I wrote \"" + item + "\" to the notepad.\n");
  return fs.readFileSync(PATH, {encoding: 'utf-8'});
}

module.exports = {
  auth: auth,
  delet: delet,
  load: load,
  update: update,
  write: write
}

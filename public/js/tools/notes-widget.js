/*!
  Author: Yukashimi
  Date: 26/06/2018
  File: notes-widget.js
*/

let notes = (function(){

  let delet;
  let note_input;
  let note_text;
  let span;

  $(document).ready(
    function(){
      init();
    }
  );
  
  function authDelet(){
    let key = JSON.stringify({"key": note_input.val()});
    note_input.val("");
    http.request.setOptions("POST", "/notepad/auth", true, "text", "Content-type", "application/json");
    http.request.call(deletNots, key);
  }

  function deletNots(httpObj){
    return function(){
      let authorized = (httpObj.response === 'true');
      if(authorized){
        let newHTML = "";
        let oldHTML = "";
        $("li").each(function(index){
          if($(this).find("i").attr("class") !== "far fa-check-square"){
            //$(this).css("display", "none");
            newHTML = newHTML + $(this)[0].outerHTML;
          }
          if($(this).find("i").attr("class") === "far fa-check-square"){
            oldHTML = oldHTML + $(this)[0].outerHTML;
          }
        });
        if(oldHTML.length > 0){
          delet.html('Delete checked <i class="far fa-check-square"></i> notes');
          let htmlData = JSON.stringify({"old": oldHTML, "new": newHTML});
          http.request.setOptions("DELETE", "/notepad/delete", true, "text", "Content-type", "application/json");
          http.request.call(handleNoteResponse, htmlData);
          return
        }
        if(oldHTML.length === 0){
          delet.html('Nothing checked! <i class="far fa-check-square"></i>');
          delet.fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
          return
        }
      }
      if(!authorized){
        alert("Wrong password!\nRedirecting you elsewhere because why not?");
        window.location.replace("http://stackoverflow.com");
      }
    }
  }
  
  function handleNoteResponse(httpObj){
    return function(){
      note_text.html(httpObj.response);
      setToggler();
    }
  }
  
  function init(){
    initUI();
    setActions();
    loadNotes();
  }
  
  function initUI(){
    delet = $("#delet");
    note_input = $("#noteInput");
    note_text = $("#noteList");
  }
  
  function setActions(){
    note_input.keydown(writeNote);
    delet.click(authDelet);
  }
  
  function setToggler(){
    span = $(".fa-li");
    span.click(toggler);
  }
  
  function loadNotes(){
    http.request.setOptions("GET", "/notepad/load", true, "text", "Content-type", "application/json");
    http.request.call(handleNoteResponse, "");
  }
  
  function toggler(){
    if($(this).find("i").attr("class") === "far fa-square"){
      $(this).find("i").removeClass("far fa-square");
      $(this).find("i").addClass("far fa-check-square");
      updateNotes();
      return
    }
    if($(this).find("i").attr("class") === "far fa-check-square"){
      $(this).find("i").removeClass("far fa-check-square");
      $(this).find("i").addClass("far fa-question-circle");
      updateNotes();
      return
    }
    if($(this).find("i").attr("class") === "far fa-question-circle"){
      $(this).find("i").removeClass("far fa-question-circle");
      $(this).find("i").addClass("far fa-square");
      updateNotes();
      return
    }
  }
  
  function updateNotes(){
    let html = JSON.stringify({"news": note_text.html()});
    http.request.setOptions("PUT", "/notepad/update", true, "text", "Content-type", "application/json");
    http.request.call(handleNoteResponse, html);
  }
  
  function writeNote(event){
    if(event.keyCode === 13 && note_input.val()){
      let icon = "<span class=\"fa-li\"><i class=\"far fa-square\"></i></span>"
      note_text.html(
        note_text.html() + "<li>" + icon + note_input.val() + "</li>"
      );
    
      let new_item = JSON.stringify({"item": note_input.val(),
          "icon": icon});
      note_input.val("");
    
      http.request.setOptions("PUT", "/notepad/write", true, "text", "Content-type", "application/json");
      http.request.call(handleNoteResponse, new_item);
    }
  }
}());

/*!
  Author: Yukashimi
  Date: 16/05/2018
  File: chat-widget.js
*/

var chat = {}

chat.actions = (function(){
  let chat;
  //let chat_toggler;
  let docs;
  let docs_toggler;
  let docs_insider;
  let sender;
  //let sugg_button;
  //let sugg_text;

  $(document).ready(
    function(){
      init();
    }
  );
  
  function disableChat(inputID){
    $("#" + inputID).attr("disabled", "disabled");
    $("#" + inputID).attr("placeholder", "Chat encerrado.");
  }

  function firstName(nameToExtract){
    let output_name = nameToExtract.split(" ")[0];
    return (output_name = output_name.charAt(0) + (output_name.slice(1)).toLowerCase());
  }
  
  /*function hideChat(){
    if(chat.attr("class") === "container clearfix show"){
      chat.removeClass("show");
      chat.addClass("hide");
      return
    }
    if(chat.attr("class") === "container clearfix hide"){
      chat.removeClass("hide");
      chat.addClass("show");
      return
    }
  }*/

  function hideDocs(){
    if(docs.attr("class") === "people-list show-docs"){
      docs.removeClass("show-docs");
      return
    }
    if(docs.attr("class") === "people-list"){
      docs.addClass("show-docs");
      return
    }
  }
  
  function init(){
    initUI();
    setActions();
  }

  function initUI(){
    //chat_toggler = $("#chat-toggler");
    docs_toggler = $("#docs-toggler");
    docs_insider = $("#docs-toggler-inside");
    //sugg_button = $("#suggestion-send");
    //sugg_text = $(".suggestion-text");
    chat = $("#chat-column-holder");
    docs = $("#docs");
    sender = $('#sender');
  }

  function now(){
    const DATE = new Date();
    let hour = DATE.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    let minute = DATE.getMinutes();
    minute = (minute < 10 ? "0" : "") + minute;
    let seconds = DATE.getSeconds();
    seconds = (seconds < 10 ? "0" : "") + seconds;
    return hour + ":" + minute + ":" + seconds;
  }

  /*function openSuggestion(){
    return function(){
      setTimeout(function(){
        sugg_button.removeAttr("disabled");
        sugg_button.text("Enviar Sugestão");
      }, 4000);
    }
  }*/
  
  function scrollToChatBottom(id, duration){
    var div = document.getElementById(id);
    $('#' + id).animate({
      scrollTop: div.scrollHeight - div.clientHeight
    }, duration);
  }
    
  function send(){
    var context;
    var inputBox = $("#textInput");
    if(inputBox.val() != ""){
      var latestResponse = Api.getResponsePayload();
      if(latestResponse){
        context = latestResponse.context;
      }
      Api.sendRequest(inputBox.val(), context);
      inputBox.val('');
      Common.fireEvent(inputBox, 'input');
    }
  }

  function setActions(){
    //chat_toggler.click(hideChat);
    docs_toggler.click(hideDocs);
    docs_insider.click(hideDocs);
    sender.click(send);
    //sugg_button.click(suggestion);
  }

  /*function suggestion(event){
    let txt = sugg_text.val();
    if(txt === ""){
      sugg_button.text("Por favor, escreva a sua suggestão.");
      sugg_button.fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
      return
    }
    if(txt !== ""){
      sugg_button.attr("disabled","disabled");
      sugg_button.text("Enviando a Sugestão...");
      sugg_text.val("");
      let nme = $(".message-data-name-user").eq(0).text();
      if(nme === "Você" || nme === "" || nme === "Usuário"){
        nme = "Usuário não identificado";
      }
      let sugg_data = JSON.stringify({"text": txt, "user": nme});
      http.request.setOptions("POST", "/monika", true, "text", "Content-type", "application/json");
      http.request.call(openSuggestion, sugg_data);
      let icon = "<span class=\"fa-li\"><i class=\"far fa-square\"></i></span>"
      let new_item = JSON.stringify({"item": txt, "icon": icon});
      http.request.setOptions("PUT", "/notepad/write", true, "text", "Content-type", "application/json");
      http.request.call("", new_item);
    }
  }*/
  
  function toggleDropdown(clickedButton){
    let dropmenu = $(clickedButton).parent().find(".dropdown-menu");
    if(dropmenu.attr("class") === "dropdown-menu show-block"){
      dropmenu.removeClass("show-block");
      return
    }
    if(dropmenu.attr("class") === "dropdown-menu"){
      dropmenu.addClass("show-block");
      return
    }
  }
  
  return{
    disableChat: disableChat,
    firstName: firstName,
    now: now,
    scrollToChatBottom: scrollToChatBottom,
    send: send,
    toggleDropdown: toggleDropdown
  }
})();

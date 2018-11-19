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
      
      $("#scrollingChat").on("click", ".glossary",
      function(){
        var context;
        var latestResponse = Api.getResponsePayload();
        if(latestResponse){
          context = latestResponse.context;
        }
        Api.sendRequest($(this).attr("value"), context);
        $(this).addClass("disabled-link");
      });
    }
  );
  
  function lock(inputID, placeholder){
    $("#" + inputID).attr("disabled", "disabled");
    $("#" + inputID).attr("placeholder", placeholder);
  }
  
  function unlock(inputID){
    $("#" + inputID).removeAttr("disabled");
    $("#" + inputID).attr("placeholder", "Digite sua mensagem");
    $("#" + inputID).focus();
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
    docs.toggleClass("show-docs");
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
      http.request.setOptions("POST", "/monika");
      http.request.call(openSuggestion, sugg_data);
      let icon = "<span class=\"fa-li\"><i class=\"far fa-square\"></i></span>"
      let new_item = JSON.stringify({"item": txt, "icon": icon});
      http.request.setOptions("PUT", "/notepad/write");
      http.request.call("", new_item);
    }
  }*/
  
  function toggleDropdown(clickedButton){
    let dropmenu = $(clickedButton).parent().find(".dropdown-menu");
    dropmenu.toggleClass("show-block");
  }
  
  return{
    lock: lock,
    firstName: firstName,
    scrollToChatBottom: scrollToChatBottom,
    send: send,
    toggleDropdown: toggleDropdown,
    unlock: unlock
  }
})();

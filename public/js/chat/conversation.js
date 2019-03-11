/*!
  Author: Yukashimi
  Date: 16/05/2018
  File: conversation.js
  Original file by IBM
*/

// The ConversationPanel module is designed to handle
// all display and behaviors of the conversation column of the app.

var ConversationPanel = (() => {
  let cancel;
  let cpf_input;
  let pass_input;
  let bia_typing;
  let input_box;
  let db_ref;
  let timer;
  let login_box;
  let global_data = {};
  var settings = {
    selectors: {
      chatBox: '#scrollingChat',
      fromUser: '.user-message',
      fromWatson: '.bot-message',
      latest: '.latest'
    }
  };
  
  function chatTimeOut(newPayload){
    if(timer){
      clearTimeout(timer);
      timer = 0;
    }
    timer = setTimeout(function(){
      if(!newPayload.context.timedout){
        chat.actions.lock("textInput", "Chat encerrado.");
        chat.actions.unlock = util.disabled();
        newPayload.context.timedout = true;
        Api.sendRequest('', newPayload.context);
      }
    }, 600000);
    if(newPayload.output !== undefined){
      if(newPayload.output.action === 'end_conversation'){
        timedLock(5000);
      }
      if(newPayload.output.action === 'abrupt_end'){
        timedLock(1000);
      }
    }
  }
  
  // Set up callbacks on payload setters in Api module
  // This causes the displayMessage function to be called when messages are sent / received
  function chatUpdateSetup(){
    let setter = Api.setPayload;
    Api.setPayload = (kind, newPayloadStr, user) => {
      setter.call(Api, kind, newPayloadStr);
      displayMessage(JSON.parse(newPayloadStr), user);
    };
  }
  
  function checkActions(newPayload){
    let extra_actions = {
      "init_context": (pl) => initContext(pl),
      "retirement_time": (pl) => retirementTime(pl),
      "loan_active": (pl) => activeLoans(pl),
      "loan_by_contract": (pl) => contractedLoans(pl),
      "show_cancel": () => showCancel(),
      "show_login": (pl) => showLogin(pl)
    };
    
    (extra_actions[newPayload.output.action] || (() => {}))(newPayload);
  }
  
  function displayMessage(newPayload, typeValue){
    var isUser = typeValue;
    var textExists = (newPayload.input && newPayload.input.text)
      || (newPayload.output && newPayload.output.text);
    if(isUser !== null && textExists){
      if(!isUser){
        checkActions(newPayload);
      }
      msgOutput(newPayload, isUser);
      chatTimeOut(newPayload);
    }
  }
  
  function generateOptions(optionsArr){
    let options = $("<ul>");
    
    for(let i = 0; i < optionsArr.length; i++){
      options.append($("<li>").append($("<button>", {"class": "chat-button", /*"onclick": "ConversationPanel.submitOption(this)",*/ "type": "button", "value": optionsArr[i].value.input.text}).append(optionsArr[i].label)));
    }
    options.find("button").click((event) => ConversationPanel.submitOption(event.currentTarget));
    return options;
  }

  function init(){
    if(auth.isLogged("bot")){
      bia_typing = $(".message-typing");
      cpf_input = $("#cpf");
      input_box = $("#textInput")
      pass_input = $("#pass");
      login_box = $("#login-box");
      cancel = $("#cancel");
      
      cancel.click(updateCancel);
      
      db_ref = `?db=${util.getVersion()}`;
      chatUpdateSetup();
      Api.sendRequest('', null);
    }
  }
  
  function initContext(){
    const temp_obj = {
      "user": cpf_input.val(),
      "password": pass_input.val(),
      "version": util.getVersion()
    };
    http.request.setOptions("POST", "/api/data/");
    http.request.call(initResponse, JSON.stringify(temp_obj));
  }
  
  function initResponse(httpobj){
    return () => {
      let pay = Api.getPayload("response");
      if(399 < httpobj.status && httpobj.status < 500){
        pay.context.logged = false;
        pay.context.error_msg = JSON.parse(httpobj.response).msg;
      }
      if(httpobj.status === 200){
        global_data = JSON.parse(httpobj.response);
        // console.log(global_data);
        pay.context = setInfo(pay.context);
      }
      Api.sendRequest('', pay.context);
      cpf_input.val("");
      pass_input.val("");
      login_box.toggleClass("hide-y");
      bia_typing.css({"visibility": "hidden"});
      return;
    }
  }
  
  function inputKeyDown(event, input_box){
    if (event.keyCode === 13 && input_box.value){
      chat.actions.send();
    }
  }
  
  function msgAppend(current, contextName, isUser){
    let name = isUser ? (contextName || "Você") : "Bia";

    const generalInfo = [
      $("<span>", {"class": `message-data-name${(isUser ? '-user' : '-bot')}`}).append(name).append($("<i>", {"class": `fas fa-circle ${(isUser ? 'user' : 'online')}`})),
      $("<span>", {"class": "message-data-time"}).append(util.now())
    ];

    let output;
    if(current.hasOwnProperty('options')){
      output = (
        $("<span>").append(current.title),
        $("<span>").append(generateOptions(current.options))
      );
    }
    else{
      output = $("<span>").append(current.text);
    }

    $(settings.selectors.chatBox).append(
    $("<li>", {"class": "clearfix"}).append(
      $("<div>", {"class": `message-data ${(isUser ? 'align-right' : '')}`}).append(
        (isUser ? [generalInfo[1], generalInfo[0]] : [generalInfo[0], generalInfo[1]])
      ),
      $("<div>", {"class": `message latest ${(isUser ? 'user-message float-right' : 'bot-message')}`}).append(
        $("<p>", {"class": "bubble"}).append(output)
      )
    ));
  }
  
  function msgDelay(item, index, array, resolve, newPayload, isUser){
    const temp_item = isUser ? newPayload.input : newPayload.output.generic[index];
    const times = (temp_item.text || temp_item.title).length * 10;
    if(isUser){
      msgAppend(item, newPayload.context.name, isUser);
      chat.actions.lock("textInput", "Por favor, aguarde.");
      setTimeout(() => {
        bia_typing.css({"visibility": "visible"});
      }, times);
      resolve();
    }
    else if(!isUser){
      setTimeout(() => {
        msgAppend(item, newPayload.context.name, isUser);
        bia_typing.css({"visibility": "hidden"});
        newPayload.output.text = item;
        if((index + 1) !== array.length){
          bia_typing.css({"visibility": "visible"});
        }
        if((index + 1) === array.length){
          chat.actions.unlock("textInput");
        }
        chat.actions.scrollToChatBottom("history", 500)
        resolve();
      }, times);
    }
  }
  
  function msgOutput(newPayload, isUser){
    /* What is this for again...? */
    $(".latest").removeClass("latest");
    
    let text_obj = isUser ? newPayload.input : newPayload.output.generic;
    if (Object.prototype.toString.call( text_obj ) !== '[object Array]') {
      text_obj = [text_obj];
    }
    
    let msgReducer = text_obj.reduce((PC, item, index, array) => {
      return PC.then(() => new Promise((resolve) => {
        msgDelay(item, index, array, resolve, newPayload, isUser);
      }));
    }, Promise.resolve());
    
    msgReducer.then(() => chat.actions.scrollToChatBottom("history", 500));
  }
  
  function msgSend(context){
    Api.sendRequest(input_box.val(), context);
    input_box.val('');
  }
  
  function setInfo(oldContext){
    oldContext.logged = true;
    
    oldContext.cel = global_data.celular;
    oldContext.cep = global_data.cep;
    oldContext.cpf = global_data.cpf;
    oldContext.email = global_data.email;
    oldContext.mother = util.firstName(global_data.mother);
    oldContext.name = util.firstName(global_data.name);
    oldContext.tel = global_data.phone;
    oldContext.user = global_data.user;
    [oldContext.title, oldContext.article] = (global_data.gender === "F") ? ["Sra.", "A"] : ["Sr.", "O"];
    
    $(".message-data-name-user:contains('Você')" ).html(`${oldContext.name} <i class="fas fa-circle user"></i>`);
    return oldContext;
  }
  
  function showCancel(){
    input_box.toggleClass("compact-input");
    $("#cancel").toggleClass("hide-x");
  }
  
  function showLogin(newPayload){
    chat.actions.lock("textInput", "Insira os dados nos campos corretos.");
    input_box.val("");
    login_box.toggleClass("hide-y");
    cpf_input.focus();
  }
  
  // function submitDropdown(clickedButton){
    // $(clickedButton).parent().removeClass("x");
    // $(clickedButton).parent().parent().find(".drop-initer").attr("disabled", "disabled");
    // let value = clickedButton.value;
    // value = value.split(",");
    // let path = "/api/loan";
    // let READY = false;
    // let entid = global_data.DadosPessoais.COD_ENTID;
    // if(entid !== undefined && entid !== null & entid !== ""){
      // path = path + "?entid=" + entid + "&cont=" + value[0] + "&year=" + value[1];
      // READY = true;
    // }
    // if(READY){
      // http.request.setOptions("GET", path);
      // http.request.call(submitDropdownResponse, "");
    // }
    // if(!READY){
      // let pay = Api.getResponsePayload();
      // Api.sendRequest('', pay.context);
    // }
  // }
  
  // function submitDropdownResponse(httpobj){
    // return () => {
      // let pay = Api.getResponsePayload();
      // pay.context.valid_amount = false;
      // if(399 < httpobj.status && httpobj.status < 500){
        // Api.sendRequest('', pay.context);
      // }
      // if(httpobj.status === 200){
        // pay.context.amount = JSON.parse(httpobj.response);
        // pay.context.amount = pay.context.amount.value;
        // pay.context.valid_amount = true;
        // Api.sendRequest('', pay.context);
      // }
      // bia_typing.css({"visibility": "hidden"});
      // return;
    // }
  // }
  
  function submitOption(target){
    let pay = Api.getPayload("response");
    Api.sendRequest(target.value, pay.context);
    //Common.fireEvent(input_box, 'input');
    $(".chat-button").attr("disabled", "disabled");
    target.className = `${target.className} clicked`;
  }
  
  function timedLock(miliseconds){
    clearTimeout(timer);
    timer = 0;
    timer = setTimeout(function(){
      chat.actions.lock("textInput", "Chat encerrado.");
      chat.actions.unlock = util.disabled();
    }, miliseconds);
  }
  
  function updateCancel(){
    let pay = Api.getPayload("response");
    Api.sendRequest('Não é isso que eu preciso', pay.context);
    showCancel();
  }
  
  function updateReq(pay){
    const temp_obj = {
      user: pay.context.user,
      stamp: global_data.stamp,
      update: pay.context.update,
      value: input_box.val(),
      version: util.getVersion()
    };
    input_box.val("")
    http.request.setOptions("PUT", "/api/update/");
    http.request.call(updateRes, JSON.stringify(temp_obj));
  }
  
  function updateRes(httpObj){
    return () => {
      let pay = Api.getPayload("response");
      pay.context.update = null;
      
      if(399 < httpObj.status && httpObj.status < 500){
        pay.context.error_msg = JSON.parse(httpObj.response).msg;
      }
      if(httpObj.status === 200){
        global_data = JSON.parse(httpObj.response);
        // console.log(global_data);
        pay.context = setInfo(pay.context);
      }
      Api.sendRequest('', pay.context);
      showCancel();
      // cpf_input.val("");
      // $("#pass").val("");
      // login_box.toggleClass("hide-y");
      // bia_typing.css({"visibility": "hidden"});
      return;
    };
  }
  
  return {
    initContext: initContext,
    
    init: init,
    inputKeyDown: inputKeyDown,
    msgSend: msgSend,
    
    // submitDropdown: submitDropdown,
    submitOption: submitOption,
    
    updateReq: updateReq
  };
})();

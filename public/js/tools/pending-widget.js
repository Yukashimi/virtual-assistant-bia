/*!
  Author: Yukashimi
  Date: 04/10/2018
  File: pending-widget.js
*/

let pending = (() => {
  let portal_frame;
  let checkup;
  let current;
  let context;
  let date = {"start": "", "end": ""};
  let db_ref = [];
  let end;
  let info = {
    "id": 0,
    "protocol": "NA"
  };
  let info_boxes = {
    "cpf": undefined,
    "name": undefined,
    "phone": undefined,
    "mail": undefined,
    "birth": undefined,
    "mother": undefined
  };
  let list;
  let open_checkup;
  let output;
  let question;
  let portal;
  let previous;
  let protocol;
  let resp;
  let return_box;
  
  let start;
  let support;
  let relate;
  let virgin;
  
  $(document).ready(() => {
    if(auth.isLogged("pending")){
      init();
    }
  });
  
  function askBia(){
    Api.sendRequest(checkup.val(), context, resBia);
  }
  
  function resBia(xhttp){
    return () => {
      let outputArr = JSON.parse(xhttp.responseText).output.text;
      let botText = "";
      for(let o = 0; o < outputArr.length; o++){
        botText = botText + outputArr[0] + "<br>";
      }
      output.html(botText);
      checkup.val("");
      checkup.focus();
    };
  }

  function endProcess(httpObj){
    return () => {
      if(199 < httpObj.status && httpObj.status < 300){
        support.addClass("hide-y");
        ManuTimer = () => {};
        return_box.removeClass("hide-y");
        let before = return_box.html();
        return_box.html(JSON.parse(httpObj.response).msg +
          `<br>Protocolo: ${util.protocol(info.protocol)}<br>${before}`);
        list.addClass("hide-y");
        open_checkup.attr("disabled", "disabled");
        resp.addClass("hide-y");

        // portal_frame.addClass("hide-y");
        // portal_frame.css("border", 0);
        portal.addClass("hide-y");
        portal.css("border", 0);
      }
    };
  }
  
  function formatCPF(){
    const num_regex = /^\d+$/; //lets one day work on this
    let cpf = info_boxes.cpf.val();
    if(!num_regex.test(cpf)){
      cpf = cpf.substring(0, cpf.length-1);
    }
    // console.log(cpf);
    info_boxes.cpf.val(cpf);
    // const not_cpf_regex = /[^\.|\-|\d]/gm;
    // let cpf = info_boxes.cpf.val();
    // let formating = {
      // "4": `${cpf.substring(0, 3)}.${cpf.substring(3, 4)}`,
      // "7": `${cpf.substring(0, 7)}.${cpf.substring(7, 8)}`,
      // "11": `${cpf.substring(0, 11)}-${cpf.substring(11, 12)}`,
      // "15": cpf.substring(0, 14),
      // "default": cpf
    // };
    // if(cpf.length === 11 && /^\d+$/.test(cpf)){
      // cpf = `${cpf.substring(0, 3)}.${cpf.substring(3, 6)}.${cpf.substring(6, 9)}-${cpf.substring(9, 12)}`;
    // }//????????????????????????????????????????
    
    // cpf = formating[cpf.length] || formating.default;
    
    // if(not_cpf_regex.test(cpf)){
      // cpf = cpf.replace(not_cpf_regex, "");
    // }
    // info_boxes.cpf.val(cpf);

    // if(cpf.length === 14){
      // cpf = cpf.replace(/\.|\-/gm, "");
      // http.request.setOptions("GET", `/analytic/frame${db_ref[0]}${db_ref[1]}&cpf=${cpf}`);
      // http.request.call(loadFrame, "");
    // }
  }
  
  function init(){
    let url = window.location.pathname;
    // db_ref = ["?db=", (url.substring(0, url.lastIndexOf('/'))).replace("/", "")];
    db_ref = ["?db=", util.getVersion()];
    initUI();
    loadChat();
    setActions();
    setQuickContext({"dontlog": true, "article": "O", "title": "Sr.", "name": "Atendente"});
    $("#now").html(util.today());
    $("#foundation").attr("href", util.foundation_info[util.getVersion()].href);
    $("#foundation").attr("alt", `Página Web da ${util.getVersion()}`);
    $("#foundation > img").attr("src", `../img/${util.foundation_info[util.getVersion()].logo}`);
    $("#foundation > img").attr("alt", `Logo da ${util.getVersion()}`);
    $("#foundation > img").attr("title", `Logo da ${util.getVersion()}`);
    
  }
  
  function initProcess(httpObj){
    return () => {
      if(199 < httpObj.status && httpObj.status < 300){
        startTimer();
        relate.removeAttr("disabled");
        relate.attr("placeholder", "Digite o atendimento");
        let temp = JSON.parse(httpObj.response);
        info.id = temp.id;
        info.protocol = temp.protocol;
        protocol.find("div").html(`Protocolo: ${util.protocol(info.protocol)}`);
        protocol.removeClass("hide-li");
        $(':radio:not(:checked)').removeAttr("disabled");
        start.addClass("hide-y");
        start.css("border", 0);
      }
    };
  }
  
  function initUI(){
    // portal_frame = $("#portal_frame");
    checkup = $("#checkup");
    end = $("#end");
    info_boxes.cpf = $("#icpf");
    info_boxes.name = $("#iname");
    info_boxes.phone = $("#iphone");
    info_boxes.mail = $("#imail");
    info_boxes.birth = $("#ibirth");
    info_boxes.mother = $("#imother");

    list = $("#list");
    open_checkup = $("#open-checkup");
    output = $("#response");
    portal = $(".frame");
    previous = $("#previous");
    protocol = $("#protocol");
    question = $("#question");
    resp = $("#response-box");
    return_box = $("#return-box");
    start = $("#start");
    support = $("#support");
    relate = $("#relate");
    virgin = $("#virgin");
  }
  
  function loadChat(){
    if(sessionStorage.getItem("lastid") > 0){
      previous.removeClass("hide-y");
      end.removeClass("hide-x");
      current = sessionStorage.getItem("lastid") || 0;
      http.request.setOptions("GET", `/analytic/detail${db_ref[0]}${db_ref[1]}&param=${current}&method=id`);
      http.request.call(showSummary, "");
      return;
    }
    virgin.removeClass("hide-y");
    start.removeClass("hide-x");
  }
  
  function loadFrame(httpObj){
    return () => {
      let user_info = JSON.parse(httpObj.response);
      //info_boxes.cpf.attr("disabled", "disabled");
      info_boxes.name.text(user_info.name);
      info_boxes.phone.text(user_info.phone);
      info_boxes.mail.text(user_info.email);
      info_boxes.birth.text(user_info.birth);
      info_boxes.mother.text(user_info.mother);
      
      // portal_frame.attr("src", util.foundation_info[util.getVersion()].sys);
      
      //portal.click...
      
      // portal_frame.on('load', () => {
        // portal.removeAttr("disabled");
        // portal.text("Consultar Portal");
      // });
      
      if(199 < httpObj.status && httpObj.status < 300){
        start.removeAttr("disabled");
      }
      
    }
  }
  
  let ManuTimer = function(){
    date.end = new Date();
    
    let diff = date.end - date.start;
    let ManuTimerID = 0;

    diff = new Date(diff);
    let sec = diff.getSeconds();
    let min = diff.getMinutes();
  
    if (min < 10) { min = `0${min}`; }
    if (sec < 10) { sec = `0${sec}`; }

    document.getElementById("timer").innerHTML = `${min}:${sec}`;
    ManuTimerID = setTimeout(ManuTimer, 10);
  };
  
  function newInit(){
    let new_convo = JSON.stringify(
      {"id": 0, "name": info_boxes.name.text(),
       "date": (new Date()), "level": 1, "db": db_ref[1],
        "contact": {
          "tel": info_boxes.phone.text(),
          "cpf": info_boxes.cpf.val(),
          "email": info_boxes.mail.text()
        }
      }
    );
    http.request.setOptions("PUT", "/analytic/new");
    http.request.call(initProcess, new_convo);
    end.removeClass("hide-x");
    virgin.find("ul").find("li").find("input").attr("disabled", "disabled");
  }
  
  function setActions(){
    open_checkup.click(showCheckup);
    checkup.keydown((event) => {
        return util.inputOnEnter(event, askBia);
      }
    );
    question.click(askBia);
    end.click(updateService);
    start.click(newInit);
    
    info_boxes.cpf.on("input", formatCPF);
    
    portal.click((event) => {
      const id = event.currentTarget.id;
      
      $("#maker").attr("action", util.portal_info[id].action);
      
      $("#maker").append(
        $("<input>", {"name": "user", "value": util.portal_info[id].user}),
        $("<input>", {"name": "password", "value": util.portal_info[id].password}),
        $("<input>", {"name": "sys", "value": util.portal_info[id].sys})
      );
      $("#maker").submit();
      // portal_frame.toggleClass("hide-y");
      // list.toggleClass("hide-y");
      // $("#tools").toggleClass("hide-y");
    });
    
    
    /* ;-; */
    $("#find").click(() => {
      const cpf = info_boxes.cpf.val();
      
      http.request.setOptions("GET", `/analytic/frame${db_ref[0]}${db_ref[1]}&cpf=${cpf}`);
      http.request.call(loadFrame, "");
      
    });
  }
  
  function setQuickContext(options){
    context = options;
  }
  
  function showSummary(httpObj){
    return () => {
      info = JSON.parse(httpObj.response);
      summaryBubble(info, list.find("ul"));
      
      /* Right now 'name' and contact info aren't being used */
      let new_convo = JSON.stringify(
        {"id": info.id, "name": info.name, "protocol": info.protocol,
         "date": (new Date()), "level": 2, "db": db_ref[1],
          "contact": {
            "tel": info.phone, "cpf": info.cpf, "email": info.email
          }
        }
      );
      http.request.setOptions("PUT", "/analytic/proceed");
      http.request.call(initProcess, new_convo);
    };
  }
  
  function startTimer(){
    date.start = new Date();
    ManuTimer();
  }
  
  function summaryBubble(summary, thislist){
    console.log(summary);
    let msgs = summary.msgs;
    thislist.html($("<ul>", {"class": "fa-ul"}));
    thislist = thislist.find("ul");
    
    thislist.append(
      $("<li>", {"class": util.display_info.css.old}).append(
        $("<span>", {"class": "fa-li"}).append(util.display_info.icon.general),
        (`Protocolo de Atendimento: ${summary.protocol}`)
      ),
      $("<li>", {"class": util.display_info.css.old}).append(
        $("<span>", {"class": "fa-li"}).append(util.display_info.icon.general),
        (`${util.display_info.icon.date}&nbsp;:&nbsp;${summary.date}&nbsp;&nbsp;&nbsp;${util.display_info.icon.clock}&nbsp;:&nbsp;${summary.time}`)
      ),
      $("<li>", {"class": util.display_info.css.old}).append(
        $("<span>", {"class": "fa-li"}).append(util.display_info.icon.USU),
        (`${summary.name} (CPF: ${summary.cpf} )`)
      ),
      $("<li>", {"class": util.display_info.css.old}).append(
        $("<span>", {"class": "fa-li"}).append(util.display_info.icon.phone),
        summary.phone
      ),
      $("<li>", {"class": util.display_info.css.old}).append(
        $("<span>", {"class": "fa-li"}).append(util.display_info.icon.email),
        summary.email
      ),
      $("<li>", {"class": util.display_info.css.info}).append(
        `${util.display_info.icon.convo} Resumo do Atendimento:`
      )
    );
    
    for(let s = 0; s < msgs.length; s++){
      thislist.append($("<li>", {"class": util.display_info.css.old}).append(
        $("<span>", {"class": "fa-li"}).append(util.display_info.icon[msgs[s].sender]),
        msgs[s].convo
      ).prop("outerHTML"));
    }
  }
  
  function showCheckup(){
    resp.toggleClass("hide-y");
    $("#open-checkup > i").toggleClass("fa-flip-vertical");
    /* There is also "fa-rotate-180" */
  }
  
  function toggler(target, classArr){
    return () => {
      target.toggleClass(classArr[0]).toggleClass(classArr[1]);
    };
  }
  
  function updateService(){
    let stat = $('input[name=status]:checked').val();
    let updated = JSON.stringify({
      "update": {
        "id": info.id, "status": stat, "protocol": info.protocol
      },
      "log": {
        "msg": relate.val(), "date": date.end
      },
      "db": db_ref[1]
    });
    http.request.setOptions("POST", "/analytic/update");
    http.request.call(endProcess, updated);
  }
  
})();
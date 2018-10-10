/*!
  Author: Yukashimi
  Date: 18/09/2018
  File: analytic-widget.js
*/

/* CURRENTLY HIDDING: BUTTONS */

let analytic = (function(){
  
  let convo_status = {
    "pedente": "<i class='fas fa-exclamation-triangle'></i>",
    "finalizada": "<i class='fas fa-check'></i>"
  };
  let data_button;
  let end;
  let full;
  let graph_box;
  let header;
  let lastID = 0;
  let list;
  let list_box;
  let logo;
  let more_info;
  let start;
  let selector;
  let search = {
    "input": null,
    "kind": null,
    "method": null,
    "submit": null
  }
  
  let info;
  let max_convo;
  
  $(document).ready(function(){
    init();
  });
  
  function changeDate(){
    redraw(selector.find(":selected").val());
  }
  
  function changeMethod(){
    if(search.method.find(":selected").val() === "type"){
      search.input.addClass("hide-y");
      search.kind.removeClass("hide-y");
      search.input.val("");
      return;
    }
    if(search.method.find(":selected").val() === "date"){
      search.input.attr("type", "date");
      search.input.removeClass("hide-y");
      search.input.focus();
      search.kind.addClass("hide-y");
      return;
    }
    if(search.method.find(":selected").val() !== "type"){
      search.input.attr("type", "input");
      search.input.removeClass("hide-y");
      search.input.focus();
      search.kind.addClass("hide-y");
      return;
    }
  }
  
  function datedDraw(){
    let date = {
      start: start.val(),
      end: end.val()
    };
    if(date.start !== "" && date.end !== ""){
      let path = "?start=" + date.start + "&end=" + date.end;
      http.request.setOptions("GET", "/analytic/load/graph" + path, true, "text", "Content-type", "application/json");
      http.request.call(tempGraph, "");
      return;
    }
    header.html("<b>Por favor insira uma data válida</b>");
  }
  
  function displayList(httpObj){
    return function(){
      let body_info = JSON.parse(httpObj.response);
      let html = "";
      for(let l = 0; l < body_info.length; l++){
        html = html + listTemplate(body_info.id[l], body_info.name[l],
            body_info.date[l], body_info.time[l], body_info.status[l]);
      }
      list.html(html);
    }
  }
  
  function displayHeader(httpObj){
    return function(){
      let header_info = JSON.parse(httpObj.response);
      header.html("Número de atendimentos realizados: " + header_info.convo +
          "   Número total de mensagens: " + header_info.msgs +
          "   Tempo médio de cada atendimento: " + header_info.average);
    }
  }
  
  function init(){
    initUI();
    graph.draw.init("graph", 15, 12, 50);
    loadList();
    loadData();
    setActions();
  }
  
  function drawGraph(httpObj){
    return function(){
      setData(httpObj);
      let value = "month";
      redraw(value);
      loadHeader();
    }
  }
  
  function hide(){
    let dom = {
      "graph": {
        "button": hide_graph,
        "box": graph_box,
        "name": "Gráfico",
        "hidden": graph_box.attr("class") === "flex-column hide"
      },
      "list": {
        "button": hide_list,
        "box": list_box,
        "name": "Resumo",
        "hidden": list_box.attr("class") === "hide"
      }
    }
    let id = $(this).attr("id").replace("hide-", "");
    let otherId = JSON.stringify(Object.keys(dom)).replace(/\[|\]|\"|\,/gm, "").replace(id, "");
    if(dom[id].hidden && dom[otherId].hidden){
      dom[id].box.removeClass("hide");
      dom[id].button.text("Ocultar " + dom[id].name + " dos Atendimentos");
      logo.addClass("hide");
      return
    }
    if(!dom[id].hidden && dom[otherId].hidden){
      dom[id].box.addClass("hide");
      dom[id].button.text("Mostrar " + dom[id].name + " dos Atendimentos");
      logo.removeClass("hide");
    }
    if(dom[id].hidden && !dom[otherId].hidden){
      dom[id].box.removeClass("hide");
      dom[id].button.text("Ocultar " + dom[id].name + " dos Atendimentos");
      dom[otherId].box.addClass("hide");
      dom[otherId].button.text("Mostrar " + dom[otherId].name + " dos Atendimentos");
    }
  }
  
  function initUI(){
    graph_box = $("#graph-box");
    end = $("#end");
    full = $("#full");
    start = $("#start");
    selector = $("#data-selector");
    header = $("#header");
    list = $("#convo_list");
    more_info = "more-info";
    search.input = $("#param");
    search.kind = $("#kinds");
    search.method = $("#method");
    search.submit = $("#search");
    today();
  }

  function listTemplate(id, name, date, time, status){
    let content = "<i class='far fa-comments'></i>&nbsp;&nbsp;" + convo_status[status] +
        "<br><i class='fas fa-user'></i>&nbsp;&nbsp;&nbsp;" + name +
        "<br><i class='fas fa-calendar-alt'></i>&nbsp;&nbsp;&nbsp;" + date +
        "<br><button class='" + more_info + "' onclick='analytic.loadDetails(this)'>Ver Mais <i class='fas fa-comments'></i></button>";

    return ("<li id='" + id + "'><p>" + content + "</p>" + "</li>");
  }
  
  function loadList(date){
    let path = (date) ? "?start=" + date.start + "&end=" + date.end : "";
    http.request.setOptions("GET", "/analytic/load/body" + path, true, "text", "Content-type", "application/json");
    http.request.call(displayList, "");
  }
  
  function loadHeader(date){
    let path = (date) ? "?start=" + date.start + "&end=" + date.end : "";
    http.request.setOptions("GET", "/analytic/load/header" + path, true, "text", "Content-type", "application/json");
    http.request.call(displayHeader, "");
  }
  
  function loadData(){
    http.request.setOptions("GET", "/analytic/load/graph", true, "text", "Content-type", "application/json");
    http.request.call(drawGraph, "");
  }
  
  function loadDetails(item){
    let id = item.parentElement.parentElement.id;
    
    if(full.attr("class") === "hide" && id !== lastID){
      lastID = id;
      http.request.setOptions("GET", "/analytic/load/detail?id=" + id, true, "text", "Content-type", "application/json");
      http.request.call(showDetails, "");
      return;
    }
    let show = showDetails("", id);
    show();
  }
  
  function showDetails2(httpObj){
    return function(){
      graph_box.addClass("hide");
      full.removeClass("hide");
      let details = JSON.parse(httpObj.response);
      full.find("ul").html(convoBubble(details));
    }
  }
  
  function showDetails(httpObj, id){//, args=false){
    return function(){
      list.find("." + more_info).find("i").toggleClass('fa-comments').toggleClass('fa-chart-line');
      
      if(graph_box.attr("class") === "flex-column hide"){
        graph_box.removeClass("hide");
        full.addClass("hide");
        //full.find("ul").html("");
        return;
      }
      if(lastID !== id && httpObj !== ""){
        let info = JSON.parse(httpObj.response);
        full.find("ul").html(convoBubble(info));
      }
      graph_box.addClass("hide");
      full.removeClass("hide");
    }
  }
  
  
  function convoBubble(summary){
    console.log(summary);
    let msgs = summary.msgs;
    let html = "<ul class='fa-ul'>";
    let aux = {
      "Bot": {
        "icon": "<i class='fas fa-headset'></i>",
        "class": "bubble bot"
      },
      "User": {
        "icon": "<i class='fas fa-user'></i>",
        "class": "bubble user"
      },
      "info": {
        "icon": "<i class='fas fa-info'></i>",
        "class": "bubble info"
      },
      "pending": {
        "icon": "<i class='fas fa-tasks'></i>",
        "class": "bubble"
      }
      
    }
    html = html + "<li class='" + aux.info.class +
      "'><span class='fa-li'>" + aux.info.icon +
      "</span>Protocolo de Atendimento: " + summary.protocol +
      "&nbsp;&nbsp;&nbsp;<i class='far fa-clock'></i>&nbsp;:&nbsp;" + summary.time + "</li>";
    html = html + "<li class='" + aux.info.class +
      "'><span class='fa-li'>" + aux.User.icon +
      "</span>" + summary.name + "</li>";
    for(let s = 0; s < msgs.length; s++){
      html = html +
      "<li class='" + aux[msgs[s][1]].class + "'><span class='fa-li'>" +
      aux[msgs[s][1]].icon + "</span>" + msgs[s][0] + "</li>";
    }
    
    if(summary.status === 2){
      sessionStorage.setItem("lastid", lastID);
      html = html + "<li class='" + aux.pending.class +
        "'><span class='fa-li'>" + aux.pending.icon +
        "</span>" + "<a href='pending.html' class='pending' target='_blank'>Prosseguir Atendimento <i class='fas fa-external-link-alt'></i></a>" + "</li>";
    }
    html = html + "</ul>";
    return html;
  }
  
  function redraw(graphInfo, dates){
    let value = graphInfo;
    if(graph.draw.checkContext()){
      graph.draw.background();
      graph.draw.xAxis(info[value].tags, info[value].name);
      graph.draw.yAxis(info[value].max, info.name);
      graph.draw.line(info[value].tags.length, info[value].amount, info[value].max);
    }
    else{
      console.log("No support detected.");
    }
  }
  
  function searcher(){
    let param = search.input.val() || search.kind.find(":selected").val();
    let method = search.method.find(":selected").val();
    if(param !== ""){
      let path = "?param=" + param + "&method=" + method;
      http.request.setOptions("GET", "/analytic/load/detail" + path, true, "text", "Content-type", "application/json");
      http.request.call(showDetails2, "");
    }
  }
  
  function setActions(){
    search.submit.click(searcher);
    search.method.change(changeMethod);
    selector.change(changeDate);
    start.change(datedDraw);
    end.change(datedDraw);
  }
  
  function setData(httpObj){
    let data = JSON.parse(httpObj.response);
    info = {
      "name": "Número de Conversas",
      "month": {
        "amount": data.month,
        "max": Math.max.apply(null, data.month),
        "name": "Meses",
        "tags": ["JAN", "FEV", "MAR", "APR", "MAI", "JUN",
                 "JUL", "AGO", "SET", "OUT", "NOV", "DEC"]
      },
      "day": {
        "amount": data.days,
        "max": Math.max.apply(null, data.days),
        "name": "Dias",
        "tags": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
          "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
          "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"]
      },
      "week": {
        "amount": data.week,
        "max": Math.max.apply(null, data.week),
        "name": "Dia da Semana",
        "tags": ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"]
      },
      "hour": {
        "amount": data.hours,
        "max": Math.max.apply(null, data.hours),
        "name": "Horas",
        "tags": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
          "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
          "21", "22", "23"]
      }
    };
  }
  
  function tempGraph(httpObj){
    return function(){
      let data = JSON.parse(httpObj.response);
      let tags = [];
      let values = [];
      let keys = Object.keys(data);
      for(let t = 0; t < keys.length; t++){
        tags[t] = keys[t].substring(5);
        values[t] = data[keys[t]];
      }
      info["range"] = {
        "amount": values,
        "max": Math.max.apply(null, values),
        "name": "Dias",
        "tags": tags
      }
      tags = null;
      values = null;
      keys = null;
      let date = {
        start: start.val(),
        end: end.val()
      };
      redraw("range");
    }
  }
  
  /* use chat.actions.now instead? */
  function today(){
    let today = new Date();
    let month = today.getMonth() + 1;
    let day = today.getDate();
    let year = today.getFullYear();
    let maxDate = year + "-" + (month < 10 ? "0" : "") + month + "-" +
        (day < 10 ? "0" : "") + day;    
    start.attr("max", maxDate);
    start.val(maxDate);
    end.attr("max", maxDate);
    end.val(maxDate);
    search.input.attr("max", maxDate);
  };
  
  return {
    loadDetails: loadDetails
  };
  
}());
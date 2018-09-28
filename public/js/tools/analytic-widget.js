/*!
  Author: Yukashimi
  Date: 18/09/2018
  File: analytic-widget.js
*/

/* CURRENTLY HIDDING: BUTTONS */

let analytic = (function(){
  
  let data_counter = 0;
  let data_button;
  let graph_box;
  let end;
  let header;
  let hide_graph;
  let hide_list;
  let list;
  let list_box;
  let logo;
  let start;
  let selector;
  
  let info;
  let max_convo;
  
  $(document).ready(function(){
    init();
  });
  
  function changeActions(){
    redraw(selector.find(":selected").val());
    loadHeader();
    loadList();
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
      loadHeader(date);
      loadList(date);
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
        "hidden": graph_box.attr("class") === "hide"
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
    //data_button = $("#graph-data");
    graph_box = $("#graph-box");
    end = $("#end");
    start = $("#start");
    selector = $("#data-selector");
    header = $("#header");
    //hide_graph = $("#hide-graph");
    //hide_list = $("#hide-list");
    list = $("#convo_list");
    //list_box = $("#list");
    //logo = $("#logo");
    today();
  }

  function listTemplate(id, name, date, time, status){
    /*let content = "Atendimento #" + id + " (" + status + " " + (num_msgs / 2) +
        " mensagens)<br>Conversa com duração de " +
        time +"<br>Data: " + date + "<br>Protocolo:<b><br>" + protocol + "</b>";
        */
    let content = "Atendimento #" + id + " (" + status + ")<br>Participante: " +
        name + "<br>Conversa com duração de " +
        time + "<br>Data: " + date + "<br>";
    return ("<li><p>" + content + "</p></li>");
    
    /*return ("<li><h4>Protocolo de atendimento: " + protocol + " ("
        + status + ")</h4>" + num_msgs + " mensagens trocadas em "
        + date + " com duração de " + time +  "</li>");*/
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
  
  function setActions(){
    //hide_graph.click(hide);
    //hide_list.click(hide);
    //data_button.click(toggleData);
    selector.change(changeActions);
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
  
  /*function toggleData(){
    data_counter++;
    if(data_counter % 2 === 0){
      //redraw();
      data_button.text("Mostrar Conversas Por dia do Més");
      
      return;
    }
    data_button.text("Mostrar Conversas Por Hora do Dia");
    if(graph.draw.checkContext()){
      graph.draw.background();
      graph.draw.xAxis(info.day_tags, "Dia do Més");
      graph.draw.yAxis(max_convo.days, "Número de Conversas");
      graph.draw.line(info.day_tags.length, info.convos_per_days, max_convo.days);
    }
    else{
      console.log("No support detected.");
    }
  }*/
  
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
  };
  
}());
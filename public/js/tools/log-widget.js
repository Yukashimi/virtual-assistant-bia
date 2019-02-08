/*!
  Author: Yukashimi
  Date: 18/07/2018
  File: log-widget.js
*/

let log = (() => {
  
  let log_area;
  let file_list;
  
  $(document).ready(() => {
    init();
    setActions();
  });
  
  function filtering(){
    let filter = $("#filters").find(":selected").val();
    const classes = {
      "all": "",
      "error": ".red",
      "success": ".green",
      "alert": ".yellow",
      "other": ".magenta"
      };
    $(log_area).find("li").addClass("hide");
    $(log_area).find("li" + classes[filter]).removeClass("hide");
    $("#showing").html(filter);
    $("#showing").attr("class", classes[filter].replace(".", ""));
  }
  
  function init(){
    log_area = "#log";
    file_list = "#files";
    load();
    list();
  }
  
  function list(){
    http.request.setOptions("GET", "/log/list");
    http.request.call(outputList, "");
  }
  
  function load(file=""){
    http.request.setOptions("GET", "/log/load" + (file ? "?file=" + file : ""));
    http.request.call(outputLog, "");
  }
  
  function setActions(){
    $(file_list).change(
      () => {
        let file = $(file_list).find(":selected").val();
        load(file);
      }
    );
    $("#filters").change(filtering);
  }
  
  function outputList(httpObj){
    return () => {
      let list = JSON.parse(httpObj.response);
      let options = "";
      for(let l = 0; l < list.length; l++){
        $(file_list).append(
          $("<option>", {"value": l, "text": list[l]}));
      }
    }
  }
  
  function outputLog(httpObj){
    return () => {
      let log = JSON.parse(httpObj.response)
      $(log_area).html(log.log);
      $("#date").html(log.date);
      filtering();
    }
  }
}

)();
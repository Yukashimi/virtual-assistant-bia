/*!
  Author: Yukashimi
  Date: 20/12/2018
  File: login-page.js
*/

let login = (() => {
  let tags = {
    "user": "username",
    "pass": "password"
  };
  
  $(document).ready(() => {
    $("#foundation").attr("href", util.foundation_info[util.getVersion()].href);
    $("#foundation").attr("alt", `Página Web da ${util.getVersion()}`);
    $("#foundation > img").attr("src", `../img/${util.foundation_info[util.getVersion()].logo}`);
    $("#foundation > img").attr("alt", `Logo da ${util.getVersion()}`);
    
    $("#log").click(() => {
      let key = JSON.stringify({"user": $(`#${tags.user}`).val(), "password": $(`#${tags.pass}`).val(), "version": util.getVersion()});
      // console.log(key);
      http.request.setOptions("POST", "/login");
      http.request.call(handleLogin, key/*() => {}, key*/);
    });
    
    // $("#path").change(() => {
      // const paths = {
        // "bot": "bot",
        // "sec": "analytic"
      // };
      // sessionStorage.setItem("redirect", paths[$("#path").find(":selected").val()]);
    // });
  });
  
  function handleLogin(httpObj){
    return () => {
      if(199 < httpObj.status && httpObj.status < 300){
        auth.advance();
      }
      else {
        let res = JSON.parse(httpObj.response);
        $("#res").html(res.msg);
        //console.log(httpObj);
      }
    }
  }
})();
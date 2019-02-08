/*!
  Author: Yukashimi
  Date: 08/11/2018
  File: home.js
*/

let home = (() => {
  $(document).ready(() => {
    sessionStorage.clear();
    $("#path").change(() => {
      let paths = {
        "bot": {
          "eqtprev": "eqtprev/bot",
          "faceb": "faceb/bot",
          "regius": "regius/bot"
        },
        "sec": {
          "eqtprev": "eqtprev/analytic",
          "faceb": "faceb/analytic",
          "regius": "regius/analytic"
        }
      };
      $("#eqtprev").attr("href", paths[$("#path").find(":selected").val()].eqtprev);
      $("#faceb").attr("href", paths[$("#path").find(":selected").val()].faceb);
      $("#regius").attr("href", paths[$("#path").find(":selected").val()].regius);
    });
  });
})();
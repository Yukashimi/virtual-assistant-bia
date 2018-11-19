/*!
  Author: Yukashimi
  Date: 08/11/2018
  File: home.js
*/

let home = (() => {
  $(document).ready(() => {
    $("#path").change(() => {
      let paths = {
        "bot": {
          "faceb": "faceb",
          "regius": "regius"
        },
        "sec": {
          "faceb": "faceb/analytic.html",
          "regius": "regius/analytic.html"
        }
      };
      $("#faceb").attr("href", paths[$("#path").find(":selected").val()].faceb);
      $("#regius").attr("href", paths[$("#path").find(":selected").val()].regius);
    });
  });
})();
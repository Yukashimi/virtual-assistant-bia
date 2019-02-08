/*!
  Author: Yukashimi
  Date: 28/12/2018
  File: auth-widget.js
*/

const auth = (() => {
  let logged = false;
  const LOGIN_PATH = "./login";
  
  function advance(){
    sessionStorage.setItem("logged", true);
    let redirect = sessionStorage.getItem("redirect");
    window.location.replace(`/${util.getVersion()}/${(redirect ? redirect : "analytic")}`);
  }
  
  function isLogged(redirect="analytic"){
    logged = sessionStorage.getItem("logged");
    if(!logged){
      sessionStorage.setItem("redirect", redirect);
      window.location.replace(LOGIN_PATH);
      return false;
    }
    return true;
  }
  
  return {
    advance: advance,
    isLogged: isLogged
  };
})();
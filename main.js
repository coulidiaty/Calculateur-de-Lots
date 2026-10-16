/* Point d'entrée : construit les écrans et affiche le premier. */
(function(App){
  "use strict";

  App.nav.mount(document.getElementById("app"));
  App.nav.go("s-asset");
})(window.LotCalc = window.LotCalc || {});

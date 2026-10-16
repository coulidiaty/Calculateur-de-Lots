/* Écran 1 : choix de l'actif. Mène au risque, ou directement au stop
   quand le risque est fixe. */
(function(App){
  "use strict";

  var u = App.utils;
  var store = App.store;

  var html =
    '<section class="screen" id="s-asset">' +
      '<div class="topbar">' +
        '<span class="step" id="asset-step"></span>' +
        '<button class="icon-btn" id="go-settings" aria-label="Paramètres" style="margin-left:auto;">' + App.ui.icons.settings + '</button>' +
      '</div>' +
      '<div class="head"><h1>Actif</h1></div>' +
      '<div class="content">' +
        '<div class="asset-grid" id="asset-grid"></div>' +
        '<div class="note" id="asset-empty" style="display:none;">Aucun actif. Ajoute-en un dans les Paramètres.</div>' +
      '</div>' +
    '</section>';

  function render(){
    var state = store.state;
    u.el("asset-step").textContent = "Étape 1 / " + App.risque.steps();
    var g = u.el("asset-grid");
    g.innerHTML = "";
    u.el("asset-empty").style.display = state.assets.length ? "none" : "block";
    state.assets.forEach(function(a){
      var c = App.ui.create("div", "asset-card", a.symbol || "—");
      c.addEventListener("click", function(){
        state.assetId = a.id;
        store.save();
        App.nav.go(App.risque.skipped() ? "s-stop" : "s-risk");
      });
      g.appendChild(c);
    });
  }

  function init(){
    u.el("go-settings").addEventListener("click", function(){ App.nav.go("s-settings"); });
  }

  App.nav.register({ id:"s-asset", html:html, init:init, enter:render });
})(window.LotCalc = window.LotCalc || {});

/* Écran 3 : distance du stop, telle qu'elle s'affiche sur le graphique. */
(function(App){
  "use strict";

  var u = App.utils;
  var store = App.store;

  var html =
    '<section class="screen" id="s-stop">' +
      '<div class="topbar">' +
        App.ui.backButton("s-risk") +
        '<span class="step">Étape 3 / 3</span>' +
      '</div>' +
      '<div class="head"><h1>Stop</h1><p>Le chiffre lu sur TradingView</p></div>' +
      '<div class="content">' +
        '<div class="field">' +
          '<input class="tabular" type="text" inputmode="decimal" id="stop-input" placeholder="537">' +
        '</div>' +
        '<div class="err" id="stop-err"></div>' +
        '<div class="spacer"></div>' +
        '<div class="actions"><button class="btn" id="stop-next">Calculer</button></div>' +
      '</div>' +
    '</section>';

  function render(){
    u.el("stop-input").value = u.str(store.state.stop);
    u.el("stop-err").style.display = "none";
  }

  function init(){
    u.el("stop-input").addEventListener("input", function(){
      store.state.stop = u.num(this.value);
      store.save();
      u.el("stop-err").style.display = "none";
    });

    u.el("stop-next").addEventListener("click", function(){
      if (!(store.state.stop > 0)){
        var e = u.el("stop-err");
        e.textContent = "Saisis une distance de stop supérieure à 0.";
        e.style.display = "block";
        return;
      }
      App.nav.go("s-result");
    });
  }

  App.nav.register({ id:"s-stop", html:html, init:init, enter:render });
})(window.LotCalc = window.LotCalc || {});

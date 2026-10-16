/* Écran 2 : risque, en dollars ou en pourcentage du capital.
   Les montants les plus utilisés sont proposés en un clic.
   Avec l'option « risque fixe », cet écran est sauté : le calcul passe
   directement de l'actif au stop. */
(function(App){
  "use strict";

  var u = App.utils;
  var store = App.store;

  var CHIPS_MAX = 3;
  var MEMORY_MAX = 10;

  var html =
    '<section class="screen" id="s-risk">' +
      '<div class="topbar">' +
        App.ui.backButton("s-asset") +
        '<span class="step">Étape 2 / 3</span>' +
      '</div>' +
      '<div class="head"><h1>Risque</h1><p>Combien tu acceptes de perdre sur ce trade</p></div>' +
      '<div class="content">' +
        '<div class="switch" id="risk-switch">' +
          '<div data-mode="dollar">$</div>' +
          '<div data-mode="percent">%</div>' +
        '</div>' +
        '<div class="field">' +
          '<div class="wrap">' +
            '<span class="fix" id="risk-fix">$</span>' +
            '<input class="tabular risk-input" type="text" inputmode="decimal" id="risk-input" placeholder="50">' +
          '</div>' +
          '<div class="chips" id="risk-chips"></div>' +
        '</div>' +
        '<div class="field" id="capital-field">' +
          '<label for="capital-input">Capital du compte</label>' +
          '<div class="wrap">' +
            '<span class="fix">$</span>' +
            '<input class="tabular pad-l" type="text" inputmode="decimal" id="capital-input" placeholder="10000">' +
          '</div>' +
        '</div>' +
        '<div class="note" id="risk-equiv"></div>' +
        '<div class="err" id="risk-err"></div>' +
        '<div class="opt">' +
          '<span>Garder ce risque<span class="opt-sub">Passer directement au stop</span></span>' +
          '<button class="tgl" id="risk-fixed" role="switch" aria-label="Garder ce risque"></button>' +
        '</div>' +
        '<div class="spacer"></div>' +
        '<div class="actions"><button class="btn" id="risk-next">Suivant</button></div>' +
      '</div>' +
    '</section>';

  /* ---------- Règles partagées avec les autres écrans ---------- */

  // Risque visé en dollars, ou null tant qu'il manque une saisie.
  function target(){
    var s = store.state;
    return App.calcul.target(s.riskMode, s.risk[s.riskMode], s.capital);
  }

  // Vrai quand l'écran Risque peut être sauté.
  function skipped(){ return store.state.riskFixed && target() !== null; }

  // Nombre d'étapes du parcours : 2 avec le risque fixe, 3 sinon.
  function steps(){ return skipped() ? 2 : 3; }

  // Ex. « $50 » ou « 1 % · $200.00 ».
  function summary(){
    var s = store.state;
    var r = s.risk[s.riskMode];
    if (s.riskMode === "percent") return r + " % · " + u.usd(target());
    return "$" + r;
  }

  /* ---------- Mémoire des montants ---------- */

  function byUse(a, b){ return (b.count - a.count) || (b.last - a.last); }

  function favorites(mode){
    return store.state.memory[mode].slice().sort(byUse).slice(0, CHIPS_MAX)
      .map(function(x){ return x.value; });
  }

  function remember(mode, value){
    var arr = store.state.memory[mode];
    var hit = null;
    for (var i=0;i<arr.length;i++) if (arr[i].value === value) hit = arr[i];
    if (hit){ hit.count++; hit.last = Date.now(); }
    else arr.push({ value: value, count: 1, last: Date.now() });
    arr.sort(byUse);
    if (arr.length > MEMORY_MAX) arr.length = MEMORY_MAX;
  }

  /* ---------- Affichage ---------- */

  function label(mode, v){ return mode === "percent" ? (v + " %") : ("$" + v); }

  // En mode %, montre l'équivalent en dollars.
  function renderEquiv(){
    var s = store.state;
    var note = u.el("risk-equiv");
    var t = (s.riskMode === "percent") ? target() : null;
    note.textContent = t !== null ? "Soit " + u.usd(t) : "";
    note.style.display = t !== null ? "block" : "none";
  }

  function renderFixed(){
    var on = store.state.riskFixed;
    u.el("risk-fixed").classList.toggle("on", on);
    u.el("risk-fixed").setAttribute("aria-checked", String(on));
  }

  function render(){
    var s = store.state;
    var mode = s.riskMode;
    var isPct = mode === "percent";

    document.querySelectorAll("#risk-switch div").forEach(function(d){
      d.classList.toggle("on", d.getAttribute("data-mode") === mode);
    });

    var fix = u.el("risk-fix");
    fix.textContent = isPct ? "%" : "$";
    fix.classList.toggle("right", isPct);

    var inp = u.el("risk-input");
    inp.classList.toggle("pad-l", !isPct);
    inp.placeholder = isPct ? "1" : "50";
    inp.value = u.str(s.risk[mode]);

    var chips = u.el("risk-chips");
    chips.innerHTML = "";
    favorites(mode).forEach(function(v){
      var c = App.ui.create("button", "chip tabular", label(mode, v));
      c.type = "button";
      c.addEventListener("click", function(){
        inp.value = String(v);
        s.risk[mode] = v;
        store.save();
        renderEquiv();
        clearError();
      });
      chips.appendChild(c);
    });

    u.el("capital-field").style.display = isPct ? "block" : "none";
    u.el("capital-input").value = u.str(s.capital);

    renderEquiv();
    renderFixed();
    clearError();
  }

  function error(msg){
    var e = u.el("risk-err");
    e.textContent = msg;
    e.style.display = "block";
  }

  function clearError(){ u.el("risk-err").style.display = "none"; }

  function init(){
    var s = store.state;

    document.querySelectorAll("#risk-switch div").forEach(function(d){
      d.addEventListener("click", function(){
        s.riskMode = d.getAttribute("data-mode");
        store.save();
        render();
      });
    });

    u.el("risk-input").addEventListener("input", function(){
      s.risk[s.riskMode] = u.num(this.value);
      store.save();
      renderEquiv();
      clearError();
    });

    u.el("capital-input").addEventListener("input", function(){
      s.capital = u.num(this.value);
      store.save();
      renderEquiv();
      clearError();
    });

    u.el("risk-fixed").addEventListener("click", function(){
      s.riskFixed = !s.riskFixed;
      store.save();
      renderFixed();
    });

    u.el("risk-next").addEventListener("click", function(){
      if (!(s.risk[s.riskMode] > 0)) return error("Saisis le risque que tu veux prendre.");
      if (s.riskMode === "percent" && !(s.capital > 0)) return error("Saisis le capital du compte pour calculer un risque en %.");
      App.nav.go("s-stop");
    });
  }

  App.risque = { remember: remember, target: target, skipped: skipped, steps: steps, summary: summary };
  App.nav.register({ id:"s-risk", html:html, init:init, enter:render });
})(window.LotCalc = window.LotCalc || {});

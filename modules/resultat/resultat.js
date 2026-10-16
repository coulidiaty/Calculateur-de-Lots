/* Écran 4 : résultat du calcul et historique. */
(function(App){
  "use strict";

  var u = App.utils;
  var ui = App.ui;
  var store = App.store;

  var HIST_MAX = 5;

  var html =
    '<section class="screen" id="s-result">' +
      '<div class="topbar">' + ui.backButton("s-stop") + '</div>' +
      '<div class="head"><h1 id="result-title">—</h1></div>' +
      '<div class="content">' +
        '<div class="err" id="result-err"></div>' +
        '<div id="result-card"></div>' +
        '<button class="hist-btn" id="hist-btn" style="display:none;"></button>' +
        '<div class="hist" id="hist-list"></div>' +
        '<div class="spacer"></div>' +
        '<div class="actions"><button class="btn" id="new-calc">Nouveau calcul</button></div>' +
      '</div>' +
    '</section>';

  function compute(){
    var s = store.state;
    var asset = store.getAsset(s.assetId);
    if (!asset) return fail("Sélectionne un actif.");
    if (!(s.stop > 0)) return fail("Distance de stop invalide.");

    var mode = s.riskMode;
    var risk = s.risk[mode];
    var target = App.calcul.target(mode, risk, s.capital);
    if (target === null){
      return fail(mode === "percent" && risk > 0 ? "Capital non renseigné." : "Aucun risque saisi.");
    }
    if (!(asset.value > 0)){
      return fail("Valeur $ non renseignée pour " + asset.symbol + ". Règle-la dans les Paramètres.");
    }

    var r = App.calcul.positionSize({
      stop: s.stop,
      value: asset.value,
      commission: s.commissionsOn ? (asset.commission || 0) : 0,
      target: target,
      divisor: s.divisorOn ? s.divisor : null
    });
    if (!r) return fail("Calcul impossible avec ces valeurs.");

    var riskLabel = mode === "percent"
      ? u.pct(r.real / s.capital * 100) + " · " + u.usd(r.real)
      : u.usd(r.real);

    remember(asset, r, riskLabel);
    render(asset, r, riskLabel);
  }

  function remember(asset, r, riskLabel){
    var s = store.state;
    App.risque.remember(s.riskMode, s.risk[s.riskMode]);
    s.history.unshift({ symbol: asset.symbol, lot: r.lot, risk: riskLabel, ts: Date.now() });
    s.history = s.history.slice(0, HIST_MAX);
    store.save();
  }

  function render(asset, r, riskLabel){
    var s = store.state;
    u.el("result-err").style.display = "none";
    u.el("result-title").textContent = asset.symbol + " · stop " + u.fmt(s.stop, 4);

    var card = ui.create("div", "rcard");

    if (r.atMin){
      var top = ui.create("div", "rcard-top");
      top.appendChild(ui.create("span", "tag", "lot minimum"));
      card.appendChild(top);
    }

    var lot = ui.create("div", "lot");
    lot.appendChild(ui.create("b", "tabular", r.lot.toFixed(2)));
    lot.appendChild(ui.create("span", null, "lots"));
    card.appendChild(lot);

    var row = ui.create("div", "rrow");
    row.appendChild(ui.create("span", "k", "risque"));
    row.appendChild(ui.create("b", "tabular", riskLabel));
    card.appendChild(row);

    if (r.divided !== null){
      var d = ui.create("div", "rdiv");
      d.appendChild(ui.create("span", null, "÷ " + s.divisor));
      d.appendChild(ui.create("b", "tabular", r.divided >= App.calcul.LOT_MIN ? r.divided.toFixed(2) : "—"));
      card.appendChild(d);
    }

    var box = u.el("result-card");
    box.innerHTML = "";
    box.appendChild(card);
    renderHistory();
  }

  function fail(msg){
    u.el("result-title").textContent = "—";
    u.el("result-card").innerHTML = "";
    var e = u.el("result-err");
    e.textContent = msg;
    e.style.display = "block";
    renderHistory();
  }

  function renderHistory(){
    var h = store.state.history;
    var btn = u.el("hist-btn");
    var box = u.el("hist-list");
    box.innerHTML = "";
    box.classList.remove("open");
    btn.style.display = h.length ? "block" : "none";
    btn.textContent = "Historique (" + h.length + ")";
    h.forEach(function(x){
      var r = ui.create("div", "hist-row");
      r.appendChild(ui.create("span", null, x.symbol));
      r.appendChild(ui.create("b", "tabular", x.lot.toFixed(2) + " lots · " + x.risk));
      box.appendChild(r);
    });
  }

  function init(){
    u.el("hist-btn").addEventListener("click", function(){
      var open = u.el("hist-list").classList.toggle("open");
      this.textContent = open ? "Masquer" : "Historique (" + store.state.history.length + ")";
    });
    u.el("new-calc").addEventListener("click", function(){ App.nav.go("s-asset"); });
  }

  App.nav.register({ id:"s-result", html:html, init:init, enter:compute });
})(window.LotCalc = window.LotCalc || {});

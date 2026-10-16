/* Écran Paramètres : options, capital du compte, liste des actifs. */
(function(App){
  "use strict";

  var u = App.utils;
  var ui = App.ui;
  var store = App.store;

  var html =
    '<section class="screen" id="s-settings">' +
      '<div class="topbar">' + ui.backButton("s-asset") + '</div>' +
      '<div class="head"><h1>Paramètres</h1></div>' +
      '<div class="content">' +

        '<div class="sect">' +
          '<div class="sect-title">Options</div>' +
          '<div class="opt">' +
            '<span>Diviseur de lots</span>' +
            '<button class="tgl" id="tgl-div" role="switch" aria-label="Diviseur de lots"></button>' +
          '</div>' +
          '<div class="subopt" id="div-sub">' +
            '<div class="wrap" style="width:80px;">' +
              '<input class="tabular" type="text" inputmode="decimal" id="div-input">' +
            '</div>' +
            '<button class="chip" data-div="2">2</button>' +
            '<button class="chip" data-div="3">3</button>' +
            '<button class="chip" data-div="4">4</button>' +
          '</div>' +
          '<div class="opt">' +
            '<span>Commissions</span>' +
            '<button class="tgl" id="tgl-comm" role="switch" aria-label="Commissions"></button>' +
          '</div>' +
        '</div>' +

        '<div class="sect">' +
          '<div class="sect-title">Compte</div>' +
          '<div class="field">' +
            '<label for="set-capital">Capital — sert au risque en %</label>' +
            '<div class="wrap">' +
              '<span class="fix">$</span>' +
              '<input class="tabular pad-l" type="text" inputmode="decimal" id="set-capital" placeholder="10000">' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="sect">' +
          '<div class="sect-title">Actifs — valeur d\'1 unité TradingView, pour 1 lot</div>' +
          '<div id="ast-list"></div>' +
          '<button class="add" id="add-ast">+ Ajouter un actif</button>' +
        '</div>' +

        '<div class="spacer"></div>' +
      '</div>' +
    '</section>';

  /* ---------- Options ---------- */

  function renderOptions(){
    var s = store.state;
    u.el("tgl-div").classList.toggle("on", s.divisorOn);
    u.el("tgl-div").setAttribute("aria-checked", String(s.divisorOn));
    u.el("div-sub").classList.toggle("show", s.divisorOn);
    u.el("div-input").value = String(s.divisor);
    markDivisor();
    u.el("tgl-comm").classList.toggle("on", s.commissionsOn);
    u.el("tgl-comm").setAttribute("aria-checked", String(s.commissionsOn));
  }

  function markDivisor(){
    document.querySelectorAll("#div-sub .chip").forEach(function(c){
      c.classList.toggle("on", u.num(c.getAttribute("data-div")) === store.state.divisor);
    });
  }

  /* ---------- Actifs ---------- */

  function moveAsset(id, delta){
    var list = store.state.assets;
    var i = -1;
    for (var n=0;n<list.length;n++) if (list[n].id === id) i = n;
    var j = i + delta;
    if (i < 0 || j < 0 || j >= list.length) return;
    var tmp = list[i];
    list[i] = list[j];
    list[j] = tmp;
    store.save();
    renderAssets();
  }

  function removeAsset(id){
    var s = store.state;
    s.assets = s.assets.filter(function(x){ return x.id !== id; });
    if (s.assetId === id) s.assetId = null;
    store.save();
    renderAssets();
  }

  function mini(cls, text){
    var b = ui.create("button", "mini " + cls, text);
    b.type = "button";
    return b;
  }

  function moneyField(value, placeholder, onChange, isComm){
    var w = ui.create("div", "wrap money" +(isComm ? " comm" + (store.state.commissionsOn ? " show" : "") : ""));
    var inp = ui.create("input", "tabular");
    inp.type = "text";
    inp.setAttribute("inputmode", "decimal");
    inp.placeholder = placeholder;
    inp.value = u.str(value);
    inp.addEventListener("input", function(){
      var v = u.num(inp.value);
      onChange(v !== null && v > 0 ? v : null);
      store.save();
    });
    w.appendChild(ui.create("span", "fix", "$"));
    w.appendChild(inp);
    return w;
  }

  function renderAssets(){
    var list = store.state.assets;
    var box = u.el("ast-list");
    box.innerHTML = "";

    list.forEach(function(a, index){
      var card = ui.create("div", "card");

      var head = ui.create("div", "row");

      var sym = ui.create("input", "sym");
      sym.type = "text";
      sym.maxLength = 14;
      sym.value = a.symbol || "";
      sym.addEventListener("input", function(){
        a.symbol = sym.value.toUpperCase();
        store.save();
      });

      var first = index === 0;
      var last = index === list.length - 1;

      var up = mini("", "▲");
      up.disabled = first;
      up.style.opacity = first ? ".3" : "1";
      up.addEventListener("click", function(){ moveAsset(a.id, -1); });

      var down = mini("", "▼");
      down.disabled = last;
      down.style.opacity = last ? ".3" : "1";
      down.addEventListener("click", function(){ moveAsset(a.id, 1); });

      var del = mini("del", "✕");
      del.addEventListener("click", function(){ removeAsset(a.id); });

      head.appendChild(sym);
      head.appendChild(up);
      head.appendChild(down);
      head.appendChild(del);
      card.appendChild(head);

      var vrow = ui.create("div", "vrow");
      vrow.appendChild(ui.create("div", "lab", "Valeur"));
      vrow.appendChild(moneyField(a.value, "valeur", function(v){ a.value = v; }, false));
      vrow.appendChild(moneyField(a.commission, "comm.", function(v){ a.commission = v; }, true));
      card.appendChild(vrow);

      box.appendChild(card);
    });
  }

  function render(){
    renderOptions();
    u.el("set-capital").value = u.str(store.state.capital);
    renderAssets();
  }

  function init(){
    var s = store.state;

    u.el("tgl-div").addEventListener("click", function(){
      s.divisorOn = !s.divisorOn;
      store.save();
      renderOptions();
    });

    u.el("tgl-comm").addEventListener("click", function(){
      s.commissionsOn = !s.commissionsOn;
      store.save();
      renderOptions();
      renderAssets();
    });

    u.el("div-input").addEventListener("input", function(){
      var v = u.num(this.value);
      if (v > 0){ s.divisor = v; store.save(); }
      markDivisor();
    });

    document.querySelectorAll("#div-sub .chip").forEach(function(c){
      c.addEventListener("click", function(){
        s.divisor = u.num(c.getAttribute("data-div"));
        store.save();
        renderOptions();
      });
    });

    u.el("set-capital").addEventListener("input", function(){
      s.capital = u.num(this.value);
      store.save();
    });

    u.el("add-ast").addEventListener("click", function(){
      s.assets.push({ id: u.uid("as"), symbol: "NOUVEAU", value: null, commission: null });
      store.save();
      renderAssets();
    });
  }

  App.nav.register({ id:"s-settings", html:html, init:init, enter:render });
})(window.LotCalc = window.LotCalc || {});

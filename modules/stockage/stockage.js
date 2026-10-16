/* État de l'application et sauvegarde dans le navigateur (localStorage). */
(function(App){
  "use strict";

  var KEY = "lotCalc.v3";
  var OLD_KEY = "lotCalc.v2";

  var DEFAULTS = {
    assets: [
      { id:"as1", symbol:"EURUSD",   value:null, commission:null },
      { id:"as2", symbol:"BTCUSD",   value:null, commission:null },
      { id:"as3", symbol:"SP500",    value:null, commission:null },
      { id:"as4", symbol:"WTICOUSD", value:null, commission:null }
    ],
    capital: null,
    divisorOn: false,
    divisor: 2,
    commissionsOn: false,
    riskFixed: false,
    riskMode: "dollar",
    risk: { dollar:null, percent:null },
    memory: { dollar:[], percent:[] },
    assetId: null,
    stop: null,
    history: []
  };

  function clone(o){ return JSON.parse(JSON.stringify(o)); }
  function isNum(v){ return typeof v === "number" && isFinite(v); }
  function numOrNull(v){ return isNum(v) ? v : null; }

  // Ancienne version multi-comptes : on garde les réglages du premier compte.
  function migrate(old){
    var acc = Array.isArray(old.accounts) ? old.accounts[0] : null;
    var accId = acc ? acc.id : null;
    var values = old.values || {};
    var comms = old.commissions || {};
    var risk = old.risk || {};
    var mem = (old.memory && accId) ? old.memory[accId] : null;

    return {
      assets: (old.assets || []).map(function(a){
        return {
          id: a.id,
          symbol: a.symbol,
          value: accId ? values[a.id + "|" + accId] : null,
          commission: accId ? comms[a.id + "|" + accId] : null
        };
      }),
      capital: acc ? acc.capital : null,
      divisorOn: old.divisorOn,
      divisor: old.divisor,
      commissionsOn: old.commissionsOn,
      riskMode: old.riskMode,
      risk: {
        dollar: (risk.dollar && accId) ? risk.dollar[accId] : null,
        percent: (risk.percent && accId) ? risk.percent[accId] : null
      },
      memory: mem || { dollar:[], percent:[] },
      assetId: old.assetId,
      stop: old.stop,
      history: (old.history || []).filter(function(h){ return !h.name || !acc || h.name === acc.name; })
    };
  }

  function read(){
    var raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
    var old = localStorage.getItem(OLD_KEY);
    if (old) return migrate(JSON.parse(old));
    return null;
  }

  // Fusionne les données lues avec les valeurs par défaut et corrige les types.
  function load(){
    var s = clone(DEFAULTS);
    var p;
    try { p = read(); } catch(e){ p = null; }
    if (p && typeof p === "object"){
      for (var k in s) if (p.hasOwnProperty(k) && p[k] !== undefined && p[k] !== null) s[k] = p[k];
    }

    if (!Array.isArray(s.assets)) s.assets = [];
    s.assets = s.assets.filter(function(a){ return a && a.id; }).map(function(a){
      return { id:a.id, symbol:a.symbol || "", value:numOrNull(a.value), commission:numOrNull(a.commission) };
    });
    s.capital = numOrNull(s.capital);
    s.divisorOn = !!s.divisorOn;
    s.commissionsOn = !!s.commissionsOn;
    s.riskFixed = !!s.riskFixed;
    if (!(s.divisor > 0)) s.divisor = 2;
    if (s.riskMode !== "percent") s.riskMode = "dollar";
    if (!s.risk || typeof s.risk !== "object") s.risk = { dollar:null, percent:null };
    s.risk.dollar = numOrNull(s.risk.dollar);
    s.risk.percent = numOrNull(s.risk.percent);
    if (!s.memory || typeof s.memory !== "object") s.memory = {};
    if (!Array.isArray(s.memory.dollar)) s.memory.dollar = [];
    if (!Array.isArray(s.memory.percent)) s.memory.percent = [];
    s.stop = numOrNull(s.stop);
    if (!Array.isArray(s.history)) s.history = [];
    return s;
  }

  var state = load();

  function save(){
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(e){}
  }

  function getAsset(id){
    for (var i=0;i<state.assets.length;i++) if (state.assets[i].id === id) return state.assets[i];
    return null;
  }

  App.store = { state: state, save: save, getAsset: getAsset };
})(window.LotCalc = window.LotCalc || {});

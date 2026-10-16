/* Outils partagés : accès au DOM, lecture des nombres, formatage. */
(function(App){
  "use strict";

  function el(id){ return document.getElementById(id); }

  function uid(p){ return p + Date.now().toString(36) + Math.floor(Math.random()*1000).toString(36); }

  // Accepte la virgule comme séparateur décimal.
  function num(v){ var n = parseFloat(String(v).replace(",", ".")); return isNaN(n) ? null : n; }

  function fmt(n, dec){
    if (typeof n !== "number" || !isFinite(n)) return "—";
    var s = n.toFixed(typeof dec === "number" ? dec : 6);
    if (s.indexOf(".") !== -1) s = s.replace(/0+$/, "").replace(/\.$/, "");
    return s;
  }
  function usd(n){ return "$" + n.toFixed(2); }
  function pct(n){ return n.toFixed(2).replace(/\.?0+$/, "") + " %"; }

  // Valeur d'un champ texte : vide si null ou indéfini.
  function str(v){ return (v === null || v === undefined) ? "" : String(v); }

  App.utils = { el:el, uid:uid, num:num, fmt:fmt, usd:usd, pct:pct, str:str };
})(window.LotCalc = window.LotCalc || {});

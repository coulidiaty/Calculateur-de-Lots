/* Calcul de la taille de position. Fonctions pures, sans accès au DOM ni à l'état.

   coût d'un lot = distance du stop × valeur d'une unité + commission
   lots          = risque ÷ coût d'un lot */
(function(App){
  "use strict";

  var LOT_MIN = 0.01;

  function round2(n){ return Math.round(n * 100) / 100; }

  // Risque visé en dollars, ou null si incalculable.
  function target(mode, risk, capital){
    if (!(risk > 0)) return null;
    if (mode === "percent") return capital > 0 ? capital * risk / 100 : null;
    return risk;
  }

  // p : { stop, value, commission, target, divisor }
  function positionSize(p){
    var perLot = p.stop * p.value + (p.commission || 0);
    if (!(perLot > 0) || !(p.target > 0)) return null;

    var lot = round2(p.target / perLot);
    var atMin = false;
    if (lot < LOT_MIN){ lot = LOT_MIN; atMin = true; }

    return {
      lot: lot,
      real: lot * perLot,
      atMin: atMin,
      divided: p.divisor > 0 ? round2(lot / p.divisor) : null
    };
  }

  App.calcul = { target: target, positionSize: positionSize, LOT_MIN: LOT_MIN };
})(window.LotCalc = window.LotCalc || {});

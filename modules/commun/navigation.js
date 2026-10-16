/* Navigation entre écrans.
   Chaque écran s'enregistre avec :
   - id     : identifiant de la <section>
   - html   : son balisage
   - init   : branchement des événements, appelé une fois
   - enter  : rafraîchissement, appelé à chaque affichage */
(function(App){
  "use strict";

  var screens = [];
  var byId = {};

  function register(screen){
    screens.push(screen);
    byId[screen.id] = screen;
  }

  function mount(root){
    screens.forEach(function(s){ root.insertAdjacentHTML("beforeend", s.html); });
    screens.forEach(function(s){ if (s.init) s.init(); });
    root.addEventListener("click", function(e){
      var b = e.target.closest(".back");
      if (b) go(b.getAttribute("data-to"));
    });
  }

  function go(id){
    var s = byId[id];
    if (s && s.enter) s.enter();
    screens.forEach(function(x){
      App.utils.el(x.id).classList.toggle("active", x.id === id);
    });
    window.scrollTo(0,0);
  }

  App.nav = { register: register, mount: mount, go: go };
})(window.LotCalc = window.LotCalc || {});

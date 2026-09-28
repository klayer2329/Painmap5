(function(){
  "use strict";
  const records=document.getElementById("recordsWorkspace");
  const logic=document.getElementById("logicWorkspace");
  const recordsBtn=document.getElementById("recordsViewBtn");
  const logicBtn=document.getElementById("logicViewBtn");
  const frame=document.getElementById("logicTreeFrame");
  function select(showLogic){
    records.hidden=showLogic;logic.hidden=!showLogic;
    recordsBtn.setAttribute("aria-pressed",String(!showLogic));
    logicBtn.setAttribute("aria-pressed",String(showLogic));
    if(showLogic&&!frame.getAttribute("src"))frame.setAttribute("src",frame.dataset.src);
  }
  recordsBtn.addEventListener("click",()=>select(false));
  logicBtn.addEventListener("click",()=>select(true));
})();

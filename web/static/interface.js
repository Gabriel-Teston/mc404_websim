/*jshint esversion: 6 */
// import RISCV_Simulator from "./simulator_controller.js";

sim = new RISCV_Simulator(document.getElementById("codeSelector"), outputFunction);
sim.stdioBind(function() {return document.getElementById("stdin").value;},
              function(s) {document.getElementById("stdout").value += s + "\n";},
              function(s) {document.getElementById("stderr").value += s + "\n";});

function outputFunction(type, msg){
  outHTML = document.getElementById("general_output");
  outHTML.innerHTML += "[" + type + "]" + msg + "\n";
}

document.getElementById("run_button").onclick = function(){
  sim.run();
  this.value = "Stop";
};

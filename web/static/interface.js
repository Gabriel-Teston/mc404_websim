/*jshint esversion: 6 */
// import RISCV_Simulator from "./simulator_controller.js";

sim = new RISCV_Simulator(document.getElementById("codeSelector"), outputFunction);
sim.stdioBind(function() { // STDIN
                return document.getElementById("stdin").value;
              },
              function(s) { // STDOUT
                document.getElementById("stdout").scrollTop = document.getElementById("stdout").scrollHeight;
                document.getElementById("stdout").value += s + "\n";
                outputFunction("STDOUT", s);
              },
              function(s) { // STDERR
                document.getElementById("stderr").scrollTop = document.getElementById("stderr").scrollHeight;
                document.getElementById("stderr").value += s + "\n";
                outputFunction("STDERR", s);
              });

function outputFunction(type, msg){
  outHTML = document.getElementById("general_output");
  outHTML.scrollTop = outHTML.scrollHeight;
  outHTML.innerHTML += "[" + type + "]" + msg + "\n";
}

function loadParameters(){
  param = [];
  if(document.getElementById("gdb_switch").checked) param.push("--gdb");
  if(document.getElementById("newlib_switch").checked) param.push("--newlib");
  param.push("/working/" + document.getElementById("codeSelector").files[0].name);
  param.push("--isa");
  ISAs = "";
  if(document.getElementById("config_isaA").checked) ISAs += "a";
  if(document.getElementById("config_isaC").checked) ISAs += "c";
  if(document.getElementById("config_isaD").checked) ISAs += "d";
  if(document.getElementById("config_isaF").checked) ISAs += "f";
  if(document.getElementById("config_isaI").checked) ISAs += "i";
  if(document.getElementById("config_isaM").checked) ISAs += "m";
  if(document.getElementById("config_isaS").checked) ISAs += "s";
  if(document.getElementById("config_isaU").checked) ISAs += "u";
  param.push(ISAs);
  param = param.concat(document.getElementById("config_cmdline").value.trim().split(" ").filter(function (el) {
    return el != null;
  }));
  return param;
}

var sim_running = false;
document.getElementById("run_button").onclick = function(){
  if(sim_running){
    sim.stop();
    run_button.innerHTML = "Run";
    run_button.setAttribute("class", "btn btn-outline-success");
    sim_running = false;
  }else{
    sim_running = true;
    args = loadParameters();
    sim.setArgs(args);
    sim.run(); 
    run_button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Stop';
    run_button.setAttribute("class", "btn btn-danger");
  }
};

codeSelector.onchange = function(){
  if(codeSelector.files.length){
    label_codeSelector.innerHTML = codeSelector.files[0].name;
    run_button.setAttribute("class", "btn btn-outline-success");
  }else{
    run_button.setAttribute("class", "btn btn-outline-secondary");
    label_codeSelector.innerHTML = "Choose file";
  }
};

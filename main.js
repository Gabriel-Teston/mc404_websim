w = new Worker("simulator_worker.js");

w.onmessage = function(event) {
    console.log("w: " + event.data);
    // document.getElementById("result").innerHTML = event.data;
};


function loadFile(){
    w.postMessage({type: "code_load", code: document.getElementById("codeSelector").files});
}

function startSim(){
    w.postMessage({type: "start_sim"});
}

function restartSim(){
    w.terminate();
    w = new Worker("simulator_worker.js");
}

function debugTest(m){
    w.postMessage({type: "debugTest", msg: m});
}


var stdinBuffer = "12 23";

onmessage = function(e) {
    console.log('Message received from main script');
    console.log(e.data);

    switch(e.data.type){
        case "code_load":
            files = e.data.code;
            break;
        case "start_sim":
            importScripts("whisper.js");
            break;
        case "stdin":
            stdinBuffer = e.data.stdin;
            console.log("STDIN = " + stdinBuffer);
            break;
        case "webrtc":
            serverMessage(e.data.data);
            break;
        case "debugTest":
            debugTest(e.data.msg);
    }
};

function serverMessage(m){
    console.log("From server: ", m);
}

function getStdin (){
    if(stdinBuffer.length == 0){
        console.log("Empty STDIN: " + stdinBuffer);
        return null;
    }
    c = stdinBuffer.charCodeAt(0);
    stdinBuffer = stdinBuffer.slice(1);
    return c;
}

function initFS() {
    FS.init(getStdin, null, null);
    FS.mkdir('/working');
    FS.mount(WORKERFS, {
    files: files, // Array of File objects or FileList
    }, '/working');
    console.log(FS.stat("/working"));
}

function debugTest(m){
    sendDebugMsg(m);
    getDebugMsg();
}

var xhr = new XMLHttpRequest();
function getDebugMsg(){
    xhr.open("GET", "http://127.0.0.1:5689/gdbInput", false);  // synchronous request
    xhr.send(null);
    return xhr.responseText;
}

var xhrS = new XMLHttpRequest();
function sendDebugMsg(msg){
    xhrS.open("POST", "http://127.0.0.1:5689/gdbInput", false);  // synchronous request
    xhrS.send(msg);
}

var Module = {
    // arguments : ["--version"],
    arguments : ["--newlib", "/working/ex2", "--gdb", "--isa", "acdfimsu", "--setreg", "sp=0x10000"],
    preRun : [initFS],
    print : function (text) {postMessage(text);},
    printErr : function (text) {postMessage("[ERR] " + text);}
};
"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

log("MBOMGeneration has loaded!");
var executionMode = "direct";
document.addEventListener("mbomGeneralLoaded", function (elem) {
  $(document.body).addClass("page-MBOMGeneration");
  var blocklyArea = document.getElementById('blocklyArea');
  var blocklyDiv = document.getElementById('blocklyDiv'); // Initialize Blockly on the page:

  initBlockly();

  function initBlockly() {
    var toolbox = new DOMParser().parseFromString(toolboxConfig, "text/html"); // Inject Blockly:

    var workspace = Blockly.inject(blocklyDiv, {
      toolbox: toolbox.getElementById("toolbox")
    }); // Make Blockly resizable:

    function onresize(blocklyArea, blocklyDiv) {
      // Compute the absolute coordinates and dimensions of blocklyArea.
      var element = blocklyArea;
      var x = 0;
      var y = 0;

      do {
        x += element.offsetLeft;
        y += element.offsetTop;
        element = element.offsetParent;
      } while (element); // Position blocklyDiv over blocklyArea.


      blocklyDiv.style.left = x + 'px';
      blocklyDiv.style.top = y + 'px';
      blocklyDiv.style.width = blocklyArea.offsetWidth + 'px';
      blocklyDiv.style.height = blocklyArea.offsetHeight + 'px';
      Blockly.svgResize(workspace);
    }

    ;
    window.addEventListener('resize', function () {
      onresize(blocklyArea, blocklyDiv);
    }, false);
    onresize(blocklyArea, blocklyDiv);
    Blockly.svgResize(workspace); // Execution helpers:

    function checkQueue() {
      return getLogMessages().then(function (logMessages) {
        if (logMessages.length > 0) {
          var lastQueue = logMessages.reverse().find(function (logMessage) {
            return logMessage.msg.startsWith("[Q] ");
          });

          if (lastQueue) {
            var lastQueueTime = Date.parse(lastQueue.time);
            var lastQueueDuration = Number(lastQueue.msg.slice(4));
            var remainingQueueTime = lastQueueTime - Date.now() + lastQueueDuration * 1000 + 5000; // Plus 5s Buffer

            if (remainingQueueTime <= 0) return -1; // Plus 5s Buffer
            else return remainingQueueTime;
          } else return -1;
        } else return -1;
      });
    }

    function sendQueueMsg() {
      var xml = Blockly.Xml.workspaceToDom(workspace);
      var executionTime = Math.round(_toConsumableArray($(xml).find('field[name="wait_amount"]')).map(function (el) {
        return Number(el.textContent);
      }).reduce(function (sum, step) {
        return sum + step;
      }) * 100) / 100;
      fetch("https://digitaltwinservice.de/api/Database/SaveLogMessage?username=".concat(sessionStorage.username), {
        method: "POST",
        headers: {
          "X-API-KEY": api_key,
          "accept": "/",
          "Content-Type": "application/json"
        },
        body: "\"[Q] ".concat(executionTime, "\"")
      });
      fetch("https://digitaltwinservice.de/api/Database/SaveLogMessage?username=".concat(sessionStorage.username), {
        method: "POST",
        headers: {
          "X-API-KEY": api_key,
          "accept": "/",
          "Content-Type": "application/json"
        },
        body: "\"Executing new job from user <i style=color:#ffe2c6;>".concat(sessionStorage.username, "</i>! This will take aprox. ").concat(Number(executionTime) + 5, " seconds\"")
      });
    }

    function execCode() {
      var code = Blockly.JavaScript.workspaceToCode(workspace);
      eval("\n\t\t\t\tconst api_key = \"".concat(api_key, "\";\n\t\t\t\tfunction execBlock(endpoint, method) {\n\t\t\t\t\tif (executionMode === \"direct\") {\n\t\t\t\t\t\tif (method === \"POST\") {\n\t\t\t\t\t\t\t(async () => {\n\t\t\t\t\t\t\t\tconst url = \"https://digitaltwinservice.de/api/Database/\" + endpoint;\n\t\t\t\t\t\t\t\tconst response = await fetch(url, {\n\t\t\t\t\t\t\t\t\tmethod: \"POST\",\n\t\t\t\t\t\t\t\t\theaders: {\n\t\t\t\t\t\t\t\t\t\t\"X-API-KEY\": api_key,\n\t\t\t\t\t\t\t\t\t\t\"accept\": \"/\"\n\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t})\n\t\t\t\t\t\t\t\t.then(resp => resp.status);\n\t\t\t\t\t\t\t\tconsole.log(\"%cResponse status: \" + response, \"background:#5C4084bb;color:white;padding:1px 4px 1px 16px;border-radius:2px;\");\n\t\t\t\t\t\t\t\treturn response;\n\t\t\t\t\t\t\t})()\n\t\t\t\t\t\t} else if (method === \"GET\") {\n\t\t\t\t\t\t\t(async () => {\n\t\t\t\t\t\t\t\tconst url = \"https://digitaltwinservice.de/api/PLCDistribute/\" + endpoint;\n\t\t\t\t\t\t\t\tconst response = await fetch(url, {\n\t\t\t\t\t\t\t\t\tmethod: \"GET\",\n\t\t\t\t\t\t\t\t\theaders: {\n\t\t\t\t\t\t\t\t\t\t\"X-API-KEY\": api_key,\n\t\t\t\t\t\t\t\t\t\t\"accept\": \"/\",\n\t\t\t\t\t\t\t\t\t\t\"Content-Type\": \"application/json\"\n\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t})\n\t\t\t\t\t\t\t\t.then(resp => resp.json());\n\t\t\t\t\t\t\t\tlog(\"parsed response:\");\n\t\t\t\t\t\t\t\tconsole.log(response);\n\t\t\t\t\t\t\t\treturn response;\n\t\t\t\t\t\t\t})()\n\t\t\t\t\t\t}\n\t\t\t\t\t} else if (executionMode === \"virtual\") {\n\t\t\t\t\t\tconsole.log(\"%c--->  ToDo: Insert code to talk to the AR environment here  <---\", \"background:#6D2B26;color:white;\");\n\t\t\t\t\t}\n\n\t\t\t\t}\n\t\t\t\t(async () => {\n\t\t\t\t\tconsole.log(\"%cStarting code execution...\", \"background:#5C4084;color:white;padding:10px 16px;border-radius:2px;\");\n\t\t\t\t\t").concat(code, "\n\t\t\t\t\tconsole.log(\"%cFinished code execution!\", \"background:#5C4084;color:white;padding:10px 16px;border-radius:2px;\");\n\t\t\t\t})().catch(err => {\n\t\t\t\t\tconsole.error(err);\n\t\t\t\t});\n\t\t\t"));
    } // Button functionality:


    var btnShow = document.getElementById("show-code");

    if (btnShow) {
      btnShow.addEventListener("click", function () {
        var code = Blockly.JavaScript.workspaceToCode(workspace);
        alertify.alert("Code", code);
      });
    }

    var btnExec = document.getElementById("exec-code");

    if (btnExec) {
      btnExec.addEventListener("click", function _callee() {
        var remainingQueueTime;
        return regeneratorRuntime.async(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return regeneratorRuntime.awrap(checkQueue());

              case 2:
                remainingQueueTime = _context.sent;

                if (remainingQueueTime === -1) {
                  sendQueueMsg();
                  execCode();
                  alertify.alert("Success", "Order was sucessfully send!<br>It will take a couple of seconds to see this in the stream.");
                } else {
                  alertify.alert("Please wait", "Somebody else is currently using this maschine.<br>Please wait for ".concat(Math.floor(remainingQueueTime / 1000) + 2, " seconds and then try again."));
                }

              case 4:
              case "end":
                return _context.stop();
            }
          }
        });
      });
    }

    var btnSave = document.getElementById("save-code");

    if (btnSave) {
      btnSave.addEventListener("click", function () {
        if (typeof Storage !== "undefined") {
          var xml = Blockly.Xml.workspaceToDom(workspace);
          var username = sessionStorage.getItem('username');
          log("Saving workspace...");

          (function _callee2() {
            var url, response;
            return regeneratorRuntime.async(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    url = "https://digitaltwinservice.de/api/Database/CreateProcedures?username=".concat(username);
                    _context2.next = 3;
                    return regeneratorRuntime.awrap(fetch(url, {
                      method: "POST",
                      headers: {
                        "X-API-KEY": api_key,
                        "Content-Type": "application/json",
                        "accept": "/"
                      },
                      body: "\"" + esc(esc(JSON.stringify([{
                        "name": "Last saved workspace",
                        "time": Date.now(),
                        "workspace": Blockly.Xml.domToText(xml)
                      }]))) + "\""
                    }).then(function (resp) {
                      return resp.status;
                    }));

                  case 3:
                    response = _context2.sent;
                    log("Save response status: ".concat(response));

                  case 5:
                  case "end":
                    return _context2.stop();
                }
              }
            });
          })();
        } else {
          alertify.alert("Not supported", "Your Browser does not support saving data! (No web storage support)");
        }
      });
    }

    var btnRestore = document.getElementById("restore-code");

    if (btnRestore) {
      btnRestore.addEventListener("click", function () {
        var code = Blockly.JavaScript.workspaceToCode(workspace);

        if (typeof Storage !== "undefined") {
          var username = sessionStorage.getItem('username');

          if (username) {
            (function _callee3() {
              var url, hasSavedWorkspace, response, parsedResponse, xmlWorkspace, xml;
              return regeneratorRuntime.async(function _callee3$(_context3) {
                while (1) {
                  switch (_context3.prev = _context3.next) {
                    case 0:
                      url = "https://digitaltwinservice.de/api/Database/LoadProcedure?username=".concat(username);
                      console.log("Username", username);
                      hasSavedWorkspace = true;
                      _context3.next = 5;
                      return regeneratorRuntime.awrap(fetch(url, {
                        method: "GET",
                        headers: {
                          "X-API-KEY": api_key,
                          "accept": "/"
                        }
                      }).then(function (resp) {
                        if (resp.status === 400) hasSavedWorkspace = false;
                        return resp;
                      }).then(function (resp) {
                        return resp.text();
                      }));

                    case 5:
                      response = _context3.sent;
                      log("Restore response: ".concat(response));

                      if (hasSavedWorkspace) {
                        parsedResponse = JSON.parse(unesc(unesc(response)));
                        xmlWorkspace = parsedResponse[0].workspace;
                        xml = Blockly.Xml.textToDom(xmlWorkspace);
                        log("Clearing workspace...");
                        workspace.clear();
                        log("Restoring workspace...");
                        Blockly.Xml.domToWorkspace(xml, workspace);
                      } else {
                        alertify.alert("No workspaces", "You don't have any saved workspaces yet.");
                      }

                    case 8:
                    case "end":
                      return _context3.stop();
                  }
                }
              });
            })();
          } else {
            alertify.alert("Not logged in", "You are not logged in correctly. Please try to log out and back in and then try again.");
          }
        } else {
          alertify.alert("Not supported", "Your Browser does not support saving data! (No web storage support)");
        }
      });
    }
  }
  /* ====================  Event Log:  ==================== */


  $('#fMBOM_G_box1').html("\n\t\t<h4 class=\"text-center\">Event Log</h4>\n\t\t<div id=\"mbom-event-log\"></div>\n\t");

  function getLogMessages() {
    return fetch("".concat(apiUrl, "GetLogMessages"), fetchOptions).then(function (resp) {
      return resp.json();
    }).then(function (resp) {
      var logMessages = [];

      for (var i = 0; i < resp.length; i = i + 4) {
        logMessages[i / 4] = {
          time: resp[i],
          id: resp[i + 1],
          user: resp[i + 2],
          msg: resp[i + 3]
        };
      }

      return logMessages;
    });
  }

  var lastLogMsgId = 0;

  function loadLog() {
    getLogMessages().then(function (logMessages) {
      logMessages = logMessages.filter(function (msg) {
        return msg.id > lastLogMsgId;
      });

      if (logMessages.length > 0) {
        for (var i = 0; i < logMessages.length; i++) {
          if (!logMessages[i].msg.startsWith("[Q] ")) {
            $('#mbom-event-log').prepend("<div><row><i>".concat(logMessages[i].user, "</i><span>").concat(logMessages[i].time, "</span></row>").concat(logMessages[i].msg, "</div>"));
          } else {
            var lastQueueTime = Date.parse(logMessages[i].time);
            var lastQueueDuration = Number(logMessages[i].msg.slice(4));
            var remainingQueueTime = Math.floor((lastQueueTime - Date.now() + lastQueueDuration * 1000 + 7000) / 1000); // Plus 7s Buffer and floored

            console.log(remainingQueueTime);

            if (remainingQueueTime > 0) {
              $('#mbom-queue').prepend("<div><row><i>".concat(logMessages[i].user, "</i><span>").concat(logMessages[i].time, "</span></row><center><b>Remaining time:</b> <span class=\"mbom-timer\">").concat(remainingQueueTime, "</span> seconds</center></div>"));
            }
          }
        }

        lastLogMsgId = logMessages[logMessages.length - 1].id;
      }
    });
  }

  loadLog();
  setInterval(function () {
    loadLog(); // Tick down the timer:

    $(".mbom-timer").each(function (i, timer) {
      var newTime = Number(timer.textContent) - 1;
      if (newTime > 0) $(timer).text(newTime);else $(timer).parent().parent().remove();
    });
  }, 1000);
  /* ====================  Queue:  ==================== */

  $('#fMBOM_G_box2').html("\n\t\t<h4 class=\"text-center\">Queue</h4>\n\t\t<div id=\"mbom-queue\"></div>\n\t");
});
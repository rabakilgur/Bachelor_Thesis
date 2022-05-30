"use strict";

log("MBOMGeneration has loaded!");
var executionMode = "direct";
document.addEventListener("mbomGeneralLoaded", function (elem) {
  $(document.body).addClass("page-MBOMGeneration page-MBOMEx page-MBOMExCon");
  var blocklyArea = document.getElementById('blocklyArea');
  var blocklyDiv = document.getElementById('blocklyDiv'); // Initialize Blockly on the page:

  $('#target-tab-link6').on("click", function () {
    initBlockly();
  });

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
    Blockly.svgResize(workspace); // Button functionality:

    var btnShow = document.getElementById("show-code");

    if (btnShow) {
      btnShow.addEventListener("click", function () {
        var code = Blockly.JavaScript.workspaceToCode(workspace);
        window.alert(code);
      });
    }

    var btnExec = document.getElementById("exec-code");

    if (btnExec) {
      btnExec.addEventListener("click", function () {
        var code = Blockly.JavaScript.workspaceToCode(workspace);
        eval("\n\t\t\t\t\tconst api_key = \"".concat(api_key, "\";\n\t\t\t\t\tfunction execBlock(endpoint, method) {\n\t\t\t\t\t\tif (executionMode === \"direct\") {\n\t\t\t\t\t\t\tif (method === \"POST\") {\n\t\t\t\t\t\t\t\t(async () => {\n\t\t\t\t\t\t\t\t\tconst url = \"https://digitaltwinservice.de/api/Database/\" + endpoint;\n\t\t\t\t\t\t\t\t\tconst response = await fetch(url, {\n\t\t\t\t\t\t\t\t\t\tmethod: \"POST\",\n\t\t\t\t\t\t\t\t\t\theaders: {\n\t\t\t\t\t\t\t\t\t\t\t\"X-API-KEY\": api_key,\n\t\t\t\t\t\t\t\t\t\t\t\"accept\": \"/\"\n\t\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t\t})\n\t\t\t\t\t\t\t\t\t.then(resp => resp.status);\n\t\t\t\t\t\t\t\t\tconsole.log(\"%cResponse status: \" + response, \"background:#5C4084bb;color:white;padding:1px 4px 1px 16px;border-radius:2px;\");\n\t\t\t\t\t\t\t\t\treturn response;\n\t\t\t\t\t\t\t\t})()\n\t\t\t\t\t\t\t} else if (method === \"GET\") {\n\t\t\t\t\t\t\t\t(async () => {\n\t\t\t\t\t\t\t\t\tconst url = \"https://digitaltwinservice.de/api/PLCDistribute/\" + endpoint;\n\t\t\t\t\t\t\t\t\tconst response = await fetch(url, {\n\t\t\t\t\t\t\t\t\t\tmethod: \"GET\",\n\t\t\t\t\t\t\t\t\t\theaders: {\n\t\t\t\t\t\t\t\t\t\t\t\"X-API-KEY\": api_key,\n\t\t\t\t\t\t\t\t\t\t\t\"accept\": \"/\",\n\t\t\t\t\t\t\t\t\t\t\t\"Content-Type\": \"application/json\"\n\t\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t\t})\n\t\t\t\t\t\t\t\t\t.then(resp => resp.json());\n\t\t\t\t\t\t\t\t\tlog(\"parsed response:\");\n\t\t\t\t\t\t\t\t\tconsole.log(response);\n\t\t\t\t\t\t\t\t\treturn response;\n\t\t\t\t\t\t\t\t})()\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t} else if (executionMode === \"virtual\") {\n\t\t\t\t\t\t\tconsole.log(\"%c--->  ToDo: Insert code to talk to the AR environment here  <---\", \"background:#6D2B26;color:white;\");\n\t\t\t\t\t\t}\n\n\t\t\t\t\t}\n\t\t\t\t\t(async () => {\n\t\t\t\t\t\tconsole.log(\"%cStarting code execution...\", \"background:#5C4084;color:white;padding:10px 16px;border-radius:2px;\");\n\t\t\t\t\t\t").concat(code, "\n\t\t\t\t\t\tconsole.log(\"%cFinished code execution!\", \"background:#5C4084;color:white;padding:10px 16px;border-radius:2px;\");\n\t\t\t\t\t})().catch(err => {\n\t\t\t\t\t\tconsole.error(err);\n\t\t\t\t\t});\n\t\t\t\t"));
      });
    }

    var btnSave = document.getElementById("save-code");

    if (btnSave) {
      btnSave.addEventListener("click", function () {
        if (typeof Storage !== "undefined") {
          var xml = Blockly.Xml.workspaceToDom(workspace);
          var username = sessionStorage.getItem('username');
          log("Saving workspace...");

          (function _callee() {
            var url, response;
            return regeneratorRuntime.async(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    url = "https://digitaltwinservice.de/api/Database/CreateProcedures?username=".concat(username);
                    _context.next = 3;
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
                    response = _context.sent;
                    log("Save response status: ".concat(response));

                  case 5:
                  case "end":
                    return _context.stop();
                }
              }
            });
          })();
        } else {
          alert("Your Browser does not support saving data! (No web storage support)");
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
            (function _callee2() {
              var url, hasSavedWorkspace, response, parsedResponse, xmlWorkspace, xml;
              return regeneratorRuntime.async(function _callee2$(_context2) {
                while (1) {
                  switch (_context2.prev = _context2.next) {
                    case 0:
                      url = "https://digitaltwinservice.de/api/Database/LoadProcedure?username=".concat(username);
                      console.log("Username", username);
                      hasSavedWorkspace = true;
                      _context2.next = 5;
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
                      response = _context2.sent;
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
                        alert("You don't have any saved workspaces yet.");
                      }

                    case 8:
                    case "end":
                      return _context2.stop();
                  }
                }
              });
            })();
          } else {
            alert("You are not logged in correctly. Please try to log out and back in and then try again.");
          }
        } else {
          alert("Your Browser does not support saving data! (No web storage support)");
        }
      });
    }
  }
  /* ====================  Event Log:  ==================== */


  $('#fMBOM_G_box1').html("\n\t\t<h4 class=\"text-center\">Event Log</h4>\n\t\t<div id=\"mbom-event-log\"></div>\n\t");
  var lastLogMsgId = 0;

  function loadLog() {
    fetch("".concat(apiUrl, "GetLogMessages"), fetchOptions).then(function (resp) {
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

      return logMessages.filter(function (msg) {
        return msg.id > lastLogMsgId;
      });
    }).then(function (logMessages) {
      if (logMessages.length > 0) {
        for (var i = 0; i < logMessages.length; i++) {
          $('#mbom-event-log').prepend("<div><row><i>".concat(logMessages[i].user, "</i><span>").concat(logMessages[i].time, "</span></row>").concat(logMessages[i].msg, "</div>"));
        }

        lastLogMsgId = logMessages[logMessages.length - 1].id;
      }
    });
  }

  loadLog();
  setInterval(function () {
    return loadLog();
  }, 1000);
  /* ====================  Queue:  ==================== */

  $('#fMBOM_G_box2').html("\n\t\t<h4 class=\"text-center\">Queue</h4>\n\t\t<div style=\"text-align: center; border: 1px solid #00000044; background: #00000022; color: #ffffff66; padding: 119px 0\">Work in progress...</div>\n\t");
});
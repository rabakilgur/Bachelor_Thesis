"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

log("MBOMOverview has loaded!");
document.addEventListener("mbomGeneralLoaded", function (elem) {
  $(document.body).addClass("page-MBOMOverview");
  $('#fMBOM_O_box2').html("\n\t\t<h4 style=\"text-align:center\">MBOM Analysis</h4>\n\t\t<div style=\"text-align:center\"><i>Please load a MBOM to view and analyze it</i></div>\n\t");
  fetch("".concat(apiUrl, "LoadAllProceduresAsArray"), fetchOptions).then(function (resp) {
    return resp.json();
  }).then(function (resp) {
    var workspaces = [];

    for (var i = 0; i < resp.length; i = i + 2) {
      workspaces[i / 2] = {
        user: resp[i],
        workspace: resp[i + 1]
      };
    }

    return workspaces;
  }).then(function (workspaces) {
    var users = "";

    for (var i = 0; i < workspaces.length; i++) {
      users += "<li>".concat(workspaces[i].user, "</li>");
    }

    $('#fMBOM_O_box1').html("\n\t\t\t\t<h4>Select MBOM to load:</h4>\n\t\t\t\t<div class=\"mbom-dropdown\">\n\t\t\t\t\t<a href=\"#\" class=\"mbom-dropdown-link\">Select a user</a>\n\t\t\t\t\t<ul class=\"mbom-dropdown-list\">".concat(users, "</ul>\n\t\t\t\t</div>\n\t\t\t"));
    window.userWorkspaces = workspaces; // Initialize Blockly on the page:

    initBlockly();
  });
  var blocklyArea = document.getElementById('blocklyArea');
  $(document.body).append('<div id="blocklyDiv"></div>');
  var blocklyDiv = document.getElementById('blocklyDiv');

  function initBlockly() {
    var toolbox = new DOMParser().parseFromString("<xml xmlns=\"https://developers.google.com/blockly/xml\" id=\"toolbox\" style=\"display: none\"><category name=\"\"></category></xml>", "text/html");
    window.toolbox = toolbox; // Inject Blockly:

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
    Blockly.svgResize(workspace);

    function loadMbom(username) {
      var code = Blockly.JavaScript.workspaceToCode(workspace);
      var userWorkspace = window.userWorkspaces.find(function (ws) {
        return ws.user === username;
      });

      if (userWorkspace !== undefined) {
        var parsedResponse = JSON.parse(unesc(unesc(userWorkspace.workspace)));
        var xmlWorkspace = parsedResponse[0].workspace;
        var xml = Blockly.Xml.textToDom(xmlWorkspace);
        log("Clearing workspace...");
        workspace.clear();
        log("Restoring workspace...");
        Blockly.Xml.domToWorkspace(xml, workspace);
        analyzeMbom(xml);
      } else {
        alert("This user doesn't have any saved workspaces yet.");
      }
    }

    function analyzeMbom(xml) {
      window.xml = xml;

      var allUsedActuatorsRaw = _toConsumableArray($(xml).find('block')).map(function (el) {
        return dic(el.getAttribute("type"));
      }).filter(function (el) {
        return el !== "instruction_wait";
      });

      var usedActuators = _toConsumableArray(new Set(_toConsumableArray($(xml).find('block')).map(function (el) {
        return dic(el.getAttribute("type").substring(0, el.getAttribute("type").indexOf("__")));
      }).filter(function (el) {
        return el !== "";
      })));

      window.allUsedActuatorsRaw = allUsedActuatorsRaw;
      window.usedActuators = usedActuators;
      var mbomAnalysis = {
        executionTime: Math.round(_toConsumableArray($(xml).find('field[name="wait_amount"]')).map(function (el) {
          return Number(el.textContent);
        }).reduce(function (sum, step) {
          return sum + step;
        }) * 100) / 100,
        usedActuators: usedActuators,
        usedResources: [{
          name: "cup",
          amount: allUsedActuatorsRaw.filter(function (el) {
            return el === "PLC_Distribute_ExtendSlide__ON";
          }).length
        }, {
          name: "lid",
          amount: 0
        }],
        nbrOfGroups: $(xml).children('block').length,
        nbrOfBlocks: $(xml).find('block').length
      };
      $('#fMBOM_O_box2').html("\n\t\t\t\t<h4 style=\"text-align:center\">MBOM Analysis</h4>\n\t\t\t\t<table class=\"fMBOM_O_table\">\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<th>Est. execution time</th>\n\t\t\t\t\t\t<td>".concat(mbomAnalysis.executionTime, " seconds</td>\n\t\t\t\t\t</tr>\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<th># of used actuators</th>\n\t\t\t\t\t\t<td>").concat(mbomAnalysis.usedActuators.length, "</td>\n\t\t\t\t\t</tr>\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<th>Used actuators</th>\n\t\t\t\t\t\t<td><ul>").concat(mbomAnalysis.usedActuators.reduce(function (total, step) {
        return total + "<li>" + step + "</li>";
      }, ""), "</ul></td>\n\t\t\t\t\t</tr>\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<th>Used resources</th>\n\t\t\t\t\t\t<td><ul>").concat(mbomAnalysis.usedResources.reduce(function (total, step) {
        return total + "<li><b>".concat(step.name, ":</b> ").concat(step.amount, "</li>");
      }, ""), "</ul></td>\n\t\t\t\t\t</tr>\n\t\t\t\t</table>\n\n\t\t\t\t<h5 style=\"text-align:center\">Additional Analysis</h5>\n\t\t\t\t<table class=\"fMBOM_O_table\">\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<th># of groups</th>\n\t\t\t\t\t\t<td>").concat(mbomAnalysis.nbrOfGroups, "</td>\n\t\t\t\t\t</tr>\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<th># of blocks</th>\n\t\t\t\t\t\t<td>").concat(mbomAnalysis.nbrOfBlocks, "</td>\n\t\t\t\t\t</tr>\n\t\t\t\t</table>\n\t\t\t"));
    }

    var $list = $('.mbom-dropdown-list');
    var $link = $('.mbom-dropdown-link');
    $link.on("click", function (e) {
      e.preventDefault();
      $list.slideToggle(120);
    });
    $list.find('li').on("click", function () {
      var username = $(this).text();
      $link.text(username);
      $list.slideToggle(120);
      loadMbom(username);
    });
  }
}, false);
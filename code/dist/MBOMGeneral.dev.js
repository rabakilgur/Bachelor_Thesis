"use strict";

function log(msg) {
  console.log("%c".concat(msg), "background:#0077EE;color:white;padding:1px 4px;border-radius:2px;");
}

log("MBOMGeneral has loaded!"); // Load additional files:

setTimeout(function () {
  $(document.head).append("\n\t\t<script src=\"//cdn.jsdelivr.net/npm/alertifyjs@1.13.1/build/alertify.min.js\"></script>\n\t\t<link rel=\"stylesheet\" href=\"//cdn.jsdelivr.net/npm/alertifyjs@1.13.1/build/css/alertify.min.css\"/>\n\t\t<link rel=\"stylesheet\" href=\"//cdn.jsdelivr.net/npm/alertifyjs@1.13.1/build/css/themes/default.min.css\"/>\n\t");
}, 0); // const api_key = "2b56f658-b11f-4067-9537-631bf27a30f0";

var api_key = sessionStorage.getItem('apiKey').substring(1, sessionStorage.getItem('apiKey').length - 1);
var apiKey2 = {
  // For the charts
  value: api_key
}; // Define custom blocks:

var blocklyBlocks = [{
  "type": "instruction_wait",
  "message0": "Wait for %1 seconds",
  "args0": [{
    "type": "field_number",
    "name": "wait_amount",
    "value": 1,
    "min": 0,
    "max": 600,
    "precision": 0.1
  }],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 65,
  "tooltip": "",
  "helpUrl": ""
}, {
  "type": "instruction_log",
  "message0": "Log to browser console %1",
  "args0": [{
    "type": "input_value",
    "name": "logged_thing"
  }],
  "inputsInline": false,
  "previousStatement": null,
  "nextStatement": null,
  "colour": 45,
  "tooltip": "",
  "helpUrl": ""
}]; // Define custom block generators:

Blockly.JavaScript['instruction_wait'] = function (block) {
  var number_wait_amount = block.getFieldValue('wait_amount');
  var code = "await new Promise(resolve => setTimeout(resolve, ".concat(Number(number_wait_amount) * 1000, "));\n");
  return code;
};

Blockly.JavaScript['instruction_log'] = function (block) {
  var value_logged_thing = Blockly.JavaScript.valueToCode(block, 'logged_thing', Blockly.JavaScript.ORDER_ATOMIC);
  var code = "console.log(\"Blockly:\", ".concat(value_logged_thing, ");\n");
  return code;
};

var dictionary = {
  // PLCs:
  "PlcDistribute": "Distribution",
  "PlcEnergy": "Energy",
  "PlcJoin": "Joining",
  "PlcSort": "Sorting",
  // ---------------------------------
  // Hotwire:
  "Function_DB": "DB Function",
  // PlcDistribute:
  "PLC_Distribute_ExtendSlide": "Distribution Slide",
  "PLC_Distribute_ConveyerForward": "Distribution Conveyer",
  "PLC_Distribute_ExtendSeperator": "Distribution Seperator",
  // PlcEnergy:
  // - nothing here yet -
  // PlcJoin:
  "PLC_Join_ExtendSlide": "Joining Slide (Extend)",
  "PLC_Join_RetractSlide": "Joining Slide (Retract)",
  "PLC_Join_SuctionCupDownwards": "Joining Suction Cup",
  "PLC_Join_VacuumOn": "Joining Vacuum",
  "PLC_Join_ConvForwardG2": "Joining Conveyer",
  "PLC_Join_ExtendSeperator": "Joining Seperator",
  "PLC_Join_RetractGate": "Joining Retraction Gate",
  // PlcSort:
  "PLC_Sort_ConvForwardG2": "Sorting Conveyer"
};

function dic() {
  var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  return dictionary[text] || text;
}

function generateUUID() {
  var S4 = function S4() {
    return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
  };

  return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
}

function esc(s) {
  return ('' + s).replace(/\\/g, '\\\\').replace(/"/g, '§$%&');
}

function unesc(s) {
  s = ('' + s).replace(/\§\$\%\&/g, '"');
  return s.replace(/\\\\/g, '\\');
}

var toolboxConfig = "\n\t<xml xmlns=\"https://developers.google.com/blockly/xml\" id=\"toolbox\" style=\"display: none\">\n\t\t<category name=\"General\">\n\t\t\t<block type=\"math_number\"></block>\n\t\t\t<block type=\"text\"></block>\n\t\t\t<block type=\"instruction_wait\"></block>\n\t\t\t<block type=\"instruction_log\"></block>\n\t\t</category>\n\t\t<category name=\"Logic\">\n\t\t\t<block type=\"controls_if\"></block>\n\t\t\t<block type=\"controls_repeat_ext\"></block>\n\t\t\t<block type=\"logic_compare\"></block>\n\t\t\t<block type=\"math_arithmetic\"></block>\n\t\t</category>\n";
var apiUrl = "https://digitaltwinservice.de/api/Database/";
var fetchOptions = {
  method: "GET",
  headers: {
    "X-API-KEY": api_key,
    "accept": "/",
    "Content-Type": "application/json"
  }
};
document.addEventListener("DOMContentLoaded", function () {
  // Build Toolbox:
  fetch("".concat(apiUrl, "GetPlcs"), fetchOptions).then(function (resp) {
    return resp.json();
  }).then(function (plcs) {
    log("All PLCs: " + plcs);
    var promises = [];
    var categories = [];

    var _loop = function _loop(i) {
      var plc = plcs[i];
      promises[i] = fetch("".concat(apiUrl, "GetNodeNames?plcName=").concat(plc, "&onlyShowSettable=true"), fetchOptions).then(function (resp) {
        return resp.json();
      }).then(function (plcNodes) {
        return categories[i] = {
          plc: plc,
          nodes: plcNodes
        };
      });
    };

    for (var i in plcs) {
      _loop(i);
    }

    Promise.allSettled(promises).then(function (results) {
      log("Fulfillment states of all requests:");
      results.forEach(function (result) {
        return log(result.status);
      });
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = categories[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var category = _step.value;

          if (category && category.nodes.length > 0) {
            // Double check if the category is valid (malformed database entry have occured multiple times!)
            toolboxConfig += "<category name=\"".concat(dic(category.plc), "\" d-plc=\"").concat(category.plc, "\">\n");
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              var _loop2 = function _loop2() {
                var node = _step2.value;
                // Add enable/disable block definitions:
                blocklyBlocks.push({
                  "type": "".concat(node, "__ON"),
                  "message0": "Activate ".concat(dic(node)),
                  "previousStatement": null,
                  "nextStatement": null,
                  "colour": 120,
                  "tooltip": "",
                  "helpUrl": ""
                });
                blocklyBlocks.push({
                  "type": "".concat(node, "__OFF"),
                  "message0": "Deactivate ".concat(dic(node)),
                  "previousStatement": null,
                  "nextStatement": null,
                  "colour": 0,
                  "tooltip": "",
                  "helpUrl": ""
                }); // Add enable/disable block generators:

                Blockly.JavaScript["".concat(node, "__ON")] = function (block) {
                  var code = "execBlock(\"SetValue?NodeName=".concat(node, "&value=true\", \"POST\");\n");
                  return code;
                };

                Blockly.JavaScript["".concat(node, "__OFF")] = function (block) {
                  var code = "execBlock(\"SetValue?NodeName=".concat(node, "&value=false\", \"POST\");\n");
                  return code;
                }; // Add enable/disable Blocks to the toolbar:


                toolboxConfig += "\t<block type=\"".concat(node, "__ON\"></block>\n");
                toolboxConfig += "\t<block type=\"".concat(node, "__OFF\"></block>\n");
              };

              for (var _iterator2 = category.nodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                _loop2();
              }
            } catch (err) {
              _didIteratorError2 = true;
              _iteratorError2 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
                  _iterator2["return"]();
                }
              } finally {
                if (_didIteratorError2) {
                  throw _iteratorError2;
                }
              }
            }

            toolboxConfig += "</category>\n";
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      toolboxConfig += "</xml>"; // Define custom Blockly blocks:

      Blockly.defineBlocksWithJsonArray(blocklyBlocks); // Signal that the setup is complete:

      document.dispatchEvent(new CustomEvent("mbomGeneralLoaded"));
    });
  });
});
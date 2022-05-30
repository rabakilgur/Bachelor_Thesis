function log(msg) {
	console.log(`%c${msg}`, "background:#0077EE;color:white;padding:1px 4px;border-radius:2px;");
}

log("MBOMGeneral has loaded!");


// Load additional files:
setTimeout(() => {
	$(document.head).append(`
		<script src="//cdn.jsdelivr.net/npm/alertifyjs@1.13.1/build/alertify.min.js"></script>
		<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/alertifyjs@1.13.1/build/css/alertify.min.css"/>
		<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/alertifyjs@1.13.1/build/css/themes/default.min.css"/>
	`);
}, 0);

// const api_key = "2b56f658-b11f-4067-9537-631bf27a30f0";
const api_key = sessionStorage.getItem('apiKey').substring(1, sessionStorage.getItem('apiKey').length - 1);
const apiKey2 = { // For the charts
	value: api_key
}

// Define custom blocks:
let blocklyBlocks = [
	{
		"type": "instruction_wait",
		"message0": "Wait for %1 seconds",
		"args0": [
			{
				"type": "field_number",
				"name": "wait_amount",
				"value": 1,
				"min": 0,
				"max": 600,
				"precision": 0.1
			}
		],
		"previousStatement": null,
		"nextStatement": null,
		"colour": 65,
		"tooltip": "",
		"helpUrl": ""
	},
	{
		"type": "instruction_log",
		"message0": "Log to browser console %1",
		"args0": [
			{
				"type": "input_value",
				"name": "logged_thing"
			}
		],
		"inputsInline": false,
		"previousStatement": null,
		"nextStatement": null,
		"colour": 45,
		"tooltip": "",
		"helpUrl": ""
	}
];

// Define custom block generators:
Blockly.JavaScript['instruction_wait'] = function(block) {
	var number_wait_amount = block.getFieldValue('wait_amount');
	var code = `await new Promise(resolve => setTimeout(resolve, ${Number(number_wait_amount) * 1000}));\n`;
	return code;
};
Blockly.JavaScript['instruction_log'] = function(block) {
	var value_logged_thing = Blockly.JavaScript.valueToCode(block, 'logged_thing', Blockly.JavaScript.ORDER_ATOMIC);
	var code = `console.log("Blockly:", ${value_logged_thing});\n`;
	return code;
};

const dictionary = {
	// PLCs:
	"PlcDistribute":	"Distribution",
	"PlcEnergy":		"Energy",
	"PlcJoin":			"Joining",
	"PlcSort":			"Sorting",
	// ---------------------------------
	// Hotwire:
	"Function_DB":	"DB Function",
	// PlcDistribute:
	"PLC_Distribute_ExtendSlide":		"Distribution Slide",
	"PLC_Distribute_ConveyerForward":	"Distribution Conveyer",
	"PLC_Distribute_ExtendSeperator":	"Distribution Seperator",
	// PlcEnergy:
	// - nothing here yet -
	// PlcJoin:
	"PLC_Join_ExtendSlide":			"Joining Slide (Extend)",
	"PLC_Join_RetractSlide":		"Joining Slide (Retract)",
	"PLC_Join_SuctionCupDownwards":	"Joining Suction Cup",
	"PLC_Join_VacuumOn":			"Joining Vacuum",
	"PLC_Join_ConvForwardG2":		"Joining Conveyer",
	"PLC_Join_ExtendSeperator":		"Joining Seperator",
	"PLC_Join_RetractGate":			"Joining Retraction Gate",
	// PlcSort:
	"PLC_Sort_ConvForwardG2":		"Sorting Conveyer"
};

function dic(text = "") {
	return dictionary[text] || text;
}

function generateUUID() {
	const S4 = () => (((1+Math.random())*0x10000)|0).toString(16).substring(1);
	return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}
function esc(s) {
	return ('' + s)
		.replace(/\\/g, '\\\\')
		.replace(/"/g, '§$%&');
}
function unesc(s) {
	s = ('' + s)
		.replace(/\§\$\%\&/g, '"');
	return s.replace(/\\\\/g, '\\');
}

let toolboxConfig = `
	<xml xmlns="https://developers.google.com/blockly/xml" id="toolbox" style="display: none">
		<category name="General">
			<block type="math_number"></block>
			<block type="text"></block>
			<block type="instruction_wait"></block>
			<block type="instruction_log"></block>
		</category>
		<category name="Logic">
			<block type="controls_if"></block>
			<block type="controls_repeat_ext"></block>
			<block type="logic_compare"></block>
			<block type="math_arithmetic"></block>
		</category>
`;

const apiUrl = "https://digitaltwinservice.de/api/Database/";
const fetchOptions = {
	method: "GET",
	headers: {
		"X-API-KEY": api_key,
		"accept": "/",
		"Content-Type": "application/json"
	}
};

document.addEventListener("DOMContentLoaded", () => {
	// Build Toolbox:
	fetch(`${apiUrl}GetPlcs`, fetchOptions)
		.then(resp => resp.json())
		.then(plcs => {
			log("All PLCs: " + plcs);
			let promises = [];
			let categories = [];
			for (const i in plcs) {
				let plc = plcs[i];
				promises[i] = fetch(`${apiUrl}GetNodeNames?plcName=${plc}&onlyShowSettable=true`, fetchOptions)
					.then(resp => resp.json())
					.then(plcNodes => categories[i] = { plc: plc, nodes: plcNodes });
			}
			Promise.allSettled(promises)
				.then(results => {
					log("Fulfillment states of all requests:");
					results.forEach((result) => log(result.status));
					for (const category of categories) {
						if (category && category.nodes.length > 0) { // Double check if the category is valid (malformed database entry have occured multiple times!)
							toolboxConfig += `<category name="${dic(category.plc)}" d-plc="${category.plc}">\n`;
							for (const node of category.nodes) {
								// Add enable/disable block definitions:
								blocklyBlocks.push({
									"type": `${node}__ON`,
									"message0": `Activate ${dic(node)}`,
									"previousStatement": null,
									"nextStatement": null,
									"colour": 120,
									"tooltip": "",
									"helpUrl": ""
								});
								blocklyBlocks.push({
									"type": `${node}__OFF`,
									"message0": `Deactivate ${dic(node)}`,
									"previousStatement": null,
									"nextStatement": null,
									"colour": 0,
									"tooltip": "",
									"helpUrl": ""
								});

								// Add enable/disable block generators:
								Blockly.JavaScript[`${node}__ON`] = function(block) {
									var code = `execBlock("SetValue?NodeName=${node}&value=true", "POST");\n`;
									return code;
								};
								Blockly.JavaScript[`${node}__OFF`] = function(block) {
									var code = `execBlock("SetValue?NodeName=${node}&value=false", "POST");\n`;
									return code;
								};

								// Add enable/disable Blocks to the toolbar:
								toolboxConfig += `\t<block type="${node}__ON"></block>\n`;
								toolboxConfig += `\t<block type="${node}__OFF"></block>\n`;
							}
							toolboxConfig += "</category>\n";
						}
					}
					toolboxConfig += "</xml>";

					// Define custom Blockly blocks:
					Blockly.defineBlocksWithJsonArray(blocklyBlocks);

					// Signal that the setup is complete:
					document.dispatchEvent(new CustomEvent("mbomGeneralLoaded"));
				});
		});

});

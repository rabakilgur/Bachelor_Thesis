log("MBOMOverview has loaded!");

document.addEventListener("mbomGeneralLoaded", (elem) => {
	$(document.body).addClass("page-MBOMOverview");

	$('#fMBOM_O_box2').html(`
		<h4 style="text-align:center">MBOM Analysis</h4>
		<div style="text-align:center"><i>Please load a MBOM to view and analyze it</i></div>
	`);

	fetch(`${apiUrl}LoadAllProceduresAsArray`, fetchOptions)
		.then(resp => resp.json())
		.then(resp => {
			let workspaces = [];
			for (let i = 0; i < resp.length; i = i + 2) {
				workspaces[i / 2] = {
					user: resp[i],
					workspace: resp[i + 1]
				}
			}
			return workspaces;
		})
		.then(workspaces => {
			let users = "";
			for (let i = 0; i < workspaces.length; i++) {
				users += `<li>${workspaces[i].user}</li>`;
			}
			$('#fMBOM_O_box1').html(`
				<h4>Select MBOM to load:</h4>
				<div class="mbom-dropdown">
					<a href="#" class="mbom-dropdown-link">Select a user</a>
					<ul class="mbom-dropdown-list">${users}</ul>
				</div>
			`);

			window.userWorkspaces = workspaces;

			// Initialize Blockly on the page:
			initBlockly();
		});


	const blocklyArea = document.getElementById('blocklyArea');
	$(document.body).append('<div id="blocklyDiv"></div>');
	const blocklyDiv = document.getElementById('blocklyDiv');

	function initBlockly() {
		const toolbox = new DOMParser().parseFromString(`<xml xmlns="https://developers.google.com/blockly/xml" id="toolbox" style="display: none"><category name=""></category></xml>`, "text/html");
		window.toolbox = toolbox;
		// Inject Blockly:
		const workspace = Blockly.inject(blocklyDiv, { toolbox: toolbox.getElementById("toolbox") });

		// Make Blockly resizable:
		function onresize(blocklyArea, blocklyDiv) {
			// Compute the absolute coordinates and dimensions of blocklyArea.
			let element = blocklyArea;
			let x = 0;
			let y = 0;
			do {
				x += element.offsetLeft;
				y += element.offsetTop;
				element = element.offsetParent;
			} while (element);
			// Position blocklyDiv over blocklyArea.
			blocklyDiv.style.left = x + 'px';
			blocklyDiv.style.top = y + 'px';
			blocklyDiv.style.width = blocklyArea.offsetWidth + 'px';
			blocklyDiv.style.height = blocklyArea.offsetHeight + 'px';
			Blockly.svgResize(workspace);
		};
		window.addEventListener('resize', () => {
			onresize(blocklyArea, blocklyDiv);
		}, false);
		onresize(blocklyArea, blocklyDiv);
		Blockly.svgResize(workspace);

		function loadMbom(username) {
			const code = Blockly.JavaScript.workspaceToCode(workspace);
			const userWorkspace = window.userWorkspaces.find(ws => ws.user === username);
			if (userWorkspace !== undefined) {
				const parsedResponse = JSON.parse(unesc(unesc(userWorkspace.workspace)));
				const xmlWorkspace = parsedResponse[0].workspace;
				const xml = Blockly.Xml.textToDom(xmlWorkspace);
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
			const allUsedActuatorsRaw = [...$(xml).find('block')]
					.map((el) => dic(el.getAttribute("type")))
					.filter((el) => el !== "instruction_wait");
			const usedActuators = [...new Set([...$(xml).find('block')]
					.map((el) => dic(el.getAttribute("type").substring(0, el.getAttribute("type").indexOf("__"))))
					.filter((el) => el !== ""))];
			window.allUsedActuatorsRaw = allUsedActuatorsRaw;
			window.usedActuators = usedActuators;
			const mbomAnalysis = {
				executionTime: Math.round([...$(xml).find('field[name="wait_amount"]')]
									.map((el) => Number(el.textContent))
									.reduce((sum, step) => sum + step)*100)/100,
				usedActuators: usedActuators,
				usedResources: [
					{
						name: "cup",
						amount: allUsedActuatorsRaw.filter((el) => el === "PLC_Distribute_ExtendSlide__ON").length
					},
					{
						name: "lid",
						amount: 0
					}
				],
				nbrOfGroups: $(xml).children('block').length,
				nbrOfBlocks: $(xml).find('block').length
			}
			$('#fMBOM_O_box2').html(`
				<h4 style="text-align:center">MBOM Analysis</h4>
				<table class="fMBOM_O_table">
					<tr>
						<th>Est. execution time</th>
						<td>${mbomAnalysis.executionTime} seconds</td>
					</tr>
					<tr>
						<th># of used actuators</th>
						<td>${mbomAnalysis.usedActuators.length}</td>
					</tr>
					<tr>
						<th>Used actuators</th>
						<td><ul>${mbomAnalysis.usedActuators.reduce((total, step) => total + "<li>"+step+"</li>", "")}</ul></td>
					</tr>
					<tr>
						<th>Used resources</th>
						<td><ul>${mbomAnalysis.usedResources.reduce((total, step) => total + `<li><b>${step.name}:</b> ${step.amount}</li>`, "")}</ul></td>
					</tr>
				</table>

				<h5 style="text-align:center">Additional Analysis</h5>
				<table class="fMBOM_O_table">
					<tr>
						<th># of groups</th>
						<td>${mbomAnalysis.nbrOfGroups}</td>
					</tr>
					<tr>
						<th># of blocks</th>
						<td>${mbomAnalysis.nbrOfBlocks}</td>
					</tr>
				</table>
			`);
		}

		const $list = $('.mbom-dropdown-list');
		const $link = $('.mbom-dropdown-link');
		$link.on("click", (e) => {
			e.preventDefault();
			$list.slideToggle(120);
		});
		$list.find('li').on("click", function() {
			const username = $(this).text();
			$link.text(username);
			$list.slideToggle(120);
			loadMbom(username);
		});
	}

}, false);

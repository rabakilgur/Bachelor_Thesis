log("MBOMGeneration has loaded!");

const executionMode = "direct";

document.addEventListener("mbomGeneralLoaded", (elem) => {
	$(document.body).addClass("page-MBOMGeneration page-MBOMEx page-MBOMExCon");

	const blocklyArea = document.getElementById('blocklyArea');
	const blocklyDiv = document.getElementById('blocklyDiv');


	// Initialize Blockly on the page:
	$('#target-tab-link6').on("click", () => { initBlockly(); });

	function initBlockly() {
		const toolbox = new DOMParser().parseFromString(toolboxConfig, "text/html");

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

		// Button functionality:
		const btnShow = document.getElementById("show-code");
		if (btnShow) {
			btnShow.addEventListener("click", () => {
				const code = Blockly.JavaScript.workspaceToCode(workspace);
				window.alert(code);
			});
		}
		const btnExec = document.getElementById("exec-code");
		if (btnExec) {
			btnExec.addEventListener("click", () => {
				const code = Blockly.JavaScript.workspaceToCode(workspace);
				eval(`
					const api_key = "${api_key}";
					function execBlock(endpoint, method) {
						if (executionMode === "direct") {
							if (method === "POST") {
								(async () => {
									const url = "https://digitaltwinservice.de/api/Database/" + endpoint;
									const response = await fetch(url, {
										method: "POST",
										headers: {
											"X-API-KEY": api_key,
											"accept": "/"
										}
									})
									.then(resp => resp.status);
									console.log("%cResponse status: " + response, "background:#5C4084bb;color:white;padding:1px 4px 1px 16px;border-radius:2px;");
									return response;
								})()
							} else if (method === "GET") {
								(async () => {
									const url = "https://digitaltwinservice.de/api/PLCDistribute/" + endpoint;
									const response = await fetch(url, {
										method: "GET",
										headers: {
											"X-API-KEY": api_key,
											"accept": "/",
											"Content-Type": "application/json"
										}
									})
									.then(resp => resp.json());
									log("parsed response:");
									console.log(response);
									return response;
								})()
							}
						} else if (executionMode === "virtual") {
							console.log("%c--->  ToDo: Insert code to talk to the AR environment here  <---", "background:#6D2B26;color:white;");
						}

					}
					(async () => {
						console.log("%cStarting code execution...", "background:#5C4084;color:white;padding:10px 16px;border-radius:2px;");
						${code}
						console.log("%cFinished code execution!", "background:#5C4084;color:white;padding:10px 16px;border-radius:2px;");
					})().catch(err => {
						console.error(err);
					});
				`);
			});
		}
		const btnSave = document.getElementById("save-code");
		if (btnSave) {
			btnSave.addEventListener("click", () => {
				if (typeof(Storage) !== "undefined") {
					const xml = Blockly.Xml.workspaceToDom(workspace);
					let username = sessionStorage.getItem('username');
					log("Saving workspace...");
					(async () => {
						const url = `https://digitaltwinservice.de/api/Database/CreateProcedures?username=${username}`;
						const response = await fetch(url, {
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
						})
						.then(resp => resp.status);
						log(`Save response status: ${response}`);
					})()
				} else {
					alert("Your Browser does not support saving data! (No web storage support)");
				}
			});
		}
		const btnRestore= document.getElementById("restore-code");
		if (btnRestore) {
			btnRestore.addEventListener("click", () => {
				const code = Blockly.JavaScript.workspaceToCode(workspace);
				if (typeof(Storage) !== "undefined") {
					const username = sessionStorage.getItem('username');
					if (username) {
						(async () => {
							const url = `https://digitaltwinservice.de/api/Database/LoadProcedure?username=${username}`;
							console.log("Username", username);
							let hasSavedWorkspace = true;
							const response = await fetch(url, {
								method: "GET",
								headers: {
									"X-API-KEY": api_key,
									"accept": "/"
								}
							})
							.then(resp => {
								if (resp.status === 400) hasSavedWorkspace = false;
								return resp;
							})
							.then(resp => resp.text());
							log(`Restore response: ${response}`);
							if (hasSavedWorkspace) {
								const parsedResponse = JSON.parse(unesc(unesc(response)));
								const xmlWorkspace = parsedResponse[0].workspace;
								const xml = Blockly.Xml.textToDom(xmlWorkspace);
								log("Clearing workspace...");
								workspace.clear();
								log("Restoring workspace...");
								Blockly.Xml.domToWorkspace(xml, workspace);
							} else {
								alert("You don't have any saved workspaces yet.");
							}
						})()
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

	$('#fMBOM_G_box1').html(`
		<h4 class="text-center">Event Log</h4>
		<div id="mbom-event-log"></div>
	`);

	let lastLogMsgId = 0;
	function loadLog() {
		fetch(`${apiUrl}GetLogMessages`, fetchOptions)
			.then(resp => resp.json())
			.then(resp => {
				let logMessages = [];
				for (let i = 0; i < resp.length; i = i + 4) {
					logMessages[i / 4] = {
						time: resp[i],
						id: resp[i+1],
						user: resp[i+2],
						msg: resp[i+3]
					}
				}
				return logMessages.filter(msg => msg.id > lastLogMsgId);
			})
			.then(logMessages => {
				if (logMessages.length > 0) {
					for (let i = 0; i < logMessages.length; i++) {
						$('#mbom-event-log').prepend(`<div><row><i>${logMessages[i].user}</i><span>${logMessages[i].time}</span></row>${logMessages[i].msg}</div>`);
					}
					lastLogMsgId = logMessages[logMessages.length - 1].id;
				}

			});
	}
	loadLog();
	setInterval(() => loadLog(), 1000);

	/* ====================  Queue:  ==================== */

	$('#fMBOM_G_box2').html(`
		<h4 class="text-center">Queue</h4>
		<div style="text-align: center; border: 1px solid #00000044; background: #00000022; color: #ffffff66; padding: 119px 0">Work in progress...</div>
	`);

});

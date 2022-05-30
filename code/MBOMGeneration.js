log("MBOMGeneration has loaded!");

const executionMode = "direct";

document.addEventListener("mbomGeneralLoaded", (elem) => {
	$(document.body).addClass("page-MBOMGeneration");

	const blocklyArea = document.getElementById('blocklyArea');
	const blocklyDiv = document.getElementById('blocklyDiv');


	// Initialize Blockly on the page:
	initBlockly();

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

		// Execution helpers:
		function checkQueue() {
			return getLogMessages().then(logMessages => {
				if (logMessages.length > 0) {
					const lastQueue = logMessages.reverse().find(logMessage => logMessage.msg.startsWith("[Q] "));
					if (lastQueue) {
						const lastQueueTime = Date.parse(lastQueue.time);
						const lastQueueDuration = Number(lastQueue.msg.slice(4));
						const remainingQueueTime = lastQueueTime - Date.now() + lastQueueDuration * 1000 + 5000; // Plus 5s Buffer
						if (remainingQueueTime <= 0) return -1; // Plus 5s Buffer
						else return remainingQueueTime;
					} else return -1;
				} else return -1;
			});
		}
		function sendQueueMsg() {
			const xml = Blockly.Xml.workspaceToDom(workspace);
			const executionTime = Math.round([...$(xml).find('field[name="wait_amount"]')]
								.map((el) => Number(el.textContent))
								.reduce((sum, step) => sum + step)*100)/100;
			fetch(`https://digitaltwinservice.de/api/Database/SaveLogMessage?username=${sessionStorage.username}`, {
				method: "POST",
				headers: {
					"X-API-KEY": api_key,
					"accept": "/",
					"Content-Type": "application/json"
				},
				body: `"[Q] ${executionTime}"`
			});
			fetch(`https://digitaltwinservice.de/api/Database/SaveLogMessage?username=${sessionStorage.username}`, {
				method: "POST",
				headers: {
					"X-API-KEY": api_key,
					"accept": "/",
					"Content-Type": "application/json"
				},
				body: `"Executing new job from user <i style=color:#ffe2c6;>${sessionStorage.username}</i>! This will take aprox. ${Number(executionTime) + 5} seconds"`
			});
		}
		function execCode() {
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
		}

		// Button functionality:
		const btnShow = document.getElementById("show-code");
		if (btnShow) {
			btnShow.addEventListener("click", () => {
				const code = Blockly.JavaScript.workspaceToCode(workspace);
				alertify.alert("Code", code);
			});
		}
		const btnExec = document.getElementById("exec-code");
		if (btnExec) {
			btnExec.addEventListener("click", async () => {
				const remainingQueueTime = await checkQueue();
				if (remainingQueueTime === -1) {
					sendQueueMsg();
					execCode();
					alertify.alert("Success", `Order was sucessfully send!<br>It will take a couple of seconds to see this in the stream.`);
				} else {
					alertify.alert("Please wait", `Somebody else is currently using this maschine.<br>Please wait for ${Math.floor(remainingQueueTime/1000)+2} seconds and then try again.`);
				}

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
					alertify.alert("Not supported", "Your Browser does not support saving data! (No web storage support)");
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
								alertify.alert("No workspaces", "You don't have any saved workspaces yet.");
							}
						})()
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

	$('#fMBOM_G_box1').html(`
		<h4 class="text-center">Event Log</h4>
		<div id="mbom-event-log"></div>
	`);

	function getLogMessages() {
		return fetch(`${apiUrl}GetLogMessages`, fetchOptions)
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
				return logMessages;
			});
	}
	let lastLogMsgId = 0;
	function loadLog() {
		getLogMessages().then(logMessages => {
			logMessages = logMessages.filter(msg => msg.id > lastLogMsgId);
			if (logMessages.length > 0) {
				for (let i = 0; i < logMessages.length; i++) {
					if (!logMessages[i].msg.startsWith("[Q] ")) {
						$('#mbom-event-log').prepend(`<div><row><i>${logMessages[i].user}</i><span>${logMessages[i].time}</span></row>${logMessages[i].msg}</div>`);
					} else {
						const lastQueueTime = Date.parse(logMessages[i].time);
						const lastQueueDuration = Number(logMessages[i].msg.slice(4));
						const remainingQueueTime = Math.floor((lastQueueTime - Date.now() + lastQueueDuration * 1000 + 7000) / 1000); // Plus 7s Buffer and floored
						console.log(remainingQueueTime);
						if (remainingQueueTime > 0) {
							$('#mbom-queue').prepend(`<div><row><i>${logMessages[i].user}</i><span>${logMessages[i].time}</span></row><center><b>Remaining time:</b> <span class="mbom-timer">${remainingQueueTime}</span> seconds</center></div>`);
						}
					}
				}
				lastLogMsgId = logMessages[logMessages.length - 1].id;
			}
		});
	}
	loadLog();
	setInterval(() => {
		loadLog();

		// Tick down the timer:
		$(".mbom-timer").each((i, timer) => {
			const newTime = Number(timer.textContent) - 1;
			if (newTime > 0) $(timer).text(newTime);
			else $(timer).parent().parent().remove();
		});
	}, 1000);

	/* ====================  Queue:  ==================== */

	$('#fMBOM_G_box2').html(`
		<h4 class="text-center">Queue</h4>
		<div id="mbom-queue"></div>
	`);

});

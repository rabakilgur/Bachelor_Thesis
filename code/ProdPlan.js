console.log("proplan");

document.addEventListener("DOMContentLoaded", () => {
	console.log("proplan load");
	$('#ProdPlan_box1').html(`
		<div class="pp-box">
			<div class="pp-descwrapper">
				<div class="pp-desc">
					<span class="pp-machine-name">Machine 1</span>
					<span class="pp-machine-status" d-status="0"></span>
				</div>
				<div class="pp-desc">
					<span class="pp-machine-name">Machine 2</span>
					<span class="pp-machine-status" d-status="1"></span>
				</div>
				<div class="pp-desc">
					<span class="pp-machine-name">Machine 3</span>
					<span class="pp-machine-status" d-status="3"></span>
				</div>
			</div>
			<div class="snapping-box">
				<div class="snapping-grid"></div>
			</div>
		</div>
		<center>
			<button id="gridZoomMinus" class="_135orangebutton w-button pp-btn">Zoom out</button>
			<button id="gridZoomPlus" class="_135orangebutton w-button pp-btn">Zoom in</button>
		</center>
	`);

	const blocks = [];
	let ps = null;

	function addToGrid(gridElArray = [], { gridElClass = "grid-snap", gridBlockClass = "grid-block", gridContainerClass = "snapping-grid"} = {}) {
		const gridContainer = document.getElementsByClassName(gridContainerClass)[0];
		let gridElementsBuilder = `<div id="grid-stub" class="${gridElClass}"></div>`;
		gridElArray.forEach((el, i) => {
			const width = (el.duration !== undefined) ? (el.duration * 10) : "150";
			const getColor = () => {
				switch(el.type) {
					case 0: return "#0088ffcc;";
					case 1: return "#ff8800cc;";
					case 2: return "#00ff88cc;";
					default: return "#888888bb";
				}
			};
			const color = getColor();
			const text = el.text ?? "";
			gridElementsBuilder += `<div id="grid-el-${i}" class="${gridElClass}" style="--width:${width}px; --color:${color};"><div class="${gridBlockClass}"><span>${text}</span></div></div>`;
			blocks.push({
				machine: el.machine ?? 0,
				delay: el.delay ?? 0,
				duration: el.duration ?? 1,
				type: el.type ?? -1,
				text: el.text ?? ""
			});
		});
		gridContainer.innerHTML = gridElementsBuilder;
		blocks.forEach((block, i) => {
			block.el = document.getElementById("grid-el-" + i)
		});
	}

	function initGrid({ gridElClass = "grid-snap", gridContainerClass = "snapping-grid", gridWidth = 10, gridHeight = 80 } = {}) {
		// Initialize the custom scrollbar:
		ps = new PerfectScrollbar(".snapping-box", {
			minScrollbarLength: 100,
			suppressScrollY: true
		});
		blocks.forEach((block) => {
			const element = block.el;
			let x = block.delay * gridWidth;
			let y = block.machine * gridHeight;
			let xx = x; // visible x
			element.style.transform = `translate(calc(${xx}px * var(--grid-zoom)), ${y}px)`;

			interact(element)
				.draggable({
					modifiers: [
						interact.modifiers.snap({
							targets: [
								interact.snappers.grid({ x: gridWidth, y: gridHeight })
							],
							range: Infinity,
							relativePoints: [{ x: 0, y: 0 }],
							offset: {
								x: (element.parentElement.getBoundingClientRect().x % gridWidth) - gridWidth,
								y: (element.parentElement.getBoundingClientRect().y % gridHeight) - gridHeight
							}
						}),
						interact.modifiers.restrict({
							restriction: element.parentNode,
							elementRect: { top: 0, left: 0, bottom: 1, right: 0 },
							endOnly: false
						})
					],
					inertia: false
				})
				.on("dragmove", (event) => {
					// Move this block using CSS:
					const currentZoom = Number(getComputedStyle(document.getElementsByClassName(gridContainerClass)[0]).getPropertyValue("--grid-zoom"));
					//console.log("x:", x, "zdx:", event.dx / currentZoom, "( dx:", event.dx, "zoom:", currentZoom, " )");
					if (Math.abs(event.dx) % gridWidth === 0) x += event.dx / currentZoom; // Ignore substeps that occur because of a weird vertical scroll position
					y += event.dy;
					const rx = Math.round(x * 100) / 100;
					if (rx % gridWidth === 0) xx = rx;
					event.target.style.transform = `translate(calc(${xx}px * var(--grid-zoom)), ${y}px)`;
					// Calculate and handle collisions:
					handleCollisions(event.target.parentElement);
					// Change size of the grid background:
					calcGridSize();
				})
				.on("dragend", (event) => {
					x = xx;
					ps.update();
				});
		});

		const gridElements = [...document.getElementsByClassName(gridElClass)];
		function handleCollisions(parent = document.getElementsByClassName(gridElClass)[0].parentElement) {
			let collisions = new Set();
			[...parent.children].forEach((el) => {
				const el_bb = el.getBoundingClientRect();
				let current = el;
				while (current.nextSibling !== null) {
					const next_sibling = current.nextSibling;
					if (next_sibling.classList.contains(gridElClass) && el.id !== "grid-stub") {
						const sib_bb = next_sibling.getBoundingClientRect();
						if (el_bb.y === sib_bb.y &&
							(el_bb.x > sib_bb.x - el_bb.width && el_bb.x < sib_bb.x + sib_bb.width)) {
							collisions.add(el).add(next_sibling);
						}
					}
					current = next_sibling;
				}
			});
			gridElements.forEach((el) => {
				if (collisions.has(el)) el.classList.add("collision");
				else el.classList.remove("collision");
			});
		}
		if (gridElements.length > 0) handleCollisions();
	}

	function calcGridSize({ gridElClass = "grid-snap", gridContainerClass = "snapping-grid", gridBoxClass = "snapping-box"} = {}) {
		document.getElementsByClassName(gridContainerClass)[0].style.width = document.getElementsByClassName(gridBoxClass)[0].scrollWidth + "px";
	}

	// =========================================

	function gridZoom(direction = 1) {
		const snappingGrid = document.getElementsByClassName("snapping-grid")[0];
		const currentZoom = Number(getComputedStyle(snappingGrid).getPropertyValue("--grid-zoom"));
		const newZoom = currentZoom + direction;
		// Change scroll position so that it appears to zoom into the center:
		const currentScrollLeft = snappingGrid.parentElement.scrollLeft;
		// Position the stub element in the center of the current view for centering it later:
		const stub = document.getElementById("grid-stub");
		const containerWidth = snappingGrid.parentElement.clientWidth;
		stub.style.transform = `translateX(calc(${(currentScrollLeft + containerWidth / 2) / currentZoom}px * var(--grid-zoom)))`;
		// Change zoom factor in CSS, recalc grid size, and update the scrollbar:
		snappingGrid.style.setProperty("--grid-zoom", Math.min(Math.max(newZoom, 1), 10));
		calcGridSize();
		ps.update();
		// Re-center the view of the grid:
		setTimeout(() => {
			const newCenter = stub.getBoundingClientRect().x - stub.parentElement.getBoundingClientRect().x - containerWidth / 2;
			// Increase the size of the grid container if it is too small to zoom into the center:
			if (containerWidth < newCenter * 4) {
				snappingGrid.style.width = newCenter * 4 + "px";
			}
			// Scroll to the new center:
			snappingGrid.parentElement.scrollLeft = newCenter;
		}, 0);
	}
	document.getElementById("gridZoomMinus").addEventListener("click", () => gridZoom(-1));
	document.getElementById("gridZoomPlus").addEventListener("click", () => gridZoom(1));
	document.getElementsByClassName("snapping-grid")[0].addEventListener("wheel", (event) => {
		if (event.deltaY >= 100) gridZoom(-1);
		else if (event.deltaY <= -100) gridZoom(1);
	});

	// =========================================

	addToGrid([
		{ machine: 0, duration: 15, delay: 0, type: 0, text: "Auftrag #065" },
		{ machine: 0, duration: 25, delay: 15, type: 0, text: "Auftrag #066" },
		{ machine: 0, duration: 40, delay: 40, type: 0, text: "Auftrag #067" },
		{ machine: 0, duration: 20, delay: 80, type: 0, text: "Auftrag #068" },
		{ machine: 0, duration: 30, delay: 100, type: 0, text: "Auftrag #069" },
		{ machine: 0, duration: 40, delay: 130, type: 0, text: "Auftrag #070" },
		{ machine: 1, duration: 22, delay: 0, type: 1, text: "Auftrag #071" },
		{ machine: 1, duration: 22, delay: 22, type: 1, text: "Auftrag #072" },
		{ machine: 1, duration: 42, delay: 44, type: 1, text: "Auftrag #073" },
		{ machine: 1, duration: 33, delay: 86, type: 1, text: "Auftrag #074" },
		{ machine: 1, duration: 38, delay: 119, type: 1, text: "Auftrag #075" },
		{ machine: 2, duration: 46, delay: 0, type: 2, text: "Auftrag #076" },
		{ machine: 2, duration: 65, delay: 46, type: 2, text: "Auftrag #077" },
		{ machine: 2, duration: 50, delay: 111, type: 2, text: "Auftrag #078" },
		{ machine: 2, duration: 65, delay: 161, type: 2, text: "Auftrag #079" },
	]);
	initGrid();
});

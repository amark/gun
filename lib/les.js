;
(function() {

	//  _     _____ ____    _     
	// | |   | ____/ ___|  (_)___ 
	// | |   |  _| \___ \  | / __|
	// | |___| |___ ___) | | \__ \
	// |_____|_____|____(_)/ |___/
	// ----------------------------
	// LES.js (Last rEcently uSed)
	// ----------------------------
	// A Small, lightweight, queue-based
	// Garbage Collector for Gun
	// Originally By: Collin Conrad (@masterex1000)

	//NOTE: set to false is running from file in YOUR code
	var USELOCALGUN = true; 
	
	//NOTE: adds some debug messages
	var DEBUG = false;
	
	
	var Gun = (typeof window !== "undefined") ? window.Gun : (USELOCALGUN ? require('../gun') : require("gun"));
	var ev = {};
	var empty = {};

	Gun.on('opt', function(root) {
		this.to.next(root);
		if (root.once)
			return;
		if (typeof process == 'undefined')
			return
		var mem = process.memoryUsage;

		if (!mem) //exit because we are in the browser
			return;

		//Figure out the most amount of memory we can use. TODO: make configurable?
		ev.max = parseFloat(root.opt.memory || process.env.WEB_MEMORY || 512) * 0.8;

		var nodes = {}; //checks if the node already exists
		var nodesArray = []; //used to easily sort everything and store info about the nodes
		var memoryUpdate = 0; // last time we printed the current memory stats

		var check = function() {
			ev.used = mem().rss / 1024 / 1024; //Contains the amt. of used ram in MB
			setTimeout(function() { // So we can handle requests etc. before we start collecting
				GC(ev.used / ev.max); // Calculate the memory ratio, and execute the garbage collector
			}, 1);
		}
		
		setInterval(check, 1000); // set the garbage collector to run every second, TODO: make configurable
		
		//Executed every time a node gets modifyed
		root.on("put", function(e) {
			var ctime = Date.now();
			var souls = Object.keys(e.put || empty);
			for (var i = 0; i < souls.length; i++) {
				enqueueNode(souls[i], ctime);
			}
		});

		//Adds a soul the garbage collectors "freeing" queue
		function enqueueNode(soul, ctime) {
			if (nodes[soul] == true) { //The node already exists in the queue
				var index = nodesArray.findIndex(function(e) {
					return e[0] === soul;
				});
				if (index == -1) {
					console.err("Something happened and the node '" + soul + "' won't get garbage collection unless the value is updated agian");
					return;
				} else {
					nodesArray.splice(index, 1); // remove the existing ref.
					nodesArray.push([soul, ctime]); // push the new instance
				}
			} else {
				nodesArray.push([soul, ctime]);
				nodes[soul] = true;
			}
		}

		//The main garbage collecting routine
		function GC(memRatio) {
			var curTime = Date.now(); // get the current time

			if (curTime - memoryUpdate >= 5000) {
				console.log("|GC| %s | Current Memory Ratio: %d | Current Ram Usage %sMB | Nodes in Memory %s", new Date().toLocaleString(), round(memRatio, 2), round(ev.used, 2), Object.keys(root.graph || empty).length);
				memoryUpdate = curTime;
			}

			var freed = 0;

			while (nodesArray.length > 0) {
				var soul = nodesArray[0][0];
				var nts = nodesArray[0][1];
				if (DEBUG)
					console.log("Soul: " + soul + " | Remove Importance: " + calcRemoveImportance(nts, curTime, memRatio) +
						" | Memory Ratio: " + memRatio + " | Time Existed: " + (curTime - nts) / 1000);
				if (calcRemoveImportance(nodesArray[0][1], curTime, memRatio) >= 100) {
					root.gun.get(nodesArray[0][0]).off(); //Remove the node
					delete nodes[nodesArray[0][0]]; // remove the lookup value
					nodesArray.splice(0, 1);
					freed++;
				} else
					break;
			}
			if (freed > 0)
				console.log("|GC| Removed %s nodes in %s seconds-----------------------------------------------------------------", freed, (Date.now() - curTime) * 0.001);
		}

		//Generates a number that, after it hits a threshold, the node gets removed
		function calcRemoveImportance(timestamp, ctime, memoryUsageRatio) {
			var time = (ctime - timestamp) * 0.001;
			return time * 10 * (memoryUsageRatio * memoryUsageRatio)
		}

		function round(value, decimals) { //a basic rounding function
			return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
		}
	});
}());
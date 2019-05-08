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

	/**
	 *
	 * Usage: require the file in your application
	 * 
	 * Gun Params: these are passed to the new gun constructor
	 *
	 *  - gc_enable : enables the gc, good if you are running multiple instances of gun, etc... def. true
	 *	- gc_delay	: sets the amount of time between attempted garbage collections in milliseconds
	 *	- gc_info_enable : Enables or Disables the info printout
	 *	- gc_info	: sets the ~ amount of time between info messages
	 *				  this is checked everytime the gc is ran
	 *	- gc_info_mini : this will use a smaller, less user friendly info printout
	 *	- gc_importance_func : This will be the function used for finding the importance of a potental collect
	 *							takes the form of func(timestamp, ctime, memoryUsageRatio) {return val}
	 *							Collects when returned value is 100
	 */
	
	//NOTE: set to false to use require for getting gun DEFUALT: false
	var USELOCALGUN = false; 
		
	
	//NOTE: adds some debug messages DEFUALT: false
	var DEBUG = false;
	
	if(!(typeof window !== "undefined") && USELOCALGUN)
		console.log("NOTE: You currently have LES.js set to use the 'local' file version of gun, This might crash if set wrong!");
	
	var Gun = (typeof window !== "undefined") ? window.Gun : (USELOCALGUN ? require('../gun') : require("gun"));
	
	//Removes a node from the garbage collection until next write
	Gun.chain.gcDequeue = function() {
		//console.log(this._.root.dequeueNode);
		if(this._.root.dequeueNode) { // check that we actually have the dequeue command on this node
			let ctx = this;
		
			this.get(function (soul) {
				ctx._.root.dequeueNode(soul);
			}, true);
		}
	}
	
	//Puts node at the front for garbage collection, NOTE: only collects when it is hit it's time
	Gun.chain.gcCollect = function() {
		if(this._.root.collectNode) { // check that we actually have the dequeue command on this node
			let ctx = this;
			
			this.get(function (soul) {
				ctx._.root.collectNode(soul);
			}, true);
		}
	}
	
	Gun.on('opt', function(root) {
		//Setup various options
		
		const gc_enable = root.opt.gc_enable ? root.opt.gc_enable : true;
		const gc_delay = root.opt.gc_delay ? root.opt.gc_delay : 1000;
		
		const gc_info_enable  = ("gc_info_enable" in root.opt) ? root.opt.gc_info_enable  : true;
		const gc_info  = root.opt.gc_info  ? root.opt.gc_info  : 5000;
		const gc_info_mini = root.opt.gc_info_mini ? root.opt.gc_info_mini : false;
		
		//This is long, but it works well
		const calcRemoveImportance = root.opt.gc_importance_func ? root.opt.gc_importance_func : function (timestamp, ctime, memoryUsageRatio) {
			var time = (ctime - timestamp) * 0.001;
			return time * 10 * (memoryUsageRatio * memoryUsageRatio);
		}
		
		if(DEBUG) console.log(root.opt);
		
		this.to.next(root);
		
		if (root.once)
			return;
		if (typeof process == 'undefined')
			return
		var mem = process.memoryUsage;

		if(!gc_enable) // exit because the gc is disabled
			return;
		
		if (!mem) //exit because we are in the browser
			return;

		var ev = {}; //stores the environment
		var empty = {}; //An empty list used to prevent crashes
		
		//Figure out the most amount of memory we can use. TODO: make configurable?
		ev.max = parseFloat(root.opt.memory || process.env.WEB_MEMORY || 512) * 0.8;

		var nodes = {}; //checks if the node already exists
		var nodesArray = []; //used to easily sort everything and store info about the nodes
		var memoryUpdate = 0; // last time we printed the current memory stats

		root.dequeueNode = (soul) => {  //forward the call to our gc
			dequeueNode(soul);
		}
		
		root.collectNode = (soul) => {  //forward the call to our gc
			collectNode(soul);
		}
		
		var check = function() {
			ev.used = mem().rss / 1024 / 1024; //Contains the amt. of used ram in MB
			setTimeout(function() { // So we can handle requests etc. before we start collecting
				GC(ev.used / ev.max); // Calculate the memory ratio, and execute the garbage collector
				//GC(0.99);
			}, 1);
		}
		
		setInterval(check, gc_delay); // set the garbage collector to run every second
		
		//Executed every time a node gets modified
		root.on("put", function(e) {
			this.to.next(e);
			var ctime = Date.now();
			var souls = Object.keys(e.put || empty); // get all of the nodes in the update
			for (var i = 0; i < souls.length; i++) { // iterate over them and add them
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
					console.error("Something happened and the node '" + soul + "' won't get garbage collection unless the value is updated again");
					return;
				} else {
					nodesArray.splice(index, 1); // remove the existing ref. faster than dequeue
					nodesArray.push([soul, ctime]); // push the new instance
				}
			} else {
				nodesArray.push([soul, ctime]);
				nodes[soul] = true;
			}
		}

		//Removes a node from the queue
		function dequeueNode(soul) {
			if (nodes[soul] == true) { //The node already exists in the queue
				var index = nodesArray.findIndex(function(e) {
					return e[0] === soul;
				});
				if (index != -1) {
					//nodesArray.splice(index, 1); // remove the existing ref.
					nodesArray.shift();
					nodes[soul] = false; // store that we no longer have that node in the queue
				}
			}
		}
		
		//Moves a node to the start of the queue
		function collectNode(soul) {
			if (nodes[soul] == true) { //The node already exists in the queue
				var index = nodesArray.findIndex(function(e) {
					return e[0] === soul;
				});
				if (index != -1) {
					//nodesArray.splice(index, 1); // remove the existing ref.
					nodesArray.shift(); // WAY faster than splice
				}
				nodesArray.unshift([soul, nodesArray[0][1]]); // create a new node with the next nodes time stamp
				nodes[soul] = true; // store that we no longer have that node in the queue
			}
		}
		
		//The main garbage collecting routine
		function GC(memRatio) {
			var curTime = Date.now(); // get the current time

			if (gc_info_enable && curTime - memoryUpdate >= gc_info) { // check if we need to print info
				if(!gc_info_mini)
					console.log("|GC| %s | Current Memory Ratio: %d | Current Ram Usage %sMB | Nodes in Memory %s", new Date().toLocaleString(), round(memRatio, 2), round(ev.used, 2), Object.keys(root.graph || empty).length);
				else
					console.log("|GC| %s, Mem Ratio %d, Ram %sMB, Nodes in mem %s, Tracked Nodes %s", new Date().toLocaleString(), round(memRatio, 2), round(ev.used, 2), Object.keys(root.graph || empty).length, nodesArray.length);
				memoryUpdate = curTime; // reset the last update time
			}

			var freed = 0; // Just a nice performance counter

			while (nodesArray.length > 0) { // iterate over all of our nodes
				var soul = nodesArray[0][0];
				var nts = nodesArray[0][1];
				if (DEBUG)
					console.log("Soul: " + soul + " | Remove Importance: " + calcRemoveImportance(nts, curTime, memRatio) +
						" | Memory Ratio: " + memRatio + " | Time Existed: " + (curTime - nts) / 1000);
				if (calcRemoveImportance(nodesArray[0][1], curTime, memRatio) >= 100) {
					root.gun.get(nodesArray[0][0]).off(); //Remove the node
					delete nodes[nodesArray[0][0]]; // remove the lookup value
					//nodesArray.splice(0, 1);
					nodesArray.shift();
					freed++; // add one to our perf counter
				} else
					break; // Break out of the loop because we don't have any more nodes to free
			}
			if (freed > 0)
				console.log("|GC| Removed %s nodes in %s seconds-----------------------------------------------------------------", freed, (Date.now() - curTime) * 0.001);
		}
		
		function round(value, decimals) { //a basic rounding function
			return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
		}
	});
}());

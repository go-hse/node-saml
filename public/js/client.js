window.onload = function () {

	let client_id = -1;

	function log(msg) {
		console.log(`${client_id}: ${msg}`);
	}

	let socket = io();
	socket.on("connect", function() {
		socket.emit("open", (new Date()).toString());
		log("open");
	});

	socket.on("init", (o) => {
		client_id = o.id;
		log(`init with ${o.no_of_clients} clients`);
	});

	// receive message from server
	socket.on("update", (o) => {
		log(`got update: ${o}`);
	});

	// send regular messages to server
	let counter = 0;
	setInterval(()=>{ 
		socket.emit("update", `client ${client_id}: ${counter++}`);
	}, 3000);

}
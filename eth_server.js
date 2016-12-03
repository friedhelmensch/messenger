var http = require('http');
var dispatcher = require('httpdispatcher');
var request = require('request');
var Web3 = require('web3');

//Lets define a port we want to listen to
const PORT=9090; 

//Create a server
var server = http.createServer(handleRequest);

var web3_mes = new Web3();
var web3_map = new Web3();


web3_mes.setProvider(new web3_mes.providers.HttpProvider("http://localhost:9095"));
web3_map.setProvider(new web3_mes.providers.HttpProvider("http://localhost:8545"));


var mapperContract = web3_map.eth.contract([{"constant":false,"inputs":[],"name":"kill","outputs":[],"type":"function"},{"constant":true,"inputs":[],"name":"get_Counter","outputs":[{"name":"","type":"uint32"}],"type":"function"},{"constant":true,"inputs":[],"name":"get_Value","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"a","type":"address"}],"name":"check_Address","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[],"name":"send_Ether_To_Owner","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"new_address","type":"address"}],"name":"create_Member","outputs":[{"name":"","type":"bool"}],"type":"function"},{"inputs":[],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"new_address","type":"address"}],"name":"CreateMember","type":"event"}]);

var mapper= mapperContract.at("0x4f51b5bc96dc85226bd1e9510394f83a2d74bbb0");

var messengerContract = web3_mes.eth.contract([{"constant":true,"inputs":[{"name":"_receiver","type":"address"}],"name":"get_latest_message","outputs":[{"name":"","type":"string"}],"type":"function"},{"constant":true,"inputs":[{"name":"_receiver","type":"address"}],"name":"get_counter","outputs":[{"name":"","type":"uint32"}],"type":"function"},{"constant":true,"inputs":[{"name":"_receiver","type":"address"},{"name":"index","type":"uint32"}],"name":"get_message","outputs":[{"name":"","type":"string"}],"type":"function"},{"constant":false,"inputs":[{"name":"_receiver","type":"address"},{"name":"_text","type":"string"}],"name":"send_message","outputs":[{"name":"","type":"bool"}],"type":"function"},{"inputs":[],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_receiver","type":"address"}],"name":"Message_sent","type":"event"}]);

var messenger = messengerContract.at("0x4743ee49f258b610bf9a90b269af7354a4fe8b80");

//Lets start our server
server.listen(PORT, 'localhost', function(){
    console.log("Server listening on: http://localhost:%s", PORT);
});

function handleRequest(request, response){
    try {
        //log the request on console
        console.log(request.url);
        //Disptach
        dispatcher.dispatch(request, response);
    } catch(err) {
        console.log(err);
    }
}

dispatcher.setStatic('resources');

dispatcher.onGet("/register", function(req, res) {
	
	if (req.params.addr == '') {
		res.writeHead(200, {'Content-Type': 'text/plain'});
    	res.end('no address');
	}
	
	var is_member= mapper.check_Address(req.params.addr);
	
	if (is_member) {
	    console.log("is member. creating account");
	    		
		var headers = {
    		'User-Agent':       'Super Agent/0.0.1',
    		'Content-Type':     'application/json-rpc',
    		'Accept':'application/json-rpc'
		}
		var options = {
  			url: 'http://localhost:9095',
  			method: 'POST',
  			headers: headers,
  			json: true,
  			body: {"method": "personal_newAccount", "params": [''], "id":mapper.get_Counter()}
		}
		
		request(options, function (error, body) {
			
		
    		if (!error && res.statusCode == 200) {
    			// console.log("body: " + JSON.stringify(body));
    			var new_account= body.body.result.toString();  
        			res.writeHead(200, {"Content-Type": "text/plain"});
        			res.write(new_account);
    		} else	{
    			console.log("error");
      			res.writeHead(response.statusCode, {"Content-Type": "text/plain"});
      			res.write(response.statusCode.toString() + " " + error);
    		}
    		res.end();
		})
	
    } else {    	
    	res.writeHead(200, {'Content-Type': 'text/plain'});
    	res.end('wrong address');
    }
});    


dispatcher.onGet("/send_first_message", function(req, res) {
	
	if (req.params.addr == '') {
		res.writeHead(200, {'Content-Type': 'text/plain'});
    	res.end('wrong address');
	}
	
	var addr= req.params.addr.toString();
	console.log(addr);
	
	var headers = {
    	'User-Agent':       'Super Agent/0.0.1',
    	'Content-Type':     'application/json-rpc',
    	'Accept':'application/json-rpc'
	}
	var options = {
  		url: 'http://localhost:9095',
  		method: 'POST',
  		headers: headers,
  		json: true,
  		body: {"method": "personal_unlockAccount", "params": [web3_mes.eth.accounts[2],''], "id":addr}
	}
	
	request(options, function (error, body) {
			
		
    		if (!error && res.statusCode == 200) {
    			console.log("body: " + JSON.stringify(body.body));
    			var result= body.body.result.toString();  
        			res.writeHead(200, {"Content-Type": "text/plain"});
        			res.write(result);
        			// Send first message
        			messenger.send_message.sendTransaction(addr,'Hello new member: ',{from: web3_mes.eth.accounts[2]});
        			console.log(messenger.get_counter(addr).toString());
    		} else	{
    			console.log("error");
      			res.writeHead(response.statusCode, {"Content-Type": "text/plain"});
      			res.write(response.statusCode.toString() + " " + error);
    		}
    		res.end();
	})
    
});    

dispatcher.onGet("/send_message", function(req, res) {
	
	if (req.params.addr == '') {
		res.writeHead(200, {'Content-Type': 'text/plain'});
    	res.end('wrong sender address');
	}
	
	if (req.params.recipient == '') {
		res.writeHead(200, {'Content-Type': 'text/plain'});
    	res.end('no recepient address');
	}
	
	if (req.params.message == '') {
		res.writeHead(200, {'Content-Type': 'text/plain'});
    	res.end('no message');
	}
	
	var addr= req.params.addr.toString();
	console.log(addr);
	var recipient= req.params.recipient.toString();
	console.log(recipient);
	var message= req.params.message.toString();
	console.log(message);
	
	var headers = {
    	'User-Agent':       'Super Agent/0.0.1',
    	'Content-Type':     'application/json-rpc',
    	'Accept':'application/json-rpc'
	}
	var options = {
  		url: 'http://localhost:9095',
  		method: 'POST',
  		headers: headers,
  		json: true,
  		body: {"method": "personal_unlockAccount", "params": [addr,''], "id":recipient}
	}
	
	request(options, function (error, body) {
			
		
    		if (!error && res.statusCode == 200) {
    			console.log("body: " + JSON.stringify(body.body));
    			var result= body.body.result.toString();  
        			res.writeHead(200, {"Content-Type": "text/plain"});
        			res.write(result);
        			// send message
        			messenger.send_message.sendTransaction(recipient,message,{from: addr});
        			console.log(messenger.get_counter(addr).toString());
    		} else	{
    			console.log("error");
      			res.writeHead(response.statusCode, {"Content-Type": "text/plain"});
      			res.write(response.statusCode.toString() + " " + error);
    		}
    		res.end();
	})
    
});    


dispatcher.onGet("/get_inbox", function(req, res) {
	
	if (req.params.addr == '') {
		res.writeHead(200, {'Content-Type': 'text/plain'});
    	res.end('wrong address');
	}
	
	var addr= req.params.addr.toString();
	console.log(addr);
    
    var counter= messenger.get_counter(addr).toString();
    var latest= messenger.get_latest_message(addr).toString();   
    
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.write(counter);
    res.write("<br>");
    res.write(latest);			
    res.end();

    
});    



//A sample POST request
dispatcher.onPost("/post1", function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Got Post Data');
});

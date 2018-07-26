/*!
 * Module dependencies.
 */

const ethConfig = require('../../config/eth/config-live');
const jadetoken = require('../../config/eth/CryptoJadeLive.json');
var Web3 = require('web3');
//const ethConfig = require('../../config/eth/config-dev');
var web3 = new Web3(ethConfig.ethProvider);
 
const contractAbi = jadetoken.abi;
const contractAddr = ethConfig.tokenContractAddr;

/* 
	Node Status and Connections

	This functions is used to connect with the ethereum node or get/change the provider
*/
exports.connect = function (req, res){
	//console.log(web3);
	res.json({
		"status" : 200,
		"provider" : web3.currentProvider,
		"version" : web3.version,
		"network" : web3.network
	});
};

/*
	This function creates a random address on ethereum blockchain
*/
exports.createAccount = function(req, res){
	var result = web3.eth.accounts.create();
	console.log("Account Created");
	res.json({
		"status" : 200,
		"data" : result
	});
};

/*
	This function gets the balance of Ethers on ethereum blockchain
*/

exports.getEthBalanceOf = function(req, res){
	
	//if(!web3.isConnected())
	//	web3 = new Web3(new Web3.providers.HttpProvider(ethConfig.ethProvider));

	if(web3.utils.isAddress(req.params.accountAddr)){
		
		var balance;
		
		web3.eth.getBalance(req.params.accountAddr)
		.then(function(result){ 
			//console.log(result);
			balance = web3.utils.fromWei(result,"ether");
			res.json({
			"status" : 200,
      		"code" : "ETH",
			"address" : req.params.accountAddr,
			"balance" : balance
			});
		});
	}else{
		res.json({
			"status" : 400,
			"error" : "Incorrect Address/Account not found"
		});
	}
	
};

/*
	This function gets the balance of Jade Tokens on ethereum blockchain
*/

exports.getJadeBalanceOf = function(req, res){
	var web3 = new Web3(ethConfig.ethProvider);
	if(web3.utils.isAddress(req.params.accountAddr)){
		var sender = req.params.accountAddr;
		var tokenInstance = new web3.eth.Contract(contractAbi, contractAddr);

		tokenInstance.methods.balanceOf(sender).call({from: sender}).then(function(balance){
			res.json({
				"status" : 200,
				"code" : "JADE",
				"address" : sender,
				"balance" : web3.utils.fromWei(balance,"ether")
			});
		});
	}else{
		res.json({
			"status" : 400,
			"error" : "Incorrect Address/Account not found"
		});
	}
};

/*
	This function sends Jade Tokens from sender to receiver
*/
exports.sendTokens = function(req, res){
	var web3 = new Web3(ethConfig.ethProvider);

	// Validations:
	if(!req.body.senderPrivKey || !req.body.receiver || !req.body.amount){
		res.json({
			status: 400,
			error: "Invalid Input"
		});
		return;
	}

	var senderObj = web3.eth.accounts.privateKeyToAccount("0x"+req.body.senderPrivKey);
	var sender = senderObj.address;
	var receiver = req.body.receiver;
	//console.log(sender);

	if(web3.utils.isAddress(sender) && web3.utils.isAddress(receiver)){
		
		var tokenInstance = new web3.eth.Contract(contractAbi, contractAddr, {
			from: sender
		});

		var txnNonce;
		var txnObject;

		web3.eth.getTransactionCount(sender)
			.then(function(data){
				txnNonce = data;
				console.log(txnNonce);
				txnObject = {
					from : sender,
					to : contractAddr,
					value : "0x0",
					gasPrice: web3.utils.toHex(web3.utils.toWei('20', 'Gwei')),
					gas: web3.utils.toHex('250000'),
					nonce: txnNonce,
					data: tokenInstance.methods.transfer(receiver, web3.utils.toWei(req.body.amount, 'ether')).encodeABI()
				};

				console.log(txnObject);

				//sendTransactionToEth(txnObject, req.body.prvkey);

				var Tx = require('ethereumjs-tx');
				var privateKey = new Buffer(req.body.senderPrivKey, 'hex');

				var tx = new Tx(txnObject);
				tx.sign(privateKey);

				var serializedTx = tx.serialize();
				console.log(serializedTx);

				web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
					.on('receipt', function(receipt){
						console.log("Receipt Called");
						res.json({
							"status" : 200,
							"data" : receipt
						});
					})
					.on('error', function(err){
						console.log("Error Called: "+ err);

						var minedPending = "Be aware that it might still be mined";
						var sourceErr = " " + err + " ";
						if(sourceErr.indexOf(minedPending) !== -1)
						{
							res.json({
							"status" : 200,
							"data" : err,
							"errmsg" : "Your transaction is on the Blockchain. Depending on data traffic, it may take anywhere between 5-30 minutes to execute. Kindly check your wallet again in some time to be sure that the transaction was successfully executed."
							});
						}
						else
						{
							res.json({
								"status" : 400,
								"data" : err,
								"errmsg" : "There has been some error processing your transaction. Please try again later."
							})
						}
					});
			});

	}else{
		res.json({
			"status" : 400,
			"error" : "Incorrect Address/Account not found"
		});
	}
};

/*
	This function sends Ethers from sender to receiver
*/
exports.sendEthers = function(req, res){
	var web3 = new Web3(ethConfig.ethProvider);

	// Validations:
	if(!req.body.senderPrivKey || !req.body.receiver || !req.body.amount){
		res.json({
			status: 400,
			error: "Invalid Input"
		});
		return;
	}

	var senderObj = web3.eth.accounts.privateKeyToAccount("0x"+req.body.senderPrivKey);
	var sender = senderObj.address;
	var receiver = req.body.receiver;
	console.log("Sender: "+sender);
	console.log("Receiver: "+receiver);
	console.log("Amount: "+req.body.amount);
	
	
	//console.log(sender);

	if(web3.utils.isAddress(sender) && web3.utils.isAddress(receiver)){
		
		/* var tokenInstance = new web3.eth.Contract(contractAbiTest, contractAddrTest, {
			from: sender
		}); */

		var txnNonce;
		var txnObject;
		//console.log(web3.eth.currentProvider);

		web3.eth.getTransactionCount(sender)
			.then(function(data){
				txnNonce = data;
				console.log(txnNonce);
				txnObject = {
					from: sender,
					to: receiver,
					value : web3.utils.toHex(web3.utils.toWei(req.body.amount, 'ether')),
					gasPrice: web3.utils.toHex(web3.utils.toWei('20', 'Gwei')),
					gas: web3.utils.toHex('100000'),
					nonce: txnNonce
				};

				console.log(txnObject);

				//sendTransactionToEth(txnObject, req.body.prvkey);

				var Tx = require('ethereumjs-tx');
				var privateKey = new Buffer(req.body.senderPrivKey, 'hex');

				var tx = new Tx(txnObject);
				tx.sign(privateKey);

				var serializedTx = tx.serialize();
				console.log(serializedTx);

				web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
					.on('receipt', function(receipt){
						console.log("Receipt Called");
						res.json({
							"status" : 200,
							"data" : receipt
						});
					})
					.on('error', function(err){
						console.log("Error Called: "+ err);

						var minedPending = "Be aware that it might still be mined";
						var sourceErr = " " + err + " ";
						if(sourceErr.indexOf(minedPending) !== -1)
						{
							res.json({
							"status" : 200,
							"data" : err,
							"errmsg" : "Your transaction is on the Blockchain. Depending on data traffic, it may take anywhere between 5-30 minutes to execute. Kindly check your wallet again in some time to be sure that the transaction was successfully executed."
							});
						}
						else
						{
							res.json({
								"status" : 400,
								"data" : err,
								"errmsg" : "There has been some error processing your transaction. Please try again later."
							})
						}
					});
			});

	}else{
		res.json({
			"status" : 400,
			"error" : "Incorrect Address/Account not found"
		});
	}
};

/*
	This function gets all the transactions for a given address
*/

exports.getTransactions = function(req, res){
	var web3 = new Web3(ethConfig.ethProvider);
	if(req.params.accountAddr || web3.utils.isAddress(req.params.accountAddr)){

		var fetch = require('node-fetch');
		var apiEndpoint = "http://api.etherscan.io/api?module=account&action=tokentx&address="
		+ req.params.accountAddr
		+ "&page=1&offset=100&sort=desc&apikey="
		+ process.env.API_KEY;
		//console.log(apiEndpoint);
		fetch(apiEndpoint, {
			method: 'GET'
		}).then(response => {
			console.log("Response Received...");
			response.json().then(function(data){
				//console.log(data);
				res.json({
					status : 200,
					address: req.params.accountAddr,
					data: data
				}); 
			});
			
		}).catch(err => {
			console.log("Error Received...")
			console.log(err);
			res.json({
				status : 400,
				error: err
			});
		});
	}else{
		res.json({
			"status" : 400,
			"error" : "Incorrect Address/Account not found"
		});
	}
};

/*
	This function gets all the transactions for a given address
*/

exports.getTransactionsEth = function(req, res){
	var web3 = new Web3(ethConfig.ethProvider);
	if(req.params.accountAddr || web3.utils.isAddress(req.params.accountAddr)){

		var fetch = require('node-fetch');
		var apiEndpoint = "http://api.etherscan.io/api?module=account&action=txlist&address="
		+ req.params.accountAddr
		+ "&page=1&offset=100&sort=desc&apikey="
		+ process.env.API_KEY;
		//console.log(apiEndpoint);
		fetch(apiEndpoint, {
			method: 'GET'
		}).then(response => {
			console.log("Response Received...");
			response.json().then(function(data){
				//console.log(data);
				res.json({
					status : 200,
					address: req.params.accountAddr,
					data: data
				}); 
			});
			
		}).catch(err => {
			console.log("Error Received...")
			console.log(err);
			res.json({
				status : 400,
				error: err
			});
		});
	}else{
		res.json({
			"status" : 400,
			"error" : "Incorrect Address/Account not found"
		});
	}
};
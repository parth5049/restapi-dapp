/*!
 * Module dependencies.
 */

const ethConfigTest = require('../../config/eth/config-test');
const jadetokentest = require('../../config/eth/CryptoJadeTest.json');
var Web3 = require('web3');
//const ethConfig = require('../../config/eth/config-dev');
var web3 = new Web3(ethConfigTest.ethProvider);
 
const contractAbiTest = jadetokentest.abi;
const contractAddrTest = ethConfigTest.tokenContractAddr;

/* 
	Node Status and Connections

	This functions is used to connect with the ethereum node or get/change the provider
*/
exports.connect = function (req, res){
	//console.log(web3);
	res.json({
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
		"data" : result
	});
};

/*
	This function gets the balance of Etheres on ethereum blockchain
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
      		"code" : "ETH",
			"address" : req.params.accountAddr,
			"balance" : balance
			});
		});
	}else{
		res.json({
			"error" : "Incorrect Address/Account not found"
		});
	}
	
};

/*
	This function gets the balance of Jade Tokens on ethereum blockchain
*/

exports.getJadeBalanceOf = function(req, res){
	//console.log("Provider: ");
	var web3 = new Web3(ethConfigTest.ethProvider);
	//console.log(web3.currentProvider);
	if(web3.utils.isAddress(req.params.accountAddr)){
		var sender = req.params.accountAddr;
		//console.log("Contract ABI");
		//console.log(contractAbi);
		console.log("Contract Address");
		console.log(contractAddrTest);
		var tokenInstance = new web3.eth.Contract(contractAbiTest, contractAddrTest, {from: sender})
		
		//console.log(tokenInstance);

		tokenInstance.methods.balanceOf(sender).call({from: sender}).then(function(balance){
			res.json({
				"code" : "JADE",
				"address" : sender,
				"balance" : web3.utils.fromWei(balance,"ether")
			});
		});
	}else{
		res.json({
			"error" : "Incorrect Address/Account not found"
		});
	}
}

exports.sendTokens = function(req, res){
	var web3 = new Web3(ethConfigTest.ethProvider);

	if(web3.utils.isAddress(req.body.sender)){
		var sender = req.body.sender;
    	var receiver = req.body.receiver;


		var tokenInstance = new web3.eth.Contract(contractAbiTest, contractAddrTest, {
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
					to : contractAddrTest,
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
							"status" : "pending",
							"data" : err,
							"errmsg" : "Your transaction is on the Blockchain. Depending on data traffic, it may take anywhere between 5-30 minutes to execute. Kindly check your wallet again in some time to be sure that the transaction was successfully executed."
							});
						}
						else
						{
							res.json({
								"status" : "error",
								"data" : err,
								"errmsg" : "There has been some error processing your transaction. Please try again later."
							})
						}
					});
			});

	}else{
		res.json({
			"error" : "Incorrect Address/Account not found"
		});
	}
};
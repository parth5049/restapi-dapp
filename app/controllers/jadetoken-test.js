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
		
		console.log(tokenInstance);

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
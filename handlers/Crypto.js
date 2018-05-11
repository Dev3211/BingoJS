"use strict";

var crypto = require("crypto");
var md5 = require('md5');

class Crypto {
	
	static generateMD5 (param1) {
		var hash = crypto.createHash('md5').update(param1).digest('hex');
		return hash;
	}

	static generateIntKey () {
		return Math.floor(Math.random() * (999999999 - 100000000 + 1)) + 100000000;
	}

	static chkSum (param1) {
		var p1 = 0, p2 = 0;
		while (p2 < param1.length) {
			p1 = p1 + param1.charCodeAt(p2);
			p2++;
		}
		return p1;
	}
	
	static generateKey (){
    var key = '';
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#';
    for(var i = 0; i < 12; i++){
      var rand = Math.floor(Math.random() * chars.length);
      key += chars.charAt(rand);
    }
    return key;
  }


	static sha (data) {
		return crypto.createHash('sha256').update(data).digest('hex');
	}

	static md5 (data) {
		return md5(data).toString();
	}

	static generateSHA (data) {
    var d = [];
    for(var i = 0; i < arguments.length; ++i) {
      d.push(arguments[i]);
    }
		return crypto.createHash('sha1').update(d.join()).digest('hex').substring(0,24);
	}

	
	static swapHash (hash){
    var swap = hash.substr(16, 16);
    swap += hash.substr(0, 16);
    return swap;
    }
  
  
   static encryptPassword (pass, key){
    var encrypt = Crypto.swapHash(pass);
    encrypt += key;
    encrypt += 'Y(02.>\'H}t":E1';
    encrypt = Crypto.generateMD5(encrypt);
    encrypt = Crypto.swapHash(encrypt);
    return encrypt;
  }
  

}

module.exports = Crypto;


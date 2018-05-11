"use strict";

var crypto = require("crypto");
var md5 = require('md5');

class Crypto {
	static rndK () {
		var key = "", chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()-_+=:;,./[]`~";
		for (var i = 0; i < 12; i++) {
			var rnd = Math.floor(Math.random() * chars.length);
			key += chars.charAt(rnd);
		}
		return key;
	}

	static rol (param1, param2) {
		return param1 << param2 | param1 >>> 32 - param2;
	}

	static ror (param1, param2) {
		var p1 = 32 - param2;
		return param1 << p1 | param1 >>> 32 - p1;
	}
	
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
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()-_+=:;,./[]`~';
    for(var i = 0; i < 12; i++){
      var rand = Math.floor(Math.random() * chars.length);
      key += chars.charAt(rand);
    }
    return key;
  }

	static randomBytes (param1) {
		for (var i = []; param1 > 0; param1--) {
			i.push(Math.floor(Math.random() * 0x100));
		}
		var p1 = i.toString();
		p1 = p1.split(',').join('');
		return p1;
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
  
	static hashActiveLoginKey (key) {
	    var p1 = Crypto.writeUTFBytes("(LHny:TyGynR" + key); // AS3
	    return Crypto.fromArray(p1);
	}

	static writeUTFBytes (param1) {
		var p1 = escape(param1);
		const data = [];
		for (var i = 0; i < p1.length; i++) {
			data[i] = p1[i].charCodeAt();
		}
		return data;
	}

	static fromArray (array, colons) {
		colons = false;
		var p1 = "";
		for (var i = 0; i < array.length; i++) {
			p1 += ("0" + array[i].toString(16)).substr(-2,2);
			if (colons) {
				if (i < array.length - 1) {
					p1 += ":";
				}
			}
		}
		return p1;
	}

	static encryptDES (param1) {
		var p1 = new Array();
		p1[0] = 188;
		p1[1] = 201;
		p1[2] = 35;
		p1[3] = 243;
		p1[4] = 5;
		p1[5] = 69;
		p1[6] = 182;
		p1[7] = 131;
		var p2 = new Array();
		p2[0] = 58;
		p2[1] = 106;
		p2[2] = 188;
		p2[3] = 231;
		p2[4] = 91;
		p2[5] = 103;
		p2[6] = 240;
		p2[7] = 101;
		var cipher = crypto.createCipheriv('des', new Buffer(p1), new Buffer(p2));
		var buf1 = cipher.update(param1, 'utf8');
		var buf2 = cipher.final();
		const result = new Buffer(buf1.length + buf2.length);
		buf1.copy(result);
		buf2.copy(result, buf1.length);
		return result.toString('base64');
	}

	static decryptDES (param1) {
		var p1 = new Array();
		p1[0] = 188;
		p1[1] = 201;
		p1[2] = 35;
		p1[3] = 243;
		p1[4] = 5;
		p1[5] = 69;
		p1[6] = 182;
		p1[7] = 131;
		var p2 = new Array();
		p2[0] = 58;
		p2[1] = 106;
		p2[2] = 188;
		p2[3] = 231;
		p2[4] = 91;
		p2[5] = 103;
		p2[6] = 240;
		p2[7] = 101;
		var cipher = crypto.createDecipheriv('des', new Buffer(p1), new Buffer(p2));
		var buf1 = cipher.update(param1,'base64');
		var buf2 = cipher.final();
		const result = new Buffer(buf1.length + buf2.length);
		buf1.copy(result);
		buf2.copy(result, buf1.length);
		return result.toString('utf8');
	}

	static encryptAES (param1, param2, param3) {
		var cipher = crypto.createCipheriv('aes-128-ctr', param2, param3);
		var buf1 = cipher.update(param1, 'utf8', 'hex');
		buf1 += cipher.final('hex');
		return buf1;
	}

	static decryptAES (param1, param2, param3) {
		var cipher = crypto.createDecipheriv('aes-128-ctr', param2, param3);
		var buf1 = cipher.update(param1, 'hex', 'utf8');
		buf1 += cipher.final('utf8');
		return buf1;
	}

	static customDES (param1) {
		var p1 = new Array();
		p1[0] = 35;
		p1[1] = 65;
		p1[2] = 108;
		p1[3] = 108;
		p1[4] = 95;
		p1[5] = 71;
		p1[6] = 111;
		p1[7] = 66;
		var p2 = new Array();
		p2[0] = 23;
		p2[1] = 54;
		p2[2] = 200;
		p2[3] = 191;
		p2[4] = 120;
		p2[5] = 72;
		p2[6] = 91;
		p2[7] = 223;
		var cipher = crypto.createCipheriv('des', new Buffer(p1), new Buffer(p2));
		var buf1 = cipher.update(param1, 'utf8');
		var buf2 = cipher.final();
		const result = new Buffer(buf1.length + buf2.length);
		buf1.copy(result);
		buf2.copy(result, buf1.length);
		return result.toString('base64');
	}

	static encryptString (param1, param2) {
		var keyIndex = 0;
		var res = "";
		for (var i = 0; i < param1.length; i++) {
			var charCode = param1.charCodeAt(i);
			charCode ^= param2.charCodeAt(keyIndex);
			var firstChar = charCode & 0x0F;
			var secondChar = charCode >> 4;
			res += String.fromCharCode(firstChar + 64);
			res += String.fromCharCode(secondChar + 64);
			keyIndex++;
			if (keyIndex >= param2.length) {
				keyIndex = 0;
			}
		}
		return res;
	}

	static decryptString (param1, param2) {
		var keyIndex = 0;
		var res = "";
		var currentChar;
		for (var i = 0; i < param1.length; i++) {
			var charCode = param1.charCodeAt(i);
			var afterCurrentChar = param1.charCodeAt(i + 1);
			var keyChar = param2.charCodeAt(keyIndex);
			currentChar = currentChar & 0x1F;
			afterCurrentChar = afterCurrentChar & 0x1F;
			afterCurrentChar = afterCurrentChar * 16;
			res = res + String.fromCharCode((afterCurrentChar | currentChar) ^ keyChar);
			keyIndex++;
			if (keyIndex >= param2.length) {
				keyIndex = 0;
			}
			i = i + 2;
		}
		return res;
	}
}

module.exports = Crypto;

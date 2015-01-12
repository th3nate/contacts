/* global console, $, jQuery, myContact, myContact2 */
/* jshint eqnull:true */

var ContactsLib = (function($) {
	'use strict';
	/////////////////////
	// Private fields //
	/////////////////////
	
	var 
		/**
		 * Singletone instance of the ContactsBook class
		 * @type {ContactsBook}
		 */
		book,
		/**
		 * @type {Object} Library namespace container
		 */
		ContactsLib = {},
		/**
		 * @type {Object} Static object for contacts validations
		 */
		Validator,
		fields = [
			'id',
			'firstName',
			'lastName',
			'birthDate',
			'phone',
			'workPhone',
			'mobile',
			'email',
			'imageUrl',
			'comments',
			'facebookPage',
			'cssClass'
		];

	/**
	 * Object.defineProperties native function wrapper
	 * makes.. 
	 * @param  {Object} object to modify	
	 * @param  {[type]} 
	 * @return {[type]}
	 */
	function _props(obj, properties) {
		var defaultConfig = {
				enumerable: true,
				configurable: true
			},
			resultConfig = {},
			key = '',
			configObj = {},
			keys = Object.keys(properties),
			_len = keys.length,
			value,
			i;

		for (i = 0; i < _len; ++i) {
			key = keys[i];
			value = properties[key];
			resultConfig[key] = $.extend({
				value: value
			}, defaultConfig);
		}
		Object.defineProperties(obj, resultConfig);
	}

	// shortcut
	function _initProperties(objData, fieldsList) {
		var i,
			attr,
			obj = {};

		fieldsList = (fieldsList == null) ? fields : fieldsList;

		for (i = fieldsList.length; i >= 0; i--) {
			if (fieldsList[i] != null) {
				attr = fieldsList[i];
				obj[attr] = objData[attr];
			}
		}
		return obj;
	}

	// shortcut
	function _inherit(childConstructor, parentConstructor) {
		childConstructor.prototype = Object.create(parentConstructor.prototype);
		childConstructor.prototype.constructor = childConstructor;
	}

	function _parseNumber(numStr) {
		var newstr = numStr.replace(/\D/ig, ''), // Remove all NON digits
			num = {
				prefix: '',
				number: ''
			};
		num.prefix = newstr.slice(0, this.PREFIX_LENGTH); //jshint ignore:line
		num.number = newstr.slice(this.PREFIX_LENGTH);//jshint ignore:line
		return num;
	}

	Validator = {
		email: function(email) {
			var re = /^\w+@[a-z_]+?\.[a-z]{2,3}$/i;
			return (typeof email === 'string' && re.test(email));
		},
		phone: function(phone) {
			//var re = /^\b\d{2,3}-*\d{7}\b$/;
			var re = /^(05[0-478]|0[2-489]|077)(?:-*)(\d{7})$/mg;
			return (phone instanceof PhoneNumber && re.test(phone.fullNumber));

		},
		url: function(url) {
			var re = /((?:https\:\/\/)|(?:http\:\/\/)|(?:www\.))?([a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(?:\??)[a-zA-Z0-9\-\._\?\,\'\/\\\+&%\$#\=~]+)/ig;
			return (typeof url === 'string' && re.test(url));
		},
		imageUrl: function(imageUrl) {
			var re = /^(http\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(?:\/\S*)?(?:[a-zA-Z0-9_])+\.(?:jpg|jpeg|gif|png))$/;
			return (typeof imageUrl === 'string' && re.test(imageUrl));
		},
		mobilePhone: function(mobilePhone) {
			//var re = /^05\d([-]{0,1})\d{7}$/;
			var re = /^(05[0-478]|0[2-489]|077)(?:-*)(\d{7})$/mg;
			return (mobilePhone instanceof PhoneNumber && re.test(mobilePhone.fullNumber));
		}
	};

	function ContactsBook(name) {
		this.lists = {};
		this.name = name;
	}
    
	ContactsBook.getInstance = function(name) {
		if (book == null) {
			book = new ContactsBook(name);
		}
		return book;
	};
	/**
	 * get the highest list's 'id' available
	 * @return {[Number]}
	 */
	ContactsBook.prototype.getListId = function() {
		var i,
			num = 0,
			lists = Object.keys(this.lists),
			len = lists.length;

		for(i=0; i<len; i++){
			if(this.lists[lists[i]].id > num){
				num = this.lists[lists[i]].id
			}
		}
		return num;
	};
	/**
	 * get the highest contact's 'id' available
	 * @return {[Number]}
	 */
	ContactsBook.prototype.getContactId = function() {
		var i,
			num = 0,
			lists = Object.keys(this.lists),
			contacts,
			k,
			len = lists.length,
			len2;

		for(i=0; i<len; i++){
			contacts = this.lists[lists[i]].contacts;
			len2 = contacts.length;
			for(k = 0; k < len2; k++){
				if(contacts[k].id > num){
					num = contacts[k].id;
				}
			}
		}
		return num;
	};
	/**
	 * [get description]
	 * @param  {[type]}
	 * @return {mixed}
	 */
	ContactsBook.prototype.get = function(listName) {
		if (listName in this.lists) {
			return this.lists[listName];
		}
		return null;
	};
	ContactsBook.prototype.delete = function(listName) {
		var list = this.get(listName);
		if (list !== null) {
			delete this.lists[listName];
			return;
		} 
		console.warn('The list you have requested was not found.');
	};

	ContactsBook.prototype.add = function(contactsList, override) {
		if (!(contactsList instanceof ContactsList)) {
			console.warn("Can add only ContactsList instances to ContactsBook" + 
						" List has not been added");
			return;
		}
		override = (override != null) ? !!override : false;

		if (this.get(contactsList.name) !== null && !override) {
			var i,
				len = contactsList.contacts.length;
			for(i = 0; i < len; i++){
				this.lists[contactsList.name].contacts.push(contactsList.contacts[i]);
			}
			console.info("ContactsList already exist, not overriding");
			return;
		}
		this.lists[contactsList.name] = contactsList;
	};

	/**
	 * Given a ContactsList name and Array of Contacts
	 * we create a New ContactsList, OR - 
	 * adding Contact to an existing list
	 * @param  {[ContactsList]} name [pass a ContactsList name]
	 * @param  {[Array]} 		arr  [pass an array of Contacts]
	 * @return {[ContactsList]}      [Returning a list]
	 */
	ContactsBook.prototype.create = function(name, arr) {
		if (this.get(name) !== null) {
			this.lists[name].contacts.push(arr);
			console.info("List already defined, just adding contact.");
		}else{		
			this.lists[name] = new ContactsList(name, arr);
		}
		return this.lists[name];
	};

	function Contact(data) {
		var obj = _initProperties(data, fields);
		_props(this, obj);
	}

	Contact.prototype.validate = function() {
		var result          = [];
		result.phone        = Validator.phone(this.phone);
		result.workPhone    = Validator.phone(this.workPhone);
		result.mobile       = Validator.mobilePhone(this.mobile);
		result.email        = Validator.email(this.email);
		result.imageUrl     = Validator.imageUrl(this.imageUrl);
		result.facebookPage = Validator.url(this.facebookPage);

		return result;
	};

	function WorkContact(data) {

		var obj = _initProperties({
			'color': data.color,
			'position': data.position
		}, ['color', 'position']);
		_props(this, obj);

		Contact.call(this, data);
	}

	_inherit(WorkContact, Contact);

	function PhoneNumber(prefix, number) {
		var fullNumber;

		_props(this, {
			'prefix': prefix,
			'number': number
		});

		Object.defineProperties(this, {
			'fullNumber': {
				get: function() {
					return prefix + number;
				}
			}
		});
	}

	PhoneNumber.parse = function(phoneString) {
		var num = _parseNumber.call(this, phoneString);
		return new PhoneNumber(num.prefix, num.number);
	};

	PhoneNumber.PREFIX_LENGTH = 2;

	function MobilePhoneNumber(prefix, number) {
		PhoneNumber.call(this, prefix, number);
	}

	_inherit(MobilePhoneNumber, PhoneNumber);

	MobilePhoneNumber.parse = function(mobilePhoneString) {
		var num = _parseNumber.call(this, mobilePhoneString);
		return new MobilePhoneNumber(num.prefix, num.number);
	};

	MobilePhoneNumber.PREFIX_LENGTH = 3;

	function ContactsList(name, contacts, id) {
		this.name = name;
		this.contacts = (contacts instanceof Array) ? contacts : [];
        this.id = id || "";
	}
	
	ContactsList.prototype.filter = function(callback) {
		var i, 
		len = this.contacts.length, 
		result = [];
		for (i = 0; i < len; i++) {
			if (callback(this.contacts[i], i, this)) {
				result.push(this.contacts[i]);
			}
		}
		return result;
	};
	ContactsList.prototype.removeBy = function(callback) {
		var i, 
		len = this.contacts.length, 
		result = [];
		for (i = 0; i < len; i++) {
			if (callback(this.contacts[i], i, this)) {
				result.push(this.contacts[i]);
                this.contacts.slice(i, i + 1);
			}
		}
		return result;
	};
	ContactsList.prototype.find = function(id) {
		var i,
			len = this.contacts.length;
		for (i = 0; i < len; i++) {
			if (this.contacts[i].id === id) {
				return this.contacts[i];
			}
		}
	};
	ContactsList.prototype.findBy = function(callback) {
		var i,
			len = this.contacts.length;
		for (i = 0; i < len; i++) {
			if (callback(this.contacts[i], i, this)) {
				return this.contacts[i];
			}
		}
	};

	ContactsLib.ContactsBook      = ContactsBook;
	ContactsLib.Contact           = Contact;
	ContactsLib.WorkContact       = WorkContact;
	ContactsLib.PhoneNumber       = PhoneNumber;
	ContactsLib.MobilePhoneNumber = MobilePhoneNumber;
	ContactsLib.ContactsList      = ContactsList;

	return ContactsLib;

}(jQuery));

/*
var arr = [];
arr.push(new ContactsLib.Contact(...));
arr.push(new ContactsLib.Contact(...));
arr.push(new ContactsLib.Contact(...));
arr.push(new ContactsLib.Contact(...));
arr.push(new ContactsLib.Contact(...));
arr.push(new ContactsLib.Contact(...));
arr.push(new ContactsLib.Contact(...));
arr.push(new ContactsLib.Contact(...));
arr.push(new ContactsLib.Contact(...));
arr.push(new ContactsLib.Contact(...));
arr.push(new ContactsLib.Contact(...));
arr.push(new ContactsLib.Contact(...));

arr.filter(function (contact, index, arrObj) {
	return contact.name.charAt(0).toLowerCase() !== 'a'
});
/////
// Inside Array //
/////
Array.prototype.filter = function (callback) {
	var i, len, result = [];
	for (i = 0, len = this.length; i < len; i++) {
		if (callback(this[i], i, this)) {
			result.push(this[i]);
		}
	}
	return result;
};
*/
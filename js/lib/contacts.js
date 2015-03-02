/* global console, $, jQuery, myContact, myContact2 */
/* jshint eqnull:true */

var ContactsLib = (function($) {
	'use strict';
	
	// Private fields
	var 
		currentListId    = 1,	// @type {Number} Holds the current highest list id.
		currentContactId = 1,	// @type {Number} Holds the current highest contact id.
		book,					// @type {ContactsBook} Singletone instance of the ContactsBook class
		ContactsLib = {},		// @type {Object} Library namespace container 
		Validator,				// @type {Object} Static object for contacts validations
		fields = [				// @type {Array} Array of allowable fields for our contacts
			'id',
			'listId',
			'firstName',
			'lastName',
			'birthDate',
			'phone',
			'workPhone',
			'mobile',
			'email',
			'imageUrl',
			'comments',
			'facebookPage'
		];

	// init a given objects props 
	// with the Object.defineProperties function
	function _props(obj, properties) {
		var defaultConfig = {
				enumerable: true,
				configurable: true,
				writable: true
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

	// shortcut for initialize an object's properties by our allowable list of properties (fieldsList)
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

	// shortcut function to allow inheritance
	function _inherit(childConstructor, parentConstructor) {
		childConstructor.prototype = Object.create(parentConstructor.prototype);
		childConstructor.prototype.constructor = childConstructor;
	}

	// shortcut function to parse phone numbers
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

	// Validator object
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

	/**
	 * Create a ContactsBook from given data
	 * @param {String} name [The name of our ContactsBook]
	 * @return {Contact} [returning a new ContactsBook instance]
	 */
	function ContactsBook(name) {
		this.lists = {};
		this.name  = name;
	}
    
    /**
     * [getInstance description]
	 * @param {String} name [The name of our ContactsBook]
     * @return {ContactsBook (singleton)} [returning a one and only new ContactsBook instance - Singleton Object]
     */
	ContactsBook.getInstance = function(name) {
		if (book == null) {
			book = new ContactsBook(name);
		}
		return book;
	};

	/**
	 * get the next lists 'id'
	 * @return {[Number]} [Return the highest id available plus 1]
	 */
	ContactsBook.prototype.getNextListId = function() {
		var i,
			num = 0,
			lists = Object.keys(this.lists),
			len = lists.length;

		for(i=0; i<len; i++){
			if(this.lists[lists[i]].id > num){
				num = this.lists[lists[i]].id
			}
		}
		return (num + 1);
	};

	/**
	 * [Retrieve a specific contact by its 'id' property]
	 * @param  {[Number]} id [...]
	 * @return {[Contact]}   [Returns the desired contact]
	 */
	ContactsBook.prototype.getContact = function(id){
		var i,
			contact,
			lists = Object.keys(this.lists),
			contacts,
			j,
			len = lists.length,
			len2;

		for(i=0; i<len; i++){
			contacts = this.lists[lists[i]].contacts;
			len2 = contacts.length;
			for(j = 0; j < len2; j++){
				if(contacts[j].id === id){
					contact = contacts[j];
				}
			}
		}
		return contact;
	}

	/**
	 * [Remove a specific contact by its 'id' property]
	 * @param  {[Number]} id [...]
	 */
	ContactsBook.prototype.removeContact = function(id){
		var i,
			contact,
			lists = Object.keys(this.lists),
			contacts,
			k,
			len = lists.length,
			len2;

		for(i=0; i<len; i++){
			contacts = this.lists[lists[i]].contacts;
			len2 = contacts.length;
			for(k = 0; k < len2; k++){
				if(contacts[k].id === id){
					contacts.splice(k, 1);
					return;
				}
			}
		}
		return null;
	}

	/**
	 * get the next contacts 'id'
	 * @return {[Number]} [Return the highest id available plus 1]
	 */
	ContactsBook.prototype.getNextContactId = function() {
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
		return (num + 1);
	};

	/**
	 * [Init all available contacts inside a book]
	 * @return {[Array]} [returns array with all contacts no matter in which list.]
	 */
	ContactsBook.prototype.initContacts = function(){
		var 
			i,
			arr = [],
			lists = Object.keys(this.lists),
			contacts,
			j,
			len = lists.length,
			len2;

		for(i=0; i<len; i++){
			contacts = this.lists[lists[i]].contacts;
			len2 = contacts.length;
			for(j = 0; j < len2; j++){
				arr.push(contacts[j]);
			}
		}
		return arr;
	}

	/**
	 * Init all available contacts inside a list
	 * @param  {[ContactsList]} name [The list to populate]
	 * @return {[Array]} [Returns an array of contacts]
	 */
	ContactsBook.prototype.initContactsList = function(name){
		var 
			i,
			arr      = [],
			contacts = this.lists[name].contacts,
			len      = contacts.length;

			for(i = 0; i < len; i++){
				arr.push(contacts[i]);
			}

		return arr;
	}

	/**
	 * Check if list exsits by passing its name
	 * @param  {String} listName [The name of the list to check]
	 * @return {mixed}           [if the list exists return its name, if not return null]
	 */
	ContactsBook.prototype.get = function(listName) {
		if (listName in this.lists) {
			return this.lists[listName];
		}
		return null;
	};

	/**
	 * Rename a list
	 * @param  {String} listName [The name of the list to check]
	 * @param  {String} newName  [The name of the new list]
	 * @return {mixed}           [if the list exists return its name, if not return null]
	 */
	ContactsBook.prototype.rename = function(listName, newName, newColor) {
		if (this.get(listName)) {
			var 
				list    = this.lists[listName],
				oldList = this.get(listName),
				newColor = newColor || '#337ab7';

			this.create(newName, list.contacts, oldList.id, newColor); // creating the new list
			this.delete(listName); // delete the old list itself
		}
		return null;
	};

	/**
	 * Update list color
	 * @param  {String} listName [The name of the list to check]
	 * @param  {String} color  [The name of the new list]
	 */
	ContactsBook.prototype.updateColor = function(listName, color) {
		if (this.get(listName)) {
			var list    = this.lists[listName];
			list.color = color;
		}
		return null;
	};

	/**
	 * Check if list exsits by passing its name
	 * @param  {Number} id [The id of the list to check]
	 * @return {mixed}     [if the list exists return its name, if not return null]
	 */
	ContactsBook.prototype.getById = function(id) {
		var
			i,
			lists = Object.keys(this.lists),
			list,
			len   = lists.length;

		for(i = 0; i < len; i++){
			list = this.lists[lists[i]];
			if (list.id === id) {
				return list.name;
			}
		}

		return null;
	};

	/**
	 * Delete a list by passing its name
	 * @param  {String} listName [Pass the name of the list to delete]
	 * @return {null}
	 */
	ContactsBook.prototype.delete = function(listName) {
		var list = this.get(listName);
		if (list !== null) {
			delete this.lists[listName];
			return;
		} 
		console.warn('The list you have requested was not found.');
	};

	/**
	 * Add a ContactsList to the book
	 * @param {ContactsList}	contactsList [Pass the ContactsList]
	 * @param {Boolean}			override     [If true we overwrite exsisting list]
	 */
	ContactsBook.prototype.add = function(contactsList, override) {
		if (!(contactsList instanceof ContactsList)) {
			console.warn('Can add only ContactsList instances to ContactsBook' + 
						' List has not been added');
			return;
		}
		override = (override != null) ? !!override : false;

		if (this.get(contactsList.name) !== null && !override) {
			var i,
				len = contactsList.contacts.length;
			for(i = 0; i < len; i++){
				this.lists[contactsList.name].contacts.push(contactsList.contacts[i]);
			}
			console.info('ContactsList already exist, not overriding');
			return;
		}
		this.lists[contactsList.name] = contactsList;
	};

	/**
	 * Move a contact to another list
	 * @param  {[ContactList]} 	currentList [The list in which the contact's currently in.]
	 * @param  {[ContactList]} 	destList    [The list to move the contact's to.]
	 * @param  {[Contact]} 		contact     [The contact to move]
	 */
	ContactsBook.prototype.allocateContact = function(currentList, destList, contact){
		var
			i,
			contacts = this.lists[currentList].contacts,
			len      = this.lists[currentList].contacts.length;
		
		this.removeContact(contact.id);
		this.create(destList, [contact]);
	}

	/**
	 * Move an array of contacts between lists
	 * @param  {[ContactList]} 	destList    [The list to move the contact's to]
	 * @param  {[Contact]} 		contacts    [The contact to move]
	 */
	ContactsBook.prototype.sortContacts = function(destList, contacts){
		var
			i,
			contact,
			currentList,
			destListName = this.getById(destList),
			arr          = [],
			len          = contacts.length;

		for (i = 0; i < len; i++){
			contact        = this.getContact(contacts[i]);
			currentList    = this.getById(contact.listId);
			contact.listId = destList; // Update the Contact's listId property
			this.allocateContact(currentList, destListName, contact);
		}
	}

	/**
	 * Given a ContactsList name and Array of Contacts
	 * we create a New ContactsList, OR - 
	 * adding Contact to an existing list
	 * @param  {[ContactsList]} name 	[pass a ContactsList name]
	 * @param  {[Array]} 		arr  	[pass an array of Contacts]
	 * @param  {[Number]} 		id   	[pass an id of the list (Optional)]
	 * @param  {[String]} 		color   [pass the color of the list (Optional)]
	 * @return {[ContactsList]}      	[Returning a list]
	 */
	ContactsBook.prototype.create = function(name, arr, id, color) {
		id    = id || this.getNextListId();
		color = color || '#337ab7';

		if (this.get(name) !== null) { // if the list exists
			this.lists[name].contacts = this.lists[name].contacts.concat(arr); // adding array of contacts (can be array of one) into exsisting array of contacts with Array.concat
			console.info('List already defined, just adding contact/s.');
		}else{		
			this.lists[name] = new ContactsList(name, arr, id, color);
		}
		return this.lists[name];
	};

	/**
	 * Create a contact from given data
	 * @param {Object} data [Object containing the fields of the contact]
	 * @return {Contact} [returning a new Contact instance]
	 */
	function Contact(data) {

		var obj = _initProperties(data, fields);

		if(typeof obj.phone === 'string'){ // if phone number is a string and not a New Number then make it one.
			obj.phone = ContactsLib.PhoneNumber.parse(data.phone);
		}
		if(typeof obj.workPhone === 'string'){ // if workPhone number is a string and not a New Number then make it one.
			obj.workPhone = ContactsLib.PhoneNumber.parse(data.workPhone);
		}
		if(typeof obj.mobile === 'string'){ // if mobile number is a string and not a New Number then make it one.
			obj.mobile = ContactsLib.MobilePhoneNumber.parse(data.mobile);
		}

		_props(this, obj);
	}

	/**
	 * Edit a contact by passing object with its new fields
	 * @param  {Object} data [Object containing the fields of the contact]
	 */
	Contact.prototype.editContact = function(data){
		Contact.call(this, data);
	}

	/**
	 * Validator for validating input fields
	 * @return {Array} [Return an array of resulted validation]
	 */
	Contact.prototype.validate = function() {
		var result          = {};
		result.phone        = Validator.phone(this.phone);
		result.workPhone    = Validator.phone(this.workPhone);
		result.mobile       = Validator.mobilePhone(this.mobile);
		result.email        = Validator.email(this.email);
		result.imageUrl     = Validator.imageUrl(this.imageUrl);
		result.facebookPage = Validator.url(this.facebookPage);

		return result;
	};

	/**
	 * Create a work contact from given data
	 * @param {Object} data [Object containing the fields of the contact]
	 * @return {WorkContact} [returning a new WorkContact instance]
	 */
	function WorkContact(data) {

		var obj = _initProperties({
			'color': data.color,
			'position': data.position
		}, ['color', 'position']);
		_props(this, obj);

		if(typeof obj.phone === 'string'){ // if phone number is a string and not a New Number then make it one.
			obj.phone = ContactsLib.PhoneNumber.parse(data.phone);
		}
		if(typeof obj.workPhone === 'string'){ // if workPhone number is a string and not a New Number then make it one.
			obj.workPhone = ContactsLib.PhoneNumber.parse(data.workPhone);
		}
		if(typeof obj.mobile === 'string'){ // if mobile number is a string and not a New Number then make it one.
			obj.mobile = ContactsLib.MobilePhoneNumber.parse(data.mobile);
		}

		Contact.call(this, data);
	}

	// Allow inheritance
	_inherit(WorkContact, Contact);

	/**
	 * Edit a work contact by passing object with its new fields
	 * @param  {Object} data [Object containing the fields of the contact]
	 */
	WorkContact.prototype.editWorkContact = function(data){
		WorkContact.call(this, data);
	};

	/**
	 * Create a PhoneNumber type object
	 * @param {String} prefix 
	 * @param {String} number 
	 * @return {PhoneNumber} [returning a new PhoneNumber instance]
	 */
	function PhoneNumber(prefix, number) {
		var fullNumber;

		_props(this, {
			'prefix': prefix,
			'number': number
		});

		Object.defineProperties(this, {
			'fullNumber': {
				get: function() {
					return prefix +'-'+ number;
				}
			}
		});
	}

	/**
	 * Given a phone number we remove unwanted charecters
	 * @param  {String} phoneString [Pass the phone number]
	 * @return {PhoneNumber}        [returning a new PhoneNumber instance]
	 */
	PhoneNumber.parse = function(phoneString) {
		var num = _parseNumber.call(this, phoneString);
		return new PhoneNumber(num.prefix, num.number);
	};

	// Set the default prefix length
	PhoneNumber.PREFIX_LENGTH = 2;

	/**
	 * Create a MobilePhoneNumber type object
	 * @param {String} prefix 
	 * @param {String} number 
	 * @return {MobilePhoneNumber} [returning a new MobilePhoneNumber instance]
	 */
	function MobilePhoneNumber(prefix, number) {
		PhoneNumber.call(this, prefix, number);
	}

	// Allow inheritance
	_inherit(MobilePhoneNumber, PhoneNumber);

	/**
	 * Given a phone number we remove unwanted charecters
	 * @param  {String} phoneString [Pass the phone number]
	 * @return {MobilePhoneNumber}        [returning a new MobilePhoneNumber instance]
	 */
	MobilePhoneNumber.parse = function(mobilePhoneString) {
		var num = _parseNumber.call(this, mobilePhoneString);
		return new MobilePhoneNumber(num.prefix, num.number);
	};

	// Set the default prefix length
	MobilePhoneNumber.PREFIX_LENGTH = 3;

	/**
	 * Create a ContactsList type object
	 * @param {String} 	name    	[The contacts list name]
	 * @param {Array} 	contacts 	[Array of Contacts (Optional)]
	 * @param {Number} 	id      	[The id of the list (Optional)]
	 */
	function ContactsList(name, contacts, id, color) {
		this.name     = name;
		this.contacts = (contacts instanceof Array) ? contacts : [];
        this.id       = id || '';
        this.color    = color || '#337ab7';
	}
	
	/**
	 * Convert a Contact from WorkContact to Contact and vice versa
	 * @param  {Contact/WorkContact} contact [Passing the contact we wish to convert]
	 * @return {Contact/WorkContact}		[returning the converted contact]
	 */
	ContactsList.prototype.convert = function(contact){
		if(contact instanceof WorkContact){
			contact = new Contact(contact);
		}else{
			contact = new WorkContact(contact);
		}
		return contact;
	}

	/**
	 * A method for filtering a contact list by specified function
	 * @param  {Function} callback [Passing a function to filter by]
	 * @return {Array}             [Returning a filtered array]
	 */
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

	/**
	 * A method for removing a contact from a list by specified function
	 * @param  {Function} callback [Passing a function to filter by]
	 * @return {Array}             [Returning a filtered array]
	 */
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

	/**
	 * A method for finding a contact in a list by specified function
	 * @param  {Function} 	callback [Passing a function to filter by]
	 * @return {Contact/WorkContact} [Returning the contact]
	 */
	ContactsList.prototype.findBy = function(callback) {
		var i,
			len = this.contacts.length;
		for (i = 0; i < len; i++) {
			if (callback(this.contacts[i], i, this)) {
				return this.contacts[i];
			}
		}
	};

	/**
	 * Delete a contact by its id
	 * @param  {Contact.id} id [pass the contacts id]
	 * @return {[null]}
	 */
	ContactsList.prototype.delete = function(id) {
		var i,
			contacts = this.contacts,
			len      = this.contacts.length;

		for(i = 0; i < len; i++){
			if(contacts[i].id === id){
				contacts.splice(i, 1);
				return;
			}
		}
		return null;
	};	

	/**
	 * Delete all contacts inside a list
	 * @return {[null]}
	 */
	ContactsList.prototype.deleteAll = function() {
		var i,
			contacts = this.contacts,
			len      = this.contacts.length;

		for(i = 0; i < len; i++){
			contacts.pop(i);
		}
		return null;
	};	

	/**
	 * Adding a contact to a list
	 * @param {Contact} contact [pass the desired Contact's Object]
	 */
	ContactsList.prototype.add = function(contact) {
		this.contacts.push(contact);
	};

	/**
	 * Find a contact in a list
	 * @param {Number} 				id 	[pass the desired Contact's id]
	 * @return {Contact/WorkContact} 	[Return the Contact]
	 */
	ContactsList.prototype.find = function(id) {
		var i,
			len = this.contacts.length;
		for (i = 0; i < len; i++) {
			if (this.contacts[i].id === id) {
				return this.contacts[i];
			}
		}
	};

	// Make our functions accessible outside the library
	ContactsLib.ContactsBook      = ContactsBook;
	ContactsLib.Contact           = Contact;
	ContactsLib.WorkContact       = WorkContact;
	ContactsLib.PhoneNumber       = PhoneNumber;
	ContactsLib.MobilePhoneNumber = MobilePhoneNumber;
	ContactsLib.ContactsList      = ContactsList;

	return ContactsLib;

}(jQuery));
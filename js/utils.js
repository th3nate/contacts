/**
 * Build a select element from available 
 * lists in ContactsBook
 * @param  {jQuery} 	$select [the select element to use]
 * @param  {Singeleton} book    [ContactsBook to search lists in]
 * @return {HTML}         		[Returning the $select element filled with options]
 */
function buildContactsListsSelect ($select, book){
	if(book instanceof ContactsLib.ContactsBook && $select.is("select")){
		var lists = Object.keys(book.lists),
			str = '',
			i,
			index,
			val,
			doc = $(document.createDocumentFragment()),
			len = lists.length;

		$select.find("option:not(.static)").remove(); // Remove all options but static ones.

		for(i = 0; i < len; i++){
			index  = lists[i];
			val    = book.lists[index];
			doc.append($('<option>', { 
				value: val.id,
				text : val.name 
			}));
		}
		$select.find('option:last').before(doc);
	}
}

/**
 * Build a list out of available 
 * lists in ContactsBook
 * @param  {jQuery} 	$elm 	[the element where to inject the list to]
 * @param  {Singeleton} book    [ContactsBook to search lists in]
 * @return {HTML}         		[Returning the $select element filled with options]
 */
function buildContactsLists ($elm, book){
	if(book instanceof ContactsLib.ContactsBook){
		var lists = Object.keys(book.lists),
			str = '',
			i,
			index,
			val,
			doc = $(document.createDocumentFragment()),
			len = lists.length;

		$elm.find(".list-item").remove(); // Remove all options.

		for(i = 0; i < len; i++){
			index  = lists[i];
			val    = book.lists[index];
			doc.append(
				$('<span>', { 
					'class': "list-item white-border label label-primary",
					'style': "border-bottom: 3px solid "+val.color+";"
				}).wrapInner(
					$('<a>', { 
						'data-type':  'list',
						'class':     'list-link',
						'href':      '#'+val.id,
						'data-list': val.id,
						'text':      val.name
					})
				).prepend('\
							<a href="#" class="list-delete" aria-label="Delete list" role="button" data-toggle="modal" data-target="#modal-delete">\
								<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>\
							</a>\n')
			);
			doc.append("\n"); // just for spacing between each item in the list
		}
		$elm.append(doc);
	}
}

function parseContact(contact){
	var 
		isWorkContact = (contact instanceof ContactsLib.WorkContact) ? true : false,
		phone         = (contact.phone.fullNumber !== null) ? phone = contact.phone.fullNumber : phone = contact.phone,
		workPhone     = (contact.workPhone.fullNumber !== null) ? workPhone = contact.workPhone.fullNumber : workPhone = contact.workPhone,
		mobile        = (contact.mobile.fullNumber !== null) ? mobile = contact.mobile.fullNumber : mobile = contact.mobile;
	
	return {
		contact:       contact,
		isWorkContact: isWorkContact,
		phone:         phone,
		workPhone:     workPhone,
		mobile:        mobile
	}
}

/**
 * Create Contact DOM widget
 * @param  {Contact}  		contact      	[The Contact to draw]
 * @param  {ContactsBook}  	list    		[The Book in which the contact is at]
 * @return {[type]}                			[Returns a string of HTML]
 */
function createContactWidget(contact, book){
	
	var obj     = parseContact(book.getContact(contact.id)),
		list    = book.getById(obj.contact.listId),	 // only to get the list's color
		listObj = book.get(list),					 // only to get the list's color
		color   = listObj.color,					 // only to get the list's color
		item    = '\
		<div class="col-xs-12 col-sm-4 col-md-4 contact-item-wrapper">\
			<div data-group="'+obj.contact.listId+'" class="thumbnail contact-item relative" style="border-left: 3px solid '+color+';">\
				<div class="col-xs-4 col-sm-6 col-md-6">\
					<img src="'+obj.contact.imageUrl+'" alt="'+obj.contact.firstName+' '+obj.contact.lastName+'" class="img-responsive img-circle" />\
				</div>\
				<div class="col-xs-8 col-sm-6 col-md-6">\
					<h4 class="name">'+obj.contact.firstName+' '+obj.contact.lastName+'</h4>\
					<span class="glyphicon glyphicon-envelope text-muted c-info" data-toggle="tooltip" title="'+obj.contact.email+'"></span>\
					<span class="visible-xs"><span class="text-muted">'+obj.contact.email+'</span><br /></span>\
					<span class="glyphicon glyphicon-phone text-muted c-info" data-toggle="tooltip" title="'+obj.mobile+'"></span>\
					<span class="visible-xs"><span class="text-muted">'+obj.mobile+'</span><br /></span>\
					<span class="glyphicon glyphicon-gift text-muted c-info" data-toggle="tooltip" title="'+obj.contact.birthDate+'"></span>\
					<span class="visible-xs"><span class="text-muted">'+obj.contact.birthDate+'</span><br /></span>\
					';
			if(obj.isWorkContact){							
				item += '\
					<span class="glyphicon glyphicon-star text-muted c-info" data-toggle="tooltip" title="'+obj.contact.position+'"></span>\
					<span class="visible-xs"><span class="text-muted">'+obj.contact.position+'</span><br /></span>\
					<span class="glyphicon glyphicon-star text-muted c-info" data-toggle="tooltip" title="'+obj.contact.color+'"></span>\
					<span class="visible-xs"><span class="text-muted">'+obj.contact.color+'</span><br /></span>\
					';
			}							
				item += '\
					<span class="glyphicon glyphicon-earphone text-muted c-info" data-toggle="tooltip" title="'+obj.phone+'"></span>\
					<span class="visible-xs"><span class="text-muted">'+obj.phone+'</span><br /></span>\
					<span class="glyphicon glyphicon-briefcase text-muted c-info" data-toggle="tooltip" title="'+obj.workPhone+'"></span>\
					<span class="visible-xs"><span class="text-muted">'+obj.workPhone+'</span><br /></span>\
					<a href="'+obj.contact.facebookPage+'"><span class="glyphicon glyphicon-link text-muted c-info" data-toggle="tooltip" title="See my FB page"></span>\
					<span class="visible-xs"><span class="text-muted break-word">See my FB page</span></span></a>\
					<br />\
					<a data-toggle="collapse" href="#collapse-'+obj.contact.id+'" aria-expanded="false" aria-controls="collapse-'+contact.id+'"><i class="glyphicon glyphicon-comment text-muted"></i> Show more</a>\
				</div>\
				<a href="#" class="pos-icon-top edit-contact" data-cid="'+obj.contact.id+'" data-tooltip="true" title="Edit contact" data-toggle="modal" data-target="#contact-modal"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></a>\
				<input type="checkbox">\
				<div class="clearfix"></div>\
				<div class="collapse" id="collapse-'+obj.contact.id+'">\
					<div class="well comments">\
						<span class="text-muted break-word">'+obj.contact.comments+'</span>\
					</div>\
				</div>\
			</div>\
		</div>';

	return item;
}

/**
 * Draw all available contacts
 * @param  {ContactsBook}	book  [The Contacts available inside the book]
 * @return {[String]}             [Returns a string of HTML]

function drawContacts(book, $container){
	var
		contacts = book.initContacts(),
		i,
		contactHTML,
		isWorkContact,
		len = contacts.length;

	$container = ($container === undefined) ? $container = $("#contacts") : $container;
	
	$container.empty();

	for(i = 0; i < len; i++){
		isWorkContact = (contacts[i] instanceof ContactsLib.WorkContact) ? true : false;
		contactHTML   = createContactWidget(contacts[i], book, isWorkContact);
		arrangeContactsDom(contactHTML);
	}
}
*/

/**
 * Draw all available contacts in a book or a list
 * @param  {ContactsBook}	book    [The Contacts available inside the book]
 * @param  {Integer}		listId  [OPTIONAL: the list's id]
 * @return {[String]}               [Returns a string of HTML]
 */
function drawContacts(book, listId, $container){
	var
		i,
		contactHTML,
		isWorkContact,
		list = book.getById(listId), // gets the name of the list by its id
		contacts,
		len; 
	
	if(listId === 0 || listId === undefined || list === null){
		contacts = book.initContacts(); // returns an array of all contacts inside a list
	}else{
		contacts = book.initContactsList(list)
	}
		len = contacts.length;

	$container = ($container === undefined) ? $container = $("#contacts") : $container;
	
	$container.empty();

	for(i = 0; i < len; i++){
		isWorkContact = (contacts[i] instanceof ContactsLib.WorkContact) ? true : false;
		contactHTML   = createContactWidget(contacts[i], book, isWorkContact);
		arrangeContactsDom(contactHTML);
	}
}

/**
 * Takes a createContactWidget Output and 
 * arrange it inside a given container
 * @param  {[String]} contact    [description]
 * @param  {[jQuery]} $container [if nothing passes to the function there's a fallback to default]
 * @param  {[jQuery]} $row       [if nothing passes to the function there's a fallback to default]
 * @return {[HTML]}            	 [Arranges the contact inside a given container]
 */
function arrangeContactsDom(contact, $container, $row){
	$container = ($container === undefined) ? $container = $("#contacts") : $container;
	$row 	   = ($row === undefined) ? $row = $("div[data-role='wrapper']") : $row;

	if($row.last().length > 0 && $row.last().children().length < 3){ // If row exists on page and items in it does not exceed 3
		$container.find($row.last()).append(contact);
	}else{ // If row doesn't exists on page OR items in row exceed 3
		$container.append('<div class="row" data-role="wrapper">'+contact+'</div>');
	}
}

/**
 * Get the contacts for sorting
 * @return {Array} Return an array of Contact's id.
 */
function getSortItems (){
	
	var checkedItems = [];
	
	$("#contacts .active").each(function(idx, el) {
		checkedItems.push($(el).find("a.edit-contact").data('cid'));
	});

	return checkedItems;
}

/**
 * Update the menu items according to the listId we are in.
 * @param  {Number} listId [the list id number]
 */
function navigation (listId) {

	viewLocation = listId; // Update the current list we're viewing.
	$('a[data-list]')
		.parent()
		.removeClass('label-success'); 

	$('a[data-list='+listId+']')
		.click()
		.parent()
		.addClass('label-success');
}

/**
 * [dbStore description]
 * @param  {[type]} book [description]
 * @return {[type]}      [description]
 */
function dbStore (book){

	// Put the object into storage
	localStorage.setItem('book', JSON.stringify(book));
	console.log(book, 'Stored Succesfully!');	
}

/**
 * [dbFetch description]
 * @param  {[type]} book [description]
 * @return {[type]}      [description]
 */
function dbFetch (book){

	if(localStorage.book) { // if the book is stored
		// Retrieve the object from storage
		var retrievedObject = localStorage.getItem('book');
		console.log('retrievedObject: ', JSON.parse(retrievedObject));
		
		return JSON.parse(retrievedObject);	
	}else{
		return false;
	}	
}

function dbRestore (obj){

	var i,
		obj      = (typeof obj == 'object') ? obj : JSON.parse(obj),
		bookName = obj.name,
		book     = ContactsLib.ContactsBook.getInstance(bookName), // Create a ContactsBook Singleton object
		lists    = obj.lists,
		listsLen = Object.keys(lists).length;

	// Create lists
	for (var i = 0, len = listsLen; i < len; i++){
		var 
			curListName = Object.keys(lists)[i],
			curList     = lists[curListName],
			newList     = new ContactsLib.ContactsList(curList.name, [], curList.id, curList.color);
			
		book.add(newList); // add the new list to the book
		
		// Create contacts
		for (var j = 0, len2 = curList.contacts.length; j < len2; j++){
			var 
				contact           = curList.contacts[j],
				isWorkContact     = contact.isWorkContact;
				
			// contact.phone     = curList.contacts[j].phone.fullNumber;
			// contact.workPhone = curList.contacts[j].workPhone.fullNumber;
			// contact.mobile    = curList.contacts[j].mobile.fullNumber;

			if (!isWorkContact) {
				newContact = new ContactsLib.Contact(contact);
			} else {
				newContact = new ContactsLib.WorkContact(contact);
			}
			newList.add(newContact);
		}
	}
	console.log('buildStore (obj) : ', book);
	return book;
}

// Validator object
formValidation = {
	email: function(email) {
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return (typeof email === 'string' && re.test(email));
	},
	phone: function(phone) {
		var re = /^(05[0-478]|0[2-9]|077)(?:-*)(\d{7})$/mg;
		return (typeof phone === 'string' && re.test(phone));
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
		var re = /^(05[0-8]|0[2-489]|077)(?:-*)(\d{7})$/mg;
		return (typeof mobilePhone === 'string' && re.test(mobilePhone));
	},
	hex: function(hex) {
		var re = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
		return (typeof hex === 'string' && re.test(hex));
	}
};

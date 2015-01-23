(function ($) {

})(jQuery);

var contactTemplate = Handlebars.compile($('#contact-template').html());

/**
 * Build a select element form available 
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
function parseContact(contact){
	var 
		isWorkContact = (contact.constructor.name === "WorkContact") ? true : false,
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
	
	var contact = book.getContact(contact.id);
	return contactTemplate(contact);
}

/**
 * Build all available contacts
 * @param  {ContactsBook}	book  [The Contacts available inside the book]
 * @return {[String]}             [Returns a string of HTML]
 */
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
		isWorkContact = (contacts[i].constructor.name === "WorkContact") ? true : false;
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

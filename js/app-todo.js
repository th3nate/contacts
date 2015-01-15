/**
 * Build a select element form available 
 * lists in ContactsBook
 * @param  {jQuery} 	$select [the select element to use]
 * @param  {Singeleton} book    [ContactsBook to search lists in]
 * @return {HTML}         		[Returning the $select element filled with options]
 */
function buildContactsListsSelect ($select, book){
	if(book.constructor.name === "ContactsBook" && $select.is("select")){
		var lists = Object.keys(book.lists),
			str = '',
			i,
			index,
			val,
			len = lists.length;
		/* Using $each loop
		$.each(book.lists, function(index, val) {
			if($select.find('option[value="'+val.id+'"]').length <= 0){ // if option already exists, dont write it again.
				$select.find('option:last').before($('<option>', { 
					value: val.id,
					text : val.name 
				}));
			}
		});*/
		for(i = 0; i < len; i++){
			index  = lists[i];
			val    = book.lists[index];
			if($select.find('option[value="'+val.id+'"]').length <= 0){ // if option already exists, dont write it again.
				$select.find('option:last').before($('<option>', { 
					value: val.id,
					text : val.name 
				}));
			}
		}

	}
}

/**
 * Create Contact DOM widget
 * @param  {Contact}  		contact      	[The Contact to draw]
 * @param  {ContactsBook}  	list    		[The Book in which the contact is at]
 * @return {[type]}                			[Returns a string of HTML]
 */
function createContactWidget(contact, book){
	var contact       = book.getContact(contact.id),
		isWorkContact = (contact.constructor.name === "WorkContact") ? true : false,
		phone         = (contact.phone.fullNumber !== null) ? phone = contact.phone.fullNumber : phone = contact.phone,
		workPhone     = (contact.workPhone.fullNumber !== null) ? workPhone = contact.workPhone.fullNumber : workPhone = contact.workPhone,
		mobile        = (contact.mobile.fullNumber !== null) ? mobile = contact.mobile.fullNumber : mobile = contact.mobile,
		item          = '\
		<div class="col-xs-12 col-sm-4 col-md-4 contact-item-wrapper">\
			<div data-group="'+contact.cssClass+'" class="thumbnail contact-item relative">\
				<div class="col-xs-4 col-sm-6 col-md-6">\
					<img src="'+contact.imageUrl+'" alt="'+contact.firstName+' '+contact.lastName+'" class="img-responsive img-circle" />\
				</div>\
				<div class="col-xs-8 col-sm-6 col-md-6">\
					<h4 class="name">'+contact.firstName+' '+contact.lastName+'</h4>\
					<span class="glyphicon glyphicon-envelope text-muted c-info" data-toggle="tooltip" title="'+contact.email+'"></span>\
					<span class="visible-xs"><span class="text-muted">'+contact.email+'</span><br /></span>\
					<span class="glyphicon glyphicon-phone text-muted c-info" data-toggle="tooltip" title="'+mobile+'"></span>\
					<span class="visible-xs"><span class="text-muted">'+mobile+'</span><br /></span>\
					<span class="glyphicon glyphicon-gift text-muted c-info" data-toggle="tooltip" title="'+contact.birthDate+'"></span>\
					<span class="visible-xs"><span class="text-muted">'+contact.birthDate+'</span><br /></span>\
					';
			if(isWorkContact){							
				item += '\
					<span class="glyphicon glyphicon-star text-muted c-info" data-toggle="tooltip" title="'+contact.position+'"></span>\
					<span class="visible-xs"><span class="text-muted">'+contact.position+'</span><br /></span>\
					<span class="glyphicon glyphicon-star text-muted c-info" data-toggle="tooltip" title="'+contact.color+'"></span>\
					<span class="visible-xs"><span class="text-muted">'+contact.color+'</span><br /></span>\
					';
			}							
				item += '\
					<span class="glyphicon glyphicon-earphone text-muted c-info" data-toggle="tooltip" title="'+phone+'"></span>\
					<span class="visible-xs"><span class="text-muted">'+phone+'</span><br /></span>\
					<span class="glyphicon glyphicon-briefcase text-muted c-info" data-toggle="tooltip" title="'+workPhone+'"></span>\
					<span class="visible-xs"><span class="text-muted">'+workPhone+'</span><br /></span>\
					<a href="'+contact.facebookPage+'"><span class="glyphicon glyphicon-link text-muted c-info" data-toggle="tooltip" title="See my FB page"></span>\
					<span class="visible-xs"><span class="text-muted break-word">See my FB page</span></span></a>\
					<br />\
					<a data-toggle="collapse" href="#collapse-'+contact.id+'" aria-expanded="false" aria-controls="collapse-'+contact.id+'"><i class="glyphicon glyphicon-comment text-muted"></i> Show more</a>\
				</div>\
				<a href="#" class="pos-icon-top edit-contact" data-cid="'+contact.id+'" data-tooltip="true" title="Edit contact" data-toggle="modal" data-target="#contact-modal"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></a>\
				<input type="checkbox">\
				<div class="clearfix"></div>\
				<div class="collapse" id="collapse-'+contact.id+'">\
					<div class="well comments">\
						<span class="text-muted break-word">'+contact.comments+'</span>\
					</div>\
				</div>\
			</div>\
		</div>';

	return item;
}

/**
 * Build all available contacts
 * @param  {ContactsBook}	book  [The Contacts available inside the book]
 * @return {[String]}             [Returns a string of HTML]
 */
function drawContacts(book){
	var
		contacts = book.initContacts(),
		i,
		contactHTML,
		isWorkContact,
		len = contacts.length;

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

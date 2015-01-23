// DOM ready
$(function () {
	////////////////
	// Variables //
	////////////////
	var $container 	      = $("#contacts"),
		$form             = $("#contact-form"),
		$fields           = $form.find("input, textarea, select"),
		$select           = $form.find("select#group-assign"),
		$chkBox           = $form.find("input#is-work-contact"),
		$inp_firstName    = $form.find("#first-name"),
		$inp_lastName     = $form.find("#last-name"),
		$inp_birthDate    = $form.find("#birth-date"),
		$inp_phone        = $form.find("#phone"),
		$inp_workPhone    = $form.find("#work-phone"),
		$inp_mobile       = $form.find("#mobile"),
		$inp_email        = $form.find("#email"),
		$inp_imageUrl     = $form.find("#image-url"),
		$inp_facebookPage = $form.find("#facebook-page"),
		$inp_comments     = $form.find("#comments"),
		$inp_id   		  = $form.find("#id"),
		$modal            = $("#contact-modal"),
        contactId 	      = myBook.getContactId(),
		orgTitle          = $modal.find("#modal-title").html(),
		promise           = $.getJSON('data/MOCK_DATA_REGULAR.json'),
		isWorkContact,
		domElWork         = '\
				<input type="text" name="position" id="position" class="form-control input-lg" placeholder="Position" tabindex="12">\
				<input type="text" name="color" id="color" class="form-control input-lg" placeholder="Color" tabindex="12">\
				',
		domElUser         = '<input type="text" name="new-user-list" id="new-user-list" class="form-control input-lg" placeholder="Enter groups name" tabindex="12">';	
	
	////////////////////////////////
	// TODO: Mock data REMOVE     //
	////////////////////////////////
	$inp_firstName.val("Nate")
	$inp_lastName.val("Cook");
	$inp_birthDate.val("04/12/1978");
	$inp_phone.val("03-6049741");
	$inp_workPhone.val("03-6043386");
	$inp_mobile.val("052-5118833");
	$inp_email.val("natanel7@gmail.com");
	$inp_imageUrl.val("http://api.randomuser.me/portraits/men/49.jpg");
	$inp_facebookPage.val("http://facebook.com");
	$inp_comments.val("For performance reasons, all icons require a base class and individual icon class. To use, place the following code just about anywhere. Be sure to leave a space between the icon and text for proper padding.");

	// Update the DOM with the current Contact id
	$inp_id.val((contactId + 1));

	//////////////////////
	// init checkboxes //
	//////////////////////
	function addCheckboxes(){
        
		$('.contact-item').each(function () {
			var $widget = $(this),
				$input = $widget.find('input'),
				type = $input.attr('type');
				settings = {
					checkbox: {
						on: { icon: 'glyphicon glyphicon-check' },
						off: { icon: 'glyphicon glyphicon-unchecked' }
					},
					radio: {
						on: { icon: 'glyphicon glyphicon-check' },
						off: { icon: 'glyphicon glyphicon-unchecked' }
					}
				};
				
			if($widget.find("span.state-icon").length <= 0){ // If checkbox exists, dont create it again.

				$widget.prepend('<span class="pos-icon state-icon ' + settings[type].off.icon + '"  data-toggle="tooltip" title="Click to sort contact"></span>');
				
				$widget.find('.state-icon').on('click', function () {
					$input.prop('checked', !$input.is(':checked'));
					updateDisplay();
				});

				function updateDisplay() {
					var isChecked = $input.is(':checked') ? 'on' : 'off';
						
					$widget.find('.state-icon').attr('class', 'pos-icon state-icon '+settings[type][isChecked].icon);
					
					//Just for desplay
					isChecked = $input.is(':checked') ? 'alert-warning active' : '';

					$widget
					.removeClass("alert-warning active")
					.addClass(isChecked);
				}
				
				updateDisplay();
			}
		});
	}

	//////////////////////////////////////////////////////////
	// get items data on click and write it to DOM element //
	//////////////////////////////////////////////////////////
	$('#get-checked-data').on('click', function(e) {
		
		$("#output-data").empty();
		
		var checkedItems = {
				idx: '',
				name: '',
				cid: ''};

		if($("#output-data").length <= 0){
			$('.jumbotron').append('<p id="output-data"></p>');
		}
		
		$("#contacts .active").each(function(idx, el) {
			checkedItems.idx   = idx;
			checkedItems.name = $(el).find(".name").text();
			checkedItems.cid  = $(el).find("a.edit-contact").data('cid');
			$("#output-data").append(JSON.stringify(checkedItems, null, '\t') + "<br/>");
		});
		e.preventDefault(); 
	});

	////////////////////
	// init Tooltips //
	////////////////////
	$('body').tooltip({
		selector: '[data-toggle="tooltip"], [data-tooltip="true"]'
	});

	//////////////////////////////////
	// init jquery UI - DatePicker //
	//////////////////////////////////
	$("#birth-date").datepicker({
		dateFormat: "dd/mm/yy",
		showAnim: "slideDown"
	});

	////////////////////////////////////////////////
	// Control for Form "select" element options //
	////////////////////////////////////////////////
	function showWorkFields(){

		var	isWorkContactChk = ($chkBox.is(':checked')) ? true : false;

		if(isWorkContactChk && $("#position").length <= 0){
			$select.closest('div').append(domElWork);
		}else{
			$select.closest('div').find("#position, #color").remove();
		}
	}

	//////////////////////////////////////////////
	// Control for modal interaction : Show     //
	//////////////////////////////////////////////
	$modal.on('show.bs.modal', function (e) {
		var 
			obj          = {},
			button       = $(e.relatedTarget), // Button that triggered the modal
			cid     	 = button.data('cid'), // Extract info from data-* attributes
			$modalWindow = $(this);

		if(cid >= 0){ // If we are in Edit mode.
			obj = parseContact(myBook.getContact(cid));

			$modalWindow.find('#modal-title').text('Edit: (' + obj.contact.id + ') ' + obj.contact.firstName + ' ' + obj.contact.lastName);
			$inp_firstName.val(obj.contact.firstName);
			$inp_lastName.val(obj.contact.lastName);
			$inp_birthDate.val(obj.contact.birthDate);
			$inp_phone.val(obj.phone);
			$inp_workPhone.val(obj.workPhone);
			$inp_mobile.val(obj.mobile);
			$inp_email.val(obj.contact.email);
			$inp_imageUrl.val(obj.contact.imageUrl);
			$inp_facebookPage.val(obj.contact.facebookPage);
			$inp_comments.val(obj.contact.comments);
			$select.find("option[value='"+obj.contact.listId+"']").prop('selected', true);
			$inp_id.val(obj.contact.id);
			
			if(obj.isWorkContact === true){
				$chkBox.prop('checked', true);
				showWorkFields();
				$form.find("#position").val(obj.contact.position);
				$form.find("#color").val(obj.contact.color);
			}

		}else{ // If we are in a New contact mode.
			$modalWindow.find('#modal-title').html(orgTitle);
			
			////////////////////////////////
			// TODO: Mock data REMOVE     //
			////////////////////////////////
			$inp_firstName.val("Nate")
			$inp_lastName.val("Cook");
			$inp_birthDate.val("04/12/1978");
			$inp_phone.val("03-6049741");
			$inp_workPhone.val("03-6043386");
			$inp_mobile.val("052-5118833");
			$inp_email.val("natanel7@gmail.com");
			$inp_imageUrl.val("http://api.randomuser.me/portraits/men/49.jpg");
			$inp_facebookPage.val("http://facebook.com");
			$inp_comments.val("For performance reasons, all icons require a base class and individual icon class. To use, place the following code just about anywhere. Be sure to leave a space between the icon and text for proper padding.");
			
			$inp_id.val((myBook.getContactId() + 1));	
		}
	});

	//////////////////////////////////////////////
	// Control for modal interaction : Hide     //
	//////////////////////////////////////////////
	$modal.on('hide.bs.modal', function (e) {
		
		$form.find("input, textarea")
			.not(':button, :submit, :reset, :hidden')
			.val('')
			.removeAttr('checked');

		$select.find("option").removeAttr('selected');
		$form.find("#new-user-list").remove();
		showWorkFields();
	});

	///////////////////////////////////
	// Checkbox element interaction //
	///////////////////////////////////
	$chkBox.on('change', function() {
		isWorkContact = false;
		if ($chkBox.is(':checked')) {
			isWorkContact = true;
		}
		showWorkFields();
	});

	/////////////////////////////////
	// Select element interaction //
	/////////////////////////////////
	$select.on('change', function(e) {
		if($(this).val() == "user" && $("#new-user-list").length <= 0){
			$(this).closest('div').append(domElUser);
		}else{
			$(this).closest('div').find("#new-user-list").remove();
		}
		e.preventDefault();
	});

	/////////////////////////////
	// build the lists select //
	/////////////////////////////
	buildContactsListsSelect($select, myBook);

	///////////////////////////////////
	// Build all available Contacts //
	///////////////////////////////////
	drawContacts(myBook);
	
	///////////////////////////
	// Init addCheckboxes() //
	///////////////////////////
	addCheckboxes();

	//////////////////
	// Form submit //
	//////////////////
	$form.on('submit', function(e) {

		var
			data   = $form.serializeArray(),
			len    = data.length,
			tmpObj = {},
			$row   = $("div[data-role='wrapper']"),
			$inputNewListName = $("#new-user-list"),
			i,
			key,
			value,
			list,
			id,
			newId,
			newContact,
			newList,
			currList,
			contact,
			existingContact;
		
		/**
		 * iterate through the serializeArray Objects
		 * and create an accessible new 'tmpObj'
		 */
		$.each(data, function(index, val) {
			 key = val["name"];
			 //  pause on 'groupAssign' field and get the text value of the <option>,
			 //  the value of the <option> is used for the listId property.
			 if(key === "groupAssign"){ 
			 	tmpObj[key] = $select.find(":selected").text();
			 	if(val["value"] === "user"){ // prevent entry of type 'String' in 'listId' property
				 	tmpObj["listId"] = (myBook.getListId()+1);
				 	return;
			 	}
			 	tmpObj["listId"] = parseInt(val["value"], 10);
			 	return;
			 }
			 if(key === "id"){ //  pause on 'id' field and convert to integer
			 	tmpObj[key] = parseInt(val["value"], 10);
			 	return;
			 }
			 tmpObj[key] = val["value"];
		});

		list = tmpObj["groupAssign"];

		if($select.val() == "user" && $inputNewListName.length > 0){
			list = $inputNewListName.val();
		}

        existingContact = myBook.getContact(tmpObj.id);

		if(existingContact){ // If Contact already exists, we edit it.

			contact = existingContact;
			currList = myBook.getById(contact.listId);
			
			contact.editContact(tmpObj);
			myBook.allocateContact(currList, list, contact);

			drawContacts(myBook);
				
		}else{ // If it's a new Contact
			
			if (!isWorkContact) {
				contact = new ContactsLib.Contact(tmpObj);
			} else {
				contact = new ContactsLib.WorkContact(tmpObj);
			}

			if (myBook.get(list)) { // If list already exists
				newList = myBook.create(list, contact);
			} else {
				id      = myBook.getListId(); // get the cuurrent highest id
				newId   = (id+1); 	// Advance the current id by 1
				newList = new ContactsLib.ContactsList(list, [contact], newId);
				myBook.add(newList);
			}

			///////////////////////////////////////////
			// Create the HTML for the new contact //
			///////////////////////////////////////////
			contactElm = createContactWidget(contact, myBook);

			//////////////////////////////////////////////////////////
			// Update the hidden id input with the highest id + 1 //
			//////////////////////////////////////////////////////////
			$inp_id.val((myBook.getContactId() + 1));

			/////////////////////////////////////////////////////////
			// Append the newly created contactElm to the DOM      //
			/////////////////////////////////////////////////////////		
			arrangeContactsDom(contactElm, $container, $row);

		}
        
		///////////////////////////////////////
		// Close modal window after submit //
		///////////////////////////////////////
		$modal.modal('hide');
		
		////////////////////////////////
		// Build the Lists <select> //
		////////////////////////////////
		buildContactsListsSelect($select, myBook);

		//////////////////////////////
		// Init Styled checkboxes //
		//////////////////////////////
		addCheckboxes();

		////////////////////////////////////////
		// Prevent Default browser Behavior //
		////////////////////////////////////////
		e.preventDefault();
	});

/////////////////////
//-- END DOM READY //
/////////////////////
});
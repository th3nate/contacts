$(function () {// DOM ready

	//////////////////////
	// Global Variables //
	//////////////////////
	var 
		randomUser,
		isWorkContact,
		listIdToDelete,
		listNameToDelete,
		viewLocation	   = 0,
	    contactId 	       = myBook.getNextContactId(),
		$container 	       = $("#contacts"),
		$form              = $("#contact-form"),
		$listWrapper       = $("#contact-lists"),
		$selectSort        = $("select#sort-lists"),
		$fields            = $form.find("input, textarea, select"),
		$select            = $form.find("select#group-assign"),
		$chkBox            = $form.find("input#is-work-contact"),
		$inputFirstName    = $form.find("#first-name"),
		$inputLastName     = $form.find("#last-name"),
		$inputBirthDate    = $form.find("#birth-date"),
		$inputPhone        = $form.find("#phone"),
		$inputWorkPhone    = $form.find("#work-phone"),
		$inputMobile       = $form.find("#mobile"),
		$inputEmail        = $form.find("#email"),
		$inputImageUrl     = $form.find("#image-url"),
		$inputFacebookPage = $form.find("#facebook-page"),
		$inputComments     = $form.find("#comments"),
		$inputId           = $form.find("#id"),
		$modal             = $("#contact-modal"),
		$modalDelete       = $('#modal-delete'),
		orgTitle           = $modal.find("#modal-title").html(),
		domElWork          = '\
				<input type="text" name="position" id="position" class="form-control input-lg validate" placeholder="Position" tabindex="12">\
				<input type="text" name="color" id="color" class="form-control input-lg validate" placeholder="Color" tabindex="12">\
				',
		domElUser          = '<input type="text" name="newUserList" id="newUserList" class="form-control input-lg validate" placeholder="Enter list name" tabindex="12" value="">';

	/////////////////////////////////////////////////
	// Update the DOM with the current Contact id //
	/////////////////////////////////////////////////
	$inputId.val(contactId);

	//////////////////////////////////////////////////
	// Validator object 							//
	// Reference to DOM elements and error messages //
	//////////////////////////////////////////////////
	formElementsMap = {
		'firstName': {
			el:  $inputFirstName,
			msg: 'Please enter a first name'
		},
		'lastName': {
			el:  $inputLastName,
			msg: 'Please enter a last name'
		},
		'birthDate': {
			el:  $inputBirthDate,
			msg: 'Please select a DOB'
		},
		'phone': {
			el:  $inputPhone,
			msg: 'Please enter a valid phone number'
		},
		'workPhone': {
			el:  $inputWorkPhone,
			msg: 'Please enter a valid work phone number'
		},
		'mobile': {
			el:  $inputMobile,
			msg: 'Please enter a valid mobile number'
		},
		'email': {
			el:  $inputEmail,
			msg: 'Please enter a valid email address'
		},
		'imageUrl': {
			el:  $inputImageUrl,
			msg: 'Please enter a valid image url'
		},
		'facebookPage': {
			el:  $inputFacebookPage,
			msg: 'Please enter a valid page url'
		},
		'groupAssign': {
			el:  $select,
			msg: 'Please select a list, or create a new one'
		},
		'newUserList': {
			el:  '',
			msg: 'Please enter a name for your new list'
		},
		'position': {
			el:  '',
			msg: 'Please enter a position'
		},
		'color': {
			el:  '',
			msg: 'Please enter a color'
		}
	};

	/////////////////////////////
	// Validate form function //
	/////////////////////////////
	function validateForm() {
		var 
			result = {},
			errNum = 0,
			killPopoverElement;

		// Reset all error class on fields
		$form.find('.form-group').removeClass('has-error');

		result['firstName']    = ($inputFirstName.val() === "") ? false : true;
		result['lastName']     = ($inputLastName.val() === "") ? false : true;
		result['birthDate']    = ($inputBirthDate.val() === "") ? false : true;
		result['phone']        = (formValidation.phone($inputPhone.val()) !== true) ? false : true;
		result['workPhone']    = (formValidation.phone($inputWorkPhone.val()) !== true) ? false : true;
		result['mobile']       = (formValidation.mobilePhone($inputMobile.val()) !== true) ? false : true;
		result['email']        = (formValidation.email($inputEmail.val()) !== true) ? false : true;
		result['imageUrl']     = (formValidation.imageUrl($inputImageUrl.val()) !== true) ? false : true;
		result['facebookPage'] = (formValidation.url($inputFacebookPage.val()) !== true) ? false : true;
		result['groupAssign']  = ($select.val() === "") ? false : true;
		
		if ($form.find('input#newUserList').length > 0) { // if this input exists on form then add it to our validation object
			formElementsMap['newUserList'].el = $form.find('input#newUserList');
			result['newUserList'] = ($form.find('input#newUserList').val() === "") ? false : true;
		}

		$.each(result, function(elm, val) { // loop through our 'result' validation object
			if (formElementsMap[elm].el.hasClass('validate')) {  // only run on elements that have .validate class
				if (val === false) { // if validation fails
					if (elm === 'groupAssign') { // if its a select element
						formElementsMap[elm].el // the field
						.popover({content: formElementsMap[elm].msg, trigger: 'focus', container: 'body', placement: 'top'}) // enable bootstrap's popover.js
						.closest('.form-group').addClass('has-error'); // attach an error class
					}else{ // if a regular input
						formElementsMap[elm].el // the field
						.popover({content: formElementsMap[elm].msg, container: 'body', placement: 'top'}) // enable bootstrap's popover.js
						.closest('.form-group').addClass('has-error'); // attach an error class
					}
					formElementsMap[elm].el.popover('show'); // show the popover
					errNum++; // count number of errors
				}else{
					formElementsMap[elm].el.popover('destroy'); // kill the popover
				}
			}

		});

		if (errNum === 0){
			return true;
		}
	}

	/////////////////////////////
	// Validate form function //
	/////////////////////////////
	function validateField(field) {
		var 
			result    = {},
			errNum    = 0,
			validate  = field.hasClass('validate');
			fieldName = field.attr('name');

		if (validate) { // only run on elements that have .validate class

			// Reset all error class on fields and kill popover
			field.closest('.form-group').removeClass('has-error');
			if (formElementsMap[fieldName].el.popover){
				formElementsMap[fieldName].el.popover('destroy');
			}
			if (fieldName === 'phone') {
				result[fieldName] = (formValidation.phone(field.val()) !== true) ? false : true;
			}
			else if (fieldName === 'workPhone') {
				result[fieldName] = (formValidation.phone(field.val()) !== true) ? false : true;
			}
			else if (fieldName === 'mobile') {
				result[fieldName] = (formValidation.mobilePhone(field.val()) !== true) ? false : true;
			}
			else if (fieldName === 'email') {
				result[fieldName] = (formValidation.email(field.val()) !== true) ? false : true;
			}
			else if (fieldName === 'imageUrl') {
				result[fieldName] = (formValidation.imageUrl(field.val()) !== true) ? false : true;
			}
			else if (fieldName === 'facebookPage') {
				result[fieldName] = (formValidation.url(field.val()) !== true) ? false : true;
			} 
			else if (fieldName === 'newUserList') {
				formElementsMap['newUserList'].el = $form.find('input#newUserList');
				result[fieldName] = (field.val() === "") ? false : true;
			} 
			else {	
				result[fieldName] = (field.val() === "") ? false : true;
			}

			if (result[fieldName] === false) { // if validation fails
				if (fieldName === 'groupAssign') { // if its a select element
					formElementsMap[fieldName].el // the field
					.popover({content: formElementsMap[fieldName].msg, container: 'body', trigger: 'focus', placement: 'top'}) // enable bootstrap's popover.js
					.closest('.form-group').addClass('has-error'); // attach an error class
				} else {
					formElementsMap[fieldName].el // the field
					.popover({content: formElementsMap[fieldName].msg, container: 'body', placement: 'top'}) // enable bootstrap's popover.js
					.closest('.form-group').addClass('has-error'); // attach an error class
				}

				formElementsMap[fieldName].el.popover('show'); // show the popover
				return false;

			} else {
				if (formElementsMap[fieldName].el.popover){ // if the popover exsists
					formElementsMap[fieldName].el.popover('destroy'); // kill the popover
				}
			}
		}
		return true;
	}

	///////////////////////
	// Styled Checkboxes //
	///////////////////////
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
					updateCheckBoxes();
				});

				function updateCheckBoxes() {
					var isChecked = $input.is(':checked') ? 'on' : 'off';
						
					$widget.find('.state-icon').attr('class', 'pos-icon state-icon '+settings[type][isChecked].icon);
					
					//Just for desplay
					isChecked = $input.is(':checked') ? 'alert-warning active' : '';

					$widget
					.removeClass("alert-warning active")
					.addClass(isChecked);
				}
				
				updateCheckBoxes();
			}
		});
	}

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

	//////////////////////////////////////////
	// Toggle the isWorkContact global var //
	//////////////////////////////////////////
	function isWorkType(){
		isWorkContact = false;
		if ($chkBox.is(':checked')) {
			isWorkContact = true;
		}
	}

	////////////////////////////////////////////////////////////////
	// Wrapper function to update the current view after changes //
	////////////////////////////////////////////////////////////////
	function updateDisplay(list){
		viewLocation = list || viewLocation; // if passed a list argument use it, else use global viewLocation var

		buildContactsListsSelect($select, myBook);		// build the lists select inside the form
		buildContactsListsSelect($selectSort, myBook);	// build the lists select on page				
		buildContactsLists($listWrapper, myBook);		// build the lists names
		drawContacts(myBook, viewLocation);				// Draw the contacts in the list
		addCheckboxes();								// Init Styled checkboxes
		navigation(viewLocation);						// Update our navigation buttons for the current location
	}

	//////////////////////////////////////////////////////////
	// TODO: For testing - REMOVE 							//
	// get items data on click and write it to DOM element  //
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

	//////////////////////////////
	// init BootStrap Tooltips //
	//////////////////////////////
	$('body').tooltip({selector: '[data-toggle="tooltip"], [data-tooltip="true"]'});

	//////////////////////////////////
	// init jquery UI - DatePicker //
	//////////////////////////////////
	$("#birth-date").datepicker({
		dateFormat: "dd/mm/yy",
		showAnim: "slideDown"
	});

	//////////////////////////////////////////////
	// Control for modal interaction : Show     //
	//////////////////////////////////////////////
	$modal.on('show.bs.modal', function (e) {
		var 
			obj          = {},
			button       = $(e.relatedTarget), // Button that triggered the modal
			cid     	 = button.data('cid'), // Extract info from data-* attributes
			$modalWindow = $(this);

		$form[0].reset(); // resetting the form before applying data

		if(cid >= 0){ // If we are in Edit mode.
			obj = parseContact(myBook.getContact(cid));

			if ($form.find('#delete-contact').length <= 0) { // Attach a Delete Button
				$form.prepend('<button data-delete="'+obj.contact.id+'" id="delete-contact" type="button" class="btn btn-danger pull-right btn-md"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span> Delete Contact</button>');
			}
			$modalWindow.find('#modal-title').text('Edit: (' + obj.contact.id + ') ' + obj.contact.firstName + ' ' + obj.contact.lastName);
			
			// Delete Contact - Delete Button
			$('button').on('click',$('[attr=data-delete'), function(e) {
				var contactId = parseInt($(e.target).attr('data-delete'));
				
				myBook.removeContact(contactId); // Delete the contact by its id
				updateDisplay();				// Update our view
				$modalWindow.modal('hide');			// Close the modal
				e.preventDefault();
			});

			$inputFirstName.val(obj.contact.firstName);
			$inputLastName.val(obj.contact.lastName);
			$inputBirthDate.val(obj.contact.birthDate);
			$inputPhone.val(obj.phone);
			$inputWorkPhone.val(obj.workPhone);
			$inputMobile.val(obj.mobile);
			$inputEmail.val(obj.contact.email);
			$inputImageUrl.val(obj.contact.imageUrl);
			$inputFacebookPage.val(obj.contact.facebookPage);
			$inputComments.val(obj.contact.comments);
			$select.find("option[value='"+obj.contact.listId+"']").prop('selected', true);
			$inputId.val(obj.contact.id);
			
			if(obj.isWorkContact === true){
				$chkBox.prop('checked', true);
				showWorkFields();
				$form.find("#position").val(obj.contact.position);
				$form.find("#color").val(obj.contact.color);
			}
		}else{ // If we are in a New contact mode.

			$('#loading').show();//Start Preloader Animation
			$modalWindow.find('#modal-title').html(orgTitle);
			
			////////////////////////////////
			// TODO: Mock data REMOVE     //
			////////////////////////////////
			randomUser = $.getJSON('https://randomapi.com/api/?key=I2V1-YQFA-YHXS-O7VZ&id=oa5thno');
			randomUser.done(function(data) { // $.Promise
				$inputFirstName.val(data.results[0].Contact.firstName);
				$inputLastName.val(data.results[0].Contact.lastName);
				$inputBirthDate.val(data.results[0].Contact.birthDate);
				$inputPhone.val(data.results[0].Contact.phone);
				$inputWorkPhone.val(data.results[0].Contact.workPhone);
				$inputMobile.val(data.results[0].Contact.mobile);
				$inputEmail.val(data.results[0].Contact.email);
				$inputImageUrl.val(data.results[0].Contact.imageUrl);
				$inputFacebookPage.val(data.results[0].Contact.facebookPage);
				$inputComments.val(data.results[0].Contact.comments);
				$("#loading").fadeOut(); // Hide Preloader
			});
			
			$inputId.val(myBook.getNextContactId());	
		}
		isWorkType(); // reset the isWorkContact var
	});

	//////////////////////////////////////////////
	// Control for modal interaction : Hide     //
	//////////////////////////////////////////////
	$modal.on('hide.bs.modal', function (e) {
		
		if ($form.find('#delete-contact').length > 0) { // Remove the Delete Contact Button if available
			$form.find('#delete-contact').remove();
		}
		
		if ($fields.popover){ // if the popover exsists
			$fields.popover('destroy'); // kill the popover
		}

		$form.find('.form-group').removeClass('has-error');
		
		$form.find("input, textarea")
			.not(':button, :submit, :reset, :hidden')
			.val('')
			.removeAttr('checked');

		$select.find("option").removeAttr('selected');
		$form.find("#newUserList").remove();

		showWorkFields();
	});

	///////////////////////////////////
	// Checkbox element interaction //
	///////////////////////////////////
	$chkBox.on('change', function() {
		isWorkType();
		showWorkFields();
	});

	/////////////////////////////////
	// Select element interaction //
	/////////////////////////////////
	$select.on('change', function(e) {
		if($(this).val() == "user" && $("#newUserList").length <= 0){
			$(this).closest('div').append(domElUser);
		}else{
			$(this).closest('div').find("#newUserList").popover('destroy').remove(); // kill the popover and remove the input 
		}
		e.preventDefault();
	});
	
	/////////////////////////////////
	// Select element interaction //
	/////////////////////////////////
	$selectSort.on('change', function(e) {
		var 
			list     = parseInt($(this).val()),
			contacts = getSortItems();
		
		if (contacts.length !== 0 && list !== 0) { // if the array is not empty and user did not select the first option (All)
			myBook.sortContacts(list, contacts);
			updateDisplay(list); // Update our view
		}
		e.preventDefault();
	});

	///////////////////////////////
	// List buttons interaction //
	///////////////////////////////
	$listWrapper.on('click', '.list-link', function(e) {
		var 
			listId   = $(this).data("list"),
			orgValue = $(this).text();
		viewLocation = listId; // Update the current list we're viewing.

		$('a.list-link').parent().removeClass('label-success'); 
		$(this).parent().addClass('label-success');

		// Init x-editable (for in-place editing of lists names)
		$(this).not('.no-edit').editable({
			mode: 'popup',
			toggle: 'dblclick',
			type: 'text',
			title: 'Rename list',
			validate: function(value) {
				if($.trim(value) == '') {
					return 'This field is required';
				}
			},
			success: function(response, newValue) {
				myBook.rename(orgValue, newValue); // Rename the list
				updateDisplay(); // Update our view
			}
		});		

		drawContacts(myBook, viewLocation); // Draw the contacts in the list
		addCheckboxes(); // Init Styled checkboxes
		e.preventDefault();
	});

	////////////////////////////////////////
	// Delete list - Buttons interaction //
	////////////////////////////////////////
	$listWrapper.on('click', '.list-delete', function(e) { 

		listIdToDelete   = $(this).parent().find('.list-link').data("list");
		listNameToDelete = $(this).parent().find('.list-link').text();
	
		e.preventDefault();
	});
	
	//////////////////////////////////
	// Delete list - Modal on open //
	//////////////////////////////////
	$modalDelete.on('show.bs.modal', function (e) { // On modal open
		$(this).find('.modal-body').html('Are you sure you want to delete <strong>'+listNameToDelete+'</strong>?<br />This will also delete all associated contacts.');
	});

	/////////////////////////////////////////////////////
	// Delete list - Delete Button (Inside the modal) //
	/////////////////////////////////////////////////////
	$('#delete-btn').on('click', function(e) {
		myBook.delete(listNameToDelete);
		
		updateDisplay(); // Update our view
		navigation(0); // (Override the above updateDisplay) go to 'All' view
		$modalDelete.modal('hide');	// Close the modal
		e.preventDefault();
	});

	///////////////////////////////////////////////////
	// Enable single field validation on key press   //
	// and when changing input values				 //
	///////////////////////////////////////////////////
	$form.on('change', $fields, function(e) { 
		validateField($(e.target));
	});

	//////////////////
	// Form submit //
	//////////////////
	$form.on('submit', function(e) {

		var
			data   = $form.serializeArray(),
			len    = data.length,
			tmpObj = {},
			$row   = $("div[data-role='wrapper']"),
			$inputNewListName = $("#newUserList"),
			v,
			i,
			key,
			value,
			list,
			newContact,
			newList,
			currList,
			contact,
			converted,
			existingContact,
			workType,
			currListObj,
			tmpList,
			tmpObjList;
		
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
				 	tmpObj["listId"] = myBook.getNextListId();
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

		v             = validateForm();

		if (v) { // If passed form input validation


			if(existingContact){ // If Contact already exists, we edit it.
				workType      = (existingContact instanceof ContactsLib.WorkContact) ? true : false; // If contact is of WorkContact Type.
				contact       = existingContact;
				currList      = myBook.getById(contact.listId);
				currListObj   = myBook.get(currList);
				tmpList       = myBook.getById(tmpObj.listId) || tmpObj.newUserList;
				tmpObjList    = myBook.get(tmpList);
				
				if(!tmpObjList){ // if no such list we create it
					tmpObjList = new ContactsLib.ContactsList(tmpList, [], myBook.getNextListId());
					myBook.add(tmpObjList);
				}
				
				if(workType && $chkBox.is(':checked') === false){ // If its a WorkContact and we want to convert it to Contact.
					converted = true;
					contact   = currListObj.convert(contact); // Convert the contact's type (Contact/WorkContact).
					currListObj.delete(contact.id); // Remove the contact from the old list.
					tmpObjList.add(contact); // Add the contact to the newly selected list.
				}
				if(!workType && $chkBox.is(':checked') === true){  // If its a Contact and we want to convert it to WorkContact.
					converted = true;
					contact   = currListObj.convert(contact); // Convert the contact's type (Contact/WorkContact).
					currListObj.delete(contact.id); // Remove the contact from the old list.
					tmpObjList.add(contact); // Add the contact to the newly selected list.
				}
				
				if(!converted && contact.listId !== tmpObj.listId){
					myBook.allocateContact(currList, list, contact);
				}

				if(contact instanceof ContactsLib.WorkContact){
					contact.editWorkContact(tmpObj);
				}else{
					contact.editContact(tmpObj);
				}

				drawContacts(myBook, viewLocation);  // Draw the contacts in the list

			}else{ // If it's a new Contact
				
				if (!isWorkContact) {
					contact = new ContactsLib.Contact(tmpObj);
				} else {
					contact = new ContactsLib.WorkContact(tmpObj);
				}

				if (myBook.get(list)) { // If list already exists
					newList = myBook.create(list, [contact]);
				} else {
					newList = new ContactsLib.ContactsList(list, [contact], myBook.getNextListId());
					myBook.add(newList);
				}

				///////////////////////////////////////////
				// Create the HTML for the new contact //
				///////////////////////////////////////////
				contactElm = createContactWidget(contact, myBook);

				//////////////////////////////////////////////////////////
				// Update the hidden id input with the highest id + 1 //
				//////////////////////////////////////////////////////////
				$inputId.val(myBook.getNextContactId());

				/////////////////////////////////////////////////////////
				// Append the newly created contactElm to the DOM      //
				/////////////////////////////////////////////////////////		
				arrangeContactsDom(contactElm, $container, $row);

			}
	        
			///////////////////////////////////////
			// Close modal window after submit //
			///////////////////////////////////////
			$modal.modal('hide');
			
			///////////////////////
			// Update our view //
			///////////////////////
			updateDisplay(); 

		} // End if validation

		////////////////////////////////////////
		// Prevent Default browser Behavior //
		////////////////////////////////////////
		e.preventDefault();
	});

	updateDisplay(); // Update our view

}); //-- END DOM READY
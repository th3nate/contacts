// DOM ready
$(function () {
	////////////////
	// Variables //
	////////////////
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
				<input type="text" name="position" id="position" class="form-control input-lg" placeholder="Position" tabindex="12">\
				<input type="text" name="color" id="color" class="form-control input-lg" placeholder="Color" tabindex="12">\
				',
		domElUser          = '<input type="text" name="newUserList" id="newUserList" class="form-control input-lg" placeholder="Enter groups name" tabindex="12">';

	// Update the DOM with the current Contact id
	$inputId.val(contactId);

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
			$(this).closest('div').find("#newUserList").remove();
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
		
		if (contacts.length !== 0) { // if the array is not empty
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

	// Delete list - Buttons interaction
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

	updateDisplay(); // Update our view

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

		if(existingContact){ // If Contact already exists, we edit it.
			workType    = (existingContact instanceof ContactsLib.WorkContact) ? true : false; // If contact is of WorkContact Type.
			contact     = existingContact;
			currList    = myBook.getById(contact.listId);
			currListObj = myBook.get(currList);
			tmpList     = myBook.getById(tmpObj.listId) || tmpObj.newUserList;
			tmpObjList  = myBook.get(tmpList);

			if(!tmpObjList){
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

		////////////////////////////////////////
		// Prevent Default browser Behavior //
		////////////////////////////////////////
		e.preventDefault();
	});

/////////////////////
//-- END DOM READY //
/////////////////////
});
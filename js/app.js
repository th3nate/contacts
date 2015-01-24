// DOM ready
$(function () {
	////////////////
	// Variables //
	////////////////
	var $container 	       = $("#contacts"),
		$form              = $("#contact-form"),
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
        contactId 	       = myBook.getContactId(),
		orgTitle           = $modal.find("#modal-title").html(),
		promise            = $.getJSON('data/MOCK_DATA_REGULAR.json'),
		isWorkContact,
		domElWork          = '\
				<input type="text" name="position" id="position" class="form-control input-lg" placeholder="Position" tabindex="12">\
				<input type="text" name="color" id="color" class="form-control input-lg" placeholder="Color" tabindex="12">\
				',
		domElUser          = '<input type="text" name="new-user-list" id="new-user-list" class="form-control input-lg" placeholder="Enter groups name" tabindex="12">';	
	
	////////////////////////////////
	// TODO: Mock data REMOVE     //
	////////////////////////////////
	$inputFirstName.val("Nate")
	$inputLastName.val("Cook");
	$inputBirthDate.val("04/12/1978");
	$inputPhone.val("03-6049741");
	$inputWorkPhone.val("03-6043386");
	$inputMobile.val("052-5118833");
	$inputEmail.val("natanel7@gmail.com");
	$inputImageUrl.val("http://api.randomuser.me/portraits/men/49.jpg");
	$inputFacebookPage.val("http://facebook.com");
	$inputComments.val("For performance reasons, all icons require a base class and individual icon class. To use, place the following code just about anywhere. Be sure to leave a space between the icon and text for proper padding.");

	// Update the DOM with the current Contact id
	$inputId.val((contactId + 1));

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
			$modalWindow.find('#modal-title').html(orgTitle);
			
			////////////////////////////////
			// TODO: Mock data REMOVE     //
			////////////////////////////////
			$inputFirstName.val("Nate")
			$inputLastName.val("Cook");
			$inputBirthDate.val("04/12/1978");
			$inputPhone.val("03-6049741");
			$inputWorkPhone.val("03-6043386");
			$inputMobile.val("052-5118833");
			$inputEmail.val("natanel7@gmail.com");
			$inputImageUrl.val("http://api.randomuser.me/portraits/men/49.jpg");
			$inputFacebookPage.val("http://facebook.com");
			$inputComments.val("For performance reasons, all icons require a base class and individual icon class. To use, place the following code just about anywhere. Be sure to leave a space between the icon and text for proper padding.");
			
			$inputId.val((myBook.getContactId() + 1));	
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
			existingContact,
			contactType,
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

			contactType = (existingContact instanceof ContactsLib.WorkContact) ? true : false; // If contact is of WorkContact Type.
			contact     = existingContact;
			currList    = myBook.getById(contact.listId);
			currListObj = myBook.get(currList);
			tmpList     = myBook.getById(tmpObj.listId);
			tmpObjList  = myBook.get(tmpList);

			if(contactType && $chkBox.is(':checked') === false){ // If its a WorkContact and we want to convert it to Contact.
				contact = currListObj.convert(contact, tmpObjList);
			}
			if(!contactType && $chkBox.is(':checked') === true){  // If its a Contact and we want to convert it to WorkContact.
				contact = currListObj.convert(contact, tmpObjList);
			}
			if(contact.listId !== tmpObj.listId){
				myBook.allocateContact(currList, list, contact);
			}
			contact.editContact(tmpObj);

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
			$inputId.val((myBook.getContactId() + 1));

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
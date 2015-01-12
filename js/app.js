// DOM ready
$(function () {
	////////////////
	// Variables //
	////////////////
	var $container 	  = $("#contacts"),
		$form 	      = $("#contact-form"),
		$fields       = $form.find("input, textarea, select"),
		$select       = $form.find("select#group-assign"),
		$chkBox       = $form.find("input#is-work-contact"),
		$modal 	      = $("#contact-modal"),
        contactId 	  = myBook.getContactId(),
		orgTitle      = $modal.find("#modal-title").html(),
		promise       = $.getJSON('data/MOCK_DATA_REGULAR.json'),
		isWorkContact,
		domElWork = '\
				<input type="text" name="position" id="position" class="form-control input-lg" placeholder="Position" tabindex="12">\
				<input type="text" name="color" id="color" class="form-control input-lg" placeholder="Color" tabindex="12">\
				',
		domElUser = '<input type="text" name="new-user-list" id="new-user-list" class="form-control input-lg" placeholder="Enter groups name" tabindex="12">';	
	
	////////////////////////////////
	// TODO: Mock data REMOVE     //
	////////////////////////////////
	var $input1  = $form.find("#first-name").val("Nate"),
		$input2  = $form.find("#last-name").val("Cook"),
		$input3  = $form.find("#birth-date").val("04/12/1978"),
		$input4  = $form.find("#phone").val("03-6049741"),
		$input5  = $form.find("#work-phone").val("03-6043386"),
		$input6  = $form.find("#mobile").val("052-5118833"),
		$input7  = $form.find("#email").val("natanel7@gmail.com"),
		$input8  = $form.find("#image-url").val("http://api.randomuser.me/portraits/men/49.jpg"),
		$input9  = $form.find("#facebook-page").val("http://facebook.com");
		$input10 = $form.find("#comments").val("For performance reasons, all icons require a base class and individual icon class. To use, place the following code just about anywhere. Be sure to leave a space between the icon and text for proper padding.");

	// Update the DOM with the current Contact id
	$('input#id').val((contactId + 1));

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
	addCheckboxes();

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

	////////////////////////////////////
	// Control for modal interaction //
	////////////////////////////////////	
	$modal.on('show.bs.modal', function (e) {
		var button = $(e.relatedTarget), // Button that triggered the modal
			recipient = button.data('cid'), // Extract info from data-* attributes
			$modalWindow = $(this);

		if(recipient >= 0){
			$modalWindow.find('#modal-title').text('Edit Contact id: ' + recipient);
		}else{
			$modalWindow.find('#modal-title').html(orgTitle);
		}
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

	//////////////////
	// Form submit //
	//////////////////
	$form.on('submit', function(e) {

		var
			data   = $form.serializeArray(),
			len    = data.length,
			tmpObj = {},
			$row   = $("div[data-role='wrapper']"),
			i,
			key,
			value,
			list,
			id,
			newId,
			newContact,
			newList,
			contact,
			item;
		
		/**
		 * iterate through the serializeArray Objects
		 * and create an accessible new 'tmpObj'
		 */
		$.each(data, function(index, val) {
			 key = val["name"];
			 //  pause on 'groupAssign' field and get the text value of the <option>,
			 //  the value of the <option> is used for the cssClass property.
			 if(key === "groupAssign"){ 
			 	tmpObj[key]        = $select.find(":selected").text();
			 	tmpObj["cssClass"] = val["value"];
			 	return;
			 }
			 if(key === "id"){ //  pause on 'id' field and convert to integer
			 	tmpObj[key] = parseInt(val["value"], 10);
			 	return;
			 }
			 tmpObj[key] = val["value"];
		});

		list = tmpObj["groupAssign"];

		if($select.val() == "user" && $("#new-user-list").length > 0){
			list = $("#new-user-list").val();
		}
        
		if (!isWorkContact) {
			newContact = new ContactsLib.Contact(tmpObj);
		} else {
			newContact = new ContactsLib.WorkContact(tmpObj);
		}

		if (myBook.get(list)) { // If list already exists
			newList = myBook.create(list, newContact);
		} else {
			id      = myBook.getListId(); // get the cuurrent highest id
			newId   = (id+1); 	// Advance the current id by 1
			newList = new ContactsLib.ContactsList(list, [newContact], newId);
			myBook.add(newList);
		}

		// Close modal window after submit
		//$modal.modal('hide');
		
		contactElm = createContactWidget(newContact, newList, isWorkContact);

		$('input#id').val((myBook.getContactId() + 1));  // Update the hidden id input with the highest id + 1

		/////////////////////////////////////////////////////////
		// Append the newly created contactElm to the DOM      //
		/////////////////////////////////////////////////////////
		if($row.last().length > 0 && $row.last().children().length < 3){ // If row exists on page and items in it does not exceed 3
			$container.find($row.last()).append(contactElm);
		}else{ // If row doesn't exists on page OR items in row exceed 3
			$container.append('<div class="row" data-role="wrapper">'+contactElm+'</div>');
		}

		addCheckboxes();
		buildContactsListsSelect($select, myBook);
		e.preventDefault();
	});

/////////////////////
//-- END DOM READY //
/////////////////////
});
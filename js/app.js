// DOM ready
$(function () {
	////////////////
	// Variables //
	////////////////
	var $form    = $("#contact-form"),
		$fields  = $form.find("input, textarea, select"),
		$select  = $form.find("select#group-assign"),
		$chkBox  = $form.find("input#is-work-contact"),
		$modal   = $("#contact-modal"),
		orgTitle = $modal.find("#modal-title").html(),
		promise  = $.getJSON('data/MOCK_DATA_REGULAR.json'),
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
		
		$("#layout .active").each(function(idx, el) {
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

	//////////////////
	// Form submit //
	//////////////////
	$form.on('submit', function(e) {

		var data = $form.serializeArray(),
			i,
			len = data.length,
			key,
			value,
			list,
			newContact,
			newList,
			tmpObj = {};		
		
		// iterate through the serializeArray Objects
		// and create an accessible new 'tmpObj'
		$.each(data, function(index, val) {
			 key = val["name"];
			 if(key === "groupAssign"){
			 	tmpObj[key]        = $select.find("option:selected").text();
			 	tmpObj["cssClass"] = val["value"];
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

		newList = new ContactsLib.ContactsList(list, [newContact]);

		myBook.add(newList);
		
		// Close modal window after submit
		//$modal.modal('hide');

		/////////////////////////////////
		// Select element interaction //
		/////////////////////////////////
		if($select.val() == "user"){
			var optId = $select.find('option').not("user").last().attr("value");
			$select.find('option[value="user"]').before('<option value="'+optId+'">'+ $("#new-user-list").val() + '</option>');
		}

		var contact    = newList.find(tmpObj["id"]),
			$container = $("#layout"),
			$row       = $("div[data-role='wrapper']"),
			newId      = contact.id;
			item       = '\
				<div class="col-xs-12 col-sm-4 col-md-4 contact-item-wrapper">\
					<div data-group="'+contact.cssClass+'" class="thumbnail contact-item relative">\
						<div class="col-xs-4 col-sm-6 col-md-6">\
							<img src="'+contact.imageUrl+'" alt="'+contact.firstName+' '+contact.lastName+'" class="img-responsive img-circle" />\
						</div>\
						<div class="col-xs-8 col-sm-6 col-md-6">\
							<h4 class="name">'+contact.firstName+' '+contact.lastName+'</h4>\
							<span class="glyphicon glyphicon-envelope text-muted c-info" data-toggle="tooltip" title="'+contact.email+'"></span>\
							<span class="visible-xs"><span class="text-muted">'+contact.email+'</span><br /></span>\
							<span class="glyphicon glyphicon-phone text-muted c-info" data-toggle="tooltip" title="'+contact.mobile+'"></span>\
							<span class="visible-xs"><span class="text-muted">'+contact.mobile+'</span><br /></span>\
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
							<span class="glyphicon glyphicon-earphone text-muted c-info" data-toggle="tooltip" title="'+contact.phone+'"></span>\
							<span class="visible-xs"><span class="text-muted">'+contact.phone+'</span><br /></span>\
							<span class="glyphicon glyphicon-briefcase text-muted c-info" data-toggle="tooltip" title="'+contact.workPhone+'"></span>\
							<span class="visible-xs"><span class="text-muted">'+contact.workPhone+'</span><br /></span>\
							<a href="'+contact.facebookPage+'"><span class="glyphicon glyphicon-link text-muted c-info" data-toggle="tooltip" title="See my FB page"></span>\
							<span class="visible-xs"><span class="text-muted break-word">See my FB page</span></span></a>\
							<br />\
							<a data-toggle="collapse" href="#collapse-'+newId+'" aria-expanded="false" aria-controls="collapse-'+newId+'"><i class="glyphicon glyphicon-comment text-muted"></i> Show more</a>\
						</div>\
						<a href="#" class="pos-icon-top edit-contact" data-cid="'+newId+'" data-tooltip="true" title="Edit contact" data-toggle="modal" data-target="#contact-modal"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></a>\
						<input type="checkbox">\
						<div class="clearfix"></div>\
						<div class="collapse" id="collapse-'+newId+'">\
							<div class="well comments">\
								<span class="text-muted break-word">'+contact.comments+'</span>\
							</div>\
						</div>\
					</div>\
				</div>';

		newId++; // Advance the id count
		$('input#id').val(newId);  // Update the hidden id input

		////////////////////////////////////////////////
		// Append the newly created item to the DOM //
		////////////////////////////////////////////////
		if($row.last().length > 0 && $row.last().children().length < 3){ // If row exists on page and items in it does not exceed 3
			$container.find($row.last()).append(item);
		}else{ // If row doesn't exists on page OR items in row exceed 3
			$container.find("#layout_footer").before(function() {
				return '<div class="row" data-role="wrapper">'+item+'</div>';
			});
		}
		addCheckboxes();
		e.preventDefault();
	});

	/////////////////
	// JSON stuff //
	/////////////////	
	/*
	if($("#output-data").length <= 0){
		$('.jumbotron').append('<p id="output-data"></p>');
	}

	promise.done(function(data) {
		//$("#output-data").append(JSON.stringify(data[0], null, '\t'));
		
		var autoList = new ContactsLib.ContactsList("Friends2", data);
		
		myBook.add(autoList);
		console.log(myBook.lists);

	});
	promise.fail(function() {
		$("#output-data").append('<p>Oh no, something went wrong!</p>');
	});
	promise.always(function() {
		$("#output-data").append('<p>I promise this will always be added regardless if failed or succeeded!.</p>');
	});
	*/

/////////////////////
//-- END DOM READY //
/////////////////////
});
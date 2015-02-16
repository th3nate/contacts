//////////////////////////
//-> TODO: TESTING CODE //
//////////////////////////
	myContact = new ContactsLib.Contact({ // Create a new Contact
		id:			  1,
		listId:		  1,
		firstName:    'Naor',
		lastName:     'Ami',
		birthDate:    new Date(1984, 10, 10),
		phone:        new ContactsLib.PhoneNumber('03', '1234567'),
		workPhone:    ContactsLib.PhoneNumber.parse('03-7654321'), // another option
		mobile:       new ContactsLib.MobilePhoneNumber('054', '7654321'),
		email:        'naoric@gmail.com',
		imageUrl:     'http://api.randomuser.me/portraits/men/49.jpg',
		comments:     'nice guy',
		facebookPage: 'http://facebook.com/naoric'
	}),

	myContact2 = new ContactsLib.Contact({ // Create a new Contact
		id:			  2,
		listId:		  1,
		firstName:    'Mike',
		lastName:     'James',
		birthDate:    new Date(1982, 01, 08),
		phone:        new ContactsLib.PhoneNumber('03', '5554444'),
		workPhone:    ContactsLib.PhoneNumber.parse('03-9876544'), // another option
		mobile:       new ContactsLib.MobilePhoneNumber('054', '9999998'),
		email:        'mike@gmail.com',
		imageUrl:     'http://api.randomuser.me/portraits/men/97.jpg',
		comments:     'My description here...',
		facebookPage: 'http://facebook.com'
	}),

	myWorkContact = new ContactsLib.WorkContact({ // Create a new WorkContact
		id:			  3,
		listId:		  1,
		firstName:    'David',
		lastName:     'Peretz',
		birthDate:    new Date(1988, 04, 07),
		phone:        new ContactsLib.PhoneNumber('03', '1234567'),
		workPhone:    ContactsLib.PhoneNumber.parse('03-7654321'), // another option
		mobile:       ContactsLib.MobilePhoneNumber.parse('054-7654321'),
		email:        'david@gmail.com',
		imageUrl:     'http://api.randomuser.me/portraits/men/42.jpg',
		comments:     'David is gay',
		facebookPage: 'http://facebook.com',
		color:        "Red",
		position:     "Manager"
	}),

	myBook = ContactsLib.ContactsBook.getInstance("My Contacts Book"), // Create a ContactsBook Singleton object
	newList = new ContactsLib.ContactsList("Friends", [myContact, myContact2, myWorkContact], myBook.getNextListId()); // Create a new Contactslist

//myBook.add(newList); // Add the newly created Contactslist to the ContactsBook

console.log(myBook); // Log our ContactsBook
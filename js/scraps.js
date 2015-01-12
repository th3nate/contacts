////////////////////////
// Library Usage Code //
////////////////////////
// TODO: TESTING CODE, REMOVE IT!
var myContact = new ContactsLib.Contact({
	id:			  1,
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
});
var myContact2 = new ContactsLib.Contact({
	id:			  2,
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
});
var myWorkContact = new ContactsLib.WorkContact({
	id:			  3,
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
});

var rndName = "Some List-" + Math.floor((Math.random() * 100) + 1);

//console.log(myContact.validate());
//console.log(myContact);
//console.log(myWorkContact);

var myBook = ContactsLib.ContactsBook.getInstance("My Contacts Book");

var newList = new ContactsLib.ContactsList("Friends", [myContact, myContact2], (myBook.getListId()+1));
var newList2 = new ContactsLib.ContactsList("Friends", [myContact, myWorkContact], (myBook.getListId()+1));

//var myBook2 = ContactsLib.ContactsBook.getInstance();
//console.log(myBook);
//console.log(myBook.delete("somelist no. 2"));
myBook.add(newList);
myBook.add(newList2);
console.log(myBook);

// return filtered list
var filtered = newList.filter(function (contact, index, arrObj) {
	return contact.firstName.charAt(0).toLowerCase() !== 'n'
});
//console.info(filtered);

// example of find method
var who = newList.find(1);
//console.log(who);

// example of findBy method
var findByName = newList.findBy(function (contact, index, arrObj) {
	return contact.firstName.toLowerCase() == 'mike'
});
//console.info(findByName);

// example of removeBy method
var removeByName = newList.removeBy(function (contact, index, arrObj) {
	return contact.firstName.toLowerCase() == 'mike'
});
//console.info(removeByName);

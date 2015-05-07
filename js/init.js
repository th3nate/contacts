//////////////////////////
//-> TODO: TESTING CODE //
//////////////////////////

if (localStorage.book) {
	var myBook = dbRestore(localStorage.book);
}else{
	var myBook = ContactsLib.ContactsBook.getInstance("My Contacts Book"); // Create a ContactsBook Singleton object
}
//myBook.add(newList); // Add the newly created Contactslist to the ContactsBook

console.log(myBook); // Log our ContactsBook
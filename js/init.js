//-> Init App
if (localStorage.book) { // Check if there is a previous book saved in localStorage
	var myBook = dbRestore(localStorage.book); // Load the saved book from localStorage
}else{ // If not create a new book
	var myBook = ContactsLib.ContactsBook.getInstance("My Contacts Book"); // Create a ContactsBook Singleton object
	console.log(myBook); // Log our new ContactsBook
}

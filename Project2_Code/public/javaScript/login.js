//JavaScript for login.html
//    Description:
//        This javascript file handles functions for the login
//        webpage. It handles the password and username validation,
//        toggling password visibility, the login form submission,
//        and redirecting if logged in.

let isCreating = false;

function createAccount() {
    isCreating = true;
}


// Function to show/hide password on login page
//    Input Parameters: 
//        none
//    Output: 
//        none
//    Description: 
//        This function toggles the visibility of the password 
//        entered in the password field. If the password field is 
//        of type "password", it changes it to "text" to show the
//        password, and if it is of type "text", it changes it 
//        back to "password" to hide the password.
function togglePassword() {
    let password = document.getElementById("passwordUserPassword");
    if (password.type === "password") {
        password.type = "text";
    } else {
        password.type = "password";
    }
}


// Function to validate password requirement
//    Input Parameters: 
//        input id of password input
//    Output: 
//        none
//    Description: 
//        Validates the password entered in the specified field.
//        Checks that the password isn't the same as the username 
//        and meets these requirements: at least 8 characters, 
//        one uppercase letter, one lowercase letter, one number, 
//        and one special character. If the password doesn't meet 
//        these requirements, a custom validation message is set. 
//        Otherwise, the validation message is cleared.
function validatePassword(inputID){
    let username = document.getElementById("textUserName").value;
    let str = document.getElementById(inputID).value;
    if (username == str)
        document.getElementById(inputID).setCustomValidity("Pass"+
            "word and username cannot be the same.");
    else if (str.match(/[a-z]/g) && str.match(/[A-Z]/g) && str.match(
        /[0-9]/g) && str.match(
            /[^a-zA-Z\d]/g) && str.length >= 8)
        document.getElementById(inputID).setCustomValidity("");
    else
        document.getElementById(inputID).setCustomValidity("Pass"+
        "word must be at least 8 characters long, and include at "+
        "least one uppercase letter, one lowercase letter, one"+
        " number, and one special character.");
}

// Function to validate email format for username
//    Input Parameters: 
//        input id of username input
//    Output: 
//        none
//    Description: 
//        This function validates the email format entered in the 
//        input field specified by inputID. It uses a regular 
//        expression to check whether the entered text matches the 
//        standard email format. If the email is valid, it clears 
//        any custom validation message. Otherwise, it sets a custom
//        validation message to prompt the user to enter a valid 
//        email.
function validateUsername(inputID){
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]/;
    let str = document.getElementById(inputID).value;
    if (pattern.test(str))
        document.getElementById(inputID).setCustomValidity("");
    else
        document.getElementById(inputID).setCustomValidity("Please "+
            "enter a valid email.");
}

// Function to handle login form submission
//    Input Parameters: 
//        event object triggered when the login form is submitted
//    Output: 
//        none
//    Description: 
//        This function handles the login form submission, prevents 
//        the default behavior, and sends the login credentials 
//        (username and password) via a POST request to the server. 
//        If login is successful, the user is redirected to the 
//        'gallery.html' page and a success message is shown. If 
//        login fails, an error message is displayed. The password 
//        input is cleared after the form submission.
function submitLoginForm(event){
    event.preventDefault();

    let username = document.getElementById("textUserName");
    let password = document.getElementById("passwordUserPassword");
    
    // Create an object for form data
    const formData = new FormData();

    formData.append("username", username);
    formData.append("password", password);

    if(isCreating){
        isCreating = false;
        fetch('/create', {
            method: 'POST',
            body: new URLSearchParams(new FormData(loginForm)) 
        })
        .then(response => {
            return response.json(); 
        })
        .then(data => {
            if (data.success) {
                window.location.href = 'login.html'; 
                alert(data.message);  // Show success message
            } else {
                alert(data.message);  // Show error message
            }
            //clears input
            username.value = '';
            password.value = '';  
        })
        .catch(error => {
            console.error("Error creating account:", error);
            alert("An error occurred, please try again.");
        });
    }else{
        fetch('/login', {
            method: 'POST',
            body: new URLSearchParams(new FormData(loginForm)) 
        })
        .then(response => {
            return response.json(); 
        })
        .then(data => {
            if (data.success) {
                window.location.href = 'gallery.html'; 
                alert(data.message);  // Show success message
            } else {
                alert(data.message);  // Show error message
            }
            //clears password input
            password.value = '';  
        })
        .catch(error => {
            console.error("Error during login:", error);
            alert("An error occurred, please try again.");
        });
    }
}

// Function to check if the user is logged in
//    Input Parameters: 
//        none
//    Output: 
//        none
//    Description: 
//        This function checks the user's login status by sending 
//        a request to the server. If the user is logged in, they 
//        are redirected to 'gallery.html' and a success message 
//        is shown. If the user is not logged in and is on the 
//        'login.html' page, they are redirected to the login page 
//        with a message, and the 'fromGallery' session item is 
//        removed.
function checkLoginStatus() {
    fetch('/checkLogin')
        .then(response => response.json())
        .then(data => {
            if (data.loggedIn) {
                // If already logged in, redirect to gallery.html
                alert(data.message);
                window.location.href = 'gallery.html';
            } else if(window.location.pathname === '/login.html'
                && sessionStorage.getItem('fromGallery') === 'true'){
                //If not logged in, redirect to login.html
                sessionStorage.removeItem('fromGallery');
                setTimeout(() => {
                    alert(data.message);
                }, 80); 
            }
        })
        .catch(error => {
            console.error("Error checking login status:", error);
        });
}

document.addEventListener("DOMContentLoaded", () => {
    checkLoginStatus();
    document.getElementById('loginForm')
        .addEventListener('submit', submitLoginForm);
});

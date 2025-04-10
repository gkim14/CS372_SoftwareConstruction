// JavaScript for home.html
//    Description:
//        This javascript file handles functions for the home
//        webpage. It handles the slideshow and the logout button.


let slideIndex = 0;
showSlides();

// Function to show and switch slides 
//    Input Parameters:
//        none
//    Output: 
//        none
//    Description: 
//        This function cycles through a set of slides by 
//        hiding all slides and displaying the next one. It 
//        increments the slide index, and once it exceeds the 
//        total number of slides, it resets to the first slide. 
//        The slides change every 4 seconds.
function showSlides()
{
    let slides = document.getElementsByClassName("mySlides");

    for(let i = 0; i<slides.length;i++)
        slides[i].style.display = "none";
    slideIndex++;
    if (slideIndex > slides.length)
        slideIndex = 1;  
    slides[slideIndex-1].style.display = "block";
    setTimeout(showSlides, 4000); // Change image every 4 seconds
}

// Function to check if the user is logged in
//    Input Parameters:
//        none
//    Output: 
//        none
//    Description: 
//        This function checks the user's login status by sending 
//        a request to the server. If the user is logged in, it 
//        shows the logout button. If an error occurs while checking
//        the status, the user is redirected to the login page.
function checkLoginStatus() {
    fetch('/checkLogin')
        .then(response => response.json())
        .then(data => {
            if (data.loggedIn) {
                // If logged in, show the logout button
                document.getElementById("logoutButton")
                    .style.display = "block";
            }
        })
        .catch(error => {
            console.error("Error checking login status:", error);
            // If an error occurs, redirect to the login page
            window.location.href = 'login.html';
        });
}

// Function to handle logout
//    Input Parameters: 
//        none
//    Output: 
//        none
//    Description: 
//        This function handles the logout process by sending a 
//        POST request to the server. If the logout is successful, 
//        a success message is shown and the user is redirected to 
//        the login page. If there is an error, an error message is 
//        displayed.
function logout() {
    fetch('/logout', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                // Redirect to login page
                window.location.href = 'login.html'; 
            } else {
                alert("Error during logout.");
            }
        })
        .catch(error => {
            console.error("Error during logout:", error);
        });
}

// Function for checking if user can logout
//    Input Parameters: 
//        none
//    Output: 
//        none
//    Description: 
//        This function checks the user's login status by calling 
//        the `checkLoginStatus` function. It also sets up an event
//        listener for the logout button so that when it's clicked, 
//        the `logout` function is called.
function checkLogoutStatus(){
    checkLoginStatus(); // Check if the user is logged in

    // Set up the logout button click event
    const logoutButton = document.getElementById("logoutButton");
    logoutButton.addEventListener("click", logout);
}

document.addEventListener("DOMContentLoaded", checkLogoutStatus);


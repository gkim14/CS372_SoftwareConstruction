// JavaScript for gallery.html
//    Description:
//        This javascript file handles functions for the gallery
//        webpage. It handles the logout button.


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
            else {
                // If not logged in, redirect to login page
                sessionStorage.setItem('fromGallery', 'true');
                window.location.href = 'login.html';
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


function loadMovies() {
    fetch('/movies')
        .then(response => response.json())
        .then(movies => {
            const container = document.getElementById('galleryContainer');
            container.innerHTML = ""; // Clear existing content

            // Sort movies alphabetically by title
            movies.sort((a, b) => a.title.localeCompare(b.title));

            // Loop through the sorted movies and display them
            movies.forEach(movie => {
                const movieDiv = document.createElement('div');
                movieDiv.className = 'movieTile';
                movieDiv.style.width = '250px';
                movieDiv.style.textAlign = 'center';
                movieDiv.setAttribute('dataTitle', movie.title.toLowerCase()); // Store title for search comparison

                const img = document.createElement('img');
                img.src = movie.imagePath;
                img.alt = movie.title;
                img.style.width = '100%';
                img.style.borderRadius = '10px';

                const caption = document.createElement('div');
                caption.textContent = movie.title;
                caption.style.marginTop = '8px';
                caption.style.fontWeight = 'bold';

                // Add event listener for image click to navigate to the movie page
                img.addEventListener('click', () => {
                    window.location.href = `movie.html?id=${movie._id}`; // Pass the movie's ID in the URL
                });

                movieDiv.appendChild(img);
                movieDiv.appendChild(caption);
                container.appendChild(movieDiv);
            });
        })
        .catch(error => {
            console.error("Error loading movies:", error);
        });
}

function loadLikedMovies() {
    fetch('/user/likedMovies')
        .then(response => response.json())
        .then(movies => {
            const likedBar = document.getElementById('likedMoviesBar');
            likedBar.innerHTML = ""; // Clear old content

            if (movies.length === 0) {
                const message = document.createElement('div');
                message.textContent = "You haven't liked any movies yet!";
                message.style.color = "#666";
                message.style.fontStyle = "italic";
                message.style.marginTop = '10px';
                likedBar.appendChild(message);

                const placeholder = document.createElement('div');
                placeholder.style.display = 'inline-block';
                placeholder.style.width = '150px';
                placeholder.style.height = '225px';
                placeholder.style.marginRight = '15px';
                likedBar.appendChild(placeholder);
                return;
            }

            likedBar.style.display = "block";

            movies.sort((a, b) => a.title.localeCompare(b.title));

            movies.forEach(movie => {
                const movieDiv = document.createElement('div');
                movieDiv.style.display = 'inline-block';
                movieDiv.style.marginRight = '15px';
                movieDiv.style.textAlign = 'center';
                movieDiv.style.width = '150px';

                const img = document.createElement('img');
                img.src = movie.imagePath;
                img.alt = movie.title;
                img.style.width = '100%';
                img.style.borderRadius = '8px';
                img.style.cursor = 'pointer';

                const title = document.createElement('div');
                title.textContent = movie.title;
                title.style.fontSize = '14px';
                title.style.marginTop = '6px';
                title.style.fontWeight = 'bold';

                img.addEventListener('click', () => {
                    window.location.href = `movie.html?id=${movie._id}`;
                });

                movieDiv.appendChild(img);
                movieDiv.appendChild(title);
                likedBar.appendChild(movieDiv);
            });
        })
        .catch(error => {
            console.error("Error loading liked movies:", error);
        });
}

// Call the function when the page is loaded
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


function searchGallery() {
    const input = document.getElementById("searchInput").value.toLowerCase();
    const movieTiles = document.querySelectorAll('.movieTile');

    movieTiles.forEach(movieTile => {
        const movieTitle = movieTile.getAttribute('dataTitle');
        
        if (movieTitle && movieTitle.includes(input)) {
            movieTile.style.display = "block"; // Show the movie
        } else {
            movieTile.style.display = "none"; // Hide the movie
        }
    });
}


// Hook up search button
document.addEventListener("DOMContentLoaded", () => {
    checkLogoutStatus();
    loadLikedMovies() 
    loadMovies();

    const searchButton = document.getElementById("searchButton");
    const searchInput = document.getElementById("searchInput");

    if (searchButton && searchInput) {
        searchButton.addEventListener("click", searchGallery);

        // Optional: allow pressing "Enter" to search
        searchInput.addEventListener("keyup", event => {
            if (event.key === "Enter") {
                searchGallery();
            }
        });
    }
});

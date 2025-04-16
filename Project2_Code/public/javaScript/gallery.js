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
                localStorage.removeItem('selectedRole');
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

function setRoleDropdown() {
    return fetch('/user/role')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.role) {
                currentRole = data.role;
                localStorage.setItem('selectedRole', currentRole);


                const roles = data.list;
                const dropdown = document.getElementById('roleChange');
                dropdown.innerHTML = '';

                roles.forEach(role => {
                    const option = document.createElement('option');
                    option.value = role;
                    option.textContent = role;
                    if (role === currentRole) {
                        option.selected = true;
                    }
                    dropdown.appendChild(option);
                });

            }
        })
        .catch(err => {
            console.error("Error fetching role:", err);
        });
}

// send the selected role to the server
function updateRoleOnServer(role) {
    return fetch('/updateRole', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: role }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            localStorage.setItem('selectedRole', role);
        }
    })
    .catch(error => {
        console.error("Error sending role to the server:", error);
    });
}

function removeMovie(movieId, movieElement) {
    fetch(`/removeMovies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Remove the movie from the DOM
            if (movieElement && movieElement.parentElement) {
                movieElement.parentElement.removeChild(movieElement);
            }
        }
    })
    .catch(error => {
        console.error("Error removing movie:", error);
    });
}

function loadMovies() {
    fetch('/movies')
        .then(response => response.json())
        .then(movies => {
            const container = document.getElementById('galleryContainer');
            container.innerHTML = "";

            const userRole = localStorage.getItem('selectedRole');
            if (userRole === "Content Editor") {
                const addButton = document.createElement('button');
                addButton.textContent = "Add Movie";
                addButton.id = "addMovieButton";
                addButton.style.marginBottom = "15px";
                addButton.addEventListener("click", () => {
                    window.location.href = "addMovie.html";
                });

                container.parentElement.insertBefore(addButton, container);
            }

            // Sort movies alphabetically
            movies.sort((a, b) => a.title.localeCompare(b.title));

            // Create preview popup container
            const previewPopup = createPreviewPopup();
            document.body.appendChild(previewPopup);

            // Loop through movies and render them
            movies.forEach(movie => {
                const movieDiv = createMovieTile(movie);
                // If Content Editor, add a Remove button
                if (currentRole === "Content Editor") {
                    const removeBtn = document.createElement("button");
                    removeBtn.textContent = "Remove";
                    removeBtn.style.marginTop = "10px";
                    removeBtn.addEventListener("click", () => {
                        if (confirm(`Remove "${movie.title}"?`)) {
                            removeMovie(movie._id, movieDiv);
                        }
                    });
                    movieDiv.appendChild(removeBtn);
                }
                container.appendChild(movieDiv);

                setupMovieTileInteractions(movie, movieDiv, previewPopup);
            });
        })
        .catch(error => {
            console.error("Error loading movies:", error);
        });
}

function createPreviewPopup() {
    let previewPopup = setPopupStyle(document.createElement('div'));
    const iframePreview = document.createElement('iframe');
    iframePreview.style.width = '100%';
    iframePreview.style.height = '100%';
    iframePreview.style.border = 'none';
    iframePreview.allow = 'autoplay; encrypted-media';
    iframePreview.allowFullscreen = true;
    previewPopup.appendChild(iframePreview);
    return previewPopup;
}

function setPopupStyle(previewPopup) {
    previewPopup.id = "previewPopup";
    previewPopup.style.position = 'fixed';
    previewPopup.style.display = 'none';
    previewPopup.style.border = 'none';
    previewPopup.style.zIndex = '1000';
    previewPopup.style.width = '320px';
    previewPopup.style.height = '180px';
    previewPopup.style.borderRadius = '10px';
    previewPopup.style.overflow = 'hidden';
    previewPopup.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    previewPopup.style.bottom = '10px';  
    previewPopup.style.right = '10px';   
    return previewPopup;
}

function createMovieTile(movie) {
    const movieDiv = document.createElement('div');
    movieDiv.className = 'movieTile';
    movieDiv.style.width = '250px';
    movieDiv.style.textAlign = 'center';
    movieDiv.setAttribute('dataTitle', movie.title.toLowerCase());

    const img = document.createElement('img');
    img.src = movie.imagePath;
    img.alt = movie.title;
    img.style.width = '100%';
    img.style.borderRadius = '10px';
    img.style.cursor = 'pointer';

    const caption = document.createElement('div');
    caption.textContent = movie.title;
    caption.style.marginTop = '8px';
    caption.style.fontWeight = 'bold';

    movieDiv.appendChild(img);
    movieDiv.appendChild(caption);

    return movieDiv;
}

function setupMovieTileInteractions(movie, movieDiv, previewPopup) {
    const img = movieDiv.querySelector('img');
    const iframePreview = previewPopup.querySelector('iframe');

    // Handle click - go to movie page
    img.addEventListener('click', () => {
        window.location.href = `movie.html?id=${movie._id}`;
    });

    // Show video preview on hover
    img.addEventListener('mouseenter', () => {
        const videoId = getYouTubeVideoId(movie.videoUrl);
        iframePreview.src = `${movie.videoUrl}?autoplay=1&mute=1
            &controls=0&loop=1&playlist=${videoId}`;
        previewPopup.style.display = 'block'; // Show the preview
    });

    // Hide preview when mouse leaves
    img.addEventListener('mouseleave', () => {
        previewPopup.style.display = 'none';
        iframePreview.src = ''; // Stop the video
    });
}

function getYouTubeVideoId(url) {
    const match = url.match(/\/embed\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : "";
}


function loadLikedMovies() {
    fetch('/user/likedMovies')
        .then(response => response.json())
        .then(movies => {
            const likedBar = document.getElementById('likedMoviesBar');
            likedBar.innerHTML = ""; // Clear old content

            if (movies.length === 0) {
                return;
            }

            likedBar.style.display = "block";

            movies.sort((a, b) => a.title.localeCompare(b.title));

            const previewPopup = createPreviewPopup();
            document.body.appendChild(previewPopup);

            movies.forEach(movie => {
                const movieDiv = setLikedMovieStyle(movie);

                likedBar.appendChild(movieDiv);
                setupMovieTileInteractions(movie, movieDiv, previewPopup);
            });
        })
        .catch(error => {
            console.error("Error loading liked movies:", error);
        });
}

function setLikedMovieStyle(movie) {
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

    movieDiv.appendChild(img);
    movieDiv.appendChild(title);

    return movieDiv;
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

document.addEventListener("DOMContentLoaded", () => {
    checkLogoutStatus();
    loadLikedMovies() 

    setRoleDropdown().then(() => {
        loadMovies();  
    });

    const dropdown = document.getElementById('roleChange');

    dropdown.addEventListener('change', function () {
        const selectedValue = dropdown.value;
        updateRoleOnServer(selectedValue)
        .then(() => {
            window.location.reload();
        });
    });

    const searchButton = document.getElementById("searchButton");
    const searchInput = document.getElementById("searchInput");

    if (searchButton && searchInput) {
        searchButton.addEventListener("click", searchGallery);

        searchInput.addEventListener("keyup", event => {
            if (event.key === "Enter") {
                searchGallery();
            }
        });
    }
});

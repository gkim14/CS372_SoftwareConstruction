// Fetch movie details based on the movie ID passed in the URL
function loadMovieDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id'); // Get movie ID from the URL
    const userRole = localStorage.getItem('selectedRole');

    if (!movieId) {
        alert("Movie ID is missing.");
        window.location.href = 'gallery.html'; // Redirect to gallery
        return;
    }

    // Fetch movie data from the server using the movie ID
    fetch(`/movie?id=${movieId}`)
        .then(response => response.json())
        .then(movie => {
            const container = document
                .getElementById('movieDetailsContainer');

            // Create and display movie title
            const movieTitle = document.createElement('h2');
            movieTitle.textContent = movie.title;

            // Create and display movie genre
            const movieGenre = document.createElement('p');
            movieGenre.textContent = "Genre: " 
                + movie.genre;

            // Create and display movie description
            const movieDescription = document.createElement('p');
            movieDescription.textContent = "Description: " 
                + movie.description;

            // Get the iframe element
            const iframe = document.getElementById('movieIframe');

            if (movie.videoUrl) {
                // Set the iframe src to the movie's video URL
                iframe.src = movie.videoUrl;
                iframe.style.display = 'block'; // Show iframe

                iframe.title = movie.title;
            } else {
                iframe.style.display = 'none';
            }

            // Append other elements to the container
            container.appendChild(movieTitle);
            container.appendChild(movieGenre);
            container.appendChild(movieDescription);
            if(userRole === "Content Editor") {
                const movieComment = document.createElement('p');
                movieComment.textContent = "Marketing Manager Comment:\n"
                    + movie.comment;

                container.appendChild(movieComment);
            }

            // Set up the like and dislike buttons
            const likeButton = document
                .getElementById('likeButton');
            const dislikeButton = document
                .getElementById('dislikeButton');

            const likeCount = document
                .getElementById('totalLikes');
            const dislikeCount = document
                .getElementById('totalDislikes');

            let role = localStorage.getItem('selectedRole');
            if(role === "Marketing Manager") {
                likeCount.textContent = "Likes: " + movie.likes;
                dislikeCount.textContent = "Dislikes: " 
                    + movie.dislikes;
            }
            else {
                likeCount.textContent = "";
                dislikeCount.textContent = "";
            }

            // Event listener for the like button
            likeButton.addEventListener('click', () => {
                updateLikeDislike(movie._id, 'like');
                alert("You Liked this video.");
            });

            // Event listener for the dislike button
            dislikeButton.addEventListener('click', () => {
                updateLikeDislike(movie._id, 'dislike');
                alert("You Disiked this video.");
            });
        })
        .catch(error => {
            console.error("Error loading movie details:", error);
            alert("Failed to load movie details.");
            window.location.href = 'gallery.html'; 
        });
}

// Function to update like or dislike count
function updateLikeDislike(movieId, type) {
    fetch(`/movie/updateLikeDislike`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId, type })
    })
    .then(response => response.json())
    .catch(error => {
        console.error("Error updating like/dislike:", error);
        alert("Failed to update like/dislike.");
    });
}

// Call the function to load movie details when the page is loaded
document.addEventListener("DOMContentLoaded", loadMovieDetails);

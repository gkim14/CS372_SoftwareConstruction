// Fetch movie details based on the movie ID passed in the URL
function loadMovieDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id'); // Get movie ID from the URL

    if (!movieId) {
        // If there's no movie ID, show an error or redirect
        alert("Movie ID is missing.");
        window.location.href = 'gallery.html'; // Redirect to gallery
        return;
    }

    // Fetch movie data from the server using the movie ID
    fetch(`/movie?id=${movieId}`)
        .then(response => response.json())
        .then(movie => {
            const container = document.getElementById('movieDetailsContainer');

            // Create and display movie title
            const movieTitle = document.createElement('h2');
            movieTitle.textContent = movie.title;

            // Create and display movie description
            const movieDescription = document.createElement('p');
            movieDescription.textContent = movie.description;

            // Get the iframe element
            const iframe = document.getElementById('movieIframe');

            // Create and display movie video if the video URL exists
            if (movie.videoUrl) {
                // Set the iframe src to the movie's video URL
                iframe.src = movie.videoUrl;
                iframe.style.display = 'block'; // Show iframe

                // Optionally set other iframe attributes like title
                iframe.title = movie.title;
            } else {
                iframe.style.display = 'none'; // Hide iframe if no video URL
            }

            // Append other elements to the container
            container.appendChild(movieTitle);
            container.appendChild(movieDescription);

            // Set up the like and dislike buttons to interact with the backend
            const likeButton = document.getElementById('likeButton');
            const dislikeButton = document.getElementById('dislikeButton');

            // Event listener for the like button
            likeButton.addEventListener('click', () => {
                updateLikeDislike(movie._id, 'like');
            });

            // Event listener for the dislike button
            dislikeButton.addEventListener('click', () => {
                updateLikeDislike(movie._id, 'dislike');
            });
        })
        .catch(error => {
            console.error("Error loading movie details:", error);
            alert("Failed to load movie details.");
            window.location.href = 'gallery.html'; // Redirect to gallery if there's an error
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

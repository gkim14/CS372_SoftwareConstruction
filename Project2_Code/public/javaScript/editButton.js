

function submitEditForm(event){
    event.preventDefault();
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get('id');

        fetch(`/editMovie/${movieId}`, {
            method: 'POST',
            body: new URLSearchParams(new FormData(editForm)) 
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
        })
        .catch(error => {
            console.error("Error occurred:", error);
            alert("An error occurred, please try again.");
        });
    
}

document.getElementById('editForm')
    .addEventListener('submit', submitEditForm); 

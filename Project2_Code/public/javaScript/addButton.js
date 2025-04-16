

function submitAddForm(event){
    event.preventDefault();

        fetch('/addMovie', {
            method: 'POST',
            body: new URLSearchParams(new FormData(addForm)) 
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

document.getElementById('addForm')
    .addEventListener('submit', submitAddForm); 

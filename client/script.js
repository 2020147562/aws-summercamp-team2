document.getElementById('damageReportForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const photo = document.getElementById('photo').files[0];
    const comment = document.getElementById('comment').value;
    
    if (!photo || !comment) {
        alert('Please provide both a photo and a comment.');
        return;
    }
    
    const formData = new FormData();
    formData.append('photo', photo);
    formData.append('comment', comment);
    
    // Replace with your actual API endpoint
    const apiUrl = 'https://your-api-endpoint.amazonaws.com/upload';

    fetch(apiUrl, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('statusMessage').textContent = 'Report submitted successfully!';
            document.getElementById('statusMessage').style.color = 'green';
        } else {
            document.getElementById('statusMessage').textContent = 'Failed to submit report. Please try again.';
        }
    })
    .catch(error => {
        document.getElementById('statusMessage').textContent = 'An error occurred. Please try again.';
        console.error('Error:', error);
    });
});

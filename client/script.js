document.getElementById('damageReportForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const image = document.getElementById('image').files[0];
    const comment = document.getElementById('comment').value;
    
    if (!image || !comment) {
        alert('Please provide both an image and a comment.');
        return;
    }
    
    const formData = new FormData();
    formData.append('image', image);
    formData.append('comment', comment);
    
    // Replace with your actual API endpoint
    const apiUrl = "https://6ea43qcw17.execute-api.ap-south-1.amazonaws.com/data_handling";

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

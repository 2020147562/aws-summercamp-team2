document.getElementById('damageReportForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const image = document.getElementById('image').files[0];
    const comment = document.getElementById('comment').value;

    if (!image || !comment) {
        alert('Please provide both an image and a comment.');
        return;
    }

    // 위치 정보를 가져오는 함수
    function getLocationAndSubmit() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                const formData = new FormData();
                formData.append('image', image);
                formData.append('comment', comment);
                formData.append('latitude', latitude);
                formData.append('longitude', longitude);

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

            }, function(error) {
                alert('Unable to retrieve your location.');
                console.error('Error:', error);
            });
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    }

    // 위치 정보를 가져와서 제출하는 함수 호출
    getLocationAndSubmit();
});

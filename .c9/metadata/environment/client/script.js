{"filter":false,"title":"script.js","tooltip":"/client/script.js","undoManager":{"mark":34,"position":34,"stack":[[{"start":{"row":0,"column":0},"end":{"row":59,"column":0},"action":"insert","lines":["document.getElementById('upload-form').addEventListener('submit', async function(event) {","    event.preventDefault();","    ","    const photoInput = document.getElementById('photo');","    const commentInput = document.getElementById('comment');","    const statusDiv = document.getElementById('status');","","    if (photoInput.files.length === 0) {","        alert('Please choose a photo to upload.');","        return;","    }","","    const file = photoInput.files[0];","    const comment = commentInput.value;","","    // 1. Upload the photo to S3","    const s3UploadUrl = \"YOUR_S3_PRESIGNED_URL_GENERATION_ENDPOINT\"; // Lambda/EC2에서 생성한 S3 presigned URL endpoint","    const uploadUrlResponse = await fetch(s3UploadUrl, {","        method: 'POST',","        body: JSON.stringify({ filename: file.name, filetype: file.type })","    });","","    const { url, fields } = await uploadUrlResponse.json();","","    const formData = new FormData();","    Object.entries(fields).forEach(([key, value]) => {","        formData.append(key, value);","    });","    formData.append('file', file);","","    const uploadResponse = await fetch(url, {","        method: 'POST',","        body: formData","    });","","    if (uploadResponse.ok) {","        // 2. Send the comment and S3 file URL to the server","        const s3FileUrl = `${url}/${fields.key}`;","        const serverEndpoint = \"YOUR_SERVER_ENDPOINT\"; // EC2 또는 Lambda의 엔드포인트","        const serverResponse = await fetch(serverEndpoint, {","            method: 'POST',","            headers: {","                'Content-Type': 'application/json'","            },","            body: JSON.stringify({","                photoUrl: s3FileUrl,","                comment: comment","            })","        });","","        if (serverResponse.ok) {","            statusDiv.textContent = \"Photo and comment uploaded successfully!\";","        } else {","            statusDiv.textContent = \"Failed to submit data to the server.\";","        }","    } else {","        statusDiv.textContent = \"Failed to upload the photo to S3.\";","    }","});",""],"id":38}],[{"start":{"row":0,"column":0},"end":{"row":59,"column":0},"action":"remove","lines":["document.getElementById('upload-form').addEventListener('submit', async function(event) {","    event.preventDefault();","    ","    const photoInput = document.getElementById('photo');","    const commentInput = document.getElementById('comment');","    const statusDiv = document.getElementById('status');","","    if (photoInput.files.length === 0) {","        alert('Please choose a photo to upload.');","        return;","    }","","    const file = photoInput.files[0];","    const comment = commentInput.value;","","    // 1. Upload the photo to S3","    const s3UploadUrl = \"YOUR_S3_PRESIGNED_URL_GENERATION_ENDPOINT\"; // Lambda/EC2에서 생성한 S3 presigned URL endpoint","    const uploadUrlResponse = await fetch(s3UploadUrl, {","        method: 'POST',","        body: JSON.stringify({ filename: file.name, filetype: file.type })","    });","","    const { url, fields } = await uploadUrlResponse.json();","","    const formData = new FormData();","    Object.entries(fields).forEach(([key, value]) => {","        formData.append(key, value);","    });","    formData.append('file', file);","","    const uploadResponse = await fetch(url, {","        method: 'POST',","        body: formData","    });","","    if (uploadResponse.ok) {","        // 2. Send the comment and S3 file URL to the server","        const s3FileUrl = `${url}/${fields.key}`;","        const serverEndpoint = \"YOUR_SERVER_ENDPOINT\"; // EC2 또는 Lambda의 엔드포인트","        const serverResponse = await fetch(serverEndpoint, {","            method: 'POST',","            headers: {","                'Content-Type': 'application/json'","            },","            body: JSON.stringify({","                photoUrl: s3FileUrl,","                comment: comment","            })","        });","","        if (serverResponse.ok) {","            statusDiv.textContent = \"Photo and comment uploaded successfully!\";","        } else {","            statusDiv.textContent = \"Failed to submit data to the server.\";","        }","    } else {","        statusDiv.textContent = \"Failed to upload the photo to S3.\";","    }","});",""],"id":39}],[{"start":{"row":0,"column":0},"end":{"row":61,"column":0},"action":"insert","lines":["document.getElementById('upload-form').addEventListener('submit', async function(event) {","    event.preventDefault();","    ","    const photoInput = document.getElementById('photo');","    const commentInput = document.getElementById('comment');","    const statusDiv = document.getElementById('status');","","    if (photoInput.files.length === 0) {","        alert('Please choose a photo to upload.');","        return;","    }","","    const file = photoInput.files[0];","    const comment = commentInput.value;","","    // 1. Upload the photo to S3","    const s3BucketUrl = \"https://YOUR_BUCKET_NAME.s3.amazonaws.com/\";","    const photoKey = `photos/${Date.now()}_${file.name}`;","","    try {","        const uploadPhotoResponse = await fetch(`${s3BucketUrl}${photoKey}`, {","            method: 'PUT',","            headers: {","                'Content-Type': file.type,","                'x-amz-acl': 'public-read'  // Make the uploaded file publicly readable","            },","            body: file","        });","","        if (uploadPhotoResponse.ok) {","            // 2. Create JSON object for the comment","            const commentData = {","                photoUrl: `${s3BucketUrl}${photoKey}`,","                comment: comment","            };","","            const commentKey = `comments/${Date.now()}_${file.name.split('.')[0]}.json`;","","            // 3. Upload the comment to S3","            const uploadCommentResponse = await fetch(`${s3BucketUrl}${commentKey}`, {","                method: 'PUT',","                headers: {","                    'Content-Type': 'application/json',","                    'x-amz-acl': 'public-read'","                },","                body: JSON.stringify(commentData)","            });","","            if (uploadCommentResponse.ok) {","                statusDiv.textContent = \"Photo and comment uploaded successfully!\";","            } else {","                statusDiv.textContent = \"Failed to upload the comment to S3.\";","            }","        } else {","            statusDiv.textContent = \"Failed to upload the photo to S3.\";","        }","    } catch (error) {","        console.error('Error:', error);","        statusDiv.textContent = \"An error occurred during the upload.\";","    }","});",""],"id":40}],[{"start":{"row":16,"column":48},"end":{"row":16,"column":49},"action":"remove","lines":["E"],"id":41},{"start":{"row":16,"column":47},"end":{"row":16,"column":48},"action":"remove","lines":["M"]},{"start":{"row":16,"column":46},"end":{"row":16,"column":47},"action":"remove","lines":["A"]},{"start":{"row":16,"column":45},"end":{"row":16,"column":46},"action":"remove","lines":["N"]},{"start":{"row":16,"column":44},"end":{"row":16,"column":45},"action":"remove","lines":["_"]},{"start":{"row":16,"column":43},"end":{"row":16,"column":44},"action":"remove","lines":["T"]},{"start":{"row":16,"column":42},"end":{"row":16,"column":43},"action":"remove","lines":["E"]},{"start":{"row":16,"column":41},"end":{"row":16,"column":42},"action":"remove","lines":["K"]},{"start":{"row":16,"column":40},"end":{"row":16,"column":41},"action":"remove","lines":["C"]},{"start":{"row":16,"column":39},"end":{"row":16,"column":40},"action":"remove","lines":["U"]},{"start":{"row":16,"column":38},"end":{"row":16,"column":39},"action":"remove","lines":["B"]},{"start":{"row":16,"column":37},"end":{"row":16,"column":38},"action":"remove","lines":["_"]},{"start":{"row":16,"column":36},"end":{"row":16,"column":37},"action":"remove","lines":["R"]},{"start":{"row":16,"column":35},"end":{"row":16,"column":36},"action":"remove","lines":["U"]},{"start":{"row":16,"column":34},"end":{"row":16,"column":35},"action":"remove","lines":["O"]},{"start":{"row":16,"column":33},"end":{"row":16,"column":34},"action":"remove","lines":["Y"]}],[{"start":{"row":16,"column":33},"end":{"row":16,"column":34},"action":"insert","lines":["ㅅ"],"id":42},{"start":{"row":16,"column":34},"end":{"row":16,"column":35},"action":"insert","lines":["ㄷ"]}],[{"start":{"row":16,"column":34},"end":{"row":16,"column":35},"action":"remove","lines":["ㄷ"],"id":43},{"start":{"row":16,"column":33},"end":{"row":16,"column":34},"action":"remove","lines":["ㅅ"]}],[{"start":{"row":16,"column":33},"end":{"row":16,"column":34},"action":"insert","lines":["t"],"id":44},{"start":{"row":16,"column":34},"end":{"row":16,"column":35},"action":"insert","lines":["e"]},{"start":{"row":16,"column":35},"end":{"row":16,"column":36},"action":"insert","lines":["a"]},{"start":{"row":16,"column":36},"end":{"row":16,"column":37},"action":"insert","lines":["m"]},{"start":{"row":16,"column":37},"end":{"row":16,"column":38},"action":"insert","lines":["2"]},{"start":{"row":16,"column":38},"end":{"row":16,"column":39},"action":"insert","lines":["-"]},{"start":{"row":16,"column":39},"end":{"row":16,"column":40},"action":"insert","lines":["t"]},{"start":{"row":16,"column":40},"end":{"row":16,"column":41},"action":"insert","lines":["e"]},{"start":{"row":16,"column":41},"end":{"row":16,"column":42},"action":"insert","lines":["s"]},{"start":{"row":16,"column":42},"end":{"row":16,"column":43},"action":"insert","lines":["t"]}],[{"start":{"row":16,"column":43},"end":{"row":16,"column":44},"action":"insert","lines":["-"],"id":45},{"start":{"row":16,"column":44},"end":{"row":16,"column":45},"action":"insert","lines":["b"]},{"start":{"row":16,"column":45},"end":{"row":16,"column":46},"action":"insert","lines":["u"]},{"start":{"row":16,"column":46},"end":{"row":16,"column":47},"action":"insert","lines":["c"]},{"start":{"row":16,"column":47},"end":{"row":16,"column":48},"action":"insert","lines":["k"]},{"start":{"row":16,"column":48},"end":{"row":16,"column":49},"action":"insert","lines":["e"]}],[{"start":{"row":16,"column":49},"end":{"row":16,"column":50},"action":"insert","lines":["t"],"id":46},{"start":{"row":16,"column":50},"end":{"row":16,"column":51},"action":"insert","lines":["-"]},{"start":{"row":16,"column":51},"end":{"row":16,"column":52},"action":"insert","lines":["0"]},{"start":{"row":16,"column":52},"end":{"row":16,"column":53},"action":"insert","lines":["1"]}],[{"start":{"row":16,"column":24},"end":{"row":16,"column":73},"action":"remove","lines":["\"https://team2-test-bucket-01.s3.amazonaws.com/\";"],"id":47},{"start":{"row":16,"column":24},"end":{"row":16,"column":87},"action":"insert","lines":["http://team2-test-bucket-01.s3-website.ap-south-1.amazonaws.com"]}],[{"start":{"row":16,"column":87},"end":{"row":16,"column":88},"action":"insert","lines":[";"],"id":48}],[{"start":{"row":16,"column":87},"end":{"row":16,"column":88},"action":"insert","lines":["\""],"id":49}],[{"start":{"row":16,"column":24},"end":{"row":16,"column":25},"action":"insert","lines":["\""],"id":50}],[{"start":{"row":0,"column":0},"end":{"row":61,"column":0},"action":"remove","lines":["document.getElementById('upload-form').addEventListener('submit', async function(event) {","    event.preventDefault();","    ","    const photoInput = document.getElementById('photo');","    const commentInput = document.getElementById('comment');","    const statusDiv = document.getElementById('status');","","    if (photoInput.files.length === 0) {","        alert('Please choose a photo to upload.');","        return;","    }","","    const file = photoInput.files[0];","    const comment = commentInput.value;","","    // 1. Upload the photo to S3","    const s3BucketUrl = \"http://team2-test-bucket-01.s3-website.ap-south-1.amazonaws.com\";","    const photoKey = `photos/${Date.now()}_${file.name}`;","","    try {","        const uploadPhotoResponse = await fetch(`${s3BucketUrl}${photoKey}`, {","            method: 'PUT',","            headers: {","                'Content-Type': file.type,","                'x-amz-acl': 'public-read'  // Make the uploaded file publicly readable","            },","            body: file","        });","","        if (uploadPhotoResponse.ok) {","            // 2. Create JSON object for the comment","            const commentData = {","                photoUrl: `${s3BucketUrl}${photoKey}`,","                comment: comment","            };","","            const commentKey = `comments/${Date.now()}_${file.name.split('.')[0]}.json`;","","            // 3. Upload the comment to S3","            const uploadCommentResponse = await fetch(`${s3BucketUrl}${commentKey}`, {","                method: 'PUT',","                headers: {","                    'Content-Type': 'application/json',","                    'x-amz-acl': 'public-read'","                },","                body: JSON.stringify(commentData)","            });","","            if (uploadCommentResponse.ok) {","                statusDiv.textContent = \"Photo and comment uploaded successfully!\";","            } else {","                statusDiv.textContent = \"Failed to upload the comment to S3.\";","            }","        } else {","            statusDiv.textContent = \"Failed to upload the photo to S3.\";","        }","    } catch (error) {","        console.error('Error:', error);","        statusDiv.textContent = \"An error occurred during the upload.\";","    }","});",""],"id":51}],[{"start":{"row":0,"column":0},"end":{"row":61,"column":0},"action":"insert","lines":["document.getElementById('upload-form').addEventListener('submit', async function(event) {","    event.preventDefault();","    ","    const photoInput = document.getElementById('photo');","    const commentInput = document.getElementById('comment');","    const statusDiv = document.getElementById('status');","","    if (photoInput.files.length === 0) {","        alert('Please choose a photo to upload.');","        return;","    }","","    const file = photoInput.files[0];","    const comment = commentInput.value;","","    // 1. Upload the photo to S3 using the HTTPS REST API endpoint","    const s3BucketUrl = \"https://team2-test-bucket-01.s3.ap-south-1.amazonaws.com/\";","    const photoKey = `photos/${Date.now()}_${file.name}`;","","    try {","        const uploadPhotoResponse = await fetch(`${s3BucketUrl}${photoKey}`, {","            method: 'PUT',","            headers: {","                'Content-Type': file.type,","                'x-amz-acl': 'public-read'  // Make the uploaded file publicly readable","            },","            body: file","        });","","        if (uploadPhotoResponse.ok) {","            // 2. Create JSON object for the comment","            const commentData = {","                photoUrl: `${s3BucketUrl}${photoKey}`,","                comment: comment","            };","","            const commentKey = `comments/${Date.now()}_${file.name.split('.')[0]}.json`;","","            // 3. Upload the comment to S3 using the HTTPS REST API endpoint","            const uploadCommentResponse = await fetch(`${s3BucketUrl}${commentKey}`, {","                method: 'PUT',","                headers: {","                    'Content-Type': 'application/json',","                    'x-amz-acl': 'public-read'","                },","                body: JSON.stringify(commentData)","            });","","            if (uploadCommentResponse.ok) {","                statusDiv.textContent = \"Photo and comment uploaded successfully!\";","            } else {","                statusDiv.textContent = \"Failed to upload the comment to S3.\";","            }","        } else {","            statusDiv.textContent = \"Failed to upload the photo to S3.\";","        }","    } catch (error) {","        console.error('Error:', error);","        statusDiv.textContent = \"An error occurred during the upload.\";","    }","});",""],"id":52}],[{"start":{"row":16,"column":56},"end":{"row":16,"column":57},"action":"remove","lines":["."],"id":53}],[{"start":{"row":16,"column":56},"end":{"row":16,"column":57},"action":"insert","lines":["-"],"id":54}],[{"start":{"row":16,"column":56},"end":{"row":16,"column":57},"action":"remove","lines":["-"],"id":55}],[{"start":{"row":16,"column":56},"end":{"row":16,"column":57},"action":"insert","lines":["."],"id":56}],[{"start":{"row":16,"column":56},"end":{"row":16,"column":57},"action":"remove","lines":["."],"id":57}],[{"start":{"row":16,"column":56},"end":{"row":16,"column":57},"action":"insert","lines":["-"],"id":58}],[{"start":{"row":16,"column":4},"end":{"row":16,"column":84},"action":"remove","lines":["const s3BucketUrl = \"https://team2-test-bucket-01.s3-ap-south-1.amazonaws.com/\";"],"id":59},{"start":{"row":16,"column":4},"end":{"row":17,"column":0},"action":"insert","lines":["const s3BucketUrl = \"https://team2-test-bucket-01.s3.ap-south-1.amazonaws.com/\";",""]}],[{"start":{"row":16,"column":84},"end":{"row":17,"column":0},"action":"remove","lines":["",""],"id":60}],[{"start":{"row":53,"column":16},"end":{"row":54,"column":0},"action":"insert","lines":["",""],"id":61},{"start":{"row":54,"column":0},"end":{"row":54,"column":12},"action":"insert","lines":["            "]}],[{"start":{"row":54,"column":12},"end":{"row":54,"column":110},"action":"insert","lines":["console.error('Photo upload failed:', uploadPhotoResponse.status, uploadPhotoResponse.statusText);"],"id":62}],[{"start":{"row":0,"column":0},"end":{"row":62,"column":0},"action":"remove","lines":["document.getElementById('upload-form').addEventListener('submit', async function(event) {","    event.preventDefault();","    ","    const photoInput = document.getElementById('photo');","    const commentInput = document.getElementById('comment');","    const statusDiv = document.getElementById('status');","","    if (photoInput.files.length === 0) {","        alert('Please choose a photo to upload.');","        return;","    }","","    const file = photoInput.files[0];","    const comment = commentInput.value;","","    // 1. Upload the photo to S3 using the HTTPS REST API endpoint","    const s3BucketUrl = \"https://team2-test-bucket-01.s3.ap-south-1.amazonaws.com/\";","    const photoKey = `photos/${Date.now()}_${file.name}`;","","    try {","        const uploadPhotoResponse = await fetch(`${s3BucketUrl}${photoKey}`, {","            method: 'PUT',","            headers: {","                'Content-Type': file.type,","                'x-amz-acl': 'public-read'  // Make the uploaded file publicly readable","            },","            body: file","        });","","        if (uploadPhotoResponse.ok) {","            // 2. Create JSON object for the comment","            const commentData = {","                photoUrl: `${s3BucketUrl}${photoKey}`,","                comment: comment","            };","","            const commentKey = `comments/${Date.now()}_${file.name.split('.')[0]}.json`;","","            // 3. Upload the comment to S3 using the HTTPS REST API endpoint","            const uploadCommentResponse = await fetch(`${s3BucketUrl}${commentKey}`, {","                method: 'PUT',","                headers: {","                    'Content-Type': 'application/json',","                    'x-amz-acl': 'public-read'","                },","                body: JSON.stringify(commentData)","            });","","            if (uploadCommentResponse.ok) {","                statusDiv.textContent = \"Photo and comment uploaded successfully!\";","            } else {","                statusDiv.textContent = \"Failed to upload the comment to S3.\";","            }","        } else {","            console.error('Photo upload failed:', uploadPhotoResponse.status, uploadPhotoResponse.statusText);","            statusDiv.textContent = \"Failed to upload the photo to S3.\";","        }","    } catch (error) {","        console.error('Error:', error);","        statusDiv.textContent = \"An error occurred during the upload.\";","    }","});",""],"id":63}],[{"start":{"row":0,"column":0},"end":{"row":40,"column":0},"action":"insert","lines":["document.getElementById('reportForm').addEventListener('submit', async function(event) {","    event.preventDefault();","","    const comment = document.getElementById('comment').value;","    const fileInput = document.getElementById('fileInput');","    const file = fileInput.files[0];","","    if (!comment || !file) {","        displayMessage('Please provide a comment and upload a photo.', 'error');","        return;","    }","","    try {","        // Pre-signed URL을 받아오는 API 호출","        const response = await fetch('YOUR_API_GATEWAY_URL?filename=' + encodeURIComponent(file.name));","        const data = await response.json();","        const url = data.url;","","        // S3로 파일 업로드","        const uploadResponse = await fetch(url, {","            method: 'PUT',","            body: file","        });","","        if (uploadResponse.ok) {","            displayMessage('Report submitted successfully!', 'success');","        } else {","            throw new Error('Upload failed');","        }","    } catch (error) {","        console.error('Error:', error);","        displayMessage('Failed to submit report. Please try again.', 'error');","    }","});","","function displayMessage(message, type) {","    const messageDiv = document.getElementById('message');","    messageDiv.textContent = message;","    messageDiv.className = type;","}",""],"id":64}],[{"start":{"row":14,"column":38},"end":{"row":14,"column":58},"action":"remove","lines":["YOUR_API_GATEWAY_URL"],"id":65}],[{"start":{"row":14,"column":38},"end":{"row":14,"column":39},"action":"remove","lines":["?"],"id":66}],[{"start":{"row":14,"column":38},"end":{"row":15,"column":0},"action":"insert","lines":["https://q4t0bki3bj.execute-api.ap-south-1.amazonaws.com/Prod/upload",""],"id":67}],[{"start":{"row":14,"column":105},"end":{"row":15,"column":0},"action":"remove","lines":["",""],"id":68}],[{"start":{"row":14,"column":105},"end":{"row":14,"column":106},"action":"insert","lines":["?"],"id":69}],[{"start":{"row":14,"column":38},"end":{"row":14,"column":105},"action":"remove","lines":["https://q4t0bki3bj.execute-api.ap-south-1.amazonaws.com/Prod/upload"],"id":70}],[{"start":{"row":14,"column":38},"end":{"row":14,"column":105},"action":"insert","lines":["https://vzh96fo2he.execute-api.ap-south-1.amazonaws.com/Prod/upload"],"id":71}],[{"start":{"row":0,"column":0},"end":{"row":40,"column":0},"action":"remove","lines":["document.getElementById('reportForm').addEventListener('submit', async function(event) {","    event.preventDefault();","","    const comment = document.getElementById('comment').value;","    const fileInput = document.getElementById('fileInput');","    const file = fileInput.files[0];","","    if (!comment || !file) {","        displayMessage('Please provide a comment and upload a photo.', 'error');","        return;","    }","","    try {","        // Pre-signed URL을 받아오는 API 호출","        const response = await fetch('https://vzh96fo2he.execute-api.ap-south-1.amazonaws.com/Prod/upload?filename=' + encodeURIComponent(file.name));","        const data = await response.json();","        const url = data.url;","","        // S3로 파일 업로드","        const uploadResponse = await fetch(url, {","            method: 'PUT',","            body: file","        });","","        if (uploadResponse.ok) {","            displayMessage('Report submitted successfully!', 'success');","        } else {","            throw new Error('Upload failed');","        }","    } catch (error) {","        console.error('Error:', error);","        displayMessage('Failed to submit report. Please try again.', 'error');","    }","});","","function displayMessage(message, type) {","    const messageDiv = document.getElementById('message');","    messageDiv.textContent = message;","    messageDiv.className = type;","}",""],"id":72},{"start":{"row":0,"column":0},"end":{"row":36,"column":0},"action":"insert","lines":["document.getElementById('damageReportForm').addEventListener('submit', function(event) {","    event.preventDefault();","    ","    const photo = document.getElementById('photo').files[0];","    const comment = document.getElementById('comment').value;","    ","    if (!photo || !comment) {","        alert('Please provide both a photo and a comment.');","        return;","    }","    ","    const formData = new FormData();","    formData.append('photo', photo);","    formData.append('comment', comment);","    ","    // Replace with your actual API endpoint","    const apiUrl = 'https://your-api-endpoint.amazonaws.com/upload';","","    fetch(apiUrl, {","        method: 'POST',","        body: formData","    })","    .then(response => response.json())","    .then(data => {","        if (data.success) {","            document.getElementById('statusMessage').textContent = 'Report submitted successfully!';","            document.getElementById('statusMessage').style.color = 'green';","        } else {","            document.getElementById('statusMessage').textContent = 'Failed to submit report. Please try again.';","        }","    })","    .catch(error => {","        document.getElementById('statusMessage').textContent = 'An error occurred. Please try again.';","        console.error('Error:', error);","    });","});",""]}]]},"ace":{"folds":[],"scrolltop":0,"scrollleft":0,"selection":{"start":{"row":17,"column":0},"end":{"row":17,"column":0},"isBackwards":false},"options":{"guessTabSize":true,"useWrapMode":false,"wrapToView":true},"firstLineState":0},"timestamp":1723880627009,"hash":"fef65fed295f6caf0d4d470202b9e4d4f549e52e"}
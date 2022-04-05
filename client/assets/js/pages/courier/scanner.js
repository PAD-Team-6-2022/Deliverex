
Html5Qrcode.getCameras().then(devices => {
    if (devices && devices.length) {
        const cameraId = devices.length > 1 ? devices[1].id : devices[0].id;
        const boxLength = screen.width / 3;
        const html5QrCode = new Html5Qrcode("reader");

        html5QrCode.start(
            cameraId,
            {
                fps: 60,
                qrbox: { width: boxLength, height: boxLength },
                aspectRatio: 1.0
            },
            (decodedText, decodedResult) => {
                // do something when code is read
                console.log(decodedText);

                fetch('/courier/scan', {
                    method: 'POST', // or 'PUT'
                    headers: {
                        'Content-Type': 'application/text',
                    },
                    body: decodedText,
                })
                    .then(data => {
                        if(data.redirected)
                            window.location.href = data.url;
                        console.log('Success:', data);
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
            },
            (errorMessage) => {
                // parse error, ignore it.
            })
            .catch((err) => {
                // Start failed, handle it.
            });
    }
}).catch(err => {
    console.error(`oh kut we hebben een error. Error: ${err}`)
});
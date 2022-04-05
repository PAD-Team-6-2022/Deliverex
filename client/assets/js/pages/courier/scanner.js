
Html5Qrcode.getCameras().then(devices => {
    /**
     * devices would be an array of objects of type:
     * { id: "id", label: "label" }
     */
    if (devices && devices.length) {
        const cameraId = devices.length > 1 ? devices[1].id : devices[0].id;

        const boxLength = screen.width / 3;

        const html5QrCode = new Html5Qrcode("reader");
        html5QrCode.dim
        html5QrCode.start(
            cameraId,
            {
                fps: 60,    // Optional, frame per seconds for qr code scanning
                qrbox: { width: boxLength, height: boxLength },  // Optional, if you want bounded box UI
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
                    body: text,
                })
                    .then(data => {
                        if(data.redirected)
                            window.location.href = data.url;
                        console.log('Success:', data);
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });

               // window.location = `./scan?hello=${decodedText}&babe=4`;
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
(() => {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('load');
        const form = document.querySelector('.uploadForm');
        form.onsubmit = () => {
            const data = JSON.stringify({
                'file': form.filetoupload.value
            });
            console.log("test 1");
            fetch('http://localhost:3030/upload', {
                'method': 'POST',
                'headers': {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Content-Length': data.length
                },
                'mode': 'cors',
                'cache': 'default',
                'body': data
            })
                .then((result) => result.json())
                .then((data) => {
                    console.log('Filen er uploadet');
                })
                .catch((err) => {
                    console.log(err);
                });

            return false;
        };
    });
})();
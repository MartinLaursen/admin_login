const restify = require('restify');
const path = require('path');
const mysql = require(path.join(__dirname, '..', 'config', 'mysql'));
const fs = require('fs');

module.exports = (app) => {
    app.post('/upload', (req, res, next) => {
        console.log('api-okay');
        console.log(req);
        /**
        * Processing request containing multipart/form-data
        */
        var uploaded_file = req.file;  // File in form
        console.log('myfile', uploaded_file);

        //Reading and sending file
        fs.readFile(uploaded_file.path, { encoding: 'utf-8' }, (err, data) => {
            // Returning a JSON containing the file's name and its content
            res.send({

                filename: uploaded_file.name,
                content: data
            });
            next()
        });
    });
}

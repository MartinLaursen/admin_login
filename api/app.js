const restify = require('restify');
const path = require('path');

plugins = require('restify-plugins'),
    fs = require('fs'),
    request = require('request'),
    FormData = require('form-data');

const port = process.env.port || 3030;

const app = restify.createServer({
    name: 'Administrations Panel eksempel',
    version: '1.0.0'
});

const logger = require('morgan');
app.use(logger('dev'));

app.use(plugins.multipartBodyParser());  // Enabling multipart
app.use(restify.plugins.acceptParser(app.acceptable));
app.use(restify.plugins.queryParser());
app.use(restify.plugins.bodyParser());


require(path.join(__dirname, 'routes', 'index'))(app);
require(path.join(__dirname, 'routes', 'login'))(app);
require(path.join(__dirname, 'routes', 'upload'))(app);

app.listen(port, function (err) {
    if (err) console.log(err);
    console.log('=================================================================');
    console.log('%s is listening on %s', app.name, port);
});
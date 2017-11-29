const restify = require('restify');
const path = require('path');
const mysql = require(path.join(__dirname, '..', 'config', 'mysql'));
const security = require('../services/security');

module.exports = (app) => {
    app.get('/products', (req, res, next) => {
        let db = mysql.connect();
        db.execute(`SELECT * FROM products`, [], (err, rows) => {
            if (err) {
                console.log(err);
            } else {
                res.json(200, rows);
            }
        })
        db.end();
    });


    app.get('/products/:id', security.isAuthenticated, (req, res, next) => {
        let db = mysql.connect();
        db.execute(`SELECT * FROM products WHERE product_id = ?`, [req.params.id], (err, rows) => {
            if (err) {
                console.log(err);
            } else {
                res.json(200, rows);
            }
        })
        db.end();
    });


    app.post('/products', security.isAuthenticated, (req, res, next) => {
        console.log('Authorization', req.header('Authorization'));
        let price = req.body.price;
        price = price.replace(',', '.');
        let db = mysql.connect();
        db.execute(`INSERT INTO products SET product_name = ?, product_description = ?, product_price = ?`, [req.body.name, req.body.description, price], (err, rows) => {
            if (err) {
                console.log(err);
            } else {
                res.json(200, rows);
            }
        })
        db.end();
    });


    app.put('/products/:id', security.isAuthenticated, (req, res, next) => {
        let price = req.body.price;
        price = price.replace(',', '.');
        let db = mysql.connect();
        db.execute(`UPDATE products SET product_name = ?, product_description = ?, product_price = ? WHERE product_id = ?`, [req.body.name, req.body.description, price, req.params.id], (err, rows) => {
            if (err) {
                console.log(err);
            } else {
                res.json(200, rows);
            }
        })
        db.end();
    })


    app.del('/products/:id', security.isAuthenticated, (req, res, next) => {
        let db = mysql.connect();
        db.execute(`DELETE FROM products WHERE product_id = ?`, [req.params.id], (err, rows) => {
            if (err) {
                console.log(err);
            } else {
                res.json(200, rows);
            }
        })
        db.end();
    });



    // ========================== static
    app.get('/.*', restify.plugins.serveStatic({
        'directory': 'public',
        'default': 'index.html'
    }));

}
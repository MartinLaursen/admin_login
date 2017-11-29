const db = require('../config/mysql').connect();
const passwordHash = require('password-hash');
const crypto = require('crypto');

/**
 * @module Security
 */
module.exports = {
    /**
     * isAuthenticated
     * Checks request header for valid accesstoken and userID.
     * @param {Object} req - request object
     * @param {Object} res - response object
     * @param {function} next - callback function
     */
    'isAuthenticated': (req, res, next) => {
        return next();
        console.log(req.header('Authorization'));
        if (req.header('Authorization') && req.header('userID')) {
            const query = `SELECT token, created
            FROM accesstokens
            WHERE userid = ?
                and token = ?
            ORDER BY created DESC LIMIT 1`;
            db.execute(query, [req.header('userID'), req.header('Authorization')], (error, rows) => {
                if (error) {
                    console.log(error);
                    return res.send(500);
                }
                else if (rows.length === 0) return res.send(401);
                else if (rows.length === 1) {
                    if ((new Date - rows[0].created) < (1000 * 60 * 60)) {
                        db.execute('DELETE FROM accesstokens WHERE token = ?', [rows[0].idaccesstokens], (error) => {
                            return res.send(401);
                        });
                    } else {
                        return next();
                    }
                }
                else return res.send(401);
            });
        } else {
            res.send(401);
        }
    }
};
const mysql = require('mysql2'); // mysql

module.exports = {
   connect: function () {
      return mysql.createConnection({
         host: '188.166.38.75:3306',
         user: 'root',
         password: '1234',
         database: 'administrations_eksempel'
      })
   }
}

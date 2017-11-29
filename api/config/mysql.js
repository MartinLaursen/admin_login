const mysql = require('mysql2'); // mysql

module.exports = {
   connect: function () {
      return mysql.createConnection({
         host: '188.166.38.75',
         user: 'rootroot@188.166.38.75',
         password: '1234',
         database: 'administrations_eksempel'
      })
   }
}

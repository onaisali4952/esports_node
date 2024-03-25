const util = require('util')
const dotenv = require('dotenv');
dotenv.config({ path: "../config.env" });


const pg = require('pg')

const pool = new pg.Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,    
  password: 'V6A5LovollAhrEKJ',
  port: process.env.DATABASEPORT,
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000     
})

// Ping database to check for common exception errors.
pool.query('SELECT NOW()', (err, res) => {
 // console.log(err, res) 
  if (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.')
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has too many connections.')
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('Database connection was refused.')
    }
  }
  //pool.end() 
  return
})

// Promisify for Node.js async/await.
pool.query = util.promisify(pool.query)

module.exports = pool
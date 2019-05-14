const faker = require('faker');

const { Pool, Client }    = require('pg');

const dbconfig = require('./dbconfig');

const pool = new Pool({
  user: dbconfig.user,
  host: dbconfig.host,
  database: dbconfig.dbname,
  password: dbconfig.password,
  port: dbconfig.port,
});

faker.seed(1000);

let people = [];

for(let i = 0; i < 40; i++) {
  let fname = faker.name.firstName();
  let lname = faker.name.lastName();  
  let ob = {
    //  user_id:      i,
      first_name:   fname,
      last_name:    lname,
      email:        faker.internet.email(fname, lname),
      phone_number: faker.phone.phoneNumber(),
      job_title:    faker.name.jobTitle() 
  }  

  people.push(ob);
}

// console.log(people);
let preparedStatememnt = (data) => {
    let statement = `INSERT INTO users(first_name, last_name, email, phone_number, job_title) 
    VALUES `;
    let values = '';

    let row = {};

    for (let i = 0; i < data.length - 1; i++) {
        row = data[i];
        let value = `(\'${row.first_name}\', \'${row.last_name}\', \'${row.email}\', \'${row.phone_number}\', \'${row.job_title}\')`;        
        value += ', ';
        values += value;
    }
    // adding the last row now: 
    row = data[data.length - 1];

    values += `(\'${row.first_name}\', \'${row.last_name}\', \'${row.email}\', \'${row.phone_number}\', \'${row.job_title}\')`;
    values += ';';

    return { statement, values };
}

let ob = preparedStatememnt(people);

console.log("Query statement is constructed...");

pool.connect()
    .then(client => {
        return client.query(ob.statement + ob.values)
            .then(res => {
                client.release();
                console.log(res.rows);
            })
            .catch(e => {
                client.release()
                console.log(e.stack)
              });
    });


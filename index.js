const express = require('express');
const { userInfo } = require('os');

let app = express();

let path = require('path');

let port = process.env.PORT || 3001;

let rds_port = process.env.RDS_PORT || 5432;
let host = process.env.RDS_HOSTNAME || 'localhost';
let user = process.env.RDS_USERNAME || 'postgres';
let password = process.env.RDS_PASSWORD || 'Gabriel20!';
let database = process.env.RDS_DB_NAME || 'project3';
let ssl = process.env.DB_SSL ? { rejectUnauthorized: false } : false;

app.use(express.static(path.join(__dirname + '/css/styles.css')));

app.set('views', path.join(__dirname, '/views'));

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

let knex = require('knex')({
    client: 'pg',
    connection: {
        host: host,
        user: user,
        password: password,
        database: database,
        port: rds_port,
        ssl: ssl,
    },
});

//send message to user that displays the text in the send method
app.get('/', (req, res) => {
    res.render(path.join(__dirname + '/views/index'));
});

app.get('/about', (req, res) => {
    res.render(path.join(__dirname + '/views/about'));
});

//send message to user that displays the text in the send method
app.get('/login', (req, res) => {
    res.render(path.join(__dirname + '/views/login'));
});

app.listen(port, () => console.log('I am listening'));
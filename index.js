const express = require('express');
const ejs = require('ejs');

let app = express();

let path = require('path');

let port = process.env.PORT || 3001;

let rds_port = process.env.RDS_PORT || 5432;
let host = process.env.RDS_HOSTNAME || 'localhost';
let user = process.env.RDS_USERNAME || 'ebroot';
let password = process.env.RDS_PASSWORD || 'wannaspritecranberry';
let database = process.env.RDS_DB_NAME || 'project3';
let ssl = process.env.DB_SSL ? { rejectUnauthorized: false } : false;

app.use(express.static(path.join(__dirname + '/public')));

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
    knex.select()
        .from('review')
        .then((data) =>
            res.render(path.join(__dirname + '/views/index'), {
                reviewData: data,
            })
        );
});

app.get('/inheritance_test', (req, res) => {
    res.render(path.join(__dirname + '/views/inheritance_test'));
});

app.get('/about', (req, res) => {
    res.render(path.join(__dirname + '/views/about'));
});

//send message to user that displays the text in the send method
app.get('/adminlogin', (req, res) => {
    res.render(path.join(__dirname + '/views/login'));
});

app.listen(port, () => console.log('I am listening'));

const express = require('express');
const ejs = require('ejs');

let app = express();

let path = require('path');

let port = process.env.PORT || 3001;

let rds_port = process.env.RDS_PORT || 5432;
let host = process.env.RDS_HOSTNAME || 'localhost';
let user = process.env.RDS_USERNAME || 'postgres';
let password = process.env.RDS_PASSWORD || 'Gabriel20!';
let database = process.env.RDS_DB_NAME || 'intex';
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
        .from('product')
        .then((data) => {
            res.render(path.join(__dirname + '/views/index'), {
                reviewData: data,
            });
        });
});

app.get('/indexInherited', (req, res) => {
    res.render(path.join(__dirname + '/views/indexInherited'));
});

app.get('/about', (req, res) => {
    res.render(path.join(__dirname + '/views/about'));
});

app.get('/product/:id', (req, res) => {
    let pID = req.params.id;
    if (pID) {
        knex.select()
            .from('product')
            .where('product_id', '=', pID)
            .then((data) =>
                res.render(path.join(__dirname + '/views/product'), {
                    productData: data,
                })
            );
    }
});

//send message to user that displays the text in the send method
app.get('/adminlogin', (req, res) => {
    res.render(path.join(__dirname + '/views/login'));
});

app.get('/product/leaveReview/:id', (req, res) => {
    let pID = req.params.id;
    res.render(path.join(__dirname + '/views/leaveReview'), { prod_id: pID });
});

app.post('/addReview', (req, res) => {
    let dbName = req.body.sName;
    let dbProductName = req.body.p_id;
    let dbRating;
    let dbReview = req.body.sReview;

    //Rating processing - depends on what we do for the stars
    if (req.body.rate == 0) {
        dbRating = 0;
    } else if (req.body.rate == 1) {
        dbRating = 1;
    } else if (req.body.rate == 2) {
        dbRating = 2;
    } else if (req.body.rate == 3) {
        dbRating = 3;
    } else if (req.body.rate == 4) {
        dbRating = 4;
    } else if (req.body.rate == 5) {
        dbRating = 5;
    }

    knex('response')
        .insert({
            reviewer_name: dbName,
            review_text: dbReview,
            rating: dbRating,
            product_id: dbProductName,
        })
        .then(() => {
            res.render(path.join(__dirname + '/views/index.ejs'));
        });
});

//Copied over from INDEX, need to create user table in database to adjust changes
app.post('/userLogin', (req, res) => {
    //query that searches the database for a matching record,
    knex('user')
        .where('password', req.body.pword)
        .andWhere('email', req.body.useremail)
        .select('password', 'email', 'first_name', 'last_name', 'is_admin')
        .then((results) => {
            if (results.length == 0) {
                //user credentials invalid
                res.status(401).json({ message: 'Invalid Credentials' });
            } else {
                let sFirstName = results[0].first_name;
                let sLastName = results[0].last_name;
                let isAdmin = results[0].is_admin;
                //need to change location?
                res.render(path.join(__dirname + '/views/index'), {
                    first_name: sFirstName,
                    last_name: sLastName,
                    is_admin: isAdmin,
                    login: 'true',
                });
            }
        });
});

app.listen(port, () => console.log('I am listening'));

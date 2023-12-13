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


app.get('/', (req, res) => {
    knex.select()
        .from('product')
        .then((data) => {
            res.render(path.join(__dirname + '/views/index'), {
                reviewData: data,
            });
        });
});

app.get('/allReviews', (req, res) => {
    knex.select()
        .from('product')
        .then((data) => {
            res.render(path.join(__dirname + '/views/allReviews'), {
                reviewData: data,
            });
        });
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
    console.log('DBDBDB', dbProductName);
    let dbRating = parseInt(req.body.rate);
    let dbReview = req.body.sReview;

    knex('review')
        .insert({
            reviewer_name: dbName,
            review_text: dbReview,
            rating: dbRating,
            product_id: dbProductName,
        })
        .then(() => {
            knex.select()
                .from('product')
                .then((data) => {
                    res.render(path.join(__dirname + '/views/index'), {
                        reviewData: data,
                    });
                });
        });
});


app.post('/userLogin', (req, res) => {
    //query that searches the database for a matching record,
    knex('user')
        .where('password', req.body.userpassword)
        .andWhere('email', req.body.useremail)
        .select('password', 'email')
        .then((results) => {
            if (results.length == 0) {
                //user credentials invalid
                res.render(path.join(__dirname + '/views/errorPage'));
            } else {
                knex.select()
                .from('product')
                .then((results) => {
                res.render(path.join(__dirname + '/views/index'), {
                    reviewData: results,
                    //login: 'true', Add later?
                });
                });
            }
        });
});

app.listen(port, () => console.log('I am listening'));

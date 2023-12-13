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

app.get('/edit/:id', (req, res) => {
    knex.select('review_id', 'reviewer_name', 'review_text', 'product_id')
        .from('review')
        .where('review_id', req.query.id)
        .then((review) => {
            res.render('edit', { reviewData: review });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ err });
        });
});

app.post('/deleteBand/:id', (req, res) => {
    knex('review')
        .where('review_id', req.params.id)
        .del()
        .then((reviewData) => {
            res.redirect('/');
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ err });
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
                knex
                    .select()
                    .from('review')
                    .where('product_id', '=', pID)
                    .then((reviews) =>
                        res.render(path.join(__dirname + '/views/product'), {
                            productData: data,
                            productReviews: reviews,
                        })
                    )
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

app.post('/addReview/:id', (req, res) => {
    let dbName = req.body.sName;
    let dbProductName = req.params.id;
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
        .then(() => res.render(path.join(__dirname + '/views/redirect')));
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
                        res.render(path.join(__dirname + '/views/redirect'), {
                            reviewData: results,
                        });
                    });
            }
        });
});

app.listen(port, () => console.log('I am listening'));

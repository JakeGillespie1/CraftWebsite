const express = require('express');
const ejs = require('ejs');

let app = express();

let path = require('path');

let port = process.env.PORT || 3001;

// configure db connection
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

//route to home page
app.get('/', (req, res) => {
    knex.select()
        .from('product')
        .then((data) => {
            res.render(path.join(__dirname + '/views/index'), {
                reviewData: data,
            });
        });
});

// route to read all reviews
app.get('/allReviews', (req, res) => {
    knex.select()
        .from('review')
        .then((data) => {
            res.render(path.join(__dirname + '/views/allReviews'), {
                reviewData: data,
            });
        });
});

// route to view review in edit mode
app.get('/edit/:reviewID', (req, res) => {
    knex.select('review_id', 'reviewer_name', 'review_text', 'product_id')
        .from('review')
        .where('review_id', req.params.reviewID)
        .then((data) => {
            res.render(path.join(__dirname + '/views/edit'), {
                reviewData: data,
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ err });
        });
});

// route that updates review in db
app.post('/editReview', (req, res) => {
    knex('review')
        .where('review_id', parseInt(req.body.reviewID))
        .update({
            reviewer_name: req.body.reviewerName,
            review_text: req.body.reviewText,
        })
        .then(() => {
            res.redirect('/allReviews');
        });
});

// route that deletes review from db
app.post('/delete/:reviewID', (req, res) => {
    knex('review')
        .where('review_id', req.params.reviewID)
        .del()
        .then((reviewData) => {
            res.redirect('/allReviews');
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ err });
        });
});

// shows the about page
app.get('/about', (req, res) => {
    res.render(path.join(__dirname + '/views/about'));
});

// dynamically displays product info from db and relevant reviews
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
                        knex
                            .from('review')
                            .where('product_id', '=', pID)
                            .select(
                                knex.raw('ROUND(AVG(rating), 1) as avg_rating')
                            )
                            .then((reviewsAvg) =>
                                res.render(
                                    path.join(__dirname + '/views/product'),
                                    {
                                        productData: data,
                                        productReviews: reviews,
                                        prodReviewsAvg:
                                            reviewsAvg[0].avg_rating,
                                    }
                                )
                            )
                    )
            );
    }
});

// route that allows admin to login
app.get('/adminlogin', (req, res) => {
    res.render(path.join(__dirname + '/views/login'));
});

// route that takes the user to a review entry page
app.get('/product/leaveReview/:id', (req, res) => {
    let pID = req.params.id;
    res.render(path.join(__dirname + '/views/leaveReview'), { prod_id: pID });
});

// route that adds a review to the db
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
        .then(() => res.redirect('/'));
});

// route that verifies if login credentials are correct
app.post('/userLogin', (req, res) => {
    //query that searches the database for a matching record,
    knex('user')
        .where('password', req.body.userpassword)
        .andWhere('email', req.body.useremail)
        .select()
        .then((results) => {
            if (results.length == 0) {
                //user credentials invalid
                res.render(path.join(__dirname + '/views/errorPage'));
            } else {
                res.render(path.join(__dirname + '/views/redirect'), {
                    reviewData: results,
                });
            }
        });
});

app.listen(port, () => console.log('I am listening'));

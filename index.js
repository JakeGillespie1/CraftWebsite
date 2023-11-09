//import express
const EXPRESS = require("express");

//call the express constructor to access Express' attributes and methods
let app = EXPRESS();

//send message to user that displays the text in the send method
app.get("/", (req, res) => {
    res.send("Welcome to Index Page");
});

//send message to user that displays the text in the send method
app.get("/login", (req, res) => {
    res.send();
});

//establish a port that the localhost can listen on and send a message to indicate that the server is listening
const PORT = 3000;

app.listen(3000, () => {
    console.log("Server is running");
});
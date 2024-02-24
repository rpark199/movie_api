const express = require('express');
    bodyParser = require("body-parser"),
    morgan = require('morgan');
const app = express();

//Logging middleware
app.use(morgan('common'));
app.use(bodyParser.json());

app.use((err, req, res, next) => {
    //logic
});

//GET method route
app.get('/', (req,res) => {
    res.send('Welcome to my app!');
});

app.get('/movies', (req, res) => {
    res.json(movie);
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080');
})

//Static file
app.use(
    "/documentation",
    express.static("public", {index: "documentation.html"})
);

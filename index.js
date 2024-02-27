const {users, movies} = require("./data");
const express = require('express');
    morgan = require('morgan');
const app = express();

//Logging middleware
app.use(morgan('common'));
app.use(express.json());

app.get('/movies', (req, res) => {
    res.json(movies);
});
app.get('/', (req,res) => {
    res.send('Welcome to the Top 10 Movies List!');
});

//Static file
app.use(
    express.static('public'));

//Error-handling middleware function
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Oops! Something Went Wrong!');
})

app.listen(8080, () => {
    console.log('Your app is listening on port 8080');
})

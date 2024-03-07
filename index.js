const {users, movies} = require("./data");
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const app = express();
const bodyParser = require('body-parser');
const uuid = require('uuid');
const PORT = 3030;

//Logging middleware
app.use(morgan('common'));
app.use(express.json());

//Get request for returning JSON movie data
app.get('/movies', (req, res) => {
    res.json(movies);
});

//Get request for returning personal message
app.get('/', (req,res) => {
    res.send('Welcome to the Top 10 Movies List!');
});

//Using express to get documentation.html
app.use(express.static('public'));

//Error-handling middleware function
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Oops! Something Went Wrong!');
})

//Returning data a single movie
app.get('/movies/title/:title', (req,res) => {
    const movie = movies.find((m)=> m.title == req.params.title);
    res.send(movie);
});

//Returning data a single genre
app.get('/movies/genre/:genre', (req,res) => {
    res.send(movies_);
});

//Returning data of a director by name
app.get('/movies/director/:director', (req,res) => {
    const director = movies.filter((m)=> m.director == req.params.director);
    res.send(director);
});

//Allow new users to register
app.post('/users/register', (req,res) => {
    users.push(req.body);
    res.send('Registeration Successful');
});
app.get('/users', (req,res) => {
    res.send(users);
});

//Allow Update user by username
app.put('/users/update/:id', (req,res) => {
    let userId = users.findIndex((u)=>u.id==req.params.id);
    res.send(users.slice(userId,1, {...req.body}));
});
 
//Allow users to add a movie to their favorite movie list
app.post('/favorite/add/:id', (req,res) => {
    const user = users.find((u) => u.id ==req.params.id);
    user.favMovies.push(req.body);
    res.send(user);
});

//Allow users to remove movie from their favorite list
app.delete('/favorite/delete/:id/:title', (req,res) => {
    const user = users.find((u) => u.id ==req.params.id);
    const favs = user.favMovies.filter((m)=>m.title !=req,params.title)
    user.favMovies = [...favs];
    res.send(user);
});

//Allow existing users to deregister
app.delete('/users/deregister/:id', (req,res) => {
    res.send(users.filter((m) => m.id !=req.params.id))
});

//Listening code
app.listen(PORT, () => {
    console.log('Your SERVER is listening on port ${PORT}.');
});

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/cfDB', { useNewUrlParser: true, useUnifiedTopology: true});

const express = require('express');
const morgan = require('morgan');
const app = express();
const bodyParser = require('body-parser');
const uuid = require('uuid');

app.use(express.static('public'));
app.use(morgan('common'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true}));
let auth =require('./auth')(app);
const passport = require('passport');
require('./passport');

//Get request for returning personal message
app.get('/', (req,res) => {
  res.send('Welcome to the Top 10 Movies List!');
});

//GET users list

app.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//CREATE user
app.post('/users', async (req, res) => {
  await Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exist');
      } else {
        Users.create({
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
          FavoriteMovies: req.body.FavoriteMovies
        })
          .then((user) =>{
            res.status(201).json(user); 
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

//UPDATE user info
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), async (req,res) => {
  if(req.user.Username !== req.params.Username){
    return res.status(400).send('Permission denied');
  }
  await Users.findOneAndUpdate({Username: req.params.Username }, 
  { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday,
      FavoriteMovies: req.body.FavoriteMovies
    },
  },
  { new: true })
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//UPDATE movie to user's list of favorites
app.post('/users/:Username/movies/:movieName', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.findOneAndUpdate(
    { Username: req.params.Username }, 
    { $push: { FavoriteMovies: req.params.movieName } },
    { new: true })
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//DELETE user by username
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + 'was not found');
      } else {
        res.status(200).send(req.params.Username + 'was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//DELETE favorite movie by movieName
app. delete('/users/:username/movies/:name', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.username},{ $pull: {FavoriteMovies: req.params.name} }, { new: true })
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: '+ err);
  });
});

//GET all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.find()
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//GET movies by title
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), async (req,res) => {
    await Movies.findOne({ Title: req.params.Title })
      .then((movies) => {
        res.status(200).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
});

//GET a single genre
app.get('/movies/genre/:genreName', passport.authenticate('jwt', { session: false }), async (req,res) => {
  await Movies.find({ "Genre.Name": req.params.genreName })
    .then((movies) => {
      res.status(200).json(movies.Genre);
    })
    .catch((err) => {
      console.log(err);
      res.send(500).send('Error: ' + err);
    });
});

//GET movie by director name
app.get('/movies/director/:directorName', passport.authenticate('jwt', { session: false }), async (req,res) => {
  await Movies.find({ "Director.Name": req.params.directorName })
    .then((movies) => {
      res.status(200).json(movies.Director);
    })
    .catch((err) => {
      console.log(err);
      res.send(500).send('Error: ' + err);
    });
});

//Error-handling middleware function
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Oops! Something Went Wrong!');
});

//Listening code
app.listen(8080, () => console.log('Your app is listening on port 8080'));

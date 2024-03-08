//const {users, movies} = require("./data");
const express = require('express');
const morgan = require('morgan');
const app = express();
const bodyParser = require('body-parser');
const uuid = require('uuid');

let users = [
    {
      id:1,
      fullname: 'John Doe',
      email: 'johndoe@mail.com',
      favMovies: [{
        Title: 'Inception',
        Director: 'Christopher Nolan',
        Genre: 'Sci-Fi'
      }]
    },
    {
      id:2,
      fullname: 'Jane Doe',
      email: 'janedoe@mail.com',
      favMovies: [{
        Title: 'Inception',
        Director: 'Christopher Nolan',
        Genre: 'Sci-Fi'
      }]
    }
  
  ];
  let movies = [
      {
        Title: 'Inception',
        Director: 'Christopher Nolan',
        Genre: 'Sci-Fi'
      },
      {
        Title: 'Lord of the Rings',
        Director: 'Peter Jackson',
        Genre: 'Super-Heroes'
      },
      {
        Title: 'The Matrix',
        Director: 'Lana Wachowski',
        Genre: 'Sci-fi'
      },
      {
        Title: 'The Avengers',
        Director: 'Anthony Russo',
        Genre: 'Super-Heroes'
      },
      {
        Title: 'The Silence Of The Lambs',
        Director: 'Jonathan Demme',
        Genre: 'Suspense-Thriller'
      },
      {
        Title: 'Terminator',
        Director: 'James Cameron',
        Genre: 'Action'
      },
      {
        Title: 'The Prestige',
        Director: 'Christopher Nolan',
        Genre: 'Suspense-Thriller'
      },
      {
        Title: 'Shutter Island',
        Director: 'Martin Scorsese',
        Genre:'Suspense-Thriller'
      },
      {
        Title: 'The Fugitive',
        Director: 'Andrew Davis',
        Genre: 'Suspense-Thriller'
      },
      {
        Title: 'The Shawshank Redemption',
        Director: 'Frank Darabont',
        Genre: 'Action-thriller'
      }
    ];

//Logging middleware
app.use(morgan('common'));
app.use(express.json());

//Get request for returning JSON movie data
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
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
app.get('/movies/:title', (req,res) => {
    const {title} = req.params;
    const movie= movies.find( movie => movie.Title ===title);
    
    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send("no such movie")
    }
});

//Returning data a single genre
app.get('/movies/genre/:genreName', (req,res) => {
    const {genreName} = req.params;
    const genre= movies.find( movie => movie.Genre === genreName);
    
    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send("no such genre")
    }
});

//Returning data of a director by name
app.get('/movies/director/:directorName', (req,res) => {
    const {directorName} = req.params;
    const director= movies.find( movie => movie.Director === directorName);
    
    if (director) {
        res.status(200).json(director);
    } else {
        res.status(400).send("no such director")
    }
});

//Allow new users to register
app.post('/users', (req,res) => {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser)
    } else {
        res.status(400).send('user needs name')
    }
});

//Allow Update user by username
app.put('/users/:id', (req,res) => {
    const {id} = req.params;
    const updatedUser = req.body;

    let user = users.find(user => user.id == id);

    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).send ('no such user')
    }
});
 
//Allow users to add a movie to their favorite movie list
app.post('/users/:id/movies/:movieTitle', (req,res) => {
    const {id, movieTitle}= req.params;

    let user = user.find( user => user.id == id);

    if (user) {
        user.favoriteMovies.push(movieTitle);
        res.status(200).json(user);
    } else {
        res.status(400).send('no such user')
    }
});

//Allow users to remove movie from their favorite list
app.delete('/users/:id/:movieTitle', (req,res) => {
    const {id, movieTitle}= req.params;

    let user = user.find( user => user.id == id);

    if (user) {
        user.favoriteMovies= user.favoriteMovie.filter( title => title !== movieTitle);
        res.status(200).send('${movietitle} has been removed from user ${id} array');
    } else {
        res.status(400).send('no such user')
    }
});

//Allow existing users to deregister
app.delete('/users/:id', (req,res) => {
    const {id}= req.params;

    let user = user.find( user => user.id == id);

    if (user) {
        users = users.filter( user => user.id != id);
        res.json(users);
        res.status(200).send('user ${id} has been deleted');
    } else {
        res.status(400).send('no such user')
    }
});
//Listening code
app.listen(8080, () => console.log('Your app is listening on port 8080'));

const {users, movies} = require("./data");
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const app = express();
const bodyParser = require('bodt-parser');
const uuid = require('uuid');
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

const Movies = models.movie;
const Users = models.user;
const Directors = models.director;
const Genres = models.genre;
app.use(cors({
    orgin: (orgin, callback) => {
        if (!orgin) return callback(null,true);

        const allowedOrigins= [
            'http://localhost:8080',
            'http://localhost:1234',
            'http://localhost:4200',
            'https://Movieflix.netlify.app',
            'https://rpark199.github.io',
            'https://rpark199.github.io/Movieflix-Angular-App',
            'https://GitHub.com',
        ]
        if (allowedOrigins.index(origin) === -1) {
            let message= 'The CORS policy for this application doesn’t allow access from origin ' + origin;
            return callback(new Error(message), false);
        }
        return callback(null, true);
    }
}));

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

//sets the port
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port' + port);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true }));

//Get documentation html page
app.get('/docmentation', (req,res) => {
    res.sendFile('public/documentation.html', {root:__dirname});
});

app.get('/', (req, res) => {
    res.send('Welcome to movieflix!');
});

//Get all movies
app.get('/movies',passport.authenticate('jwt', {session: false}),
    async (req,res) => {
        try {
            const movies = await movies.find()
                .populate('Genre')
                .populate('Director')
                .exec();
            res.status(200).json(movies);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        }
    }
);

//Get all genres
app.get('/genres', passport.authenticate('jwt', {session: false}),
    async (req,res) => {
        try {
            const genres = await genres.find()
            res.status(200).json(genres);
        } catch (err) {
            console.error('Error fetching genres:', err);
            res.status(500).send('Internal Server Error');
        }
    }
);

//Get all directors
app.get('/directors', passport.authenticate('jwt', {session: false}),
    async (req,res) => {
        try {
            const directors = await directors.find()
            res.status(200).json(directors);
        } catch (err) {
            console.error('Error fetching directors:', err);
            res.status(500).send('Internal Server Error');
        }
    }
);

//Get movie by title
app.get('/movies/:Title', passport.authenticate('jwt', {session: false}),
    async (req,res) => {
        await movies.findOne({Title: req.params.Title })
            .then((movie) => {
                res.json(movie);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error: '+ err);
            });
    }
);

//Get movie by genre
app.get('/movies/genres/:genreName', passport.authenticate('jwt', {session: false}),
    async (req,res) => {
        movies.find({Genre: req.params.genreName })
            .then((movies) => {
                res.status(200).json(movies);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error: '+ err);
            });
    }
);

//Get movie by director
app.get('/movies/directors/:director', passport.authenticate('jwt', {session: false}),
    async (req,res) => {
        movies.find({Director: req.params.director })
            .then((movies) => {
                res.status(200).json(movies);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error: '+ err);
            });
    }
);

//Get all users
app.get('/users', passport.autenticate('jwt', {session:false}),
    async (req, res) => {
        await Users.find()
            .then((users) => {
                res.status(201).json(users);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error: '+ err);
            });
    }
);

//Add a user
app.post(
    '/users',
    [
        check('Username', 'Username is required').isLength({ min: 1 }),
        check(
            'Username',
            'Username contains non alphanumeric characters - not allowed.'
        ).isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does not appear to be valid').isEmail(),
    ],
    async (req, res) => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        let hashedPassword = Users.hashPassword(req.body.Password);
        await Users.findOne({ Username: req.body.Username })
            .then((user) => {
                if (user) {
                  return res.status(400).send(req.body.Username + ' already exists');
                } else {
                  Users.create({
                    Username: req.body.Username,
                    Password: hashedPassword,
                    Email: req.body.Email,
                    BirthDate: req.body.BirthDate,
                  })
                    .then((user) => {
                      res.status(201).json(user);
                    })
                    .catch((error) => {
                      console.error(error);
                      res.status(500).send('Error: ' + error);
                    });
                }
              })
              .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
              });
        }
);

//Update user by username
app.put(
    '/users/:Username',
    passport.authenticate('jwt', { session: false }),
    async(req, res) => {
        if (req.user.Username !== req.params.Username) {
            return res.status(400).send('Permission denied');
        }
        await Users.findOneAndUpdate(
            {Username: req.params.Username },
            {
                $set: {
                    Username: req.body.Username,
                    Password: req.body.Password,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday,
                },
            },
            {new: true}
        )
            .then((updateUsers) => {
                res.json(updateUser);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send('Error: '+ err);
            });
    }
); 

//Delete user by username
app.delete(
    '/users/:Username',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
      if (req.user.Username !== req.params.Username) {
        return res.status(400).send('Unable to delete user');
      }
      await Users.findOneAndDelete({ Username: req.params.Username })
        .then((user) => {
          if (!user) {
            res
              .status(400)
              .send('User ' + req.params.Username + ' was not found.');
          } else {
            res
              .status(200)
              .send('User ' + req.params.Username + ' was successfully deleted.');
          }
        })
        .catch((err) => {
          console.error(err);
          res.status.apply(500).send('Error: ' + err);
        });
    }
  );

//Remove movie from user's favorites
app.delete(
    '/users/:Username/movies/:MovieID',
    passport.authenticate('jet', {session: false }),
    async (req,res) => {
        await Users.findOneAndUpdate(
            { Username: req.params.Username },
            {
                $pull: {FavoriteMovies: req.params.MovieID },
            },
            {new: true}
        )
            .then((updatedUser) => {
                res.json(updatedUser);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error: '+ err);
            });
    }
);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Server Error');
});

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const mysql = require('mysql');
const path = require('path');
require('dotenv').config();

const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbSecret = process.env.SECRET_KEY;

const connection = mysql.createConnection({
	host     : dbHost,
	user     : dbUser,
	password : dbPassword,
	database : dbUser,
});

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());
app.use(session({
  secret: dbSecret,
  resave: false,
  saveUninitialized: false
}));
app.use(flash());
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
  });

  const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/', (req, res) => {
  res.render('index');
});

app.post(
    '/register',
    [
      check('username').notEmpty().withMessage('Username is required'),
      check('email').isEmail().withMessage('Invalid email address'),
      check('password').notEmpty().withMessage('Password is required')
    ],
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render('register', { errors: errors.array() });
      }
  
      const { username, email, password } = req.body;
  
      // Hash the password using bcrypt
      const hashedPassword = bcrypt.hashSync(password, 10);
  
      // Create a new user object to be saved in the database
      const newUser = {
        username,
        email,
        password: hashedPassword
      };
  
      // Perform the database query to insert the new user
      const query = 'INSERT INTO credentials (username, email, password) VALUES (?, ?, ?)';
      const values = [newUser.username, newUser.email, newUser.password];
  
      connection.query(query, values, (err) => {
        if (err) {
          // Handle database query error
          console.error('Error executing SQL query:', err);
          return res.status(500).send('Internal Server Error');
        }
  
        // Registration successful, redirect to login page
        req.flash('success_msg', 'You are now registered. Please log in.');
        res.redirect('/');
      });
    }
  );


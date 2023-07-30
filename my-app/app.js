const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const mysql = require('mysql');
const path = require('path');
const MySQLStore = require('express-mysql-session')(session);
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

const sessionStore = new MySQLStore({
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    database: dbUser,
    // Other session store options
  });

const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    // User is authenticated, proceed to the next middleware or route handler
    return next();
  }
  // User is not authenticated, redirect to the login page
  res.redirect('/');
};

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());
app.use(session({
  secret: dbSecret,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
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

  const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
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

app.post(
  '/login',
  [
    check('email').isEmail().withMessage('Invalid email address'),
    check('password').notEmpty().withMessage('Password is required')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If validation fails, store the error messages in flash and redirect back to the login page
      req.flash('error', errors.array().map(err => err.msg));
      return res.redirect('/');
    }

    const { email, password } = req.body;

    // Fetch user data from the database based on the provided email
    const query = 'SELECT * FROM credentials WHERE email = ?';
    connection.query(query, [email], (err, results) => {
      if (err) {
        console.error('Error querying the database:', err);
        req.flash('error', 'An error occurred while logging in. Please try again.');
        return res.redirect('/');
      }

      // Check if the user with the provided email exists in the database
      if (results.length === 0) {
        req.flash('error', 'User not found. Please check your email or register.');
        return res.redirect('/');
      }

      // User found, compare the provided password with the hashed password from the database
      const user = results[0];
      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if (!isPasswordValid) {
        req.flash('error', 'Invalid password. Please try again.');
        return res.redirect('/');
      }

      // Successful login, redirect to dashboard or other authenticated page
      req.session.userId = user.id; // Assuming you have a user object with an 'id' property
     
      res.redirect('/dashboard');
      
    });
  }
);


app.get('/dashboard', isAuthenticated, (req, res) => {
  // Retrieve user ID from the session
  const userId = req.session.userId;

  // Fetch user data from the database based on the user ID
  // You'll need to implement this database query based on your SQL database structure
  // For example: SELECT * FROM users WHERE id = ?
  connection.query('SELECT * FROM credentials WHERE id = ?', [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user data:', err);
      // Handle the error, maybe redirect to an error page
      return res.status(500).send('Internal Server Error');
    }

    // Assuming 'results' contains the user data
    const user = results[0];

    // Render the 'dashboard' view with user data
    res.render('dashboard', { user: user });
  });
});

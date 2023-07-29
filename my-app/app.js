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

const connection = mysql.createConnection({
	host     : dbHost,
	user     : dbUser,
	password : dbPassword,
	database : dbUser,
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
  });



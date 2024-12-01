const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./mysql/db');
const sessionMiddleware = require('./mysql/session'); 

const productRoutes = require('./routes/productRoutes');
const signupRoutes = require('./routes/signupRoutes');
const loginRoutes = require('./routes/loginRoutes');

const app = express();
const port = 3000;

app.locals.db = db;
console.log(db);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

app.get('/product', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'product.html'));
  });

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.use('/product', productRoutes);
app.use('/signup', signupRoutes);
app.use('/login', loginRoutes);


app.listen(port, () => {
    console.log(`서버가 실행됩니다. http://localhost:${port}`);
  });


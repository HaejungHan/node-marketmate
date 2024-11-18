const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql2');

const productRoutes = require('./routes/productRoutes');

const app = express();
const port = 3000;

// const multer = require('multer');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '!veritatis7',
    database: 'marketmate'
});

db.connect((err) => {
    if(err) {
        console.error('mysql 연결 실패: ',err);
        return;
    }
    console.log('mysql db 연결 성공');
})

app.locals.db = db;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

app.get('/product', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'product.html'));
  });

app.use('/', productRoutes);


app.listen(port, () => {
    console.log(`서버가 실행됩니다. http://localhost:${port}`);
  });


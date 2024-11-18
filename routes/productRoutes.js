const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // uploads 폴더 없으면 자동 생성
        const uploadDir = 'uploads/';
        if(!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.post('/product/create', upload.array('images', 5), (req, res) => {
    console.log('Form data:', req.body); 
    console.log('Files:', req.files);  
    
    const { title, price, description } = req.body;
    const imagePathes = req.files ? req.files.map(file => file.path) : [];

    const db = req.app.locals.db;

    const sql = 'INSERT INTO products (title, price, description, image_paths) VALUES (?, ?, ?, ?)';
    const values = [title, price, description, JSON.stringify(imagePathes)];

    db.query(sql, values, (err, result) =>  {
        if (err) {
            console.error('상품 등록 실패', err);
            return res.status(500).json({ success: false, message: '상품 등록에 실패하였습니다.' });
        }
        console.log('상품 등록 성공');
        res.status(200).json({ success: true, message: '상품이 성공적으로 등록되었습니다.' });
    });
});

module.exports = router;
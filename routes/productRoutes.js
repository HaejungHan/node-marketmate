const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.post('/create', upload.single('image'), (req, res) => {
    console.log('Form data:', req.body);

    const { title, price, description } = req.body;
    const imagePath = req.file ? req.file.path : null;
    const sessionId = req.sessionID;  // 현재 세션 ID

    const db = req.app.locals.db;

    // 세션 테이블에서 세션 데이터 가져오기
    const sql = 'SELECT data FROM sessions WHERE session_id = ?';
    db.query(sql, [sessionId], (err, results) => {
        if (err) {
            console.error('세션 조회 실패', err);
            return res.status(500).json({ success: false, message: '세션 조회에 실패하였습니다.' });
        }

        if (results.length === 0) {
            return res.status(400).json({ success: false, message: '세션이 존재하지 않습니다.' });
        }

        const sessionData = JSON.parse(results[0].data);  // JSON 파싱
        const userName = sessionData.userName;  // 세션에서 사용자 이름 추출

        // 상품 등록 쿼리
        const sqlInsert = 'INSERT INTO products (title, price, description, image_path, seller_name) VALUES (?, ?, ?, ?, ?)';
        const values = [title, price, description, imagePath, userName];  // 판매자 이름을 함께 저장

        db.query(sqlInsert, values, (err, result) => {
            if (err) {
                console.error('상품 등록 실패', err);
                return res.status(500).json({ success: false, message: '상품 등록에 실패하였습니다.' });
            }

            console.log('상품 등록 성공');
            res.status(200).json({ success: true, message: '상품이 성공적으로 등록되었습니다.' });
        });
    });
});

router.get('/recent-products', (req, res) => {
    const db = req.app.locals.db;

    // 최근 등록된 5개의 상품을 판매자 이름과 함께 조회
    const sql = 'SELECT title, price, image_path, description, created_at, seller_name FROM products ORDER BY created_at DESC LIMIT 5';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('상품 목록 조회 실패', err);
            return res.status(500).json({ success: false, message: '상품 목록 조회 실패' });
        }

        results.forEach(product => {
            if (product.image_path) {
                product.image_path = product.image_path.replace(/\\/g, '/');  // Windows 경로 처리
            }
        });

        res.json({
            success: true,
            products: results
        });
    });
});

router.get('/search', (req, res) => {
    const { query } = req.query;

    if (!query || query.trim() === '') {
        return res.status(400).json({ success: false, message: '검색어를 입력해주세요.' });
    }

    const db = req.app.locals.db;

    // 제목에 검색어가 포함된 상품을 판매자 이름과 함께 조회
    const sql = `SELECT title, price, image_path, description, created_at, seller_name FROM products WHERE title LIKE ?`;
    const values = [`%${query}%`];

    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('상품 검색 실패', err);
            return res.status(500).json({ success: false, message: '상품 검색에 실패하였습니다.' });
        }

        res.json({
            success: true,
            products: results
        });
    });
});


module.exports = router;

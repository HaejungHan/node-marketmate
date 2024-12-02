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

router.post('/post/create', upload.single('image'), (req, res) => {
    console.log('Form data:', req.body);

    const { title, price, description } = req.body;
    const imagePath = req.file ? req.file.path : null;
    const userId = req.session.userId;  

    if (!userId) {
        return res.status(400).json({ success: false, message: '로그인 상태가 아닙니다.' });
    }

    const db = req.app.locals.db;

    // 상품 등록 쿼리
    const sqlInsert = 'INSERT INTO products (title, price, description, image_path, user_id) VALUES (?, ?, ?, ?, ?)';
    const values = [title, price, description, imagePath, userId]; 

    db.query(sqlInsert, values, (err, result) => {
        if (err) {
            console.error('상품 등록 실패', err);
            return res.status(500).json({ success: false, message: '상품 등록에 실패하였습니다.' });
        }

        console.log('상품 등록 성공');
        res.status(200).json({ success: true, message: '상품이 성공적으로 등록되었습니다.' });
    });
});

router.get('/recent-products', (req, res) => {
    const db = req.app.locals.db;

    const sql = `
        SELECT p.title, p.price, p.image_path, p.description, p.created_at, u.name AS seller_name 
        FROM products p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
        LIMIT 10
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('상품 목록 조회 실패', err);
            return res.status(500).json({ success: false, message: '상품 목록 조회 실패' });
        }

        results.forEach(product => {
            if (product.image_path) {
                product.image_path = product.image_path.replace(/\\/g, '/'); 
            }
        });

        res.json({
            success: true,
            products: results
        });
    });
});

router.get('/all-products', (req, res) => {
    const db = req.app.locals.db;

    const page = parseInt(req.query.page) || 1;  // 페이지 번호 (기본값 1)
    const limit = parseInt(req.query.limit) || 20;  // 한 페이지에 보여줄 상품 수 (기본값 20)

    const offset = (page - 1) * limit;

    const sql = `
        SELECT p.title, p.price, p.image_path, p.description, p.created_at, u.name AS seller_name
        FROM products p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
    `;

    db.query(sql, [limit, offset], (err, results) => {
        if (err) {
            console.error('전체 상품 목록 조회 실패', err);
            return res.status(500).json({ success: false, message: '전체 상품 목록을 불러오는 데 실패했습니다.' });
        }

        results.forEach(product => {
            if (product.image_path) {
                product.image_path = product.image_path.replace(/\\/g, '/');
            }
        });

        // 전체 상품 개수를 구하여 페이지네이션을 처리할 수 있게 함
        const countSql = 'SELECT COUNT(*) AS total FROM products';
        db.query(countSql, (err, countResult) => {
            if (err) {
                console.error('전체 상품 개수 조회 실패', err);
                return res.status(500).json({ success: false, message: '전체 상품 개수 조회에 실패했습니다.' });
            }

            const totalItems = countResult[0].total;
            const totalPages = Math.ceil(totalItems / limit);

            res.json({
                success: true,
                products: results,
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    totalItems: totalItems,
                    itemsPerPage: limit
                }
            });
        });
    });
});

router.get('/search', (req, res) => {
    const { query } = req.query;

    if (!query || query.trim() === '') {
        return res.status(400).json({ success: false, message: '검색어를 입력해주세요.' });
    }

    const db = req.app.locals.db;

    // 제목에 검색어가 포함된 상품과 판매자 이름을 가져오는 쿼리
    const sql = `
        SELECT p.title, p.price, p.image_path, p.description, p.created_at, u.name AS seller_name
        FROM products p
        JOIN users u ON p.user_id = u.id
        WHERE p.title LIKE ?
    `;
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

const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const router = express.Router();

// 내 상품 목록 조회 (페이지네이션 포함)
router.get('/my-products', (req, res) => {
    const db = req.app.locals.db;
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    const sessionId = req.sessionID;
    const sql = 'SELECT data FROM sessions WHERE session_id = ?';
    
    db.query(sql, [sessionId], (err, results) => {
        if (err) {
            console.error('세션 조회 실패', err);
            return res.status(500).json({ success: false, message: '세션 조회에 실패하였습니다.' });
        }

        if (results.length === 0) {
            return res.status(400).json({ success: false, message: '세션이 존재하지 않습니다.' });
        }

        const sessionData = JSON.parse(results[0].data);

        // sessionData에 userId를 추가했다고 가정 (예: sessionData.userId)
        const userId = sessionData.userId;

        // 사용자 본인이 등록한 상품 목록
        const sqlCount = 'SELECT COUNT(*) AS count FROM products WHERE user_id = ?';
        const sqlProducts = `
            SELECT id, title, price, image_path, description, created_at
            FROM products
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `;

        db.query(sqlCount, [userId], (err, countResult) => {
            if (err) {
                console.error('상품 개수 조회 실패', err);
                return res.status(500).json({ success: false, message: '상품 개수 조회 실패' });
            }

            const totalCount = countResult[0].count;
            const totalPages = Math.ceil(totalCount / limit);

            db.query(sqlProducts, [userId, limit, offset], (err, products) => {
                if (err) {
                    console.error('상품 목록 조회 실패', err);
                    return res.status(500).json({ success: false, message: '상품 목록 조회 실패' });
                }

                // 이미지 경로 처리
                products.forEach(product => {
                    if (product.image_path) {
                        product.image_path = product.image_path.replace(/\\/g, '/');
                    }
                });

                res.json({
                    success: true,
                    products,
                    pagination: {
                        totalCount,
                        totalPages,
                        currentPage: page,
                        limit,
                    }
                });
            });
        });
    });
});

// 상품 수정 API
router.patch('/edit/:id', upload.single('image'), (req, res) => {
    const productId = req.params.id;
    const { title, description, price } = req.body;  // 클라이언트에서 보낸 데이터
    const image = req.file;  // 업로드된 파일 (있는 경우)

    const db = req.app.locals.db;

    // 세션 정보 가져오기 (사용자 ID 확인)
    const sessionId = req.sessionID;
    const sqlSession = 'SELECT data FROM sessions WHERE session_id = ?';

    db.query(sqlSession, [sessionId], (err, results) => {
        if (err) {
            console.error('세션 조회 실패', err);
            return res.status(500).json({ success: false, message: '세션 조회에 실패하였습니다.' });
        }

        if (results.length === 0) {
            return res.status(400).json({ success: false, message: '세션이 존재하지 않습니다.' });
        }

        const sessionData = JSON.parse(results[0].data);
        const userId = sessionData.userId;

        // 수정하려는 상품이 현재 사용자의 상품인지 확인
        const sqlCheckOwner = 'SELECT user_id FROM products WHERE id = ?';
        db.query(sqlCheckOwner, [productId], (err, product) => {
            if (err || product.length === 0) {
                return res.status(500).json({ success: false, message: '상품 조회 실패' });
            }

            if (product[0].user_id !== userId) {
                return res.status(403).json({ success: false, message: '본인의 상품만 수정할 수 있습니다.' });
            }

            // 수정할 항목만 업데이트
            const fieldsToUpdate = [];
            const values = [];

            if (title) {
                fieldsToUpdate.push('title = ?');
                values.push(title);
            }
            if (description) {
                fieldsToUpdate.push('description = ?');
                values.push(description);
            }
            if (price) {
                fieldsToUpdate.push('price = ?');
                values.push(price);
            }

            if (image) {
                fieldsToUpdate.push('image_path = ?');
                values.push(image.path);  // 이미지 파일 경로를 저장
            }

            // SQL 쿼리 작성
            const sqlUpdate = `UPDATE products SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
            values.push(productId);  // 마지막에 상품 ID 추가

            db.query(sqlUpdate, values, (err, result) => {
                if (err) {
                    console.error('상품 수정 실패', err);
                    return res.status(500).json({ success: false, message: '상품 수정에 실패하였습니다.' });
                }

                res.status(200).json({ success: true, message: '상품이 수정되었습니다.' });
            });
        });
    });
});

// 상품 삭제 API
router.delete('/delete/:id', (req, res) => {
    const productId = req.params.id;
    const db = req.app.locals.db;

    // 삭제하려는 상품의 작성자가 현재 사용자와 일치하는지 확인
    const sessionId = req.sessionID;
    const sqlSession = 'SELECT data FROM sessions WHERE session_id = ?';

    db.query(sqlSession, [sessionId], (err, results) => {
        if (err) {
            console.error('세션 조회 실패', err);
            return res.status(500).json({ success: false, message: '세션 조회에 실패하였습니다.' });
        }

        if (results.length === 0) {
            return res.status(400).json({ success: false, message: '세션이 존재하지 않습니다.' });
        }

        const sessionData = JSON.parse(results[0].data);
        const userId = sessionData.userId;  // sessionData에서 userId를 추출

        const sqlCheckOwner = 'SELECT user_id FROM products WHERE id = ?';
        db.query(sqlCheckOwner, [productId], (err, product) => {
            if (err || product.length === 0) {
                return res.status(500).json({ success: false, message: '상품 조회 실패' });
            }

            if (product[0].user_id !== userId) {
                return res.status(403).json({ success: false, message: '본인의 상품만 삭제할 수 있습니다.' });
            }

            const sqlDelete = 'DELETE FROM products WHERE id = ?';
            db.query(sqlDelete, [productId], (err, result) => {
                if (err) {
                    console.error('상품 삭제 실패', err);
                    return res.status(500).json({ success: false, message: '상품 삭제에 실패하였습니다.' });
                }

                res.status(200).json({ success: true, message: '상품이 삭제되었습니다.' });
            });
        });
    });
});

module.exports = router;

require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const { db } = require('../mysql/db');  
const router = express.Router();

// 로그인 처리
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const db = req.app.locals.db; 

    console.log('로그인 정보:', { email, password });

    try {
        // 1. 이메일로 사용자 정보 조회
        const sql = 'SELECT * FROM users WHERE email = ?';
        
        // db.query로 수정
        db.query(sql, [email], async (err, results) => {
            if (err) {
                console.error('로그인 오류:', err);
                res.status(500).send('서버 오류');
                return;
            }

            // 2. 사용자가 존재하지 않으면 로그인 실패
            if (results.length === 0) {
                return res.status(400).send('이메일 또는 비밀번호가 잘못되었습니다.');
            }

            const user = results[0];  // 첫 번째 결과(사용자)

            // 3. 비밀번호 비교
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return res.status(400).send('이메일 또는 비밀번호가 잘못되었습니다.');
            }

            // 4. 세션에 사용자 정보 저장 (세션 생성)
            req.session.userId = user.id;
            req.session.userName = user.name;

            res.json({ success: true });
        });
    } catch (err) {
        console.error('로그인 처리 중 오류 발생:', err);
        res.status(500).send('로그인 처리 중 오류 발생');
    }
});

// 로그아웃 처리
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('로그아웃 중 오류가 발생했습니다.');
        }

        // 세션 쿠키 삭제
        res.clearCookie('session_id'); 
        res.json({ success: true });
    });
});


router.get('/check-login-status', (req, res) => {
    console.log('세션 정보:', req.session); // 세션 정보 출력
    if (req.session.userId) {
        return res.json({ loggedIn: true });
    } else {
        return res.json({ loggedIn: false });
    }
});

module.exports = router;
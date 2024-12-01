const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');

const router = express.Router();

router.post('/signup', async (req, res) => {
    const {name, email, password} = req.body;
    const db = req.app.locals.db;

    console.log('회원가입 정보: ', {name, email, password} );

    try {
        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 10);

        // SQL 쿼리문 작성
        const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
        
        // 쿼리 실행
        db.execute(sql, [name, email, hashedPassword], (err, results) => {
            if (err) {
                console.error('회원가입 실패: ', err);
                res.status(500).send('회원가입 중 오류가 발생했습니다.');
                return;
            }

            // 회원가입 성공
            console.log('회원가입 성공: ', results);
            res.redirect('/login.html');
        });
    } catch (err) {
        console.error('비밀번호 해싱 실패: ', err);
        alert('비밀번호 해싱 중 오류가 발생했습니다.');
    }
})

module.exports = router;
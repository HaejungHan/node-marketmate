const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const db = require('./db');  // DB 연결 객체를 가져옵니다.

const sessionStore = new MySQLStore({}, db);

const sessionMiddleware = session({
    key: 'session_id',  // 세션 키 설정
    secret: process.env.SESSION_SECRET,  // 세션 비밀 설정
    store: sessionStore,  // 세션을 저장할 MySQLStore 설정
    resave: false,  // 세션을 강제로 저장하지 않도록 설정
    saveUninitialized: false,  // 초기화되지 않은 세션을 저장하지 않도록 설정
    cookie: {
        secure: false,  // 개발 환경에서는 false로 설정, 배포 시 true로 변경
        maxAge: 24 * 60 * 60 * 1000  // 세션 유효 기간 설정 (24시간)
    }
});

module.exports = sessionMiddleware;
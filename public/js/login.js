document.getElementById('login-form').addEventListener('submit', function(event) {
    // 폼 기본 제출 방지
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // 입력 값 검증
    if (email === '' || password === '') {
        alert('이메일과 비밀번호를 모두 입력해주세요!');
        return;
    }

    // 이메일 형식 확인
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(email)) {
        alert('올바른 이메일 주소를 입력하세요.');
        return;
    }

    // 로그인 API 요청
    fetch('/login/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('로그인 성공!');
            window.location.href = '/index.html'; 
        } else {
            alert('이메일 또는 비밀번호가 잘못되었습니다.');
        }
    })
    .catch(error => {
        console.error('로그인 오류:', error);
        alert('서버와 연결하는 데 문제가 발생했습니다.');
    });
});
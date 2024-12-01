document.getElementById('signup-form').addEventListener('submit', function(event) {
    // 폼 기본 제출 방지
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // 입력 값 검증
    if (name === '' || email === '' || password === '' || confirmPassword === '') {
        alert('모든 필드를 채워주세요!');
        return;
    }

    if (password !== confirmPassword) {
        alert('비밀번호가 일치하지 않습니다!');
        return;
    }

    // 이메일 형식 확인
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(email)) {
        alert('올바른 이메일 주소를 입력하세요.');
        return;
    }

    // 비밀번호 길이 확인 (최소 6자 이상)
    if (password.length < 6) {
        alert('비밀번호는 최소 6자 이상이어야 합니다.');
        return;
    }

    // 모든 검증 통과 시 폼 제출
    alert('회원가입이 완료되었습니다!');
    this.submit(); // 실제 서버에 폼 데이터를 전송
});

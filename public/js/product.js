document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.tab');
    const searchSection = document.getElementById('search-section');
    const postForm = document.getElementById('post-form');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            if (tab.dataset.tab === 'search') {
                searchSection.style.display = 'block';
                postForm.style.display = 'none';
            } else {
                searchSection.style.display = 'none';
                postForm.style.display = 'block';
            }
        });
    });

    document.getElementById('product-form').addEventListener('submit', function(e) {
        e.preventDefault();  // 기본 폼 제출 막기
    
        const formData = new FormData(this);  // 폼 데이터 가져오기
    
        // 서버로 비동기적으로 폼 데이터 전송
        fetch('/product/create', {
            method: 'POST',
            body: formData,  // 폼 데이터를 그대로 전달
        })
        .then(response => response.json())  // 서버 응답을 JSON으로 받음
        .then(data => {
            if (data.success) {
                alert('상품이 등록되었습니다!');
                // 페이지 새로고침 (리프레시)
                location.reload();
            } else {
                alert('상품 등록에 실패하였습니다.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('서버와 연결에 실패했습니다.');
        });
    });

    document.querySelector('.search-button').addEventListener('click', function() {
        const searchTerm = document.querySelector('.search-input').value;
        if (searchTerm.trim()) {
            alert(`검색어 "${searchTerm}"에 대한 검색을 수행합니다.`);
        }
    });
});
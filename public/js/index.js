window.addEventListener('DOMContentLoaded', function() {
    fetch('/recent-products') // 상품 목록을 요청
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const productList = document.getElementById('product-list');
                data.products.forEach(product => {
                    const imagePath = product.image_path;

                    // 상품 카드 생성
                    const productCard = document.createElement('div');
                    productCard.classList.add('product-card');

                    // HTML 콘텐츠 추가
                    productCard.innerHTML = `
                        <div class="product-image">
                            <img src="/${imagePath}" alt="${product.title}" />
                        </div>
                        <div class="product-info">
                            <h3>${product.title}</h3>
                            <p class="product-price">${product.price}원</p>
                            <div class="product-meta">
                                <span>${product.created_at}</span>
                                <span>조회 ${product.views}</span>
                            </div>
                        </div>
                    `;

                    // productList에 카드 추가
                    productList.appendChild(productCard);
                });
            } else {
                alert('상품 목록을 불러오는 데 실패했습니다.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('서버와 연결에 실패했습니다.');
        });
});
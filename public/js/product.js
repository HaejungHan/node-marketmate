document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.tab');
    const searchSection = document.getElementById('search-section');
    const postForm = document.getElementById('post-form');

    const modal = document.getElementById('modal');
    const closeButton = document.querySelector('.close-button');
    const modalTitle = document.getElementById('modal-title');
    const modalImage = document.getElementById('modal-image');
    const modalDescription = document.getElementById('modal-description');
    const modalPrice = document.getElementById('modal-price');
    const modalCreatedAt = document.getElementById('modal-created-at');
    const modalSeller = document.getElementById('modal-seller');

    // 탭 클릭 이벤트 처리
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

    // 상품 등록
    document.getElementById('product-form').addEventListener('submit', function(e) {
        e.preventDefault();  

        const formData = new FormData(this); 

        fetch('/product/create', {
            method: 'POST',
            body: formData, 
        })
        .then(response => response.json())  
        .then(data => {
            if (data.success) {
                alert('상품이 등록되었습니다!');
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

    // 상품 검색
    function searchProducts() {
        const query = document.getElementById('search-input').value;

        if (query.trim() === '') {
            alert('검색어를 입력하세요');
            return;
        }

        fetch(`/product/search?query=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const productList = document.getElementById('product-list');
                    productList.innerHTML = ''; // 이전 검색 결과 지우기

                    data.products.forEach(product => {
                        const imagePath = product.image_path;
                        const imageSrc = `${imagePath.replace(/\\/g, '/')}`;
                        const formattedDate = formatDate(product.created_at);

                        const productCard = document.createElement('div');
                        productCard.classList.add('product-card');
                        productCard.innerHTML = `
                        <div class="product-image">
                            <img src="${imageSrc}" alt="${product.title}" />
                        </div>
                        <div class="product-info">
                            <h3>${product.title}</h3>
                            <p class="product-price">${product.price}원</p>
                            <div class="product-meta">
                                <span>등록일자 : ${formattedDate}</span>
                                <span>판매자 : ${product.seller_name}</span>
                            </div>
                        </div>
                    `;
                    productCard.addEventListener('click', () => {
                        modalTitle.textContent = product.title;
                        modalImage.src = imageSrc;
                        modalImage.alt = product.title;
                        modalDescription.textContent = product.description || "상세 설명이 없습니다.";
                        modalPrice.textContent = `${product.price}원`;
                        modalCreatedAt.textContent = `등록일: ${formatDate(product.created_at)}`;
                        modalSeller.textContent = `${product.seller_name}`;
                        
                        modal.style.display = "block"; // 모달 열기
                    });

                        productList.appendChild(productCard);
                    });
                } else {
                    alert('검색 결과가 없습니다.');
                }
            })
            .catch(error => {
                console.error('검색 중 오류가 발생했습니다:', error);
                alert('서버와 연결할 수 없습니다.');
            });

            closeButton.addEventListener('click', () => {
                modal.style.display = "none"; // 모달 닫기
            });
        
            // 모달 바깥 영역 클릭 시 모달 닫기
            window.addEventListener('click', (event) => {
                if (event.target === modal) {
                    modal.style.display = "none"; // 모달 닫기
                }
            });
    }

    function formatDate(dateString) {
        const date = new Date(dateString); 
        if (isNaN(date)) {
            console.error('유효하지 않은 날짜:', dateString);
            return ''; // 날짜가 유효하지 않으면 빈 문자열 반환
        }
    
        const months = [
            "1월", "2월", "3월", "4월", "5월", "6월", 
            "7월", "8월", "9월", "10월", "11월", "12월"
        ];
    
        const month = months[date.getMonth()]; 
        const day = date.getDate(); 
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0'); 
        const ampm = hours >= 12 ? '오후' : '오전';  
    
        hours = hours % 12;
        hours = hours ? hours : 12;  
    
        return `${month} ${day}일 ${ampm} ${hours}:${minutes}`;  
    }

    // 검색 버튼에 이벤트 리스너 추가
    document.querySelector('.search-button').addEventListener('click', searchProducts);
});

document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('modal');
    const closeButton = document.querySelector('.close-button');
    const modalTitle = document.getElementById('modal-title');
    const modalImage = document.getElementById('modal-image');
    const modalDescription = document.getElementById('modal-description');
    const modalPrice = document.getElementById('modal-price');
    const modalCreatedAt = document.getElementById('modal-created-at');
    const modalSeller = document.getElementById('modal-seller');

    fetch('/product/recent-products')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const productList = document.getElementById('product-list');
                data.products.forEach(product => {
                    const imagePath = product.image_path;
                    const imageSrc = `${imagePath.replace(/\\/g, '/')}`;  
                    const formattedDate = formatDate(product.created_at);

                    // 상품 카드 생성
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

    closeButton.addEventListener('click', () => {
        modal.style.display = "none"; // 모달 닫기
    });

    // 모달 바깥 영역 클릭 시 모달 닫기
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = "none"; // 모달 닫기
        }
    });

    // 로그인 상태 확인
    fetch('/login/check-login-status')
    .then(response => response.json())
    .then(data => {
        console.log('로그인 상태:', data);  // 데이터를 로그로 출력
        if (data.loggedIn) {
            document.getElementById('hero').style.display = 'none';
            document.getElementById('logout-button').style.display = 'block';
        }
    })
    .catch(error => {
        console.error('로그인 상태 확인 오류:', error);
    });

    // 로그아웃 버튼 클릭 시 처리
    document.getElementById('logout-button').addEventListener('click', () => {
        fetch('/login/logout', { method: 'POST' })
            .then(() => {
                window.location.href = '/'; // 로그아웃 후 리다이렉트
            })
            .catch(error => {
                console.error('로그아웃 처리 오류:', error);
            });
    });

    const loginRequiredLinks = document.querySelectorAll('.nav-item');
    loginRequiredLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            fetch('/login/check-login-status')
                .then(response => response.json())
                .then(data => {
                    if (!data.loggedIn) {
                        e.preventDefault(); // 링크 이동 막기
                        alert('로그인이 필요합니다!');
                        window.location.href = '/login'; // 로그인 페이지로 리다이렉트
                    }
                })
                .catch(error => {
                    console.error('로그인 상태 확인 오류:', error);
                    alert('로그인 상태를 확인하는 중 오류가 발생했습니다.');
                });
        });
    });
});

function formatDate(dateString) {
    const date = new Date(dateString);

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

document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.tab');
    const productList = document.getElementById('product-list'); 
    const searchSection = document.getElementById('search-section');
    const postForm = document.getElementById('post-form');

    // 검색 관련 요소들
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');

    const modal = document.getElementById('modal');
    const closeButton = document.querySelector('.close-button');
    const modalTitle = document.getElementById('modal-title');
    const modalImage = document.getElementById('modal-image');
    const modalDescription = document.getElementById('modal-description');
    const modalPrice = document.getElementById('modal-price');
    const modalCreatedAt = document.getElementById('modal-created-at');
    const modalSeller = document.getElementById('modal-seller');

    let allProducts = []; // 전체 상품 목록을 저장할 배열

    // 탭 클릭 이벤트 처리
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active')); // 모든 탭에서 active 제거
            tab.classList.add('active'); // 클릭한 탭에 active 추가

            if (tab.dataset.tab === 'search') {
                searchSection.style.display = 'block'; // 상품 검색 섹션 보이기
                postForm.style.display = 'none'; // 상품 등록 폼 숨기기
                productList.style.display = 'block'; // 상품 목록 보이기
            } else if (tab.dataset.tab === 'post') {
                searchSection.style.display = 'none'; // 상품 검색 섹션 숨기기
                postForm.style.display = 'block'; // 상품 등록 폼 보이기
                productList.style.display = 'none'; // 상품 목록 숨기기
            }
        });
    });

    // 전체 상품 목록을 불러오는 함수
    function loadAllProducts(page = 1) {
        fetch(`/product/all-products?page=${page}&limit=20`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    allProducts = data.products; // 전체 상품 목록 저장
                    displayProducts(allProducts); // 상품 목록을 화면에 표시

                    // 페이지네이션 처리
                    updatePagination(data.pagination);
                } else {
                    alert('상품 목록을 불러오는 데 실패했습니다.');
                }
            })
            .catch(error => {
                console.error('상품 목록 불러오기 오류:', error);
                alert('서버와 연결할 수 없습니다.');
            });
    }

    // 검색 버튼 클릭 시 서버에 검색 요청 보내기
    searchButton.addEventListener('click', function() {
        const query = searchInput.value.trim();  // 사용자가 입력한 검색어

        if (!query) {
            alert('검색어를 입력해주세요.');
            return;
        }

        // 검색 결과 표시: 페이지네이션 없이 바로 표시
        fetch(`/product/search?query=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    displayProducts(data.products);  // 검색된 상품 목록을 표시
                    hidePagination();  // 페이지네이션 숨기기
                } else {
                    alert('검색 결과가 없습니다.');
                }
            })
            .catch(error => {
                console.error('검색 실패:', error);
                alert('검색에 실패했습니다.');
            });
    });

    // 상품 목록을 화면에 표시하는 함수
    function displayProducts(products) {
        productList.innerHTML = ''; // 기존 상품 리스트 비우기

        products.forEach(product => {
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
                if (modal) {
                    modalTitle.textContent = product.title;
                    modalImage.src = imageSrc;
                    modalImage.alt = product.title;
                    modalDescription.textContent = product.description || "상세 설명이 없습니다.";
                    modalPrice.textContent = `${product.price}원`;
                    modalCreatedAt.textContent = `등록일: ${formatDate(product.created_at)}`;
                    modalSeller.textContent = `${product.seller_name}`;
                    
                    modal.style.display = "block"; // 모달 열기
                }
            });

            productList.appendChild(productCard);
        });
    }

    // 페이지네이션을 업데이트하는 함수
    function updatePagination(pagination) {
        const paginationElement = document.getElementById('pagination');
        
        if (!pagination || !pagination.totalPages) return;

        paginationElement.innerHTML = ''; // 기존 페이지네이션 비우기
        for (let i = 1; i <= pagination.totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.addEventListener('click', () => {
                currentPage = i;
                loadAllProducts(currentPage);  // 페이지 변경 시 새로운 상품 목록 불러오기
            });
            paginationElement.appendChild(pageButton);
        }
    }

    // 페이지네이션을 숨기는 함수 (검색 시 사용)
    function hidePagination() {
        const paginationElement = document.getElementById('pagination');
        paginationElement.style.display = 'none';  // 페이지네이션 숨기기
    }

    // 페이지가 로드되면 전체 상품 목록을 불러오기
    loadAllProducts();

    // 모달 닫기 이벤트
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            modal.style.display = "none"; // 모달 닫기
        });
    }

    // 모달 바깥 영역 클릭 시 모달 닫기
    if (modal) {
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
});

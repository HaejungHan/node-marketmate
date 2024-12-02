document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('product-form').addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(this);

        fetch('/product/post/create', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('상품이 등록되었습니다!');
                window.location.href = '/product'; // 상품등록 후 검색 페이지로 리디렉션
            } else {
                alert('상품 등록에 실패하였습니다.');
            }
        })
        .catch(error => {
            console.error('상품 등록 실패:', error);
            alert('서버와 연결할 수 없습니다.');
        });
    });
});




// document.addEventListener('DOMContentLoaded', function() {
//     const tabs = document.querySelectorAll('.tab');
//     const productList = document.getElementById('product-list'); 
//     const searchSection = document.getElementById('search-section');
//     const postForm = document.getElementById('post-form');

//     const modal = document.getElementById('modal');
//     const closeButton = document.querySelector('.close-button');
//     const modalTitle = document.getElementById('modal-title');
//     const modalImage = document.getElementById('modal-image');
//     const modalDescription = document.getElementById('modal-description');
//     const modalPrice = document.getElementById('modal-price');
//     const modalCreatedAt = document.getElementById('modal-created-at');
//     const modalSeller = document.getElementById('modal-seller');

//     let allProducts = []; // 전체 상품 목록을 저장할 배열

//     // 탭 클릭 이벤트 처리
//     tabs.forEach(tab => {
//         tab.addEventListener('click', () => {
//             tabs.forEach(t => t.classList.remove('active')); // 모든 탭에서 active 제거
//             tab.classList.add('active'); // 클릭한 탭에 active 추가

//             if (tab.dataset.tab === 'search') {
//                 searchSection.style.display = 'block'; // 상품 검색 섹션 보이기
//                 postForm.style.display = 'none'; // 상품 등록 폼 숨기기
//                 productList.style.display = 'block'; // 상품 목록 보이기
//             } else if (tab.dataset.tab === 'post') {
//                 searchSection.style.display = 'none'; // 상품 검색 섹션 숨기기
//                 postForm.style.display = 'block'; // 상품 등록 폼 보이기
//                 productList.style.display = 'none'; // 상품 목록 숨기기
//             }
//         });
//     });

//     // 페이지네이션을 고려하여 전체 상품 불러오기
// let currentPage = 1;  // 현재 페이지
// const itemsPerPage = 20;  // 한 페이지에 표시할 상품 개수

// // 전체 상품 목록을 불러오는 함수
// function loadAllProducts(page = 1) {
//     fetch(`/product/all-products?page=${page}&limit=${itemsPerPage}`)
//         .then(response => response.json())
//         .then(data => {
//             if (data.success) {
//                 allProducts = data.products; // 전체 상품 목록 저장
//                 displayProducts(allProducts); // 상품 목록을 화면에 표시

//                 // 페이지네이션 처리
//                 updatePagination(data.pagination);
//             } else {
//                 alert('상품 목록을 불러오는 데 실패했습니다.');
//             }
//         })
//         .catch(error => {
//             console.error('상품 목록 불러오기 오류:', error);
//             alert('서버와 연결할 수 없습니다.');
//         });
// }

// // 상품 목록을 화면에 표시하는 함수
// function displayProducts(products) {
//     productList.innerHTML = ''; // 기존 상품 리스트 비우기

//     products.forEach(product => {
//         const imagePath = product.image_path;
//         const imageSrc = `${imagePath.replace(/\\/g, '/')}`;
//         const formattedDate = formatDate(product.created_at);

//         const productCard = document.createElement('div');
//         productCard.classList.add('product-card');
//         productCard.innerHTML = `
//             <div class="product-image">
//                 <img src="${imageSrc}" alt="${product.title}" />
//             </div>
//             <div class="product-info">
//                 <h3>${product.title}</h3>
//                 <p class="product-price">${product.price}원</p>
//                 <div class="product-meta">
//                     <span>등록일자 : ${formattedDate}</span>
//                     <span>판매자 : ${product.seller_name}</span>
//                 </div>
//             </div>
//         `;
//         productCard.addEventListener('click', () => {
//             modalTitle.textContent = product.title;
//             modalImage.src = imageSrc;
//             modalImage.alt = product.title;
//             modalDescription.textContent = product.description || "상세 설명이 없습니다.";
//             modalPrice.textContent = `${product.price}원`;
//             modalCreatedAt.textContent = `등록일: ${formatDate(product.created_at)}`;
//             modalSeller.textContent = `${product.seller_name}`;
            
//             modal.style.display = "block"; // 모달 열기
//         });

//         productList.appendChild(productCard);
//     });
// }

// // 페이지네이션을 업데이트하는 함수
// function updatePagination(pagination) {
//     const paginationElement = document.getElementById('pagination');

//     // 페이지네이션 버튼을 생성
//     paginationElement.innerHTML = ''; // 기존 페이지네이션 비우기
//     for (let i = 1; i <= pagination.totalPages; i++) {
//         const pageButton = document.createElement('button');
//         pageButton.textContent = i;
//         pageButton.addEventListener('click', () => {
//             currentPage = i;
//             loadAllProducts(currentPage);  // 페이지 변경 시 새로운 상품 목록 불러오기
//         });
//         paginationElement.appendChild(pageButton);
//     }
// }

// // 페이지가 로드되면 전체 상품 목록을 불러오기
// loadAllProducts(currentPage);

//     // 상품 등록
//     document.getElementById('product-form').addEventListener('submit', function(e) {
//         e.preventDefault();  

//         const formData = new FormData(this); 

//         fetch('/product/create', {
//             method: 'POST',
//             body: formData, 
//         })
//         .then(response => response.json())  
//         .then(data => {
//             if (data.success) {
//                 alert('상품이 등록되었습니다!');
//                 loadRecentProducts(); // 상품 등록 후 최신 목록 불러오기
//             } else {
//                 alert('상품 등록에 실패하였습니다.');
//             }
//         })
//         .catch(error => {
//             console.error('Error:', error);
//             alert('서버와 연결에 실패했습니다.');
//         });
//     });

//     // 상품 검색
//     function searchProducts() {
//         const query = document.getElementById('search-input').value.toLowerCase();

//         if (query.trim() === '') {
//             alert('검색어를 입력하세요');
//             return;
//         }

//         const filteredProducts = allProducts.filter(product => 
//             product.title.toLowerCase().includes(query)
//         );

//         if (filteredProducts.length > 0) {
//             displayProducts(filteredProducts); // 필터링된 상품 목록을 화면에 표시
//         } else {
//             productList.innerHTML = '<p>검색 결과가 없습니다.</p>';
//         }
//     }

//     // 검색 버튼에 이벤트 리스너 추가
//     document.querySelector('.search-button').addEventListener('click', searchProducts);

//     // 모달 닫기 이벤트
//     closeButton.addEventListener('click', () => {
//         modal.style.display = "none"; // 모달 닫기
//     });

//     // 모달 바깥 영역 클릭 시 모달 닫기
//     window.addEventListener('click', (event) => {
//         if (event.target === modal) {
//             modal.style.display = "none"; // 모달 닫기
//         }
//     });

//     function formatDate(dateString) {
//         const date = new Date(dateString); 
//         if (isNaN(date)) {
//             console.error('유효하지 않은 날짜:', dateString);
//             return ''; // 날짜가 유효하지 않으면 빈 문자열 반환
//         }
    
//         const months = [
//             "1월", "2월", "3월", "4월", "5월", "6월", 
//             "7월", "8월", "9월", "10월", "11월", "12월"
//         ];
    
//         const month = months[date.getMonth()]; 
//         const day = date.getDate(); 
//         let hours = date.getHours();
//         const minutes = String(date.getMinutes()).padStart(2, '0'); 
//         const ampm = hours >= 12 ? '오후' : '오전';  
    
//         hours = hours % 12;
//         hours = hours ? hours : 12;  

//         return `${month} ${day}일 ${ampm} ${hours}:${minutes}`;  
//     }
// });

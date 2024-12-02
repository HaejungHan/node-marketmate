document.addEventListener('DOMContentLoaded', function() {
    let currentPage = 1;  // 현재 페이지 번호

    // 내 상품 목록 불러오기
    loadUserProducts(currentPage);

    // 페이지네이션 로직
    function loadUserProducts(page = 1) {
        currentPage = page;  // 현재 페이지 업데이트

        fetch(`/mypage/my-products?page=${page}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const productList = document.getElementById('product-list');
                    productList.innerHTML = '';  // 이전 목록 초기화

                    data.products.forEach(product => {
                        const imageSrc = product.image_path ? product.image_path : '/default-image.jpg';
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
                                    <span>등록일자: ${formattedDate}</span>
                                </div>
                            </div>
                        `;
                        productCard.addEventListener('click', () => openModal(product));

                        productList.appendChild(productCard);
                    });

                    // 페이지네이션 정보 표시
                    document.getElementById('page-info').textContent = `${currentPage} / ${data.pagination.totalPages}`;
                } else {
                    alert('상품 목록을 불러오는 데 실패했습니다.');
                }
            });
    }

    function openModal(product) {
        const modal = document.getElementById('modal');
        const modalImage = document.getElementById('modal-image');
        const modalImageFile = document.getElementById('modal-image-file');
        const modalTitle = document.getElementById('modal-title');
        const modalDescription = document.getElementById('modal-description');
        const modalPrice = document.getElementById('modal-price');
        const modalCreatedAt = document.getElementById('modal-created-at');
        const modalSeller = document.getElementById('modal-seller');
    
        // 기존 상품 정보로 수정 폼 채우기
        modalTitle.value = product.title;  // 제목 입력란에 값 설정
        modalDescription.value = product.description || '';  // 상세 설명
        modalPrice.value = product.price;  // 가격 입력란에 값 설정
        modalCreatedAt.value = formatDate(product.created_at);  // 등록일은 수정불가로 설정됨
        modalImage.src = product.image_path || '/default-image.jpg'; // 기본 이미지 설정
    
        modalImageFile.addEventListener('change', function() {
            const file = modalImageFile.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    modalImage.src = event.target.result;  // 파일을 읽어서 이미지 경로에 설정
                };
                reader.readAsDataURL(file);  // 선택한 파일을 DataURL로 읽어옴
            }
        });
    
        // 수정 버튼 클릭 시 상품 수정 처리
        document.getElementById('save-product').onclick = () => saveProductChanges(product.id);
    
        // 삭제 버튼 클릭 시 상품 삭제 처리
        document.getElementById('delete-product').onclick = () => deleteProduct(product.id, modal);
    
        modal.style.display = "block";
    }

    // 날짜 형식 변환
    function formatDate(dateString) {
        const date = new Date(dateString);
        const months = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
        const month = months[date.getMonth()];
        const day = date.getDate();
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? '오후' : '오전';
        hours = hours % 12;
        hours = hours ? hours : 12;

        return `${month} ${day}일 ${ampm} ${hours}:${minutes}`;
    }

    // 상품 수정 저장
    function saveProductChanges(productId) {
        const editTitle = document.getElementById('modal-title').value;
        const editDescription = document.getElementById('modal-description').value;
        const editPrice = document.getElementById('modal-price').value;
        const editImageFile = document.getElementById('modal-image-file').files[0];  // 파일 업로드된 이미지
    
        const formData = new FormData();
        
        // 수정할 필드가 있을 경우에만 추가
        if (editTitle) {
            formData.append('title', editTitle);
        }
        if (editDescription) {
            formData.append('description', editDescription);
        }
        if (editPrice) {
            formData.append('price', editPrice);
        }
        if (editImageFile) {
            formData.append('image', editImageFile);  // 이미지 파일도 포함
        }
    
        // 수정할 데이터가 하나라도 있으면 PATCH 요청
        if (formData.has('title') || formData.has('description') || formData.has('price') || formData.has('image')) {
            fetch(`/mypage/edit/${productId}`, {
                method: 'PATCH', 
                body: formData,
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('상품이 수정되었습니다.');
                    loadUserProducts(currentPage);  // 페이지 새로고침
                    document.getElementById('modal').style.display = 'none';  // 모달 닫기
                } else {
                    alert('상품 수정에 실패했습니다.');
                }
            })
            .catch(error => {
                console.error('상품 수정 오류:', error);
                alert('상품 수정 중 오류가 발생했습니다.');
            });
        } else {
            alert('수정할 항목을 선택해 주세요.');
        }
    }

    // 삭제 버튼 클릭
    function deleteProduct(productId, modal) {
        fetch(`/mypage/delete/${productId}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('상품이 삭제되었습니다.');
                modal.style.display = "none"; // 모달 닫기
                loadUserProducts(currentPage);  // 페이지 새로고침
            } else {
                alert('상품 삭제에 실패했습니다.');
            }
        });
    }

    // 모달 닫기 함수
    function closeModal() {
        const modal = document.getElementById('modal');
        modal.style.display = 'none';
    }

    // 닫기 버튼에 이벤트 리스너 추가
    document.getElementById('close-button').addEventListener('click', closeModal);

    // 모달 외부 클릭 시 모달 닫기
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('modal');
        if (event.target === modal) {
            closeModal();
        }
    });
});

/**
 * 원블럭(ONEBLOCK) 블로그 시스템
 * 파일 위치: assets/js/blog.js
 */

(function() {
    'use strict';

    // 설정
    const CONFIG = {
        postsPerPage: 9,
        naverBlogId: 'kbml2024',
        corsProxy: 'https://api.allorigins.win/raw?url=',
        categories: {
            'all': '전체',
            'place': '플레이스',
            'blog': '블로그',
            'ads': '광고',
            'tips': '마케팅팁'
        }
    };

    // 상태
    let state = {
        posts: [],
        naverPosts: [],
        filteredPosts: [],
        currentPage: 1,
        currentCategory: 'all',
        searchQuery: ''
    };

    // DOM 로드 시 초기화
    document.addEventListener('DOMContentLoaded', function() {
        if (document.querySelector('.blog-list-page')) {
            initBlogList();
        }
    });

    // ===================================
    // 블로그 리스트 초기화
    // ===================================

    async function initBlogList() {
        showLoading();
        
        try {
            // 자체 글 로드
            await loadLocalPosts();
            
            // 네이버 블로그 RSS 로드 (선택적)
            // await loadNaverPosts();
            
            // 글 합치기 및 정렬
            combinePosts();
            
            // 필터 및 검색 이벤트 바인딩
            bindEvents();
            
            // 렌더링
            renderPosts();
            
        } catch (error) {
            console.error('블로그 초기화 오류:', error);
            showError();
        }
    }

    // ===================================
    // 자체 글 로드
    // ===================================

    async function loadLocalPosts() {
        try {
            const response = await fetch('posts.json');
            if (!response.ok) throw new Error('posts.json 로드 실패');
            
            const data = await response.json();
            state.posts = data.posts.map(post => ({
                ...post,
                source: 'original',
                url: 'posts/' + post.file
            }));
        } catch (error) {
            console.warn('자체 글 로드 실패:', error);
            state.posts = [];
        }
    }

    // ===================================
    // 네이버 블로그 RSS 로드
    // ===================================

    async function loadNaverPosts() {
        try {
            const rssUrl = `https://rss.blog.naver.com/${CONFIG.naverBlogId}.xml`;
            const proxyUrl = CONFIG.corsProxy + encodeURIComponent(rssUrl);
            
            const response = await fetch(proxyUrl);
            if (!response.ok) throw new Error('네이버 RSS 로드 실패');
            
            const text = await response.text();
            const parser = new DOMParser();
            const xml = parser.parseFromString(text, 'text/xml');
            
            const items = xml.querySelectorAll('item');
            
            state.naverPosts = Array.from(items).slice(0, 20).map(item => {
                const title = item.querySelector('title')?.textContent || '';
                const link = item.querySelector('link')?.textContent || '';
                const pubDate = item.querySelector('pubDate')?.textContent || '';
                const description = item.querySelector('description')?.textContent || '';
                
                // 날짜 포맷
                const date = new Date(pubDate);
                const formattedDate = date.toISOString().split('T')[0];
                
                // 설명에서 HTML 태그 제거
                const excerpt = description
                    .replace(/<[^>]*>/g, '')
                    .replace(/&nbsp;/g, ' ')
                    .substring(0, 150) + '...';
                
                // 썸네일 추출 시도
                const imgMatch = description.match(/<img[^>]+src="([^"]+)"/);
                const thumbnail = imgMatch ? imgMatch[1] : null;
                
                return {
                    id: 'naver-' + link.split('/').pop(),
                    title: title,
                    date: formattedDate,
                    category: 'tips',
                    thumbnail: thumbnail,
                    excerpt: excerpt,
                    url: link,
                    source: 'naver'
                };
            });
            
        } catch (error) {
            console.warn('네이버 블로그 로드 실패:', error);
            state.naverPosts = [];
        }
    }

    // ===================================
    // 글 합치기 및 정렬
    // ===================================

    function combinePosts() {
        // 자체 글 + 네이버 글 합치기
        const allPosts = [...state.posts, ...state.naverPosts];
        
        // 날짜순 정렬 (최신순)
        allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        state.filteredPosts = allPosts;
    }

    // ===================================
    // 이벤트 바인딩
    // ===================================

    function bindEvents() {
        // 카테고리 필터
        const categoryBtns = document.querySelectorAll('.category-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                state.currentCategory = this.dataset.category;
                state.currentPage = 1;
                
                categoryBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                filterPosts();
                renderPosts();
            });
        });
        
        // 검색
        const searchInput = document.querySelector('.blog-search input');
        const searchBtn = document.querySelector('.blog-search button');
        
        if (searchInput) {
            searchInput.addEventListener('keyup', function(e) {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
            
            // 실시간 검색 (디바운스)
            let searchTimeout;
            searchInput.addEventListener('input', function() {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(performSearch, 300);
            });
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', performSearch);
        }
    }

    // ===================================
    // 필터링
    // ===================================

    function filterPosts() {
        let filtered = [...state.posts, ...state.naverPosts];
        
        // 카테고리 필터
        if (state.currentCategory !== 'all') {
            filtered = filtered.filter(post => post.category === state.currentCategory);
        }
        
        // 검색어 필터
        if (state.searchQuery) {
            const query = state.searchQuery.toLowerCase();
            filtered = filtered.filter(post => 
                post.title.toLowerCase().includes(query) ||
                (post.excerpt && post.excerpt.toLowerCase().includes(query))
            );
        }
        
        // 날짜순 정렬
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        state.filteredPosts = filtered;
    }

    function performSearch() {
        const searchInput = document.querySelector('.blog-search input');
        state.searchQuery = searchInput ? searchInput.value.trim() : '';
        state.currentPage = 1;
        
        filterPosts();
        renderPosts();
    }

    // ===================================
    // 렌더링
    // ===================================

    function renderPosts() {
        const container = document.querySelector('.blog-grid');
        if (!container) return;
        
        const startIndex = (state.currentPage - 1) * CONFIG.postsPerPage;
        const endIndex = startIndex + CONFIG.postsPerPage;
        const postsToShow = state.filteredPosts.slice(startIndex, endIndex);
        
        if (postsToShow.length === 0) {
            container.innerHTML = `
                <div class="blog-empty" style="grid-column: 1 / -1;">
                    <div class="blog-empty__icon">📝</div>
                    <h3 class="blog-empty__title">게시글이 없습니다</h3>
                    <p class="blog-empty__desc">다른 카테고리를 선택하거나 검색어를 변경해보세요.</p>
                </div>
            `;
            hidePagination();
            return;
        }
        
        container.innerHTML = postsToShow.map(post => createPostCard(post)).join('');
        
        renderPagination();
        hideLoading();
    }

    function createPostCard(post) {
        const categoryName = CONFIG.categories[post.category] || post.category;
        const sourceLabel = post.source === 'naver' ? 'naver' : 'original';
        const sourceText = post.source === 'naver' ? '네이버 블로그' : '원블럭';
        const targetAttr = post.source === 'naver' ? 'target="_blank" rel="noopener"' : '';
        
        const thumbnailHtml = post.thumbnail 
            ? `<img src="${post.thumbnail}" alt="${post.title}" loading="lazy">`
            : `<div class="blog-card__thumbnail-placeholder">📝</div>`;
        
        return `
            <a href="${post.url}" class="blog-card" ${targetAttr}>
                <div class="blog-card__thumbnail">
                    ${thumbnailHtml}
                    <span class="blog-card__source ${sourceLabel}">${sourceText}</span>
                </div>
                <div class="blog-card__content">
                    <span class="blog-card__category">${categoryName}</span>
                    <h3 class="blog-card__title">${post.title}</h3>
                    <p class="blog-card__excerpt">${post.excerpt || ''}</p>
                    <div class="blog-card__meta">
                        <span class="blog-card__date">${formatDate(post.date)}</span>
                        <span class="blog-card__readmore">읽기 →</span>
                    </div>
                </div>
            </a>
        `;
    }

    function renderPagination() {
        const container = document.querySelector('.blog-pagination');
        if (!container) return;
        
        const totalPages = Math.ceil(state.filteredPosts.length / CONFIG.postsPerPage);
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }
        
        let html = '';
        
        // 이전 버튼
        html += `
            <button class="pagination-btn ${state.currentPage === 1 ? 'disabled' : ''}" 
                    data-page="${state.currentPage - 1}" 
                    ${state.currentPage === 1 ? 'disabled' : ''}>
                ←
            </button>
        `;
        
        // 페이지 번호
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= state.currentPage - 1 && i <= state.currentPage + 1)) {
                html += `
                    <button class="pagination-btn ${i === state.currentPage ? 'active' : ''}" 
                            data-page="${i}">
                        ${i}
                    </button>
                `;
            } else if (i === state.currentPage - 2 || i === state.currentPage + 2) {
                html += `<span class="pagination-ellipsis">...</span>`;
            }
        }
        
        // 다음 버튼
        html += `
            <button class="pagination-btn ${state.currentPage === totalPages ? 'disabled' : ''}" 
                    data-page="${state.currentPage + 1}"
                    ${state.currentPage === totalPages ? 'disabled' : ''}>
                →
            </button>
        `;
        
        container.innerHTML = html;
        
        // 페이지네이션 이벤트
        container.querySelectorAll('.pagination-btn:not(.disabled)').forEach(btn => {
            btn.addEventListener('click', function() {
                state.currentPage = parseInt(this.dataset.page);
                renderPosts();
                
                // 상단으로 스크롤
                document.querySelector('.blog-grid').scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            });
        });
    }

    function hidePagination() {
        const container = document.querySelector('.blog-pagination');
        if (container) container.innerHTML = '';
    }

    // ===================================
    // 유틸리티
    // ===================================

    function formatDate(dateStr) {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    }

    function showLoading() {
        const container = document.querySelector('.blog-grid');
        if (container) {
            container.innerHTML = `
                <div class="blog-loading" style="grid-column: 1 / -1; text-align: center; padding: 60px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">⏳</div>
                    <p>게시글을 불러오는 중...</p>
                </div>
            `;
        }
    }

    function hideLoading() {
        const loading = document.querySelector('.blog-loading');
        if (loading) loading.remove();
    }

    function showError() {
        const container = document.querySelector('.blog-grid');
        if (container) {
            container.innerHTML = `
                <div class="blog-empty" style="grid-column: 1 / -1;">
                    <div class="blog-empty__icon">⚠️</div>
                    <h3 class="blog-empty__title">로드 중 오류 발생</h3>
                    <p class="blog-empty__desc">잠시 후 다시 시도해주세요.</p>
                </div>
            `;
        }
    }

})();

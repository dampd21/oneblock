/**
 * 원블럭(ONEBLOCK) 공통 자바스크립트
 * 파일 위치: assets/js/common.js
 * 
 * 기능:
 * 1. 모바일 햄버거 메뉴
 * 2. 스크롤 시 헤더 스타일 변경
 * 3. Intersection Observer 애니메이션
 * 4. 부드러운 스크롤
 * 5. FAQ 아코디언
 * 6. 폼 유효성 검사
 * 7. 카카오톡 플로팅 버튼
 * 8. 후기 캐러셀
 */

(function() {
    'use strict';

    // ===================================
    // 1. DOM 로드 완료 시 초기화
    // ===================================
    
    document.addEventListener('DOMContentLoaded', function() {
        initMobileMenu();
        initScrollHeader();
        initScrollAnimations();
        initSmoothScroll();
        initFaqAccordion();
        initFormValidation();
        initKakaoFloat();
        initTestimonialCarousel();
        initCurrentYear();
    });

    // ===================================
    // 2. 모바일 햄버거 메뉴
    // ===================================
    
    function initMobileMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        const navLinks = document.querySelectorAll('.nav-menu a');
        const body = document.body;

        if (!hamburger || !navMenu) return;

        // 햄버거 버튼 클릭
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            body.classList.toggle('menu-open');
        });

        // 메뉴 링크 클릭 시 닫기
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                body.classList.remove('menu-open');
            });
        });

        // 메뉴 외부 클릭 시 닫기
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                body.classList.remove('menu-open');
            }
        });

        // ESC 키로 닫기
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                body.classList.remove('menu-open');
            }
        });
    }

    // ===================================
    // 3. 스크롤 시 헤더 스타일 변경
    // ===================================
    
    function initScrollHeader() {
        const header = document.querySelector('.header');
        if (!header) return;

        let lastScroll = 0;
        const scrollThreshold = 100;

        function handleScroll() {
            const currentScroll = window.pageYOffset;

            // 스크롤 다운 시 헤더 스타일 변경
            if (currentScroll > scrollThreshold) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            // 스크롤 방향에 따른 헤더 숨김/표시 (선택적)
            if (currentScroll > lastScroll && currentScroll > 300) {
                header.classList.add('header-hidden');
            } else {
                header.classList.remove('header-hidden');
            }

            lastScroll = currentScroll;
        }

        // 스크롤 이벤트 최적화 (throttle)
        let ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });

        // 초기 로드 시 체크
        handleScroll();
    }

    // ===================================
    // 4. Intersection Observer 애니메이션
    // ===================================
    
    function initScrollAnimations() {
        // 애니메이션 대상 요소들
        const animatedElements = document.querySelectorAll(
            '.fade-in, .fade-in-up, .fade-in-left, .fade-in-right, ' +
            '.stagger-item, [data-animate]'
        );

        if (animatedElements.length === 0) return;

        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    
                    // stagger 효과를 위한 지연
                    const delay = el.dataset.delay || 0;
                    
                    setTimeout(function() {
                        el.classList.add('animated');
                    }, delay);

                    // 한 번만 애니메이션
                    observer.unobserve(el);
                }
            });
        }, observerOptions);

        animatedElements.forEach(function(el) {
            observer.observe(el);
        });

        // Stagger 그룹 처리
        const staggerGroups = document.querySelectorAll('.stagger-group');
        staggerGroups.forEach(function(group) {
            const items = group.querySelectorAll('.stagger-item');
            items.forEach(function(item, index) {
                item.dataset.delay = index * 100;
            });
        });
    }

    // ===================================
    // 5. 부드러운 스크롤
    // ===================================
    
    function initSmoothScroll() {
        const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');

        smoothScrollLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                // # 만 있는 경우 무시
                if (href === '#') return;

                const target = document.querySelector(href);
                if (!target) return;

                e.preventDefault();

                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = targetPosition - headerHeight - 20;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            });
        });
    }

    // ===================================
    // 6. FAQ 아코디언
    // ===================================
    
    function initFaqAccordion() {
        const faqItems = document.querySelectorAll('.faq-item');

        faqItems.forEach(function(item) {
            const question = item.querySelector('.faq-item__question');
            if (!question) return;

            question.addEventListener('click', function() {
                const isActive = item.classList.contains('active');

                // 다른 아이템 닫기 (선택적 - 하나만 열기 모드)
                // faqItems.forEach(function(otherItem) {
                //     otherItem.classList.remove('active');
                // });

                // 현재 아이템 토글
                if (isActive) {
                    item.classList.remove('active');
                } else {
                    item.classList.add('active');
                }
            });

            // 키보드 접근성
            question.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    question.click();
                }
            });
        });
    }

    // ===================================
    // 7. 폼 유효성 검사
    // ===================================
    
    function initFormValidation() {
        const forms = document.querySelectorAll('.contact-form, .ebook-form');

        forms.forEach(function(form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();

                // 유효성 검사
                const isValid = validateForm(form);

                if (isValid) {
                    submitForm(form);
                }
            });

            // 실시간 유효성 검사
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(function(input) {
                input.addEventListener('blur', function() {
                    validateField(input);
                });

                input.addEventListener('input', function() {
                    // 에러 상태일 때만 실시간 체크
                    if (input.classList.contains('error')) {
                        validateField(input);
                    }
                });
            });
        });
    }

    function validateForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(function(field) {
            if (!validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    function validateField(field) {
        const value = field.value.trim();
        const type = field.type;
        const name = field.name;
        let isValid = true;
        let errorMessage = '';

        // 필수 필드 체크
        if (field.required && !value) {
            isValid = false;
            errorMessage = '필수 입력 항목입니다.';
        }
        // 이메일 형식 체크
        else if (type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = '올바른 이메일 형식이 아닙니다.';
            }
        }
        // 전화번호 형식 체크
        else if ((type === 'tel' || name === 'phone') && value) {
            const phoneRegex = /^[0-9]{2,3}-?[0-9]{3,4}-?[0-9]{4}$/;
            if (!phoneRegex.test(value.replace(/-/g, ''))) {
                isValid = false;
                errorMessage = '올바른 전화번호 형식이 아닙니다.';
            }
        }
        // URL 형식 체크 (플레이스 URL)
        else if (name === 'placeUrl' && value) {
            const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;
            if (!urlRegex.test(value)) {
                isValid = false;
                errorMessage = '올바른 URL 형식이 아닙니다.';
            }
        }

        // 에러 표시/제거
        const formGroup = field.closest('.form-group');
        const errorEl = formGroup?.querySelector('.form-error');

        if (!isValid) {
            field.classList.add('error');
            field.classList.remove('valid');
            if (errorEl) {
                errorEl.textContent = errorMessage;
                errorEl.style.display = 'block';
            }
        } else {
            field.classList.remove('error');
            if (value) field.classList.add('valid');
            if (errorEl) {
                errorEl.style.display = 'none';
            }
        }

        return isValid;
    }

    function submitForm(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn?.textContent;

        // 로딩 상태
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = '전송 중...';
        }

        // FormData 수집
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Google Forms 또는 Formspree로 전송
        const action = form.action;

        if (action && action.includes('formspree')) {
            // Formspree 전송
            fetch(action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(function(response) {
                if (response.ok) {
                    showFormSuccess(form);
                } else {
                    throw new Error('전송 실패');
                }
            })
            .catch(function(error) {
                showFormError(form, error);
            })
            .finally(function() {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            });
        } else {
            // 기본 처리 (데모용)
            setTimeout(function() {
                showFormSuccess(form);
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            }, 1500);
        }
    }

    function showFormSuccess(form) {
        const successMessage = form.querySelector('.form-success') || createSuccessMessage();
        form.reset();
        form.querySelectorAll('.valid').forEach(function(el) {
            el.classList.remove('valid');
        });

        // 성공 메시지 표시
        if (!form.contains(successMessage)) {
            form.appendChild(successMessage);
        }
        successMessage.style.display = 'block';
        successMessage.classList.add('show');

        // 3초 후 숨기기
        setTimeout(function() {
            successMessage.classList.remove('show');
            setTimeout(function() {
                successMessage.style.display = 'none';
            }, 300);
        }, 5000);
    }

    function createSuccessMessage() {
        const div = document.createElement('div');
        div.className = 'form-success';
        div.innerHTML = `
            <div class="form-success__icon">✓</div>
            <div class="form-success__text">
                <strong>신청이 완료되었습니다!</strong>
                <p>24시간 내에 연락드리겠습니다.</p>
            </div>
        `;
        return div;
    }

    function showFormError(form, error) {
        alert('전송 중 오류가 발생했습니다. 다시 시도해주세요.');
        console.error('Form submission error:', error);
    }

    // ===================================
    // 8. 카카오톡 플로팅 버튼
    // ===================================
    
    function initKakaoFloat() {
        const kakaoFloat = document.querySelector('.kakao-float');
        if (!kakaoFloat) return;

        // 스크롤 시 표시/숨김
        let lastScroll = 0;
        const showThreshold = 300;

        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;

            if (currentScroll > showThreshold) {
                kakaoFloat.classList.add('visible');
            } else {
                kakaoFloat.classList.remove('visible');
            }

            lastScroll = currentScroll;
        });

        // 클릭 이벤트 (이미 링크이므로 추가 처리 불필요)
    }

    // ===================================
    // 9. 후기 캐러셀
    // ===================================
    
    function initTestimonialCarousel() {
        const carousel = document.querySelector('.testimonial-carousel');
        if (!carousel) return;

        const track = carousel.querySelector('.testimonial-track');
        const slides = carousel.querySelectorAll('.testimonial-slide');
        const prevBtn = carousel.querySelector('.carousel-prev');
        const nextBtn = carousel.querySelector('.carousel-next');
        const dotsContainer = carousel.querySelector('.carousel-dots');

        if (!track || slides.length === 0) return;

        let currentIndex = 0;
        let slidesToShow = getSlidesToShow();
        let autoplayInterval;

        // 반응형 슬라이드 수
        function getSlidesToShow() {
            if (window.innerWidth < 768) return 1;
            if (window.innerWidth < 1024) return 2;
            return 3;
        }

        // 도트 생성
        function createDots() {
            if (!dotsContainer) return;
            
            dotsContainer.innerHTML = '';
            const totalDots = Math.ceil(slides.length / slidesToShow);

            for (let i = 0; i < totalDots; i++) {
                const dot = document.createElement('button');
                dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('aria-label', 'Slide ' + (i + 1));
                dot.addEventListener('click', function() {
                    goToSlide(i * slidesToShow);
                });
                dotsContainer.appendChild(dot);
            }
        }

        // 슬라이드 이동
        function goToSlide(index) {
            const maxIndex = slides.length - slidesToShow;
            currentIndex = Math.max(0, Math.min(index, maxIndex));

            const slideWidth = slides[0].offsetWidth;
            const gap = parseInt(getComputedStyle(track).gap) || 24;
            const offset = currentIndex * (slideWidth + gap);

            track.style.transform = 'translateX(-' + offset + 'px)';

            updateDots();
        }

        // 도트 업데이트
        function updateDots() {
            if (!dotsContainer) return;

            const dots = dotsContainer.querySelectorAll('.carousel-dot');
            const activeDotIndex = Math.floor(currentIndex / slidesToShow);

            dots.forEach(function(dot, i) {
                dot.classList.toggle('active', i === activeDotIndex);
            });
        }

        // 이전/다음
        function prevSlide() {
            goToSlide(currentIndex - slidesToShow);
        }

        function nextSlide() {
            if (currentIndex >= slides.length - slidesToShow) {
                goToSlide(0);
            } else {
                goToSlide(currentIndex + slidesToShow);
            }
        }

        // 자동 재생
        function startAutoplay() {
            autoplayInterval = setInterval(nextSlide, 5000);
        }

        function stopAutoplay() {
            clearInterval(autoplayInterval);
        }

        // 이벤트 바인딩
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);

        carousel.addEventListener('mouseenter', stopAutoplay);
        carousel.addEventListener('mouseleave', startAutoplay);

        // 터치 스와이프
        let touchStartX = 0;
        let touchEndX = 0;

        track.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
            stopAutoplay();
        }, { passive: true });

        track.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
            startAutoplay();
        }, { passive: true });

        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (diff > swipeThreshold) {
                nextSlide();
            } else if (diff < -swipeThreshold) {
                prevSlide();
            }
        }

        // 리사이즈 처리
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                const newSlidesToShow = getSlidesToShow();
                if (newSlidesToShow !== slidesToShow) {
                    slidesToShow = newSlidesToShow;
                    createDots();
                    goToSlide(0);
                }
            }, 250);
        });

        // 초기화
        createDots();
        startAutoplay();
    }

    // ===================================
    // 10. 현재 연도 자동 업데이트
    // ===================================
    
    function initCurrentYear() {
        const yearElements = document.querySelectorAll('.current-year');
        const currentYear = new Date().getFullYear();

        yearElements.forEach(function(el) {
            el.textContent = currentYear;
        });
    }

    // ===================================
    // 11. 유틸리티 함수들
    // ===================================

    // 디바운스
    window.debounce = function(func, wait) {
        let timeout;
        return function executedFunction() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, wait);
        };
    };

    // 쓰로틀
    window.throttle = function(func, limit) {
        let inThrottle;
        return function executedFunction() {
            const context = this;
            const args = arguments;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(function() {
                    inThrottle = false;
                }, limit);
            }
        };
    };

    // 숫자 카운트 애니메이션
    window.animateCounter = function(element, target, duration) {
        if (!element) return;

        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const timer = setInterval(function() {
            current += increment;
            if (current >= target) {
                element.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current).toLocaleString();
            }
        }, 16);
    };

    // 숫자 카운터 섹션 처리
    function initCounterAnimation() {
        const counters = document.querySelectorAll('[data-counter]');
        if (counters.length === 0) return;

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.dataset.counter);
                    const duration = parseInt(entry.target.dataset.duration) || 2000;
                    animateCounter(entry.target, target, duration);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(function(counter) {
            observer.observe(counter);
        });
    }

    // 페이지 로드 후 추가 초기화
    window.addEventListener('load', function() {
        initCounterAnimation();
    });

})();

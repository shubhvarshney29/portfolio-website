(() => {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lerp = (a, b, n) => a + (b - a) * n;

    document.addEventListener('DOMContentLoaded', () => {
        initCursorGlow();
        initScrollProgress();
        initNavbar();
        initMobileNav();
        initScrollReveal();
        initActiveNav();
        initSkillTabs();
        initTiltEffect();
        initParallaxPortrait();
        initMagneticButtons();
        initCounterAnimation();
        initBackToTop();
        initTypedEffect();
        initCopyEmail();
    });

    function initCursorGlow() {
        const cursorGlow = document.createElement('div');
        cursorGlow.className = 'cursor-glow';
        document.body.appendChild(cursorGlow);

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let glowX = mouseX;
        let glowY = mouseY;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }, { passive: true });

        const reduce = prefersReducedMotion.matches;
        function animateGlow() {
            if (!reduce) {
                glowX = lerp(glowX, mouseX, 0.14);
                glowY = lerp(glowY, mouseY, 0.14);
            } else {
                glowX = mouseX;
                glowY = mouseY;
            }
            cursorGlow.style.left = `${glowX}px`;
            cursorGlow.style.top = `${glowY}px`;
            requestAnimationFrame(animateGlow);
        }
        animateGlow();
    }

    function initScrollProgress() {
        const bar = document.querySelector('.scroll-progress span');
        if (!bar) return;

        const update = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            bar.style.width = `${percent}%`;
        };

        window.addEventListener('scroll', update, { passive: true });
        update();
    }

    function initNavbar() {
        const nav = document.querySelector('.navbar');
        const backToTop = document.querySelector('.back-to-top');
        let ticking = false;

        const update = () => {
            const scrolled = window.scrollY > 40;
            if (nav) nav.classList.toggle('scrolled', scrolled);
            if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 600);
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(update);
            }
        }, { passive: true });
        update();
    }

    function initMobileNav() {
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');
        if (!hamburger || !navLinks) return;

        const closeMenu = () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
        };

        hamburger.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            hamburger.classList.toggle('active', isOpen);
            hamburger.setAttribute('aria-expanded', String(isOpen));
        });

        navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
        window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
    }

    function initScrollReveal() {
        const targets = Array.from(document.querySelectorAll(
            '.glass-card, .section-heading, .stat-card, .highlight-item, .contact-card'
        )).filter(el =>
            !el.classList.contains('navbar') &&
            !el.classList.contains('back-to-top') &&
            !el.classList.contains('toast-msg')
        );

        if (prefersReducedMotion.matches) return;

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    el.classList.add('reveal-active');
                    setTimeout(() => {
                        el.classList.remove('reveal-active', 'reveal-hidden');
                    }, 1400);
                    obs.unobserve(el);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

        targets.forEach(el => {
            el.classList.add('reveal-hidden');
            observer.observe(el);
        });
    }

    function initActiveNav() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-links a');
        if (!sections.length) return;

        let ticking = false;
        const checkActive = () => {
            let currentSection = '';
            const scrollPosition = window.scrollY + 200;

            sections.forEach(section => {
                const top = section.offsetTop;
                const height = section.offsetHeight;
                if (scrollPosition >= top && scrollPosition < top + height) {
                    currentSection = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                const match = link.getAttribute('href') === `#${currentSection}`;
                link.classList.toggle('active', match);
            });
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(checkActive);
            }
        }, { passive: true });
        checkActive();
    }

    function initSkillTabs() {
        const filterBtns = document.querySelectorAll('.tab-btn');
        const skillCards = document.querySelectorAll('.skill-card');
        if (!filterBtns.length) return;

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');

                const filter = btn.getAttribute('data-filter');
                const timer = prefersReducedMotion.matches ? 0 : 250;

                skillCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    const show = filter === 'all' || category === filter;

                    if (show) {
                        card.style.display = 'flex';
                        requestAnimationFrame(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0) scale(1)';
                        });
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(10px) scale(0.95)';
                        setTimeout(() => { card.style.display = 'none'; }, timer);
                    }
                });
            });
        });
    }

    function initTiltEffect() {
        const tiltCards = document.querySelectorAll('.tilt-card');
        if (prefersReducedMotion.matches) return;

        tiltCards.forEach(card => {
            let rafId;
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const px = (e.clientX - rect.left) / rect.width - 0.5;
                const py = (e.clientY - rect.top) / rect.height - 0.5;
                if (rafId) cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(() => {
                    card.style.transform = `rotateY(${px * 10}deg) rotateX(${-py * 10}deg)`;
                });
            });
            card.addEventListener('mouseleave', () => {
                if (rafId) cancelAnimationFrame(rafId);
                card.style.transform = 'rotateY(0deg) rotateX(0deg)';
            });
        });
    }

    function initParallaxPortrait() {
        const wrapper = document.querySelector('.parallax-portrait');
        if (!wrapper) return;
        if (window.matchMedia('(pointer: coarse)').matches || prefersReducedMotion.matches) return;

        let targetX = 0;
        let targetY = 0;
        let x = 0;
        let y = 0;

        window.addEventListener('mousemove', (e) => {
            targetX = ((e.clientX / window.innerWidth) - 0.5) * 16;
            targetY = ((e.clientY / window.innerHeight) - 0.5) * 16;
        }, { passive: true });

        function animate() {
            x = lerp(x, targetX, 0.08);
            y = lerp(y, targetY, 0.08);
            wrapper.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            requestAnimationFrame(animate);
        }
        animate();
    }

    function initMagneticButtons() {
        const buttons = document.querySelectorAll('.magnetic');
        if (window.matchMedia('(pointer: coarse)').matches || prefersReducedMotion.matches) return;

        buttons.forEach(btn => {
            const strength = 18;
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const relX = e.clientX - rect.left - rect.width / 2;
                const relY = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${relX * 0.25}px, ${relY * 0.35}px)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
            });
        });
    }

    function initCounterAnimation() {
        const counters = document.querySelectorAll('.stat-number');
        const statsSection = document.querySelector('.hero-stats');
        if (!counters.length || !statsSection) return;

        const duration = 1600;
        let started = false;

        const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

        const animateCounter = (counter) => {
            const target = parseInt(counter.getAttribute('data-target') || '0', 10);
            if (!target) return;
            let startTime = null;

            const step = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                const eased = easeOutQuart(progress);
                counter.innerText = `${Math.round(target * eased)}+`;
                if (progress < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !started) {
                    started = true;
                    counters.forEach(animateCounter);
                    observer.disconnect();
                }
            });
        }, { threshold: 0.4 });

        observer.observe(statsSection);
    }

    function initTypedEffect() {
        const el = document.getElementById('typed-role');
        if (!el) return;

        const roles = [
            'AI Developer',
            'Competitive Programmer',
            'Full-Stack Learner',
            'Problem Solver',
            'CSE Student @ REC Mainpuri'
        ];

        let roleIndex = 0;
        let charIndex = 0;
        let deleting = false;

        const typeSpeed = 70;
        const deleteSpeed = 38;
        const holdTime = 2200;

        const tick = () => {
            const current = roles[roleIndex];
            if (deleting) {
                charIndex -= 1;
                el.textContent = current.slice(0, charIndex);
                if (charIndex <= 0) {
                    deleting = false;
                    roleIndex = (roleIndex + 1) % roles.length;
                    setTimeout(tick, 350);
                    return;
                }
                setTimeout(tick, deleteSpeed);
            } else {
                charIndex += 1;
                el.textContent = current.slice(0, charIndex);
                if (charIndex === current.length) {
                    deleting = true;
                    setTimeout(tick, holdTime);
                    return;
                }
                setTimeout(tick, typeSpeed);
            }
        };

        if (prefersReducedMotion.matches) {
            el.textContent = roles[0];
            return;
        }

        setTimeout(tick, 500);
    }

    function initCopyEmail() {
        const copyBtn = document.getElementById('copy-email-btn');
        if (!copyBtn) return;
        const email = 'shubhvarshney455@gmail.com';

        const copy = () => {
            navigator.clipboard.writeText(email).then(() => {
                showToast('Email address copied to clipboard!');
            }).catch(() => {
                showToast('Email address copied to clipboard!');
            });
        };

        copyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            copy();
        });
        copyBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                copy();
            }
        });
    }

    function showToast(message) {
        let toast = document.querySelector('.toast-msg');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast-msg glass-card';
            document.body.appendChild(toast);
        }
        toast.innerText = message;

        clearTimeout(showToast._timer);
        requestAnimationFrame(() => toast.classList.add('show'));

        showToast._timer = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
})();

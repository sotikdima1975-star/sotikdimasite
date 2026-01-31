// =====================================================================
// SOTIK FRONTEND – ПОЛНЫЙ СКРИПТ (~500 СТРОК)
// ПОДКЛЮЧЕН К BACKEND НА /api/*
// =====================================================================

document.addEventListener('DOMContentLoaded', () => {

    // =====================================================================
    // УТИЛИТЫ
    // =====================================================================

    const $ = (sel, scope = document) => scope.querySelector(sel);
    const $all = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

    const formatNumber = num => num.toLocaleString('ru-RU');

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    const throttle = (fn, delay) => {
        let last = 0;
        return (...args) => {
            const now = Date.now();
            if (now - last >= delay) {
                last = now;
                fn(...args);
            }
        };
    };

    // =====================================================================
    // ФИКСИРОВАННЫЙ ХЕДЕР ПРИ СКРОЛЛЕ
    // =====================================================================

    const header = $('header');
    if (header) {
        const onScrollHeader = throttle(() => {
            if (window.scrollY > 40) {
                header.classList.add('header--scrolled');
            } else {
                header.classList.remove('header--scrolled');
            }
        }, 50);

        window.addEventListener('scroll', onScrollHeader);
        onScrollHeader();
    }

    // =====================================================================
    // БУРГЕР-МЕНЮ
    // =====================================================================

    const burger = $('.js-burger');
    const nav = $('.js-nav');

    if (burger && nav) {
        burger.addEventListener('click', () => {
            const isOpen = nav.classList.toggle('nav--open');
            burger.classList.toggle('burger--open', isOpen);
            document.body.classList.toggle('no-scroll', isOpen);
        });

        $all('.js-nav a', nav).forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('nav--open');
                burger.classList.remove('burger--open');
                document.body.classList.remove('no-scroll');
            });
        });
    }

    // =====================================================================
    // ПЛАВНЫЙ СКРОЛЛ ПО ЯКОРЯМ
    // =====================================================================

    $all('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const targetId = link.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.scrollY - 80;

            window.scrollTo({
                top,
                behavior: 'smooth'
            });
        });
    });

    // =====================================================================
    // ТАБЫ (ОБО МНЕ / ПРАВИЛА / КОМАНДЫ и т.п.)
    // =====================================================================

    $all('.js-tabs').forEach(tabsRoot => {
        const buttons = $all('.js-tabs-btn', tabsRoot);
        const panels = $all('.js-tabs-panel', tabsRoot);

        const activateTab = id => {
            buttons.forEach(btn => {
                btn.classList.toggle('is-active', btn.dataset.tab === id);
            });
            panels.forEach(panel => {
                panel.classList.toggle('is-active', panel.dataset.tab === id);
            });
        };

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.tab;
                if (!id) return;
                activateTab(id);
            });
        });

        if (buttons[0] && buttons[0].dataset.tab) {
            activateTab(buttons[0].dataset.tab);
        }
    });

    // =====================================================================
    // МОДАЛКИ (ПРАВИЛА, ОПИСАНИЯ, ПОДСКАЗКИ)
    // =====================================================================

    const modalOverlay = $('.js-modal-overlay');

    const openModal = id => {
        const modal = document.getElementById(id);
        if (!modal || !modalOverlay) return;
        modalOverlay.classList.add('is-visible');
        modal.classList.add('is-visible');
        document.body.classList.add('no-scroll');
    };

    const closeModal = () => {
        if (!modalOverlay) return;
        modalOverlay.classList.remove('is-visible');
        $all('.js-modal').forEach(m => m.classList.remove('is-visible'));
        document.body.classList.remove('no-scroll');
    };

    if (modalOverlay) {
        modalOverlay.addEventListener('click', e => {
            if (e.target === modalOverlay || e.target.classList.contains('js-modal-close')) {
                closeModal();
            }
        });
    }

    $all('[data-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.modal;
            if (id) openModal(id);
        });
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeModal();
    });

    // =====================================================================
    // АНИМАЦИЯ КАРТОЧЕК (ПЕРКИ, БЛОКИ ИНФЫ)
    // =====================================================================

    $all('.js-card-tilt').forEach(card => {
        const strength = 10;

        const reset = () => {
            card.style.transform = '';
        };

        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            const rotX = clamp(-y / rect.height * strength, -strength, strength);
            const rotY = clamp(x / rect.width * strength, -strength, strength);

            card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(4px)`;
        });

        card.addEventListener('mouseleave', reset);
        card.addEventListener('blur', reset);
    });

    // =====================================================================
    // ЦЕЛЬ СТРИМА – /api/goal
    // =====================================================================

    const goalBar = $('#w-goal-bar');
    const goalTag = $('#w-goal-tag');
    const goalSub = $('#w-goal-sub');
    const goalTitle = $('#w-goal-title');
    const donateBtn = $('#w-goal-donate');

    function renderGoal(goal) {
        if (!goalBar || !goalTag || !goalSub) return;

        if (!goal) {
            goalBar.style.width = '0%';
            goalTag.textContent = '0% выполнено';
            goalSub.textContent = 'Цель не задана';
            if (goalTitle) goalTitle.textContent = 'Цель стрима';
            return;
        }

        const raised = goal.raised_amount || 0;
        const total = goal.goal_amount || 0;
        const percent = total > 0 ? Math.min(Math.round((raised / total) * 100), 100) : 0;

        goalBar.style.width = percent + '%';
        goalTag.textContent = percent + '% выполнено';
        goalSub.textContent =
            `Собрано: ${formatNumber(raised)}₽ / ${formatNumber(total)}₽`;

        if (goalTitle && goal.title) {
            goalTitle.textContent = goal.title;
        }
    }

    async function loadGoal() {
        if (!goalBar || !goalTag || !goalSub) return;

        try {
            const res = await fetch('/api/goal');
            const data = await res.json();

            if (!data.ok) {
                console.error('Ошибка ответа /api/goal:', data);
                renderGoal(null);
                return;
            }

            renderGoal(data.goal || null);

        } catch (e) {
            console.error('Ошибка загрузки цели /api/goal:', e);
            renderGoal(null);
        }
    }

    if (goalBar && goalTag && goalSub) {
        loadGoal();
        setInterval(loadGoal, 30000);
    }

    if (donateBtn) {
        donateBtn.addEventListener('click', () => {
            window.open('https://www.donationalerts.com/r/fsbsotik', '_blank');
        });
    }

    // =====================================================================
    // ПОСЛЕДНИЙ ДОНАТ – /api/donations/latest
    // =====================================================================

    const lastDonationBox = $('#last-donation');

    async function loadLatestDonation() {
        if (!lastDonationBox) return;

        try {
            const res = await fetch('/api/donations/latest');
            const data = await res.json();

            if (!data.ok || !data.latest) {
                lastDonationBox.textContent = 'Пока нет донатов';
                return;
            }

            const d = data.latest;
            const name = d.username || 'Аноним';
            const amount = d.amount || 0;
            const msg = d.message || '';

            lastDonationBox.textContent =
                `${name}: +${formatNumber(amount)}₽${msg ? ' — ' + msg : ''}`;

        } catch (e) {
            console.error('Ошибка /api/donations/latest:', e);
            lastDonationBox.textContent = 'Ошибка загрузки донатов';
        }
    }

    if (lastDonationBox) {
        loadLatestDonation();
        setInterval(loadLatestDonation, 15000);
    }

    // =====================================================================
    // СТАТИСТИКА – /api/stats
    // =====================================================================

    const statDaySum = $('#stat-day-sum');
    const statDayCount = $('#stat-day-count');
    const statMonthSum = $('#stat-month-sum');
    const statYearSum = $('#stat-year-sum');

    async function loadStats() {
        if (!statDaySum && !statDayCount && !statMonthSum && !statYearSum) return;

        try {
            const res = await fetch('/api/stats');
            const data = await res.json();

            if (!data.ok) {
                console.error('Ошибка ответа /api/stats:', data);
                return;
            }

            if (statDaySum) {
                statDaySum.textContent = formatNumber(data.day.sum || 0) + '₽';
            }
            if (statDayCount) {
                statDayCount.textContent = String(data.day.count || 0);
            }
            if (statMonthSum) {
                statMonthSum.textContent = formatNumber(data.month.sum || 0) + '₽';
            }
            if (statYearSum) {
                statYearSum.textContent = formatNumber(data.year.sum || 0) + '₽';
            }

        } catch (e) {
            console.error('Ошибка /api/stats:', e);
        }
    }

    if (statDaySum || statDayCount || statMonthSum || statYearSum) {
        loadStats();
        setInterval(loadStats, 60000);
    }

    // =====================================================================
    // ВИДЖЕТ СПИСКА ДОНАТОВ (ФРОНТ-ИМИТАЦИЯ ИЛИ ПОД /api/*, ЕСЛИ ДОПИШЕШЬ)
// =====================================================================

    const donationsList = $('.js-donations-list');
    const donationsEmpty = $('.js-donations-empty');

    async function loadDonationsList() {
        if (!donationsList) return;

        // Сейчас можно либо:
        // 1) использовать /api/donations/latest и просто показывать один,
        // 2) или позже добавить /api/donations/list в backend.
        // Пока сделаем простую заглушку, чтобы верстка жила.

        donationsList.innerHTML = '';
        if (donationsEmpty) {
            donationsEmpty.classList.add('is-visible');
        }
    }

    if (donationsList) {
        loadDonationsList();
    }

    // =====================================================================
    // КОПИРОВАНИЕ ССЫЛКИ НА ДОНАТ
    // =====================================================================

    const copyLinkBtn = $('.js-copy-donate-link');
    const DONATE_URL = 'https://www.donationalerts.com/r/fsbsotik';

    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(DONATE_URL);
                copyLinkBtn.classList.add('is-copied');
                copyLinkBtn.textContent = 'Ссылка скопирована';
                setTimeout(() => {
                    copyLinkBtn.classList.remove('is-copied');
                    copyLinkBtn.textContent = 'Скопировать ссылку';
                }, 2000);
            } catch (e) {
                console.error('Не удалось скопировать ссылку:', e);
            }
        });
    }

    // =====================================================================
    // ТЕМА (СВЕТЛАЯ / ТЁМНАЯ)
// =====================================================================

    const themeToggle = $('.js-theme-toggle');
    const THEME_KEY = 'sotik_theme';

    const applyTheme = theme => {
        document.documentElement.setAttribute('data-theme', theme);
    };

    const loadTheme = () => {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved === 'dark' || saved === 'light') {
            applyTheme(saved);
        } else {
            applyTheme('dark');
        }
    };

    const toggleTheme = () => {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem(THEME_KEY, next);
    };

    loadTheme();

    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // =====================================================================
    // СТАТУС СТРИМА (ФЕЙК, МОЖНО ПРИВЯЗАТЬ К BACKEND)
// =====================================================================

    const statusBadge = $('.js-stream-status');

    async function checkStreamStatus() {
        if (!statusBadge) return;

        try {
            // Здесь можно дергать твой backend, если сделаешь эндпоинт /api/stream-status
            // Пока — имитация по времени
            const hour = new Date().getHours();
            const isOnline = hour >= 18 && hour <= 23;

            statusBadge.textContent = isOnline ? 'ОНЛАЙН' : 'ОФФЛАЙН';
            statusBadge.classList.toggle('is-online', isOnline);
            statusBadge.classList.toggle('is-offline', !isOnline);

        } catch (e) {
            console.error('Ошибка проверки статуса стрима:', e);
        }
    }

    if (statusBadge) {
        checkStreamStatus();
        setInterval(checkStreamStatus, 60000);
    }

    // =====================================================================
    // СЧЁТЧИКИ (СТАТИСТИКА КАНАЛА, ПОДПИСЧИКИ И Т.П.)
// =====================================================================

    $all('.js-counter').forEach(counter => {
        const target = parseInt(counter.dataset.target || '0', 10);
        const duration = parseInt(counter.dataset.duration || '1200', 10);

        let start = 0;
        let startTime = null;

        function animate(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const value = Math.floor(progress * (target - start) + start);

            counter.textContent = formatNumber(value);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }

        requestAnimationFrame(animate);
    });

    // =====================================================================
    // ГОД В ФУТЕРЕ
    // =====================================================================

    const yearEl = $('.js-year');
    if (yearEl) {
        yearEl.textContent = String(new Date().getFullYear());
    }

});

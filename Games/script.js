(function() {
    // Основной скрипт сайта
    // Этот файл должен быть загружен с основного сервера
    
    // DonationAlerts интеграция
    window.DonationAlerts = {
        open: function(channel) {
            // Создаем модальное окно для DonationAlerts
            const modal = document.createElement('div');
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
            modal.style.display = 'flex';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';
            modal.style.zIndex = '1000';
            modal.style.backdropFilter = 'blur(10px)';

            const content = document.createElement('div');
            content.style.width = '90%';
            content.style.height = '90%';
            content.style.borderRadius = '15px';
            content.style.overflow = 'hidden';
            content.style.boxShadow = '0 0 30px rgba(0, 234, 255, 0.5)';

            const iframe = document.createElement('iframe');
            iframe.src = `https://www.donationalerts.com/r/${channel}`;
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allowtransparency', 'true');
            iframe.setAttribute('scrolling', 'no');
            iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-forms');
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';

            const closeBtn = document.createElement('button');
            closeBtn.textContent = 'Закрыть';
            closeBtn.style.position = 'absolute';
            closeBtn.style.top = '10px';
            closeBtn.style.right = '10px';
            closeBtn.style.padding = '8px 16px';
            closeBtn.style.fontSize = '12px';
            closeBtn.style.borderRadius = '8px';
            closeBtn.style.border = '1px solid #d4af37';
            closeBtn.style.backgroundColor = 'rgba(212, 175, 55, 0.2)';
            closeBtn.style.color = '#d4af37';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.zIndex = '1001';
            closeBtn.onclick = () => document.body.removeChild(modal);

            content.appendChild(iframe);
            modal.appendChild(content);
            modal.appendChild(closeBtn);
            document.body.appendChild(modal);
        }
    };

    // API для редиректа через dalink.to
    window.DonationRedirect = {
        getRedirectUrl: async function(source) {
            try {
                const response = await fetch('https://dalink.to/api/redirect/fsbsotik', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        source: source,
                        timestamp: new Date().toISOString()
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    return data.url || 'https://dalink.to/fsbsotik';
                }
            } catch (error) {
                console.warn('API redirect failed:', error);
            }
            
            return 'https://dalink.to/fsbsotik';
        }
    };

    // Сохраняем оригинальный DOMContentLoaded обработчик
    const originalDOMContentLoaded = document.addEventListener;
    
    // Переопределяем addEventListener для DOMContentLoaded
    document.addEventListener = function(event, callback) {
        if (event === 'DOMContentLoaded') {
            // Вызываем оригинальный обработчик
            originalDOMContentLoaded.call(this, event, callback);
        } else {
            // Для других событий просто вызываем оригинальный метод
            originalDOMContentLoaded.call(this, event, callback);
        }
    };

    // Вызываем оригинальный DOMContentLoaded обработчик
    document.dispatchEvent(new Event('DOMContentLoaded'));
})();

// Оригинальный скрипт сайта
(function() {
    document.addEventListener('DOMContentLoaded', () => {

// Оригинальный скрипт сайта
(function() {
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
    // ФИКСИРОВАННЫЙ ХЕДЕР
    // =====================================================================

    const header = $('header');
    if (header) {
        const onScrollHeader = throttle(() => {
            if (window.scrollY > 40) header.classList.add('header--scrolled');
            else header.classList.remove('header--scrolled');
        }, 50);

        window.addEventListener('scroll', onScrollHeader);
        onScrollHeader();
    }

    // =====================================================================
    // КНОПКА "СТРИМ" — ПОДМЕНЮ
    // =====================================================================

    const btnStream = $('#btn-stream');
    const submenuMain = $('#submenu-main');

    if (btnStream && submenuMain) {
        btnStream.addEventListener('click', (e) => {
            e.stopPropagation();
            submenuMain.classList.toggle('is-open');
        });

        document.addEventListener('click', (e) => {
            if (!submenuMain.contains(e.target) && e.target !== btnStream) {
                submenuMain.classList.remove('is-open');
            }
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

            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    // =====================================================================
    // ЦЕЛЬ СТРИМА — /api/goal
    // =====================================================================

    const goalBar = $('#w-goal-bar');
    const goalTag = $('#w-goal-tag');
    const goalSub = $('#w-goal-sub');
    const goalMain = $('#w-goal-main');

    function renderGoal(goal) {
        if (!goalBar || !goalTag || !goalSub || !goalMain) return;

        if (!goal) {
            goalBar.style.width = '0%';
            goalTag.textContent = '0% выполнено';
            goalSub.textContent = 'Цель не задана';
            goalMain.textContent = '';
            return;
        }

        const raised = goal.raised_amount || 0;
        const total = goal.goal_amount || 0;
        const percent = total > 0 ? Math.min(Math.round((raised / total) * 100), 100) : 0;

        goalBar.style.width = percent + '%';
        goalTag.textContent = percent + '% выполнено';
        goalSub.textContent = `Собрано: ${formatNumber(raised)}₽ / ${formatNumber(total)}₽`;
        goalMain.textContent = goal.title || '';
    }

    async function loadGoal() {
        try {
            const res = await fetch('/api/goal');
            const data = await res.json();
            renderGoal(data.ok ? data.goal : null);
        } catch {
            renderGoal(null);
        }
    }

    loadGoal();
    setInterval(loadGoal, 30000);

    // =====================================================================
    // ПОСЛЕДНИЙ ДОНАТ — /api/donations/latest
    // =====================================================================

    const lastDonationBox = $('#w-donates-main');
    const lastDonationSub = $('#w-donates-sub');

    async function loadLatestDonation() {
        if (!lastDonationBox || !lastDonationSub) return;

        try {
            const res = await fetch('/api/donations/latest');
            const data = await res.json();

            if (!data.ok || !data.latest) {
                lastDonationBox.textContent = 'Пока нет донатов';
                lastDonationSub.textContent = '';
                return;
            }

            const d = data.latest;
            lastDonationBox.textContent = `${d.username}: +${formatNumber(d.amount)}₽`;
            lastDonationSub.textContent = d.message || '';

        } catch {
            lastDonationBox.textContent = 'Ошибка загрузки';
            lastDonationSub.textContent = '';
        }
    }

    loadLatestDonation();
    setInterval(loadLatestDonation, 15000);

    // =====================================================================
    // СТАТИСТИКА — /api/stats
    // =====================================================================

    const dayMain = $('#w-day-main');
    const daySub = $('#w-day-sub');
    const monthMain = $('#w-month-main');
    const monthSub = $('#w-month-sub');
    const yearMain = $('#w-year-main');
    const yearSub = $('#w-year-sub');

    async function loadStats() {
        try {
            const res = await fetch('/api/stats');
            const data = await res.json();

            if (!data.ok) return;

            if (dayMain) dayMain.textContent = `${formatNumber(data.day.sum)}₽`;
            if (daySub) daySub.textContent = `${data.day.count} транзакций`;

            if (monthMain) monthMain.textContent = `${formatNumber(data.month.sum)}₽`;
            if (monthSub) monthSub.textContent = '';

            if (yearMain) yearMain.textContent = `${formatNumber(data.year.sum)}₽`;
            if (yearSub) yearSub.textContent = '';
        } catch {}
    }

    loadStats();
    setInterval(loadStats, 60000);

    // =====================================================================
    // ГОД В ФУТЕРЕ (если есть)
    // =====================================================================

    const yearEl = $('.js-year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

});

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

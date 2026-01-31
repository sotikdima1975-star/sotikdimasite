// =====================================================================
// ИНИЦИАЛИЗАЦИЯ ПОСЛЕ ЗАГРУЗКИ DOM
// =====================================================================

// Ждём полной загрузки HTML-структуры перед выполнением скриптов
document.addEventListener('DOMContentLoaded', () => {
    // =====================================================================
    // ОСНОВНЫЕ ЭЛЕМЕНТЫ ДЛЯ УПРАВЛЕНИЯ
    // =====================================================================

    // Получаем контейнеры плеера и чата для изменения их ширины
    const player = document.getElementById('player-container'); // Основной плеер Twitch
    const chat = document.getElementById('chat-container');     // Чат Twitch

    // Получаем выпадающие подменю
    const submenuMain = document.getElementById('submenu-main');     // Основное подменю "Стрим"
    const submenuWidgets = document.getElementById('submenu-widgets'); // Подменю "Виджеты"

    // Кнопки для открытия подменю
    const btnStream = document.getElementById('btn-stream');         // Кнопка "Стрим"
    const btnWidgets = document.getElementById('btn-widgets-toggle'); // Кнопка "Виджеты"

    // =====================================================================
    // ОТКРЫТИЕ/ЗАКРЫТИЕ ПОДМЕНЮ "СТРИМ"
    // =====================================================================

    // Добавляем обработчик клика на кнопку "Стрим"
    btnStream.addEventListener('click', (e) => {
        e.stopPropagation(); // Предотвращаем всплытие события, чтобы не закрывалось сразу

        // Проверяем, открыто ли основное подменю
        const isOpen = submenuMain.classList.contains('open');

        if (isOpen) {
            // Если открыто — закрываем оба меню
            submenuMain.classList.remove('open');
            submenuWidgets.classList.remove('open');
        } else {
            // Иначе открываем основное подменю
            submenuMain.classList.add('open');
        }
    });

    // =====================================================================
    // ПЕРЕКЛЮЧЕНИЕ ПОДМЕНЮ "ВИДЖЕТЫ"
    // =====================================================================

    // Обработчик клика по кнопке "Виджеты"
    btnWidgets.addEventListener('click', (e) => {
        e.stopPropagation(); // Не даём событию всплыть к document
        submenuWidgets.classList.toggle('open'); // Переключаем видимость подменю виджетов
    });

    // =====================================================================
    // ЗАКРЫТИЕ МЕНЮ ПРИ КЛИКЕ ВНЕ ЕГО
    // =====================================================================

    // Закрываем подменю, если клик произошёл вне них
    document.addEventListener('click', (e) => {
        // Если клик не по подменю и не по кнопке "Стрим" — закрываем
        if (!submenuMain.contains(e.target) && e.target !== btnStream) {
            submenuMain.classList.remove('open');
            submenuWidgets.classList.remove('open');
        }
    });

    // =====================================================================
    // УПРАВЛЕНИЕ ОТОБРАЖЕНИЕМ ПЛЕЕРА И ЧАТА
    // =====================================================================

    // Клик по пункту "Стрим" → стандартный режим: 70% плеер, 30% чат
    document.getElementById('btn-stream').onclick = () => {
        player.style.width = "70%"; // Плеер занимает 70%
        chat.style.width = "30%";   // Чат — 30%
    };

    // Клик по "Чат" → показать/скрыть чат
    document.getElementById('btn-chat').onclick = () => {
        const chatHidden = chat.style.width === "0%"; // Проверяем, скрыт ли чат
        chat.style.width = chatHidden ? "30%" : "0%"; // Переключаем ширину
        player.style.width = chatHidden ? "70%" : "100%"; // Плеер расширяется при скрытии чата
    };

    // Клик по "Плеер" → показать/скрыть плеер
    document.getElementById('btn-player').onclick = () => {
        const playerHidden = player.style.width === "0%"; // Проверяем, скрыт ли плеер
        player.style.width = playerHidden ? "70%" : "0%"; // Переключаем
        chat.style.width = playerHidden ? "30%" : "100%"; // Чат занимает всё место, если плеер скрыт
    };

    // =====================================================================
    // УПРАВЛЕНИЕ ВИДЖЕТАМИ: ПОКАЗ/СКРЫТИЕ
    // =====================================================================

    // Находим все ссылки в подменю виджетов
    document.querySelectorAll('.submenu-widgets a').forEach(btn => {
        // Назначаем каждому обработчик клика
        btn.onclick = () => {
            // Формируем ID блока виджета: например, data-widget="subs" → "w-subs"
            const id = 'w-' + btn.dataset.widget;
            const el = document.getElementById(id); // Получаем сам элемент виджета

            // Переключаем отображение: если виден — скрываем, иначе показываем
            el.style.display = (el.style.display === 'block') ? 'none' : 'block';
        };
    });

    // =====================================================================
    // ИНТЕГРАЦИЯ ЦЕЛИ СТРИМА С DONATIONALERTS
    // =====================================================================

    // Получаем элементы интерфейса цели
    const goalBar = document.getElementById('w-goal-bar');
    const goalTag = document.getElementById('w-goal-tag');
    const goalSub = document.getElementById('w-goal-sub');

    const GOAL_AMOUNT = 20000; // Цель в ₽

    // Функция получения суммы донатов
    async function fetchDonationTotal() {
        try {
            const response = await fetch('https://www.donationalerts.com/api/v1/alerts/donations', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxNjM1NCIsImp0aSI6ImY4NjAyOTBhMDJhNGRmNjk0YThjNGVhYTczZmZjOWQyYmFhNTcyNTUxNTkwMWQzYzBhZDBlNWFjZWNlODdkOTBmNzFiMDlkNzJiMTQyOTA0IiwiaWF0IjoxNzY5ODI0NTE1LjE3MDUsIm5iZiI6MTc2OTgyNDUxNS4xNzA1LCJleHAiOjE4MDEzNjA1MTUuMTYyNywic3ViIjoiMTMyMDgzOTEiLCJzY29wZXMiOlsib2F1dGgtZG9uYXRpb24taW5kZXgiLCJvYXV0aC1kb25hdGlvbi1zdWJzY3JpYmUiLCJvYXV0aC11c2VyLXNob3ciXX0.nx7EiEiaFGgCFgqsqCfG3Taf49tCcgOFhvaUErBaKoGKKtxV_wI58N7RhEoXanRdYsiY1OQbTFhQ0RKcKUYc0jB-HHK4v7L9_hSW5f9NKSnucEaK8phcyPHIR6TREf2YLgerDxKVCfE4ZWFoEke21BWf8TG8I0yp5CJLMzRr6iQOOxuUQJlM8sdI7jNzwtCGBY-0dluMPO9DBK8qEm5wsVu45rseFUCR35XPbxMYEtpszwuyXIAKTPSjHKsDz1sPsIVcgITR-OVuJeV-s8O9bgCUTAxn6RWAJKZ6IuSa9pesx5aCEbHNOx7kqPunRnjcEd1wAuKpYfOB14g_LfF5iSDpXe6ywiQSoJtfsBCGhhijDvG4BeyOZy34YuX1Jg81PpNjlWFWYsFTvgGTeHp-O-f0iDbqjCMof1uXjAcUEUhZYFOeACEIfGD9_xfTnftbwwsnueYn0QyVFZMoyW_452_IIvuwUYCN9XE1zusiBzqvcX5jtNaynCGNyaBZySsIPRq7mi5XXgqPyRfSQAUAUmpneucGFAaNDcQMQHXeYEHvbgW_SccjfOmFtshqnYBo-Uiqbx4ajC7MR8q282CingaUyOuZ1o253EpDfqIKk7jpSpO4rHjjAUTJru6KkBnnWpMU9vDszLu1bsCE4QrdYrPLg7BtDmE0W9UI_2vv5-Q',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Ошибка получения данных');

            const data = await response.json();

            // Суммируем все донаты
            const totalRaised = data.data.reduce((sum, donation) => sum + donation.amount, 0);

            // Обновляем интерфейс
            updateGoalProgress(totalRaised);
        } catch (error) {
            console.error('Ошибка загрузки донатов:', error);
            // При ошибке обновляем с имитацией (на случай оффлайна)
            updateGoalProgress(7400);
        }
    }

    // Обновление прогресса цели
    function updateGoalProgress(currentAmount) {
        const percent = Math.min((currentAmount / GOAL_AMOUNT) * 100, 100);

        goalBar.style.width = percent.toFixed(1) + '%';
        goalTag.textContent = percent.toFixed(1) + '% выполнено';
        goalSub.textContent = 'Собрано: ' + currentAmount.toLocaleString('ru-RU') + '₽ / ' + GOAL_AMOUNT.toLocaleString('ru-RU') + '₽';
    }

    // Первичная загрузка
    fetchDonationTotal();

    // Обновление каждые 30 секунд
    setInterval(fetchDonationTotal, 30000);


    // =====================================================================
    // КНОПКА ДОНАТА ВНУТРИ ВИДЖЕТА ЦЕЛИ
    // =====================================================================

    document.getElementById("w-goal-donate").onclick = () => {
        window.open("https://www.donationalerts.com/r/fsbsotik", "_blank");
    };
});

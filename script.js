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
    // АНИМАЦИЯ ПРОГРЕСС-БАРА ЦЕЛИ СТРИМА
    // =====================================================================

    // Получаем элементы прогресс-бара, тега и текста
    const goalBar = document.getElementById('w-goal-bar');   // Сама заполняющаяся полоса
    const goalTag = document.getElementById('w-goal-tag');   // Текст: "X% выполнено"
    const goalSub = document.getElementById('w-goal-sub');   // Текст: "Собрано: X₽ / Y₽"

    let goalPercent = 37; // Начальное значение прогресса (например, 37%)

    // Функция обновления состояния цели
    function updateGoal() {
        // Случайно изменяем процент на ±2 (для имитации динамики)
        goalPercent += (Math.random() * 4 - 2);

        // Ограничиваем диапазон от 5% до 100%
        if (goalPercent < 5) goalPercent = 5;
        if (goalPercent > 100) goalPercent = 100;

        // Обновляем ширину прогресс-бара
        goalBar.style.width = goalPercent.toFixed(0) + '%';

        // Обновляем текстовое отображение процента
        goalTag.textContent = goalPercent.toFixed(0) + '% выполнено';

        // Вычисляем сумму на основе процента (цель: 20 000₽)
        const total = 20000;
        const current = Math.round(total * goalPercent / 100);

        // Форматируем числа с пробелами (например: 7 400₽)
        goalSub.textContent = 'Собрано: ' + current.toLocaleString('ru-RU') + '₽ / ' + total.toLocaleString('ru-RU') + '₽';
    }

    // Выполняем первый вызов функции
    updateGoal();

    // Устанавливаем интервал: обновление каждые 5 секунд
    setInterval(updateGoal, 5000);
});

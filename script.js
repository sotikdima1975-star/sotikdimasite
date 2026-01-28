// Обновление времени стрима
function updateStreamTime() {
    const infoItems = document.querySelectorAll('.info-item');
    const timeElement = infoItems[2].querySelector('.info-value');
    let [hours, minutes, seconds] = timeElement.textContent.split(':').map(Number);

    seconds++;
    if (seconds >= 60) {
        seconds = 0;
        minutes++;
    }
    if (minutes >= 60) {
        minutes = 0;
        hours++;
    }

    timeElement.textContent =
        `${hours.toString().padStart(2, '0')}:` +
        `${minutes.toString().padStart(2, '0')}:` +
        `${seconds.toString().padStart(2, '0')}`;
}

setInterval(updateStreamTime, 1000);

// Имитация изменения количества зрителей
setInterval(() => {
    const infoItems = document.querySelectorAll('.info-item');
    const viewersElement = infoItems[0].querySelector('.info-value');
    let viewers = parseInt(viewersElement.textContent.replace(',', ''));
    const change = Math.random() > 0.5 ? 1 : -1;
    viewers = Math.max(100, viewers + change);
    viewersElement.textContent = viewers.toLocaleString();
}, 30000);

// Инструкция по настройке
console.log(`
============================================
ИНСТРУКЦИЯ ПО НАСТРОЙКЕ TWITCH ПЛЕЕРА И ЧАТА:

1. ЗАМЕНИТЕ "fsbsotik" на ваш реальный никнейм Twitch:
   - В iframe плеера
   - В iframe чата
   - В ссылках социальных сетей

2. ДОБАВЬТЕ ВАШ ДОМЕН в Twitch Dashboard:
   - Зайдите в Twitch Developer Console
   - Ваше приложение → Настройки
   - В поле "Domain" добавьте ваш домен
   - Добавьте sotikdima1975-star.github.io для GitHub Pages

3. ОБНОВИТЕ АВАТАР И ИНФОРМАЦИЮ:
   - Замените ссылку на аватар
   - Обновите описание канала
   - Обновите социальные ссылки

============================================
`);

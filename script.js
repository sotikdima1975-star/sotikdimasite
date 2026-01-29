/* ================================
   TWITCH STREAM INFO (TITLE + GAME)
   ================================ */

const TWITCH_CLIENT_ID = "ТВОЙ_CLIENT_ID";          /* Client-ID */
const TWITCH_OAUTH     = "Bearer ТВОЙ_OAUTH_TOKEN"; /* OAuth Token */
const TWITCH_USER      = "fsbsotik";                /* Канал */

const streamTitleEl = document.getElementById("stream-title"); /* Элемент названия */
const gameTitleEl   = document.getElementById("game-title");   /* Элемент игры */

async function loadStreamInfo() {
    try {
        const r = await fetch(
            `https://api.twitch.tv/helix/streams?user_login=${TWITCH_USER}`,
            {
                headers: {
                    "Client-ID": TWITCH_CLIENT_ID,
                    "Authorization": TWITCH_OAUTH
                }
            }
        );

        const j = await r.json();

        if (!j.data || j.data.length === 0) {
            streamTitleEl.textContent = "Название стрима: Оффлайн"; /* Оффлайн */
            gameTitleEl.textContent   = "Игра: —";
            return;
        }

        const s = j.data[0]; /* Данные стрима */

        streamTitleEl.textContent = "Название стрима: " + s.title;     /* Название */
        gameTitleEl.textContent   = "Игра: " + s.game_name;            /* Игра */

    } catch (e) {
        streamTitleEl.textContent = "Название стрима: Ошибка";
        gameTitleEl.textContent   = "Игра: —";
    }
}

loadStreamInfo();
setInterval(loadStreamInfo, 30000); /* Обновление каждые 30 сек */


/* ================================
   КАСТОМНЫЙ TWITCH ЧАТ (WS CLIENT)
   ================================ */

const chatMessagesEl = document.getElementById("chat-messages");
const chatInputEl    = document.getElementById("chat-input");
const chatSendBtn    = document.getElementById("chat-send");

const CHAT_WS_URL = "ws://localhost:8765"; /* Адрес WS сервера */

let chatSocket = null;

function connectChat() {
    chatSocket = new WebSocket(CHAT_WS_URL);

    chatSocket.addEventListener("open", () => {});

    chatSocket.addEventListener("message", (event) => {
        const d = JSON.parse(event.data);

        if (d.type === "message") {
            appendChatMessage(d.user, d.text); /* Сообщение */
        }

        if (d.type === "donation") {
            appendDonationMessage(d.user, d.amount, d.text); /* Донат */
        }
    });

    chatSocket.addEventListener("close", () => {
        setTimeout(connectChat, 3000); /* Реконнект */
    });
}

function appendChatMessage(user, text) {
    const row = document.createElement("div");
    row.className = "chat-message";

    const u = document.createElement("span");
    u.className = "chat-message-user";
    u.textContent = user + ":";

    const t = document.createElement("span");
    t.className = "chat-message-text";
    t.textContent = " " + text;

    row.appendChild(u);
    row.appendChild(t);

    chatMessagesEl.appendChild(row);
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

function appendDonationMessage(user, amount, text) {
    const row = document.createElement("div");
    row.className = "chat-message";

    const u = document.createElement("span");
    u.className = "chat-message-user";
    u.textContent = `💸 ${user} → ${amount}:`;

    const t = document.createElement("span");
    t.className = "chat-message-text";
    t.textContent = " " + text;

    row.appendChild(u);
    row.appendChild(t);

    chatMessagesEl.appendChild(row);
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

function sendChatMessage() {
    const text = chatInputEl.value.trim();
    if (!text || !chatSocket || chatSocket.readyState !== WebSocket.OPEN) return;

    chatSocket.send(JSON.stringify({ type: "send", text }));
    chatInputEl.value = "";
}

chatSendBtn.addEventListener("click", sendChatMessage);
chatInputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendChatMessage();
});

connectChat();

/* ================================
   TWITCH OAUTH (Implicit Flow)
   ================================ */

const TWITCH_CLIENT_ID = "740trga0mupauu3c4guqnw0i03iocm";
const TWITCH_REDIRECT_URI = "https://sotikdima1975-star.github.io";
const TWITCH_SCOPES = ["user:read:email"].join(" ");
const TWITCH_USER_LOGIN = "fsbsotik";

/* ================================
   ПОЛУЧЕНИЕ ТОКЕНА ИЗ URL (#access_token)
   ================================ */

function extractTokenFromHash() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token = params.get("access_token");
/* ================================
   TWITCH OAUTH (Implicit Flow)
   ================================ */

const TWITCH_CLIENT_ID = "740trga0mupauu3c4guqnw0i03iocm";
const TWITCH_REDIRECT_URI = "https://sotikdima1975-star.github.io";
const TWITCH_SCOPES = "user:read:email";
const TWITCH_USER_LOGIN = "fsbsotik";

/* ================================
   ПОЛУЧЕНИЕ ТОКЕНА ИЗ URL (#access_token)
   ================================ */

function extractTokenFromHash() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token = params.get("access_token");

    if (token) {
        localStorage.setItem("twitch_access_token", token);
        localStorage.setItem("twitch_token_expiry", Date.now() + 3600 * 1000);

        // Убираем токен из URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

function getToken() {
    const token = localStorage.getItem("twitch_access_token");
    const expiry = localStorage.getItem("twitch_token_expiry");

    if (!token || Date.now() > expiry) {
        return null;
    }
    return token;
}

/* ================================
   АВТОРИЗАЦИЯ
   ================================ */

function loginWithTwitch() {
    const authUrl =
        `https://id.twitch.tv/oauth2/authorize` +
        `?client_id=${TWITCH_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(TWITCH_REDIRECT_URI)}` +
        `&response_type=token` +
        `&scope=${encodeURIComponent(TWITCH_SCOPES)}`;

    window.location = authUrl;
}

/* ================================
   IRC CHAT (Twitch IRC WebSocket)
   ================================ */

const IRC_URL = "wss://irc-ws.chat.twitch.tv:443";
let ircSocket = null;

function connectIRC() {
    const token = getToken();
    if (!token) {
        console.warn("Нет токена — чат не подключается");
        return;
    }

    ircSocket = new WebSocket(IRC_URL);

    ircSocket.onopen = () => {
        console.log("IRC: соединение установлено");

        ircSocket.send("CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership");
        ircSocket.send(`PASS oauth:${token}`);
        ircSocket.send(`NICK ${TWITCH_USER_LOGIN}`);
        ircSocket.send(`JOIN #${TWITCH_USER_LOGIN}`);
    };

    ircSocket.onmessage = (event) => {
        const msg = event.data.trim();

        if (msg.startsWith("PING")) {
            ircSocket.send("PONG :tmi.twitch.tv");
            return;
        }

        if (msg.includes("PRIVMSG")) {
            const parsed = parseIRCMessage(msg);
            if (parsed) appendChatMessage(parsed.user, parsed.text);
        }
    };

    ircSocket.onclose = () => {
        console.warn("IRC: соединение закрыто — переподключение...");
        setTimeout(connectIRC, 3000);
    };

    ircSocket.onerror = (err) => {
        console.error("IRC: ошибка", err);
    };
}

function parseIRCMessage(raw) {
    try {
        const tagPart = raw.startsWith("@") ? raw.split(" ")[0] : "";
        const msgPartIndex = raw.indexOf("PRIVMSG");
        if (msgPartIndex === -1) return null;

        const msgPart = raw.substring(msgPartIndex);
        const user = /display-name=([^;]+)/.exec(tagPart)?.[1] || "Unknown";
        const text = msgPart.split(" :")[1] || "";

        return { user, text };
    } catch {
        return null;
    }
}

function appendChatMessage(user, text) {
    const chat = document.getElementById("chat-messages");
    if (!chat) return;

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

    chat.appendChild(row);
    chat.scrollTop = chat.scrollHeight;
}

/* ================================
   СТАРТ ПРИ ЗАГРУЗКЕ
   ================================ */

document.addEventListener("DOMContentLoaded", () => {
    extractTokenFromHash();

    const token = getToken();
    if (token) {
        console.log("Twitch OAuth активен");
        connectIRC();
    } else {
        console.log("Нет токена — нажмите 'Войти через Twitch'");
    }
});

    if (token) {
        localStorage.setItem("twitch_access_token", token);
        localStorage.setItem("twitch_token_expiry", Date.now() + 3600 * 1000);

        // Убираем токен из URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

function getToken() {
    const token = localStorage.getItem("twitch_access_token");
    const expiry = localStorage.getItem("twitch_token_expiry");

    if (!token || Date.now() > expiry) {
        return null;
    }
    return token;
}

/* ================================
   АВТОРИЗАЦИЯ
   ================================ */

function loginWithTwitch() {
    const authUrl =
        `https://id.twitch.tv/oauth2/authorize` +
        `?client_id=${TWITCH_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(TWITCH_REDIRECT_URI)}` +
        `&response_type=token` +
        `&scope=${encodeURIComponent(TWITCH_SCOPES)}`;

    window.location = authUrl;
}

/* ================================
   IRC CHAT (Twitch IRC WebSocket)
   ================================ */

const IRC_URL = "wss://irc-ws.chat.twitch.tv:443";
let ircSocket = null;

function connectIRC() {
    const token = getToken();
    if (!token) return;

    ircSocket = new WebSocket(IRC_URL);

    ircSocket.onopen = () => {
        console.log("IRC: соединение установлено");

        ircSocket.send("CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership");
        ircSocket.send(`PASS oauth:${token}`);
        ircSocket.send(`NICK ${TWITCH_USER_LOGIN}`);
        ircSocket.send(`JOIN #${TWITCH_USER_LOGIN}`);
    };

    ircSocket.onmessage = (event) => {
        const msg = event.data.trim();

        if (msg.startsWith("PING")) {
            ircSocket.send("PONG :tmi.twitch.tv");
            return;
        }

        if (msg.includes("PRIVMSG")) {
            const parsed = parseIRCMessage(msg);
            if (parsed) appendChatMessage(parsed.user, parsed.text);
        }
    };

    ircSocket.onclose = () => {
        console.warn("IRC: соединение закрыто, переподключение...");
        setTimeout(connectIRC, 3000);
    };
}

function parseIRCMessage(raw) {
    try {
        const tagPart = raw.startsWith("@") ? raw.split(" ")[0] : "";
        const msgPart = raw.substring(raw.indexOf("PRIVMSG"));

        const user = /display-name=([^;]+)/.exec(tagPart)?.[1] || "Unknown";
        const text = msgPart.split(" :")[1] || "";

        return { user, text };
    } catch {
        return null;
    }
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

    const chatMessagesEl = document.getElementById("chat-messages");
    chatMessagesEl.appendChild(row);
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

/* ================================
   СТАРТ ПРИ ЗАГРУЗКЕ
   ================================ */

document.addEventListener("DOMContentLoaded", () => {
    extractTokenFromHash();

    const token = getToken();
    if (token) {
        console.log("Twitch OAuth активен");
        connectIRC();
    }
});

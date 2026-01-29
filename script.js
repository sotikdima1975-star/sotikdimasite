/* ================================
   TWITCH OAUTH (IMPLICIT FLOW) ДЛЯ GITHUB PAGES
   ================================ */

// ТВОЙ PUBLIC CLIENT ID (из панели Twitch)
const TWITCH_CLIENT_ID = "740trga0mupauu3c4guqnw0i03iocm";

// ДОЛЖЕН СОВПАДАТЬ С OAuth Redirect URL В КОНСОЛИ TWITCH
const TWITCH_REDIRECT_URI = "https://sotikdima1975-star.github.io";

// СКОУПЫ — при желании расширишь
const TWITCH_SCOPES = [
    "user:read:email"
].join(" ");

// Имя канала (для стрима)
const TWITCH_USER_LOGIN = "fsbsotik";

/* ================================
   ЭЛЕМЕНТЫ ИНТЕРФЕЙСА
   ================================ */

const streamTitleEl = document.getElementById("stream-title");
const gameTitleEl   = document.getElementById("detail-game");
const viewersEl     = document.getElementById("detail-viewers");
const statusEl      = document.getElementById("detail-status");
const startedEl     = document.getElementById("detail-started");
const durationEl    = document.getElementById("detail-duration");
const languageEl    = document.getElementById("detail-language");
const gameIdEl      = document.getElementById("detail-game-id");
const streamIdEl    = document.getElementById("detail-stream-id");

const loginBtn      = document.getElementById("twitch-login");
const userLabelEl   = document.getElementById("twitch-user-label");

/* ================================
   ХРАНЕНИЕ ТОКЕНА
   ================================ */

function saveToken(token, expiresIn) {
    const expiresAt = Date.now() + expiresIn * 1000;
    localStorage.setItem("twitch_access_token", token);
    localStorage.setItem("twitch_token_expires_at", String(expiresAt));
}

function getToken() {
    const token = localStorage.getItem("twitch_access_token");
    const expiresAt = Number(localStorage.getItem("twitch_token_expires_at") || "0");
    if (!token || !expiresAt) return null;
    if (Date.now() > expiresAt) {
        localStorage.removeItem("twitch_access_token");
        localStorage.removeItem("twitch_token_expires_at");
        return null;
    }
    return token;
}

/* ================================
   РАЗБОР ХЭША ПОСЛЕ REDIRECT
   ================================ */

function parseHashFragment() {
    if (!window.location.hash || window.location.hash.length < 2) return null;

    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);

    const accessToken = params.get("access_token");
    const tokenType   = params.get("token_type");
    const expiresIn   = params.get("expires_in");

    if (!accessToken || !tokenType) return null;

    history.replaceState(null, "", window.location.pathname + window.location.search);

    return {
        accessToken,
        tokenType,
        expiresIn: expiresIn ? Number(expiresIn) : 0
    };
}

/* ================================
   ЗАПУСК OAUTH
   ================================ */

function startTwitchOAuth() {
    const params = new URLSearchParams({
        client_id: TWITCH_CLIENT_ID,
        redirect_uri: TWITCH_REDIRECT_URI,
        response_type: "token",
        scope: TWITCH_SCOPES,
        force_verify: "true"
    });

    const url = `https://id.twitch.tv/oauth2/authorize?${params.toString()}`;
    window.location.href = url;
}

/* ================================
   ЗАПРОС К TWITCH API
   ================================ */

async function twitchApi(path) {
    const token = getToken();
    if (!token) throw new Error("Нет токена Twitch");

    const r = await fetch(`https://api.twitch.tv/helix/${path}`, {
        headers: {
            "Client-ID": TWITCH_CLIENT_ID,
            "Authorization": `Bearer ${token}`
        }
    });

    if (!r.ok) {
        throw new Error("Twitch API error: " + r.status);
    }

    return await r.json();
}

/* ================================
   ЗАГРУЗКА ИНФОРМАЦИИ О СТРИМЕ
   ================================ */

async function loadStreamInfo() {
    try {
        const j = await twitchApi(`streams?user_login=${TWITCH_USER_LOGIN}`);

        if (!j.data || j.data.length === 0) {
            streamTitleEl.textContent = "Название стрима: Оффлайн";
            gameTitleEl.textContent   = "—";
            viewersEl.textContent     = "—";
            statusEl.textContent      = "Оффлайн";
            startedEl.textContent     = "—";
            durationEl.textContent    = "—";
            languageEl.textContent    = "—";
            gameIdEl.textContent      = "—";
            streamIdEl.textContent    = "—";
            return;
        }

        const s = j.data[0];

        streamTitleEl.textContent = "Название стрима: " + s.title;
        gameTitleEl.textContent   = s.game_name;
        viewersEl.textContent     = s.viewer_count;
        statusEl.textContent      = "Онлайн";
        startedEl.textContent     = new Date(s.started_at).toLocaleString();
        languageEl.textContent    = s.language;
        gameIdEl.textContent      = s.game_id;
        streamIdEl.textContent    = s.id;

        const start = new Date(s.started_at);
        const now = new Date();
        const diff = Math.floor((now - start) / 1000);

        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        const sec = diff % 60;

        durationEl.textContent =
            `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;

    } catch (e) {
        console.error(e);
        streamTitleEl.textContent = "Название стрима: Ошибка";
        gameTitleEl.textContent   = "—";
    }
}

/* ================================
   ЗАГРУЗКА ИНФЫ О ПОЛЬЗОВАТЕЛЕ
   ================================ */

async function loadUserInfo() {
    try {
        const j = await twitchApi(`users`);
        if (!j.data || j.data.length === 0) {
            userLabelEl.textContent = "Авторизован, но без данных";
            return;
        }
        const u = j.data[0];
        userLabelEl.textContent = `Twitch: ${u.display_name}`;
    } catch (e) {
        console.error(e);
        userLabelEl.textContent = "Ошибка загрузки профиля";
    }
}

/* ================================
   ИНИЦИАЛИЗАЦИЯ
   ================================ */

function init() {
    const hashData = parseHashFragment();
    if (hashData && hashData.accessToken) {
        saveToken(hashData.accessToken, hashData.expiresIn || 3600);
    }

    const token = getToken();

    if (!token) {
        if (userLabelEl) userLabelEl.textContent = "Не авторизован";
    } else {
        if (userLabelEl) userLabelEl.textContent = "Загрузка профиля…";
        loadUserInfo();
        loadStreamInfo();
        setInterval(loadStreamInfo, 30000);
    }

    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            startTwitchOAuth();
        });
    }
}

document.addEventListener("DOMContentLoaded", init);

console.log("Twitch OAuth (Implicit) активен, Client ID вставлен.");

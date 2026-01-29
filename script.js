/* ================================
   TWITCH STREAM INFO
   ================================ */

const TWITCH_CLIENT_ID = "ТВОЙ_CLIENT_ID";
const TWITCH_OAUTH     = "Bearer ТВОЙ_OAUTH_TOKEN";
const TWITCH_USER      = "fsbsotik";

const streamTitleEl = document.getElementById("stream-title");
const gameTitleEl   = document.getElementById("detail-game");
const viewersEl     = document.getElementById("detail-viewers");
const statusEl      = document.getElementById("detail-status");
const startedEl     = document.getElementById("detail-started");
const durationEl    = document.getElementById("detail-duration");
const languageEl    = document.getElementById("detail-language");
const gameIdEl      = document.getElementById("detail-game-id");
const streamIdEl    = document.getElementById("detail-stream-id");

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
        streamTitleEl.textContent = "Название стрима: Ошибка";
        gameTitleEl.textContent   = "—";
    }
}

loadStreamInfo();
setInterval(loadStreamInfo, 30000);

/* ================================
   ЧАТ ОТКЛЮЧЁН (GITHUB PAGES НЕ ПОДДЕРЖИВАЕТ WS)
   ================================ */

console.log("WebSocket чат отключён: GitHub Pages не поддерживает серверы.");

import requests
import time
import subprocess
import sys

CLIENT_ID = "740trga0mupauu3c4guqnw0i03iocm"
CLIENT_SECRET = "jr63ul846ssx5fa8cf0m43vrmxwfmc"
CHANNEL = "fsbsotik"

HTML_FILE = "index.html"
CHECK_INTERVAL = 30


def get_token():
    url = "https://id.twitch.tv/oauth2/token"
    params = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "grant_type": "client_credentials"
    }

    resp = requests.post(url, params=params)
    data = resp.json()

    if "access_token" not in data:
        print("Ошибка получения токена:", data)
        sys.exit(1)

    return data["access_token"]


def get_viewers(token):
    url = "https://api.twitch.tv/helix/streams"
    params = {"user_login": CHANNEL}

    headers = {
        "Client-ID": CLIENT_ID,
        "Authorization": "Bearer " + token
    }

    resp = requests.get(url, headers=headers, params=params)
    data = resp.json()

    if data.get("data"):
        return data["data"][0].get("viewer_count", 0)
    else:
        return 0


def update_html(viewers):
    try:
        with open(HTML_FILE, "r", encoding="utf-8") as f:
            html = f.read()
    except FileNotFoundError:
        print("Файл index.html не найден.")
        sys.exit(1)

    start_tag = '<div class="info-value">'
    end_tag = '</div>'

    start_index = html.find(start_tag)
    if start_index == -1:
        print("Не найден info-value.")
        sys.exit(1)

    start_index += len(start_tag)
    end_index = html.find(end_tag, start_index)

    if end_index == -1:
        print("Не найден закрывающий </div>.")
        sys.exit(1)

    new_html = html[:start_index] + str(viewers) + html[end_index:]

    with open(HTML_FILE, "w", encoding="utf-8") as f:
        f.write(new_html)

    print("HTML обновлён: зрители =", viewers)


def git_push():
    # Проверяем, есть ли изменения
    status = subprocess.run(
        ["git", "status", "--porcelain"],
        capture_output=True,
        text=True
    )

    if status.stdout.strip() == "":
        print("Изменений нет — пропускаю commit/push.")
        return

    subprocess.run(["git", "add", HTML_FILE], check=True)
    subprocess.run(["git", "commit", "-m", "Auto update viewers"], check=True)
    subprocess.run(["git", "push"], check=True)
    print("Изменения отправлены на GitHub.")


def main():
    print("Получаем токен Twitch…")
    token = get_token()
    print("Токен получен.")

    while True:
        viewers = get_viewers(token)
        print("Зрителей сейчас:", viewers)

        update_html(viewers)

        try:
            git_push()
        except subprocess.CalledProcessError as e:
            print("Ошибка git:", e)

        print("Ожидаем", CHECK_INTERVAL, "секунд…")
        time.sleep(CHECK_INTERVAL)


if __name__ == "__main__":
    main()

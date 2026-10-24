# Заявки на ремонт в общежитии

Веб-приложение для регистрации ремонтных заявок, назначения исполнителей, изменения статусов и формирования отчётов. Backend: Python и FastAPI; frontend: React и TypeScript; БД: PostgreSQL 17.

## Windows 10: первый запуск

Все команды выполняются в PowerShell, если не указано иное. Нужны Git, Docker Desktop с Linux-контейнерами и WSL 2. Установленная редакция и сборка Windows должны соответствовать текущим требованиям Docker Desktop; для неподдерживаемой Windows используйте поддерживаемую ОС или Debian.

1. Установите [Git for Windows](https://git-scm.com/downloads/win).
2. Включите аппаратную виртуализацию в BIOS/UEFI.
3. Если WSL отсутствует, в PowerShell от имени администратора выполните:

   ```powershell
   wsl --install
   ```

4. Перезагрузите компьютер, если этого требует установка. Выполните:

   ```powershell
   wsl --update
   wsl --version
   ```

5. Установите [Docker Desktop](https://docs.docker.com/desktop/setup/install/windows-install/), выберите WSL 2 и Linux-контейнеры. Запустите Docker Desktop и дождитесь готовности Engine.
6. В новом окне PowerShell проверьте:

   ```powershell
   git --version
   docker version
   docker compose version
   ```

В выводе `docker version` должны присутствовать Client и Server.

### Получение проекта

В каталоге для своих проектов выполните:

```powershell
git clone https://github.com/evgen1ck/dorm-repair-requests.git
cd dorm-repair-requests
Copy-Item .env.example .env
```

Создайте случайный секрет для подписи токенов. Следующие команды совместимы с Windows PowerShell 5.1:

```powershell
$secretBytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($secretBytes)
$rng.Dispose()
$secret = -join ($secretBytes | ForEach-Object { $_.ToString("x2") })
(Get-Content .env) -replace '^SECRET_KEY=.*$', "SECRET_KEY=$secret" | Set-Content -Encoding ASCII .env
notepad .env
```

В открывшемся файле замените стандартный `POSTGRES_PASSWORD=postgres` собственным паролем. Для проекта в Омске установите `TIMEZONE=Asia/Omsk`. Сгенерированный `SECRET_KEY` не меняйте при каждом запуске. Файл должен называться именно `.env`, не `.env.txt`.

### Сборка и запуск

В корне репозитория:

```powershell
docker compose config --quiet
docker compose up -d --build --wait --wait-timeout 180
docker compose ps -a
docker compose exec backend python -m backend.cli db seed
```

Первое скачивание образов и сборка могут занять несколько минут. Миграции выполняются автоматически. Завершение сервиса `migrate` с кодом 0 нормально.

Откройте http://localhost:8000. Теперь в приложении есть собственная форма входа. Учётные записи приведены ниже.

Проверка API:

```powershell
Invoke-RestMethod http://localhost:8000/api/v1/health
```

Ожидается `status: ok`.

## Debian: первый запуск

Команды выполняются в Bash. Для команд Docker ниже используется `sudo`; при работе от root его можно опустить. Инструкция установки рассчитана на Debian 12/13. Если Docker и Compose уже работают, повторная установка не нужна.

Для чистой системы добавить официальный репозиторий Docker:

```bash
sudo apt update
sudo apt install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

sudo tee /etc/apt/sources.list.d/docker.sources >/dev/null <<EOF_DOCKER
Types: deb
URIs: https://download.docker.com/linux/debian
Suites: $(. /etc/os-release && echo "$VERSION_CODENAME")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF_DOCKER

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
sudo docker run --rm hello-world
sudo docker compose version
```

Если ранее установлены `docker.io`, старый `docker-compose` или конфликтующие пакеты, сначала изучить порядок перехода в [официальной инструкции для Debian](https://docs.docker.com/engine/install/debian/). Команды выше рассчитаны на установку без таких конфликтов.

В этой инструкции Docker запускается через `sudo`, поэтому добавлять пользователя в группу `docker` не требуется.

### Получение проекта и настройка

```bash
git clone https://github.com/evgen1ck/dorm-repair-requests.git
cd dorm-repair-requests
cp .env.example .env
chmod 600 .env
sudo apt install -y openssl nano
sed -i "s/^SECRET_KEY=.*/SECRET_KEY=$(openssl rand -hex 32)/" .env
nano .env
```

Установите собственный `POSTGRES_PASSWORD`. Для Омска задайте `TIMEZONE=Asia/Omsk`.

### Сборка и запуск

```bash
sudo docker compose config --quiet
sudo docker compose up -d --build --wait --wait-timeout 180
sudo docker compose ps -a
sudo docker compose exec backend python -m backend.cli db seed
curl -fsS http://localhost:8000/api/v1/health
```

При работе на самой машине откройте http://localhost:8000. Если Debian находится на удалённом сервере, адрес localhost в браузере относится к вашему компьютеру, а не к серверу.

## Демонстрационные учётные записи

После `db seed` на новой базе доступны:

| Роль | Логин | Пароль |
| --- | --- | --- |
| Жилец | `ivan` | `ivan` |
| Диспетчер | `dispatcher` | `dispatcher` |
| Мастер | `master` | `master` |
| Администратор | `admin` | `admin` |

Это тестовые пароли для учебной демонстрации, не для эксплуатации с реальными данными.

Команда добавляет отсутствующих пользователей по логину, но не меняет пароли уже существующих. Четыре демонстрационных помещения создаются только тогда, когда таблица помещений пуста. Частично заполненный список помещений автоматически не дополняется. Заявки создаются через интерфейс.

Роли проверяются сервером. В этой версии уже не используется прежний фиксированный ID жильца: пользователь определяется после входа.

## Настройки окружения

| Параметр | Назначение |
| --- | --- |
| `SECRET_KEY` | Обязательный секрет подписи токенов. Используйте случайное значение, например 32 случайных байта в шестнадцатеричном виде |
| `POSTGRES_USER` | Пользователь PostgreSQL; по умолчанию `postgres` |
| `POSTGRES_PASSWORD` | Пароль PostgreSQL |
| `POSTGRES_DB` | Имя базы; по умолчанию `dormitory` |
| `TIMEZONE` | Часовой пояс приложения; в примере `Europe/Moscow`, для Омска `Asia/Omsk` |
| `NGINX_PORT` | Порт интерфейса; по умолчанию 8000 |
| `LOG_LEVEL` | Уровень журналирования; по умолчанию INFO |
| `POSTGRES_HOST`, `POSTGRES_PORT` | Для запуска вне Docker. В Compose серверу явно передаются `db` и `5432` |

Сохраните `.env` отдельно от репозитория. Не публикуйте его и резервные копии БД в GitHub. Изменение секрета делает ранее выданные токены недействительными.

Замена пароля в `.env` не меняет пароль пользователя внутри уже созданной PostgreSQL. Изменения нужно согласовывать с существующей БД.

Для локального HTTP используются cookie без признака Secure. При размещении за HTTPS настройка `COOKIE_SECURE=true` должна быть явно передана в `backend.environment` через Compose. Одной строки в `.env` недостаточно: текущий Compose не передаёт эту переменную автоматически.

## Сервисы и данные

- `db`: PostgreSQL 17, данные сохраняются в томе `pgdata`.
- `migrate`: применяет миграции и завершает работу.
- `backend`: FastAPI.
- `frontend`: Nginx, собранный интерфейс, проксирование `/api/`.

БД и backend не публикуются напрямую на хост. Порт frontend по умолчанию опубликован на всех интерфейсах компьютера. Доступ из сети зависит от её настроек.
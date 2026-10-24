from backend.infrastructure.db.models import UserRole


async def test_login_sets_cookie_and_returns_user(client, resident, password):
    response = await client.post(
        "/api/v1/auth/login", json={"login": resident.login, "password": password}
    )
    assert response.status_code == 200
    assert response.json() == {
        "id": resident.id,
        "login": "ivan",
        "full_name": "Ivan",
        "phone": None,
        "role": "resident",
        "is_active": True,
    }
    cookie = response.headers["set-cookie"]
    assert cookie.startswith("access_token=")
    assert "HttpOnly" in cookie
    assert "SameSite=lax" in cookie

    me = await client.get("/api/v1/auth/me")
    assert me.status_code == 200
    assert me.json() == response.json()


async def test_wrong_password_is_rejected(client, resident):
    response = await client.post(
        "/api/v1/auth/login", json={"login": resident.login, "password": "wrong"}
    )
    assert response.status_code == 401
    assert response.json() == {"detail": "Неверный логин или пароль"}


async def test_password_longer_than_bcrypt_limit_is_rejected(client, resident):
    response = await client.post(
        "/api/v1/auth/login", json={"login": resident.login, "password": "я" * 40}
    )
    assert response.status_code == 422


async def test_unknown_login_is_rejected(client, password):
    response = await client.post(
        "/api/v1/auth/login", json={"login": "nobody", "password": password}
    )
    assert response.status_code == 401


async def test_inactive_user_cannot_login(client, make_user, password):
    user = await make_user(UserRole.RESIDENT, is_active=False)
    response = await client.post(
        "/api/v1/auth/login", json={"login": user.login, "password": password}
    )
    assert response.status_code == 401


async def test_me_requires_login(client):
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401
    assert response.json() == {"detail": "Требуется вход"}


async def test_tampered_token_is_rejected(client, resident, login):
    await login(resident)
    client.cookies.set("access_token", client.cookies["access_token"] + "x")
    assert (await client.get("/api/v1/auth/me")).status_code == 401


async def test_logout_clears_cookie(client, resident, login):
    await login(resident)
    response = await client.post("/api/v1/auth/logout")
    assert response.status_code == 204
    assert 'access_token=""' in response.headers["set-cookie"]
    assert (await client.get("/api/v1/auth/me")).status_code == 401


async def test_wrong_role_is_forbidden(client, resident, login):
    await login(resident)
    response = await client.get("/api/v1/users", params={"role": "master"})
    assert response.status_code == 403
    assert response.json() == {"detail": "Недостаточно прав"}

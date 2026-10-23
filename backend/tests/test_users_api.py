from backend.infrastructure.db.models import UserRole


def new_user(**overrides):
    return {
        "login": "petr",
        "password": "strong-password",
        "full_name": "Пётр Сидоров",
        "role": "master",
        **overrides,
    }


async def test_dispatcher_lists_users_filtered_by_role_and_activity(
    client, make_user, dispatcher, login
):
    second = await make_user(UserRole.MASTER, "boris")
    first = await make_user(UserRole.MASTER, "anton")
    inactive = await make_user(UserRole.MASTER, "inactive", is_active=False)
    await login(dispatcher)

    by_role = await client.get("/api/v1/users", params={"role": "master"})
    assert by_role.status_code == 200
    assert [user["id"] for user in by_role.json()] == [first.id, second.id, inactive.id]

    active = await client.get("/api/v1/users", params={"role": "master", "is_active": "true"})
    assert [user["id"] for user in active.json()] == [first.id, second.id]

    everyone = await client.get("/api/v1/users")
    assert len(everyone.json()) == 4


async def test_admin_creates_user_who_can_login(client, admin, login):
    await login(admin)
    created = await client.post("/api/v1/users", json=new_user(phone=" +7 900 "))
    assert created.status_code == 201
    body = created.json()
    assert body["login"] == "petr"
    assert body["phone"] == "+7 900"
    assert body["role"] == "master"
    assert "password" not in body

    fetched = await client.get(f"/api/v1/users/{body['id']}")
    assert fetched.json() == body

    response = await client.post(
        "/api/v1/auth/login", json={"login": "petr", "password": "strong-password"}
    )
    assert response.status_code == 200


async def test_duplicate_login_is_rejected(client, admin, resident, login):
    await login(admin)
    created = await client.post("/api/v1/users", json=new_user(login=resident.login))
    assert created.status_code == 409
    assert created.json() == {"detail": "Логин уже занят"}


async def test_short_password_is_rejected(client, admin, login):
    await login(admin)
    assert (await client.post("/api/v1/users", json=new_user(password="short"))).status_code == 422


async def test_admin_updates_user_and_resets_password(client, admin, master, login, password):
    await login(admin)
    updated = await client.patch(
        f"/api/v1/users/{master.id}",
        json={"full_name": "Новое имя", "password": "another-password", "is_active": False},
    )
    assert updated.status_code == 200
    assert updated.json()["full_name"] == "Новое имя"
    assert updated.json()["login"] == master.login

    old = await client.post(
        "/api/v1/auth/login", json={"login": master.login, "password": password}
    )
    assert old.status_code == 401

    await login(admin)
    await client.patch(f"/api/v1/users/{master.id}", json={"is_active": True})
    new = await client.post(
        "/api/v1/auth/login", json={"login": master.login, "password": "another-password"}
    )
    assert new.status_code == 200


async def test_admin_cannot_lock_self_out(client, admin, login):
    await login(admin)
    deactivate = await client.patch(f"/api/v1/users/{admin.id}", json={"is_active": False})
    assert deactivate.status_code == 409
    assert deactivate.json() == {"detail": "Нельзя деактивировать себя или сменить свою роль"}
    demote = await client.patch(f"/api/v1/users/{admin.id}", json={"role": "resident"})
    assert demote.status_code == 409
    keep = await client.patch(f"/api/v1/users/{admin.id}", json={"role": "admin"})
    assert keep.status_code == 200


async def test_null_is_rejected_for_required_fields(client, admin, master, login):
    await login(admin)
    for field in ("full_name", "role", "is_active", "password"):
        response = await client.patch(f"/api/v1/users/{master.id}", json={field: None})
        assert response.status_code == 422, field
    cleared = await client.patch(f"/api/v1/users/{master.id}", json={"phone": None})
    assert cleared.status_code == 200
    assert cleared.json()["phone"] is None


async def test_unknown_user_returns_404(client, admin, login):
    await login(admin)
    assert (await client.get("/api/v1/users/999")).status_code == 404
    assert (await client.patch("/api/v1/users/999", json={"phone": "1"})).status_code == 404


async def test_dispatcher_cannot_manage_users(client, dispatcher, master, login):
    await login(dispatcher)
    assert (await client.post("/api/v1/users", json=new_user())).status_code == 403
    assert (await client.get(f"/api/v1/users/{master.id}")).status_code == 403
    assert (await client.patch(f"/api/v1/users/{master.id}", json={})).status_code == 403

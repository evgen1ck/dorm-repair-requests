.PHONY: up down run migrate revision seed create-admin test lint openapi-schema

up:
	@docker compose build
	@docker compose up -d --wait

down:
	@docker compose down

run:
	@uv run -m backend.cli run-api --reload

migrate:
	@docker compose run --rm backend db upgrade

revision:
	@uv run -m backend.cli db revision -m "$(m)"

seed:
	@docker compose run --rm backend db seed

create-admin:
	@docker compose run --rm backend create-admin --login "$(login)" --full-name "$(name)" $(if $(phone),--phone "$(phone)")

test:
	@uv run pytest backend/tests
	@npm run --prefix frontend test

lint:
	@uv run ruff check .
	@uv run ruff format --check .
	@uv run lint-imports
	@npm run --prefix frontend lint
	@npm run --prefix frontend typecheck

openapi-schema:
	@uv run python -c "import json; from backend.application.api.app import create_app; print(json.dumps(create_app().openapi()))" > frontend/openapi.json
	@npm run --prefix frontend generate:api
	@npm run --prefix frontend format

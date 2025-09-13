ProjectName := gits
ComposeFile := docker-compose.yml
KeycloakContainer := keycloak
FrontendContainer := frontend

start-docker:
	docker compose -f $(ComposeFile) --project-name $(ProjectName) up -d
build-docker:
	docker compose -f $(ComposeFile) --project-name $(ProjectName) build
stop-docker:
	docker compose -f $(ComposeFile) --project-name $(ProjectName) down
status-docker:
	docker compose -f $(ComposeFile) --project-name $(ProjectName) ps
keycloak-start:
	docker compose -f $(ComposeFile) --project-name $(ProjectName) up -d $(KeycloakContainer)
keycloak-build:
	docker compose -f $(ComposeFile) --project-name $(ProjectName) build $(KeycloakContainer)
keycloak-stop:
	docker compose -f $(ComposeFile) --project-name $(ProjectName) stop $(KeycloakContainer)
frontend-start:
	docker compose -f $(ComposeFile) --project-name $(ProjectName) up -d $(FrontendContainer)
frontend-build:
	docker compose -f $(ComposeFile) --project-name $(ProjectName) build $(FrontendContainer)
frontend-stop:
	docker compose -f $(ComposeFile) --project-name $(ProjectName) stop $(FrontendContainer)
frontend-dev:
	npm run dev
frontend-prepare:
	npm install
	npm run relay
	npm run update-schema

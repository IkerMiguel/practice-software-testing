# qa-final: suite Playwright del examen final

Examen final de **Pruebas y Calidad de Software**, Universidad ECCI Cali, 2026-II.
Docente: Oscar Sarabino. Integrantes: **Victor Manuel Marin Marin** e **Iker Miguel Mainguez Romero**.

Esta carpeta contiene nuestro proyecto de pruebas sobre **Toolshop** (Angular + API REST Laravel + Swagger).
Es independiente del `playwright.config.ts` y de `tests/login.spec.ts` de la raíz, que pertenecen
al autor original y no se modifican.

## 1. Requisitos previos

| Herramienta | Versión | Comprobar con |
|---|---|---|
| Docker Desktop (incluye Docker Compose v2) | reciente | `docker compose version` |
| Node.js | 20 LTS o superior | `node --version` |
| Git | cualquiera | `git --version` |

Puertos libres: `4200` (UI), `8091` (API), `3306` (MariaDB). Con el override por defecto
también se usan `1080`/`1025` (MailCatcher) y `8000`.

## 2. Levantar la aplicación con Docker

Todos los comandos se ejecutan **en la raíz del repositorio** (no en `qa-final/`).

```bash
git clone https://github.com/IkerMiguel/practice-software-testing.git
cd practice-software-testing

# .env ya trae SPRINT=sprint5 (versión correcta)
docker compose up -d

# Esperar unos 30 s a que MariaDB arranque y sembrar la base de datos
docker compose exec laravel-api php artisan migrate:fresh --seed
```

El contenedor `angular-ui` ejecuta `npm install` y `ng serve` al arrancar; la primera vez tarda varios
minutos. Para saber cuándo está lista la UI:

```bash
docker compose logs -f angular-ui    # esperar "Compiled successfully" / "Local: http://localhost:4200"
```

| URL | Servicio |
|---|---|
| http://localhost:4200 | Aplicación Angular |
| http://localhost:8091 | API REST |
| http://localhost:8091/status | Estado de la API (JSON con la versión) |
| http://localhost:8091/api/documentation | Swagger |

Usuarios sembrados (mismos en `sprint5` y `sprint5-with-bugs`):
`customer@practicesoftwaretesting.com`, `customer2@practicesoftwaretesting.com`,
`admin@practicesoftwaretesting.com` (contraseña `welcome01`).

### Reiniciar los datos entre ejecuciones

Algunos casos cambian el estado (por ejemplo, el bloqueo de cuenta tras intentos fallidos).
Antes de cada corrida completa se resiembra la base de datos:

```bash
docker compose exec laravel-api php artisan migrate:fresh --seed
```

## 3. Cambiar a la versión con errores (sprint5-with-bugs)

La versión con errores usa los mismos puertos, así que solo puede haber una versión levantada a la vez.

```bash
docker compose down
# Linux / macOS / Git Bash:
echo "SPRINT=sprint5-with-bugs" > .env
# PowerShell:
#   Set-Content -Path .env -Value "SPRINT=sprint5-with-bugs"
docker compose up -d
docker compose exec laravel-api php artisan migrate:fresh --seed
```

Para volver a `sprint5`: `docker compose down`, restaurar el archivo con `git restore .env` y repetir
`up -d` y la siembra.

> **Importante:** `.env` de la raíz está versionado. El cambio a `sprint5-with-bugs` es solo local:
> no se incluye en ningún commit (`git restore .env` antes de hacer `git add`).

Alternativa sin Docker para with-bugs: la versión pública
(`https://with-bugs.practicesoftwaretesting.com`). La usamos solo como respaldo, porque sus cuentas
son compartidas con otros usuarios y los casos que bloquean cuentas no deben ejecutarse allí.

## 4. Instalar el proyecto de pruebas

```bash
cd qa-final
npm ci                              # o npm install la primera vez
npx playwright install chromium     # navegador usado por la suite
```

## 5. Ejecutar las pruebas

El entorno se elige con la variable `TARGET` (definida en [`config/env.ts`](config/env.ts)):

| TARGET | UI | API | Requiere |
|---|---|---|---|
| `sprint5` (por defecto) | http://localhost:4200 | http://localhost:8091 | Docker con `SPRINT=sprint5` |
| `with-bugs` | http://localhost:4200 | http://localhost:8091 | Docker con `SPRINT=sprint5-with-bugs` |
| `with-bugs-hosted` | https://with-bugs.practicesoftwaretesting.com | https://api-with-bugs.practicesoftwaretesting.com | Internet |

`BASE_URL` y `API_URL` permiten sobrescribir las URL del preset si hiciera falta.

```bash
npm run test:sprint5          # suite completa contra sprint5
npm run test:bugs             # suite completa contra sprint5-with-bugs local
npm run test:bugs:hosted      # suite contra la versión pública con errores
npm run test:smoke            # solo pruebas etiquetadas @smoke (usa TARGET o sprint5)
npm run test:regression       # solo pruebas etiquetadas @regression
npm run test:list             # lista los tests sin ejecutarlos
```

Ejecutar un solo caso por su ID (el nombre de cada test empieza por el ID del caso):

```bash
npx playwright test -g "ENV-000"
```

Sobrescribir URL puntualmente:

```bash
# Linux / macOS / Git Bash
BASE_URL=http://localhost:4200 API_URL=http://localhost:8091 npx playwright test
# PowerShell
$env:BASE_URL="http://localhost:4200"; $env:API_URL="http://localhost:8091"; npx playwright test
```

## 6. Reportes y evidencia

Cada TARGET guarda sus resultados por separado, así la evidencia de una versión no borra la de la otra:

| Ruta | Contenido |
|---|---|
| `reports/<TARGET>/html/` | Reporte HTML (PASS/FAIL, capturas, trazas) |
| `reports/<TARGET>/results.json` | Resultados en JSON (base para las métricas del cierre STLC) |
| `test-results/<TARGET>/` | Capturas (`screenshot: 'on'`), trazas (`trace: 'on'`) y video de los fallos |

```bash
npm run report:sprint5
npm run report:bugs
npx playwright show-trace test-results/<TARGET>/<carpeta-del-test>/trace.zip
```

`reports/` y `test-results/` no se versionan (se regeneran en cada corrida). La evidencia que se
entrega se copia a `evidence/` en la fase de ejecución.

## 7. Configuración relevante

- `testIdAttribute: 'data-test'`: Toolshop marca sus elementos con `data-test`, por eso
  `page.getByTestId('nav-sign-in')` equivale a `[data-test="nav-sign-in"]`.
- Proyecto `ui` (Chromium) para `tests/ui/**` y proyecto `api` para `tests/api/**`; en el proyecto
  `api` el `baseURL` de la fixture `request` es la URL de la API.
- `workers: 1` y `retries: 0`: la base de datos es compartida y un FAIL debe quedar tal como ocurrió.

## 8. Estructura

```
qa-final/
├── config/env.ts            # TARGET → URL de UI y API
├── playwright.config.ts
├── tests/
│   ├── ui/                  # casos de caja negra por interfaz
│   │   └── env-check.spec.ts   # ENV-000: verificación del entorno (no cuenta entre los 10 casos)
│   └── api/                 # casos de caja blanca con la fixture request
└── README.md
```

Las carpetas `pages/` (Page Object Model), `docs/` (diseño de casos y trazabilidad) y `evidence/`
se agregan en las fases siguientes.

## 9. Flujo de trabajo en Git

- `main` protegida por convención: todo cambio entra por Pull Request desde una rama por funcionalidad
  (`chore/…`, `test/…`, `docs/…`).
- Mensajes de commit con [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/).

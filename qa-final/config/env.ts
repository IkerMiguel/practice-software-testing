/**
 * Selección del entorno bajo prueba.
 *
 * TARGET elige un preset; BASE_URL y API_URL, si se definen, tienen prioridad.
 *   sprint5           -> Docker local con SPRINT=sprint5 (versión correcta)
 *   with-bugs         -> Docker local con SPRINT=sprint5-with-bugs (mismos puertos)
 *   with-bugs-hosted  -> versión pública de with-bugs (sin pruebas que bloqueen cuentas)
 *
 * Los puertos locales salen de docker-compose.yml (angular-ui 4200:4200, web 8091:80)
 * y la URL de la API coincide con apiUrl de <sprint>/UI/src/environments/environment.ts.
 */
export type Target = 'sprint5' | 'with-bugs' | 'with-bugs-hosted';

const PRESETS: Record<Target, { baseURL: string; apiURL: string }> = {
  'sprint5': {
    baseURL: 'http://localhost:4200',
    apiURL: 'http://localhost:8091',
  },
  'with-bugs': {
    baseURL: 'http://localhost:4200',
    apiURL: 'http://localhost:8091',
  },
  'with-bugs-hosted': {
    baseURL: 'https://with-bugs.practicesoftwaretesting.com',
    apiURL: 'https://api-with-bugs.practicesoftwaretesting.com',
  },
};

const rawTarget = (process.env.TARGET ?? 'sprint5') as Target;
if (!(rawTarget in PRESETS)) {
  throw new Error(
    `TARGET="${rawTarget}" no es válido. Use uno de: ${Object.keys(PRESETS).join(', ')}`,
  );
}

export const TARGET: Target = rawTarget;
export const BASE_URL = process.env.BASE_URL ?? PRESETS[TARGET].baseURL;
export const API_URL = process.env.API_URL ?? PRESETS[TARGET].apiURL;

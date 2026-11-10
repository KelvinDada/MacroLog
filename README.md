# MacroLog

Aplicación personal y local para el registro de alimentación. La app estática se publica en GitHub Pages; los datos permanecen en IndexedDB del navegador bajo la base `macrolog-db`.

## Desarrollo local

Requiere Node.js 22 o posterior.

```sh
pnpm install --frozen-lockfile
npm run dev
```

La compilación de producción se genera en `dist/`:

```sh
npm run build
npm run preview
```

Vite usa `base: '/MacroLog/'`. Por ello, la vista previa de producción debe abrirse en la ruta base configurada; no se deben cambiar los enlaces absolutos `/MacroLog/` por rutas del dominio raíz.

## Publicar en GitHub Pages

1. Crea el repositorio público `KelvinDada/MacroLog` en GitHub. Déjalo vacío: no lo inicialices con README, licencia ni `.gitignore`.
2. Desde esta carpeta, añade el remoto y publica la rama `main`:

   ```sh
   git remote add origin https://github.com/KelvinDada/MacroLog.git
   git add .
   git commit -m "Prepare MacroLog for GitHub Pages"
   git push -u origin main
   ```

3. En GitHub, abre **Settings → Pages → Build and deployment** y selecciona **Source: GitHub Actions**.
4. Abre **Actions** y confirma que **Deploy MacroLog to GitHub Pages** termina correctamente. El workflow se ejecuta en cada push a `main` y también se puede iniciar manualmente.
5. La dirección esperada es <https://kelvindada.github.io/MacroLog/>.

El workflow instala exactamente las dependencias de `pnpm-lock.yaml`, ejecuta `npm test --if-present`, construye `dist/` con `npm run build` y lo publica como artefacto de Pages. Si no hay pruebas configuradas, el paso de pruebas termina correctamente sin instalar otra herramienta.

## PWA, datos y privacidad

- El manifest declara `start_url` y `scope` como `/MacroLog/`.
- El Service Worker se registra con scope `/MacroLog/`; sus URL y cachés se mantienen dentro de ese proyecto y su caché solo guarda recursos estáticos de la aplicación.
- El Service Worker no lee, copia ni elimina IndexedDB. La actualización de su caché estática no borra los datos locales.
- IndexedDB usa la base `macrolog-db` y versiones de esquema explícitas. Aumentar su versión requiere una migración aditiva en `src/db.ts`; no añadas operaciones que eliminen datos de usuario.
- No se usan APIs externas, recursos CDN, analítica ni servicios remotos. GitHub recibe los archivos de la aplicación durante la publicación, no los registros del navegador.
- La instalación y el modo offline dependen de las funciones disponibles en cada navegador. En Safari de iPhone, usa **Compartir → Añadir a pantalla de inicio** cuando esté disponible; abre MacroLog online una vez para guardar los recursos antes de usarlo sin conexión.

Esta primera fase solo prepara y verifica la aplicación base y la publicación. Todavía no incorpora la biblioteca de alimentos.

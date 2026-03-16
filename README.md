# Catalogo de experiencias web

Catalogo de demos en React + TypeScript + Vite. Cada experiencia vive como feature propia y comparte una capa de contenido editable desde un workspace local.

## Que incluye

- Portada con busqueda, filtros y navegacion entre demos.
- Seis experiencias tematicas: restaurante, estudio, tienda, Tablecor, viajes y motos.
- Workspace local para reemplazar el contenido demo sin tocar la UI.
- Arquitectura por dominio en `src/features` y piezas compartidas en `src/shared`.

## Ejecutar en local

Este proyecto usa una instalacion local de Node dentro de `.tools` porque este equipo no lo tenia en `PATH`.

### Desarrollo

```powershell
.\scripts\dev.cmd
```

Luego abre [http://127.0.0.1:4173](http://127.0.0.1:4173).

### Build

```powershell
.\scripts\build.cmd
```

### Tests

```powershell
.\scripts\test.cmd
```

## Estructura

- `src/app`: arranque, provider principal y router.
- `src/features`: una carpeta por experiencia o flujo.
- `src/shared`: tipos, hooks, contenido base, componentes y estilos comunes.
- `public`: imagenes y videos usados por las demos.
- `scripts`: atajos para correr `dev` y `build` con el Node local.

## Convencion por feature

- `Page.tsx`: estado y composicion de la pagina.
- `*Sections.tsx`: bloques visuales grandes.
- `*.data.ts`: contenido demo o fixtures del dominio.
- `*.logic.ts` o `*Selectors.ts`: derivaciones puras y helpers del dominio.
- `*.module.css`: estilos propios de la feature.

## Como agregar otra experiencia

1. Crea una carpeta nueva dentro de `src/features`.
2. Define la pagina, data base y estilos del dominio.
3. Registra la ficha en `src/shared/data/sites.ts`.
4. Agrega la ruta en `src/app/router.tsx`.
5. Si quieres editarla desde el workspace, agrega su shape en `src/shared/content/contentTypes.ts` y sus defaults en `src/shared/content/defaultContent.ts`.

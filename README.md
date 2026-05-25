# Flujo de CI

Documentación del pipeline de integración continua para el proyecto `hangman-front`.

---

## Descripción general

El primer workflow automatiza la **compilación y las pruebas unitarias** del frontend del juego Hangman cada vez que hay cambios relevantes en la rama principal o en una Pull Request.

---

## Eventos que disparan el workflow

| Evento         | Rama     | Filtro de ruta        |
|----------------|----------|-----------------------|
| `push`         | `master` | `hangman-front/**`    |
| `pull_request` | `master` | `hangman-front/**`    |

> **Nota:** El filtro de ruta (`paths`) garantiza que el workflow **solo se ejecuta cuando hay cambios dentro del directorio `hangman-front/`**. Cambios en otras partes del repositorio no lo activarán, lo que evita ejecuciones innecesarias.

---

## Jobs

El workflow define dos jobs que se ejecutan **secuencialmente**: primero `build` y, si este tiene éxito, `test`.

```
push / pull_request
        │
        ▼
   ┌─────────┐
   │  build  │
   └────┬────┘
        │ (necesario para continuar)
        ▼
   ┌─────────┐
   │  test   │
   └─────────┘
```

---

### Job `build`

**Entorno:** `ubuntu-latest`

Compila el proyecto para verificar que el código fuente no tiene errores de build.

| # | Paso | Action / Comando | Descripción |
|---|------|-----------------|-------------|
| 1 | **Checkout** | `actions/checkout@v6` | Clona el repositorio en el runner. |
| 2 | **Setup Node.js** | `actions/setup-node@v6` | Instala Node.js versión 18. |
| 3 | **Build** | `npm ci` + `npm run build --if-present` | Instala dependencias de forma limpia y ejecuta el script de build si está definido en el `package.json`. |

---

### Job `test`

**Entorno:** `ubuntu-latest`  
**Dependencia:** `needs: build` — solo se ejecuta si el job `build` finaliza con éxito.

Ejecuta la suite de pruebas unitarias del proyecto.

| # | Paso | Action / Comando | Descripción |
|---|------|-----------------|-------------|
| 1 | **Checkout** | `actions/checkout@v6` | Clona el repositorio en el runner. |
| 2 | **Setup Node.js** | `actions/setup-node@v6` | Instala Node.js versión 18. |
| 3 | **Unit tests** | `npm ci` + `npm run test` | Instala dependencias y ejecuta los tests unitarios. |

---

## Actions utilizadas

| Action | Versión | Propósito |
|--------|---------|-----------|
| [`actions/checkout`](https://github.com/actions/checkout) | `v6` | Descarga el código del repositorio en el runner. |
| [`actions/setup-node`](https://github.com/actions/setup-node) | `v6` | Configura la versión de Node.js especificada en el entorno. |

---
# Worfklow de CI 

Documentación del pipeline de entrega continua para el proyecto `hangman-front`.

---

## Descripción general

Este workflow construye la imagen Docker del frontend y la publica en el **GitHub Container Registry (GHCR)**. A diferencia del CI, **no se dispara automáticamente**: requiere que alguien lo lance manualmente desde la interfaz de GitHub.

---

## Eventos que disparan el workflow

| Evento              | Descripción |
|---------------------|-------------|
| `workflow_dispatch` | Ejecución **manual** desde la pestaña *Actions* de GitHub. |


---

## Jobs

El workflow define un único job que agrupa la construcción y el push de la imagen.

```
Ejecución manual (workflow_dispatch)
            │
            ▼
   ┌──────────────────────┐
   │  buildAndPushImage   │
   └──────────────────────┘
```

---

### Job `buildAndPushImage`

**Entorno:** `ubuntu-latest`

Construye la imagen Docker a partir del `Dockerfile` del proyecto y la publica en GHCR.

| # | Paso | Action / Comando | Descripción |
|---|------|-----------------|-------------|
| 1 | **Checkout** | `actions/checkout@v6` | Clona el repositorio en el runner. |
| 2 | **Login to GitHub Container Registry** | `docker/login-action@v4` | Autentica el runner contra `ghcr.io` usando el token de GitHub generado automáticamente. |
| 3 | **Setup Docker Buildx** | `docker/setup-buildx-action@v4` | Configura BuildKit, el motor de build avanzado de Docker, que permite caché de capas, builds multi-plataforma y mayor rendimiento. |
| 4 | **Build and push Docker Image** | `docker/build-push-action@v7` | Construye la imagen usando el `Dockerfile` indicado y la sube a GHCR con la etiqueta `latest`. |

#### Detalle del paso de build y push

| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| `context` | `./hangman-front` | Directorio raíz del contexto de build de Docker. |
| `push` | `true` | Indica que la imagen debe publicarse en el registry tras construirse. |
| `tags` | `ghcr.io/davidhormigoramirez/hangman-front:latest` | Nombre e etiqueta completa de la imagen en GHCR. |
| `file` | `./hangman-front/Dockerfile` | Ruta explícita al `Dockerfile` usado para construir la imagen. |

---

## Actions utilizadas

| Action | Versión | Propósito |
|--------|---------|-----------|
| [`actions/checkout`](https://github.com/actions/checkout) | `v6` | Descarga el código del repositorio en el runner. |
| [`docker/login-action`](https://github.com/docker/login-action) | `v4` | Autenticación contra registries de Docker (en este caso GHCR). |
| [`docker/setup-buildx-action`](https://github.com/docker/setup-buildx-action) | `v4` | Configura Docker Buildx (BuildKit) en el runner. |
| [`docker/build-push-action`](https://github.com/docker/build-push-action) | `v7` | Construye y publica imágenes Docker en un registry. |

---
# Administrador de Proyectos - Deployment & Closure M8

**Versión 1.0.0 · 12 de junio de 2026**

Desarrollo e implantación de sistemas de software (Gpo 104) · Tecnológico de Monterrey 

Prof. Gerardo Padilla Zarate

| Nombre                               | Matrícula |
| ------------------------------------ | --------- |
| Diana Fernanda Delgado Salcedo       | A01644911 |
| Liliana Ramos Vázquez                | A01644969 |
| Anna Sofía Ramírez Castro            | A00574296 |
| Leonardo Mario Alberto Guillen Soria | A00574110 |

---
## Tabla de Contenidos

- [Sección 1: Manual de Usuario](#sección-1--manual-de-usuario)
  - [1.1 Introducción y URL del sistema](#11-introducción-y-url-del-sistema)
  - [1.2 Tecnologías utilizadas](#12-tecnologías-utilizadas)
  - [1.3 Inicio rápido](#13-inicio-rápido)
  - [1.4 Roles y permisos](#14-roles-y-permisos)
  - [1.5 Navegación general del sistema](#15-navegación-general-del-sistema)
  - [1.6 Asistente de IA](#16-asistente-de-ia)
  - [1.7 Integración con Telegram](#17-integración-con-telegram)
  - [1.8 Instalación local](#18-instalación-local)
  - [1.9 CI/CD y despliegue](#19-cicd-y-despliegue)
  - [1.10 Solución de problemas](#110-solución-de-problemas)
  - [1.11 Recomendaciones y consideraciones técnicas](#111-recomendaciones-y-consideraciones-técnicas)
- [Sección 2: Notas de Versión v1.0.0](#sección-2--notas-de-versión-v100)
  - [2.1 Descripción general](#21-descripción-general)
  - [2.2 Nuevas funcionalidades](#22-nuevas-funcionalidades)
  - [2.3 Mejoras](#23-mejoras)
  - [2.4 Corrección de errores](#24-corrección-de-errores)
  - [2.5 Cambios importantes y deprecaciones](#25-cambios-importantes-y-deprecaciones)
  - [2.6 Problemas conocidos](#26-problemas-conocidos)
  - [2.7 Requisitos del sistema](#27-requisitos-del-sistema)
  - [2.8 Documentación y recursos](#28-documentación-y-recursos)
- [Sección 3: Diagrama de Actividad UML](#sección-3--diagrama-de-actividad-uml)
  - [3.1 Proceso de desarrollo de software](#31-proceso-de-desarrollo-de-software)
  - [3.2 Notas y anotaciones del diagrama](#32-notas-y-anotaciones-del-diagrama)

---

# Sección 1: Manual de Usuario

## 1.1 Introducción y URL del sistema

El **Administrador de Proyectos** es una plataforma web de gestión de proyectos diseñada para equipos de desarrollo de software. Permite administrar tareas, hacer seguimiento de sprints, visualizar KPI's en un dashboard y recibir recomendaciones generadas por inteligencia artificial para ayudar a los equipos a cumplir sus objetivos. El sistema integra un asistente respaldado por OpenAI, un bot de Telegram para administración móvil y un pipeline de CI/CD desplegado en Oracle Cloud Infrastructure.

> 🔗 **URL pública del sistema:** [https://sammy-ulfh.dev/login](https://sammy-ulfh.dev/login)

---

## 1.2 Tecnologías utilizadas

| Capa                  | Tecnología / Herramienta          |
| --------------------- | --------------------------------- |
| Frontend              | React + Vite                      |
| Backend               | Java Spring Boot                  |
| Base de datos         | Oracle Autonomous Database        |
| Plataforma en la nube | Oracle Cloud Infrastructure (OCI) |
| Contenedores          | Docker + Kubernetes (OKE)         |
| CI/CD                 | GitHub Actions                    |
| Integración de IA     | OpenAI API (GPT)                  |
| Integración de bot    | Telegram Bot API                  |
| Seguridad             | OCI Vault + Kubernetes Secrets    |

---

## 1.3 Inicio rápido

Los usuarios finales no necesitan instalar nada, el sistema funciona completamente desde un navegador web de escritorio.

| Paso | Acción                         | Detalle                                                                                                     |
| ---- | ------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| 1    | Abrir el portal                | Navegar a [https://sammy-ulfh.dev/login](https://sammy-ulfh.dev/login)                                      |
| 2    | Iniciar sesión                 | Ingresar el correo y contraseña registrados. Contactar al Administrador si no se tienen credenciales.       |
| 3    | Revisar tareas asignadas       | Desde el menú lateral, abrir **Tareas** y filtrar por el sprint actual.                                     |
| 4    | Consultar el Dashboard         | Visualizar KPI's, métricas del sprint, avance del proyecto y recomendaciones de IA.                          |
| 5    | Usar el Asistente de IA        | Navegar al módulo **Asistente de IA** para consultar el estado del sprint y la carga de trabajo del equipo. |
| 6    | Actualizar el estado de tareas | Cambiar el estado (Pendiente → En progreso → Completada) para mantener el tablero del sprint actualizado.   |

---

## 1.4 Roles y permisos

El sistema define dos roles con diferentes niveles de acceso.

| Permiso                        | Administrador | Miembro |
| ------------------------------ | :-----------: | :-----: |
| Iniciar sesión en el portal    |       ✔       |    ✔    |
| Ver tareas asignadas           |       ✔       |    ✔    |
| Actualizar estado de tareas    |       ✔       |    ✔    |
| Actualizar prioridad de tareas |       ✔       |    ✔    |
| Ver métricas personales        |       ✔       |    ✔    |
| Usar el Asistente de IA        |       ✔       |    ✔    |
| Ver KPIs del equipo            |       ✔       |    ✔    |
| Crear usuarios                 |       ✔       |    ✗    |
| Crear proyectos                |       ✔       |    ✗    |
| Crear sprints                  |       ✔       |    ✗    |
| Crear y asignar tareas         |       ✔       |    ✗    |
| Administrar el bot de Telegram |       ✔       |    ✗    |

---

## 1.5 Navegación general del sistema

### Inicio de sesión

- Ingresar el correo electrónico y contraseña registrados.
- El sistema valida las credenciales contra Oracle Autonomous Database.
- Al autenticarse correctamente, el usuario es redirigido al Dashboard.
- Si el inicio de sesión falla, verificar las credenciales o contactar al Administrador.

### Dashboard

- Muestra KPI's del sprint en tiempo real (velocidad, porcentaje de cumplimiento, tareas en riesgo).
- Despliega el conteo de tareas activas y métricas personales.
- Presenta recomendaciones automáticas de IA basadas en los datos del sprint actual.
- Ofrece una vista general del estado del proyecto.

### Gestión de tareas

- Visualizar todas las tareas del sprint actual según el rol del usuario.
- Cambiar el estado de las tareas.
- Consultar tareas del equipo o tareas personales (Miembro).

#### Transiciones de estado de tareas

| Estado      | Descripción                                                    | ¿Quién puede asignarlo? |
| ----------- | -------------------------------------------------------------- | ----------------------- |
| Pendiente   | Tarea creada, aún no iniciada.                                 | Sistema / Administrador |
| En progreso | El miembro del equipo está trabajando activamente en la tarea. | Miembro / Administrador |
| Completada  | Tarea finalizada y verificada.                                 | Miembro / Administrador |

> Solo se permiten transiciones hacia adelante desde la interfaz. El Administrador puede revertir estados si es necesario.

---

## 1.6 Asistente de IA

El Asistente de IA funciona con la API de OpenAI y opera en dos niveles:

- **Recomendaciones automáticas** mostradas directamente en el Dashboard.
- **Chatbot conversacional** accesible desde el módulo Asistente de IA.

### ¿Qué puedes consultar?

- Avance del sprint actual y porcentaje de cumplimiento.
- Identificación de tareas retrasadas o en riesgo.
- Distribución de carga de trabajo entre los miembros del equipo.
- Métricas y tendencias de productividad personal.
- Recomendaciones para mejorar la velocidad del sprint.
- Resumen de tareas críticas que requieren atención inmediata.

### Ejemplo de uso

**Entrada:**

```
¿Qué tareas presentan retrasos en el sprint?
```

**Salida esperada:**

```
El sprint actual presenta tareas con retraso relacionadas con integración y
revisión de módulos. Se recomienda priorizar las tareas críticas y redistribuir
la carga de trabajo entre los miembros con menor ocupación actual.
```

> **Nota:** Las respuestas del asistente dependen de la disponibilidad de la API de OpenAI y del cupo de tokens disponible. Si el asistente no responde, verificar la conexión a internet y solicitar al Administrador que revise el saldo de tokens de OpenAI.

---

## 1.7 Integración con Telegram

El sistema cuenta con un bot de Telegram para realizar acciones administrativas rápidas sin necesidad de abrir el portal web.

> **Bot:** `@leonardo_guillen_bot`

### Funciones disponibles

- Crear nuevos miembros del equipo (usuarios).
- Crear nuevos proyectos.
- Crear sprints dentro de proyectos existentes.
- Crear tareas dentro de un sprint.
- Asignar tareas a los miembros del equipo.

### Flujo de autenticación

1. Enviar cualquier mensaje al bot `@leonardo_guillen_bot`.
2. El bot solicita el correo electrónico y contraseña registrados del administrador.
3. Las credenciales se validan contra el backend.
4. Al autenticarse correctamente, se despliega el menú de comandos disponibles.

---

## 1.8 Instalación local

> Los usuarios finales no necesitan instalar nada, solo usar la URL pública. Estas instrucciones están dirigidas a desarrolladores que deseen configurar un entorno local.

### Frontend (React + Vite)

**Prerrequisitos:** Node.js LTS, npm.

```bash
# Paso 1 — Clonar el repositorio
git clone https://github.com/lilianaramosvz/admindeproyectos.git
cd admindeproyectos

# Paso 2 — Instalar dependencias
cd frontend
npm install

# Paso 3 — Levantar el servidor de desarrollo
npm run dev
# Disponible en http://localhost:5173
```

### Backend (Java Spring Boot)

**Prerrequisitos:**

| Dependencia      | Versión |
| ---------------- | ------- |
| Java JDK         | 17+     |
| Maven            | 3.8+    |
| Docker + Compose | 24+     |

**Variables de entorno requeridas** — crear un archivo `.env`:

```env
DB_URL=
DB_USERNAME=
DB_PASSWORD=
JWT_SECRET=
OPENAI_API_KEY=
TELEGRAM_BOT_TOKEN=
```

**Iniciar con Docker Compose:**

```bash
docker-compose up --build
```

**Iniciar localmente con Maven:**

```bash
mvn spring-boot:run
```

**Dependencias de Spring Boot:** Spring Web, Spring Data JPA, Spring Security, WebFlux.

---

## 1.9 CI/CD y despliegue

Cada push a la rama `main` activa automáticamente un pipeline completo mediante GitHub Actions. El sistema se despliega en Oracle Kubernetes Engine (OKE) utilizando una **estrategia de despliegue Blue/Green** para garantizar cero tiempo de inactividad.

1. Los microservicios Java se compilan con Maven.
2. Las imágenes Docker se construyen y se publican en OCI Container Registry.
3. Las imágenes se despliegan en el namespace inactivo de Kubernetes (azul o verde).
4. El tráfico se transfiere al nuevo despliegue únicamente después de que todas las validaciones sean exitosas.
5. Una suite automatizada de pytest valida los 6 componentes del sistema tras cada despliegue.
6. Si alguna prueba falla, una OCI Function crea automáticamente un ticket en Jira.

---

## 1.10 Solución de problemas

| Síntoma                              | Causa probable                                                      | Solución                                                                                 |
| ------------------------------------ | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| El dashboard no carga la información | Los servicios de OCI están lentos o bajo alta carga.                | Esperar unos minutos y actualizar la página. Consultar el panel de estado de OCI.        |
| El Asistente de IA no responde       | Cupo de tokens de OpenAI agotado o problema de red.                 | Verificar conexión a internet. Solicitar al Administrador que revise el saldo de tokens. |
| No es posible iniciar sesión         | Credenciales incorrectas o cuenta no creada.                        | Verificar correo y contraseña. Contactar al Administrador para confirmar la cuenta.      |
| El bot de Telegram no responde       | Token del bot expirado o servicio reiniciado.                       | Contactar al Administrador para verificar el token en OCI Vault y reiniciar el servicio. |
| Las tareas no se actualizan          | Tiempo de sesión agotado o problema de conectividad con el backend. | Cerrar sesión y volver a iniciarla. Si el problema persiste, contactar al Administrador. |

---

## 1.11 Recomendaciones y consideraciones técnicas

### Buenas prácticas para los miembros del equipo

- Mantener actualizadas las tareas del sprint diariamente, los datos precisos mejoran las recomendaciones de IA.
- Revisar el Dashboard al inicio de cada jornada de trabajo.
- Atender con rapidez las tareas críticas identificadas por la IA para evitar retrasos en el sprint.
- Usar el bot de Telegram para crear tareas rápidamente cuando no se tenga acceso a una computadora de escritorio.
- No compartir credenciales de acceso; cada miembro del equipo debe tener una cuenta única.

### Dependencias técnicas en producción

- **Oracle Cloud Infrastructure (OCI)** — cómputo y base de datos administrada.
- **OpenAI API** — funcionalidad del asistente de IA.
- **Conexión a internet activa** — requerida para todas las funcionalidades.
- **Navegador web de escritorio** — el sistema no está optimizado para navegadores móviles.

---

# Sección 2 — Notas de Versión v1.0.0

| Campo                | Valor                                              |
| -------------------- | -------------------------------------------------- |
| Fecha de lanzamiento | 12 de junio de 2026                                |
| Versión              | 1.0.0 — Release Final de Producción                |
| URL pública          | https://sammy-ulfh.dev/login                       |
| Repositorio Backend  | https://github.com/OracleTelegramBot/Backend       |
| Repositorio Frontend | https://github.com/lilianaramosvz/admindeproyectos |

---

## 2.1 Descripción general

Administrador de Proyectos v1.0.0 es la versión final de producción de la plataforma inteligente de gestión de tareas, construida sobre una arquitectura de microservicios. Este sprint estuvo enfocado en la madurez de la infraestructura: migración completa a Oracle Cloud Infrastructure (OCI), implementación de prácticas de despliegue empresariales, automatización total del pipeline de CI/CD y gestión centralizada de secretos mediante OCI Vault. El sistema se encuentra listo para producción, es observable y cumple con los estándares de seguridad empresarial.

---

## 2.2 Nuevas funcionalidades

### 1. Migración a Kubernetes en Oracle Kubernetes Engine (OKE)

La infraestructura completa fue migrada de una VPS con Docker Compose a un clúster administrado de Kubernetes en OKE. Esto habilita escalado automático, contenedores con autocuración y gestión de recursos nativa en la nube, otorgando al sistema la confiabilidad esperada de una plataforma en producción.

### 2. Despliegue Blue/Green sin tiempo de inactividad

Se implementó una estrategia Blue/Green sobre OKE. El sistema mantiene dos namespaces idénticos (`azul` y `verde`); cada nueva versión se despliega en el namespace inactivo antes de transferir el tráfico, lo que permite un rollback instantáneo ante cualquier falla. Los usuarios finales no experimentan interrupciones durante las actualizaciones.

### 3. Pipeline de CI/CD automatizado con GitHub Actions

Cada push a `main` activa un pipeline completo:

1. Los microservicios Java se compilan con Maven.
2. Las imágenes Docker se construyen y publican en OCI Container Registry.
3. Las imágenes se despliegan en el namespace inactivo de Kubernetes.
4. El tráfico se transfiere únicamente después de que todas las validaciones sean exitosas.

Esto elimina los pasos manuales de despliegue y garantiza consistencia entre los entornos de desarrollo y producción.

### 4. Pruebas automáticas post-despliegue con pytest

Una suite de pruebas automatizadas con pytest valida los 6 componentes del sistema tras cada despliegue. Si alguna prueba falla, una OCI Function crea automáticamente un ticket en Jira, bloqueando que cambios defectuosos lleguen a producción sin necesidad de intervención manual.

### 5. Gestión centralizada de secretos con OCI Vault

Toda la configuración sensible — credenciales de Oracle Autonomous Database, wallet de la base de datos, tokens del bot de Telegram y claves de la API de OpenAI — se gestiona a través de OCI Vault y se inyecta al clúster como Kubernetes Secrets en tiempo de ejecución. No existen credenciales en el código fuente ni en las imágenes Docker.

---

## 2.3 Mejoras

| Área                     | Mejora                                                                                                | Evidencia                                               |
| ------------------------ | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Seguridad                | Eliminación total de credenciales en el código fuente e imágenes de contenedor.                       | Auditoría de OCI Vault + revisión de Kubernetes Secrets |
| Confiabilidad            | Despliegues sin tiempo de inactividad en lugar de reinicios manuales de contenedores.                 | Transferencia de tráfico Blue/Green verificada en OKE   |
| Velocidad de despliegue  | Pipeline completo (compilar → probar → desplegar) ejecutado automáticamente en cada push.             | Registros del pipeline en GitHub Actions                |
| Aseguramiento de calidad | Suite de regresión automática que impide despliegues defectuosos; ticket en Jira generado ante falla. | Reportes de pytest + integración con OCI Function       |
| Escalabilidad            | Autoescalado de Kubernetes reemplaza la VPS de recursos fijos.                                        | Configuración del clúster en OKE y ajustes de HPA       |

---

## 2.4 Corrección de errores

> No se reportaron ni resolvieron errores críticos en este sprint. Todos los problemas identificados en sprints anteriores fueron corregidos y cerrados previamente a esta versión.

Para el historial completo de incidencias resueltas, consultar el [backlog del proyecto en Jira](https://tec-team-4.atlassian.net/jira/software/projects/SCRUM/boards/1), que genera tickets por cada prueba fallida dentro del sistema.

---

## 2.5 Cambios importantes y deprecaciones

| Deprecado                                        | Reemplazo                      | Instrucciones de migración                                                                                                                                                |
| ------------------------------------------------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Docker Compose en VPS                            | Kubernetes en OKE              | Todos los servicios se despliegan ahora mediante `kubectl` y el pipeline de GitHub Actions. El archivo `docker-compose.yml` se conserva únicamente para desarrollo local. |
| Archivos `.env` con credenciales en contenedores | OCI Vault + Kubernetes Secrets | Los desarrolladores deben solicitar los secretos desde OCI Vault. Los archivos `.env` **no deben usarse** en despliegues de producción.                                   |

> **Importante:** Las variables de entorno previamente definidas en archivos `.env` ya no son válidas en producción. Todos los secretos deben configurarse como Kubernetes Secrets obtenidos desde OCI Vault antes de realizar cualquier despliegue.

---

## 2.6 Problemas conocidos

> No existen problemas sin resolver al momento de este lanzamiento. Todos los objetivos del sprint fueron completados y validados exitosamente.

---

## 2.7 Requisitos del sistema

### Ejecución local (modo desarrollo)

| Dependencia      | Versión              |
| ---------------- | -------------------- |
| Java JDK         | 17+                  |
| Maven            | 3.8+                 |
| Node.js          | LTS                  |
| npm              | Incluido con Node.js |
| Docker + Compose | 24+                  |

### Uso en producción

El sistema está disponible públicamente en [https://sammy-ulfh.dev/login](https://sammy-ulfh.dev/login). No se requiere instalación por parte del usuario final. Una conexión a internet activa y un navegador web de escritorio son suficientes.

**Dependencias externas en producción:**

- Oracle Cloud Infrastructure (OCI)
- Oracle Autonomous Database
- OpenAI API
- Conexión a internet activa

---

## 2.8 Documentación y recursos

| Recurso                       | Enlace                                                                 |
| ----------------------------- | ---------------------------------------------------------------------- |
| Repositorio GitHub — Backend  | https://github.com/OracleTelegramBot/Backend                           |
| Repositorio GitHub — Frontend | https://github.com/lilianaramosvz/admindeproyectos                     |
| Tablero Jira                  | https://tec-team-4.atlassian.net/jira/software/projects/SCRUM/boards/1 |
| Pipeline GitHub Actions       | https://github.com/OracleTelegramBot/Backend/actions                   |
| URL pública del sistema       | https://sammy-ulfh.dev/login                                           |

### Historial de cambios (Pull Requests)

- Develop — [PR #1](https://github.com/OracleTelegramBot/Backend/pull/1)
- Develop — [PR #2](https://github.com/OracleTelegramBot/Backend/pull/2)
- Backend — [PR #3](https://github.com/OracleTelegramBot/Backend/pull/3)
- Develop — [PR #4](https://github.com/OracleTelegramBot/Backend/pull/4)
- Develop — [PR #5](https://github.com/OracleTelegramBot/Backend/pull/5)
- Develop — [PR #6](https://github.com/OracleTelegramBot/Backend/pull/6)
- Task Service — [PR #7](https://github.com/OracleTelegramBot/Backend/pull/7)

**Changelog completo:** https://github.com/OracleTelegramBot/Backend/commits/M8_Preliminar_Release_Notes

---

# Sección 3 — Diagrama de Actividad UML

## 3.1 Proceso de desarrollo de software

El siguiente Diagrama de Actividad UML documenta el proceso completo de desarrollo de software seguido por el equipo, desde el levantamiento de requisitos hasta el despliegue y mantenimiento. El diagrama está dividido por carriles (swimlanes) para indicar la responsabilidad de cada rol.

```
┌─────────────────┬──────────────────────┬────────────────────┬──────────────────────┐
│   EQUIPO / PO   │     DESARROLLADOR    │  QA / TESTER       │   DEVOPS / CI-CD     │
├─────────────────┼──────────────────────┼────────────────────┼──────────────────────┤
│                 │                      │                    │                      │
│      ●          │                      │                    │                      │
│   (Inicio)      │                      │                    │                      │
│      │          │                      │                    │                      │
│      ▼          │                      │                    │                      │
│ ┌───────────┐   │                      │                    │                      │
│ │Levantamien│   │                      │                    │                      │
│ │to de      │   │                      │                    │                      │
│ │Requisitos │   │                      │                    │                      │
│ └─────┬─────┘   │                      │                    │                      │
│       │         │                      │                    │                      │
│       ▼         │                      │                    │                      │
│ ┌───────────┐   │                      │                    │                      │
│ │Refinamien-│   │                      │                    │                      │
│ │to Backlog │   │                      │                    │                      │
│ │Revisión PO│   │                      │                    │                      │
│ └─────┬─────┘   │                      │                    │                      │
│       │         │                      │                    │                      │
│  ═════╪═════════╪════════ FORK ════════╪════════════════════╪═══                   │
│       │         │                      │                    │                      │
│       ▼         │         ▼            │                    │                      │
│ ┌───────────┐   │ ┌───────────────┐    │                    │                      │
│ │Diseño     │   │ │Configuración  │    │                    │                      │
│ │UI/UX y    │   │ │del Entorno y  │    │                    │                      │
│ │Arquitectura│  │ │Estrategia de  │    │                    │                      │
│ └─────┬─────┘   │ │Ramas (Git)    │    │                    │                      │
│       │         │ └───────┬───────┘    │                    │                      │
│       │         │         │            │                    │                      │
│  ═════╪═════════╪════════ JOIN ════════╪════════════════════╪═══                   │
│                 │         │            │                    │                      │
│                 │         ▼            │                    │                      │
│                 │ ┌───────────────┐    │                    │                      │
│                 │ │Implementación │    │                    │                      │
│                 │ │de Funciones   │◄───┼──(No, volver)──────┼── (bucles de         │
│                 │ │(Spring/React) │    │                    │    retroalimentación) │
│                 │ └───────┬───────┘    │                    │                      │
│                 │         │            │                    │                      │
│                 │         ▼            │                    │                      │
│                 │ ┌───────────────┐    │                    │                      │
│                 │ │ Pull Request  │    │                    │                      │
│                 │ │/ Revisión de  │    │                    │                      │
│                 │ │    Código     │    │                    │                      │
│                 │ └───────┬───────┘    │                    │                      │
│                 │         │            │                    │                      │
│                 │         ▼            │                    │                      │
│                 │  ◇ ¿Aprobado? ──No──┘ (vuelve a Impl.)   │                      │
│                 │         │ Sí         │                    │                      │
│                 │         └────────────►                    │                      │
│                 │                      │ ┌──────────────┐   │                      │
│                 │                      │ │Pruebas       │   │                      │
│                 │                      │ │Unitarias y   │   │                      │
│                 │                      │ │de Componentes│   │                      │
│                 │                      │ └──────┬───────┘   │                      │
│                 │                      │        ▼           │                      │
│                 │                      │  ◇ ¿Pasan? ──No──► vuelve a Impl.        │
│                 │                      │        │ Sí        │                      │
│                 │                      │        ▼           │                      │
│                 │                      │ ┌──────────────┐   │                      │
│                 │                      │ │Pruebas de    │   │                      │
│                 │                      │ │Integración   │   │                      │
│                 │                      │ │y E2E         │   │                      │
│                 │                      │ └──────┬───────┘   │                      │
│                 │                      │        ▼           │                      │
│                 │                      │  ◇ ¿Pasan? ──No──► vuelve a Impl.        │
│                 │                      │        │ Sí        │                      │
│                 │         ════════════╪═══════ FORK ════════╪═══                   │
│                 │                      │        │           │                      │
│                 │                      │        ▼           │        ▼             │
│                 │                      │ ┌──────────────┐   │ ┌──────────────┐     │
│                 │                      │ │Análisis de   │   │ │CI: Compilar  │     │
│                 │                      │ │Seguridad     │   │ │+ Docker Push │     │
│                 │                      │ │(OCI Vault)   │   │ │(OCI Registry)│     │
│                 │                      │ └──────┬───────┘   │ └──────┬───────┘     │
│                 │         ════════════╪═══════ JOIN ════════╪═══                   │
│                 │                      │                    │        │             │
│                 │                      │                    │        ▼             │
│                 │                      │                    │ ┌──────────────┐     │
│                 │                      │                    │ │Despliegue en │     │
│                 │                      │                    │ │Staging       │     │
│                 │                      │                    │ │(ns Azul, OKE)│     │
│                 │                      │                    │ └──────┬───────┘     │
│                 │                      │        ◄───────────┘        │             │
│                 │                      │        ▼                    │             │
│                 │                      │ ┌──────────────┐            │             │
│                 │                      │ │Prueba de Humo│            │             │
│                 │                      │ │(suite pytest)│            │             │
│                 │                      │ └──────┬───────┘            │             │
│                 │                      │        ▼                    │             │
│                 │                      │  ◇ ¿Pasan? ──No──► rollback a Staging    │
│                 │                      │        │ Sí                 │             │
│                 │                      │        └────────────────────►             │
│                 │                      │                    │        ▼             │
│                 │                      │                    │ ┌──────────────┐     │
│                 │                      │                    │ │Despliegue en │     │
│                 │                      │                    │ │Producción    │     │
│                 │                      │                    │ │(ns Verde OKE)│     │
│                 │                      │                    │ └──────┬───────┘     │
│                 │                      │                    │        ▼             │
│                 │                      │                    │ ┌──────────────┐     │
│                 │                      │                    │ │Monitoreo y   │     │
│                 │                      │                    │ │Mantenimiento │     │
│                 │                      │                    │ │    (OKE)     │     │
│                 │                      │                    │ └──────┬───────┘     │
│                 │                      │                    │        │             │
│                 │                      │                    │      ◉ ⊙            │
│                 │                      │                    │     (Fin)            │
└─────────────────┴──────────────────────┴────────────────────┴──────────────────────┘
```

> La representación ASCII preserva la estructura de carriles y la lógica de flujo del Diagrama de Actividad UML.

---

## 3.2 Notas y anotaciones del diagrama

### Leyenda de símbolos

| Símbolo                        | Significado en UML                                                   |
| ------------------------------ | -------------------------------------------------------------------- |
| `●` Círculo negro relleno      | Nodo inicial — el proceso comienza aquí                              |
| `◉⊙` Círculo dentro de círculo | Nodo final — el proceso termina aquí                                 |
| Rectángulo redondeado          | Actividad — acción realizada por un rol                              |
| `◇` Rombo                      | Nodo de decisión — bifurcación según condición                       |
| `═══` Barra horizontal gruesa  | Fork / Join — las actividades paralelas inician o se sincronizan     |
| Flecha sólida `→`              | Flujo de control — transición secuencial                             |
| Flecha discontinua roja        | Bucle de retroalimentación — regreso a actividad anterior ante falla |
| Carril (swimlane)              | Partición de responsabilidad                                         |

### Resumen de fases del proceso

| Fase                      | Actividades                                                         | Responsable            |
| ------------------------- | ------------------------------------------------------------------- | ---------------------- |
| Requisitos                | Levantamiento, refinamiento de backlog, revisión del PO             | Equipo / PO            |
| Diseño                    | Diseño UI/UX, arquitectura, estrategia de ramas                     | Equipo / Desarrollador |
| Implementación            | Codificación de funciones (Spring Boot + React), revisión de código | Desarrollador          |
| Pruebas                   | Pruebas unitarias, de integración, análisis de seguridad            | QA / Tester            |
| Construcción y despliegue | Pipeline CI, imagen Docker, despliegue Blue/Green                   | DevOps / CI-CD         |
| Validación                | Pruebas de humo (pytest), ticket automático en Jira ante falla      | QA / DevOps            |
| Producción                | Transferencia de tráfico (namespace verde), monitoreo               | DevOps                 |
| Mantenimiento             | Monitoreo en OKE, respuesta a incidentes, correcciones              | DevOps / Desarrollador |

### Compuertas de calidad (Quality Gates)

1. **Compuerta de Revisión de Código** — El Pull Request debe ser aprobado por al menos un miembro del equipo antes de iniciar las pruebas.
2. **Compuerta de Pruebas Unitarias** — Todas las pruebas unitarias y de componentes deben pasar antes de iniciar las pruebas de integración.
3. **Compuerta de Pruebas de Integración** — La suite de pruebas E2E completa debe pasar antes de activar el pipeline de CI/CD.
4. **Compuerta de Prueba de Humo** — La suite de pytest post-despliegue debe pasar antes de transferir el tráfico a producción.
5. **Rollback Automático** — La estrategia Blue/Green permite revertir el tráfico instantáneamente si alguna compuerta falla en producción.
6. **Automatización con Jira** — Cualquier falla en la prueba de humo genera automáticamente una incidencia rastreada en el backlog del proyecto.

---

_Administrador de Proyectos v1.0.0 · Tecnológico de Monterrey · Junio 2026_

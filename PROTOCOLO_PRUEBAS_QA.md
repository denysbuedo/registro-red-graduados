# Protocolo de Pruebas de Usuario (QA) - Red de Egresados Internacionales

Este documento describe las pruebas esenciales que deben realizarse antes de pasar a producción.

## 1. Pruebas de Acceso Público y Registro
| Caso de Prueba | Acción | Resultado Esperado |
| :--- | :--- | :--- |
| **Carga de Home** | Acceder a `https://egresados.mes.gob.cu` | La landing page carga con diseño premium y sin errores 500. |
| **Registro Nuevo** | Ir a "Unirse a la Red" y completar el formulario | El sistema guarda los datos y redirige a `/pendiente`. |
| **Privacidad Pendiente** | Intentar entrar a `/directorio` siendo usuario pendiente | Debe redirigir automáticamente a `/pendiente`. |
| **Login Erróneo** | Intentar login con usuario inexistente | Mostrar mensaje de "Credenciales inválidas". |

## 2. Pruebas de Administrador (DINFO)
*Utilizar usuario con rol `admin`*

| Caso de Prueba | Acción | Resultado Esperado |
| :--- | :--- | :--- |
| **Acceso al Panel** | Entrar en "Panel Admin" desde el menú | Ver dashboard con estadísticas globales. |
| **Aprobación** | Buscar un usuario "Pendiente" y darle a "Aprobar" | El usuario cambia a estado "Approved" y ya puede entrar al directorio. |
| **Rechazo** | Rechazar un usuario indicando un motivo | El usuario no podrá acceder y debería ver su motivo de rechazo (si aplica). |

## 3. Pruebas de Rol Ministerial (DRI)
*Utilizar usuario con rol `dri` y un ministerio asignado (ej. MINSAP)*

| Caso de Prueba | Acción | Resultado Esperado |
| :--- | :--- | :--- |
| **Filtro de Ministerio** | Ver lista de graduados | Solo deben aparecer graduados de las universidades pertenecientes a su ministerio. |
| **Gestión Limitada** | Intentar aprobar a un usuario de otro ministerio | El sistema no debe mostrarle usuarios fuera de su alcance. |

## 4. Pruebas de Rol Institución (Universidad)
*Utilizar usuario con rol `institution` (ej. UCI)*

| Caso de Prueba | Acción | Resultado Esperado |
| :--- | :--- | :--- |
| **Filtro Institucional** | Acceder al panel de su institución | Solo ve graduados de su propia universidad. |

## 5. Pruebas de Funcionalidad del Graduado
*Utilizar un usuario ya aprobado*

| Caso de Prueba | Acción | Resultado Esperado |
| :--- | :--- | :--- |
| **Edición de Perfil** | Ir a su perfil y cambiar su "Profesión Actual" | Los cambios se guardan y se ven reflejados inmediatamente. |
| **Búsqueda** | Usar los filtros del directorio (País, Carrera) | Los resultados deben filtrarse correctamente según los criterios. |
| **Cierre de Sesión** | Click en "Cerrar Sesión" | El sistema destruye la cookie y redirige al Home. |

## 6. Pruebas Técnicas de Infraestructura
*   **SSL**: Verificar que el candado esté en verde (HAProxy).
*   **Persistencia**: Reiniciar el servidor y verificar que los usuarios sigan existiendo (`prod.db` persistente).
*   **Logs**: Ejecutar `pm2 logs` mientras se hacen las pruebas para detectar errores silenciosos.

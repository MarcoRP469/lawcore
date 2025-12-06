-- Actualizaciones para el sistema de roles y perfil extendido

-- 1. Agregar nuevas columnas a la tabla 'usuarios'
ALTER TABLE usuarios
ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'public',
ADD COLUMN bio TEXT NULL,
ADD COLUMN telefono VARCHAR(20) NULL,
ADD COLUMN updated_by VARCHAR(128) NULL,
ADD COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 2. Migrar datos existentes de 'es_admin' a 'role'
-- Si es_admin es 1 (True), asignar 'superadmin'. Si es 0, 'public'.
UPDATE usuarios SET role = 'superadmin' WHERE es_admin = 1;
UPDATE usuarios SET role = 'public' WHERE es_admin = 0;

-- 3. Agregar columna 'usuario_id' a la tabla 'notarias'
ALTER TABLE notarias
ADD COLUMN usuario_id VARCHAR(128) NULL;

-- 4. Asignar todas las notarias existentes al primer superadmin encontrado
-- NOTA: Si tienes un ID específico de admin, puedes reemplazar la subconsulta:
-- UPDATE notarias SET usuario_id = 'TU_ID_DE_ADMIN_AQUI';
UPDATE notarias
SET usuario_id = (SELECT id FROM usuarios WHERE role = 'superadmin' LIMIT 1)
WHERE usuario_id IS NULL;

-- 5. Crear clave foránea para asegurar integridad referencial
-- (Asegúrate de que todos los registros tengan usuario_id válido antes de ejecutar esto)
ALTER TABLE notarias
ADD CONSTRAINT fk_notarias_usuario
FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
ON DELETE SET NULL ON UPDATE CASCADE;

-- 6. (Opcional) Limpiar columna obsoleta si se desea,
-- aunque se recomienda mantenerla un tiempo por compatibilidad.
-- ALTER TABLE usuarios DROP COLUMN es_admin;

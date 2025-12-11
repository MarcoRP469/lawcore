-- Crear la base de datos y usarla
CREATE DATABASE IF NOT EXISTS `lawcore_db`
  DEFAULT CHARACTER SET = utf8mb4
  DEFAULT COLLATE = utf8mb4_unicode_ci;
USE `lawcore_db`;

-- Desactivar temporalmente comprobaciones de FK para importación segura
SET FOREIGN_KEY_CHECKS = 0;

-- Tabla padre: usuarios
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hashed_password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `foto_url` text COLLATE utf8mb4_unicode_ci,
  `es_admin` tinyint(1) NOT NULL DEFAULT '0',
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'public',
  `bio` text COLLATE utf8mb4_unicode_ci,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_usuarios_correo` (`correo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla padre: notarias
DROP TABLE IF EXISTS `notarias`;
CREATE TABLE `notarias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `distrito` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono_fijo` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sitio_web` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `facebook_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `instagram_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tiktok_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `linkedin_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `disponible` tinyint(1) NOT NULL DEFAULT '0',
  `avatar_url` text COLLATE utf8mb4_unicode_ci,
  `calificacion` decimal(3,2) NOT NULL DEFAULT '0.00',
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `resumen_coment` text COLLATE utf8mb4_unicode_ci,
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `usuario_id` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_notarias_usuario` (`usuario_id`),
  CONSTRAINT `fk_notarias_usuario` FOREIGN KEY (`usuario_id`)
    REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tablas dependientes
DROP TABLE IF EXISTS `notaria_servicios_generales`;
CREATE TABLE `notaria_servicios_generales` (
  `notaria_id` int NOT NULL,
  `servicio` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`notaria_id`, `servicio`),
  CONSTRAINT `fk_nsg_notaria` FOREIGN KEY (`notaria_id`)
    REFERENCES `notarias` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `servicios_detallados`;
CREATE TABLE `servicios_detallados` (
  `id` int NOT NULL AUTO_INCREMENT,
  `notaria_id` int NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `requisitos` json DEFAULT NULL,
  `imagenes` json DEFAULT NULL,
  `video_url` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `ix_sd_notaria` (`notaria_id`),
  CONSTRAINT `fk_sd_notaria` FOREIGN KEY (`notaria_id`)
    REFERENCES `notarias` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=508 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `comentarios`;
CREATE TABLE `comentarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `notaria_id` int NOT NULL,
  `usuario_id` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `puntaje` int NOT NULL,
  `texto` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_com_notaria` (`notaria_id`),
  KEY `ix_com_usuario` (`usuario_id`),
  CONSTRAINT `fk_com_notaria` FOREIGN KEY (`notaria_id`)
    REFERENCES `notarias` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_com_usuario` FOREIGN KEY (`usuario_id`)
    REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `registros_busqueda`;
CREATE TABLE `registros_busqueda` (
  `id` int NOT NULL AUTO_INCREMENT,
  `termino` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario_id` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT (now()),
  `cantidad_resultados` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_registros_busqueda_termino` (`termino`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `notaria_visitas`;
CREATE TABLE `notaria_visitas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `notaria_id` int NOT NULL,
  `creado_en` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `notaria_id` (`notaria_id`),
  CONSTRAINT `notaria_visitas_ibfk_1` FOREIGN KEY (`notaria_id`)
    REFERENCES `notarias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reactivar comprobaciones de FK
SET FOREIGN_KEY_CHECKS = 1;

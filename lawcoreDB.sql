DROP DATABASE IF EXISTS lawcore_db;
CREATE DATABASE lawcore_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
USE lawcore_db;

-- -----------------------------------------------------
-- Tabla: usuarios
-- -----------------------------------------------------
CREATE TABLE `usuarios` (
  `id`              VARCHAR(128)  NOT NULL,
  `nombre`          VARCHAR(255)  NULL,
  `correo`          VARCHAR(255)  NOT NULL,
  `hashed_password` VARCHAR(255)  NOT NULL,
  `foto_url`        TEXT          NULL,
  `es_admin`        BOOLEAN       NOT NULL DEFAULT FALSE,
  `creado_en`       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `ux_usuarios_correo` (`correo` ASC)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Tabla: notarias
-- -----------------------------------------------------
CREATE TABLE `notarias` (
  `id`              INT           NOT NULL AUTO_INCREMENT,
  `nombre`          VARCHAR(255)  NOT NULL,
  `direccion`       VARCHAR(255)  NOT NULL,
  `distrito`        VARCHAR(100)  NOT NULL,
  `telefono`        VARCHAR(20)   NOT NULL,
  `telefono_fijo`   VARCHAR(20)   NULL,
  `correo`          VARCHAR(255)  NOT NULL,
  `sitio_web`       VARCHAR(255)  NULL,
  `facebook_url`    VARCHAR(255)  NULL,
  `instagram_url`   VARCHAR(255)  NULL,
  `tiktok_url`      VARCHAR(255)  NULL,
  `linkedin_url`    VARCHAR(255)  NULL,
  `disponible`      BOOLEAN       NOT NULL DEFAULT FALSE,
  `avatar_url`      TEXT          NULL,
  `calificacion`    DECIMAL(3,2)  NOT NULL DEFAULT 0.00,
  `observaciones`   TEXT          NULL,
  `resumen_coment`  TEXT          NULL,
  `creado_en`       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Tabla: notaria_servicios_generales
-- -----------------------------------------------------
CREATE TABLE `notaria_servicios_generales` (
  `notaria_id`   INT           NOT NULL,
  `servicio`     VARCHAR(100)  NOT NULL,
  PRIMARY KEY (`notaria_id`, `servicio`),
  CONSTRAINT `fk_nsg_notaria`
    FOREIGN KEY (`notaria_id`)
    REFERENCES `notarias` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Tabla: servicios_detallados
-- -----------------------------------------------------
CREATE TABLE `servicios_detallados` (
  `id`          INT           NOT NULL AUTO_INCREMENT,
  `notaria_id`  INT           NOT NULL,
  `slug`        VARCHAR(255)  NOT NULL,
  `nombre`      VARCHAR(255)  NOT NULL,
  `precio`      DECIMAL(10,2) NULL,
  `requisitos`  JSON          NULL,  -- Lista de requisitos (JSON).
  `imagenes`    JSON          NULL,  -- Lista de URLs de imágenes (JSON).
  `video_url`   TEXT          NULL,
  PRIMARY KEY (`id`),
  INDEX `ix_sd_notaria` (`notaria_id` ASC),
  CONSTRAINT `fk_sd_notaria`
    FOREIGN KEY (`notaria_id`)
    REFERENCES `notarias` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Tabla: comentarios
-- -----------------------------------------------------
CREATE TABLE `comentarios` (
  `id`          INT           NOT NULL AUTO_INCREMENT,
  `notaria_id`  INT           NOT NULL,
  `usuario_id`  VARCHAR(128)  NOT NULL,
  `puntaje`     INT           NOT NULL,   -- Sugerido 1..5
  `texto`       TEXT          NOT NULL,
  `creado_en`   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `ix_com_notaria` (`notaria_id` ASC),
  INDEX `ix_com_usuario` (`usuario_id` ASC),
  CONSTRAINT `fk_com_notaria`
    FOREIGN KEY (`notaria_id`)
    REFERENCES `notarias` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_com_usuario`
    FOREIGN KEY (`usuario_id`)
    REFERENCES `usuarios` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

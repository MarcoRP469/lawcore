-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: lawcore_db
-- ------------------------------------------------------
-- Server version	9.5.0-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: lawcore_db
-- ------------------------------------------------------
-- Server version	9.5.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'be7eab97-cffd-11f0-b4fe-40c2bac7db81:1-245';

--
-- Table structure for table `anuncios`
--

DROP TABLE IF EXISTS `anuncios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `anuncios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `titulo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `tipo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `imagen_url` text COLLATE utf8mb4_unicode_ci,
  `contacto` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `anuncios_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `anuncios`
--

LOCK TABLES `anuncios` WRITE;
/*!40000 ALTER TABLE `anuncios` DISABLE KEYS */;
/*!40000 ALTER TABLE `anuncios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comentarios`
--

DROP TABLE IF EXISTS `comentarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  CONSTRAINT `fk_com_notaria` FOREIGN KEY (`notaria_id`) REFERENCES `notarias` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_com_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comentarios`
--

LOCK TABLES `comentarios` WRITE;
/*!40000 ALTER TABLE `comentarios` DISABLE KEYS */;
INSERT INTO `comentarios` VALUES (2,13,'1f9ad835-c959-4eb7-a1a7-24cdce04309a',4,'buen servicio','2025-12-05 12:20:28'),(3,13,'1f9ad835-c959-4eb7-a1a7-24cdce04309a',2,'una atencion lenta\n','2025-12-05 12:20:55'),(4,13,'82619e97-06f8-4b20-8be2-f5b773b265ff',4,'super lugar','2025-12-05 13:11:24'),(5,13,'30b5f0d2-0f71-43c3-98ad-3ce2dee7fb9d',2,'Deberia haber atencion preferencial\n','2025-12-11 07:16:48');
/*!40000 ALTER TABLE `comentarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_pagos`
--

DROP TABLE IF EXISTS `historial_pagos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_pagos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `plan_id` int DEFAULT NULL,
  `plan_nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Guardamos el nombre por si se elimina el plan',
  `monto` decimal(10,2) NOT NULL,
  `metodo_pago` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'transferencia, efectivo, tarjeta, etc',
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'pendiente, aprobado, rechazado',
  `referencia_pago` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Número de operación o referencia',
  `notas` text COLLATE utf8mb4_unicode_ci COMMENT 'Notas del admin sobre el pago',
  `aprobado_por` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT (now()),
  `aprobado_en` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `plan_id` (`plan_id`),
  KEY `aprobado_por` (`aprobado_por`),
  CONSTRAINT `historial_pagos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `historial_pagos_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `planes_suscripcion` (`id`) ON DELETE SET NULL,
  CONSTRAINT `historial_pagos_ibfk_3` FOREIGN KEY (`aprobado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_pagos`
--

LOCK TABLES `historial_pagos` WRITE;
/*!40000 ALTER TABLE `historial_pagos` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_pagos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notaria_servicios_generales`
--

DROP TABLE IF EXISTS `notaria_servicios_generales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notaria_servicios_generales` (
  `notaria_id` int NOT NULL,
  `servicio` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`notaria_id`,`servicio`),
  CONSTRAINT `fk_nsg_notaria` FOREIGN KEY (`notaria_id`) REFERENCES `notarias` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notaria_servicios_generales`
--

LOCK TABLES `notaria_servicios_generales` WRITE;
/*!40000 ALTER TABLE `notaria_servicios_generales` DISABLE KEYS */;
INSERT INTO `notaria_servicios_generales` VALUES (15,'Actas notariales'),(15,'Autenticación de firmas'),(15,'Poderes'),(15,'Transacciones Inmobiliarias'),(16,'Transferencia vehicular'),(17,'Constitución de empresas'),(17,'Donación de inmueble'),(17,'Prescripción adquisitiva o rectificación de áreas'),(17,'Rectificación de partida'),(17,'Separación convencional y divorcio ulterior'),(17,'Sucesión intestada'),(17,'Testamentos'),(17,'Transferencia vehicular'),(17,'Unión de hecho');
/*!40000 ALTER TABLE `notaria_servicios_generales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notaria_visitas`
--

DROP TABLE IF EXISTS `notaria_visitas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notaria_visitas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `notaria_id` int NOT NULL,
  `creado_en` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `notaria_id` (`notaria_id`),
  CONSTRAINT `notaria_visitas_ibfk_1` FOREIGN KEY (`notaria_id`) REFERENCES `notarias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notaria_visitas`
--

LOCK TABLES `notaria_visitas` WRITE;
/*!40000 ALTER TABLE `notaria_visitas` DISABLE KEYS */;
INSERT INTO `notaria_visitas` VALUES (1,13,'2025-12-07 02:04:48'),(2,13,'2025-12-07 02:04:48'),(3,13,'2025-12-08 03:36:13'),(4,13,'2025-12-08 03:36:13'),(5,13,'2025-12-08 05:53:52'),(6,13,'2025-12-08 05:53:52'),(7,13,'2025-12-08 06:37:28'),(8,13,'2025-12-08 06:37:28'),(9,13,'2025-12-08 06:46:44'),(10,13,'2025-12-08 06:46:44'),(11,17,'2025-12-08 07:30:37'),(12,17,'2025-12-08 07:30:37'),(13,13,'2025-12-08 07:34:52'),(14,13,'2025-12-08 07:34:52'),(15,16,'2025-12-08 13:03:23'),(16,16,'2025-12-08 13:03:23'),(17,13,'2025-12-11 07:16:07'),(18,13,'2025-12-11 07:16:07'),(19,13,'2025-12-11 07:16:50'),(20,13,'2025-12-11 07:17:41'),(21,13,'2025-12-11 07:17:42'),(22,13,'2025-12-11 10:22:35'),(23,13,'2025-12-11 10:22:35'),(24,13,'2025-12-11 12:22:20'),(25,13,'2025-12-11 12:22:20'),(26,15,'2025-12-11 12:38:32'),(27,15,'2025-12-11 12:38:33'),(28,13,'2025-12-11 12:42:40'),(29,13,'2025-12-11 12:42:40'),(30,13,'2025-12-11 12:43:24'),(31,13,'2025-12-11 12:43:24'),(32,15,'2025-12-11 12:49:57'),(33,15,'2025-12-11 12:49:57'),(34,13,'2025-12-11 13:14:33'),(35,13,'2025-12-11 13:14:33'),(36,15,'2025-12-11 13:15:15'),(37,15,'2025-12-11 13:15:15'),(38,13,'2025-12-11 13:17:10'),(39,13,'2025-12-11 13:17:10'),(40,13,'2025-12-11 13:18:44'),(41,13,'2025-12-11 13:18:45'),(42,13,'2025-12-11 13:19:23'),(43,13,'2025-12-11 13:21:36'),(44,13,'2025-12-11 13:21:36'),(45,13,'2025-12-11 13:21:46'),(46,13,'2025-12-11 13:22:39'),(47,15,'2025-12-11 13:22:49'),(48,15,'2025-12-11 13:22:49'),(49,13,'2025-12-11 13:23:23'),(50,13,'2025-12-11 13:23:23'),(51,13,'2025-12-11 13:33:42'),(52,13,'2025-12-11 13:34:40'),(53,13,'2025-12-11 13:36:35'),(54,13,'2025-12-11 13:36:35'),(55,13,'2025-12-11 13:44:22'),(56,13,'2025-12-11 13:44:23'),(57,13,'2025-12-11 13:44:26'),(58,15,'2025-12-11 13:48:33'),(59,15,'2025-12-11 13:48:33'),(60,13,'2025-12-11 13:48:39'),(61,13,'2025-12-11 13:48:39'),(62,15,'2025-12-11 13:48:46'),(63,15,'2025-12-11 13:48:46'),(64,15,'2025-12-11 13:49:16'),(65,15,'2025-12-11 13:49:16'),(66,13,'2025-12-11 13:52:15'),(67,13,'2025-12-11 13:52:16'),(68,13,'2025-12-11 13:52:53'),(69,13,'2025-12-11 13:52:53');
/*!40000 ALTER TABLE `notaria_visitas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notarias`
--

DROP TABLE IF EXISTS `notarias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  `auto_disponibilidad` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si true, calcula disponibilidad automáticamente según horarios',
  `horarios_json` json DEFAULT NULL COMMENT 'Horarios de atención por día de la semana',
  `avatar_url` text COLLATE utf8mb4_unicode_ci,
  `calificacion` decimal(3,2) NOT NULL DEFAULT '0.00',
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `resumen_coment` text COLLATE utf8mb4_unicode_ci,
  `latitud` float DEFAULT NULL COMMENT 'Latitud para busqueda por proximidad',
  `longitud` float DEFAULT NULL COMMENT 'Longitud para busqueda por proximidad',
  `total_visitas` int NOT NULL DEFAULT '0',
  `total_comentarios` int NOT NULL DEFAULT '0',
  `tasa_conversion` float NOT NULL DEFAULT '0' COMMENT 'Comentarios / Visitas',
  `relevancia_score` float NOT NULL DEFAULT '0' COMMENT 'Score de relevancia del algoritmo de ranking',
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `usuario_id` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_notarias_usuario` (`usuario_id`),
  CONSTRAINT `fk_notarias_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notarias`
--

LOCK TABLES `notarias` WRITE;
/*!40000 ALTER TABLE `notarias` DISABLE KEYS */;
INSERT INTO `notarias` VALUES (13,'Notaría Spetale','Jirón Larrea y Loredo 740. Huaraz. Ancash','Huaraz','943118185','(043) 421620','notario.informes@gmail.com','https://www.notarioperu.com/','https://www.facebook.com/notariaspetale/?locale=es_LA','https://www.instagram.com/notariaspetale/','','',1,0,NULL,'http://localhost:8000/uploads/b7b0923c-69d1-4c53-ae43-8b3974c78abc.jpg',3.06,'Lunes a viernes de 08:30 am a 1 pm y de 3 pm a 6:30 pm\nSábados de 9:00 a 13:00 horas\n\n','Basado en 4 comentarios, la percepción general es regular (calificación promedio de 3.0/5.0). Los usuarios mencionan frecuentemente: atencion, buen, servicio.',NULL,NULL,0,0,0,0,'2025-12-05 10:11:16','1f9ad835-c959-4eb7-a1a7-24cdce04309a'),(15,'Notaría Otárola','Jr. Sebastián Beas N°811','Huaraz','943 000 081','','fotarola40@hotmail.com','','https://www.facebook.com/p/Notar%C3%ADa-Ot%C3%A1rola-61550582866374/','https://www.instagram.com/fredy_otarola/?hl=es','','',1,0,NULL,'http://localhost:8000/uploads/4a87aec7-608c-4255-bc93-0746ffa3f300.jpg',3.00,'Horario de Atención:\nLunes a Viernes de 08:00am a 01:00pm y 03:00pm a 06:00pm\nSabados de 09:00am a 01:00pm ','No hay comentarios suficientes para generar un resumen.',NULL,NULL,0,0,0,0,'2025-12-08 07:27:11','30b5f0d2-0f71-43c3-98ad-3ce2dee7fb9d'),(16,'Notaría Manosalva','Jr. 28 de Julio N°706','Huaraz','980 681 769','','suann.mat@gmail.com','','https://www.facebook.com/profile.php?id=61566858330518&mibextid=ZbWKwL','https://www.instagram.com/reel/DF007p5Swm1/?utm_source=ig_web_copy_link','','',1,0,NULL,'http://localhost:8000/uploads/e42347d5-104c-4ea5-9e7a-afb7e188fedb.jpg',0.00,'Lunes a Viernes de 9:00am a 7:00pm\nSabado de 9:00am a 2:00pm','No hay comentarios suficientes para generar un resumen.',NULL,NULL,0,0,0,0,'2025-12-08 07:27:36','30b5f0d2-0f71-43c3-98ad-3ce2dee7fb9d'),(17,'Notaria ESTACIO','Jr. Jose de Sucre S/N - Segunda Cuadra','Huaraz','929970536','','informes@notariaestacio.com','','https://www.facebook.com/notariaestacio/?locale=es_LA','','','',1,0,NULL,'http://localhost:8000/uploads/77146afe-8a5a-4b27-864c-b5f6902fb052.jpg',2.78,'Segundo piso, Al costado de la compañia de Bombero - Comisaria Huaraz','No hay comentarios suficientes para generar un resumen.',NULL,NULL,0,0,0,0,'2025-12-08 07:27:59','30b5f0d2-0f71-43c3-98ad-3ce2dee7fb9d');
/*!40000 ALTER TABLE `notarias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `planes_suscripcion`
--

DROP TABLE IF EXISTS `planes_suscripcion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `planes_suscripcion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `precio` decimal(10,2) NOT NULL,
  `limite_anuncios` int DEFAULT NULL COMMENT 'NULL = ilimitado',
  `duracion_dias` int NOT NULL,
  `caracteristicas` json DEFAULT NULL COMMENT 'Array de características del plan',
  `activo` tinyint(1) NOT NULL,
  `creado_en` timestamp NOT NULL DEFAULT (now()),
  `actualizado_en` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `planes_suscripcion`
--

LOCK TABLES `planes_suscripcion` WRITE;
/*!40000 ALTER TABLE `planes_suscripcion` DISABLE KEYS */;
INSERT INTO `planes_suscripcion` VALUES (1,'Básico','Plan básico para empezar',29.00,3,30,'[\"Hasta 3 anuncios activos\", \"1 imagen por anuncio\", \"Soporte por email\"]',1,'2025-12-11 14:17:15',NULL),(2,'Profesional','Plan profesional con más beneficios',59.00,10,30,'[\"Hasta 10 anuncios activos\", \"3 imágenes por anuncio\", \"Anuncios destacados\", \"Soporte prioritario\"]',1,'2025-12-11 14:17:15',NULL),(3,'Empresarial','Plan empresarial sin límites',99.00,NULL,30,'[\"Anuncios ilimitados\", \"Imágenes ilimitadas\", \"Anuncios destacados\", \"Soporte 24/7\", \"Estadísticas avanzadas\"]',1,'2025-12-11 14:17:15',NULL);
/*!40000 ALTER TABLE `planes_suscripcion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registros_busqueda`
--

DROP TABLE IF EXISTS `registros_busqueda`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registros_busqueda` (
  `id` int NOT NULL AUTO_INCREMENT,
  `termino` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario_id` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT (now()),
  `cantidad_resultados` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_registros_busqueda_termino` (`termino`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registros_busqueda`
--

LOCK TABLES `registros_busqueda` WRITE;
/*!40000 ALTER TABLE `registros_busqueda` DISABLE KEYS */;
/*!40000 ALTER TABLE `registros_busqueda` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servicios_detallados`
--

DROP TABLE IF EXISTS `servicios_detallados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `servicios_detallados` (
  `id` int NOT NULL AUTO_INCREMENT,
  `notaria_id` int NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoria` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `requisitos` json DEFAULT NULL,
  `imagenes` json DEFAULT NULL,
  `video_url` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `ix_sd_notaria` (`notaria_id`),
  CONSTRAINT `fk_sd_notaria` FOREIGN KEY (`notaria_id`) REFERENCES `notarias` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=719 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servicios_detallados`
--

LOCK TABLES `servicios_detallados` WRITE;
/*!40000 ALTER TABLE `servicios_detallados` DISABLE KEYS */;
INSERT INTO `servicios_detallados` VALUES (400,16,'tranferencia-vehcular','TRANFERENCIA VEHÍCULAR',NULL,200.00,'[\"BOLETA INFORMATIVA\", \"TARJETA DE PROPIEDAD\", \"SOAT VIGENTE\", \"IMPUESTO VEHICULAR\", \"MEDIO DE PAGO (MAYOR A S/2000 0 $ 500).\", \"VIGENCIA DE PODER (PERSONA JURÍDICA)\", \"COPIAS DE DNI\", \"IDENTIFICACIÓN BIOMÉTRICA\"]','[]',''),(401,16,'constitucin-de-empresas','Constitución de empresas',NULL,400.00,'[\"Reserva de nombre – SUNARP.\", \"DNI del titular\", \"Minuta\", \"Capital de la empresa\", \"objetivo social\"]','[]',''),(402,16,'autorizacin-de-viaje','Autorización de viaje',NULL,50.00,'[\"copia de DNI del menor, padres, acompañantes\", \"identificación biometrica de quien autoriza\"]','[]',''),(403,16,'reconocimiento-de-unin-de-hecho-o-convivencia','reconocimiento de unión de hecho o convivencia',NULL,450.00,'[\"copia de DNI de los solicitantes(convivientes)\", \"certificado domiciliario de ambos solicitantes\", \"certificado negativo de unión de hecho de ambos conyugues SUNARP\", \"copia de DNI de los solicitantes\"]','[]',''),(404,17,'testamentos','Testamentos',NULL,800.00,'[\"Copia literal SUNARP o Testimonio de adquisición.\", \"Partida de Nacimiento de los Herederos Forzosos.\", \"2 Testigos mayores de 25 años (NO FAMILIARES).\", \"DNI (Testador, Testigos y Herederos Legales).\", \"Cita previa con el Notario.\", \"Identificación Biométrica – RENIEC.\"]','[]',''),(405,17,'constitucin-de-empresas','Constitución de empresas',NULL,450.00,'[\"Reserva de nombre – SUNARP.\", \"Listado de objetivos de la empresa.\", \"Órganos: gerencia – subgerencia – directorio.\", \"Inventario de bienes (Detallado por cada socio y/o depósito bancario).\", \"DNI de los socios.\", \"Identificación biométrica – RENIEC.\"]','[]',''),(406,17,'prescripcin-adquisitiva-o-rectificacin-de-reas','Prescripción adquisitiva o rectificación de áreas',NULL,500.00,'[\"Certificado literal de la partida o Testimonio de adquisición.\", \"Certificado de búsqueda catastral – SUNARP.\", \"Certificado de Zonificación municipal.\", \"Planos y memoria descriptiva visada por la Municipalidad.\", \"Constancia de posesión – Municipalidad.\", \"Declaraciones y pagos impuesto predial últimos 10 años.\", \"Constancia de pago de servicios públicos últimos 10 años.\", \"Medios probatorios de posesión de últimos 10 años.\", \"DNI.\"]','[]',''),(407,17,'transferencia-vehicular','Transferencia Vehicular',NULL,500.00,'[\"boleta informativa SUNARP\", \"tarjeta de propiedad\", \"SOAT vigente\", \"impuesto vehicular(excepto vehiculos con antiguedad de 3 años desde el año siguiente de inscripción en SUNARP)\", \"medio de pago a partir de 2000 a 500 (decreto legislativo 1529\", \"vigencia de poder persona jurídica o representante\", \"DNI comprador y vendedor\", \"identificación biometrica RENIEC\"]','[]',''),(408,17,'rectificacin-de-partidas','Rectificación de partidas',NULL,350.00,'[\"DNI \", \"acta materia de rectificación\", \"acta de nacimiento de padres\", \"acta de nacimiento de conyugue\", \"acta de nacimiento del fallecido\", \"identificación biométrica RENIEC\"]','[]',''),(409,17,'unin-de-hecho','Unión de Hecho',NULL,400.00,'[\"certificado domiciliario(ambas partes)\", \"certificado negativo de unión de hecho\", \"2 testigos (mayores de 25)\", \"identificación biométrica RENIEC\", \"medios probatorios(partidas de hijos, adquisición de propiedades, etc)\", \"DNI\"]','[]',''),(410,17,'separacin-convencional-y-divorcio-ulterior','Separación convencional y divorcio ulterior',NULL,550.00,'[\"partida de matrimonio (últimos 30 días)\", \"Hijos menores de edad(partida de nacimiento, sentencia judicial firme o acta de conciliación sobre tenencia, visitas y alimentos\", \"testimonio e inscripción del regimen de separación de bienes\", \"identificación biometrica RENIEC\", \"DNI\"]','[]',''),(411,17,'sucesin-intestada','Sucesión intestada',NULL,800.00,'[\"acta de defunción\", \"acta de nacimiento de los herederos\", \"acta de matrimonio del viudo\", \"certificación de inscripción en RENIEC del fallecido(ultimo domicilio)\", \"relación de bienes\", \"certificación negativa de sucesión intestada y testamento SUNARP\", \"DNI\", \"identificación biometrica - RENIEC\"]','[]',''),(412,17,'donacin-de-inmueble','Donación de inmueble',NULL,300.00,'[\"DNI comprador y vendedor\", \"copia literal SUNARP o testimonio de adquisición\", \"impuesto predial anual pagado\", \"constancia de \\\"NO ADEUDO\\\" o acreditación de pago de impuesto predial por 5 años consecutivos \", \"pago de impuesto alcabala(precio o valor de autoevaluo mayor a 10 UIT\", \"identificación biométrica - RENIEC\"]','[]',''),(679,13,'poderes-y-mandatos','Poderes y Mandatos',NULL,180.00,'[\"DNI del poderdante\", \"Datos completos del apoderado\"]','[\"http://localhost:8000/uploads/3ee35ad8-eaa4-4dde-b459-bbc9c8c50888.jpg\"]','<div style=\"position: relative; width: 100%; height: 0; padding-top: 56.2500%;\n padding-bottom: 0; box-shadow: 0 2px 8px 0 rgba(63,69,81,0.16); margin-top: 1.6em; margin-bottom: 0.9em; overflow: hidden;\n border-radius: 8px; will-change: transform;\">\n  <iframe loading=\"lazy\" style=\"position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none; padding: 0;margin: 0;\"\n    src=\"https://www.canva.com/design/DAG2SefQGSI/kqHl1BxuOwXDl-zzinPRCw/watch?embed\" allowfullscreen=\"allowfullscreen\" allow=\"fullscreen\">\n  </iframe>\n</div>\n<a href=\"https:&#x2F;&#x2F;www.canva.com&#x2F;design&#x2F;DAG2SefQGSI&#x2F;kqHl1BxuOwXDl-zzinPRCw&#x2F;watch?utm_content=DAG2SefQGSI&amp;utm_campaign=designshare&amp;utm_medium=embeds&amp;utm_source=link\" target=\"_blank\" rel=\"noopener\">HOLA</a> de Mayumi Aguedo Sáenz'),(680,13,'designacin-de-apoyos-y-salvaguardias','Designación de Apoyos y Salvaguardias',NULL,400.00,'[\"DNI del solicitante\", \"Solicitud\", \"Datos completos del apoyo\", \"Certificado psiquiátrico o psicológico del solicitante que acredite que está en condiciones de manifestar su voluntad\"]','[\"http://localhost:8000/uploads/3aa862c3-641d-405f-ace4-a5508243e68f.jpg\"]',''),(681,13,'separacin-de-patrimonios','Separación de Patrimonios','Asesoría Legal',350.00,'[\"DNIs de ambos cónyuges\", \"Partida de matrimonio (también puede otorgarse antes de la celebración del matrimonio)\", \"Relación de bienes propios y de la sociedad de gananciales\"]','[]',''),(682,13,'rectificacin-de-partidas','Rectificación de Partidas',NULL,470.00,'[\"DNI del solicitante\", \"Copia certificada de la partida que se desea rectificar\", \"Documentos que prueben la existencia de error u omisión, y sustenten la rectificación\"]','[]',''),(683,13,'testamento','Testamento',NULL,1000.00,'[\"DNI del testador\", \"Dos testigos mayores de edad no familiares, ni cónyuges entre si\", \"Datos completos de los herederos, legatarios, albacea\", \"Datos completos de los bienes del testador\", \"Certificado psiquiátrico o psicológico del testador\"]','[]',''),(684,13,'adopcion-de-personas-capaces','Adopcion de personas capaces',NULL,800.00,'[\"DNIs de los adoptantes y del adoptado\", \"Solicitud conteniendo la minuta de adopción firmada por abogado\", \"Acta de nacimiento del(los) adoptante(s)\", \"Acta de nacimiento del adoptado\", \"Acta de matrimonio de los adoptantes\", \"Acta de matrimonio del adoptado\"]','[]',''),(685,13,'reconocimiento-de-paternidad','Reconocimiento de Paternidad',NULL,180.00,'[\"DNI del padre\", \"Datos de la madre\", \"Datos del menor\"]','[]',''),(686,13,'autorizacin-de-viajes-de-menores-de-edad','Autorización de viajes de menores de edad',NULL,50.00,'[\"DNI de uno de los padres para viaje al interior del país, DNIs de ambos padres para viaje al exterior del país\", \"DNI y partida de nacimiento del menor\", \"Itinerario de viaje\", \"Datos completos de la persona con la que viajará el menor y de quien se hará cargo de sus estadía\"]','[]',''),(687,13,'constatacin-de-supervivencia','Constatación de Supervivencia',NULL,50.00,'[\"DNI del interesado\", \"Presencia física de la persona cuya supervivencia se verificará\"]','[]',''),(688,13,'sucesin-intestada','Sucesión Intestada',NULL,800.00,'[\"DNI del solicitante\", \"Relación de bienes conocidos del difunto\", \"Acta de defunción del causante\", \"Acta de matrimonio si el difunto era casado\", \"Actas de nacimiento de los hijos del difunto\", \"Certificados negativos de sucesión intestada y de testamento\"]','[]',''),(689,13,'reconocimiento-de-unin-de-hecho','Reconocimiento de Unión de Hecho',NULL,800.00,'[\"DNIs de ambos solicitantes\", \"Solicitud autorizada por abogado\", \"Certificado domiciliario de ambos solicitantes\", \"Certificado negativo de unión de hecho de ambos solicitantes\", \"Dos testigos\", \"Documentos que acrediten que la unión de hecho tiene por lo menos dos años continuos\"]','[]',''),(690,13,'separacin-convencional','Separación Convencional',NULL,500.00,'[\"DNIs de ambos cónyuges\", \"Solicitud autorizada por abogado\", \"Partida de matrimonio\", \"Declaración jurada de no tener hijos menores de edad o mayores con incapacidad\", \"Declaración jurada del último domicilio conyugal\", \"En caso de tener hijos menores de edad, deberán presentar sus partidas de nacimiento, y la sentencia judicial firme o acta de conciliación sobre la tenencia, régimen de visitas y alimentos\", \"En caso de tener hijos mayores de edad incapaces, deberán presentar sus partidas de nacimiento, y la sentencia judicial firme o acta de conciliación sobre la curatela, tenencia, régimen de visitas y alimentos\", \"En caso de tener bienes, presentar inscripción de separación de patrimonios\"]','[]',''),(691,13,'matrimonio-notarial','Matrimonio Notarial',NULL,1000.00,'[\"DNIs de los contrayentes\", \"Partidas de nacimiento originales actualizadas\", \"Certificado médico visado por el Ministerio de salud\", \"Dos testigos mayores de 25 años (residentes en Huaraz, que conozcan a los novios más de tres años)\"]','[]',''),(692,13,'constitucin-de-empresa-individual-de-responsabilidad-limitada','Constitución de empresa individual de responsabilidad limitada',NULL,380.00,'[\"DNI\", \"Minuta y estatuto conteniendo la denominación, el domicilio de la empresa, el objeto social, el monto del capital, los datos del gerente y demás información\", \"Relación de bienes que serán aportados a la empresa\"]','[]',''),(693,13,'constitucin-de-sociedades','Constitución de sociedades',NULL,280.00,'[\"DNIs de los socios\", \"Minuta y estatuto conteniendo la denominación, el domicilio de la empresa, el objeto social, el monto y distribución del capital, los datos del gerente, directores, y demás información\", \"Relación de bienes que serán aportados a la empresa\"]','[]',''),(694,13,'modificacin-de-estatutos','Modificación de estatutos',NULL,400.00,'[\"Copia de la escritura de constitución y estatuto\", \"Libro matricula de acciones\", \"Partida registral de la persona jurídica\", \"DNIs de las personas que firmarán la escritura\", \"Acta de la junta donde se acordó la modificación\", \"Cuando no son juntas universales proporcionar esquelas de convocatoria\"]','[]',''),(695,13,'nombramiento-de-gerentes','Nombramiento de gerentes',NULL,700.00,'[\"Copia de la escritura de constitución y estatuto de la empresa\", \"Libro de actas\", \"Partida registral de la sociedad\", \"DNIs de las personas que firmarán la escritura\", \"Acta de la junta donde se adoptó el acuerdo\", \"Cuando no son juntas universales proporcionar las constancias de convocatoria\"]','[]',''),(696,13,'designacin-o-revocacin-de-apoderados','Designación o revocación de apoderados',NULL,NULL,'[\"Copia de la escritura de constitución y estatuto\", \"Libro de actas y padrón de asociados\", \"Partida registral de la persona jurídica\", \"DNI del representante legal\", \"Acta de la asamblea donde se adoptó el acuerdo\", \"Cuando no son asambleas proporcionar las constancias de convocatoria y quorum\"]','[]',''),(697,13,'transferencia-de-acciones-o-participaciones','Transferencia de acciones o participaciones',NULL,400.00,'[\"Copia de la escritura de constitución y estatuto de la empresa\", \"Documento que acredite la propiedad de la acciones o participaciones\", \"Libro de actas\", \"Partida registral de la sociedad\", \"DNIs de las personas que firmarán la escritura\", \"Acta de la junta donde se acordó transferencia\"]','[]',''),(716,15,'compra-venta-de-bienes-inmuebles','Compra-Venta de Bienes Inmuebles','Derecho Inmobiliario',300.00,'[\"Copia Literal o Testimonio de Adquisición del Predio: Documento que acredita la titularidad del inmueble.\", \"AUTOVALÚO Cancelado hasta el Año en Curso (HR - PU - PR) y Constancia de No Adeudo: Comprobantes de que no existen deudas pendientes.\", \"Depósito Bancario o Cheque de Gerencia: Si el precio de venta es mayor a S/ 2,000 soles, el pago deberá realizarse por estas vías.\", \"DNI de Ambas Partes: Documento Nacional de Identidad de comprador y vendedor. En caso de que alguna de las partes no pueda firmar, se necesitará un testigo a ruego.\", \"Plano y Memoria Descriptiva: En caso de que solo se venda una parte del predio, se deben presentar estos documentos. Para Personas Jurídicas.\", \"Vigencia de Poder: Documento que acredite las facultades del representante legal.\", \"Ficha RUC: Documento donde se muestre el nombre y las facultades del gerente general.\", \"Recuerda que cada caso puede tener particularidades, así que te invitamos a agendar una cita con nosotros para una asesoría personalizada. ?✉️\"]','[]',''),(717,15,'autenticacin-de-firmas','Autenticación de Firmas','Autenticación de firmas',NULL,'[\"DNI\"]','[]',''),(718,15,'legalizacin-de-documentos','Legalización de Documentos','Protocolización de escrituras',NULL,'[\"Generalmente se requiere el documento original o una copia auténtica emitida por el mismo órgano que lo expidió. Las fotocopias simples no suelen ser suficientes.\"]','[]','');
/*!40000 ALTER TABLE `servicios_detallados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hashed_password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `foto_url` text COLLATE utf8mb4_unicode_ci,
  `es_admin` tinyint(1) NOT NULL DEFAULT '0',
  `plan_suscripcion` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ninguno' COMMENT 'Plan de suscripción actual',
  `fecha_inicio_suscripcion` timestamp NULL DEFAULT NULL COMMENT 'Fecha de inicio de la suscripción',
  `fecha_fin_suscripcion` timestamp NULL DEFAULT NULL COMMENT 'Fecha de fin de la suscripción',
  `estado_suscripcion` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'inactiva' COMMENT 'Estado: activa, inactiva, vencida',
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'public',
  `bio` text COLLATE utf8mb4_unicode_ci,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_usuarios_correo` (`correo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES ('1f9ad835-c959-4eb7-a1a7-24cdce04309a','Cliente','usuario@gmail.com','$2b$12$TUmX6mefsWpIWSmL7ID.4evOoG601wfQ4Kq6TsXYb821WM51YSFjy','',0,'ninguno',NULL,NULL,'inactiva','2025-12-05 12:02:57','client','','','1f9ad835-c959-4eb7-a1a7-24cdce04309a','2025-12-11 10:44:40'),('30b5f0d2-0f71-43c3-98ad-3ce2dee7fb9d','Marco Romero','marco@admin.com','$2b$12$hZFeulItYdbM9vdbjHmQRuiXMMS3UcOt1XMGSNWZ/HFfah.SabiS.','',1,'ninguno',NULL,NULL,'inactiva','2025-12-03 13:24:39','superadmin','','','30b5f0d2-0f71-43c3-98ad-3ce2dee7fb9d','2025-12-11 10:45:09'),('82619e97-06f8-4b20-8be2-f5b773b265ff','Salet Mayumi','salet@email.com','$2b$12$y.ngZFhwAg7Y4si2JU91ZeG0.GD/0IMFktayq3fayBAz2DTidXh4O','http://localhost:8000/uploads/de337c5d-56be-4da5-9847-83a9efb2ce0a.png',0,'ninguno',NULL,NULL,'inactiva','2025-12-05 12:45:26','public','','999999999','82619e97-06f8-4b20-8be2-f5b773b265ff','2025-12-11 12:07:16');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-11  9:41:57


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'be7eab97-cffd-11f0-b4fe-40c2bac7db81:1-166';

--
-- Table structure for table `comentarios`
--

DROP TABLE IF EXISTS `comentarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  CONSTRAINT `fk_com_notaria` FOREIGN KEY (`notaria_id`) REFERENCES `notarias` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_com_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notaria_servicios_generales`
--

DROP TABLE IF EXISTS `notaria_servicios_generales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notaria_servicios_generales` (
  `notaria_id` int NOT NULL,
  `servicio` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`notaria_id`,`servicio`),
  CONSTRAINT `fk_nsg_notaria` FOREIGN KEY (`notaria_id`) REFERENCES `notarias` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notaria_visitas`
--

DROP TABLE IF EXISTS `notaria_visitas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notaria_visitas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `notaria_id` int NOT NULL,
  `creado_en` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `notaria_id` (`notaria_id`),
  CONSTRAINT `notaria_visitas_ibfk_1` FOREIGN KEY (`notaria_id`) REFERENCES `notarias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notarias`
--

DROP TABLE IF EXISTS `notarias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  `latitud` float DEFAULT NULL COMMENT 'Latitud para busqueda por proximidad',
  `longitud` float DEFAULT NULL COMMENT 'Longitud para busqueda por proximidad',
  `total_visitas` int NOT NULL DEFAULT '0',
  `total_comentarios` int NOT NULL DEFAULT '0',
  `tasa_conversion` float NOT NULL DEFAULT '0' COMMENT 'Comentarios / Visitas',
  `relevancia_score` float NOT NULL DEFAULT '0' COMMENT 'Score de relevancia del algoritmo de ranking',
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `usuario_id` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_notarias_usuario` (`usuario_id`),
  CONSTRAINT `fk_notarias_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `registros_busqueda`
--

DROP TABLE IF EXISTS `registros_busqueda`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registros_busqueda` (
  `id` int NOT NULL AUTO_INCREMENT,
  `termino` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario_id` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT (now()),
  `cantidad_resultados` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_registros_busqueda_termino` (`termino`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `servicios_detallados`
--

DROP TABLE IF EXISTS `servicios_detallados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  CONSTRAINT `fk_sd_notaria` FOREIGN KEY (`notaria_id`) REFERENCES `notarias` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=527 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-11  2:31:32

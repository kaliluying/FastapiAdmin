-- MySQL dump 10.13  Distrib 9.6.0, for macos26.2 (arm64)
--
-- Host: 127.0.0.1    Database: fastapiadmin
-- ------------------------------------------------------
-- Server version	8.4.3

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `apscheduler_jobs`
--

DROP TABLE IF EXISTS `apscheduler_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `apscheduler_jobs` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `next_run_time` double DEFAULT NULL,
  `job_state` blob NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_apscheduler_jobs_next_run_time` (`next_run_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `apscheduler_jobs`
--

/*!40000 ALTER TABLE `apscheduler_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `apscheduler_jobs` ENABLE KEYS */;

--
-- Table structure for table `example_demo`
--

DROP TABLE IF EXISTS `example_demo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `example_demo` (
  `name` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '名称',
  `int_val` int DEFAULT NULL COMMENT '整数',
  `bigint_val` bigint DEFAULT NULL COMMENT '大整数',
  `float_val` float DEFAULT NULL COMMENT '浮点数',
  `bool_val` tinyint(1) NOT NULL COMMENT '布尔型',
  `date_val` date DEFAULT NULL COMMENT '日期',
  `time_val` time DEFAULT NULL COMMENT '时间',
  `datetime_val` datetime DEFAULT NULL COMMENT '日期时间',
  `text_val` text COLLATE utf8mb4_unicode_ci COMMENT '长文本',
  `json_val` json DEFAULT NULL COMMENT '元数据(JSON格式)',
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `uuid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID全局唯一标识',
  `status` int NOT NULL COMMENT '状态',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '备注/描述',
  `created_time` datetime NOT NULL COMMENT '创建时间',
  `updated_time` datetime NOT NULL COMMENT '更新时间',
  `is_deleted` tinyint(1) NOT NULL COMMENT '是否已删除(0:未删除 1:已删除)',
  `deleted_time` datetime DEFAULT NULL COMMENT '删除时间',
  `tenant_id` int NOT NULL COMMENT '租户ID',
  `created_id` int DEFAULT NULL COMMENT '创建人ID',
  `updated_id` int DEFAULT NULL COMMENT '更新人ID',
  `deleted_id` int DEFAULT NULL COMMENT '删除人ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_example_demo_uuid` (`uuid`),
  KEY `ix_example_demo_deleted_time` (`deleted_time`),
  KEY `ix_example_demo_tenant_id` (`tenant_id`),
  KEY `ix_example_demo_id` (`id`),
  KEY `ix_example_demo_deleted_id` (`deleted_id`),
  KEY `ix_example_demo_created_id` (`created_id`),
  KEY `ix_example_demo_updated_time` (`updated_time`),
  KEY `ix_example_demo_is_deleted` (`is_deleted`),
  KEY `ix_example_demo_status` (`status`),
  KEY `ix_example_demo_updated_id` (`updated_id`),
  KEY `ix_example_demo_created_time` (`created_time`),
  CONSTRAINT `example_demo_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `platform_tenant` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `example_demo_ibfk_2` FOREIGN KEY (`created_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `example_demo_ibfk_3` FOREIGN KEY (`updated_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `example_demo_ibfk_4` FOREIGN KEY (`deleted_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='示例表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `example_demo`
--

/*!40000 ALTER TABLE `example_demo` DISABLE KEYS */;
INSERT INTO `example_demo` VALUES ('用户管理模块',15,15000,99.99,1,'2025-06-01','09:00:00','2025-06-01 09:00:00','用户管理模块提供用户注册、登录、权限分配、个人中心等完整功能。','{\"tags\": [\"user\", \"auth\"], \"author\": \"admin\", \"version\": \"1.0\"}',1,'55119bd8-63ee-4802-89d8-39608db174a2',0,'用户管理核心模块','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('订单支付模块',28,300000,199.5,1,'2025-06-15','14:30:00','2025-06-15 14:30:00','订单支付模块支持微信支付、支付宝、银行卡等多种支付方式，包含支付回调、退款处理等。','{\"tags\": [\"order\", \"payment\", \"refund\"], \"author\": \"payment-team\", \"version\": \"2.1\"}',2,'ee2f4604-eec5-4e90-bd4d-2a16fb820aaa',0,'订单与支付核心模块','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('消息通知模块',8,5000,0,0,'2025-07-01','08:00:00','2025-07-01 08:00:00','消息通知模块支持站内信、邮件、短信等多渠道通知推送。','{\"tags\": [\"notification\", \"email\", \"sms\"], \"author\": \"dev-team\", \"version\": \"0.9\"}',3,'6865da06-9cae-4917-a39e-0ffc4e9848b3',1,'消息通知服务模块（开发中）','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('数据分析报表',42,1000000,499,1,'2025-08-01','10:00:00','2025-08-01 10:00:00','数据分析报表模块提供可视化图表、数据导出、实时监控大屏等高级分析功能。','{\"tags\": [\"analytics\", \"dashboard\", \"report\", \"chart\"], \"author\": \"data-team\", \"version\": \"3.0\"}',4,'9213c43f-e119-4fb4-bdab-d66661662f24',0,'高级数据分析与报表模块','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('文件存储服务',20,50000,29.9,1,'2025-09-01','16:00:00','2025-09-01 16:00:00','文件存储服务支持本地存储、阿里云OSS、腾讯云COS等多种存储后端，提供文件上传、下载、预览等接口。','{\"tags\": [\"storage\", \"oss\", \"upload\"], \"author\": \"infra-team\", \"version\": \"1.5\"}',5,'1aae227e-1fc5-4b4f-abc9-ba461e5a14c0',0,'文件存储与 CDN 加速服务','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('测试占位模块',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,'null',6,'64a6d9be-4a59-4aed-817a-08880b8e73fc',1,'仅用于测试空值处理','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL);
/*!40000 ALTER TABLE `example_demo` ENABLE KEYS */;

--
-- Table structure for table `gen_table`
--

DROP TABLE IF EXISTS `gen_table`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gen_table` (
  `table_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '表名称',
  `table_comment` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '表描述',
  `class_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '实体类名称',
  `package_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '生成包路径',
  `module_name` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '生成模块名',
  `business_name` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '生成业务名',
  `function_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '生成功能名',
  `sub_table_name` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '关联子表的表名',
  `sub_table_fk_name` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '子表关联的外键名',
  `parent_menu_id` int DEFAULT NULL COMMENT '父菜单ID',
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `uuid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID全局唯一标识',
  `status` int NOT NULL COMMENT '状态',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '备注/描述',
  `created_time` datetime NOT NULL COMMENT '创建时间',
  `updated_time` datetime NOT NULL COMMENT '更新时间',
  `is_deleted` tinyint(1) NOT NULL COMMENT '是否已删除(0:未删除 1:已删除)',
  `deleted_time` datetime DEFAULT NULL COMMENT '删除时间',
  `tenant_id` int NOT NULL COMMENT '租户ID',
  `created_id` int DEFAULT NULL COMMENT '创建人ID',
  `updated_id` int DEFAULT NULL COMMENT '更新人ID',
  `deleted_id` int DEFAULT NULL COMMENT '删除人ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_gen_table_uuid` (`uuid`),
  KEY `ix_gen_table_updated_id` (`updated_id`),
  KEY `ix_gen_table_created_time` (`created_time`),
  KEY `ix_gen_table_deleted_time` (`deleted_time`),
  KEY `ix_gen_table_tenant_id` (`tenant_id`),
  KEY `ix_gen_table_deleted_id` (`deleted_id`),
  KEY `ix_gen_table_created_id` (`created_id`),
  KEY `ix_gen_table_updated_time` (`updated_time`),
  KEY `ix_gen_table_id` (`id`),
  KEY `ix_gen_table_is_deleted` (`is_deleted`),
  KEY `ix_gen_table_status` (`status`),
  CONSTRAINT `gen_table_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `platform_tenant` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `gen_table_ibfk_2` FOREIGN KEY (`created_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `gen_table_ibfk_3` FOREIGN KEY (`updated_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `gen_table_ibfk_4` FOREIGN KEY (`deleted_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='代码生成表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gen_table`
--

/*!40000 ALTER TABLE `gen_table` DISABLE KEYS */;
/*!40000 ALTER TABLE `gen_table` ENABLE KEYS */;

--
-- Table structure for table `gen_table_column`
--

DROP TABLE IF EXISTS `gen_table_column`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gen_table_column` (
  `column_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '列名称',
  `column_comment` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '列描述',
  `column_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '列类型',
  `column_length` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '列长度',
  `column_default` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '列默认值',
  `is_pk` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否主键',
  `is_increment` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否自增',
  `is_nullable` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否允许为空',
  `is_unique` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否唯一',
  `python_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Python类型',
  `python_field` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Python字段名',
  `is_insert` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否为新增字段',
  `is_edit` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否编辑字段',
  `is_list` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否列表字段',
  `is_query` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否查询字段',
  `query_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '查询方式',
  `html_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '显示类型',
  `dict_type` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '字典类型',
  `sort` int NOT NULL COMMENT '排序',
  `table_id` int NOT NULL COMMENT '归属表编号',
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `uuid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID全局唯一标识',
  `status` int NOT NULL COMMENT '状态',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '备注/描述',
  `created_time` datetime NOT NULL COMMENT '创建时间',
  `updated_time` datetime NOT NULL COMMENT '更新时间',
  `is_deleted` tinyint(1) NOT NULL COMMENT '是否已删除(0:未删除 1:已删除)',
  `deleted_time` datetime DEFAULT NULL COMMENT '删除时间',
  `tenant_id` int NOT NULL COMMENT '租户ID',
  `created_id` int DEFAULT NULL COMMENT '创建人ID',
  `updated_id` int DEFAULT NULL COMMENT '更新人ID',
  `deleted_id` int DEFAULT NULL COMMENT '删除人ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_gen_table_column_uuid` (`uuid`),
  KEY `ix_gen_table_column_updated_time` (`updated_time`),
  KEY `ix_gen_table_column_tenant_id` (`tenant_id`),
  KEY `ix_gen_table_column_deleted_id` (`deleted_id`),
  KEY `ix_gen_table_column_created_id` (`created_id`),
  KEY `ix_gen_table_column_table_id` (`table_id`),
  KEY `ix_gen_table_column_id` (`id`),
  KEY `ix_gen_table_column_is_deleted` (`is_deleted`),
  KEY `ix_gen_table_column_status` (`status`),
  KEY `ix_gen_table_column_created_time` (`created_time`),
  KEY `ix_gen_table_column_updated_id` (`updated_id`),
  KEY `ix_gen_table_column_deleted_time` (`deleted_time`),
  CONSTRAINT `gen_table_column_ibfk_1` FOREIGN KEY (`table_id`) REFERENCES `gen_table` (`id`) ON DELETE CASCADE,
  CONSTRAINT `gen_table_column_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `platform_tenant` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `gen_table_column_ibfk_3` FOREIGN KEY (`created_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `gen_table_column_ibfk_4` FOREIGN KEY (`updated_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `gen_table_column_ibfk_5` FOREIGN KEY (`deleted_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='代码生成表字段';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gen_table_column`
--

/*!40000 ALTER TABLE `gen_table_column` DISABLE KEYS */;
/*!40000 ALTER TABLE `gen_table_column` ENABLE KEYS */;

--
-- Table structure for table `platform_email_config`
--

DROP TABLE IF EXISTS `platform_email_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `platform_email_config` (
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '配置名称',
  `smtp_host` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'SMTP 服务器地址',
  `smtp_port` int NOT NULL COMMENT 'SMTP 端口（465=SSL, 587=TLS）',
  `smtp_user` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'SMTP 登录用户名（发件邮箱）',
  `smtp_password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'SMTP 授权密码（AES 加密存储）',
  `from_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '发件人显示名',
  `use_tls` tinyint(1) NOT NULL COMMENT '是否启用 SSL/TLS',
  `is_default` tinyint(1) NOT NULL COMMENT '是否为默认配置',
  `timeout` int NOT NULL COMMENT '连接超时（秒）',
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `uuid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID全局唯一标识',
  `status` int NOT NULL COMMENT '状态',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '备注/描述',
  `created_time` datetime NOT NULL COMMENT '创建时间',
  `updated_time` datetime NOT NULL COMMENT '更新时间',
  `is_deleted` tinyint(1) NOT NULL COMMENT '是否已删除(0:未删除 1:已删除)',
  `deleted_time` datetime DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `ix_platform_email_config_uuid` (`uuid`),
  KEY `ix_platform_email_config_is_deleted` (`is_deleted`),
  KEY `ix_platform_email_config_deleted_time` (`deleted_time`),
  KEY `ix_platform_email_config_created_time` (`created_time`),
  KEY `ix_platform_email_config_id` (`id`),
  KEY `ix_platform_email_config_status` (`status`),
  KEY `ix_platform_email_config_updated_time` (`updated_time`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='邮件 SMTP 配置表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platform_email_config`
--

/*!40000 ALTER TABLE `platform_email_config` DISABLE KEYS */;
INSERT INTO `platform_email_config` VALUES ('默认SMTP','smtp.example.com',465,'noreply@fastapiadmin.com','PLACEHOLDER_AES_ENCRYPTED','FastapiAdmin',1,1,30,1,'cb3deb50-6811-4fc3-a9f3-39794206f208',0,'平台默认SMTP配置','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL);
/*!40000 ALTER TABLE `platform_email_config` ENABLE KEYS */;

--
-- Table structure for table `platform_email_log`
--

DROP TABLE IF EXISTS `platform_email_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `platform_email_log` (
  `config_id` int DEFAULT NULL COMMENT '使用的 SMTP 配置 ID',
  `template_code` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '模板编码（冗余存储，模板删除后仍可追溯）',
  `to_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '收件人邮箱',
  `to_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '收件人姓名',
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '邮件主题（渲染后）',
  `biz_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '业务类型（register/reset_password/invite/expiry_warning/ticket_reply/other）',
  `error_msg` text COLLATE utf8mb4_unicode_ci COMMENT '失败原因',
  `retry_count` int NOT NULL COMMENT '重试次数',
  `tenant_id` int DEFAULT NULL COMMENT '关联租户 ID（可为空，如平台注册邮件）',
  `sent_time` datetime DEFAULT NULL COMMENT '实际发送时间',
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `uuid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID全局唯一标识',
  `status` int NOT NULL COMMENT '状态',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '备注/描述',
  `created_time` datetime NOT NULL COMMENT '创建时间',
  `updated_time` datetime NOT NULL COMMENT '更新时间',
  `is_deleted` tinyint(1) NOT NULL COMMENT '是否已删除(0:未删除 1:已删除)',
  `deleted_time` datetime DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_platform_email_log_uuid` (`uuid`),
  KEY `ix_platform_email_log_to_email` (`to_email`),
  KEY `ix_platform_email_log_updated_time` (`updated_time`),
  KEY `ix_platform_email_log_config_id` (`config_id`),
  KEY `ix_platform_email_log_is_deleted` (`is_deleted`),
  KEY `ix_platform_email_log_tenant_id` (`tenant_id`),
  KEY `ix_platform_email_log_status` (`status`),
  KEY `ix_platform_email_log_created_time` (`created_time`),
  KEY `ix_platform_email_log_id` (`id`),
  KEY `ix_platform_email_log_deleted_time` (`deleted_time`),
  CONSTRAINT `platform_email_log_ibfk_1` FOREIGN KEY (`config_id`) REFERENCES `platform_email_config` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='邮件发送日志表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platform_email_log`
--

/*!40000 ALTER TABLE `platform_email_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `platform_email_log` ENABLE KEYS */;

--
-- Table structure for table `platform_email_template`
--

DROP TABLE IF EXISTS `platform_email_template`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `platform_email_template` (
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '模板名称',
  `template_code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '模板编码（业务键）',
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '邮件主题（可含变量）',
  `body_html` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '邮件正文 HTML（Jinja2 模板）',
  `body_text` text COLLATE utf8mb4_unicode_ci COMMENT '邮件纯文本版本（降级用）',
  `variables` text COLLATE utf8mb4_unicode_ci COMMENT '模板变量说明（JSON 格式，如 {"username": "用户名", "link": "链接"}）',
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `uuid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID全局唯一标识',
  `status` int NOT NULL COMMENT '状态',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '备注/描述',
  `created_time` datetime NOT NULL COMMENT '创建时间',
  `updated_time` datetime NOT NULL COMMENT '更新时间',
  `is_deleted` tinyint(1) NOT NULL COMMENT '是否已删除(0:未删除 1:已删除)',
  `deleted_time` datetime DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `template_code` (`template_code`),
  UNIQUE KEY `ix_platform_email_template_uuid` (`uuid`),
  KEY `ix_platform_email_template_is_deleted` (`is_deleted`),
  KEY `ix_platform_email_template_created_time` (`created_time`),
  KEY `ix_platform_email_template_id` (`id`),
  KEY `ix_platform_email_template_deleted_time` (`deleted_time`),
  KEY `ix_platform_email_template_updated_time` (`updated_time`),
  KEY `ix_platform_email_template_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='邮件模板表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platform_email_template`
--

/*!40000 ALTER TABLE `platform_email_template` DISABLE KEYS */;
INSERT INTO `platform_email_template` VALUES ('注册验证码','register_code','【FastapiAdmin】注册验证码','<div style=\'max-width:600px;margin:0 auto;padding:20px;font-family:Arial,sans-serif;background:#f5f7fa;border-radius:8px;\'><div style=\'background:#fff;padding:30px;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.08);\'><h2 style=\'color:#1a1a2e;margin-top:0;\'>欢迎注册 FastapiAdmin</h2><p style=\'color:#666;font-size:15px;line-height:1.8;\'>{username} 您好：</p><p style=\'color:#666;font-size:15px;line-height:1.8;\'>您的验证码是：</p><div style=\'background:linear-gradient(135deg,#667eea,#764ba2);padding:16px 24px;border-radius:6px;text-align:center;margin:20px 0;\'><span style=\'color:#fff;font-size:28px;font-weight:bold;letter-spacing:6px;\'>{{ code }}</span></div><p style=\'color:#999;font-size:13px;line-height:1.6;\'>验证码 5 分钟内有效，请勿泄露给他人。</p><hr style=\'border:none;border-top:1px solid #eee;margin:24px 0;\'><p style=\'color:#bbb;font-size:12px;text-align:center;\'>此邮件由系统自动发送，请勿回复。</p></div></div>','欢迎注册 FastapiAdmin\n\n{username} 您好：\n\n您的验证码是：{{ code }}\n\n验证码 5 分钟内有效，请勿泄露给他人。\n\n此邮件由系统自动发送，请勿回复。','{\"username\":\"用户名\",\"code\":\"验证码\"}',1,'23789eb7-c316-4337-a63c-0da5f6b3eb3d',0,'用户注册发送邮箱验证码','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('密码重置','reset_password','【FastapiAdmin】密码重置','<div style=\'max-width:600px;margin:0 auto;padding:20px;font-family:Arial,sans-serif;background:#f5f7fa;border-radius:8px;\'><div style=\'background:#fff;padding:30px;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.08);\'><h2 style=\'color:#1a1a2e;margin-top:0;\'>密码重置</h2><p style=\'color:#666;font-size:15px;line-height:1.8;\'>{username} 您好：</p><p style=\'color:#666;font-size:15px;line-height:1.8;\'>您正在申请重置密码，点击下方链接设置新密码（30 分钟内有效）：</p><div style=\'text-align:center;margin:24px 0;\'><a href=\'{{ reset_link }}\' style=\'display:inline-block;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-size:16px;font-weight:bold;\'>重置密码</a></div><p style=\'color:#999;font-size:13px;\'>如非本人操作，请忽略此邮件。</p><hr style=\'border:none;border-top:1px solid #eee;margin:24px 0;\'><p style=\'color:#bbb;font-size:12px;text-align:center;\'>此邮件由系统自动发送，请勿回复。</p></div></div>','密码重置\n\n{username} 您好：\n\n您正在申请重置密码，请点击以下链接设置新密码（30 分钟内有效）：\n{{ reset_link }}\n\n如非本人操作，请忽略此邮件。\n\n此邮件由系统自动发送，请勿回复。','{\"username\":\"用户名\",\"reset_link\":\"密码重置链接\"}',2,'0597001d-bc91-43af-9a2c-3a4b478f3cee',0,'忘记密码发送重置链接','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('工单回复通知','ticket_reply','【FastapiAdmin】工单回复通知 - {{ ticket_title }}','<div style=\'max-width:600px;margin:0 auto;padding:20px;font-family:Arial,sans-serif;background:#f5f7fa;border-radius:8px;\'><div style=\'background:#fff;padding:30px;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.08);\'><h2 style=\'color:#1a1a2e;margin-top:0;\'>工单回复通知</h2><p style=\'color:#666;font-size:15px;line-height:1.8;\'>您的工单 <strong>{{ ticket_title }}</strong> 收到新回复：</p><div style=\'background:#f8f9fb;border-left:4px solid #667eea;padding:16px 20px;margin:16px 0;border-radius:4px;\'><p style=\'color:#444;font-size:14px;line-height:1.8;margin:0;\'>{{ reply_content }}</p></div><p style=\'color:#999;font-size:13px;\'>回复时间：{{ reply_time }}</p></div></div>','工单回复通知\n\n您的工单「{{ ticket_title }}」收到新回复：\n\n{{ reply_content }}\n\n回复时间：{{ reply_time }}','{\"ticket_title\":\"工单标题\",\"reply_content\":\"回复内容\",\"reply_time\":\"回复时间\"}',3,'fdbf0c4a-b000-40e7-bb8c-625296ef688c',0,'工单被回复时通知提交人','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('套餐到期提醒','expiry_warning','【FastapiAdmin】套餐即将到期提醒','<div style=\'max-width:600px;margin:0 auto;padding:20px;font-family:Arial,sans-serif;background:#f5f7fa;border-radius:8px;\'><div style=\'background:#fff;padding:30px;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.08);\'><h2 style=\'color:#e74c3c;margin-top:0;\'>套餐即将到期</h2><p style=\'color:#666;font-size:15px;line-height:1.8;\'>尊敬的 {{ tenant_name }}：</p><p style=\'color:#666;font-size:15px;line-height:1.8;\'>您的 <strong>{{ package_name }}</strong> 套餐将于 <strong style=\'color:#e74c3c;\'>{{ expire_date }}</strong> 到期，剩余 <strong style=\'color:#e74c3c;\'>{{ remaining_days }}</strong> 天。</p><p style=\'color:#666;font-size:15px;line-height:1.8;\'>到期后部分功能将受限，请及时续费以保证服务正常使用。</p><div style=\'text-align:center;margin:24px 0;\'><a href=\'{{ renew_link }}\' style=\'display:inline-block;background:linear-gradient(135deg,#e74c3c,#c0392b);color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-size:16px;font-weight:bold;\'>立即续费</a></div></div></div>','套餐即将到期\n\n尊敬的 {{ tenant_name }}：您的「{{ package_name }}」套餐将于 {{ expire_date }} 到期，剩余 {{ remaining_days }} 天。请及时续费。\n续费链接：{{ renew_link }}','{\"tenant_name\":\"租户名称\",\"package_name\":\"套餐名称\",\"expire_date\":\"到期日期\",\"remaining_days\":\"剩余天数\",\"renew_link\":\"续费链接\"}',4,'65c2e373-0a90-4f1a-80ac-0a5ea12b479f',0,'套餐到期前7/3/1天发送提醒','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('团队邀请','team_invite','【FastapiAdmin】{{ tenant_name }} 邀请您加入团队','<div style=\'max-width:600px;margin:0 auto;padding:20px;font-family:Arial,sans-serif;background:#f5f7fa;border-radius:8px;\'><div style=\'background:#fff;padding:30px;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.08);\'><h2 style=\'color:#1a1a2e;margin-top:0;\'>团队邀请</h2><p style=\'color:#666;font-size:15px;line-height:1.8;\'>您好：</p><p style=\'color:#666;font-size:15px;line-height:1.8;\'><strong>{{ inviter_name }}</strong> 邀请您加入 <strong>{{ tenant_name }}</strong> 团队。</p><div style=\'text-align:center;margin:24px 0;\'><a href=\'{{ invite_link }}\' style=\'display:inline-block;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-size:16px;font-weight:bold;\'>接受邀请</a></div><p style=\'color:#999;font-size:13px;\'>链接 24 小时内有效。</p></div></div>','团队邀请\n\n您好：{{ inviter_name }} 邀请您加入 {{ tenant_name }} 团队。\n点击链接接受邀请：{{ invite_link }}\n链接 24 小时内有效。','{\"tenant_name\":\"团队名称\",\"inviter_name\":\"邀请人姓名\",\"invite_link\":\"邀请链接\"}',5,'762907b1-9ea4-4bce-b154-35acdb423d7e',0,'邀请新成员加入团队','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('发票开具通知','invoice_issued','【FastapiAdmin】发票已开具 - {{ invoice_no }}','<div style=\'max-width:600px;margin:0 auto;padding:20px;font-family:Arial,sans-serif;background:#f5f7fa;border-radius:8px;\'><div style=\'background:#fff;padding:30px;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.08);\'><h2 style=\'color:#1a1a2e;margin-top:0;\'>发票已开具</h2><p style=\'color:#666;font-size:15px;line-height:1.8;\'>尊敬的客户：</p><p style=\'color:#666;font-size:15px;line-height:1.8;\'>您的发票已开具完成：</p><table style=\'width:100%;border-collapse:collapse;margin:16px 0;\'><tr><td style=\'padding:8px 12px;color:#888;\'>发票号码</td><td style=\'padding:8px 12px;color:#333;\'>{{ invoice_no }}</td></tr><tr style=\'background:#f8f9fb;\'><td style=\'padding:8px 12px;color:#888;\'>发票抬头</td><td style=\'padding:8px 12px;color:#333;\'>{{ invoice_title }}</td></tr><tr><td style=\'padding:8px 12px;color:#888;\'>开票金额</td><td style=\'padding:8px 12px;color:#333;font-weight:bold;\'>¥{{ invoice_amount }}</td></tr></table><div style=\'text-align:center;margin:20px 0;\'><a href=\'{{ pdf_link }}\' style=\'display:inline-block;background:linear-gradient(135deg,#27ae60,#2ecc71);color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:15px;\'>下载 PDF 电子发票</a></div></div></div>','发票已开具\n\n尊敬的客户：您的发票已开具完成。\n发票号码：{{ invoice_no }}\n发票抬头：{{ invoice_title }}\n开票金额：¥{{ invoice_amount }}\n下载 PDF：{{ pdf_link }}','{\"invoice_no\":\"发票号\",\"invoice_title\":\"发票抬头\",\"invoice_amount\":\"开票金额\",\"pdf_link\":\"PDF下载链接\"}',6,'0b4a4323-4411-4250-a045-748d519700be',0,'发票开具完成通知客户','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL);
/*!40000 ALTER TABLE `platform_email_template` ENABLE KEYS */;

--
-- Table structure for table `platform_invoice`
--

DROP TABLE IF EXISTS `platform_invoice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `platform_invoice` (
  `invoice_no` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '发票号码',
  `order_id` int NOT NULL COMMENT '关联订单',
  `invoice_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'vat_normal/vat_special',
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '发票抬头',
  `tax_no` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '纳税人识别号',
  `bank_info` text COLLATE utf8mb4_unicode_ci COMMENT '开户行及账号',
  `address_info` text COLLATE utf8mb4_unicode_ci COMMENT '注册地址及电话',
  `amount` int NOT NULL COMMENT '发票金额(分)',
  `tax_amount` int NOT NULL COMMENT '税额(分)',
  `pdf_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'PDF下载地址',
  `api_response` text COLLATE utf8mb4_unicode_ci COMMENT '第三方API响应',
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `uuid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID全局唯一标识',
  `status` int NOT NULL COMMENT '状态',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '备注/描述',
  `created_time` datetime NOT NULL COMMENT '创建时间',
  `updated_time` datetime NOT NULL COMMENT '更新时间',
  `is_deleted` tinyint(1) NOT NULL COMMENT '是否已删除(0:未删除 1:已删除)',
  `deleted_time` datetime DEFAULT NULL COMMENT '删除时间',
  `tenant_id` int NOT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_no` (`invoice_no`),
  UNIQUE KEY `order_id` (`order_id`),
  UNIQUE KEY `ix_platform_invoice_uuid` (`uuid`),
  KEY `ix_platform_invoice_id` (`id`),
  KEY `ix_platform_invoice_deleted_time` (`deleted_time`),
  KEY `ix_platform_invoice_updated_time` (`updated_time`),
  KEY `ix_platform_invoice_tenant_id` (`tenant_id`),
  KEY `ix_platform_invoice_is_deleted` (`is_deleted`),
  KEY `ix_platform_invoice_status` (`status`),
  KEY `ix_platform_invoice_created_time` (`created_time`),
  CONSTRAINT `platform_invoice_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `platform_order` (`id`),
  CONSTRAINT `platform_invoice_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `platform_tenant` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='发票表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platform_invoice`
--

/*!40000 ALTER TABLE `platform_invoice` DISABLE KEYS */;
INSERT INTO `platform_invoice` VALUES ('INV20260101001',1,'vat_special','星辰科技有限公司','91440300MA5ABCDE12','中国工商银行深圳科技园支行 4000023409100123456','深圳市南山区科技园路1号 0755-88888888',29900,4485,NULL,NULL,1,'022f5216-4372-4f14-b18b-7ab4e6f5a472',1,'星辰科技-标准版年付发票（已开具）','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,3),('INV20260315001',2,'vat_normal','星辰科技有限公司',NULL,NULL,NULL,9900,1485,NULL,NULL,2,'7b500941-8aa6-4169-b59e-2bd6811f7d10',1,'星辰科技-AI助手发票（已开具）','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,3),('INV20260601001',6,'vat_normal','创新工坊',NULL,NULL,NULL,29900,4485,NULL,NULL,3,'9eae795b-b523-4e24-b662-dd45bec52d80',0,'创新工坊-标准版月付发票（待开具）','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,4),('INV20260610001',7,'vat_normal','创新工坊',NULL,NULL,NULL,4900,735,NULL,NULL,4,'f4b8696e-c61e-451f-be26-4550f979135f',0,'创新工坊-数据大屏发票（待开具）','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,4);
/*!40000 ALTER TABLE `platform_invoice` ENABLE KEYS */;

--
-- Table structure for table `platform_menu`
--

DROP TABLE IF EXISTS `platform_menu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `platform_menu` (
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '菜单名称',
  `type` int NOT NULL COMMENT '菜单类型(1:目录 2:菜单 3:按钮/权限 4:链接)',
  `order` int NOT NULL COMMENT '显示排序',
  `permission` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '权限标识(如:module_system:user:query)',
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '菜单图标',
  `route_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '路由名称',
  `route_path` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '路由路径',
  `component_path` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '组件路径',
  `redirect` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '重定向地址',
  `hidden` tinyint(1) NOT NULL COMMENT '是否隐藏(True:隐藏 False:显示)',
  `keep_alive` tinyint(1) NOT NULL COMMENT '是否缓存(True:是 False:否)',
  `always_show` tinyint(1) NOT NULL COMMENT '是否始终显示(True:是 False:否)',
  `title` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '菜单标题',
  `params` json DEFAULT NULL COMMENT '路由参数(JSON对象)',
  `affix` tinyint(1) NOT NULL COMMENT '是否固定标签页(True:是 False:否)',
  `client` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pc' COMMENT '终端(pc:管理端桌面 app:移动端)',
  `link` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '外链地址(仅type=4)',
  `is_iframe` tinyint(1) NOT NULL COMMENT '是否嵌入iframe(True:是 False:否)',
  `is_hide_tab` tinyint(1) NOT NULL COMMENT '是否隐藏标签页(True:是 False:否)',
  `active_path` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '激活菜单路径(用于高亮父级)',
  `show_badge` tinyint(1) NOT NULL COMMENT '是否显示红点角标(True:是 False:否)',
  `show_text_badge` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '文字角标内容',
  `scope` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'tenant' COMMENT '菜单可见范围(platform:仅平台 tenant:租户可用)',
  `parent_id` int DEFAULT NULL COMMENT '父菜单ID',
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `uuid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID全局唯一标识',
  `status` int NOT NULL COMMENT '状态',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '备注/描述',
  `created_time` datetime NOT NULL COMMENT '创建时间',
  `updated_time` datetime NOT NULL COMMENT '更新时间',
  `is_deleted` tinyint(1) NOT NULL COMMENT '是否已删除(0:未删除 1:已删除)',
  `deleted_time` datetime DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_platform_menu_uuid` (`uuid`),
  KEY `ix_platform_menu_updated_time` (`updated_time`),
  KEY `ix_platform_menu_is_deleted` (`is_deleted`),
  KEY `ix_platform_menu_status` (`status`),
  KEY `ix_platform_menu_created_time` (`created_time`),
  KEY `ix_platform_menu_parent_id` (`parent_id`),
  KEY `ix_platform_menu_id` (`id`),
  KEY `ix_platform_menu_deleted_time` (`deleted_time`),
  CONSTRAINT `platform_menu_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `platform_menu` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=221 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='平台菜单表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platform_menu`
--

/*!40000 ALTER TABLE `platform_menu` DISABLE KEYS */;
INSERT INTO `platform_menu` VALUES ('平台管理',1,1,NULL,'ri:building-4-line','Platform','/platform',NULL,'/platform/menu',0,1,1,'平台管理','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',NULL,1,'400f98c2-3d78-4870-bc28-9ed81553cf27',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('系统管理',1,2,NULL,'ri:settings-2-line','System','/system',NULL,'/system/dept',0,1,0,'系统管理','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',NULL,2,'d367be04-db79-45bd-81c8-7f87a7cdbe8c',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('监控管理',1,3,NULL,'ri:computer-line','Monitor','/monitor',NULL,'/monitor/online',0,1,0,'监控管理','null',0,'pc',NULL,0,0,NULL,1,'NEW','platform',NULL,3,'65f501b0-53d7-4b6d-9353-5c76b15ed666',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('接口管理',1,4,NULL,'ri:file-text-line','Swagger','/swagger',NULL,'/swagger/docs',0,1,0,'接口管理','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',NULL,4,'7bb7f965-224a-4323-89cb-094962d1805a',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('代码管理',1,5,NULL,'ri:code-s-slash-line','Generator','/generator',NULL,'/generator/gencode',0,1,0,'代码管理','null',0,'pc',NULL,0,0,NULL,1,'DEV','platform',NULL,5,'864fbb55-71e8-4f28-81f0-0889f78638f9',0,'代码管理','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('AI管理',1,7,NULL,'ri:chat-3-line','AI','/ai',NULL,'/ai/chat',0,1,0,'AI管理','null',0,'pc',NULL,0,0,NULL,1,'HOT','platform',NULL,6,'8a497b25-d5a5-43c8-94bc-4cc031ef833b',0,'AI管理','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('任务管理',1,8,NULL,'ri:tools-line','Task','/task',NULL,'/task/cronjob/job',0,1,0,'任务管理','null',0,'pc',NULL,0,0,NULL,1,'BETA','platform',NULL,7,'cc301509-2f2d-413c-94fb-c2e863fa366e',0,'任务管理','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('案例管理',1,9,NULL,'ri:menu-line','Example','/example',NULL,'/example/demo-center/demo',0,1,0,'案例管理','null',0,'pc',NULL,0,0,NULL,1,'BETA','tenant',NULL,8,'92b64afb-037a-46a3-942d-3c3a7dab73f5',0,'案例管理','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('首页',1,90,'','ri:home-4-line','AppHome','/app/home',NULL,'/app/home',0,1,1,'首页','null',0,'app',NULL,0,0,NULL,0,NULL,'tenant',NULL,9,'49f1eb3c-975a-44df-aa0b-f545f01b43d8',0,'APP 移动端-首页','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('同事',1,91,'','ri:user-heart-line','AppColleague','/app/colleague',NULL,'/app/colleague',0,1,1,'同事','null',0,'app',NULL,0,0,NULL,0,NULL,'tenant',NULL,10,'a089263b-2786-42f9-94ee-711700ac3f28',0,'APP 移动端-同事','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('打卡',1,92,'','ri:time-line','AppAttendance','/app/attendance',NULL,'/app/attendance',0,1,1,'打卡','null',0,'app',NULL,0,0,NULL,0,NULL,'tenant',NULL,11,'3c3ab2dc-1db9-40e5-9fef-d17ac4408cc3',0,'APP 移动端-打卡','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('消息',1,93,'','ri:message-3-line','AppMessage','/app/message',NULL,'/app/message',0,1,1,'消息','null',0,'app',NULL,0,0,NULL,0,NULL,'tenant',NULL,12,'b544b834-0934-43c4-b1b5-95ad4c3f5efc',0,'APP 移动端-消息','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('我的',1,94,'','ri:user-line','AppMine','/app/mine',NULL,'/app/mine',0,1,1,'我的','null',0,'app',NULL,0,0,NULL,0,NULL,'tenant',NULL,13,'e22bd5f4-4609-41ee-97f1-0a6a2f6d1c0e',0,'APP 移动端-我的','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('菜单管理',2,1,'module_platform:menu:query','ri:menu-line','Menu','menu','module_platform/menu/index',NULL,0,1,0,'菜单管理','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',1,14,'f0c2e1a0-d44a-4417-a696-f82d0011f255',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('租户管理',2,2,'module_system:tenant:query','ri:presentation-line','Tenant','tenant','module_platform/tenant/index',NULL,0,1,0,'租户管理','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',1,15,'8eceb1b2-7f0c-4321-ba00-6ff73fe41982',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('套餐管理',2,3,'module_package:package:query','ri:vip-crown-2-line','Package','package','module_platform/package/index',NULL,0,1,0,'套餐管理','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',1,16,'033cb390-61c4-4353-9a35-5275d17bee7a',0,'套餐管理菜单','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('邮件管理',2,5,'module_platform:email:*','ri:mail-send-line','Email','email','module_platform/email/index',NULL,0,1,0,'邮件管理','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',1,17,'a77643cd-f1ff-44e6-a6d8-ae36c22bf7be',0,'系统邮件服务管理','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('订单管理',2,7,'module_platform:order:query','ri:file-list-3-line','PlatformOrder','order','module_platform/order/index',NULL,0,1,0,'订单管理','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',1,18,'77a7f6e1-3abe-49f3-9233-14a9cb0b6f6c',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('发票管理',2,9,'module_platform:invoice:query','ri:file-text-line','PlatformInvoice','invoice','module_platform/invoice/index',NULL,0,1,0,'发票管理','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',1,19,'5d515c07-2aaf-4a83-b9d8-d3c2d9e9b86f',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('租户工作台',2,13,'module_platform:workspace:query','ri:briefcase-line','PlatformWorkspace','workspace','module_platform/self_service/index',NULL,0,1,0,'租户工作台','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',1,20,'c1d83302-2391-4286-ac65-b63247adcd8e',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('插件市场',2,14,'module_platform:plugin:query','ri:store-2-line','PluginMarket','plugin-market','module_platform/plugin/index',NULL,0,1,0,'插件市场','null',0,'pc',NULL,0,0,NULL,1,'NEW','platform',1,21,'bbb17aa4-d9fc-434c-9845-a79c8286329d',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('字典管理',2,1,'module_system:dict_type:query','ri:book-2-line','Dict','dict','module_system/dict/index',NULL,0,1,0,'字典管理','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',2,22,'b3443405-86a0-423b-af57-f2668925ef3c',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('参数管理',2,2,'module_system:param:query','ri:settings-3-line','Params','param','module_system/params/index',NULL,0,1,0,'参数管理','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',2,23,'046305ca-a619-42a5-8f32-538f46c35de0',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('部门管理',2,3,'module_system:dept:query','ri:node-tree','Dept','dept','module_system/dept/index',NULL,0,1,0,'部门管理','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',2,24,'8aea2dbf-9b98-4e62-acc3-2a05f567d99b',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('岗位管理',2,4,'module_system:position:query','ri:map-pin-line','Position','position','module_system/position/index',NULL,0,1,0,'岗位管理','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',2,25,'681c2d71-91b4-432b-abb2-a6c1b83e4bf3',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('角色管理',2,5,'module_system:role:query','ri:admin-line','Role','role','module_system/role/index',NULL,0,1,0,'角色管理','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',2,26,'711ca237-a813-4e21-9ded-23f8d07e8809',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('用户管理',2,6,'module_system:user:query','ri:user-line','User','user','module_system/user/index',NULL,0,1,0,'用户管理','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',2,27,'5695eae8-211d-4e76-b30d-a05060365adf',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('日志管理',2,7,'module_system:log:query','ri:focus-3-line','Log','log','module_system/log/index',NULL,0,1,0,'日志管理','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',2,28,'51bfed5a-f645-426e-844f-3eada1f210eb',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('公告管理',2,8,'module_system:notice:query','ri:notification-3-line','Notice','notice','module_system/notice/index',NULL,0,1,0,'公告管理','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',2,29,'b8c2ae4e-5280-42a4-a660-e879f0e683f4',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('工单管理',2,10,'module_system:ticket:query','ri:feedback-line','ModuleTicket','ticket','module_system/ticket/index',NULL,0,1,0,'工单管理','null',0,'pc',NULL,0,0,NULL,1,'NEW','tenant',2,30,'9779ab2d-e233-425c-a6f1-93a2e7a52ac3',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('系统配置',3,99,'module_system:config:update',NULL,NULL,NULL,NULL,NULL,0,1,0,'系统配置','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',2,31,'1ebfc631-542f-4bdc-8a9f-531eeba858cb',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('在线用户',2,1,'module_monitor:online:query','ri:customer-service-2-line','MonitorOnline','online','module_monitor/online/index',NULL,0,1,0,'在线用户','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',3,32,'4b35d992-630a-4e19-9a23-e62b85caea88',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('服务器监控',2,2,'module_monitor:server:query','ri:dashboard-3-line','MonitorServer','server','module_monitor/server/index',NULL,0,1,0,'服务器监控','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',3,33,'f97e8014-e4d5-4c0f-938c-1360dc7952cf',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('缓存监控',2,3,'module_monitor:cache:query','ri:timer-flash-line','MonitorCache','cache','module_monitor/cache/index',NULL,0,1,0,'缓存监控','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',3,34,'eff03ca2-0e24-4666-82e4-d855a1b03dad',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('文件管理',2,4,'module_monitor:resource:query','ri:folder-5-line','Resource','resource','module_monitor/resource/index',NULL,0,1,0,'文件管理','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',3,35,'b5375d54-cba0-42e2-afb1-c085ea478bdd',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('Swagger文档',4,1,'module_swagger:docs:query','ri:plug-line','Docs','docs','module_swagger/docs/index',NULL,0,1,0,'Swagger文档','null',0,'pc','/api/v1/docs',1,0,NULL,0,NULL,'platform',4,36,'68411534-e3a8-4057-acea-6ef9b38c11a4',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('Redoc文档',4,2,'module_swagger:redoc:query','ri:file-text-line','Redoc','redoc','module_swagger/redoc/index',NULL,0,1,0,'Redoc文档','null',0,'pc','/api/v1/redoc',1,0,NULL,0,NULL,'platform',4,37,'7c7ea8d9-3038-473d-b6a4-cd5d01884af6',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('代码生成',2,1,'module_generator:gencode:query','ri:code-s-slash-line','GenCode','gencode','module_generator/gencode/index',NULL,0,1,0,'代码生成','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',5,38,'97510286-24f6-4379-8957-b30b7f696d1e',0,'代码生成','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('AI智能助手',2,1,'module_ai:chat:query','ri:message-2-line','Chat','chat','module_ai/chat/index',NULL,0,1,0,'AI智能助手','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',6,39,'c55cdbcd-d936-4408-aefb-bbcb03c3784e',0,'AI智能助手','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('会话记忆',2,2,'module_ai:chat:query','ri:chat-3-line','Memory','memory','module_ai/memory/index',NULL,0,1,0,'会话记忆','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',6,40,'3ade21b5-9080-43fe-8332-5e2d7e67bad0',0,'会话记忆管理','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('定时任务',1,1,NULL,'ri:timer-line','Cronjob','cronjob',NULL,'/task/cronjob/job',0,1,1,'定时任务','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',7,41,'cd4e866b-6656-4a44-89fe-6e7961ed3b23',0,'APScheduler 调度器与任务节点','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('工作流',1,2,NULL,'ri:tools-line','WorkflowMgr','workflow-mgr',NULL,'/task/workflow/definition',0,1,1,'工作流','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',7,42,'fd9bfd9d-c8be-43bf-bd88-e3ae391f3fa6',0,'流程编排与编排节点类型','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('示例中心',1,1,NULL,'ri:apps-line','DemoCenter','demo-center',NULL,'/example/demo-center/demo',0,1,0,'示例中心','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',8,43,'4b7e1707-86c6-4a40-a582-58df7a88e64b',0,'示例中心','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('新增',3,1,'module_platform:menu:create',NULL,NULL,NULL,NULL,NULL,0,1,0,'新增','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',14,44,'3372d5c6-b904-4358-9979-ac9e7d6737da',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('编辑',3,2,'module_platform:menu:update',NULL,NULL,NULL,NULL,NULL,0,1,0,'编辑','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',14,45,'8a5199f4-4909-40c4-beb5-f018059a0f07',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('删除',3,3,'module_platform:menu:delete',NULL,NULL,NULL,NULL,NULL,0,1,0,'删除','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',14,46,'68806f87-e0f9-46d3-8c2b-fed62647ff0e',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('状态变更',3,4,'module_platform:menu:patch',NULL,NULL,NULL,NULL,NULL,0,1,0,'状态变更','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',14,47,'77fc44b0-6a89-48ca-a9ab-d5800588fa88',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('详情',3,5,'module_platform:menu:detail',NULL,NULL,NULL,NULL,NULL,0,1,0,'详情','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',14,48,'32a29846-2f5d-4369-9d3a-c63a78285c4e',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('查询',3,6,'module_platform:menu:query',NULL,NULL,NULL,NULL,NULL,0,1,0,'查询','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',14,49,'4de62ba1-09a1-433c-b944-cfb49acdcf51',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('新增',3,1,'module_system:tenant:create',NULL,NULL,NULL,NULL,NULL,0,1,0,'新增','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',15,50,'ae1913d9-753c-420f-98d3-eef53667e97b',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('编辑',3,2,'module_system:tenant:update',NULL,NULL,NULL,NULL,NULL,0,1,0,'编辑','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',15,51,'714ec3e5-d166-4168-b243-136d88b9746f',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('删除',3,3,'module_system:tenant:delete',NULL,NULL,NULL,NULL,NULL,0,1,0,'删除','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',15,52,'788eb418-12a9-4e14-87b2-f85bc0770dbc',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('状态变更',3,4,'module_system:tenant:patch',NULL,NULL,NULL,NULL,NULL,0,1,0,'状态变更','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',15,53,'db20e4cb-37fd-49d4-8e71-6a6b32b485a1',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('详情',3,5,'module_system:tenant:query',NULL,NULL,NULL,NULL,NULL,0,1,0,'详情','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',15,54,'8a78b698-aed1-4cc5-b5f4-0537a9d561ff',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('查询',3,6,'module_system:tenant:query',NULL,NULL,NULL,NULL,NULL,0,1,0,'查询','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',15,55,'ea5bab73-0fb4-4d37-b059-00739f7a2385',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('配置管理',3,11,'module_system:tenant:update',NULL,NULL,NULL,NULL,NULL,0,1,0,'配置管理','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',15,56,'f23974d8-a659-4cf1-9490-fb3af25eaa89',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('新增',3,1,'module_package:package:create',NULL,NULL,NULL,NULL,NULL,0,1,0,'新增','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',16,57,'9f69f785-7b83-41a5-baa5-7b31df468358',0,NULL,'2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('编辑',3,2,'module_package:package:update',NULL,NULL,NULL,NULL,NULL,0,1,0,'编辑','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',16,58,'918589ec-d1db-47dc-b0ab-a3544c8dbf26',0,NULL,'2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('删除',3,3,'module_package:package:delete',NULL,NULL,NULL,NULL,NULL,0,1,0,'删除','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',16,59,'07d7c4db-c8d6-4572-bcf9-562847d7b71b',0,NULL,'2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('查询',3,4,'module_package:package:query',NULL,NULL,NULL,NULL,NULL,0,1,0,'查询','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',16,60,'a4a45670-ec98-41a5-86da-e93f3bff8eca',0,NULL,'2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('租户查询套餐',3,5,'tenant:package:query',NULL,NULL,NULL,NULL,NULL,1,1,0,'租户查询套餐','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',16,61,'31a24945-6cbf-4b36-8669-dd40f396f5f0',0,NULL,'2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('发件配置',3,1,'module_platform:email:update',NULL,'EmailConfig',NULL,NULL,NULL,0,1,0,NULL,NULL,0,'pc',NULL,0,0,NULL,0,NULL,'platform',17,62,'9562633a-b504-4f08-9619-aba4b13a51f1',0,NULL,'2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('邮件模板',3,2,'module_platform:email:query',NULL,'EmailTemplate',NULL,NULL,NULL,0,1,0,NULL,NULL,0,'pc',NULL,0,0,NULL,0,NULL,'platform',17,63,'4b8a463f-d92b-4f01-9930-78c4a59dd8c8',0,NULL,'2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('发送邮件',3,3,'module_platform:email:update',NULL,'EmailSend',NULL,NULL,NULL,0,1,0,NULL,NULL,0,'pc',NULL,0,0,NULL,0,NULL,'platform',17,64,'130559d5-6243-42ef-bd87-b44a1edd358a',0,NULL,'2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('发送日志',3,4,'module_platform:email:query',NULL,'EmailLog',NULL,NULL,NULL,0,1,0,NULL,NULL,0,'pc',NULL,0,0,NULL,0,NULL,'platform',17,65,'0676343a-7ce9-4797-8b0a-0435563147e1',0,NULL,'2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('查询',3,1,'module_platform:order:query',NULL,NULL,NULL,NULL,NULL,0,1,0,'查询','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',18,66,'c4803fda-f2a5-4cfe-8883-04dfe9d9caa4',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('新增',3,2,'module_platform:order:create',NULL,NULL,NULL,NULL,NULL,0,1,0,'新增','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',18,67,'2712921e-cf23-4713-b012-9111ca5a9f19',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('取消订单',3,3,'module_platform:order:update',NULL,NULL,NULL,NULL,NULL,0,1,0,'取消订单','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',18,68,'ff92b420-3a57-4387-87f6-14bee4b4cce6',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('租户创建订单',3,4,'tenant:order:create',NULL,NULL,NULL,NULL,NULL,1,1,0,'租户创建订单','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',18,69,'6b723d37-010d-4ba7-a6a1-71ac295fee64',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('租户查询订单',3,5,'tenant:order:query',NULL,NULL,NULL,NULL,NULL,1,1,0,'租户查询订单','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',18,70,'cdeb5110-eaa4-4c6c-9376-1274b45af293',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('租户申请退款',3,6,'tenant:order:refund',NULL,NULL,NULL,NULL,NULL,1,1,0,'租户申请退款','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',18,71,'449cf1b1-8eaa-4927-918c-8d69894faefc',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('查询',3,1,'module_platform:invoice:query',NULL,NULL,NULL,NULL,NULL,0,1,0,'查询','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',19,72,'b642ad2b-e974-4aa7-985e-990c15021aea',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('新增',3,2,'module_platform:invoice:update',NULL,NULL,NULL,NULL,NULL,0,1,0,'新增','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',19,73,'d6d0e218-aa65-4a72-872c-e06b9ff9532d',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('作废发票',3,3,'module_platform:invoice:update',NULL,NULL,NULL,NULL,NULL,0,1,0,'作废发票','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',19,74,'20a502ab-025f-43fe-a9df-eae3d09c81f0',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('查询',3,1,'module_platform:workspace:query',NULL,NULL,NULL,NULL,NULL,0,1,0,'查询','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',20,75,'f889c375-1191-49bb-aa84-12ad33df3150',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('查询',3,1,'module_platform:plugin:query',NULL,NULL,NULL,NULL,NULL,0,1,0,'查询','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',21,76,'68c7dd40-9a08-42c7-b578-e2b8cc6c1649',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('安装',3,2,'module_platform:plugin:install',NULL,NULL,NULL,NULL,NULL,0,1,0,'安装','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',21,77,'9774d7c5-77d1-46c1-8422-8fe01185f113',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('卸载',3,3,'module_platform:plugin:uninstall',NULL,NULL,NULL,NULL,NULL,0,1,0,'卸载','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',21,78,'0b168fd0-375e-4581-aae2-6b44d62fd2af',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('新增',3,4,'module_platform:plugin:create',NULL,NULL,NULL,NULL,NULL,0,1,0,'新增','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',21,79,'85e485ec-5844-4b01-a00b-b4a19f81e40a',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('编辑',3,5,'module_platform:plugin:update',NULL,NULL,NULL,NULL,NULL,0,1,0,'编辑','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',21,80,'46f08188-3389-4855-a4f0-739d58dad521',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('删除',3,6,'module_platform:plugin:delete',NULL,NULL,NULL,NULL,NULL,0,1,0,'删除','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',21,81,'ba8957cb-f6d6-4979-ba0d-3e42813df45f',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('启用/禁用',3,7,'module_platform:plugin:toggle',NULL,NULL,NULL,NULL,NULL,0,1,0,'启用/禁用','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',21,82,'0f1ade01-cd45-4a2f-96c4-7d7e86ec5e9e',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('重新加载',3,8,'module_platform:plugin:reload',NULL,NULL,NULL,NULL,NULL,0,1,0,'重新加载','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',21,83,'0de01ae9-3beb-49a9-8e49-fef97bd6cd28',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('新增',3,1,'module_system:dict_type:create',NULL,NULL,NULL,NULL,NULL,0,1,0,'新增','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',22,84,'0bd8c73f-cc33-47aa-8980-3497b121bdd6',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('编辑',3,2,'module_system:dict_type:update',NULL,NULL,NULL,NULL,NULL,0,1,0,'编辑','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',22,85,'492e2a16-cf60-4d8b-90ad-c614f3d9fe04',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('删除',3,3,'module_system:dict_type:delete',NULL,NULL,NULL,NULL,NULL,0,1,0,'删除','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',22,86,'1d040cb2-cdef-4203-b5bd-5a1c63ec1422',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('导出',3,4,'module_system:dict_type:export',NULL,NULL,NULL,NULL,NULL,0,1,0,'导出','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',22,87,'b4f26f7d-8a39-4212-912e-fe07ec42cbe7',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('状态变更',3,5,'module_system:dict_type:patch',NULL,NULL,NULL,NULL,NULL,0,1,0,'状态变更','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',22,88,'13296fbd-7b30-4d97-88ac-b11fb47213f6',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('查询',3,6,'module_system:dict_data:query',NULL,NULL,NULL,NULL,NULL,0,1,0,'查询','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',22,89,'0fcc88fc-976c-4c11-bb41-e3e6d0400586',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('新增',3,7,'module_system:dict_data:create',NULL,NULL,NULL,NULL,NULL,0,1,0,'新增','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',22,90,'a4e5b1cb-dfc4-4ddf-912b-1f00f8a56fd4',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('编辑',3,8,'module_system:dict_data:update',NULL,NULL,NULL,NULL,NULL,0,1,0,'编辑','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',22,91,'e5abb22a-f213-4b8f-890b-9cad6edb49e2',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('删除',3,9,'module_system:dict_data:delete',NULL,NULL,NULL,NULL,NULL,0,1,0,'删除','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',22,92,'e6d31f62-0876-48d8-b266-dd10ce8ad5ae',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('导出',3,10,'module_system:dict_data:export',NULL,NULL,NULL,NULL,NULL,0,1,0,'导出','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',22,93,'809ac529-36db-4c0e-b6ca-84e915cfb2ab',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('状态变更',3,11,'module_system:dict_data:patch',NULL,NULL,NULL,NULL,NULL,0,1,0,'状态变更','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',22,94,'8b760596-1943-4deb-811f-31ab54d86c65',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('详情',3,12,'module_system:dict_type:detail',NULL,NULL,NULL,NULL,NULL,0,1,0,'详情','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',22,95,'14343571-0b3c-4e67-916a-670028e1bb53',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('查询',3,13,'module_system:dict_type:query',NULL,NULL,NULL,NULL,NULL,0,1,0,'查询','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',22,96,'768c1f7d-2988-4ad9-bbdd-92d252e84612',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('详情',3,14,'module_system:dict_data:detail',NULL,NULL,NULL,NULL,NULL,0,1,0,'详情','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',22,97,'30795cbb-1315-4cf7-8237-fefd0e3111e0',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('新增',3,1,'module_system:param:create',NULL,NULL,NULL,NULL,NULL,0,1,0,'新增','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',23,98,'73d55773-3c4b-4a83-aee4-60696ade4dd1',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('编辑',3,2,'module_system:param:update',NULL,NULL,NULL,NULL,NULL,0,1,0,'编辑','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',23,99,'e180dbf5-2fab-44d5-b9df-63352675a9ce',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('删除',3,3,'module_system:param:delete',NULL,NULL,NULL,NULL,NULL,0,1,0,'删除','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',23,100,'ffc7c643-d169-4946-ba3d-8c84ac88fcdc',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('导出',3,4,'module_system:param:export',NULL,NULL,NULL,NULL,NULL,0,1,0,'导出','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',23,101,'2f7a308b-ce0f-4126-8ac4-322e109337f2',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('参数上传',3,5,'module_system:param:upload',NULL,NULL,NULL,NULL,NULL,0,1,0,'参数上传','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',23,102,'7b84fa06-7b0e-42a1-be6f-03abe74a93e9',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('详情',3,6,'module_system:param:detail',NULL,NULL,NULL,NULL,NULL,0,1,0,'详情','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',23,103,'3df667cf-c456-48a4-b88e-693381cd7f6c',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('查询',3,7,'module_system:param:query',NULL,NULL,NULL,NULL,NULL,0,1,0,'查询','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',23,104,'5bcae3ec-b562-4868-a031-e4d788212fe1',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('批量操作',3,8,'module_system:param:patch',NULL,NULL,NULL,NULL,NULL,0,1,0,'批量操作','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',23,105,'bdd37968-8b9d-4bf3-a65f-463f990f8d27',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('新增',3,1,'module_system:dept:create',NULL,NULL,NULL,NULL,NULL,0,1,0,'新增','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',24,106,'3a69485a-515e-4f35-9904-66a577916236',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('编辑',3,2,'module_system:dept:update',NULL,NULL,NULL,NULL,NULL,0,1,0,'编辑','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',24,107,'bc4d463f-54bc-491d-a7ef-9e53d2b9524f',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('删除',3,3,'module_system:dept:delete',NULL,NULL,NULL,NULL,NULL,0,1,0,'删除','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',24,108,'1ce9d442-263d-4772-8d80-38e0474389e5',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('状态变更',3,4,'module_system:dept:patch',NULL,NULL,NULL,NULL,NULL,0,1,0,'状态变更','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',24,109,'ab639c1d-cd60-4910-9d2e-db963544bab7',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('详情',3,5,'module_system:dept:detail',NULL,NULL,NULL,NULL,NULL,0,1,0,'详情','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',24,110,'7afe5f0b-f7ae-4165-a1d2-6a5e83b1df57',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('查询',3,6,'module_system:dept:query',NULL,NULL,NULL,NULL,NULL,0,1,0,'查询','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',24,111,'8300d826-ca39-4536-b2fd-1d11c041f377',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('新增',3,1,'module_system:position:create',NULL,NULL,NULL,NULL,NULL,0,1,0,'新增','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',25,112,'fff37dc2-ceb9-4b91-9bc3-72d3a4dfb99d',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('编辑',3,2,'module_system:position:update',NULL,NULL,NULL,NULL,NULL,0,1,0,'编辑','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',25,113,'7ac34ba9-5837-48f2-a19e-4680b0c9bd3d',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('删除',3,3,'module_system:position:delete',NULL,NULL,NULL,NULL,NULL,0,1,0,'删除','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',25,114,'93998a92-0222-46cd-b951-1c0c6635d9c8',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('状态变更',3,4,'module_system:position:patch',NULL,NULL,NULL,NULL,NULL,0,1,0,'状态变更','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',25,115,'74393d93-2d4f-4ffe-90aa-ecc5dc1188bf',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('导出',3,5,'module_system:position:export',NULL,NULL,NULL,NULL,NULL,0,1,0,'导出','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',25,116,'3498d265-4478-4e39-937f-3359d644e25d',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('详情',3,6,'module_system:position:detail',NULL,NULL,NULL,NULL,NULL,0,1,0,'详情','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',25,117,'726d257b-52cc-40fc-b880-3e3b2bae62cb',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('查询',3,7,'module_system:position:query',NULL,NULL,NULL,NULL,NULL,0,1,0,'查询','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',25,118,'8c890412-4c44-41ac-a548-2dd4fc0f160e',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('新增',3,1,'module_system:role:create',NULL,NULL,NULL,NULL,NULL,0,1,0,'新增','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',26,119,'31bac83e-906f-49c1-be42-86cf7438ae25',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('编辑',3,2,'module_system:role:update',NULL,NULL,NULL,NULL,NULL,0,1,0,'编辑','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',26,120,'3a590a56-9e1f-4112-8761-9e7f4d1316bf',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('删除',3,3,'module_system:role:delete',NULL,NULL,NULL,NULL,NULL,0,1,0,'删除','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',26,121,'dc43a924-e584-4c1b-a0a7-ea475f45e50b',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('状态变更',3,4,'module_system:role:patch',NULL,NULL,NULL,NULL,NULL,0,1,0,'状态变更','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',26,122,'480c34a4-2120-42df-97cc-8feb7a88ce07',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('导出',3,5,'module_system:role:export',NULL,NULL,NULL,NULL,NULL,0,1,0,'导出','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',26,123,'0c47a2cc-ad5e-4e72-b4a5-6c898a403678',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('详情',3,6,'module_system:role:detail',NULL,NULL,NULL,NULL,NULL,0,1,0,'详情','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',26,124,'ba023afe-71db-4c28-85b2-3e46d2846c46',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('查询',3,7,'module_system:role:query',NULL,NULL,NULL,NULL,NULL,0,1,0,'查询','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',26,125,'a9890650-8720-4ca7-9f35-9be7b0d1bdec',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('分配权限',3,8,'module_system:role:permission',NULL,NULL,NULL,NULL,NULL,0,1,0,'分配权限','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',26,126,'b4f1e342-b345-434d-baae-ac836907262a',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('新增',3,1,'module_system:user:create',NULL,NULL,NULL,NULL,NULL,0,1,0,'新增','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',27,127,'e9d5b70d-b2e0-40a2-9582-0b5c020adfee',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('编辑',3,2,'module_system:user:update',NULL,NULL,NULL,NULL,NULL,0,1,0,'编辑','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',27,128,'d70cbf36-07fe-4437-8050-77f817f5dfcc',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('删除',3,3,'module_system:user:delete',NULL,NULL,NULL,NULL,NULL,0,1,0,'删除','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',27,129,'0d690f3d-8736-4d3b-bb69-cf0b91d2bfe2',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('状态变更',3,4,'module_system:user:patch',NULL,NULL,NULL,NULL,NULL,0,1,0,'状态变更','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',27,130,'f1c3897c-91f5-4ada-a4f4-da5de042e8ed',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('导出',3,5,'module_system:user:export',NULL,NULL,NULL,NULL,NULL,0,1,0,'导出','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',27,131,'6722783a-4cb6-4297-b54b-0782b9f8bfd0',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('导入',3,6,'module_system:user:import',NULL,NULL,NULL,NULL,NULL,0,1,0,'导入','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',27,132,'979d3f1c-2bba-4753-9426-6a475389c9d5',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('下载导入模板',3,7,'module_system:user:download',NULL,NULL,NULL,NULL,NULL,0,1,0,'下载导入模板','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',27,133,'56dd9062-e1e3-4fd3-8291-a2e0890dee7d',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('详情',3,8,'module_system:user:detail',NULL,NULL,NULL,NULL,NULL,0,1,0,'详情','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',27,134,'27b098b3-4cc8-437b-847e-11a93354afae',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('查询',3,9,'module_system:user:query',NULL,NULL,NULL,NULL,NULL,0,1,0,'查询','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',27,135,'e366cbba-0c75-4a30-8f59-3f71aa82f0e8',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('删除',3,1,'module_system:log:delete',NULL,NULL,NULL,NULL,NULL,0,1,0,'删除','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',28,136,'83758cb9-52a0-4853-8b5a-9631354a2ef7',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('导出',3,2,'module_system:log:export',NULL,NULL,NULL,NULL,NULL,0,1,0,'导出','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',28,137,'b6f1accf-9ee8-43a4-b1f6-95bf775a0fc5',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('详情',3,3,'module_system:log:detail',NULL,NULL,NULL,NULL,NULL,0,1,0,'详情','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',28,138,'ac66cf41-3182-4d4a-8fd6-3722b8f8e81f',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('查询',3,4,'module_system:log:query',NULL,NULL,NULL,NULL,NULL,0,1,0,'查询','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',28,139,'92912f05-845d-48cf-b365-e4a06eb86a8c',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('登录日志删除',3,5,'module_system:login_log:delete',NULL,NULL,NULL,NULL,NULL,0,1,0,'登录日志删除','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',28,140,'439150ac-833b-4dfc-84fa-25c4c65deaeb',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('登录日志查询',3,6,'module_system:login_log:query',NULL,NULL,NULL,NULL,NULL,0,1,0,'登录日志查询','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',28,141,'1ab26668-7e67-4003-be0e-f7cd56ea43e9',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('新增',3,1,'module_system:notice:create',NULL,NULL,NULL,NULL,NULL,0,1,0,'新增','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',29,142,'b4f1a3b1-e933-4cd0-aeae-5c63adc1d138',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('编辑',3,2,'module_system:notice:update',NULL,NULL,NULL,NULL,NULL,0,1,0,'编辑','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',29,143,'d9fbb119-5b88-4a6b-9e6e-575dd046338e',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('删除',3,3,'module_system:notice:delete',NULL,NULL,NULL,NULL,NULL,0,1,0,'删除','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',29,144,'5e293257-0220-4298-a8e0-360860208841',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('导出',3,4,'module_system:notice:export',NULL,NULL,NULL,NULL,NULL,0,1,0,'导出','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',29,145,'ff9ad12e-e28a-4c20-ad43-5a0601a443f2',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('状态变更',3,5,'module_system:notice:patch',NULL,NULL,NULL,NULL,NULL,0,1,0,'状态变更','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',29,146,'10778ca2-b8f7-4f0f-80b0-b60dbf52413c',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('详情',3,6,'module_system:notice:detail',NULL,NULL,NULL,NULL,NULL,0,1,0,'详情','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',29,147,'91b830ef-a6d7-49fd-bc49-a0c4920bd8ab',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('查询',3,5,'module_system:notice:query',NULL,NULL,NULL,NULL,NULL,0,1,0,'查询','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',29,148,'0e48342f-a52a-4ccc-b9d0-6c29fde5e815',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('查询',3,1,'module_system:ticket:query',NULL,NULL,NULL,NULL,NULL,0,1,0,'查询','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',30,149,'0fbd00e7-2500-4803-a05b-bd5296d3bc1b',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('新增',3,2,'module_system:ticket:create',NULL,NULL,NULL,NULL,NULL,0,1,0,'新增','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',30,150,'7079ae45-0f51-4c78-a53d-1cd6fc728264',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('编辑',3,3,'module_system:ticket:update',NULL,NULL,NULL,NULL,NULL,0,1,0,'编辑','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',30,151,'f11f2d3c-c25f-44ba-bef5-69d3c89d8ad6',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('删除',3,4,'module_system:ticket:delete',NULL,NULL,NULL,NULL,NULL,0,1,0,'删除','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',30,152,'122a9056-fc29-4132-8c79-4b39c6416acd',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('详情',3,5,'module_system:ticket:detail',NULL,NULL,NULL,NULL,NULL,0,1,0,'详情','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',30,153,'2ac92d04-e473-419c-bec9-af7b2ba01cb1',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('导出',3,6,'module_system:ticket:export',NULL,NULL,NULL,NULL,NULL,0,1,0,'导出','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',30,154,'7dee1028-9178-4135-a2ab-c4ba438a6e13',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('批量操作',3,7,'module_system:ticket:patch',NULL,NULL,NULL,NULL,NULL,0,1,0,'批量操作','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',30,155,'47e4c9a1-2075-45a7-80be-3f044af371ae',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('强制下线',3,1,'module_monitor:online:delete',NULL,NULL,NULL,NULL,NULL,0,1,0,'强制下线','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',32,156,'a38488e0-e867-4b13-9301-7d553e36ab50',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('清除缓存',3,1,'module_monitor:cache:delete',NULL,NULL,NULL,NULL,NULL,0,1,0,'清除缓存','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',34,157,'d1569e88-55e4-42d1-891a-a786680a694b',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('详情',3,2,'module_monitor:cache:detail',NULL,NULL,NULL,NULL,NULL,0,1,0,'详情','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',34,158,'f3bc4cb3-593c-42c8-be9f-5ba0996dc8ae',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('上传',3,1,'module_monitor:resource:upload',NULL,NULL,NULL,NULL,NULL,0,1,0,'上传','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',35,159,'cc36da0f-602d-4e83-924c-545dd8537a0f',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('下载',3,2,'module_monitor:resource:download',NULL,NULL,NULL,NULL,NULL,0,1,0,'下载','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',35,160,'13cd21f1-34eb-4cd6-abe5-7ad43011500e',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('删除',3,3,'module_monitor:resource:delete',NULL,NULL,NULL,NULL,NULL,0,1,0,'删除','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',35,161,'83f090c4-73b6-436c-941b-4972d6edba2f',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('移动',3,4,'module_monitor:resource:move',NULL,NULL,NULL,NULL,NULL,0,1,0,'移动','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',35,162,'712226be-cbda-4787-bf09-c48e5fc5cee3',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('复制',3,5,'module_monitor:resource:copy',NULL,NULL,NULL,NULL,NULL,0,1,0,'复制','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',35,163,'fa46597e-07bd-4950-8b85-e74187b39178',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('重命名',3,6,'module_monitor:resource:rename',NULL,NULL,NULL,NULL,NULL,0,1,0,'重命名','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',35,164,'f7230a46-d02c-40c0-a683-5b4bd4fc00e6',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('新增',3,7,'module_monitor:resource:create_dir',NULL,NULL,NULL,NULL,NULL,0,1,0,'新增','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',35,165,'ac064141-a7ce-45d3-9342-b55bc2a7ee0c',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('导出',3,9,'module_monitor:resource:export',NULL,NULL,NULL,NULL,NULL,0,1,0,'导出','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',35,166,'c3c7d2fa-3cef-481a-835b-4cfeea83101f',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('查询',3,1,'module_generator:gencode:query',NULL,NULL,NULL,NULL,NULL,0,1,0,'查询','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',38,167,'af5fc487-4624-4e91-beb8-ece287be5fc2',0,'查询代码生成业务表列表','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('新增',3,2,'module_generator:gencode:create',NULL,NULL,NULL,NULL,NULL,0,1,0,'新增','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',38,168,'d66a75aa-c7f5-4b08-9fae-8a628458c5fd',0,'创建表结构','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('编辑',3,3,'module_generator:gencode:update',NULL,NULL,NULL,NULL,NULL,0,1,0,'编辑','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',38,169,'4b21c462-493f-47bb-9dbe-4e814904ee05',0,'编辑业务表信息','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('删除',3,4,'module_generator:gencode:delete',NULL,NULL,NULL,NULL,NULL,0,1,0,'删除','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',38,170,'2c1ae191-3425-4bc7-8ce1-48a39f36cd8b',0,'删除业务表信息','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('导入',3,5,'module_generator:gencode:import',NULL,NULL,NULL,NULL,NULL,0,1,0,'导入','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',38,171,'d292fd7d-b119-49af-84b9-16d177d1eb04',0,'导入表结构','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('批量生成代码',3,6,'module_generator:gencode:operate',NULL,NULL,NULL,NULL,NULL,0,1,0,'批量生成代码','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',38,172,'1c7afa8a-274c-43bf-8df0-7a45479506e9',0,'批量生成代码','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('生成代码到指定路径',3,7,'module_generator:gencode:code',NULL,NULL,NULL,NULL,NULL,0,1,0,'生成代码到指定路径','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',38,173,'77d16436-6ea7-495e-98ce-0f2b98061540',0,'生成代码到指定路径','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('查询',3,8,'module_generator:dblist:query',NULL,NULL,NULL,NULL,NULL,0,1,0,'查询','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',38,174,'064d818b-d40c-47b2-bd6a-e69bbd7820f3',0,'查询数据库表列表','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('同步数据库',3,9,'module_generator:db:sync',NULL,NULL,NULL,NULL,NULL,0,1,0,'同步数据库','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',38,175,'ce30ead9-3dee-4667-9c6b-e2836b0897a3',0,'同步数据库','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('AI对话',3,1,'module_ai:chat:ws',NULL,NULL,NULL,NULL,NULL,0,1,0,'AI对话','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',39,176,'be3393f7-6775-4189-8929-79abdeda1240',0,'AI对话','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('查询',3,2,'module_ai:chat:query',NULL,NULL,NULL,NULL,NULL,0,1,0,'查询','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',39,177,'5dd5a2d0-161e-43cc-b39a-56653a097ffd',0,'查询会话','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('详情',3,3,'module_ai:chat:detail',NULL,NULL,NULL,NULL,NULL,0,1,0,'详情','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',39,178,'7fedb43a-dd7e-4fb0-8a94-41ebd306d1b5',0,'会话详情','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('新增',3,4,'module_ai:chat:create',NULL,NULL,NULL,NULL,NULL,0,1,0,'新增','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',39,179,'c8e32cc4-090d-4e43-ac9e-93e72ffe6993',0,'创建会话','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('编辑',3,5,'module_ai:chat:update',NULL,NULL,NULL,NULL,NULL,0,1,0,'编辑','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',39,180,'0548abfd-6143-4145-b152-dedf3ab3fdb7',0,'更新会话','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('删除',3,6,'module_ai:chat:delete',NULL,NULL,NULL,NULL,NULL,0,1,0,'删除','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',39,181,'020e5c14-5cd4-459f-8868-b88fb38a8921',0,'删除会话','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('查询',3,1,'module_ai:chat:query',NULL,NULL,NULL,NULL,NULL,0,1,0,'查询','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',40,182,'098c779c-709b-4729-a6b7-0780d5f1ebca',0,'查询会话记忆','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('详情',3,2,'module_ai:chat:detail',NULL,NULL,NULL,NULL,NULL,0,1,0,'详情','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',40,183,'50c55000-a6f8-4b33-88ce-aec3db30de0d',0,'会话记忆详情','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('删除',3,3,'module_ai:chat:delete',NULL,NULL,NULL,NULL,NULL,0,1,0,'删除','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',40,184,'95235ca2-ddb2-4436-9d57-71309f2063ff',0,'删除会话记忆','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('调度器监控',2,1,'module_task:cronjob:job:query','ri:line-chart-line','Job','job','module_task/cronjob/job/index',NULL,0,1,0,'调度器监控','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',41,185,'c2a65b2c-6e6a-46bf-bbc6-3e12f8e65dd9',0,'调度器监控','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('节点管理',2,2,'module_task:cronjob:node:query','ri:mail-send-line','Node','node','module_task/cronjob/node/index',NULL,0,1,0,'节点管理','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',41,186,'153f8fbe-31f5-495a-aa9f-85d2b5473968',0,'节点管理','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('流程编排',2,1,'module_task:workflow:definition:query','ri:tools-line','Workflow','task/workflow/definition','module_task/workflow/definition/index',NULL,0,1,0,'流程编排','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',42,187,'c4478c64-99ed-4189-8b15-f572932ae741',0,'Vue Flow 画布与发布执行','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('编排节点类型',2,2,'module_task:workflow:node-type:query','ri:layout-grid-line','WorkflowNodeType','task/workflow/node-type','module_task/workflow/node-type/index',NULL,0,1,0,'编排节点类型','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',42,188,'8135d192-07c9-455a-9eff-816222db6f2a',0,'画布节点类型与 Prefect 执行逻辑','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('demo示例',2,1,'module_example:demo:query','ri:menu-line','Demo','demo','module_example/demo/index',NULL,0,1,0,'demo示例','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',43,189,'9d9e6cab-fb91-4d8e-8307-c780cadf9360',0,'demo示例','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('查询调度器',3,1,'module_task:cronjob:job:query',NULL,NULL,NULL,NULL,NULL,0,1,0,'查询调度器','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',185,190,'a819a0e2-d423-4cad-ac35-5b55d1a91f9f',0,'查询调度器','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('控制调度器',3,2,'module_task:cronjob:job:scheduler',NULL,NULL,NULL,NULL,NULL,0,1,0,'控制调度器','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',185,191,'bb4d51f9-f7a6-47b8-bd1c-33e9f8d3ae7e',0,'控制调度器','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('操作任务',3,3,'module_task:cronjob:job:task',NULL,NULL,NULL,NULL,NULL,0,1,0,'操作任务','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',185,192,'31898095-5f0b-4565-aa77-680230df10d8',0,'操作任务','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('删除执行日志',3,4,'module_task:cronjob:job:delete',NULL,NULL,NULL,NULL,NULL,0,1,0,'删除执行日志','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',185,193,'7ab6bd6b-a162-45e3-9f32-00c7c38a95a0',0,'删除执行日志','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('详情执行日志',3,5,'module_task:cronjob:job:detail',NULL,NULL,NULL,NULL,NULL,0,1,0,'详情执行日志','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',185,194,'c12c2bd6-f74c-40ec-8fd4-9341eaa15d54',0,'详情执行日志','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('创建节点',3,1,'module_task:cronjob:node:create',NULL,NULL,NULL,NULL,NULL,0,1,0,'创建节点','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',186,195,'ddec3526-76d9-473c-b3bc-eceb31015fc1',0,'创建节点','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('调试节点',3,2,'module_task:cronjob:node:execute',NULL,NULL,NULL,NULL,NULL,0,1,0,'调试节点','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',186,196,'5c024c24-77d0-40e1-a822-81327b246c49',0,'调试节点','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('修改节点',3,3,'module_task:cronjob:node:update',NULL,NULL,NULL,NULL,NULL,0,1,0,'修改节点','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',186,197,'92f5f064-060b-4eb9-8ac3-9553f70e621b',0,'修改节点','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('删除节点',3,4,'module_task:cronjob:node:delete',NULL,NULL,NULL,NULL,NULL,0,1,0,'删除节点','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',186,198,'c9113eab-c405-43bf-ad6b-274003f38ba5',0,'删除节点','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('详情节点',3,5,'module_task:cronjob:node:detail',NULL,NULL,NULL,NULL,NULL,0,1,0,'详情节点','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',186,199,'318c4ba1-508c-4382-aef5-5d9d3d497ff5',0,'详情节点','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('查询节点',3,6,'module_task:cronjob:node:query',NULL,NULL,NULL,NULL,NULL,0,1,0,'查询节点','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',186,200,'13554c00-8e3d-4811-8cc0-9ce17279a0b7',0,'查询节点','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('创建流程',3,1,'module_task:workflow:definition:create',NULL,NULL,NULL,NULL,NULL,0,1,0,'创建流程','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',187,201,'19bf0e5c-f968-4453-85a0-49523db4533d',0,'创建流程','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('执行流程',3,2,'module_task:workflow:definition:execute',NULL,NULL,NULL,NULL,NULL,0,1,0,'执行流程','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',187,202,'0ccb7252-5eef-45ed-8d9b-3028fdea4254',0,'执行流程','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('修改流程',3,3,'module_task:workflow:definition:update',NULL,NULL,NULL,NULL,NULL,0,1,0,'修改流程','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',187,203,'1694c5ed-c324-4175-a024-3542fd11eb9b',0,'修改流程','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('删除流程',3,4,'module_task:workflow:definition:delete',NULL,NULL,NULL,NULL,NULL,0,1,0,'删除流程','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',187,204,'89a45ac1-db0f-4ce2-8372-e1db9b9cbeba',0,'删除流程','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('详情流程',3,5,'module_task:workflow:definition:detail',NULL,NULL,NULL,NULL,NULL,0,1,0,'详情流程','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',187,205,'e05cb5d0-9252-476f-a79a-482496e4b0c2',0,'详情流程','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('查询流程',3,6,'module_task:workflow:definition:query',NULL,NULL,NULL,NULL,NULL,0,1,0,'查询流程','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',187,206,'d7058bb8-1574-418e-bf7b-b759bdc83557',0,'查询流程','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('创建编排节点类型',3,1,'module_task:workflow:node-type:create',NULL,NULL,NULL,NULL,NULL,0,1,0,'创建编排节点类型','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',188,207,'2ab210b8-75a7-4344-a68c-56c13e19dbb2',0,'创建编排节点类型','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('修改编排节点类型',3,2,'module_task:workflow:node-type:update',NULL,NULL,NULL,NULL,NULL,0,1,0,'修改编排节点类型','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',188,208,'aec8a8cd-d5cf-40b2-bff9-62caa817d931',0,'修改编排节点类型','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('删除编排节点类型',3,3,'module_task:workflow:node-type:delete',NULL,NULL,NULL,NULL,NULL,0,1,0,'删除编排节点类型','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',188,209,'1215643b-2b5f-480e-8a08-0bbfb722e81c',0,'删除编排节点类型','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('详情编排节点类型',3,4,'module_task:workflow:node-type:detail',NULL,NULL,NULL,NULL,NULL,0,1,0,'详情编排节点类型','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',188,210,'24b8a463-6a61-4523-a1a4-bc301a7895cc',0,'详情编排节点类型','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('查询编排节点类型',3,5,'module_task:workflow:node-type:query',NULL,NULL,NULL,NULL,NULL,0,1,0,'查询编排节点类型','null',0,'pc',NULL,0,0,NULL,0,NULL,'platform',188,211,'c60b1d0a-4847-4f6c-97bd-49157190f04a',0,'查询编排节点类型','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('新增',3,1,'module_example:demo:create',NULL,NULL,NULL,NULL,NULL,0,1,0,'新增','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',189,212,'7bf83b9c-8a70-4fce-9afd-73e81de944aa',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('编辑',3,2,'module_example:demo:update',NULL,NULL,NULL,NULL,NULL,0,1,0,'编辑','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',189,213,'25d08b9a-ab3c-4567-87f6-122afabac987',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('删除',3,3,'module_example:demo:delete',NULL,NULL,NULL,NULL,NULL,0,1,0,'删除','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',189,214,'680c3e96-21ff-46f2-88ce-20b7690ce655',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('状态变更',3,4,'module_example:demo:patch',NULL,NULL,NULL,NULL,NULL,0,1,0,'状态变更','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',189,215,'f3bc05f9-cccd-4920-8878-35a0156b1fc8',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('导出',3,5,'module_example:demo:export',NULL,NULL,NULL,NULL,NULL,0,1,0,'导出','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',189,216,'de343b27-46c9-440d-88db-8b70c0c71894',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('导入',3,6,'module_example:demo:import',NULL,NULL,NULL,NULL,NULL,0,1,0,'导入','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',189,217,'dbe4c86c-5b0f-43aa-8bc8-2119b0eb8dcb',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('下载导入模板',3,7,'module_example:demo:download',NULL,NULL,NULL,NULL,NULL,0,1,0,'下载导入模板','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',189,218,'fda73b8e-0d46-4be3-a9e4-03436c57acff',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('详情',3,8,'module_example:demo:detail',NULL,NULL,NULL,NULL,NULL,0,1,0,'详情','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',189,219,'67d7ac28-ab46-4950-8742-2a0c64a446aa',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('查询',3,9,'module_example:demo:query',NULL,NULL,NULL,NULL,NULL,0,1,0,'查询','null',0,'pc',NULL,0,0,NULL,0,NULL,'tenant',189,220,'55c81a76-7514-4bd7-8998-1b2d8ba95108',0,'初始化数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL);
/*!40000 ALTER TABLE `platform_menu` ENABLE KEYS */;

--
-- Table structure for table `platform_order`
--

DROP TABLE IF EXISTS `platform_order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `platform_order` (
  `order_no` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '订单号',
  `package_id` int DEFAULT NULL COMMENT '购买套餐(插件订单为空)',
  `plugin_id` int DEFAULT NULL COMMENT '购买插件(套餐订单为空)',
  `order_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'new/renew/upgrade/downgrade/plugin',
  `amount` int NOT NULL COMMENT '金额(分)',
  `period_count` int NOT NULL COMMENT '购买周期数',
  `pay_method` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'alipay/wxpay',
  `pay_time` datetime DEFAULT NULL COMMENT '支付时间',
  `expire_time` datetime NOT NULL COMMENT '订单过期时间(15分钟)',
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `uuid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID全局唯一标识',
  `status` int NOT NULL COMMENT '状态',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '备注/描述',
  `created_time` datetime NOT NULL COMMENT '创建时间',
  `updated_time` datetime NOT NULL COMMENT '更新时间',
  `is_deleted` tinyint(1) NOT NULL COMMENT '是否已删除(0:未删除 1:已删除)',
  `deleted_time` datetime DEFAULT NULL COMMENT '删除时间',
  `tenant_id` int NOT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_no` (`order_no`),
  UNIQUE KEY `ix_platform_order_uuid` (`uuid`),
  KEY `package_id` (`package_id`),
  KEY `plugin_id` (`plugin_id`),
  KEY `ix_platform_order_tenant_id` (`tenant_id`),
  KEY `ix_platform_order_updated_time` (`updated_time`),
  KEY `ix_platform_order_id` (`id`),
  KEY `ix_platform_order_is_deleted` (`is_deleted`),
  KEY `ix_platform_order_status` (`status`),
  KEY `ix_platform_order_created_time` (`created_time`),
  KEY `ix_platform_order_deleted_time` (`deleted_time`),
  CONSTRAINT `platform_order_ibfk_1` FOREIGN KEY (`package_id`) REFERENCES `platform_package` (`id`),
  CONSTRAINT `platform_order_ibfk_2` FOREIGN KEY (`plugin_id`) REFERENCES `platform_plugin` (`id`),
  CONSTRAINT `platform_order_ibfk_3` FOREIGN KEY (`tenant_id`) REFERENCES `platform_tenant` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platform_order`
--

/*!40000 ALTER TABLE `platform_order` DISABLE KEYS */;
INSERT INTO `platform_order` VALUES ('202601010000001',2,NULL,'new',29900,12,'alipay','2026-01-01 10:30:00','2026-01-01 10:45:00',1,'d087975f-4961-4f82-a0d8-d65d1f422901',1,'星辰科技-标准版年付新购','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,3),('202603150000001',NULL,2,'plugin',9900,1,'wxpay','2026-03-15 14:20:00','2026-03-15 14:35:00',2,'4d2c8d85-5f04-471b-9422-7b7bc90fb98c',1,'星辰科技-AI助手插件购买','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,3),('202604010000001',4,NULL,'upgrade',269900,12,'alipay','2026-04-01 09:00:00','2026-04-01 09:15:00',3,'4f3513b2-5eff-4cbb-9d5c-c2869813fba6',1,'星辰科技-标准版升级为企业版','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,3),('202602010000001',3,NULL,'new',99900,6,'wxpay','2026-02-01 11:00:00','2026-02-01 11:15:00',4,'a446aae7-bc90-43d3-9ad1-33008f6c4c83',3,'创新工坊-专业版半年（已退款）','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,4),('202605150000001',NULL,4,'plugin',19900,1,NULL,NULL,'2026-05-15 16:45:00',5,'f9ae9a2d-aeda-456c-948a-6c2190bf58b9',2,'创新工坊-工作流引擎（已取消）','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,4),('202606010000001',2,NULL,'new',29900,1,'alipay','2026-06-01 08:30:00','2026-06-01 08:45:00',6,'ae78db0d-e3dd-4f61-b35d-f3fc2829fae6',1,'创新工坊-标准版月付新购','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,4),('202606100000001',NULL,5,'plugin',4900,1,'wxpay','2026-06-10 15:00:00','2026-06-10 15:15:00',7,'c9528339-608d-4617-b1f4-eb59f397e9b1',1,'创新工坊-数据大屏插件购买','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,4),('202606120000001',2,NULL,'renew',269100,12,'alipay','2026-06-12 10:00:00','2026-06-12 10:15:00',8,'ee8cf7e2-bdb8-42c3-a35d-32a68d94c86d',1,'星辰科技-企业版年付续费','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,3),('202606120000002',NULL,NULL,'new',0,0,NULL,NULL,'2026-06-13 00:00:00',9,'9e013c40-ddd4-438b-a91f-87099639b2b8',0,'平台租户-测试待支付订单','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1);
/*!40000 ALTER TABLE `platform_order` ENABLE KEYS */;

--
-- Table structure for table `platform_package`
--

DROP TABLE IF EXISTS `platform_package`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `platform_package` (
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '套餐名称',
  `code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '套餐编码',
  `sort` int NOT NULL COMMENT '排序',
  `price` int NOT NULL COMMENT '价格(分)',
  `period` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '计费周期(month/year)',
  `trial_days` int NOT NULL COMMENT '免费试用天数',
  `max_users` int NOT NULL COMMENT '最大用户数',
  `max_roles` int NOT NULL COMMENT '最大角色数',
  `max_depts` int NOT NULL COMMENT '最大部门数',
  `max_storage_mb` int NOT NULL COMMENT '最大存储(MB)',
  `rate_limit` int NOT NULL COMMENT 'API速率限制(请求/10秒)',
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `uuid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID全局唯一标识',
  `status` int NOT NULL COMMENT '状态',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '备注/描述',
  `created_time` datetime NOT NULL COMMENT '创建时间',
  `updated_time` datetime NOT NULL COMMENT '更新时间',
  `is_deleted` tinyint(1) NOT NULL COMMENT '是否已删除(0:未删除 1:已删除)',
  `deleted_time` datetime DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `ix_platform_package_uuid` (`uuid`),
  KEY `ix_platform_package_is_deleted` (`is_deleted`),
  KEY `ix_platform_package_status` (`status`),
  KEY `ix_platform_package_created_time` (`created_time`),
  KEY `ix_platform_package_id` (`id`),
  KEY `ix_platform_package_deleted_time` (`deleted_time`),
  KEY `ix_platform_package_updated_time` (`updated_time`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='租户套餐表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platform_package`
--

/*!40000 ALTER TABLE `platform_package` DISABLE KEYS */;
INSERT INTO `platform_package` VALUES ('基础版','basic',1,0,'month',7,10,5,10,1024,30,1,'cd914eba-0b63-4ea3-a215-b2bc1cbea532',0,'适合个人和小团队使用','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('标准版','standard',2,29900,'month',0,50,20,50,10240,60,2,'5f4d4cf6-219b-4e78-baa1-5f8c0fd25433',0,'适合成长型企业','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('专业版','pro',3,99900,'month',0,200,50,200,102400,120,3,'e13907f3-c227-4128-b351-1eaf712cd164',0,'适合中型企业','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('企业版','enterprise',4,299900,'year',0,1000,200,1000,1024000,300,4,'7d5fbb01-c613-4b85-a5c3-8e71ae2dfb29',0,'适合大型企业和组织','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL);
/*!40000 ALTER TABLE `platform_package` ENABLE KEYS */;

--
-- Table structure for table `platform_package_menu`
--

DROP TABLE IF EXISTS `platform_package_menu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `platform_package_menu` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `package_id` int NOT NULL COMMENT '套餐ID',
  `menu_id` int NOT NULL COMMENT '菜单ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_package_menu` (`package_id`,`menu_id`),
  KEY `ix_platform_package_menu_package_id` (`package_id`),
  KEY `ix_platform_package_menu_menu_id` (`menu_id`),
  CONSTRAINT `platform_package_menu_ibfk_1` FOREIGN KEY (`package_id`) REFERENCES `platform_package` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `platform_package_menu_ibfk_2` FOREIGN KEY (`menu_id`) REFERENCES `platform_menu` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='套餐菜单关联表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platform_package_menu`
--

/*!40000 ALTER TABLE `platform_package_menu` DISABLE KEYS */;
INSERT INTO `platform_package_menu` VALUES (1,1,7),(2,1,8),(3,1,9),(4,1,10),(5,2,2),(6,2,5),(7,2,6),(8,2,7),(9,2,8),(10,2,9),(11,2,10),(12,3,1),(13,3,2),(14,3,3),(15,3,5),(16,3,6),(17,3,7),(18,3,8),(19,3,9),(20,3,10),(21,4,1),(22,4,2),(23,4,3),(24,4,4),(25,4,5),(26,4,6),(27,4,7),(28,4,8),(29,4,9),(30,4,10);
/*!40000 ALTER TABLE `platform_package_menu` ENABLE KEYS */;

--
-- Table structure for table `platform_package_plugin`
--

DROP TABLE IF EXISTS `platform_package_plugin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `platform_package_plugin` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `package_id` int NOT NULL COMMENT '套餐ID',
  `plugin_id` int NOT NULL COMMENT '插件ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_package_plugin` (`package_id`,`plugin_id`),
  KEY `ix_platform_package_plugin_package_id` (`package_id`),
  KEY `ix_platform_package_plugin_plugin_id` (`plugin_id`),
  CONSTRAINT `platform_package_plugin_ibfk_1` FOREIGN KEY (`package_id`) REFERENCES `platform_package` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `platform_package_plugin_ibfk_2` FOREIGN KEY (`plugin_id`) REFERENCES `platform_plugin` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='套餐插件关联表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platform_package_plugin`
--

/*!40000 ALTER TABLE `platform_package_plugin` DISABLE KEYS */;
/*!40000 ALTER TABLE `platform_package_plugin` ENABLE KEYS */;

--
-- Table structure for table `platform_payment_record`
--

DROP TABLE IF EXISTS `platform_payment_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `platform_payment_record` (
  `order_id` int NOT NULL COMMENT '关联订单',
  `transaction_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '第三方交易号',
  `pay_method` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '支付方式',
  `amount` int NOT NULL COMMENT '支付金额(分)',
  `raw_response` text COLLATE utf8mb4_unicode_ci COMMENT '原始回调JSON',
  `pay_time` datetime DEFAULT NULL COMMENT '支付完成时间',
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `uuid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID全局唯一标识',
  `status` int NOT NULL COMMENT '状态',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '备注/描述',
  `created_time` datetime NOT NULL COMMENT '创建时间',
  `updated_time` datetime NOT NULL COMMENT '更新时间',
  `is_deleted` tinyint(1) NOT NULL COMMENT '是否已删除(0:未删除 1:已删除)',
  `deleted_time` datetime DEFAULT NULL COMMENT '删除时间',
  `tenant_id` int NOT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_platform_payment_record_uuid` (`uuid`),
  UNIQUE KEY `transaction_id` (`transaction_id`),
  KEY `order_id` (`order_id`),
  KEY `ix_platform_payment_record_is_deleted` (`is_deleted`),
  KEY `ix_platform_payment_record_deleted_time` (`deleted_time`),
  KEY `ix_platform_payment_record_id` (`id`),
  KEY `ix_platform_payment_record_updated_time` (`updated_time`),
  KEY `ix_platform_payment_record_tenant_id` (`tenant_id`),
  KEY `ix_platform_payment_record_created_time` (`created_time`),
  KEY `ix_platform_payment_record_status` (`status`),
  CONSTRAINT `platform_payment_record_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `platform_order` (`id`),
  CONSTRAINT `platform_payment_record_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `platform_tenant` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付记录表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platform_payment_record`
--

/*!40000 ALTER TABLE `platform_payment_record` DISABLE KEYS */;
INSERT INTO `platform_payment_record` VALUES (1,'ALIP20260101000001','alipay',29900,NULL,'2026-01-01 10:30:00',1,'ea065abb-59f5-4ae9-93cc-99d646ba5378',1,'星辰科技-标准版年付','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,3),(2,'WXPAY202603150001','wxpay',9900,NULL,'2026-03-15 14:20:00',2,'c2a2aa84-21cf-42a3-9ea8-0d8b8a97d251',1,'星辰科技-AI助手','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,3),(3,'ALIP20260401000001','alipay',269900,NULL,'2026-04-01 09:00:00',3,'e473f6f3-5a4e-4224-8735-3e4dd850444f',1,'星辰科技-升级企业版','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,3),(4,'WXPAY202602010001','wxpay',99900,NULL,'2026-02-01 11:00:00',4,'378379cd-d872-4134-8958-e2b6a7893fa6',2,'创新工坊-专业版半年（已退款）','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,4),(6,'ALIP20260601000001','alipay',29900,NULL,'2026-06-01 08:30:00',5,'3e17b5d1-d48f-4a5d-80cd-88f12e311cfb',1,'创新工坊-标准版月付','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,4),(7,'WXPAY202606100001','wxpay',4900,NULL,'2026-06-10 15:00:00',6,'c30745f7-a51c-4635-814b-fc5f311e3a77',1,'创新工坊-数据大屏','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,4),(8,'ALIP20260612000001','alipay',269100,NULL,'2026-06-12 10:00:00',7,'d1f8eb30-c3be-48ac-b24c-cce61762360f',1,'星辰科技-企业版续费','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,3);
/*!40000 ALTER TABLE `platform_payment_record` ENABLE KEYS */;

--
-- Table structure for table `platform_plugin`
--

DROP TABLE IF EXISTS `platform_plugin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `platform_plugin` (
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '插件名称',
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '插件编码(module_xxx)',
  `version` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '版本号',
  `author` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '作者',
  `icon` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '图标URL',
  `category` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '分类(tool/ai/monitor/business)',
  `price` int NOT NULL COMMENT '价格(分,0=免费)',
  `menu_path` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '菜单路径(安装后显示)',
  `permission_prefix` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '权限前缀',
  `dependencies` text COLLATE utf8mb4_unicode_ci COMMENT '依赖插件编码(JSON数组)',
  `sort` int NOT NULL COMMENT '排序',
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `uuid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID全局唯一标识',
  `status` int NOT NULL COMMENT '状态',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '备注/描述',
  `created_time` datetime NOT NULL COMMENT '创建时间',
  `updated_time` datetime NOT NULL COMMENT '更新时间',
  `is_deleted` tinyint(1) NOT NULL COMMENT '是否已删除(0:未删除 1:已删除)',
  `deleted_time` datetime DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `ix_platform_plugin_uuid` (`uuid`),
  KEY `ix_platform_plugin_created_time` (`created_time`),
  KEY `ix_platform_plugin_deleted_time` (`deleted_time`),
  KEY `ix_platform_plugin_id` (`id`),
  KEY `ix_platform_plugin_updated_time` (`updated_time`),
  KEY `ix_platform_plugin_is_deleted` (`is_deleted`),
  KEY `ix_platform_plugin_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='插件注册表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platform_plugin`
--

/*!40000 ALTER TABLE `platform_plugin` DISABLE KEYS */;
INSERT INTO `platform_plugin` VALUES ('代码生成器','code_generator','1.0.0','FastApiAdmin','https://service.fastapiadmin.com/api/v1/static/image/plugin/code.png','tool',0,'/tool/generator','tool:generator',NULL,1,1,'ae326936-e0d9-4c5a-8bed-e043485ad945',0,'自动生成CRUD代码，支持多种模板','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('AI助手','ai_assistant','1.0.0','FastApiAdmin','https://service.fastapiadmin.com/api/v1/static/image/plugin/ai.png','ai',9900,'/ai/assistant','ai:assistant',NULL,2,2,'8f74cc30-2285-4560-8683-4d372c9b2412',0,'集成AI对话助手，支持智能问答','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('系统监控','system_monitor','1.0.0','FastApiAdmin','https://service.fastapiadmin.com/api/v1/static/image/plugin/monitor.png','monitor',0,'/monitor/system','monitor:system',NULL,3,3,'02c1b1df-34d1-40fb-925c-d4400a633e3c',0,'实时监控系统运行状态，CPU、内存、磁盘等','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('工作流引擎','workflow_engine','1.0.0','FastApiAdmin','https://service.fastapiadmin.com/api/v1/static/image/plugin/workflow.png','business',19900,'/workflow/design','workflow:design',NULL,4,4,'4cb9502a-fdfd-4b95-816a-0474c3aacba3',0,'可视化工作流设计器，支持审批流程','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('数据大屏','data_dashboard','1.0.0','FastApiAdmin','https://service.fastapiadmin.com/api/v1/static/image/plugin/dashboard.png','business',4900,'/dashboard/data','dashboard:data',NULL,5,5,'8643f992-7338-4f49-9800-bf8c1287e1ac',0,'可视化数据大屏，支持多种图表','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL);
/*!40000 ALTER TABLE `platform_plugin` ENABLE KEYS */;

--
-- Table structure for table `platform_refund`
--

DROP TABLE IF EXISTS `platform_refund`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `platform_refund` (
  `order_id` int NOT NULL COMMENT '关联订单',
  `refund_no` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '退款单号',
  `amount` int NOT NULL COMMENT '退款金额(分)',
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '退款原因',
  `refund_transaction_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '退款交易号',
  `reviewer_id` int DEFAULT NULL COMMENT '审核人',
  `review_time` datetime DEFAULT NULL COMMENT '审核时间',
  `reject_reason` text COLLATE utf8mb4_unicode_ci COMMENT '驳回原因',
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `uuid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID全局唯一标识',
  `status` int NOT NULL COMMENT '状态',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '备注/描述',
  `created_time` datetime NOT NULL COMMENT '创建时间',
  `updated_time` datetime NOT NULL COMMENT '更新时间',
  `is_deleted` tinyint(1) NOT NULL COMMENT '是否已删除(0:未删除 1:已删除)',
  `deleted_time` datetime DEFAULT NULL COMMENT '删除时间',
  `tenant_id` int NOT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_id` (`order_id`),
  UNIQUE KEY `refund_no` (`refund_no`),
  UNIQUE KEY `ix_platform_refund_uuid` (`uuid`),
  KEY `reviewer_id` (`reviewer_id`),
  KEY `ix_platform_refund_is_deleted` (`is_deleted`),
  KEY `ix_platform_refund_status` (`status`),
  KEY `ix_platform_refund_created_time` (`created_time`),
  KEY `ix_platform_refund_id` (`id`),
  KEY `ix_platform_refund_deleted_time` (`deleted_time`),
  KEY `ix_platform_refund_tenant_id` (`tenant_id`),
  KEY `ix_platform_refund_updated_time` (`updated_time`),
  CONSTRAINT `platform_refund_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `platform_order` (`id`),
  CONSTRAINT `platform_refund_ibfk_2` FOREIGN KEY (`reviewer_id`) REFERENCES `sys_user` (`id`),
  CONSTRAINT `platform_refund_ibfk_3` FOREIGN KEY (`tenant_id`) REFERENCES `platform_tenant` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='退款表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platform_refund`
--

/*!40000 ALTER TABLE `platform_refund` DISABLE KEYS */;
INSERT INTO `platform_refund` VALUES (4,'RF20260220000001',99900,'套餐选择错误，申请退款并更换为标准版','WXREFUND20260220001',2,'2026-02-20 16:30:00',NULL,1,'0cb39f69-c0a9-49be-a9b3-5cb728aa2b1c',2,'创新工坊-专业版退款（已通过）','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,4);
/*!40000 ALTER TABLE `platform_refund` ENABLE KEYS */;

--
-- Table structure for table `platform_tenant`
--

DROP TABLE IF EXISTS `platform_tenant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `platform_tenant` (
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '租户名称',
  `code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '租户编码',
  `contact_name` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '联系人姓名',
  `contact_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '联系人电话',
  `contact_email` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '联系人邮箱',
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '地址',
  `domain` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '域名',
  `logo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Logo URL',
  `sort` int NOT NULL COMMENT '排序',
  `package_id` int DEFAULT NULL COMMENT '关联套餐ID',
  `start_time` datetime DEFAULT NULL COMMENT '开始时间',
  `end_time` datetime DEFAULT NULL COMMENT '结束时间',
  `version` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '版本号',
  `favicon` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'favicon地址',
  `login_bg` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '登录背景地址',
  `copyright` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '版权信息',
  `keep_record` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备案号',
  `help_doc` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '帮助文档地址',
  `privacy` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '隐私政策地址',
  `clause` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '服务条款地址',
  `git_code` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '源码地址',
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `uuid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID全局唯一标识',
  `status` int NOT NULL COMMENT '状态',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '备注/描述',
  `created_time` datetime NOT NULL COMMENT '创建时间',
  `updated_time` datetime NOT NULL COMMENT '更新时间',
  `is_deleted` tinyint(1) NOT NULL COMMENT '是否已删除(0:未删除 1:已删除)',
  `deleted_time` datetime DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `ix_platform_tenant_uuid` (`uuid`),
  KEY `ix_platform_tenant_created_time` (`created_time`),
  KEY `ix_platform_tenant_deleted_time` (`deleted_time`),
  KEY `ix_platform_tenant_id` (`id`),
  KEY `ix_platform_tenant_package_id` (`package_id`),
  KEY `ix_platform_tenant_updated_time` (`updated_time`),
  KEY `ix_platform_tenant_is_deleted` (`is_deleted`),
  KEY `ix_platform_tenant_status` (`status`),
  CONSTRAINT `platform_tenant_ibfk_1` FOREIGN KEY (`package_id`) REFERENCES `platform_package` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='租户表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platform_tenant`
--

/*!40000 ALTER TABLE `platform_tenant` DISABLE KEYS */;
INSERT INTO `platform_tenant` VALUES ('平台租户','system','管理员','13800138000','admin@fastapiadmin.com','陕西省西安市',NULL,'https://service.fastapiadmin.com/api/v1/static/image/logo.svg',0,NULL,NULL,NULL,'1.0.0','https://service.fastapiadmin.com/api/v1/static/image/favicon.ico','https://service.fastapiadmin.com/api/v1/static/image/background.svg','Copyright © 2025-2027 service.fastapiadmin.com 版权所有','陕ICP备2025069493号-1','https://docs.fastapiadmin.com','https://fastapiadmin.com/privacy','https://fastapiadmin.com/clause','https://github.com/fastapi-admin/fastapi-admin',1,'41f0ee9e-269a-49d2-876b-2a881abb24d7',0,'平台默认租户，id 固定为 1，管理平台所有资源（不受套餐限制）','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('测试租户','test','测试管理员','13800138001','test@fastapiadmin.com','上海市浦东新区','test.fastapiadmin.com','https://service.fastapiadmin.com/api/v1/static/image/logo.png',1,2,'2024-01-01 00:00:00','2027-12-31 23:59:59','1.0.0','https://service.fastapiadmin.com/api/v1/static/image/favicon.ico','https://service.fastapiadmin.com/api/v1/static/image/background.svg','Copyright © 2024 Test Tenant 版权所有','陕ICP备2024000000号','https://docs.fastapiadmin.com','https://fastapiadmin.com/privacy','https://fastapiadmin.com/clause',NULL,2,'dee92a6e-4287-4be4-a36b-4e9f2805a575',0,'测试租户，用于功能测试','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('星辰科技有限公司','STAR','张明','13800001001','zhang@star-tech.dev',NULL,NULL,NULL,0,2,NULL,NULL,NULL,NULL,NULL,'2026 星辰科技',NULL,NULL,NULL,NULL,NULL,3,'a1bdc5b4-b1ca-481b-a001-bc8c30647f9b',0,'中型科技企业，使用标准版套餐','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL),('创新工坊','INNO','李芳','13800002001','li@inno.work',NULL,NULL,NULL,0,1,NULL,NULL,NULL,NULL,NULL,'2026 创新工坊',NULL,NULL,NULL,NULL,NULL,4,'fb8695d0-a0ea-458e-abe7-e9e20b0d0fc8',0,'初创团队，使用基础版免费试用','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL);
/*!40000 ALTER TABLE `platform_tenant` ENABLE KEYS */;

--
-- Table structure for table `platform_tenant_plugin`
--

DROP TABLE IF EXISTS `platform_tenant_plugin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `platform_tenant_plugin` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `tenant_id` int NOT NULL COMMENT '租户ID',
  `plugin_id` int NOT NULL COMMENT '插件ID',
  `enabled` varchar(1) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '启用(1:启用 0:禁用)',
  `purchased` varchar(1) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '是否已购买(1:已购买 0:未购买)',
  `installed_time` datetime NOT NULL COMMENT '安装时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tenant_plugin` (`tenant_id`,`plugin_id`),
  KEY `ix_platform_tenant_plugin_tenant_id` (`tenant_id`),
  KEY `ix_platform_tenant_plugin_plugin_id` (`plugin_id`),
  CONSTRAINT `platform_tenant_plugin_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `platform_tenant` (`id`) ON DELETE CASCADE,
  CONSTRAINT `platform_tenant_plugin_ibfk_2` FOREIGN KEY (`plugin_id`) REFERENCES `platform_plugin` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='租户插件关联表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platform_tenant_plugin`
--

/*!40000 ALTER TABLE `platform_tenant_plugin` DISABLE KEYS */;
INSERT INTO `platform_tenant_plugin` VALUES (1,1,1,'1','0','2024-01-01 00:00:00'),(2,1,2,'1','0','2024-01-01 00:00:00'),(3,1,3,'1','0','2024-01-01 00:00:00'),(4,1,4,'1','0','2024-01-01 00:00:00'),(5,1,5,'1','0','2024-01-01 00:00:00'),(6,2,1,'1','0','2024-01-01 00:00:00'),(7,2,3,'1','0','2024-01-01 00:00:00'),(8,2,5,'1','0','2024-01-01 00:00:00');
/*!40000 ALTER TABLE `platform_tenant_plugin` ENABLE KEYS */;

--
-- Table structure for table `platform_user_tenant`
--

DROP TABLE IF EXISTS `platform_user_tenant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `platform_user_tenant` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` int NOT NULL COMMENT '用户ID',
  `tenant_id` int NOT NULL COMMENT '租户ID',
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '租户内角色(owner:拥有者 admin:管理员 member:成员)',
  `is_default` smallint NOT NULL COMMENT '是否默认租户(0:否 1:是)',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_tenant` (`user_id`,`tenant_id`),
  KEY `ix_platform_user_tenant_tenant_id` (`tenant_id`),
  KEY `ix_platform_user_tenant_user_id` (`user_id`),
  CONSTRAINT `platform_user_tenant_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `platform_user_tenant_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `platform_tenant` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户租户关联表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platform_user_tenant`
--

/*!40000 ALTER TABLE `platform_user_tenant` DISABLE KEYS */;
INSERT INTO `platform_user_tenant` VALUES (1,1,1,'owner',1,'2026-06-17 00:17:10'),(2,2,1,'admin',1,'2026-06-17 00:17:10'),(3,3,1,'member',1,'2026-06-17 00:17:10'),(4,4,1,'member',1,'2026-06-17 00:17:10'),(5,5,1,'member',1,'2026-06-17 00:17:10'),(6,1,3,'owner',0,'2026-06-17 00:17:10'),(7,6,3,'owner',1,'2026-06-17 00:17:10'),(8,7,3,'member',1,'2026-06-17 00:17:10'),(9,8,4,'owner',1,'2026-06-17 00:17:10'),(10,9,4,'member',1,'2026-06-17 00:17:10');
/*!40000 ALTER TABLE `platform_user_tenant` ENABLE KEYS */;

--
-- Table structure for table `sys_dept`
--

DROP TABLE IF EXISTS `sys_dept`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_dept` (
  `name` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '部门名称',
  `order` int NOT NULL COMMENT '显示排序',
  `code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '部门编码',
  `leader` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '部门负责人',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '手机',
  `email` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '邮箱',
  `parent_id` int DEFAULT NULL COMMENT '父级部门ID',
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `uuid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID全局唯一标识',
  `status` int NOT NULL COMMENT '状态',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '备注/描述',
  `created_time` datetime NOT NULL COMMENT '创建时间',
  `updated_time` datetime NOT NULL COMMENT '更新时间',
  `is_deleted` tinyint(1) NOT NULL COMMENT '是否已删除(0:未删除 1:已删除)',
  `deleted_time` datetime DEFAULT NULL COMMENT '删除时间',
  `tenant_id` int NOT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `tenant_id` (`tenant_id`,`code`),
  UNIQUE KEY `ix_sys_dept_uuid` (`uuid`),
  KEY `ix_sys_dept_status` (`status`),
  KEY `ix_sys_dept_created_time` (`created_time`),
  KEY `ix_sys_dept_deleted_time` (`deleted_time`),
  KEY `ix_sys_dept_id` (`id`),
  KEY `ix_sys_dept_parent_id` (`parent_id`),
  KEY `ix_sys_dept_tenant_id` (`tenant_id`),
  KEY `ix_sys_dept_updated_time` (`updated_time`),
  KEY `ix_sys_dept_is_deleted` (`is_deleted`),
  CONSTRAINT `sys_dept_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `sys_dept` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `sys_dept_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `platform_tenant` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='部门表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_dept`
--

/*!40000 ALTER TABLE `sys_dept` DISABLE KEYS */;
INSERT INTO `sys_dept` VALUES ('集团总公司',1,'GROUP','张总','13800138000','ceo@example.com',NULL,1,'0076947d-1fb9-404d-bc12-1730b4ae7652',0,'集团总部','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('星辰研发中心',1,'STAR_RND',NULL,NULL,NULL,NULL,2,'0d8e3ed4-f64c-40de-bde5-2d214fd6ab9c',0,'星辰科技研发部门','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,3),('星辰市场部',2,'STAR_MKT',NULL,NULL,NULL,NULL,3,'1048dd8d-dd24-49ac-ada2-bee2fa6ef8dd',0,'星辰科技市场部门','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,3),('创新产品部',1,'INNO_PROD',NULL,NULL,NULL,NULL,4,'03b81638-0b1e-472b-b795-8fcc11744657',0,'创新工坊产品团队','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,4),('创新技术部',2,'INNO_TECH',NULL,NULL,NULL,NULL,5,'d2857523-6cc5-4e1d-8efe-988ac508ef19',0,'创新工坊技术团队','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,4),('技术研发部',1,'TECH','李工','13800138001','tech@example.com',1,6,'cfec841f-3bde-451b-8f9a-9b7f9fc8c04b',0,'负责技术研发','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('产品运营部',2,'PRODUCT','赵经理','13800138004','product@example.com',1,7,'c0c7e70d-938a-4546-8f6b-7eae0e7053f8',0,'产品与运营','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('人力资源部',3,'HR','刘经理','13800138005','hr@example.com',1,8,'fc615cec-48fe-412f-a075-a9e41656aeba',0,'人事管理','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('前端组',1,'STAR_FE',NULL,NULL,NULL,2,9,'846903ef-ad2e-47f6-9e5d-db24b50c1416',0,NULL,'2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,3),('后端组',2,'STAR_BE',NULL,NULL,NULL,2,10,'d1c38c02-8c58-4ff5-bdde-d9e5e5084b11',0,NULL,'2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,3),('测试组',3,'STAR_QA',NULL,NULL,NULL,2,11,'c5596176-515e-4d0a-8285-b18c43a37ff1',0,NULL,'2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,3),('后端开发组',1,'BACKEND','王工','13800138002','backend@example.com',6,12,'31a92103-1520-4c66-b6fc-d6a3533c85b0',0,'后端技术开发','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('前端开发组',2,'FRONTEND','陈工','13800138003','frontend@example.com',6,13,'c974ad44-765d-4c9c-a3dc-e62354f1788d',0,'前端技术开发','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1);
/*!40000 ALTER TABLE `sys_dept` ENABLE KEYS */;

--
-- Table structure for table `sys_dict_data`
--

DROP TABLE IF EXISTS `sys_dict_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_dict_data` (
  `dict_sort` int NOT NULL COMMENT '字典排序',
  `dict_label` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '字典标签',
  `dict_value` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '字典键值',
  `css_class` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '样式属性（其他样式扩展）',
  `list_class` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '表格回显样式',
  `is_default` tinyint(1) NOT NULL COMMENT '是否默认（True是 False否）',
  `dict_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '字典类型',
  `dict_type_id` int NOT NULL COMMENT '字典类型ID',
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `uuid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID全局唯一标识',
  `status` int NOT NULL COMMENT '状态',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '备注/描述',
  `created_time` datetime NOT NULL COMMENT '创建时间',
  `updated_time` datetime NOT NULL COMMENT '更新时间',
  `is_deleted` tinyint(1) NOT NULL COMMENT '是否已删除(0:未删除 1:已删除)',
  `deleted_time` datetime DEFAULT NULL COMMENT '删除时间',
  `tenant_id` int NOT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_dict_data_value` (`tenant_id`,`dict_type_id`,`dict_value`),
  UNIQUE KEY `ix_sys_dict_data_uuid` (`uuid`),
  KEY `dict_type_id` (`dict_type_id`),
  KEY `ix_sys_dict_data_status` (`status`),
  KEY `ix_sys_dict_data_deleted_time` (`deleted_time`),
  KEY `ix_sys_dict_data_created_time` (`created_time`),
  KEY `ix_sys_dict_data_id` (`id`),
  KEY `ix_sys_dict_data_tenant_id` (`tenant_id`),
  KEY `ix_sys_dict_data_updated_time` (`updated_time`),
  KEY `ix_sys_dict_data_is_deleted` (`is_deleted`),
  CONSTRAINT `sys_dict_data_ibfk_1` FOREIGN KEY (`dict_type_id`) REFERENCES `sys_dict_type` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sys_dict_data_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `platform_tenant` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='字典数据表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_dict_data`
--

/*!40000 ALTER TABLE `sys_dict_data` DISABLE KEYS */;
INSERT INTO `sys_dict_data` VALUES (1,'男','0','blue',NULL,1,'sys_user_sex',1,1,'c1d722b8-11fc-45e9-9741-8934d407e257',0,'性别男','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),(2,'女','1','pink',NULL,0,'sys_user_sex',1,2,'ce97c2c9-4d0f-400e-a0a9-113f41a2def2',0,'性别女','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),(3,'未知','2','red',NULL,0,'sys_user_sex',1,3,'ea55ce5e-13b2-4158-9944-568ce7081e04',0,'性别未知','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),(1,'是','1','','primary',1,'sys_yes_no',2,4,'72bc029a-3093-48fb-b2bb-e8c314e2b86b',0,'是','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),(2,'否','0','','danger',0,'sys_yes_no',2,5,'cae8d6cb-330c-4679-a3d8-a04b1d2303fb',0,'否','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),(1,'启用','1','','primary',0,'sys_common_status',3,6,'91b2e546-8218-403b-82a9-fa299b1ce2aa',0,'启用状态','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),(2,'停用','0','','danger',0,'sys_common_status',3,7,'80614e2a-a1ce-4019-a23c-1f8c990b52d7',0,'停用状态','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),(1,'通知','1','blue','warning',1,'sys_notice_type',4,8,'234f0bb1-261c-4bb5-9a4b-3312a863d07d',0,'通知','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),(2,'公告','2','orange','success',0,'sys_notice_type',4,9,'b742743e-e683-4fa9-a883-ed761102e33a',0,'公告','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),(99,'其他','0','','info',0,'sys_oper_type',5,10,'32fc2bb3-550f-4310-ae8c-9f4505f4fec7',0,'其他操作','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),(1,'新增','1','','info',0,'sys_oper_type',5,11,'fc3578ac-2293-4913-baea-32dba66cc080',0,'新增操作','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),(2,'修改','2','','info',0,'sys_oper_type',5,12,'18cdaec5-3e8a-4b19-8d9a-53bbb48f54b8',0,'修改操作','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),(3,'删除','3','','danger',0,'sys_oper_type',5,13,'2fcd979e-050b-495c-aef7-54fce4d82fa9',0,'删除操作','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),(4,'分配权限','4','','primary',0,'sys_oper_type',5,14,'5a5054bb-f194-45a2-aa2d-b52fd7c5f74c',0,'授权操作','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),(5,'导出','5','','warning',0,'sys_oper_type',5,15,'9bf6fd05-7caf-417a-9cb2-cb761eecab03',0,'导出操作','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),(6,'导入','6','','warning',0,'sys_oper_type',5,16,'104c9c90-ebbc-414b-b682-f90da3c76516',0,'导入操作','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),(7,'强退','7','','danger',0,'sys_oper_type',5,17,'ec19877a-820f-4bff-a0f1-0772181accd5',0,'强退操作','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),(8,'生成代码','8','','warning',0,'sys_oper_type',5,18,'e8f3808b-be4b-4ab6-8e39-d41a98648c2c',0,'生成操作','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),(9,'清空数据','9','','danger',0,'sys_oper_type',5,19,'c5cdcc91-0f9c-4918-88f8-4897813a3746',0,'清空操作','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),(1,'默认(Memory)','default','',NULL,1,'sys_job_store',6,20,'c0ce36c8-d23b-4406-9db6-ad03a1a3caa7',0,'默认分组','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),(2,'数据库(Sqlalchemy)','sqlalchemy','',NULL,0,'sys_job_store',6,21,'9e924edf-2d00-496d-a8da-a2ab3116aa79',0,'数据库分组','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),(3,'数据库(Redis)','redis','',NULL,0,'sys_job_store',6,22,'52b591d3-da1b-4448-94b5-386c4051f8ce',0,'reids分组','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),(1,'线程池','default','',NULL,0,'sys_job_executor',7,23,'bc413e13-08c6-43d5-8313-9bc6afb29773',0,'线程池','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),(2,'进程池','processpool','',NULL,0,'sys_job_executor',7,24,'2557f51a-f9fa-4d0a-a857-52a75bf27b3e',0,'进程池','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),(1,'演示函数','scheduler_test.job','',NULL,1,'sys_job_function',8,25,'a40eaaf0-060a-4a4c-9673-6f789d8eae7b',0,'演示函数','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),(1,'指定日期(date)','date','',NULL,1,'sys_job_trigger',9,26,'06eab8e4-1012-4af2-b5e6-8df63bea5493',0,'指定日期任务触发器','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),(2,'间隔触发器(interval)','interval','',NULL,0,'sys_job_trigger',9,27,'885a9fec-8b64-4df3-b7b0-121748f64c43',0,'间隔触发器任务触发器','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),(3,'cron表达式','cron','',NULL,0,'sys_job_trigger',9,28,'fc4ae726-11cf-4242-bb77-318afaa711bd',0,'间隔触发器任务触发器','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),(1,'默认(default)','default','',NULL,1,'sys_list_class',10,29,'b0414944-4344-496e-8437-5f2a6568bd04',0,'默认表格回显样式','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),(2,'主要(primary)','primary','',NULL,0,'sys_list_class',10,30,'9cae766a-c7a9-420c-b9fe-0a00c929b83e',0,'主要表格回显样式','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),(3,'成功(success)','success','',NULL,0,'sys_list_class',10,31,'363fb848-de16-4ad5-979a-49e661f6bbb9',0,'成功表格回显样式','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),(4,'信息(info)','info','',NULL,0,'sys_list_class',10,32,'a903c5f4-a6a2-4f35-8578-2efa4203b081',0,'信息表格回显样式','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),(5,'警告(warning)','warning','',NULL,0,'sys_list_class',10,33,'1eca7b99-c1a3-478f-809a-716e0237bc10',0,'警告表格回显样式','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),(6,'危险(danger)','danger','',NULL,0,'sys_list_class',10,34,'c922de3a-b62a-42f9-a366-e729204fe393',0,'危险表格回显样式','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1);
/*!40000 ALTER TABLE `sys_dict_data` ENABLE KEYS */;

--
-- Table structure for table `sys_dict_type`
--

DROP TABLE IF EXISTS `sys_dict_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_dict_type` (
  `dict_name` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '字典名称',
  `dict_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '字典类型',
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `uuid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID全局唯一标识',
  `status` int NOT NULL COMMENT '状态',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '备注/描述',
  `created_time` datetime NOT NULL COMMENT '创建时间',
  `updated_time` datetime NOT NULL COMMENT '更新时间',
  `is_deleted` tinyint(1) NOT NULL COMMENT '是否已删除(0:未删除 1:已删除)',
  `deleted_time` datetime DEFAULT NULL COMMENT '删除时间',
  `tenant_id` int NOT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `tenant_id` (`tenant_id`,`dict_type`),
  UNIQUE KEY `ix_sys_dict_type_uuid` (`uuid`),
  KEY `ix_sys_dict_type_created_time` (`created_time`),
  KEY `ix_sys_dict_type_deleted_time` (`deleted_time`),
  KEY `ix_sys_dict_type_status` (`status`),
  KEY `ix_sys_dict_type_is_deleted` (`is_deleted`),
  KEY `ix_sys_dict_type_updated_time` (`updated_time`),
  KEY `ix_sys_dict_type_id` (`id`),
  KEY `ix_sys_dict_type_tenant_id` (`tenant_id`),
  CONSTRAINT `sys_dict_type_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `platform_tenant` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='字典类型表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_dict_type`
--

/*!40000 ALTER TABLE `sys_dict_type` DISABLE KEYS */;
INSERT INTO `sys_dict_type` VALUES ('用户性别','sys_user_sex',1,'8415ac09-c1e6-46d4-b589-16999d269ea4',0,'用户性别列表','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('系统是否','sys_yes_no',2,'e7fd2e93-60b1-497f-b377-448486b4b3df',0,'系统是否列表','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('系统状态','sys_common_status',3,'e38efcb6-b8ad-4847-8e29-4c617ecd8f48',0,'系统状态','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('通知类型','sys_notice_type',4,'53ce6133-9ca1-4348-b219-24b96c2afb69',0,'通知类型列表','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('操作类型','sys_oper_type',5,'96bcbd65-7a57-404a-95e0-3de99bd9605c',0,'操作类型列表','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('任务存储器','sys_job_store',6,'44fdf67d-2765-4d64-99ba-3702c4c60879',0,'任务分组列表','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('任务执行器','sys_job_executor',7,'349d2301-2c4f-4cd7-a466-8b816c40e2f0',0,'任务执行器列表','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('任务函数','sys_job_function',8,'32580fcd-de8f-4b40-852f-02c144c3795b',0,'任务函数列表','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('任务触发器','sys_job_trigger',9,'68b2109f-3836-4904-821e-079c7f0e93f3',0,'任务触发器列表','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('表格回显样式','sys_list_class',10,'b2d508f0-7b31-4bd7-87f5-b3da408d3ead',0,'表格回显样式列表','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1);
/*!40000 ALTER TABLE `sys_dict_type` ENABLE KEYS */;

--
-- Table structure for table `sys_login_log`
--

DROP TABLE IF EXISTS `sys_login_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_login_log` (
  `status` int NOT NULL COMMENT '登录状态(1成功 2失败)',
  `username` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户名',
  `login_location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '登录位置',
  `login_ip` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '登录IP地址',
  `request_os` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '操作系统',
  `request_browser` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '浏览器',
  `msg` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '提示消息',
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `uuid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID全局唯一标识',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '备注/描述',
  `created_time` datetime NOT NULL COMMENT '创建时间',
  `updated_time` datetime NOT NULL COMMENT '更新时间',
  `is_deleted` tinyint(1) NOT NULL COMMENT '是否已删除(0:未删除 1:已删除)',
  `deleted_time` datetime DEFAULT NULL COMMENT '删除时间',
  `tenant_id` int NOT NULL COMMENT '租户ID',
  `created_id` int DEFAULT NULL COMMENT '创建人ID',
  `updated_id` int DEFAULT NULL COMMENT '更新人ID',
  `deleted_id` int DEFAULT NULL COMMENT '删除人ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_sys_login_log_uuid` (`uuid`),
  KEY `ix_sys_login_log_is_deleted` (`is_deleted`),
  KEY `ix_sys_login_log_updated_id` (`updated_id`),
  KEY `ix_sys_login_log_created_time` (`created_time`),
  KEY `ix_sys_login_log_deleted_time` (`deleted_time`),
  KEY `ix_sys_login_log_created_id` (`created_id`),
  KEY `ix_sys_login_log_id` (`id`),
  KEY `ix_sys_login_log_tenant_id` (`tenant_id`),
  KEY `ix_sys_login_log_deleted_id` (`deleted_id`),
  KEY `ix_sys_login_log_updated_time` (`updated_time`),
  CONSTRAINT `sys_login_log_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `platform_tenant` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `sys_login_log_ibfk_2` FOREIGN KEY (`created_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `sys_login_log_ibfk_3` FOREIGN KEY (`updated_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `sys_login_log_ibfk_4` FOREIGN KEY (`deleted_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录日志表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_login_log`
--

/*!40000 ALTER TABLE `sys_login_log` DISABLE KEYS */;
INSERT INTO `sys_login_log` VALUES (1,'super','陕西省西安市','127.0.0.1','macOS 14.5','Chrome 125','登录成功',1,'c45a29a5-d39d-44aa-b065-ea060957529c',NULL,'2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),(1,'admin','陕西省西安市','127.0.0.1','macOS 14.5','Chrome 125','登录成功',2,'e0ccbfdc-e12a-4af9-9588-a04f04ef7ddb',NULL,'2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),(1,'user','北京市','192.168.1.100','Windows 11','Edge 125','登录成功',3,'122e5b87-c56a-44b6-8771-8a397c09b9fa',NULL,'2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),(2,'super','广东省深圳市','203.0.113.50','Unknown','Unknown','密码错误，剩余尝试次数: 4',4,'97b44174-df0d-4b31-95bb-9fb3e70df8d1',NULL,'2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),(1,'product','上海市','10.0.0.88','macOS 14.6','Safari 17.5','登录成功',5,'0c71b315-ad4d-4bd6-8268-9cad1d917d8e',NULL,'2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),(1,'zhang_admin','浙江省杭州市','172.16.0.10','Windows 10','Chrome 124','登录成功',6,'eddde6c9-f102-4de7-aa17-aa6cd9a18d35',NULL,'2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,3,NULL,NULL,NULL),(1,'wang_dev','浙江省杭州市','172.16.0.20','Ubuntu 22.04','Firefox 126','登录成功',7,'4087e0e3-f3a3-4b2c-8494-cbde7f98cc15',NULL,'2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,3,NULL,NULL,NULL),(1,'li_admin','四川省成都市','10.10.10.5','macOS 15.0','Chrome 126','登录成功',8,'1828d8d5-4488-49f4-b43f-9304781c8a67',NULL,'2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,4,NULL,NULL,NULL),(1,'zhao_eng','四川省成都市','10.10.10.6','macOS 15.0','Chrome 126','登录成功',9,'3c84e45e-3e5a-4c09-8828-851ea373388c',NULL,'2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,4,NULL,NULL,NULL),(2,'hr','陕西省西安市','127.0.0.1','Windows 11','Chrome 125','账号已被锁定，请15分钟后重试',10,'b34ac51f-aa04-4a66-b416-ba49116526f6',NULL,'2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),(1,'super','日本东京','203.104.209.5','iOS 18.0','Safari Mobile','登录成功',11,'2b1f8a3e-edc2-477f-b519-43b32fe93ce4',NULL,'2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),(2,'test_user','美国洛杉矶','198.51.100.1','Unknown','Unknown','用户不存在',12,'1f9830bd-f17f-493e-a8eb-c89c5288a152',NULL,'2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL);
/*!40000 ALTER TABLE `sys_login_log` ENABLE KEYS */;

--
-- Table structure for table `sys_notice`
--

DROP TABLE IF EXISTS `sys_notice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_notice` (
  `notice_title` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '公告标题',
  `notice_type` varchar(1) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '公告类型(1通知 2公告)',
  `notice_content` text COLLATE utf8mb4_unicode_ci COMMENT '公告内容',
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `uuid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID全局唯一标识',
  `status` int NOT NULL COMMENT '状态',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '备注/描述',
  `created_time` datetime NOT NULL COMMENT '创建时间',
  `updated_time` datetime NOT NULL COMMENT '更新时间',
  `is_deleted` tinyint(1) NOT NULL COMMENT '是否已删除(0:未删除 1:已删除)',
  `deleted_time` datetime DEFAULT NULL COMMENT '删除时间',
  `tenant_id` int NOT NULL COMMENT '租户ID',
  `created_id` int DEFAULT NULL COMMENT '创建人ID',
  `updated_id` int DEFAULT NULL COMMENT '更新人ID',
  `deleted_id` int DEFAULT NULL COMMENT '删除人ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_sys_notice_uuid` (`uuid`),
  KEY `ix_sys_notice_deleted_id` (`deleted_id`),
  KEY `ix_sys_notice_created_id` (`created_id`),
  KEY `ix_sys_notice_status` (`status`),
  KEY `ix_sys_notice_is_deleted` (`is_deleted`),
  KEY `ix_sys_notice_created_time` (`created_time`),
  KEY `ix_sys_notice_updated_id` (`updated_id`),
  KEY `ix_sys_notice_deleted_time` (`deleted_time`),
  KEY `ix_sys_notice_id` (`id`),
  KEY `ix_sys_notice_updated_time` (`updated_time`),
  KEY `ix_sys_notice_tenant_id` (`tenant_id`),
  CONSTRAINT `sys_notice_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `platform_tenant` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `sys_notice_ibfk_2` FOREIGN KEY (`created_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `sys_notice_ibfk_3` FOREIGN KEY (`updated_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `sys_notice_ibfk_4` FOREIGN KEY (`deleted_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知公告表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_notice`
--

/*!40000 ALTER TABLE `sys_notice` DISABLE KEYS */;
INSERT INTO `sys_notice` VALUES ('系统上线公告','2','<p>欢迎使用 FastApiAdmin 系统！</p><p>这是一个功能强大的权限管理系统，支持多租户、角色权限控制等功能。</p>',1,'3d292e41-aa88-4eae-82be-e38733651e38',0,'系统上线公告','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('系统维护通知','1','<p>系统将于本周六凌晨2:00-4:00进行例行维护，请提前保存工作。</p>',2,'2ddb78ca-aae4-4c5f-b86b-f333df82b76e',0,'系统维护通知','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('新功能发布','2','<p>本次更新新增了工作流引擎、代码生成器等功能，欢迎体验！</p>',3,'1a9bd74d-b085-48fb-8037-334bfa3ad35f',0,'新功能发布','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('安全更新提醒','1','<p>请所有用户尽快更新密码，建议使用至少8位包含大小写字母、数字和特殊字符的强密码。</p><p>更新方法：登录后进入「个人中心」->「修改密码」。</p>',4,'8d7084e2-d333-4472-9740-87014ee18b37',0,'安全更新提醒','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('节假日值班安排','1','<p>春节假期（2月10日-2月17日）期间系统值班安排如下：</p><p>联系电话：138-0000-0000</p><p>紧急问题请直接联系值班人员。</p>',5,'f3963141-c19a-4856-8af0-e08296ae441a',0,'节假日值班通知','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('v2.0 版本升级公告','2','<p>v2.0 大版本即将发布，主要更新：</p><ul><li>全新工作流引擎</li><li>AI助手集成</li><li>代码生成器增强</li><li>性能优化 30%</li></ul><p>升级时间另行通知。</p>',6,'5155714b-2f0b-49ac-9114-a072ee948c1e',0,'v2.0 版本升级公告','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL);
/*!40000 ALTER TABLE `sys_notice` ENABLE KEYS */;

--
-- Table structure for table `sys_notice_read`
--

DROP TABLE IF EXISTS `sys_notice_read`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_notice_read` (
  `user_id` int NOT NULL COMMENT '用户ID',
  `notice_id` int NOT NULL COMMENT '通知ID',
  `read_time` datetime NOT NULL COMMENT '已读时间',
  PRIMARY KEY (`user_id`,`notice_id`),
  UNIQUE KEY `uq_user_notice_read` (`user_id`,`notice_id`),
  KEY `notice_id` (`notice_id`),
  CONSTRAINT `sys_notice_read_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sys_notice_read_ibfk_2` FOREIGN KEY (`notice_id`) REFERENCES `sys_notice` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知已读记录表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_notice_read`
--

/*!40000 ALTER TABLE `sys_notice_read` DISABLE KEYS */;
INSERT INTO `sys_notice_read` VALUES (1,1,'2025-06-01 09:15:00'),(1,2,'2025-06-10 08:30:00'),(1,3,'2025-07-01 10:00:00'),(2,1,'2025-06-01 09:20:00'),(2,2,'2025-06-10 09:00:00'),(3,1,'2025-06-01 10:30:00'),(4,1,'2025-06-02 14:00:00'),(5,1,'2025-06-03 11:00:00'),(6,6,'2025-06-20 10:00:00'),(8,2,'2025-06-10 16:00:00');
/*!40000 ALTER TABLE `sys_notice_read` ENABLE KEYS */;

--
-- Table structure for table `sys_operation_log`
--

DROP TABLE IF EXISTS `sys_operation_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_operation_log` (
  `request_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '请求路径',
  `request_method` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '请求方式',
  `request_payload` longtext COLLATE utf8mb4_unicode_ci COMMENT '请求体',
  `response_code` int NOT NULL COMMENT '响应状态码',
  `response_json` longtext COLLATE utf8mb4_unicode_ci COMMENT '响应体',
  `process_time` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '处理时间',
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `uuid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID全局唯一标识',
  `status` int NOT NULL COMMENT '状态',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '备注/描述',
  `created_time` datetime NOT NULL COMMENT '创建时间',
  `updated_time` datetime NOT NULL COMMENT '更新时间',
  `is_deleted` tinyint(1) NOT NULL COMMENT '是否已删除(0:未删除 1:已删除)',
  `deleted_time` datetime DEFAULT NULL COMMENT '删除时间',
  `tenant_id` int NOT NULL COMMENT '租户ID',
  `created_id` int DEFAULT NULL COMMENT '创建人ID',
  `updated_id` int DEFAULT NULL COMMENT '更新人ID',
  `deleted_id` int DEFAULT NULL COMMENT '删除人ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_sys_operation_log_uuid` (`uuid`),
  KEY `ix_sys_operation_log_updated_time` (`updated_time`),
  KEY `ix_sys_operation_log_updated_id` (`updated_id`),
  KEY `ix_sys_operation_log_deleted_time` (`deleted_time`),
  KEY `ix_sys_operation_log_status` (`status`),
  KEY `ix_sys_operation_log_created_time` (`created_time`),
  KEY `ix_sys_operation_log_id` (`id`),
  KEY `ix_sys_operation_log_tenant_id` (`tenant_id`),
  KEY `ix_sys_operation_log_deleted_id` (`deleted_id`),
  KEY `ix_sys_operation_log_created_id` (`created_id`),
  KEY `ix_sys_operation_log_is_deleted` (`is_deleted`),
  CONSTRAINT `sys_operation_log_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `platform_tenant` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `sys_operation_log_ibfk_2` FOREIGN KEY (`created_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `sys_operation_log_ibfk_3` FOREIGN KEY (`updated_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `sys_operation_log_ibfk_4` FOREIGN KEY (`deleted_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_operation_log`
--

/*!40000 ALTER TABLE `sys_operation_log` DISABLE KEYS */;
INSERT INTO `sys_operation_log` VALUES ('/api/v1/system/auth/login','POST','{\"username\": \"super\", \"password\": \"***\"}',200,'{\"code\": 200, \"msg\": \"登录成功\"}','45ms',1,'d09b4a31-533b-4772-ac92-3c00798f6f98',0,'用户登录','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('/api/v1/system/user/current/info','GET',NULL,200,'{\"code\": 200, \"data\": {\"username\": \"super\"}}','12ms',2,'87882b51-0402-4744-8f06-48954ab86b78',0,'获取当前用户信息','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('/api/v1/platform/menu/create','POST','{\"name\": \"测试菜单\", \"type\": 2, \"parent_id\": 1}',200,'{\"code\": 200, \"msg\": \"创建成功\"}','23ms',3,'6584dfd7-394f-4e18-b127-9083cea0b6fc',0,'创建菜单','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('/api/v1/system/user/update/3','PUT','{\"name\": \"普通用户\", \"status\": 0}',200,'{\"code\": 200, \"msg\": \"更新成功\"}','18ms',4,'79a5fc9b-0fb4-4f48-93fc-f06619245ea8',0,'更新用户信息','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('/api/v1/system/dept/create','POST','{\"name\": \"测试部门\", \"parent_id\": 1}',400,'{\"code\": 400, \"msg\": \"部门编码已存在\"}','8ms',5,'6039e4b3-93b6-47e7-a6a1-75bb3d449460',0,'创建部门（失败）','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('/api/v1/system/role/delete','DELETE','{\"ids\": [5]}',200,'{\"code\": 200, \"msg\": \"删除成功\"}','15ms',6,'4670f2df-1bdc-4706-9247-be5fde027cc5',0,'删除角色','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('/api/v1/platform/menu/list','GET',NULL,200,'{\"code\": 200, \"data\": {\"items\": [...]}}','35ms',7,'d0997b66-dec8-445a-af97-f0e2232b8998',0,'查询菜单列表','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,3,NULL,NULL,NULL),('/api/v1/system/dict/data/list','GET',NULL,200,'{\"code\": 200, \"data\": {\"items\": [...]}}','22ms',8,'31802897-812e-4fe3-8ca3-c0fc0b60cb7d',0,'查询字典数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,3,NULL,NULL,NULL),('/api/v1/workflow/definition/create','POST','{\"name\": \"审批流程\", \"code\": \"approval_v1\"}',200,'{\"code\": 200, \"msg\": \"创建成功\"}','28ms',9,'d5f63d06-acc8-46bc-897f-2ac5fb66b0e1',0,'创建工作流','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,4,NULL,NULL,NULL),('/api/v1/system/notice/create','POST','{\"notice_title\": \"测试通知\", \"notice_type\": \"1\"}',200,'{\"code\": 200, \"msg\": \"创建成功\"}','11ms',10,'c358bad3-53f0-4716-b1ab-b594eff4ef71',0,'创建通知','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('/api/v1/system/user/export','POST','{\"status\": 0}',200,'{\"file\": \"用户列表_20250601.xlsx\"}','156ms',11,'c37c9a0f-5065-4140-bfaa-6c4ce146eba7',0,'导出用户数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('/api/v1/system/user/import','POST','\"file\": \"users.xlsx\" (multipart/form-data)',200,'{\"code\": 200, \"msg\": \"成功导入 25 条数据\"}','320ms',12,'640d1a3a-b127-4cb3-8312-917216db146b',0,'批量导入用户','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('/api/v1/cronjob/node/execute/1','POST','{\"trigger\": \"now\"}',200,'{\"code\": 200, \"msg\": \"调试节点成功\"}','1024ms',13,'4de5a9d5-0cd0-4d22-8975-296fae745466',0,'执行定时任务节点','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('/api/v1/workflow/definition/execute','POST','{\"workflow_id\": 1, \"variables\": {}}',200,'{\"code\": 200, \"data\": {\"status\": \"completed\"}}','3200ms',14,'0b1b11eb-eaf1-481a-a09f-c1a756a40dc1',0,'执行工作流','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,4,NULL,NULL,NULL),('/api/v1/cronjob/job/log/delete','DELETE','{\"ids\": [1, 2, 3]}',200,'{\"code\": 200, \"msg\": \"删除成功\"}','19ms',15,'67dcc879-f91b-4e8e-b472-63fdbed53c2a',0,'批量删除执行日志','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL);
/*!40000 ALTER TABLE `sys_operation_log` ENABLE KEYS */;

--
-- Table structure for table `sys_param`
--

DROP TABLE IF EXISTS `sys_param`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_param` (
  `config_name` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '参数名称',
  `config_key` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '参数键名',
  `config_value` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '参数键值',
  `config_type` tinyint(1) DEFAULT NULL COMMENT '系统内置(True:是 False:否)',
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `uuid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID全局唯一标识',
  `status` int NOT NULL COMMENT '状态',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '备注/描述',
  `created_time` datetime NOT NULL COMMENT '创建时间',
  `updated_time` datetime NOT NULL COMMENT '更新时间',
  `is_deleted` tinyint(1) NOT NULL COMMENT '是否已删除(0:未删除 1:已删除)',
  `deleted_time` datetime DEFAULT NULL COMMENT '删除时间',
  `tenant_id` int NOT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_sys_param_uuid` (`uuid`),
  KEY `ix_sys_param_is_deleted` (`is_deleted`),
  KEY `ix_sys_param_status` (`status`),
  KEY `ix_sys_param_id` (`id`),
  KEY `ix_sys_param_created_time` (`created_time`),
  KEY `ix_sys_param_deleted_time` (`deleted_time`),
  KEY `ix_sys_param_tenant_id` (`tenant_id`),
  KEY `ix_sys_param_updated_time` (`updated_time`),
  CONSTRAINT `sys_param_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `platform_tenant` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统参数表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_param`
--

/*!40000 ALTER TABLE `sys_param` DISABLE KEYS */;
INSERT INTO `sys_param` VALUES ('演示模式启用','demo_enable','false',1,1,'70aa8e1b-c363-4ef6-8fd3-3d72ffb13000',0,'是否启用演示模式','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('演示访问IP白名单','ip_white_list','[\"127.0.0.1\", \"::1\"]',1,2,'efcb680f-d0d7-4298-bef5-5602496e3d75',0,'演示模式下允许访问的IP列表','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('接口白名单','white_api_list_path','[\"/api/v1/system/auth/login\", \"/api/v1/system/auth/token/refresh\", \"/api/v1/system/auth/captcha/get\", \"/api/v1/system/auth/logout\", \"/api/v1/system/config/info\", \"/api/v1/system/user/current/info\", \"/api/v1/system/notice/available\", \"/api/v1/system/auth/auto-login/users\", \"/api/v1/system/auth/auto-login/token\", \"/api/v1/system/auth/auto-login\", \"/common/health\", \"/common/health/ready\", \"/common/health/live\", \"/metrics\"]',1,3,'ed8248c6-5aa9-4a5d-995d-aeb920ca5c3c',0,'无需登录即可访问的接口列表','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('访问IP黑名单','ip_black_list','[]',1,4,'26c4b6a1-1250-4444-a5ca-bb96621bb8bb',0,'禁止访问的IP列表','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('登录失败次数限制','login_failed_limit','5',1,5,'6765a5c9-8714-42b0-9957-12d437189a0a',0,'登录失败最大次数','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('登录锁定时间(分钟)','login_lock_time','15',1,6,'0e8bd4a1-1ce2-488b-b624-d7c426ce3e30',0,'登录失败后锁定时间','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('Token过期时间(分钟)','token_expire_minutes','120',1,7,'fa532946-ddd1-4f89-81bb-bfd1a70c7b13',0,'Access Token过期时间','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('Refresh Token过期时间(天)','refresh_token_expire_days','7',1,8,'8a447af9-70d7-4904-8068-77e060136bf3',0,'Refresh Token过期时间','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('密码有效期(天)','password_expire_days','90',1,9,'24222cbe-53c0-4aff-a11a-8a49c2e96f1a',0,'密码有效期','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('密码最小长度','password_min_length','6',1,10,'3935853a-b780-4e7a-8970-ab7846e62fe8',0,'密码最小长度','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('是否启用验证码','captcha_enable','true',1,11,'046069fb-0d19-47b2-bf79-90d82c66e4cb',0,'登录时是否启用验证码','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('是否记录操作日志','operation_log_enable','true',1,12,'903f69bc-8efc-43bf-baae-033c7e28900b',0,'是否记录用户操作日志','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('操作日志保留天数','operation_log_retention_days','90',1,13,'0759f8e0-f436-419d-a216-0cdfb74bb844',0,'操作日志保留天数','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('登录日志保留天数','login_log_retention_days','30',1,14,'76b7b7a5-dfe6-4752-a4cb-df215981dc14',0,'登录日志保留天数','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('文件上传大小限制(MB)','file_upload_max_size','50',1,15,'859cac7f-9795-4962-9327-359388e392ea',0,'单个文件上传最大大小','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('是否启用IP归属地查询','ip_location_enable','false',1,16,'906de136-c53c-46f9-b3fe-91ac7b312db2',0,'登录时是否查询IP归属地','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('调度器状态','scheduler_status','stopped',1,17,'2f9c3a52-e431-4064-9d85-82a8edd41260',0,NULL,'2026-06-17 00:17:13','2026-06-17 00:17:13',0,NULL,1);
/*!40000 ALTER TABLE `sys_param` ENABLE KEYS */;

--
-- Table structure for table `sys_position`
--

DROP TABLE IF EXISTS `sys_position`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_position` (
  `name` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '岗位名称',
  `code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '岗位编码',
  `order` int NOT NULL COMMENT '显示排序',
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `uuid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID全局唯一标识',
  `status` int NOT NULL COMMENT '状态',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '备注/描述',
  `created_time` datetime NOT NULL COMMENT '创建时间',
  `updated_time` datetime NOT NULL COMMENT '更新时间',
  `is_deleted` tinyint(1) NOT NULL COMMENT '是否已删除(0:未删除 1:已删除)',
  `deleted_time` datetime DEFAULT NULL COMMENT '删除时间',
  `tenant_id` int NOT NULL COMMENT '租户ID',
  `created_id` int DEFAULT NULL COMMENT '创建人ID',
  `updated_id` int DEFAULT NULL COMMENT '更新人ID',
  `deleted_id` int DEFAULT NULL COMMENT '删除人ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_sys_position_uuid` (`uuid`),
  KEY `ix_sys_position_deleted_time` (`deleted_time`),
  KEY `ix_sys_position_tenant_id` (`tenant_id`),
  KEY `ix_sys_position_deleted_id` (`deleted_id`),
  KEY `ix_sys_position_created_id` (`created_id`),
  KEY `ix_sys_position_updated_time` (`updated_time`),
  KEY `ix_sys_position_id` (`id`),
  KEY `ix_sys_position_is_deleted` (`is_deleted`),
  KEY `ix_sys_position_status` (`status`),
  KEY `ix_sys_position_updated_id` (`updated_id`),
  KEY `ix_sys_position_created_time` (`created_time`),
  CONSTRAINT `sys_position_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `platform_tenant` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `sys_position_ibfk_2` FOREIGN KEY (`created_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `sys_position_ibfk_3` FOREIGN KEY (`updated_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `sys_position_ibfk_4` FOREIGN KEY (`deleted_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='岗位表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_position`
--

/*!40000 ALTER TABLE `sys_position` DISABLE KEYS */;
INSERT INTO `sys_position` VALUES ('技术总监','TECH_DIRECTOR',1,1,'09283948-9293-4edd-9078-e8adbe19c52e',0,'技术部门负责人','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('高级工程师','SR_ENGINEER',2,2,'41862cc9-e667-46f8-971c-4b3476464722',0,'高级技术岗位','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('工程师','ENGINEER',3,3,'a8dcd48a-1c20-4881-8a6b-86872c05cb52',0,'技术岗位','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('产品经理','PRODUCT_MANAGER',4,4,'bed30d3a-aa14-4e40-8d45-9a48f3f0dfec',0,'产品管理岗位','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('运营专员','OPERATOR',5,5,'7cdbcc8f-7fef-44b9-b7ac-85505aae1a47',0,'运营岗位','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('HR专员','HR_STAFF',6,6,'8191da67-7051-46b5-b3be-5af81f808fbe',0,'人事专员','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL);
/*!40000 ALTER TABLE `sys_position` ENABLE KEYS */;

--
-- Table structure for table `sys_role`
--

DROP TABLE IF EXISTS `sys_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_role` (
  `name` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '角色名称',
  `code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '角色编码',
  `order` int NOT NULL COMMENT '显示排序',
  `data_scope` int NOT NULL COMMENT '数据权限范围(1:仅本人 2:本部门 3:本部门及以下 4:全部 5:自定义)',
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `uuid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID全局唯一标识',
  `status` int NOT NULL COMMENT '状态',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '备注/描述',
  `created_time` datetime NOT NULL COMMENT '创建时间',
  `updated_time` datetime NOT NULL COMMENT '更新时间',
  `is_deleted` tinyint(1) NOT NULL COMMENT '是否已删除(0:未删除 1:已删除)',
  `deleted_time` datetime DEFAULT NULL COMMENT '删除时间',
  `tenant_id` int NOT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `tenant_id` (`tenant_id`,`code`),
  UNIQUE KEY `ix_sys_role_uuid` (`uuid`),
  KEY `ix_sys_role_tenant_id` (`tenant_id`),
  KEY `ix_sys_role_id` (`id`),
  KEY `ix_sys_role_updated_time` (`updated_time`),
  KEY `ix_sys_role_is_deleted` (`is_deleted`),
  KEY `ix_sys_role_created_time` (`created_time`),
  KEY `ix_sys_role_status` (`status`),
  KEY `ix_sys_role_deleted_time` (`deleted_time`),
  CONSTRAINT `sys_role_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `platform_tenant` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_role`
--

/*!40000 ALTER TABLE `sys_role` DISABLE KEYS */;
INSERT INTO `sys_role` VALUES ('超级管理员','SUPER_ADMIN',1,4,1,'822edc0e-0a53-44ab-906d-84de65fdffb2',0,'拥有系统最高权限','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('管理员','ADMIN',2,3,2,'ef25e5a0-2457-46f5-b244-941552df6845',0,'管理租户内所有资源','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('普通用户','USER',3,1,3,'48d54c7a-61d8-42df-b1ea-3340cd2cb97b',0,'仅能查看和操作自己的数据','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('星辰管理员','STAR_ADMIN',1,4,4,'d445f633-ae72-488c-9b37-a28501171924',0,'星辰科技有限公司管理员','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,3),('星辰员工','STAR_STAFF',2,2,5,'1c9bb9b2-fa11-448a-a186-9174721bf709',0,'星辰科技有限公司普通员工','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,3),('创新管理员','INNO_ADMIN',1,4,6,'b8937c15-abd5-458c-8a6b-3080b3287aa7',0,'创新工坊管理员','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,4),('创新员工','INNO_STAFF',2,2,7,'f542386a-59f2-4384-9997-4117ed90e5c1',0,'创新工坊普通员工','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,4);
/*!40000 ALTER TABLE `sys_role` ENABLE KEYS */;

--
-- Table structure for table `sys_role_depts`
--

DROP TABLE IF EXISTS `sys_role_depts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_role_depts` (
  `role_id` int NOT NULL COMMENT '角色ID',
  `dept_id` int NOT NULL COMMENT '部门ID',
  PRIMARY KEY (`role_id`,`dept_id`),
  KEY `dept_id` (`dept_id`),
  CONSTRAINT `sys_role_depts_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `sys_role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `sys_role_depts_ibfk_2` FOREIGN KEY (`dept_id`) REFERENCES `sys_dept` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色部门关联表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_role_depts`
--

/*!40000 ALTER TABLE `sys_role_depts` DISABLE KEYS */;
/*!40000 ALTER TABLE `sys_role_depts` ENABLE KEYS */;

--
-- Table structure for table `sys_role_menus`
--

DROP TABLE IF EXISTS `sys_role_menus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_role_menus` (
  `role_id` int NOT NULL COMMENT '角色ID',
  `menu_id` int NOT NULL COMMENT '菜单ID',
  PRIMARY KEY (`role_id`,`menu_id`),
  KEY `menu_id` (`menu_id`),
  CONSTRAINT `sys_role_menus_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `sys_role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `sys_role_menus_ibfk_2` FOREIGN KEY (`menu_id`) REFERENCES `platform_menu` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色菜单关联表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_role_menus`
--

/*!40000 ALTER TABLE `sys_role_menus` DISABLE KEYS */;
/*!40000 ALTER TABLE `sys_role_menus` ENABLE KEYS */;

--
-- Table structure for table `sys_ticket`
--

DROP TABLE IF EXISTS `sys_ticket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_ticket` (
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '工单标题',
  `ticket_content` text COLLATE utf8mb4_unicode_ci COMMENT '工单内容（富文本）',
  `summary` text COLLATE utf8mb4_unicode_ci COMMENT '工单内容（纯文本摘要）',
  `ticket_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '工单类型(suggestion:建议 bug:缺陷 optimize:优化 other:其他)',
  `images` text COLLATE utf8mb4_unicode_ci COMMENT '图片URL列表(JSON数组)',
  `reply` text COLLATE utf8mb4_unicode_ci COMMENT '回复内容',
  `assigned_id` int DEFAULT NULL COMMENT '处理人ID',
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `uuid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID全局唯一标识',
  `status` int NOT NULL COMMENT '状态',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '备注/描述',
  `created_time` datetime NOT NULL COMMENT '创建时间',
  `updated_time` datetime NOT NULL COMMENT '更新时间',
  `is_deleted` tinyint(1) NOT NULL COMMENT '是否已删除(0:未删除 1:已删除)',
  `deleted_time` datetime DEFAULT NULL COMMENT '删除时间',
  `tenant_id` int NOT NULL COMMENT '租户ID',
  `created_id` int DEFAULT NULL COMMENT '创建人ID',
  `updated_id` int DEFAULT NULL COMMENT '更新人ID',
  `deleted_id` int DEFAULT NULL COMMENT '删除人ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_sys_ticket_uuid` (`uuid`),
  KEY `ix_sys_ticket_is_deleted` (`is_deleted`),
  KEY `ix_sys_ticket_status` (`status`),
  KEY `ix_sys_ticket_updated_id` (`updated_id`),
  KEY `ix_sys_ticket_created_time` (`created_time`),
  KEY `ix_sys_ticket_deleted_time` (`deleted_time`),
  KEY `ix_sys_ticket_id` (`id`),
  KEY `ix_sys_ticket_tenant_id` (`tenant_id`),
  KEY `ix_sys_ticket_deleted_id` (`deleted_id`),
  KEY `ix_sys_ticket_created_id` (`created_id`),
  KEY `ix_sys_ticket_updated_time` (`updated_time`),
  KEY `ix_sys_ticket_assigned_id` (`assigned_id`),
  CONSTRAINT `sys_ticket_ibfk_1` FOREIGN KEY (`assigned_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `sys_ticket_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `platform_tenant` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `sys_ticket_ibfk_3` FOREIGN KEY (`created_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `sys_ticket_ibfk_4` FOREIGN KEY (`updated_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `sys_ticket_ibfk_5` FOREIGN KEY (`deleted_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工单表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_ticket`
--

/*!40000 ALTER TABLE `sys_ticket` DISABLE KEYS */;
INSERT INTO `sys_ticket` VALUES ('系统登录页面优化建议','<p>建议在登录页面增加记住密码功能和第三方登录入口，提升用户体验。</p>','建议在登录页面增加记住密码功能和第三方登录入口','suggestion',NULL,'感谢您的建议，我们将在下个版本中加入记住密码功能。',2,1,'497e0c01-0af8-4b4e-ac4a-d5d268513309',2,'用户体验优化','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('表格导出功能异常','<p>当数据量超过1000条时，导出Excel功能会超时失败。</p>','数据量超过1000条导出Excel超时','bug',NULL,NULL,3,2,'ea47b64c-a87f-400a-85b4-72abdd4607b8',1,'导出功能问题','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('希望增加批量删除功能','<p>用户管理页面希望支持批量选择删除，提高管理效率。</p>','用户管理页面希望支持批量选择删除','optimize',NULL,NULL,NULL,3,'177e8dc3-d19f-40b0-8166-20d02d05cd71',0,'功能优化建议','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('手机端适配问题反馈','<p>在iPhone Safari浏览器上，菜单栏折叠后无法展开，需要刷新页面才能恢复。</p>','iPhone Safari菜单折叠后无法展开','bug','[\"https://example.com/screenshot1.png\"]',NULL,4,4,'60156135-0ea1-4c9b-b2ab-ad01779fe437',1,'移动端兼容性问题','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('增加数据权限粒度','<p>当前数据权限只能控制到部门级别，希望能支持自定义数据范围，如只查看本人创建的数据、指定项目范围等。</p>','数据权限需要支持自定义范围','optimize',NULL,'已纳入Q3规划，感谢反馈。',2,5,'533b57d6-ae75-4c40-b967-a17761be4108',2,'数据权限增强','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('工作流审批节点无法修改','<p>已发布的工作流无法修改审批节点配置，需要先取消发布才能修改，操作繁琐。</p>','已发布工作流无法直接修改节点','bug',NULL,NULL,NULL,6,'d2bc7200-ba5b-4437-9998-0ad3c91abe39',0,'星辰科技反馈工作流问题','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,3,NULL,NULL,NULL),('希望增加钉钉集成','<p>团队使用钉钉进行日常协作，希望能将通知和待办事项同步到钉钉工作台。</p>','希望支持钉钉消息集成','suggestion',NULL,'我们会评估第三方集成的优先级。',NULL,7,'f3265177-de89-42a9-ba48-f2a2d48a659e',3,'创新工坊第三方集成需求','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,4,NULL,NULL,NULL),('其他-文档链接失效','<p>帮助文档中的API接口说明链接跳转404，影响开发对接。</p>','帮助文档API链接404','other',NULL,NULL,3,8,'aee461f3-856e-4b6e-a540-5a640ea86431',0,'文档链接问题','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL);
/*!40000 ALTER TABLE `sys_ticket` ENABLE KEYS */;

--
-- Table structure for table `sys_user`
--

DROP TABLE IF EXISTS `sys_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_user` (
  `username` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户名/登录账号',
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码哈希',
  `name` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '昵称',
  `mobile` varchar(11) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '手机号',
  `email` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '邮箱',
  `gender` varchar(1) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '性别(0:男 1:女 2:未知)',
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '头像URL地址',
  `is_superuser` tinyint(1) NOT NULL COMMENT '是否超管',
  `last_login` datetime DEFAULT NULL COMMENT '最后登录时间',
  `gitee_login` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Gitee登录',
  `github_login` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Github登录',
  `wx_login` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '微信登录',
  `qq_login` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'QQ登录',
  `dept_id` int DEFAULT NULL COMMENT '部门ID',
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `uuid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID全局唯一标识',
  `status` int NOT NULL COMMENT '状态',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '备注/描述',
  `created_time` datetime NOT NULL COMMENT '创建时间',
  `updated_time` datetime NOT NULL COMMENT '更新时间',
  `is_deleted` tinyint(1) NOT NULL COMMENT '是否已删除(0:未删除 1:已删除)',
  `deleted_time` datetime DEFAULT NULL COMMENT '删除时间',
  `tenant_id` int NOT NULL COMMENT '租户ID',
  `created_id` int DEFAULT NULL COMMENT '创建人ID',
  `updated_id` int DEFAULT NULL COMMENT '更新人ID',
  `deleted_id` int DEFAULT NULL COMMENT '删除人ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `tenant_id` (`tenant_id`,`username`),
  UNIQUE KEY `ix_sys_user_uuid` (`uuid`),
  KEY `ix_sys_user_id` (`id`),
  KEY `ix_sys_user_tenant_id` (`tenant_id`),
  KEY `ix_sys_user_deleted_id` (`deleted_id`),
  KEY `ix_sys_user_created_id` (`created_id`),
  KEY `ix_sys_user_updated_time` (`updated_time`),
  KEY `ix_sys_user_dept_id` (`dept_id`),
  KEY `ix_sys_user_is_deleted` (`is_deleted`),
  KEY `ix_sys_user_status` (`status`),
  KEY `ix_sys_user_updated_id` (`updated_id`),
  KEY `ix_sys_user_created_time` (`created_time`),
  KEY `ix_sys_user_deleted_time` (`deleted_time`),
  CONSTRAINT `sys_user_ibfk_1` FOREIGN KEY (`dept_id`) REFERENCES `sys_dept` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `sys_user_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `platform_tenant` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `sys_user_ibfk_3` FOREIGN KEY (`created_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `sys_user_ibfk_4` FOREIGN KEY (`updated_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `sys_user_ibfk_5` FOREIGN KEY (`deleted_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_user`
--

/*!40000 ALTER TABLE `sys_user` DISABLE KEYS */;
INSERT INTO `sys_user` VALUES ('super','$2b$12$e2IJgS/cvHgJ0H3G7Xa08OXoXnk6N/NX3IZRtubBDElA0VLZhkNOa','超级管理员','13800138000','super@example.com','0','https://service.fastapiadmin.com/api/v1/static/image/avatar.png',1,NULL,NULL,NULL,NULL,NULL,1,1,'5c75f9d2-766d-403f-962b-8ca40c2dcf68',0,'系统超级管理员','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('admin','$2b$12$e2IJgS/cvHgJ0H3G7Xa08OXoXnk6N/NX3IZRtubBDElA0VLZhkNOa','管理员','13800138001','admin@example.com','0','https://service.fastapiadmin.com/api/v1/static/image/avatar.png',1,NULL,NULL,NULL,NULL,NULL,2,2,'b334c5cd-a728-4008-bd60-2c108e81f258',0,'技术部门管理员','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,1,NULL,NULL),('user','$2b$12$e2IJgS/cvHgJ0H3G7Xa08OXoXnk6N/NX3IZRtubBDElA0VLZhkNOa','普通用户','13800138002','user@example.com','0','https://service.fastapiadmin.com/api/v1/static/image/avatar.png',0,NULL,NULL,NULL,NULL,NULL,3,3,'69514315-6ead-4525-bea9-c70f7b64d54a',0,'后端开发工程师','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,1,NULL,NULL),('product','$2b$12$e2IJgS/cvHgJ0H3G7Xa08OXoXnk6N/NX3IZRtubBDElA0VLZhkNOa','产品经理','13800138003','product@example.com','1','https://service.fastapiadmin.com/api/v1/static/image/avatar.png',0,NULL,NULL,NULL,NULL,NULL,5,4,'bedf65c2-4ab0-4696-b800-7d155a94e579',0,'产品经理','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,1,NULL,NULL),('hr','$2b$12$e2IJgS/cvHgJ0H3G7Xa08OXoXnk6N/NX3IZRtubBDElA0VLZhkNOa','HR专员','13800138004','hr@example.com','1','https://service.fastapiadmin.com/api/v1/static/image/avatar.png',0,NULL,NULL,NULL,NULL,NULL,6,5,'1562dd96-3d07-4e2d-ae82-db99af3f9d27',0,'人力资源专员','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,1,NULL,NULL),('zhang_admin','$2b$12$rej/LQJMp5Zujt2YglsaCulQ4wNzYlPupSG0glJPYGzt.nSMV5QDe','张明','13800001001','zhang@star-tech.dev','2',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,6,'44497717-18b4-4ffd-8ab9-8a474026d4a3',0,'星辰科技管理员','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,3,NULL,NULL,NULL),('wang_dev','$2b$12$rej/LQJMp5Zujt2YglsaCulQ4wNzYlPupSG0glJPYGzt.nSMV5QDe','王华','13800001002','wang@star-tech.dev','2',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,7,'2f8403d2-81c8-495a-9ab9-9fb59ed26be7',0,'星辰科技研发工程师','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,3,NULL,NULL,NULL),('li_admin','$2b$12$rej/LQJMp5Zujt2YglsaCulQ4wNzYlPupSG0glJPYGzt.nSMV5QDe','李芳','13800002001','li@inno.work','2',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,8,'13f5eca9-52e7-4b4b-b6cb-461ba21b52fe',0,'创新工坊创始人','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,4,NULL,NULL,NULL),('zhao_eng','$2b$12$rej/LQJMp5Zujt2YglsaCulQ4wNzYlPupSG0glJPYGzt.nSMV5QDe','赵强','13800002002','zhao@inno.work','2',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,9,'8847d8a1-48b9-43f8-ba9c-2cc59165fc00',0,'创新工坊技术合伙人','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,4,NULL,NULL,NULL);
/*!40000 ALTER TABLE `sys_user` ENABLE KEYS */;

--
-- Table structure for table `sys_user_positions`
--

DROP TABLE IF EXISTS `sys_user_positions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_user_positions` (
  `user_id` int NOT NULL COMMENT '用户ID',
  `position_id` int NOT NULL COMMENT '岗位ID',
  PRIMARY KEY (`user_id`,`position_id`),
  KEY `position_id` (`position_id`),
  CONSTRAINT `sys_user_positions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `sys_user_positions_ibfk_2` FOREIGN KEY (`position_id`) REFERENCES `sys_position` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户岗位关联表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_user_positions`
--

/*!40000 ALTER TABLE `sys_user_positions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sys_user_positions` ENABLE KEYS */;

--
-- Table structure for table `sys_user_roles`
--

DROP TABLE IF EXISTS `sys_user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_user_roles` (
  `user_id` int NOT NULL COMMENT '用户ID',
  `role_id` int NOT NULL COMMENT '角色ID',
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `sys_user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `sys_user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `sys_role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色关联表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_user_roles`
--

/*!40000 ALTER TABLE `sys_user_roles` DISABLE KEYS */;
INSERT INTO `sys_user_roles` VALUES (1,1),(2,2),(3,3),(4,3),(5,3),(6,4),(7,5),(8,6),(9,7);
/*!40000 ALTER TABLE `sys_user_roles` ENABLE KEYS */;

--
-- Table structure for table `task_job`
--

DROP TABLE IF EXISTS `task_job`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_job` (
  `job_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '任务ID',
  `job_name` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '任务名称',
  `trigger_type` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '触发方式: cron/interval/date/manual',
  `status` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '执行状态',
  `next_run_time` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '下次执行时间',
  `job_state` text COLLATE utf8mb4_unicode_ci COMMENT '任务状态信息',
  `result` text COLLATE utf8mb4_unicode_ci COMMENT '执行结果',
  `error` text COLLATE utf8mb4_unicode_ci COMMENT '错误信息',
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `uuid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID全局唯一标识',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '备注/描述',
  `created_time` datetime NOT NULL COMMENT '创建时间',
  `updated_time` datetime NOT NULL COMMENT '更新时间',
  `is_deleted` tinyint(1) NOT NULL COMMENT '是否已删除(0:未删除 1:已删除)',
  `deleted_time` datetime DEFAULT NULL COMMENT '删除时间',
  `tenant_id` int NOT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_task_job_uuid` (`uuid`),
  KEY `ix_task_job_updated_time` (`updated_time`),
  KEY `ix_task_job_is_deleted` (`is_deleted`),
  KEY `ix_task_job_created_time` (`created_time`),
  KEY `ix_task_job_deleted_time` (`deleted_time`),
  KEY `ix_task_job_job_id` (`job_id`),
  KEY `ix_task_job_tenant_id` (`tenant_id`),
  KEY `ix_task_job_id` (`id`),
  CONSTRAINT `task_job_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `platform_tenant` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务执行日志表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_job`
--

/*!40000 ALTER TABLE `task_job` DISABLE KEYS */;
INSERT INTO `task_job` VALUES ('system_tenant_expiry_check','租户到期检查','interval','pending','2026-06-17 01:17:10.389968+08:00','{\n  \"version\": 1,\n  \"id\": \"system_tenant_expiry_check\",\n  \"func\": \"app.api.v1.module_platform.tenant.service:TenantService.check_tenant_expiry\",\n  \"trigger\": \"interval[1:00:00]\",\n  \"executor\": \"default\",\n  \"args\": [],\n  \"kwargs\": {},\n  \"name\": \"租户到期检查\",\n  \"misfire_grace_time\": 1,\n  \"coalesce\": true,\n  \"max_instances\": 5,\n  \"next_run_time\": \"2026-06-17 01:17:10.389968+08:00\"\n}',NULL,NULL,1,'a31d2255-9838-4d36-832c-470b540b9a26',NULL,'2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('system_grace_reminder','宽限期续费提醒','cron','pending','2026-06-17 09:00:00+08:00','{\n  \"version\": 1,\n  \"id\": \"system_grace_reminder\",\n  \"func\": \"app.api.v1.module_platform.tenant.service:TenantService.send_grace_reminders\",\n  \"trigger\": \"cron[hour=\'9\', minute=\'0\']\",\n  \"executor\": \"default\",\n  \"args\": [],\n  \"kwargs\": {},\n  \"name\": \"宽限期续费提醒\",\n  \"misfire_grace_time\": 1,\n  \"coalesce\": true,\n  \"max_instances\": 5,\n  \"next_run_time\": \"2026-06-17 09:00:00+08:00\"\n}',NULL,NULL,2,'9183c8ce-c7b9-4b02-96b0-b54ff44e707f',NULL,'2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('system_clean_expired','过期租户归档清理','cron','pending','2026-07-01 02:00:00+08:00','{\n  \"version\": 1,\n  \"id\": \"system_clean_expired\",\n  \"func\": \"app.api.v1.module_platform.tenant.service:TenantService.clean_expired_tenants\",\n  \"trigger\": \"cron[day=\'1\', hour=\'2\', minute=\'0\']\",\n  \"executor\": \"default\",\n  \"args\": [],\n  \"kwargs\": {},\n  \"name\": \"过期租户归档清理\",\n  \"misfire_grace_time\": 1,\n  \"coalesce\": true,\n  \"max_instances\": 5,\n  \"next_run_time\": \"2026-07-01 02:00:00+08:00\"\n}',NULL,NULL,3,'c428c9cf-39a7-4154-9ae3-9df37146667b',NULL,'2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('system_cancel_expired_orders','超时订单取消','interval','pending','2026-06-17 00:22:10.411515+08:00','{\n  \"version\": 1,\n  \"id\": \"system_cancel_expired_orders\",\n  \"func\": \"app.api.v1.module_platform.order.service:OrderService.cancel_expired_orders\",\n  \"trigger\": \"interval[0:05:00]\",\n  \"executor\": \"default\",\n  \"args\": [],\n  \"kwargs\": {},\n  \"name\": \"超时订单取消\",\n  \"misfire_grace_time\": 1,\n  \"coalesce\": true,\n  \"max_instances\": 5,\n  \"next_run_time\": \"2026-06-17 00:22:10.411515+08:00\"\n}',NULL,NULL,4,'fcfadeed-276b-4b85-926e-ddfe7a7a43be',NULL,'2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1),('system_cleanup_operation_log','操作日志清理','cron','pending','2026-06-21 03:00:00+08:00','{\n  \"version\": 1,\n  \"id\": \"system_cleanup_operation_log\",\n  \"func\": \"app.api.v1.module_system.log.service:OperationLogService.cleanup_operation_log\",\n  \"trigger\": \"cron[day_of_week=\'sun\', hour=\'3\', minute=\'0\']\",\n  \"executor\": \"default\",\n  \"args\": [],\n  \"kwargs\": {},\n  \"name\": \"操作日志清理\",\n  \"misfire_grace_time\": 1,\n  \"coalesce\": true,\n  \"max_instances\": 5,\n  \"next_run_time\": \"2026-06-21 03:00:00+08:00\"\n}',NULL,NULL,5,'d9ce9654-6e03-42a8-8676-0404dfba5fb7',NULL,'2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1);
/*!40000 ALTER TABLE `task_job` ENABLE KEYS */;

--
-- Table structure for table `task_node`
--

DROP TABLE IF EXISTS `task_node`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_node` (
  `name` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '节点名称',
  `code` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '节点编码',
  `jobstore` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '存储器',
  `executor` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '执行器',
  `trigger` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '触发器',
  `trigger_args` text COLLATE utf8mb4_unicode_ci COMMENT '触发器参数',
  `func` text COLLATE utf8mb4_unicode_ci COMMENT '代码块',
  `args` text COLLATE utf8mb4_unicode_ci COMMENT '位置参数',
  `kwargs` text COLLATE utf8mb4_unicode_ci COMMENT '关键字参数',
  `coalesce` tinyint(1) DEFAULT NULL COMMENT '是否合并运行',
  `max_instances` int DEFAULT NULL COMMENT '最大实例数',
  `start_date` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '开始时间',
  `end_date` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '结束时间',
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `uuid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID全局唯一标识',
  `status` int NOT NULL COMMENT '状态',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '备注/描述',
  `created_time` datetime NOT NULL COMMENT '创建时间',
  `updated_time` datetime NOT NULL COMMENT '更新时间',
  `is_deleted` tinyint(1) NOT NULL COMMENT '是否已删除(0:未删除 1:已删除)',
  `deleted_time` datetime DEFAULT NULL COMMENT '删除时间',
  `tenant_id` int NOT NULL COMMENT '租户ID',
  `created_id` int DEFAULT NULL COMMENT '创建人ID',
  `updated_id` int DEFAULT NULL COMMENT '更新人ID',
  `deleted_id` int DEFAULT NULL COMMENT '删除人ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `tenant_id` (`tenant_id`,`code`),
  UNIQUE KEY `ix_task_node_uuid` (`uuid`),
  KEY `ix_task_node_is_deleted` (`is_deleted`),
  KEY `ix_task_node_id` (`id`),
  KEY `ix_task_node_status` (`status`),
  KEY `ix_task_node_updated_id` (`updated_id`),
  KEY `ix_task_node_created_time` (`created_time`),
  KEY `ix_task_node_deleted_time` (`deleted_time`),
  KEY `ix_task_node_tenant_id` (`tenant_id`),
  KEY `ix_task_node_deleted_id` (`deleted_id`),
  KEY `ix_task_node_created_id` (`created_id`),
  KEY `ix_task_node_updated_time` (`updated_time`),
  CONSTRAINT `task_node_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `platform_tenant` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `task_node_ibfk_2` FOREIGN KEY (`created_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `task_node_ibfk_3` FOREIGN KEY (`updated_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `task_node_ibfk_4` FOREIGN KEY (`deleted_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='节点类型表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_node`
--

/*!40000 ALTER TABLE `task_node` DISABLE KEYS */;
INSERT INTO `task_node` VALUES ('演示任务','demo_job','default','default',NULL,NULL,'import logging\n\ndef handler(*args, **kwargs):\n    \"\"\"演示任务：打印参数并返回执行摘要\"\"\"\n    logger = logging.getLogger(__name__)\n    logger.info(f\"演示任务执行中，参数: args={args}, kwargs={kwargs}\")\n    return {\n        \"status\": \"success\",\n        \"message\": \"演示任务执行成功\",\n        \"args_received\": len(args),\n        \"kwargs_keys\": list(kwargs.keys())\n    }\n',NULL,NULL,0,1,NULL,NULL,1,'a1472076-2d99-4514-b6d9-72e75e595d98',0,'最简演示任务，用于验证调度器基本功能','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('数据库清理任务','db_cleanup','sqlalchemy','default',NULL,NULL,'import logging\nfrom datetime import datetime, timedelta\n\ndef handler(*args, **kwargs):\n    \"\"\"清理过期数据：删除N天前的日志和临时数据\"\"\"\n    logger = logging.getLogger(__name__)\n    days = kwargs.get(\"days\", 90)\n    cutoff = datetime.now() - timedelta(days=days)\n    logger.info(f\"清理 {cutoff.strftime(\'%Y-%m-%d\')} 之前的过期数据...\")\n    return {\n        \"status\": \"success\",\n        \"cutoff_date\": cutoff.strftime(\"%Y-%m-%d %H:%M:%S\"),\n        \"deleted_count\": 0\n    }\n',NULL,'{\"days\": 30}',1,1,NULL,NULL,2,'ef8ed782-3abb-4bb4-a93b-68e4fca85e71',0,'清理过期操作日志和临时数据，建议每天凌晨3点执行','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('健康检查任务','health_check','default','default',NULL,NULL,'import logging\nimport psutil\n\ndef handler(*args, **kwargs):\n    \"\"\"系统健康检查：采集 CPU、内存、磁盘使用率\"\"\"\n    logger = logging.getLogger(__name__)\n    cpu = psutil.cpu_percent(interval=1)\n    mem = psutil.virtual_memory()\n    disk = psutil.disk_usage(\"/\")\n    status = \"healthy\" if cpu < 80 and mem.percent < 90 and disk.percent < 90 else \"warning\"\n    logger.info(f\"健康检查: CPU={cpu}% MEM={mem.percent}% DISK={disk.percent}%\")\n    return {\n        \"status\": status,\n        \"cpu_percent\": cpu,\n        \"memory_percent\": mem.percent,\n        \"disk_percent\": disk.percent,\n        \"memory_total_gb\": round(mem.total / (1024**3), 1),\n        \"disk_total_gb\": round(disk.total / (1024**3), 1)\n    }\n',NULL,NULL,1,1,NULL,NULL,3,'f858efcf-74db-477a-9c52-ad9482200f1f',0,'系统资源健康检查，建议每5分钟执行一次','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('邮件批量发送','email_batch','sqlalchemy','default',NULL,NULL,'import logging\n\ndef handler(*args, **kwargs):\n    \"\"\"批量发送待发送邮件\"\"\"\n    logger = logging.getLogger(__name__)\n    batch_size = kwargs.get(\"batch_size\", 50)\n    logger.info(f\"开始批量发送邮件，每批 {batch_size} 封...\")\n    return {\n        \"status\": \"success\",\n        \"sent_count\": 0,\n        \"failed_count\": 0,\n        \"batch_size\": batch_size\n    }\n',NULL,'{\"batch_size\": 50}',0,2,NULL,NULL,4,'5fe0bcb0-c977-4b06-8104-79179853160c',0,'批量发送待发送邮件，建议每分钟执行一次','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL);
/*!40000 ALTER TABLE `task_node` ENABLE KEYS */;

--
-- Table structure for table `task_workflow`
--

DROP TABLE IF EXISTS `task_workflow`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_workflow` (
  `name` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '流程名称',
  `code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '流程编码',
  `workflow_status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '流程状态: draft/published/archived',
  `nodes` json DEFAULT NULL COMMENT 'Vue Flow nodes JSON',
  `edges` json DEFAULT NULL COMMENT 'Vue Flow edges JSON',
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `uuid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID全局唯一标识',
  `status` int NOT NULL COMMENT '状态',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '备注/描述',
  `created_time` datetime NOT NULL COMMENT '创建时间',
  `updated_time` datetime NOT NULL COMMENT '更新时间',
  `is_deleted` tinyint(1) NOT NULL COMMENT '是否已删除(0:未删除 1:已删除)',
  `deleted_time` datetime DEFAULT NULL COMMENT '删除时间',
  `tenant_id` int NOT NULL COMMENT '租户ID',
  `created_id` int DEFAULT NULL COMMENT '创建人ID',
  `updated_id` int DEFAULT NULL COMMENT '更新人ID',
  `deleted_id` int DEFAULT NULL COMMENT '删除人ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_task_workflow_code` (`tenant_id`,`code`),
  UNIQUE KEY `ix_task_workflow_uuid` (`uuid`),
  KEY `ix_task_workflow_is_deleted` (`is_deleted`),
  KEY `ix_task_workflow_deleted_id` (`deleted_id`),
  KEY `ix_task_workflow_tenant_id` (`tenant_id`),
  KEY `ix_task_workflow_updated_time` (`updated_time`),
  KEY `ix_task_workflow_created_id` (`created_id`),
  KEY `ix_task_workflow_id` (`id`),
  KEY `ix_task_workflow_updated_id` (`updated_id`),
  KEY `ix_task_workflow_created_time` (`created_time`),
  KEY `ix_task_workflow_deleted_time` (`deleted_time`),
  KEY `ix_task_workflow_status` (`status`),
  CONSTRAINT `task_workflow_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `platform_tenant` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `task_workflow_ibfk_2` FOREIGN KEY (`created_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `task_workflow_ibfk_3` FOREIGN KEY (`updated_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `task_workflow_ibfk_4` FOREIGN KEY (`deleted_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工作流定义表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_workflow`
--

/*!40000 ALTER TABLE `task_workflow` DISABLE KEYS */;
/*!40000 ALTER TABLE `task_workflow` ENABLE KEYS */;

--
-- Table structure for table `task_workflow_node_type`
--

DROP TABLE IF EXISTS `task_workflow_node_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_workflow_node_type` (
  `name` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '显示名称',
  `code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '节点编码，对应画布 node.type',
  `category` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '分类: trigger/action/condition/control',
  `func` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Python 代码块，须定义 handler(*args,**kwargs)',
  `args` text COLLATE utf8mb4_unicode_ci COMMENT '默认位置参数，逗号分隔',
  `kwargs` text COLLATE utf8mb4_unicode_ci COMMENT '默认关键字参数 JSON',
  `sort_order` int NOT NULL COMMENT '排序',
  `is_active` tinyint(1) NOT NULL COMMENT '是否启用',
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `uuid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID全局唯一标识',
  `status` int NOT NULL COMMENT '状态',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '备注/描述',
  `created_time` datetime NOT NULL COMMENT '创建时间',
  `updated_time` datetime NOT NULL COMMENT '更新时间',
  `is_deleted` tinyint(1) NOT NULL COMMENT '是否已删除(0:未删除 1:已删除)',
  `deleted_time` datetime DEFAULT NULL COMMENT '删除时间',
  `tenant_id` int NOT NULL COMMENT '租户ID',
  `created_id` int DEFAULT NULL COMMENT '创建人ID',
  `updated_id` int DEFAULT NULL COMMENT '更新人ID',
  `deleted_id` int DEFAULT NULL COMMENT '删除人ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `tenant_id` (`tenant_id`,`code`),
  UNIQUE KEY `ix_task_workflow_node_type_uuid` (`uuid`),
  KEY `ix_task_workflow_node_type_status` (`status`),
  KEY `ix_task_workflow_node_type_is_deleted` (`is_deleted`),
  KEY `ix_task_workflow_node_type_created_time` (`created_time`),
  KEY `ix_task_workflow_node_type_created_id` (`created_id`),
  KEY `ix_task_workflow_node_type_deleted_time` (`deleted_time`),
  KEY `ix_task_workflow_node_type_deleted_id` (`deleted_id`),
  KEY `ix_task_workflow_node_type_id` (`id`),
  KEY `ix_task_workflow_node_type_updated_time` (`updated_time`),
  KEY `ix_task_workflow_node_type_tenant_id` (`tenant_id`),
  KEY `ix_task_workflow_node_type_updated_id` (`updated_id`),
  CONSTRAINT `task_workflow_node_type_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `platform_tenant` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `task_workflow_node_type_ibfk_2` FOREIGN KEY (`created_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `task_workflow_node_type_ibfk_3` FOREIGN KEY (`updated_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `task_workflow_node_type_ibfk_4` FOREIGN KEY (`deleted_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工作流编排节点类型（非定时任务节点）';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_workflow_node_type`
--

/*!40000 ALTER TABLE `task_workflow_node_type` DISABLE KEYS */;
INSERT INTO `task_workflow_node_type` VALUES ('HTTP请求','http_request','action','import json\nimport urllib.request\n\ndef handler(*args, **kwargs):\n    \"\"\"发送 HTTP 请求并返回响应\"\"\"\n    url = kwargs.get(\"url\", \"\")\n    method = kwargs.get(\"method\", \"GET\")\n    headers = kwargs.get(\"headers\", {})\n    body = kwargs.get(\"body\")\n    if not url:\n        raise ValueError(\"缺少 url 参数\")\n    req = urllib.request.Request(url, method=method, headers=headers)\n    if body and isinstance(body, dict):\n        req.data = json.dumps(body).encode()\n    with urllib.request.urlopen(req) as resp:\n        return {\"status_code\": resp.status, \"body\": resp.read().decode()}\n',NULL,'{\"url\": \"\", \"method\": \"GET\"}',1,1,1,'ab5bd4cd-1a22-41e6-81dd-f363f7dc1bb2',0,'发送 HTTP 请求，支持 GET/POST 等方法','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('发送通知','send_notification','action','import logging\n\ndef handler(*args, **kwargs):\n    \"\"\"发送通知消息\"\"\"\n    logger = logging.getLogger(__name__)\n    channel = kwargs.get(\"channel\", \"system\")\n    title = kwargs.get(\"title\", \"工作流通知\")\n    content = kwargs.get(\"content\", \"\")\n    recipients = kwargs.get(\"recipients\", [])\n    logger.info(f\"[{channel}] 发送通知: {title} -> {len(recipients)}人\")\n    return {\n        \"channel\": channel,\n        \"title\": title,\n        \"recipient_count\": len(recipients),\n        \"status\": \"sent\"\n    }\n',NULL,'{\"channel\": \"system\", \"title\": \"工作流通知\", \"recipients\": []}',2,1,2,'e6d204b9-5216-4c5c-86e0-d1e414d73d9c',0,'发送系统通知、邮件或短信','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('条件判断','condition','condition','import json\n\ndef handler(*args, **kwargs):\n    \"\"\"条件分支：根据 upstream 结果决定走向\"\"\"\n    upstream = kwargs.get(\"upstream\", {})\n    variables = kwargs.get(\"variables\", {})\n    field = kwargs.get(\"field\", \"status\")\n    expected = kwargs.get(\"expected\", \"success\")\n    operator = kwargs.get(\"operator\", \"eq\")\n    last = list(upstream.values())[-1] if upstream else {}\n    actual = last.get(field) if isinstance(last, dict) else last\n    operations = {\n        \"eq\": lambda a, e: a == e,\n        \"ne\": lambda a, e: a != e,\n        \"gt\": lambda a, e: a > e,\n        \"lt\": lambda a, e: a < e,\n        \"contains\": lambda a, e: str(e) in str(a)\n    }\n    op = operations.get(operator, operations[\"eq\"])\n    result = op(actual, expected)\n    return {\"passed\": result, \"actual\": actual, \"expected\": expected}\n',NULL,'{\"field\": \"status\", \"expected\": \"success\", \"operator\": \"eq\"}',3,1,3,'d9bb707d-c8c9-4dc2-ba23-96320a502446',0,'根据上游节点输出判断分支走向','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('数据转换','data_transform','action','import json\nfrom datetime import datetime\n\ndef handler(*args, **kwargs):\n    \"\"\"转换上游数据格式\"\"\"\n    upstream = kwargs.get(\"upstream\", {})\n    mapping = kwargs.get(\"mapping\", {})\n    result = {}\n    for upstream_key, target_key in mapping.items():\n        for source, value in upstream.items():\n            if isinstance(value, dict) and upstream_key in value:\n                result[target_key] = value[upstream_key]\n    result[\"transformed_at\"] = datetime.now().isoformat()\n    return result\n',NULL,'{\"mapping\": {}}',4,1,4,'84e203ce-1fbd-44db-b573-e4f233d1cfaa',0,'转换上游节点的数据格式','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL),('聚合汇总','aggregate','action','import json\n\ndef handler(*args, **kwargs):\n    \"\"\"聚合上游多个节点的输出\"\"\"\n    upstream = kwargs.get(\"upstream\", {})\n    variables = kwargs.get(\"variables\", {})\n    results = {\n        \"node_count\": len(upstream),\n        \"nodes\": list(upstream.keys()),\n        \"values\": list(upstream.values()),\n        \"variables\": variables\n    }\n    return results\n',NULL,NULL,5,1,5,'5025078a-30a6-4178-a9de-7baf68140553',0,'将多个上游节点的输出聚合到一个结果中','2026-06-17 00:17:10','2026-06-17 00:17:10',0,NULL,1,NULL,NULL,NULL);
/*!40000 ALTER TABLE `task_workflow_node_type` ENABLE KEYS */;

--
-- Dumping routines for database 'fastapiadmin'
--
--
-- WARNING: can't read the INFORMATION_SCHEMA.libraries table. It's most probably an old server 8.4.3.
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-17  0:17:30

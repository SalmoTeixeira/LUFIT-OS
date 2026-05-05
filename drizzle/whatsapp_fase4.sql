-- TABELAS WHATSAPP (FASE 4) — Execute no MySQL do Railway após o deploy
-- Se o Drizzle já criou, ignore. Se der erro "table exists", tudo bem.

CREATE TABLE IF NOT EXISTS `whatsappConfig` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`phoneNumber` varchar(20) NOT NULL,
	`businessName` varchar(100) DEFAULT 'LUFIT Moda',
	`welcomeMessage` text,
	`autoReplyEnabled` boolean DEFAULT true,
	`orderConfirmationEnabled` boolean DEFAULT true,
	`shippingNotificationEnabled` boolean DEFAULT true,
	`lowStockAlertEnabled` boolean DEFAULT true,
	`dailyReportEnabled` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `whatsappConfig_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `whatsappMessages` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`phoneNumber` varchar(20) NOT NULL,
	`templateName` varchar(100),
	`body` text NOT NULL,
	`status` varchar(50) DEFAULT 'pending',
	`eventType` varchar(50),
	`relatedOrderId` int,
	`relatedCustomerId` int,
	`sentAt` timestamp,
	`deliveredAt` timestamp,
	`readAt` timestamp,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `whatsappMessages_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `whatsappTemplates` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`label` varchar(100) NOT NULL,
	`body` text NOT NULL,
	`variables` text,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `whatsappTemplates_id` PRIMARY KEY(`id`)
);

-- Índices
CREATE INDEX IF NOT EXISTS `wm_phone_idx` ON `whatsappMessages` (`phoneNumber`);
CREATE INDEX IF NOT EXISTS `wm_status_idx` ON `whatsappMessages` (`status`);
CREATE INDEX IF NOT EXISTS `wm_event_idx` ON `whatsappMessages` (`eventType`);
CREATE INDEX IF NOT EXISTS `wm_order_idx` ON `whatsappMessages` (`relatedOrderId`);
CREATE INDEX IF NOT EXISTS `wm_created_idx` ON `whatsappMessages` (`createdAt`);

-- Templates padrão do LUFIT (insere só se estiver vazio)
INSERT INTO `whatsappTemplates` (`name`, `label`, `body`, `variables`, `isActive`) 
SELECT * FROM (SELECT 'order_confirmation', 'Pedido Confirmado', 'Oi {{nome}}! Seu pedido #{{pedido}} foi confirmado. Total: R$ {{total}}. Acompanhe pelo link: {{link}}', '["nome","pedido","total","link"]', true) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM `whatsappTemplates` WHERE `name` = 'order_confirmation');

INSERT INTO `whatsappTemplates` (`name`, `label`, `body`, `variables`, `isActive`) 
SELECT * FROM (SELECT 'shipping_notification', 'Envio Realizado', 'Oi {{nome}}! Seu pedido #{{pedido}} foi enviado via {{transportadora}}. Rastreio: {{codigo}} {{link}}', '["nome","pedido","transportadora","codigo","link"]', true) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM `whatsappTemplates` WHERE `name` = 'shipping_notification');

INSERT INTO `whatsappTemplates` (`name`, `label`, `body`, `variables`, `isActive`) 
SELECT * FROM (SELECT 'low_stock_alert', 'Estoque Baixo', 'Alerta: produto {{produto}} (SKU: {{sku}}) está com estoque baixo: {{quantidade}} unidades. Repor urgentemente.', '["produto","sku","quantidade"]', true) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM `whatsappTemplates` WHERE `name` = 'low_stock_alert');

INSERT INTO `whatsappTemplates` (`name`, `label`, `body`, `variables`, `isActive`) 
SELECT * FROM (SELECT 'welcome', 'Boas-vindas', 'Ola! Bem-vindo a LUFIT Moda Praia e Fitness. Como posso ajudar?', '[]', true) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM `whatsappTemplates` WHERE `name` = 'welcome');

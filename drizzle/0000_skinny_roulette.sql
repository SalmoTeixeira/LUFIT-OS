CREATE TABLE `abandonedCarts` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`customerEmail` varchar(320) NOT NULL,
	`customerName` varchar(255),
	`customerPhone` varchar(50),
	`items` json,
	`totalValue` decimal(12,2) DEFAULT '0',
	`status` enum('new','contacted','converted','lost') NOT NULL DEFAULT 'new',
	`lastActionAt` timestamp NOT NULL DEFAULT (now()),
	`recoveredAt` timestamp,
	`couponCode` varchar(50),
	`discountPercent` int DEFAULT 0,
	`whatsappSentAt` timestamp,
	`emailSentAt` timestamp,
	`smsSentAt` timestamp,
	`pushSentAt` timestamp,
	`convertedOrderId` bigint unsigned,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `abandonedCarts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `accountsPayable` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`documentNumber` varchar(100),
	`description` varchar(255) NOT NULL,
	`categoryId` bigint unsigned,
	`supplierId` bigint unsigned,
	`purchaseOrderId` bigint unsigned,
	`amount` decimal(12,2) NOT NULL,
	`paidAmount` decimal(12,2) DEFAULT '0',
	`discount` decimal(12,2) DEFAULT '0',
	`interest` decimal(12,2) DEFAULT '0',
	`status` enum('pending','scheduled','partial','paid','overdue','cancelled','disputed') NOT NULL DEFAULT 'pending',
	`issueDate` date,
	`dueDate` date NOT NULL,
	`paidAt` timestamp,
	`paymentMethod` enum('pix','boleto','transfer','cash','card','other'),
	`bankAccountId` bigint unsigned,
	`attachmentUrl` text,
	`notes` text,
	`recurrenceGroupId` varchar(50),
	`createdBy` bigint unsigned,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `accountsPayable_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `accountsReceivable` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`documentNumber` varchar(100),
	`description` varchar(255) NOT NULL,
	`categoryId` bigint unsigned,
	`customerId` bigint unsigned,
	`orderId` bigint unsigned,
	`amount` decimal(12,2) NOT NULL,
	`paidAmount` decimal(12,2) DEFAULT '0',
	`discount` decimal(12,2) DEFAULT '0',
	`interest` decimal(12,2) DEFAULT '0',
	`installmentCount` int DEFAULT 1,
	`installmentNumber` int DEFAULT 1,
	`status` enum('pending','scheduled','partial','paid','overdue','cancelled','disputed','refunded') NOT NULL DEFAULT 'pending',
	`issueDate` date,
	`dueDate` date,
	`paidAt` timestamp,
	`paymentMethod` enum('pix','credit_card','debit_card'),
	`bankAccountId` bigint unsigned,
	`gatewayTransactionId` varchar(255),
	`notes` text,
	`createdBy` bigint unsigned,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `accountsReceivable_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auditLogs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`userId` bigint unsigned,
	`userName` varchar(255),
	`action` enum('create','update','delete','login','logout','export','import','approve','reject','pay','cancel') NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` bigint unsigned,
	`entityName` varchar(255),
	`oldValues` json,
	`newValues` json,
	`ipAddress` varchar(50),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bankAccounts` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`bankCode` varchar(10),
	`bankName` varchar(100),
	`agency` varchar(20),
	`account` varchar(30),
	`accountDigit` varchar(5),
	`type` enum('checking','savings','investment','digital_wallet') DEFAULT 'checking',
	`pixKey` varchar(100),
	`pixKeyType` enum('cnpj','cpf','email','phone','random'),
	`openingBalance` decimal(12,2) DEFAULT '0',
	`currentBalance` decimal(12,2) DEFAULT '0',
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bankAccounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `blingOAuth` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`tokenType` varchar(50) DEFAULT 'Bearer',
	`expiresAt` timestamp,
	`scope` text,
	`state` varchar(255),
	`clientId` varchar(255),
	`isActive` boolean NOT NULL DEFAULT false,
	`lastUsedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `blingOAuth_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cashBook` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`date` date NOT NULL,
	`type` enum('in','out') NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`description` varchar(255) NOT NULL,
	`categoryId` bigint unsigned,
	`accountsReceivableId` bigint unsigned,
	`accountsPayableId` bigint unsigned,
	`orderId` bigint unsigned,
	`purchaseOrderId` bigint unsigned,
	`salesRepId` bigint unsigned,
	`bankAccountId` bigint unsigned,
	`balanceAfter` decimal(12,2) NOT NULL,
	`isReconciled` boolean DEFAULT false,
	`reconciledAt` timestamp,
	`createdBy` bigint unsigned,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cashBook_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cashFlowEntries` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`type` enum('income','expense') NOT NULL,
	`source` enum('sale','payable','receivable','manual','transfer','adjustment') NOT NULL,
	`sourceId` bigint unsigned,
	`description` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`subcategory` varchar(100),
	`amount` decimal(12,2) NOT NULL,
	`entryDate` timestamp NOT NULL DEFAULT (now()),
	`paymentMethod` enum('pix','bank_transfer','cash','credit_card','debit_card','boleto','other'),
	`runningBalance` decimal(12,2) NOT NULL,
	`notes` text,
	`operatorName` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cashFlowEntries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`imageUrl` text,
	`sortOrder` int DEFAULT 0,
	`isActive` boolean DEFAULT true,
	`commissionRate` decimal(5,2) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `cat_slug_idx` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `commissions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`salesRepId` bigint unsigned NOT NULL,
	`orderId` bigint unsigned,
	`customerId` bigint unsigned,
	`baseAmount` decimal(12,2) NOT NULL,
	`rateApplied` decimal(5,2) NOT NULL,
	`fixedApplied` decimal(10,2) DEFAULT '0',
	`calculatedValue` decimal(12,2) NOT NULL,
	`status` enum('pending','approved','paid','cancelled','clawback') NOT NULL DEFAULT 'pending',
	`approvedAt` timestamp,
	`paidAt` timestamp,
	`paymentReference` varchar(255),
	`isReturnDeduction` boolean DEFAULT false,
	`originalCommissionId` bigint unsigned,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `commissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `costCenters` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('revenue','expense','asset','liability') NOT NULL DEFAULT 'expense',
	`parentId` bigint unsigned,
	`description` text,
	`budget` decimal(12,2) DEFAULT '0',
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `costCenters_id` PRIMARY KEY(`id`),
	CONSTRAINT `costCenters_code_unique` UNIQUE(`code`),
	CONSTRAINT `cc_code_idx` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `customerTagAssignments` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`customerId` bigint unsigned NOT NULL,
	`tagId` bigint unsigned NOT NULL,
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customerTagAssignments_id` PRIMARY KEY(`id`),
	CONSTRAINT `cta_unique_idx` UNIQUE(`customerId`,`tagId`)
);
--> statement-breakpoint
CREATE TABLE `customerTags` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`color` varchar(7) DEFAULT '#2DD4A8',
	`description` text,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customerTags_id` PRIMARY KEY(`id`),
	CONSTRAINT `ctag_name_idx` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(255),
	`phone` varchar(50),
	`whatsapp` varchar(50),
	`document` varchar(20),
	`documentType` enum('cpf','cnpj') DEFAULT 'cpf',
	`addressStreet` varchar(255),
	`addressNumber` varchar(20),
	`addressComplement` varchar(100),
	`addressNeighborhood` varchar(100),
	`addressCity` varchar(100),
	`addressState` varchar(2),
	`addressZip` varchar(20),
	`socialNetworkType` enum('instagram','tiktok','facebook','linkedin','whatsapp','google','other') NOT NULL,
	`socialNetworkHandle` varchar(100) NOT NULL,
	`source` varchar(50),
	`birthday` date,
	`notes` text,
	`segment` enum('vip','regular','atacado','revenda','influencer','staff') DEFAULT 'regular',
	`isVip` boolean DEFAULT false,
	`isWholesale` boolean DEFAULT false,
	`totalOrders` int DEFAULT 0,
	`totalSpent` decimal(12,2) DEFAULT '0',
	`averageTicket` decimal(10,2) DEFAULT '0',
	`lastOrderAt` timestamp,
	`preferredPayment` enum('pix','credit_card','debit_card'),
	`isActive` boolean DEFAULT true,
	`optedInMarketing` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customers_id` PRIMARY KEY(`id`),
	CONSTRAINT `cust_email_idx` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `nfRules` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`channel` enum('retail','ecommerce','wholesale','marketplace') NOT NULL,
	`autoEmit` boolean DEFAULT false,
	`threshold` decimal(12,2) DEFAULT '0',
	`askCustomer` boolean DEFAULT true,
	`defaultYes` boolean DEFAULT false,
	`allowedReasons` json DEFAULT ('["client_declined","gift","below_threshold","informal_sale"]'),
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `nfRules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nfeLog` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`orderId` bigint unsigned NOT NULL,
	`receiptId` bigint unsigned,
	`blingNfeId` varchar(100),
	`nfNumber` varchar(20),
	`nfSeries` varchar(10),
	`nfKey` varchar(50),
	`xmlUrl` text,
	`pdfUrl` text,
	`danfeUrl` text,
	`status` enum('pending','processing','authorized','cancelled','rejected','error') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`customerEmailSent` boolean DEFAULT false,
	`customerEmailSentAt` timestamp,
	`requestedAt` timestamp NOT NULL DEFAULT (now()),
	`emittedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `nfeLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`orderId` bigint unsigned NOT NULL,
	`productId` bigint unsigned NOT NULL,
	`variationId` bigint unsigned,
	`productName` varchar(255) NOT NULL,
	`sku` varchar(100),
	`quantity` int NOT NULL DEFAULT 1,
	`unitPrice` decimal(10,2) NOT NULL,
	`totalPrice` decimal(10,2) NOT NULL,
	`discount` decimal(10,2) DEFAULT '0',
	`wholesaleLineDiscount` decimal(10,2) DEFAULT '0',
	`size` varchar(20),
	`color` varchar(50),
	`unitCostAtSale` decimal(10,2),
	`returnedQuantity` int DEFAULT 0,
	`returnReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(50) NOT NULL,
	`customerId` bigint unsigned NOT NULL,
	`salesRepId` bigint unsigned,
	`status` enum('pending','paid','processing','shipped','delivered','cancelled','refunded','returned') NOT NULL DEFAULT 'pending',
	`paymentMethod` enum('pix','credit_card','debit_card'),
	`paymentStatus` enum('pending','approved','rejected','refunded','partial') NOT NULL DEFAULT 'pending',
	`subtotal` decimal(12,2) NOT NULL,
	`discount` decimal(12,2) DEFAULT '0',
	`shippingCost` decimal(10,2) DEFAULT '0',
	`tax` decimal(10,2) DEFAULT '0',
	`total` decimal(12,2) NOT NULL,
	`isWholesale` boolean DEFAULT false,
	`wholesalePiecesCount` int DEFAULT 0,
	`wholesaleDiscountPercent` decimal(5,2) DEFAULT '0',
	`shippingMethod` varchar(100),
	`trackingNumber` varchar(100),
	`trackingUrl` text,
	`shippedAt` timestamp,
	`deliveredAt` timestamp,
	`estimatedDeliveryDate` date,
	`source` enum('website','instagram','tiktok','facebook','whatsapp','marketplace','loja_fisica','phone','event') DEFAULT 'website',
	`campaign` varchar(100),
	`couponCode` varchar(50),
	`couponDiscount` decimal(12,2) DEFAULT '0',
	`commissionAmount` decimal(10,2) DEFAULT '0',
	`commissionStatus` enum('pending','calculated','paid') DEFAULT 'pending',
	`invoiceNumber` varchar(50),
	`invoiceSeries` varchar(10),
	`invoiceIssuedAt` timestamp,
	`returnReason` text,
	`returnRequestedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`),
	CONSTRAINT `ord_number_idx` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `payables` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`documentNumber` varchar(100),
	`description` varchar(255) NOT NULL,
	`supplierId` bigint unsigned,
	`supplierName` varchar(255),
	`origin` enum('purchase','expense','tax','salary','rent','other') DEFAULT 'purchase',
	`amount` decimal(12,2) NOT NULL,
	`paidAmount` decimal(12,2) DEFAULT '0',
	`discountAmount` decimal(12,2) DEFAULT '0',
	`interestAmount` decimal(12,2) DEFAULT '0',
	`balance` decimal(12,2) NOT NULL,
	`issueDate` timestamp NOT NULL DEFAULT (now()),
	`dueDate` timestamp NOT NULL,
	`paidDate` timestamp,
	`status` enum('pending','paid','overdue','cancelled','partial','scheduled') NOT NULL DEFAULT 'pending',
	`paymentMethod` enum('pix','bank_transfer','boleto','cash','credit_card','other'),
	`category` varchar(100),
	`purchaseOrderId` bigint unsigned,
	`notes` text,
	`reminderSent` boolean DEFAULT false,
	`reminderSentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `paymentTransactions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`orderId` bigint unsigned NOT NULL,
	`customerId` bigint unsigned NOT NULL,
	`gateway` enum('mercado_pago','pagarme','stripe','cielo','other') DEFAULT 'mercado_pago',
	`gatewayTransactionId` varchar(255),
	`gatewayPaymentId` varchar(255),
	`type` enum('pix','credit_card','debit_card','boleto','wallet') NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`paidAmount` decimal(12,2) DEFAULT '0',
	`installments` int DEFAULT 1,
	`installmentAmount` decimal(10,2),
	`interestRate` decimal(5,2) DEFAULT '0',
	`status` enum('pending','processing','approved','rejected','cancelled','refunded','chargeback') NOT NULL DEFAULT 'pending',
	`pixQrCode` text,
	`pixQrCodeText` text,
	`pixExpirationAt` timestamp,
	`cardLastFour` varchar(4),
	`cardBrand` varchar(20),
	`cardHolderName` varchar(255),
	`errorMessage` text,
	`errorCode` varchar(50),
	`refundedAt` timestamp,
	`refundedAmount` decimal(12,2) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `paymentTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `priceHistory` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`productId` bigint unsigned NOT NULL,
	`variationId` bigint unsigned,
	`costPrice` decimal(10,2) NOT NULL,
	`salePrice` decimal(10,2) NOT NULL,
	`compareAtPrice` decimal(10,2),
	`marginPercent` decimal(6,2),
	`marginValue` decimal(10,2),
	`effectiveDate` date NOT NULL,
	`reason` text,
	`createdBy` bigint unsigned,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `priceHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `productColors` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`productId` bigint unsigned NOT NULL,
	`name` varchar(50) NOT NULL,
	`hexColor` varchar(7),
	`imageUrl` text,
	`position` int DEFAULT 0,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `productColors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `productMovements` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`productId` bigint unsigned NOT NULL,
	`variationId` bigint unsigned,
	`productName` varchar(255),
	`sku` varchar(100),
	`size` varchar(50),
	`color` varchar(50),
	`movementType` enum('purchase_in','sale_out','return_in','return_out','adjustment','transfer_in','transfer_out','production_in','waste') NOT NULL,
	`quantity` int NOT NULL,
	`stockBefore` int NOT NULL,
	`stockAfter` int NOT NULL,
	`unitCost` decimal(10,2),
	`documentNumber` varchar(100),
	`orderId` bigint unsigned,
	`supplierId` bigint unsigned,
	`supplierName` varchar(255),
	`notes` text,
	`operatorName` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `productMovements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `productVariations` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`productId` bigint unsigned NOT NULL,
	`sku` varchar(100) NOT NULL,
	`ean` varchar(20),
	`barcode` varchar(50),
	`size` varchar(20),
	`color` varchar(50),
	`hexColor` varchar(7),
	`costPrice` decimal(10,2),
	`previousCostPrice` decimal(10,2),
	`averageCostPrice` decimal(10,2),
	`salePrice` decimal(10,2),
	`compareAtPrice` decimal(10,2),
	`stockQuantity` int NOT NULL DEFAULT 0,
	`reservedQuantity` int NOT NULL DEFAULT 0,
	`minStockAlert` int DEFAULT 5,
	`weightKg` decimal(8,3),
	`lengthCm` decimal(8,2),
	`widthCm` decimal(8,2),
	`heightCm` decimal(8,2),
	`isActive` boolean DEFAULT true,
	`position` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `productVariations_id` PRIMARY KEY(`id`),
	CONSTRAINT `productVariations_sku_unique` UNIQUE(`sku`),
	CONSTRAINT `var_sku_idx` UNIQUE(`sku`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`sku` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`shortDescription` text,
	`price` decimal(10,2) NOT NULL,
	`compareAtPrice` decimal(10,2),
	`costPrice` decimal(10,2),
	`categoryId` bigint unsigned,
	`subcategoryId` bigint unsigned,
	`supplierId` bigint unsigned,
	`ncm` varchar(15),
	`ean` varchar(20),
	`barcode` varchar(50),
	`composition` text,
	`careInstructions` text,
	`origin` varchar(100),
	`brand` varchar(100) DEFAULT 'LUFIT',
	`collection` varchar(100),
	`season` enum('verao','inverno','primavera','outono','cruzeiro','perene'),
	`year` int DEFAULT 2025,
	`images` json,
	`attributeConfig` json,
	`weightKg` decimal(8,3) DEFAULT '0',
	`lengthCm` decimal(8,2) DEFAULT '0',
	`widthCm` decimal(8,2) DEFAULT '0',
	`heightCm` decimal(8,2) DEFAULT '0',
	`isActive` boolean DEFAULT true,
	`isFeatured` boolean DEFAULT false,
	`tags` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_sku_unique` UNIQUE(`sku`),
	CONSTRAINT `prod_sku_idx` UNIQUE(`sku`),
	CONSTRAINT `prod_slug_idx` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `purchaseOrderItems` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`purchaseOrderId` bigint unsigned NOT NULL,
	`productId` bigint unsigned NOT NULL,
	`variationId` bigint unsigned,
	`description` varchar(255),
	`quantity` int NOT NULL DEFAULT 1,
	`unitCost` decimal(10,2) NOT NULL,
	`totalCost` decimal(10,2) NOT NULL,
	`discount` decimal(10,2) DEFAULT '0',
	`receivedQuantity` int DEFAULT 0,
	`batchNumber` varchar(50),
	`expiryDate` date,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `purchaseOrderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchaseOrders` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(50) NOT NULL,
	`supplierId` bigint unsigned NOT NULL,
	`warehouseId` bigint unsigned,
	`status` enum('draft','sent','confirmed','partial','received','cancelled','returned') NOT NULL DEFAULT 'draft',
	`isInformal` boolean DEFAULT false,
	`subtotal` decimal(12,2) NOT NULL,
	`discount` decimal(12,2) DEFAULT '0',
	`shippingCost` decimal(10,2) DEFAULT '0',
	`tax` decimal(10,2) DEFAULT '0',
	`total` decimal(12,2) NOT NULL,
	`expectedDeliveryDate` date,
	`receivedAt` timestamp,
	`cancelledAt` timestamp,
	`notes` text,
	`paymentStatus` enum('pending','partial','paid') DEFAULT 'pending',
	`createdBy` bigint unsigned,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `purchaseOrders_id` PRIMARY KEY(`id`),
	CONSTRAINT `purchaseOrders_orderNumber_unique` UNIQUE(`orderNumber`),
	CONSTRAINT `po_number_idx` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `receivables` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`orderId` bigint unsigned NOT NULL,
	`receiptNumber` varchar(50),
	`customerId` bigint unsigned,
	`customerName` varchar(255),
	`customerDocument` varchar(20),
	`amount` decimal(12,2) NOT NULL,
	`receivedAmount` decimal(12,2) DEFAULT '0',
	`discountAmount` decimal(12,2) DEFAULT '0',
	`feeAmount` decimal(12,2) DEFAULT '0',
	`balance` decimal(12,2) NOT NULL,
	`issueDate` timestamp NOT NULL DEFAULT (now()),
	`dueDate` timestamp NOT NULL,
	`receivedDate` timestamp,
	`status` enum('pending','paid','overdue','cancelled','partial','refunded','chargeback') NOT NULL DEFAULT 'pending',
	`paymentMethod` enum('pix','credit_card','debit_card','boleto','cash','wallet','other') NOT NULL,
	`gateway` enum('mercado_pago','pagarme','stripe','cielo','other') DEFAULT 'mercado_pago',
	`gatewayTransactionId` varchar(255),
	`channel` enum('ecommerce','retail','wholesale','marketplace') DEFAULT 'ecommerce',
	`installments` int DEFAULT 1,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `receivables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `saleReceipts` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`receiptNumber` varchar(50) NOT NULL,
	`orderId` bigint unsigned,
	`customerName` varchar(255),
	`customerDocument` varchar(20),
	`customerEmail` varchar(320),
	`customerPhone` varchar(50),
	`items` json,
	`subtotal` decimal(12,2) NOT NULL,
	`discountAmount` decimal(12,2) DEFAULT '0',
	`shippingCost` decimal(10,2) DEFAULT '0',
	`total` decimal(12,2) NOT NULL,
	`paymentMethod` enum('pix','credit_card','debit_card','cash','boleto','other') NOT NULL,
	`paymentTransactionId` varchar(255),
	`noNfReason` enum('client_declined','gift','below_threshold','informal_sale','other'),
	`noNfReasonDetail` text,
	`channel` enum('retail','ecommerce','wholesale','marketplace') DEFAULT 'ecommerce',
	`destinationState` varchar(2),
	`destinationCity` varchar(100),
	`operatorName` varchar(255),
	`printedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `saleReceipts_id` PRIMARY KEY(`id`),
	CONSTRAINT `saleReceipts_receiptNumber_unique` UNIQUE(`receiptNumber`)
);
--> statement-breakpoint
CREATE TABLE `salesReps` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(50),
	`whatsapp` varchar(50),
	`commissionType` enum('percentage','fixed','tiered','hybrid') NOT NULL DEFAULT 'percentage',
	`commissionRate` decimal(5,2) DEFAULT '1.00',
	`commissionFixed` decimal(10,2) DEFAULT '0',
	`monthlyTarget` decimal(12,2) DEFAULT '10000.00',
	`userId` bigint unsigned,
	`isAiAgent` boolean DEFAULT false,
	`description` text,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `salesReps_id` PRIMARY KEY(`id`),
	CONSTRAINT `salesReps_code_unique` UNIQUE(`code`),
	CONSTRAINT `sr_code_idx` UNIQUE(`code`),
	CONSTRAINT `sr_email_idx` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `shippingQuotes` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`orderId` bigint unsigned,
	`zipCode` varchar(20) NOT NULL,
	`addressState` varchar(2),
	`addressCity` varchar(100),
	`carrier` varchar(100),
	`service` varchar(100),
	`serviceCode` varchar(50),
	`cost` decimal(10,2) NOT NULL,
	`estimatedDays` int,
	`totalWeightKg` decimal(8,3),
	`isSelected` boolean DEFAULT false,
	`rawResponse` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shippingQuotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shippingSettings` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text,
	`description` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shippingSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `shippingSettings_key_unique` UNIQUE(`key`),
	CONSTRAINT `ss_key_idx` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `stockAlerts` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`productId` bigint unsigned NOT NULL,
	`variationId` bigint unsigned,
	`productName` varchar(255) NOT NULL,
	`sku` varchar(100),
	`size` varchar(50),
	`color` varchar(50),
	`alertType` enum('below_min','above_max','zero_stock','expiring','slow_moving','dead_stock') NOT NULL,
	`currentStock` int NOT NULL,
	`minStock` int DEFAULT 0,
	`maxStock` int DEFAULT 100,
	`suggestedQty` int DEFAULT 0,
	`suggestedSupplierId` bigint unsigned,
	`status` enum('active','resolved','ignored') NOT NULL DEFAULT 'active',
	`resolvedAt` timestamp,
	`resolvedBy` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stockAlerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stockMovements` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`variationId` bigint unsigned NOT NULL,
	`warehouseId` bigint unsigned,
	`type` enum('in','out','adjustment','return','transfer_in','transfer_out','damage','production') NOT NULL,
	`quantity` int NOT NULL,
	`unitCost` decimal(10,2),
	`reason` text,
	`reference` varchar(255),
	`purchaseOrderId` bigint unsigned,
	`purchaseOrderItemId` bigint unsigned,
	`orderId` bigint unsigned,
	`orderItemId` bigint unsigned,
	`createdBy` bigint unsigned,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stockMovements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subcategories` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`categoryId` bigint unsigned NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`sortOrder` int DEFAULT 0,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subcategories_id` PRIMARY KEY(`id`),
	CONSTRAINT `subcat_slug_idx` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `supplierBankAccounts` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`supplierId` bigint unsigned NOT NULL,
	`bankCode` varchar(10),
	`bankName` varchar(100),
	`agency` varchar(20),
	`account` varchar(30),
	`accountDigit` varchar(5),
	`accountType` enum('checking','savings') DEFAULT 'checking',
	`pixKey` varchar(100),
	`pixKeyType` enum('cnpj','cpf','email','phone','random'),
	`isPrimary` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `supplierBankAccounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supplierContacts` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`supplierId` bigint unsigned NOT NULL,
	`name` varchar(255) NOT NULL,
	`role` varchar(100),
	`email` varchar(320),
	`phone` varchar(50),
	`whatsapp` varchar(50),
	`isPrimary` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `supplierContacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`legalName` varchar(255),
	`document` varchar(20) NOT NULL,
	`documentType` enum('cpf','cnpj','rg','passport') NOT NULL DEFAULT 'cnpj',
	`stateRegistration` varchar(50),
	`type` enum('factory','atelier','distributor','importer','raw_material','logistics') NOT NULL DEFAULT 'factory',
	`status` enum('active','inactive','blocked','prospect') NOT NULL DEFAULT 'active',
	`rating` int DEFAULT 5,
	`isInformal` boolean DEFAULT false,
	`paymentTermDays` int DEFAULT 30,
	`minOrderValue` decimal(12,2) DEFAULT '0',
	`defaultShippingMethod` varchar(50),
	`email` varchar(320),
	`phone` varchar(50),
	`whatsapp` varchar(50),
	`website` text,
	`addressStreet` varchar(255),
	`addressNumber` varchar(20),
	`addressComplement` varchar(100),
	`addressNeighborhood` varchar(100),
	`addressCity` varchar(100),
	`addressState` varchar(2),
	`addressZip` varchar(20),
	`notes` text,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `suppliers_id` PRIMARY KEY(`id`),
	CONSTRAINT `suppliers_code_unique` UNIQUE(`code`),
	CONSTRAINT `sup_code_idx` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`unionId` varchar(255) NOT NULL,
	`name` varchar(255),
	`email` varchar(320),
	`avatar` text,
	`role` enum('user','admin','manager','seller','finance','stockist','marketing') NOT NULL DEFAULT 'user',
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	`lastSignInAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_unionId_unique` UNIQUE(`unionId`)
);
--> statement-breakpoint
CREATE TABLE `warehouses` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('central','loja','cd','externo') DEFAULT 'central',
	`addressStreet` varchar(255),
	`addressNumber` varchar(20),
	`addressComplement` varchar(100),
	`addressNeighborhood` varchar(100),
	`addressCity` varchar(100),
	`addressState` varchar(2),
	`addressZip` varchar(20),
	`phone` varchar(50),
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `warehouses_id` PRIMARY KEY(`id`),
	CONSTRAINT `warehouses_code_unique` UNIQUE(`code`),
	CONSTRAINT `wh_code_idx` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `whatsappConfig` (
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
--> statement-breakpoint
CREATE TABLE `whatsappMessages` (
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
--> statement-breakpoint
CREATE TABLE `whatsappTemplates` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`label` varchar(100) NOT NULL,
	`body` text NOT NULL,
	`variables` text,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `whatsappTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wholesalePricingRules` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`productId` bigint unsigned NOT NULL,
	`minQuantity` int NOT NULL,
	`maxQuantity` int,
	`discountPercent` decimal(5,2) NOT NULL,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wholesalePricingRules_id` PRIMARY KEY(`id`),
	CONSTRAINT `wpr_product_min_idx` UNIQUE(`productId`,`minQuantity`)
);
--> statement-breakpoint
CREATE INDEX `ac_status_idx` ON `abandonedCarts` (`status`);--> statement-breakpoint
CREATE INDEX `ac_email_idx` ON `abandonedCarts` (`customerEmail`);--> statement-breakpoint
CREATE INDEX `ac_action_idx` ON `abandonedCarts` (`lastActionAt`);--> statement-breakpoint
CREATE INDEX `ap_supplier_idx` ON `accountsPayable` (`supplierId`);--> statement-breakpoint
CREATE INDEX `ap_status_idx` ON `accountsPayable` (`status`);--> statement-breakpoint
CREATE INDEX `ap_due_date_idx` ON `accountsPayable` (`dueDate`);--> statement-breakpoint
CREATE INDEX `ap_po_idx` ON `accountsPayable` (`purchaseOrderId`);--> statement-breakpoint
CREATE INDEX `ap_category_idx` ON `accountsPayable` (`categoryId`);--> statement-breakpoint
CREATE INDEX `ar_customer_idx` ON `accountsReceivable` (`customerId`);--> statement-breakpoint
CREATE INDEX `ar_status_idx` ON `accountsReceivable` (`status`);--> statement-breakpoint
CREATE INDEX `ar_due_date_idx` ON `accountsReceivable` (`dueDate`);--> statement-breakpoint
CREATE INDEX `ar_order_idx` ON `accountsReceivable` (`orderId`);--> statement-breakpoint
CREATE INDEX `ar_category_idx` ON `accountsReceivable` (`categoryId`);--> statement-breakpoint
CREATE INDEX `al_user_idx` ON `auditLogs` (`userId`);--> statement-breakpoint
CREATE INDEX `al_entity_idx` ON `auditLogs` (`entityType`,`entityId`);--> statement-breakpoint
CREATE INDEX `al_action_idx` ON `auditLogs` (`action`);--> statement-breakpoint
CREATE INDEX `al_created_idx` ON `auditLogs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `ba_active_idx` ON `bankAccounts` (`isActive`);--> statement-breakpoint
CREATE INDEX `bo_state_idx` ON `blingOAuth` (`state`);--> statement-breakpoint
CREATE INDEX `bo_active_idx` ON `blingOAuth` (`isActive`);--> statement-breakpoint
CREATE INDEX `cb_date_idx` ON `cashBook` (`date`);--> statement-breakpoint
CREATE INDEX `cb_type_idx` ON `cashBook` (`type`);--> statement-breakpoint
CREATE INDEX `cb_bank_idx` ON `cashBook` (`bankAccountId`);--> statement-breakpoint
CREATE INDEX `cb_ar_idx` ON `cashBook` (`accountsReceivableId`);--> statement-breakpoint
CREATE INDEX `cb_ap_idx` ON `cashBook` (`accountsPayableId`);--> statement-breakpoint
CREATE INDEX `cb_order_idx` ON `cashBook` (`orderId`);--> statement-breakpoint
CREATE INDEX `cfe_type_idx` ON `cashFlowEntries` (`type`);--> statement-breakpoint
CREATE INDEX `cfe_date_idx` ON `cashFlowEntries` (`entryDate`);--> statement-breakpoint
CREATE INDEX `cfe_category_idx` ON `cashFlowEntries` (`category`);--> statement-breakpoint
CREATE INDEX `cfe_source_idx` ON `cashFlowEntries` (`source`);--> statement-breakpoint
CREATE INDEX `comm_rep_idx` ON `commissions` (`salesRepId`);--> statement-breakpoint
CREATE INDEX `comm_order_idx` ON `commissions` (`orderId`);--> statement-breakpoint
CREATE INDEX `comm_status_idx` ON `commissions` (`status`);--> statement-breakpoint
CREATE INDEX `comm_created_idx` ON `commissions` (`createdAt`);--> statement-breakpoint
CREATE INDEX `cc_type_idx` ON `costCenters` (`type`);--> statement-breakpoint
CREATE INDEX `cust_doc_idx` ON `customers` (`document`);--> statement-breakpoint
CREATE INDEX `cust_city_idx` ON `customers` (`addressCity`);--> statement-breakpoint
CREATE INDEX `cust_state_idx` ON `customers` (`addressState`);--> statement-breakpoint
CREATE INDEX `cust_segment_idx` ON `customers` (`segment`);--> statement-breakpoint
CREATE INDEX `cust_wholesale_idx` ON `customers` (`isWholesale`);--> statement-breakpoint
CREATE INDEX `cust_vip_idx` ON `customers` (`isVip`);--> statement-breakpoint
CREATE INDEX `cust_social_idx` ON `customers` (`socialNetworkType`);--> statement-breakpoint
CREATE INDEX `nfl_order_idx` ON `nfeLog` (`orderId`);--> statement-breakpoint
CREATE INDEX `nfl_bling_idx` ON `nfeLog` (`blingNfeId`);--> statement-breakpoint
CREATE INDEX `nfl_status_idx` ON `nfeLog` (`status`);--> statement-breakpoint
CREATE INDEX `nfl_created_idx` ON `nfeLog` (`createdAt`);--> statement-breakpoint
CREATE INDEX `oi_order_idx` ON `orderItems` (`orderId`);--> statement-breakpoint
CREATE INDEX `oi_product_idx` ON `orderItems` (`productId`);--> statement-breakpoint
CREATE INDEX `oi_variation_idx` ON `orderItems` (`variationId`);--> statement-breakpoint
CREATE INDEX `ord_customer_idx` ON `orders` (`customerId`);--> statement-breakpoint
CREATE INDEX `ord_salesrep_idx` ON `orders` (`salesRepId`);--> statement-breakpoint
CREATE INDEX `ord_status_idx` ON `orders` (`status`);--> statement-breakpoint
CREATE INDEX `ord_payment_idx` ON `orders` (`paymentStatus`);--> statement-breakpoint
CREATE INDEX `ord_created_idx` ON `orders` (`createdAt`);--> statement-breakpoint
CREATE INDEX `ord_wholesale_idx` ON `orders` (`isWholesale`);--> statement-breakpoint
CREATE INDEX `pay_supplier_idx` ON `payables` (`supplierId`);--> statement-breakpoint
CREATE INDEX `pay_status_idx` ON `payables` (`status`);--> statement-breakpoint
CREATE INDEX `pay_due_idx` ON `payables` (`dueDate`);--> statement-breakpoint
CREATE INDEX `pay_origin_idx` ON `payables` (`origin`);--> statement-breakpoint
CREATE INDEX `pt_order_idx` ON `paymentTransactions` (`orderId`);--> statement-breakpoint
CREATE INDEX `pt_customer_idx` ON `paymentTransactions` (`customerId`);--> statement-breakpoint
CREATE INDEX `pt_status_idx` ON `paymentTransactions` (`status`);--> statement-breakpoint
CREATE INDEX `pt_gateway_idx` ON `paymentTransactions` (`gatewayTransactionId`);--> statement-breakpoint
CREATE INDEX `pt_type_idx` ON `paymentTransactions` (`type`);--> statement-breakpoint
CREATE INDEX `ph_product_idx` ON `priceHistory` (`productId`);--> statement-breakpoint
CREATE INDEX `ph_effective_idx` ON `priceHistory` (`effectiveDate`);--> statement-breakpoint
CREATE INDEX `pc_product_idx` ON `productColors` (`productId`);--> statement-breakpoint
CREATE INDEX `pm_product_idx` ON `productMovements` (`productId`);--> statement-breakpoint
CREATE INDEX `pm_type_idx` ON `productMovements` (`movementType`);--> statement-breakpoint
CREATE INDEX `pm_created_idx` ON `productMovements` (`createdAt`);--> statement-breakpoint
CREATE INDEX `pm_supplier_idx` ON `productMovements` (`supplierId`);--> statement-breakpoint
CREATE INDEX `var_product_idx` ON `productVariations` (`productId`);--> statement-breakpoint
CREATE INDEX `var_stock_idx` ON `productVariations` (`stockQuantity`);--> statement-breakpoint
CREATE INDEX `var_active_idx` ON `productVariations` (`isActive`);--> statement-breakpoint
CREATE INDEX `prod_cat_idx` ON `products` (`categoryId`);--> statement-breakpoint
CREATE INDEX `prod_subcat_idx` ON `products` (`subcategoryId`);--> statement-breakpoint
CREATE INDEX `prod_supplier_idx` ON `products` (`supplierId`);--> statement-breakpoint
CREATE INDEX `prod_active_idx` ON `products` (`isActive`);--> statement-breakpoint
CREATE INDEX `poi_po_idx` ON `purchaseOrderItems` (`purchaseOrderId`);--> statement-breakpoint
CREATE INDEX `poi_product_idx` ON `purchaseOrderItems` (`productId`);--> statement-breakpoint
CREATE INDEX `po_supplier_idx` ON `purchaseOrders` (`supplierId`);--> statement-breakpoint
CREATE INDEX `po_status_idx` ON `purchaseOrders` (`status`);--> statement-breakpoint
CREATE INDEX `po_date_idx` ON `purchaseOrders` (`expectedDeliveryDate`);--> statement-breakpoint
CREATE INDEX `rec_order_idx` ON `receivables` (`orderId`);--> statement-breakpoint
CREATE INDEX `rec_status_idx` ON `receivables` (`status`);--> statement-breakpoint
CREATE INDEX `rec_due_idx` ON `receivables` (`dueDate`);--> statement-breakpoint
CREATE INDEX `rec_customer_idx` ON `receivables` (`customerId`);--> statement-breakpoint
CREATE INDEX `sr_order_idx` ON `saleReceipts` (`orderId`);--> statement-breakpoint
CREATE INDEX `sr_number_idx` ON `saleReceipts` (`receiptNumber`);--> statement-breakpoint
CREATE INDEX `sr_created_idx` ON `saleReceipts` (`createdAt`);--> statement-breakpoint
CREATE INDEX `sr_ai_idx` ON `salesReps` (`isAiAgent`);--> statement-breakpoint
CREATE INDEX `sq_order_idx` ON `shippingQuotes` (`orderId`);--> statement-breakpoint
CREATE INDEX `sq_zip_idx` ON `shippingQuotes` (`zipCode`);--> statement-breakpoint
CREATE INDEX `sa_product_idx` ON `stockAlerts` (`productId`);--> statement-breakpoint
CREATE INDEX `sa_type_idx` ON `stockAlerts` (`alertType`);--> statement-breakpoint
CREATE INDEX `sa_status_idx` ON `stockAlerts` (`status`);--> statement-breakpoint
CREATE INDEX `sa_created_idx` ON `stockAlerts` (`createdAt`);--> statement-breakpoint
CREATE INDEX `sm_variation_idx` ON `stockMovements` (`variationId`);--> statement-breakpoint
CREATE INDEX `sm_warehouse_idx` ON `stockMovements` (`warehouseId`);--> statement-breakpoint
CREATE INDEX `sm_type_idx` ON `stockMovements` (`type`);--> statement-breakpoint
CREATE INDEX `sm_purchase_idx` ON `stockMovements` (`purchaseOrderId`);--> statement-breakpoint
CREATE INDEX `sm_order_idx` ON `stockMovements` (`orderId`);--> statement-breakpoint
CREATE INDEX `sm_created_idx` ON `stockMovements` (`createdAt`);--> statement-breakpoint
CREATE INDEX `subcat_cat_idx` ON `subcategories` (`categoryId`);--> statement-breakpoint
CREATE INDEX `sba_supplier_idx` ON `supplierBankAccounts` (`supplierId`);--> statement-breakpoint
CREATE INDEX `sc_supplier_idx` ON `supplierContacts` (`supplierId`);--> statement-breakpoint
CREATE INDEX `sup_doc_idx` ON `suppliers` (`document`);--> statement-breakpoint
CREATE INDEX `sup_type_idx` ON `suppliers` (`type`);--> statement-breakpoint
CREATE INDEX `sup_status_idx` ON `suppliers` (`status`);--> statement-breakpoint
CREATE INDEX `sup_informal_idx` ON `suppliers` (`isInformal`);--> statement-breakpoint
CREATE INDEX `wm_phone_idx` ON `whatsappMessages` (`phoneNumber`);--> statement-breakpoint
CREATE INDEX `wm_status_idx` ON `whatsappMessages` (`status`);--> statement-breakpoint
CREATE INDEX `wm_event_idx` ON `whatsappMessages` (`eventType`);--> statement-breakpoint
CREATE INDEX `wm_order_idx` ON `whatsappMessages` (`relatedOrderId`);--> statement-breakpoint
CREATE INDEX `wm_created_idx` ON `whatsappMessages` (`createdAt`);--> statement-breakpoint
CREATE INDEX `wpr_product_idx` ON `wholesalePricingRules` (`productId`);--> statement-breakpoint
CREATE INDEX `wpr_active_idx` ON `wholesalePricingRules` (`isActive`);
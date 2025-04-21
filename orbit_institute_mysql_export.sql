-- MySQL Export for Orbit Institute System
-- Generated: 2025-04-21T22:22:52.644Z

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET FOREIGN_KEY_CHECKS = 0;
SET time_zone = "+00:00";

-- Table structure for table `certificates`

DROP TABLE IF EXISTS `certificates`;
CREATE TABLE `certificates` (
  `id` int AUTO_INCREMENT NOT NULL,
  `certificate_number` text NOT NULL,
  `student_id` int NOT NULL,
  `course_id` int NOT NULL,
  `issue_date` datetime NOT NULL DEFAULT 'now()',
  `issued_by` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT 'now()',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `invoices`

DROP TABLE IF EXISTS `invoices`;
CREATE TABLE `invoices` (
  `id` int AUTO_INCREMENT NOT NULL,
  `invoice_number` text NOT NULL,
  `student_id` int NOT NULL,
  `amount` varchar(255) NOT NULL,
  `payment_mode` text NOT NULL,
  `transaction_id` text,
  `payment_date` datetime NOT NULL DEFAULT 'now()',
  `status` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT 'now()',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `invoices`

INSERT INTO `invoices` (`id`, `invoice_number`, `student_id`, `amount`, `payment_mode`, `transaction_id`, `payment_date`, `status`, `created_at`) VALUES
(1, '24/08/001', 3, '1865', 'Cash', '', '2025-04-21 10:18:53', 'pending', '2025-04-21 10:18:53'),
(2, '24/08/002', 4, '1015', 'Cash', '', '2025-04-21 10:18:53', 'pending', '2025-04-21 10:18:53'),
(3, '24/08/003', 5, '508', 'Cash', '', '2025-04-21 10:18:53', 'pending', '2025-04-21 10:18:53'),
(4, '24/08/004', 21, '1641', 'Cash', '', '2025-04-21 10:18:53', 'pending', '2025-04-21 10:18:53'),
(5, '24/08/005', 22, '1784', 'Cash', '', '2025-04-21 10:18:53', 'pending', '2025-04-21 10:18:53'),
(6, '24/08/006', 23, '555', 'Cash', '', '2025-04-21 10:18:53', 'pending', '2025-04-21 10:18:53'),
(7, '24/08/007', 24, '1774', 'Cash', '', '2025-04-21 10:18:53', 'pending', '2025-04-21 10:18:53'),
(8, '24/08/008', 25, '531', 'Cash', '', '2025-04-21 10:18:53', 'pending', '2025-04-21 10:18:53'),
(9, '24/08/009', 26, '1708', 'Cash', '', '2025-04-21 10:18:53', 'pending', '2025-04-21 10:18:53'),
(10, '24/08/010', 27, '1156', 'Cash', '', '2025-04-21 10:18:53', 'pending', '2025-04-21 10:18:53');

-- Table structure for table `quotations`

DROP TABLE IF EXISTS `quotations`;
CREATE TABLE `quotations` (
  `id` int AUTO_INCREMENT NOT NULL,
  `quotation_number` text NOT NULL,
  `company_name` text NOT NULL,
  `contact_person` text NOT NULL,
  `email` text NOT NULL,
  `phone` text NOT NULL,
  `course_id` int NOT NULL,
  `participants` int NOT NULL,
  `total_amount` varchar(255) NOT NULL,
  `discount` varchar(255) DEFAULT ''0'::numeric',
  `final_amount` varchar(255) NOT NULL,
  `validity` date NOT NULL,
  `status` text NOT NULL DEFAULT ''pending'::text',
  `created_by` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT 'now()',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `schedules`

DROP TABLE IF EXISTS `schedules`;
CREATE TABLE `schedules` (
  `id` int AUTO_INCREMENT NOT NULL,
  `title` text NOT NULL,
  `course_id` int NOT NULL,
  `trainer_id` int NOT NULL,
  `student_ids` text NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `status` text NOT NULL DEFAULT ''confirmed'::text',
  `created_by` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT 'now()',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `users`

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int AUTO_INCREMENT NOT NULL,
  `username` text NOT NULL,
  `password` text NOT NULL,
  `role` text NOT NULL DEFAULT ''counselor'::text',
  `full_name` text NOT NULL,
  `email` text,
  `phone` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `users`

INSERT INTO `users` (`id`, `username`, `password`, `role`, `full_name`, `email`, `phone`) VALUES
(1, 'admin', '6a12e6179119bfb9b6fb6742bd9a3840b5b0a3ce1b3794787df96905475f2adca3a9eb44573bcd35aa8088f72e52c3ec62a74d721d5383ece588712a499af95c.7de728943829a0b714eb821b8e80cc0f', 'admin', 'Admin User', 'admin@orbitinstitute.com', '+971 123456789'),
(2, 'superadmin', 'c8130dfeeae120bb8a53f88258bfb842bec1f02528433c9201ef6da0342a137d5635f8217a87440065a4ef39035ef68342e9dbc64df288f9a6f2a1a4d4ced7f8.446e5d11dce9bb5a8dc999f68d0f47e8', 'superadmin', 'Super Admin', 'superadmin@orbitinstitute.com', '+971 987654321');

-- Table structure for table `trainers`

DROP TABLE IF EXISTS `trainers`;
CREATE TABLE `trainers` (
  `id` int AUTO_INCREMENT NOT NULL,
  `full_name` text NOT NULL,
  `email` text NOT NULL,
  `phone` text NOT NULL,
  `specialization` text NOT NULL,
  `courses` text NOT NULL,
  `availability` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT 'now()',
  `profile_pdf` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `trainers`

INSERT INTO `trainers` (`id`, `full_name`, `email`, `phone`, `specialization`, `courses`, `availability`, `created_at`, `profile_pdf`) VALUES
(1, 'Ahmed Hassan', 'ahmed.hassan@orbitinstitute.com', '+971 50 123 4567', 'AutoCAD & BIM Specialist', 'AutoCAD, Revit Architecture', 'Weekdays 9am-5pm, Weekends upon request', '2025-04-15 22:32:58', NULL),
(2, 'Sarah Khan', 'sarah.khan@orbitinstitute.com', '+971 55 987 6543', '3D Modeling Expert', '3DS Max, Maya, Blender', 'Evenings and Weekends', '2025-04-15 22:32:58', NULL),
(3, 'Mohammed Al-Farsi', 'mohammed.alfarsi@orbitinstitute.com', '+971 52 456 7890', 'Project Management Specialist', 'Primavera P6, MS Project', 'Weekdays 10am-7pm', '2025-04-15 22:32:58', NULL),
(4, 'Fatima Ahmed', 'fatima.ahmed@orbitinstitute.com', '+971 54 789 0123', 'Interior Design & Visualization', 'AutoCAD, 3DS Max, SketchUp', 'Flexible schedule', '2025-04-15 22:32:58', NULL);

-- Table structure for table `session`

DROP TABLE IF EXISTS `session`;
CREATE TABLE `session` (
  `sid` varchar(255) NOT NULL,
  `sess` json NOT NULL,
  `expire` datetime NOT NULL,
  PRIMARY KEY (`sid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `session`

INSERT INTO `session` (`sid`, `sess`, `expire`) VALUES
('m963mxLHx5avXtsVicyLjHQup4SxIn61', '{"cookie":{"originalMaxAge":86400000,"expires":"2025-04-18T17:56:40.341Z","httpOnly":true,"path":"/"},"passport":{"user":1}}', '2025-04-18 17:56:41'),
('Q8n6vT9wkBZhuneU692Gil34rXXNn6m6', '{"cookie":{"originalMaxAge":86400000,"expires":"2025-04-18T20:28:34.312Z","httpOnly":true,"path":"/"},"passport":{"user":2}}', '2025-04-18 20:35:49'),
('3K7C_5gKg3KCpSsYeiQNqqUpu9gQ8SPU', '{"cookie":{"originalMaxAge":86400000,"expires":"2025-04-19T07:28:12.078Z","httpOnly":true,"path":"/"},"passport":{"user":2}}', '2025-04-19 07:28:33'),
('oI39mEcSfuJXbSXlS7uCmp3WYnbTf7M0', '{"cookie":{"originalMaxAge":86400000,"expires":"2025-04-18T18:04:23.189Z","httpOnly":true,"path":"/"},"passport":{"user":2}}', '2025-04-19 03:22:42');

-- Table structure for table `titan_email_settings`

DROP TABLE IF EXISTS `titan_email_settings`;
CREATE TABLE `titan_email_settings` (
  `id` int AUTO_INCREMENT NOT NULL,
  `api_key` text,
  `api_secret` text,
  `sender_name` text NOT NULL,
  `sender_email` text NOT NULL,
  `reply_to_email` text,
  `enabled` tinyint(1) DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT 'now()',
  `updated_at` datetime NOT NULL DEFAULT 'now()',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `email_templates`

DROP TABLE IF EXISTS `email_templates`;
CREATE TABLE `email_templates` (
  `id` int AUTO_INCREMENT NOT NULL,
  `name` text NOT NULL,
  `subject` text NOT NULL,
  `body_text` text,
  `body_html` text NOT NULL,
  `category` text NOT NULL DEFAULT ''general'::text',
  `variables` text,
  `is_default` tinyint(1) DEFAULT '0',
  `created_by` int,
  `created_at` datetime NOT NULL DEFAULT 'now()',
  `updated_at` datetime NOT NULL DEFAULT 'now()',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `email_history`

DROP TABLE IF EXISTS `email_history`;
CREATE TABLE `email_history` (
  `id` int AUTO_INCREMENT NOT NULL,
  `status` text NOT NULL DEFAULT ''draft'::text',
  `subject` text NOT NULL,
  `recipient_email` text NOT NULL,
  `student_id` int,
  `lead_id` int,
  `template_id` int,
  `body_text` text,
  `body_html` text,
  `sent_at` datetime,
  `sent_by` int,
  `error_message` text,
  `titan_message_id` text,
  `created_at` datetime NOT NULL DEFAULT 'now()',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `leads`

DROP TABLE IF EXISTS `leads`;
CREATE TABLE `leads` (
  `id` int AUTO_INCREMENT NOT NULL,
  `full_name` text NOT NULL,
  `email` text,
  `phone` text NOT NULL,
  `whatsapp_number` text,
  `consultant_id` int NOT NULL,
  `source` text NOT NULL,
  `interested_courses` text NOT NULL,
  `status` text NOT NULL DEFAULT ''New'::text',
  `priority` text NOT NULL DEFAULT ''Medium'::text',
  `followup_status` text DEFAULT ''Pending'::text',
  `notes` text,
  `meeting_date` datetime,
  `assigned_to` int,
  `last_contact_date` datetime,
  `next_follow_up_date` datetime,
  `next_follow_up_time` text,
  `created_by` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT 'now()',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `campaigns`

DROP TABLE IF EXISTS `campaigns`;
CREATE TABLE `campaigns` (
  `id` int AUTO_INCREMENT NOT NULL,
  `name` text NOT NULL,
  `description` text,
  `platform` text NOT NULL,
  `ad_account` text,
  `ad_campaign_id` text,
  `target_audience` text,
  `start_date` datetime NOT NULL,
  `end_date` datetime,
  `budget` varchar(255),
  `status` text NOT NULL,
  `results` text,
  `conversions` int DEFAULT '0',
  `impressions` int DEFAULT '0',
  `clicks` int DEFAULT '0',
  `cost_per_lead` varchar(255),
  `created_by` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT 'now()',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `follow_ups`

DROP TABLE IF EXISTS `follow_ups`;
CREATE TABLE `follow_ups` (
  `id` int AUTO_INCREMENT NOT NULL,
  `lead_id` int NOT NULL,
  `contact_date` datetime NOT NULL,
  `contact_time` text,
  `contact_type` text NOT NULL,
  `notes` text,
  `outcome` text,
  `next_follow_up` datetime,
  `next_follow_up_time` text,
  `priority` text NOT NULL DEFAULT ''Medium'::text',
  `status` text NOT NULL DEFAULT ''Pending'::text',
  `is_notified` tinyint(1) DEFAULT '0',
  `created_by` int NOT NULL,
  `consultant_id` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT 'now()',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `proposals`

DROP TABLE IF EXISTS `proposals`;
CREATE TABLE `proposals` (
  `id` int AUTO_INCREMENT NOT NULL,
  `proposal_number` text NOT NULL,
  `company_name` text NOT NULL,
  `contact_person` text NOT NULL,
  `email` text NOT NULL,
  `phone` text NOT NULL,
  `course_ids` text NOT NULL,
  `total_amount` varchar(255) NOT NULL,
  `discount` varchar(255) DEFAULT ''0'::numeric',
  `final_amount` varchar(255) NOT NULL,
  `cover_page` text,
  `content` text,
  `status` text NOT NULL DEFAULT ''draft'::text',
  `created_by` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT 'now()',
  `company_profile_filename` text,
  `company_profile_mime_type` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `registration_courses`

DROP TABLE IF EXISTS `registration_courses`;
CREATE TABLE `registration_courses` (
  `id` int AUTO_INCREMENT NOT NULL,
  `student_id` int NOT NULL,
  `course_id` int NOT NULL,
  `price` varchar(255) NOT NULL,
  `discount` varchar(255) DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT 'now()',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `registration_courses`

INSERT INTO `registration_courses` (`id`, `student_id`, `course_id`, `price`, `discount`, `created_at`) VALUES
(1, 3, 2, '4500', '25', '2025-04-21 10:18:52'),
(2, 4, 3, '6000', '20', '2025-04-21 10:18:52'),
(3, 5, 4, '3500', '20', '2025-04-21 10:18:52'),
(4, 21, 1, '1000', '20', '2025-04-21 10:18:52'),
(5, 22, 6, '0', '20', '2025-04-21 10:18:52'),
(6, 23, 7, '0', '23', '2025-04-21 10:18:52'),
(7, 24, 8, '0', '28', '2025-04-21 10:18:52'),
(8, 25, 9, '0', '12', '2025-04-21 10:18:52'),
(9, 26, 10, '0', '45', '2025-04-21 10:18:53'),
(10, 27, 11, '0', '35', '2025-04-21 10:18:53');

-- Table structure for table `user_sessions`

DROP TABLE IF EXISTS `user_sessions`;
CREATE TABLE `user_sessions` (
  `sid` varchar(255) NOT NULL,
  `sess` json NOT NULL,
  `expire` datetime NOT NULL,
  PRIMARY KEY (`sid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `user_sessions`

INSERT INTO `user_sessions` (`sid`, `sess`, `expire`) VALUES
('3G_hSXJBM1HciYyQtGnwXYNzPGJvv6NL', '{"cookie":{"originalMaxAge":86400000,"expires":"2025-04-22T14:08:56.583Z","httpOnly":true,"path":"/"},"passport":{"user":2}}', '2025-04-22 14:23:02'),
('XccvP9KA-bDD9FiqUH2vf0jc2zDdmP5O', '{"cookie":{"originalMaxAge":86400000,"expires":"2025-04-22T06:30:22.887Z","httpOnly":true,"path":"/"},"passport":{"user":2}}', '2025-04-22 21:22:15'),
('1Pko5j8K5OnbnSfzeUv1Iwqi2xT9AnOE', '{"cookie":{"originalMaxAge":86400000,"expires":"2025-04-22T09:37:05.235Z","httpOnly":true,"path":"/"},"passport":{"user":1}}', '2025-04-22 16:31:42'),
('mfzsapANhKVFg6UWBev2ZKqFsPpn9FLm', '{"cookie":{"originalMaxAge":86400000,"expires":"2025-04-22T06:56:44.931Z","httpOnly":true,"path":"/"},"passport":{"user":1}}', '2025-04-22 22:22:32');

-- Table structure for table `students`

DROP TABLE IF EXISTS `students`;
CREATE TABLE `students` (
  `id` int AUTO_INCREMENT NOT NULL,
  `student_id` text NOT NULL,
  `full_name` text NOT NULL,
  `father_name` text NOT NULL,
  `email` text NOT NULL,
  `phone` text NOT NULL,
  `dob` date NOT NULL,
  `gender` text NOT NULL,
  `address` text NOT NULL,
  `course_id` int NOT NULL,
  `batch` text NOT NULL,
  `registration_date` datetime NOT NULL DEFAULT 'now()',
  `course_fee` varchar(255) NOT NULL,
  `discount` varchar(255) DEFAULT ''0'::numeric',
  `total_fee` varchar(255) NOT NULL,
  `initial_payment` varchar(255) NOT NULL,
  `balance_due` varchar(255) NOT NULL,
  `payment_mode` text NOT NULL,
  `payment_status` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT 'now()',
  `registration_number` text,
  `first_name` text,
  `last_name` text,
  `phone_no` text,
  `alternative_no` text,
  `date_of_birth` date,
  `passport_no` text,
  `uid_no` text,
  `emirates_id_no` text,
  `nationality` text,
  `education` text,
  `country` text,
  `company_or_university_name` text,
  `class_type` text,
  `created_by` int,
  `signature_data` text,
  `terms_accepted` tinyint(1) DEFAULT '0',
  `signature_date` datetime,
  `register_link` text,
  `register_link_expiry` datetime,
  `register_link_discount` varchar(255) DEFAULT '0',
  `emirates` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `students`

INSERT INTO `students` (`id`, `student_id`, `full_name`, `father_name`, `email`, `phone`, `dob`, `gender`, `address`, `course_id`, `batch`, `registration_date`, `course_fee`, `discount`, `total_fee`, `initial_payment`, `balance_due`, `payment_mode`, `payment_status`, `created_at`, `registration_number`, `first_name`, `last_name`, `phone_no`, `alternative_no`, `date_of_birth`, `passport_no`, `uid_no`, `emirates_id_no`, `nationality`, `education`, `country`, `company_or_university_name`, `class_type`, `created_by`, `signature_data`, `terms_accepted`, `signature_date`, `register_link`, `register_link_expiry`, `register_link_discount`, `emirates`) VALUES
(3, 'ST-2023-001', 'Ahmed Al-Mansoori', 'Mohammed Al-Mansoori', 'ahmed.almansoori@example.com', '+971501234567', '1995-03-15 00:00:00', 'Male', 'Villa 23, Al Wasl Road, Dubai', 1, 'Batch 2023', '2025-04-20 13:35:45', '1000', '0', '1000', '500', '500', 'Cash', 'Partial', '2025-04-20 13:35:45', 'ORB-2023-001', 'Ahmed', 'Al-Mansoori', '+971501234567', NULL, '1995-03-15 00:00:00', NULL, NULL, NULL, 'Emirati', NULL, NULL, NULL, 'offline', 2, NULL, 0, NULL, NULL, NULL, '0', NULL),
(4, 'ST-2023-002', 'Fatima Khan', 'Abdul Khan', 'fatima.khan@example.com', '+971502345678', '1998-07-22 00:00:00', 'Female', 'Apartment 405, Al Nahda 2, Dubai', 2, 'Batch 2023', '2025-04-20 13:35:45', '4500', '0', '4500', '4500', '0', 'Card', 'Paid', '2025-04-20 13:35:45', 'ORB-2023-002', 'Fatima', 'Khan', '+971502345678', NULL, '1998-07-22 00:00:00', NULL, NULL, NULL, 'Pakistani', NULL, NULL, NULL, 'online', 2, NULL, 0, NULL, NULL, NULL, '0', NULL),
(5, 'ST-2023-003', 'John Smith', 'David Smith', 'john.smith@example.com', '+971503456789', '1990-11-10 00:00:00', 'Male', 'Apartment 12, Dubai Marina', 3, 'Batch 2023', '2025-04-20 13:35:45', '6000', '0', '6000', '3000', '3000', 'Card', 'Partial', '2025-04-20 13:35:45', 'ORB-2023-003', 'John', 'Smith', '+971503456789', NULL, '1990-11-10 00:00:00', NULL, NULL, NULL, 'British', NULL, NULL, NULL, 'private', 2, NULL, 0, NULL, NULL, NULL, '0', NULL),
(31, 'STU-2025-017', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:32', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:32', 'OT/24/011', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(32, 'STU-2025-019', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:32', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:32', 'OT/24/012', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(33, 'STU-2025-025', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:32', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:32', 'OT/24/013', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(34, 'STU-2025-026', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:32', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:32', 'OT/24/014', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(35, 'STU-2025-027', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:32', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:32', 'OT/24/015', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(36, 'STU-2025-028', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:32', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:32', 'OT/24/016', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(37, 'STU-2025-029', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:32', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:32', 'OT/24/017', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(38, 'STU-2025-030', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:32', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:32', 'OT/24/018', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(39, 'STU-2025-031', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:32', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:32', 'OT/24/019', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(40, 'STU-2025-033', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:32', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:32', 'OT/24/020', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(41, 'STU-2025-035', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:32', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:32', 'OT/24/021', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(42, 'STU-2025-037', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:32', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:32', 'OC/24/001', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(43, 'STU-2025-041', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:32', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:32', 'OT/24/022', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(44, 'STU-2025-042', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:32', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:32', 'OT/24/023', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(45, 'STU-2025-043', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:32', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:32', 'OT/24/024', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(46, 'STU-2025-044', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:33', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:33', 'OT/24/025', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(47, 'STU-2025-045', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:33', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:33', 'OT/24/026', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(48, 'STU-2025-046', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:33', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:33', 'OT/24/027', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(49, 'STU-2025-047', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:33', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:33', 'OT/24/028', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(50, 'STU-2025-048', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:33', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:33', 'OT/24/029', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(51, 'STU-2025-082', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:33', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:33', 'OC/24/004', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(52, 'STU-2025-083', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:33', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:33', 'OT/24/030', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(53, 'STU-2025-084', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:33', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:33', 'OT/24/031', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(54, 'STU-2025-085', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:33', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:33', 'OT/24/032', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(28, 'STU-2025-012', 'Ahmed Al Mansouri', 'Not Provided', 'ahmed.almansouri@example.com', '+971501234008', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:31', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:31', 'OT/24/001', 'Ahmed', 'Al Mansouri', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(29, 'STU-2025-015', 'Noura Al Qasimi', 'Not Provided', 'noura.alqasimi@example.com', '+971501234009', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:31', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:31', 'OT/24/009', 'Noura', 'Al Qasimi', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(30, 'STU-2025-016', 'Hamad Al Nahyan', 'Not Provided', 'hamad.alnahyan@example.com', '+971501234010', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:32', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:32', 'OT/24/010', 'Hamad', 'Al Nahyan', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(55, 'STU-2025-086', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:33', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:33', 'OT/24/033', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(56, 'STU-2025-087', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:33', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:33', 'OT/24/034', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(57, 'STU-2025-088', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:33', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:33', 'OT/24/035', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(58, 'STU-2025-089', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:33', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:33', 'OT/24/036', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(59, 'STU-2025-090', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:33', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:33', 'OT/24/037', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(60, 'STU-2025-091', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:33', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:33', 'OT/24/038', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(61, 'STU-2025-092', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:33', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:33', 'OT/24/039', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(62, 'STU-2025-093', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:33', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:33', 'OT/24/040', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(63, 'STU-2025-094', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:34', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:34', 'OT/24/041', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(64, 'STU-2025-095', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:34', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:34', 'OT/24/042', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(65, 'STU-2025-096', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:34', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:34', 'OT/24/043', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(66, 'STU-2025-097', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:34', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:34', 'OT/24/044', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(67, 'STU-2025-098', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:34', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:34', 'OT/24/045', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(68, 'STU-2025-099', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:34', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:34', 'OT/24/046', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(69, 'STU-2025-100', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:34', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:34', 'OT/24/047', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(70, 'STU-2025-101', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:34', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:34', 'OT/24/048', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(71, 'STU-2025-102', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:34', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:34', 'OT/24/049', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(72, 'STU-2025-103', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:34', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:34', 'OT/24/050', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(73, 'STU-2025-104', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:34', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:34', 'OT/24/051', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(74, 'STU-2025-105', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:34', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:34', 'OT/24/052', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(75, 'STU-2025-106', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:34', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:34', 'OT/24/053', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(76, 'STU-2025-107', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:34', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:34', 'OT/24/054', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(77, 'STU-2025-108', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:34', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:34', 'OT/24/055', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(78, 'STU-2025-110', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:34', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:34', 'OT/24/056', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(79, 'STU-2025-111', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:34', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:34', 'OT/24/057', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(80, 'STU-2025-112', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:34', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:34', 'OT/24/058', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(81, 'STU-2025-113', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:35', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:35', 'OT/24/059', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(82, 'STU-2025-114', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:35', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:35', 'OT/24/060', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(83, 'STU-2025-115', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:35', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:35', 'OT/24/061', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(84, 'STU-2025-116', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:35', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:35', 'OT/24/062', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(85, 'STU-2025-117', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:35', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:35', 'OT/24/063', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(86, 'STU-2025-120', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:35', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:35', 'OT/24/064', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(87, 'STU-2025-121', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:35', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:35', 'OT/24/065', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(88, 'STU-2025-122', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:35', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:35', 'OT/24/066', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(89, 'STU-2025-124', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:35', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:35', 'OT/24/067', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(90, 'STU-2025-125', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:35', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:35', 'OT/24/068', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(91, 'STU-2025-126', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:35', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:35', 'OT/24/069', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(92, 'STU-2025-127', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:35', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:35', 'OT/24/070', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(93, 'STU-2025-128', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:35', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:35', 'OT/24/071', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(94, 'STU-2025-129', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:35', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:35', 'OT/24/072', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(95, 'STU-2025-130', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:35', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:35', 'OT/24/073', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(96, 'STU-2025-131', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:35', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:35', 'OT/24/074', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(97, 'STU-2025-132', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:35', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:35', 'OT/24/075', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(98, 'STU-2025-133', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:36', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:36', 'OT/24/076', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(99, 'STU-2025-134', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:36', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:36', 'OC/24/005', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(100, 'STU-2025-135', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:36', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:36', 'OT/24/077', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(101, 'STU-2025-136', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:36', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:36', 'OT/24/078', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(102, 'STU-2025-137', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:36', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:36', 'OT/24/079', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(103, 'STU-2025-138', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:36', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:36', 'OT/24/080', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(104, 'STU-2025-139', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:36', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:36', 'OT/24/081', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(105, 'STU-2025-140', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:36', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:36', 'OT/24/082', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(106, 'STU-2025-141', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:36', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:36', 'OT/24/083', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(107, 'STU-2025-142', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:36', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:36', 'OT/24/084', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(108, 'STU-2025-143', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:36', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:36', 'OT/24/085', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(109, 'STU-2025-144', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:36', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:36', 'OT/24/086', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(110, 'STU-2025-145', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:36', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:36', 'OT/24/087', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(111, 'STU-2025-146', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:36', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:36', 'OT/24/088', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(112, 'STU-2025-147', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:36', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:36', 'OT/24/089', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(113, 'STU-2025-149', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:36', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:36', 'OT/24/090', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(114, 'STU-2025-150', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:36', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:36', 'OT/24/091', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(115, 'STU-2025-151', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:36', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:36', 'OT/24/092', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(116, 'STU-2025-152', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:37', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:37', 'OT/24/093', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(117, 'STU-2025-153', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:37', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:37', 'OT/24/094', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(118, 'STU-2025-154', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:37', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:37', 'OT/24/095', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(119, 'STU-2025-155', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:37', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:37', 'OT/24/096', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(120, 'STU-2025-156', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:37', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:37', 'OT/24/097', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(121, 'STU-2025-157', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:37', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:37', 'OT/24/098', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(122, 'STU-2025-158', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:37', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:37', 'OT/24/099', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(123, 'STU-2025-159', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:37', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:37', 'OT/24/100', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(124, 'STU-2025-160', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:37', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:37', 'OT/24/101', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL);

INSERT INTO `students` (`id`, `student_id`, `full_name`, `father_name`, `email`, `phone`, `dob`, `gender`, `address`, `course_id`, `batch`, `registration_date`, `course_fee`, `discount`, `total_fee`, `initial_payment`, `balance_due`, `payment_mode`, `payment_status`, `created_at`, `registration_number`, `first_name`, `last_name`, `phone_no`, `alternative_no`, `date_of_birth`, `passport_no`, `uid_no`, `emirates_id_no`, `nationality`, `education`, `country`, `company_or_university_name`, `class_type`, `created_by`, `signature_data`, `terms_accepted`, `signature_date`, `register_link`, `register_link_expiry`, `register_link_discount`, `emirates`) VALUES
(125, 'STU-2025-161', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:37', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:37', 'OT/24/102', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(126, 'STU-2025-162', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:37', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:37', 'OT/24/103', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(127, 'STU-2025-163', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:37', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:37', 'OT/24/104', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(128, 'STU-2025-164', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:49', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:49', 'OT/24/105', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(129, 'STU-2025-165', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:49', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:49', 'OT/24/106', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(130, 'STU-2025-166', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:49', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:49', 'OT/24/107', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(131, 'STU-2025-167', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:49', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:49', 'OT/24/108', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(132, 'STU-2025-168', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:49', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:49', 'OT/24/109', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(133, 'STU-2025-169', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:49', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:49', 'OT/24/110', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(134, 'STU-2025-170', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:49', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:49', 'OT/24/111', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(135, 'STU-2025-171', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:49', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:49', 'OT/24/112', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(136, 'STU-2025-172', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:50', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:50', 'OT/24/113', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(137, 'STU-2025-173', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:50', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:50', 'OT/24/114', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(138, 'STU-2025-174', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:50', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:50', 'OT/24/115', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(139, 'STU-2025-175', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:50', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:50', 'OT/24/116', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(140, 'STU-2025-176', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:50', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:50', 'OT/24/117', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(141, 'STU-2025-177', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:50', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:50', 'OT/24/118', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(142, 'STU-2025-178', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:50', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:50', 'OT/24/119', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(143, 'STU-2025-179', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:50', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:50', 'OT/24/120', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(144, 'STU-2025-180', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:50', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:50', 'OT/24/121', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(145, 'STU-2025-181', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:50', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:50', 'OT/24/122', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(146, 'STU-2025-185', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:50', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:50', 'OT/24/124', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(147, 'STU-2025-186', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:50', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:50', 'OT/24/125', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(148, 'STU-2025-187', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:50', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:50', 'OT/24/126', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(149, 'STU-2025-188', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:50', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:50', 'OT/24/127', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(150, 'STU-2025-189', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:50', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:50', 'OT/24/128', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(151, 'STU-2025-193', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:50', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:50', 'OT/24/129', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(152, 'STU-2025-194', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:50', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:50', 'OT/24/130', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(153, 'STU-2025-195', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:51', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:51', 'OT/24/131', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(154, 'STU-2025-196', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:51', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:51', 'OT/24/132', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(155, 'STU-2025-197', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:51', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:51', 'OT/24/133', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(156, 'STU-2025-198', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:51', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:51', 'OT/24/134', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(157, 'STU-2025-199', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:51', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:51', 'OT/24/135', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(158, 'STU-2025-200', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:51', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:51', 'OT/24/136', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(159, 'STU-2025-201', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:51', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:51', 'OT/24/137', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(160, 'STU-2025-202', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:51', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:51', 'OT/24/138', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(161, 'STU-2025-203', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:51', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:51', 'OT/24/139', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(162, 'STU-2025-204', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:51', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:51', 'OT/24/140', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(163, 'STU-2025-206', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:51', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:51', 'OT/24/142', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(164, 'STU-2025-207', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:51', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:51', 'OT/25/001', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(165, 'STU-2025-208', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:51', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:51', 'OT/25/002', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(166, 'STU-2025-209', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:51', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:51', 'OT/25/003', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(167, 'STU-2025-210', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:51', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:51', 'OT/25/004', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(168, 'STU-2025-211', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:51', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:51', 'OT/25/005', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(169, 'STU-2025-212', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:51', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:51', 'OT/25/006', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(170, 'STU-2025-213', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:52', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:52', 'OT/25/007', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(171, 'STU-2025-214', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:52', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:52', 'OT/25/008', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(172, 'STU-2025-215', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:52', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:52', 'OT/25/009', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(173, 'STU-2025-216', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:52', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:52', 'OT/25/010', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(174, 'STU-2025-217', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:52', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:52', 'OT/25/011', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(175, 'STU-2025-218', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:52', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:52', 'OT/25/012', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(176, 'STU-2025-219', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:52', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:52', 'OT/25/013', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(177, 'STU-2025-220', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:52', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:52', 'OT/25/014', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(178, 'STU-2025-221', 'Imported Student', 'Not Provided', '', '', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:52', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:52', 'OT/25/015', '', '', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(21, 'STU-2025-004', 'Mohammed Al Hashmi', 'Not Provided', 'mohammed.alhashmi@example.com', '+971501234001', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:31', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:31', 'OT/24/002', 'Mohammed', 'Al Hashmi', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(22, 'STU-2025-005', 'Aisha Abdullah', 'Not Provided', 'aisha.abdullah@example.com', '+971501234002', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:31', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:31', 'OT/24/003', 'Aisha', 'Abdullah', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(23, 'STU-2025-006', 'Omar Al Nuaimi', 'Not Provided', 'omar.alnuaimi@example.com', '+971501234003', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:31', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:31', 'OT/24/004', 'Omar', 'Al Nuaimi', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(24, 'STU-2025-007', 'Fatima Al Shamsi', 'Not Provided', 'fatima.alshamsi@example.com', '+971501234004', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:31', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:31', 'OT/24/005', 'Fatima', 'Al Shamsi', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(25, 'STU-2025-008', 'Khalid Al Maktoum', 'Not Provided', 'khalid.almaktoum@example.com', '+971501234005', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:31', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:31', 'OT/24/006', 'Khalid', 'Al Maktoum', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(26, 'STU-2025-010', 'Mariam Al Falasi', 'Not Provided', 'mariam.alfalasi@example.com', '+971501234006', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:31', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:31', 'OT/24/007', 'Mariam', 'Al Falasi', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL),
(27, 'STU-2025-011', 'Saeed Al Zaabi', 'Not Provided', 'saeed.alzaabi@example.com', '+971501234007', '2000-01-01 00:00:00', 'Not Specified', '', 1, 'Regular', '2025-04-21 10:13:31', '0', '0', '0', '0', '0', 'Cash', 'pending', '2025-04-21 10:13:31', 'OT/24/008', 'Saeed', 'Al Zaabi', '', '', '2000-01-01 00:00:00', '', '', '', '', '', '', '', 'offline', NULL, NULL, 0, NULL, NULL, NULL, '0', NULL);

-- Table structure for table `courses`

DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
  `id` int AUTO_INCREMENT NOT NULL,
  `name` text NOT NULL,
  `description` text NOT NULL,
  `duration` text NOT NULL,
  `fee` varchar(255) NOT NULL,
  `content` text,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT 'now()',
  `online_rate` varchar(255),
  `offline_rate` varchar(255),
  `private_rate` varchar(255),
  `batch_rate` varchar(255),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `courses`

INSERT INTO `courses` (`id`, `name`, `description`, `duration`, `fee`, `content`, `active`, `created_at`, `online_rate`, `offline_rate`, `private_rate`, `batch_rate`) VALUES
(2, 'Revit Architecture', 'Master Revit for architectural design and documentation', '8 weeks', '4500', 'Module 1: Introduction to BIM and Revit
Module 2: Basic Modeling and Editing
Module 3: Creating Building Elements
Module 4: Working with Views and Visibility
Module 5: Dimensioning and Annotation
Module 6: Creating Schedules and Quantity Takeoffs
Module 7: Documentation and Printing
Module 8: Collaboration and Coordination', 1, '2025-04-15 22:32:44', NULL, NULL, NULL, NULL),
(3, '3DS Max', 'Learn 3D modeling, animation, and rendering with 3DS Max', '10 weeks', '6000', 'Module 1: 3DS Max Interface
Module 2: 3D Modeling Basics
Module 3: Advanced Modeling Techniques
Module 4: Materials and Texturing
Module 5: Lighting Techniques
Module 6: Camera Setup and Animation
Module 7: Particle Systems and Effects
Module 8: Advanced Rendering
Module 9: Post-Production and Compositing
Module 10: Final Project', 1, '2025-04-15 22:32:44', NULL, NULL, NULL, NULL),
(4, 'Primavera P6', 'Professional project management software training', '6 weeks', '3500', 'Module 1: Introduction to Project Management
Module 2: Primavera P6 Interface
Module 3: Creating and Setting Up Projects
Module 4: Creating Project Schedules
Module 5: Resource Management
Module 6: Tracking and Analyzing Projects
Module 7: Reporting and Documentation
Module 8: Advanced Features and Tips', 1, '2025-04-15 22:32:44', NULL, NULL, NULL, NULL),
(1, 'AutoCAD', 'Complete AutoCAD training for beginners to advanced users', '12 weeks', '1000', 'Module 1: Introduction to AutoCAD
Module 2: 2D Drawing and Editing
Module 3: Working with Layers
Module 4: Advanced Drawing Techniques
Module 5: 3D Modeling Basics
Module 6: Advanced 3D Techniques
Module 7: Rendering and Visualization
Module 8: Working with External References
Module 9: Layouts and Printing
Module 10: AutoCAD Customization', 1, '2025-04-15 22:32:44', NULL, NULL, NULL, NULL),
(6, 'CCTV Course', 'Imported from legacy database: CCTV Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:29', '0', '0', '0', '0'),
(7, 'IOT Python Course', 'Imported from legacy database: IOT Python Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:29', '0', '0', '0', '0'),
(8, 'Data Science Course', 'Imported from legacy database: Data Science Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:29', '0', '0', '0', '0'),
(9, 'Data Analytics Course', 'Imported from legacy database: Data Analytics Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:29', '0', '0', '0', '0'),
(10, 'PPC Course', 'Imported from legacy database: PPC Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:29', '0', '0', '0', '0'),
(11, 'SMO Course', 'Imported from legacy database: SMO Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:29', '0', '0', '0', '0'),
(12, 'SEO Course', 'Imported from legacy database: SEO Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:29', '0', '0', '0', '0'),
(13, 'Digital Marketing 360 Course', 'Imported from legacy database: Digital Marketing 360 Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:29', '0', '0', '0', '0'),
(14, 'Digital Marketing Course', 'Imported from legacy database: Digital Marketing Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:29', '0', '0', '0', '0'),
(15, 'Microsoft Excel Advace Course', 'Imported from legacy database: Microsoft Excel Advace Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:29', '0', '0', '0', '0'),
(16, 'Microsoft Excel Course', 'Imported from legacy database: Microsoft Excel Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:29', '0', '0', '0', '0'),
(17, 'Microsoft Office Professional Course', 'Imported from legacy database: Microsoft Office Professional Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:29', '0', '0', '0', '0'),
(18, 'Microsoft Office Basic Course', 'Imported from legacy database: Microsoft Office Basic Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:30', '0', '0', '0', '0'),
(19, 'Python Course', 'Imported from legacy database: Python Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:30', '0', '0', '0', '0'),
(20, '''Back End (Python', 'Imported from legacy database: ''Back End (Python', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:30', '0', '0', '0', '0'),
(21, '''Front End (React', 'Imported from legacy database: ''Front End (React', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:30', '0', '0', '0', '0'),
(22, '''Back End (php', 'Imported from legacy database: ''Back End (php', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:30', '0', '0', '0', '0'),
(23, '''Front End (HTML', 'Imported from legacy database: ''Front End (HTML', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:30', '0', '0', '0', '0'),
(24, 'php Development Course', 'Imported from legacy database: php Development Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:30', '0', '0', '0', '0'),
(25, 'CCNP Course', 'Imported from legacy database: CCNP Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:30', '0', '0', '0', '0'),
(26, 'CCNA Course', 'Imported from legacy database: CCNA Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:30', '0', '0', '0', '0'),
(27, 'Robotics Course', 'Imported from legacy database: Robotics Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:30', '0', '0', '0', '0'),
(28, 'Dialux Course', 'Imported from legacy database: Dialux Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:30', '0', '0', '0', '0'),
(29, 'Solar Technician Course', 'Imported from legacy database: Solar Technician Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:30', '0', '0', '0', '0'),
(30, 'Solar Simulation Course', 'Imported from legacy database: Solar Simulation Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:30', '0', '0', '0', '0'),
(31, 'Solar Pro Simulation Course', 'Imported from legacy database: Solar Pro Simulation Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:30', '0', '0', '0', '0'),
(32, 'Solar Professional Course', 'Imported from legacy database: Solar Professional Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:30', '0', '0', '0', '0'),
(33, 'Canva Course', 'Imported from legacy database: Canva Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:30', '0', '0', '0', '0'),
(34, 'After Effect Course', 'Imported from legacy database: After Effect Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:30', '0', '0', '0', '0'),
(35, 'Permier Pro Course', 'Imported from legacy database: Permier Pro Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:31', '0', '0', '0', '0'),
(36, '''Video Editing (PP+AE', 'Imported from legacy database: ''Video Editing (PP+AE', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:31', '0', '0', '0', '0'),
(37, '''Graphic Design (AI+PS+XD', 'Imported from legacy database: ''Graphic Design (AI+PS+XD', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:31', '0', '0', '0', '0'),
(38, '''Graphic Design (AI+PS+ID', 'Imported from legacy database: ''Graphic Design (AI+PS+ID', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:31', '0', '0', '0', '0'),
(39, '''Graphic Design (AI+PS', 'Imported from legacy database: ''Graphic Design (AI+PS', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:31', '0', '0', '0', '0'),
(40, 'Microsoft Project Course', 'Imported from legacy database: Microsoft Project Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:31', '0', '0', '0', '0'),
(41, 'Primavera P6 Course', 'Imported from legacy database: Primavera P6 Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:31', '0', '0', '0', '0'),
(42, 'Tekla Structure Course', 'Imported from legacy database: Tekla Structure Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:31', '0', '0', '0', '0'),
(43, 'STAAD Pro Course', 'Imported from legacy database: STAAD Pro Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:31', '0', '0', '0', '0'),
(44, 'Fusion 360 Course', 'Imported from legacy database: Fusion 360 Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:31', '0', '0', '0', '0'),
(45, 'Invetor Course', 'Imported from legacy database: Invetor Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:31', '0', '0', '0', '0'),
(46, 'Solidworks Course', 'Imported from legacy database: Solidworks Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:31', '0', '0', '0', '0'),
(47, 'Lumion Course', 'Imported from legacy database: Lumion Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:31', '0', '0', '0', '0'),
(48, 'Vray Course', 'Imported from legacy database: Vray Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:31', '0', '0', '0', '0'),
(49, '3DS Max Course', 'Imported from legacy database: 3DS Max Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:31', '0', '0', '0', '0'),
(50, 'Rhino Course', 'Imported from legacy database: Rhino Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:31', '0', '0', '0', '0'),
(51, 'Navisworks Course', 'Imported from legacy database: Navisworks Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:31', '0', '0', '0', '0'),
(52, 'Revit BIM Course', 'Imported from legacy database: Revit BIM Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:32', '0', '0', '0', '0'),
(53, 'Revit Infrastructure Course', 'Imported from legacy database: Revit Infrastructure Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:32', '0', '0', '0', '0'),
(54, 'Revit MEP Course', 'Imported from legacy database: Revit MEP Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:32', '0', '0', '0', '0'),
(55, 'AutoCAD Civil 3D Course', 'Imported from legacy database: AutoCAD Civil 3D Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:32', '0', '0', '0', '0'),
(56, 'AutoCAD Electrical Course', 'Imported from legacy database: AutoCAD Electrical Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:32', '0', '0', '0', '0'),
(57, 'Revit Structure Course', 'Imported from legacy database: Revit Structure Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:32', '0', '0', '0', '0'),
(58, 'Revit Architecture Course', 'Imported from legacy database: Revit Architecture Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:32', '0', '0', '0', '0'),
(59, 'AutoCAD Course', 'Imported from legacy database: AutoCAD Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:32', '0', '0', '0', '0'),
(60, 'Full Stack Web Development', 'Imported from legacy database: Full Stack Web Development', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:32', '0', '0', '0', '0'),
(61, 'C++', 'Imported from legacy database: C++', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:32', '0', '0', '0', '0'),
(62, 'Wordpress Full Stack Web Development', 'Imported from legacy database: Wordpress Full Stack Web Development', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:32', '0', '0', '0', '0'),
(63, 'Interior Designing', 'Imported from legacy database: Interior Designing', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:32', '0', '0', '0', '0'),
(64, 'Sketch Up', 'Imported from legacy database: Sketch Up', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:32', '0', '0', '0', '0'),
(65, 'AUTOCAD 2D MEP', 'Imported from legacy database: AUTOCAD 2D MEP', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:32', '0', '0', '0', '0'),
(66, 'React.js Course In-house', 'Imported from legacy database: React.js Course In-house', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:32', '0', '0', '0', '0'),
(67, 'React.js Course External', 'Imported from legacy database: React.js Course External', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:32', '0', '0', '0', '0'),
(68, 'BIM 360', 'Imported from legacy database: BIM 360', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:32', '0', '0', '0', '0'),
(69, 'Dialox', 'Imported from legacy database: Dialox', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:33', '0', '0', '0', '0'),
(70, 'Creo Parametric', 'Imported from legacy database: Creo Parametric', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:33', '0', '0', '0', '0'),
(71, 'Corona', 'Imported from legacy database: Corona', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:33', '0', '0', '0', '0'),
(72, '''Interior Design ( 1 year', 'Imported from legacy database: ''Interior Design ( 1 year', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:33', '0', '0', '0', '0'),
(73, 'Microsoft 365 Course', 'Imported from legacy database: Microsoft 365 Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:33', '0', '0', '0', '0'),
(74, 'Outlook Course', 'Imported from legacy database: Outlook Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:33', '0', '0', '0', '0'),
(75, '''Interior Design ( 4Months', 'Imported from legacy database: ''Interior Design ( 4Months', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:33', '0', '0', '0', '0'),
(76, '3DsMax & Vray', 'Imported from legacy database: 3DsMax & Vray', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:33', '0', '0', '0', '0'),
(77, 'Photoshop', 'Imported from legacy database: Photoshop', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:33', '0', '0', '0', '0'),
(78, 'Adobe InDesign', 'Imported from legacy database: Adobe InDesign', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:33', '0', '0', '0', '0'),
(79, 'Arduino Essential', 'Imported from legacy database: Arduino Essential', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:33', '0', '0', '0', '0'),
(80, 'Mern Web Development', 'Imported from legacy database: Mern Web Development', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:33', '0', '0', '0', '0'),
(81, 'E-commerce', 'Imported from legacy database: E-commerce', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:33', '0', '0', '0', '0'),
(82, 'Solar PV Syst', 'Imported from legacy database: Solar PV Syst', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:33', '0', '0', '0', '0'),
(83, 'Illustrator', 'Imported from legacy database: Illustrator', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:33', '0', '0', '0', '0'),
(84, 'Revit Course', 'Imported from legacy database: Revit Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:33', '0', '0', '0', '0'),
(85, 'Data Server', 'Imported from legacy database: Data Server', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:33', '0', '0', '0', '0'),
(86, 'Mep Estimation', 'Imported from legacy database: Mep Estimation', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:33', '0', '0', '0', '0'),
(87, 'Financial Excel Course', 'Imported from legacy database: Financial Excel Course', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:34', '0', '0', '0', '0'),
(88, '''Revit Architecture ( Basic', 'Imported from legacy database: ''Revit Architecture ( Basic', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:34', '0', '0', '0', '0'),
(89, '''Revit Architecture ( Advance', 'Imported from legacy database: ''Revit Architecture ( Advance', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:34', '0', '0', '0', '0'),
(90, '''Revit Structure ( Basic', 'Imported from legacy database: ''Revit Structure ( Basic', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:34', '0', '0', '0', '0'),
(91, '''Revit Structure ( Advance', 'Imported from legacy database: ''Revit Structure ( Advance', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:34', '0', '0', '0', '0'),
(92, '''Revit MEP ( Basic', 'Imported from legacy database: ''Revit MEP ( Basic', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:34', '0', '0', '0', '0'),
(93, '''Revit MEP ( Advance', 'Imported from legacy database: ''Revit MEP ( Advance', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:34', '0', '0', '0', '0'),
(94, 'ARC-GIS', 'Imported from legacy database: ARC-GIS', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:34', '0', '0', '0', '0'),
(95, 'ESRI ARC GIS Training', 'Imported from legacy database: ESRI ARC GIS Training', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:34', '0', '0', '0', '0'),
(96, 'BIM Coordinator', 'Imported from legacy database: BIM Coordinator', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:34', '0', '0', '0', '0'),
(97, '''Interior Design ( 6 Months', 'Imported from legacy database: ''Interior Design ( 6 Months', '30 days', '0', '{"code":"","modules":[]}', 1, '2025-04-21 10:08:34', '0', '0', '0', '0');

SET FOREIGN_KEY_CHECKS = 1;

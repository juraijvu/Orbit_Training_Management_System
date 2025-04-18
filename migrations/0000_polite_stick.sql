CREATE TABLE "campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"platform" text NOT NULL,
	"ad_account" text,
	"ad_campaign_id" text,
	"target_audience" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"budget" numeric,
	"status" text NOT NULL,
	"results" text,
	"conversions" integer DEFAULT 0,
	"impressions" integer DEFAULT 0,
	"clicks" integer DEFAULT 0,
	"cost_per_lead" numeric,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "canned_responses" (
	"id" serial PRIMARY KEY NOT NULL,
	"consultant_id" integer NOT NULL,
	"shortcut" text NOT NULL,
	"message" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certificates" (
	"id" serial PRIMARY KEY NOT NULL,
	"certificate_number" text NOT NULL,
	"student_id" integer NOT NULL,
	"course_id" integer NOT NULL,
	"issue_date" timestamp DEFAULT now() NOT NULL,
	"issued_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "certificates_certificate_number_unique" UNIQUE("certificate_number")
);
--> statement-breakpoint
CREATE TABLE "chatbot_actions" (
	"id" serial PRIMARY KEY NOT NULL,
	"node_id" integer NOT NULL,
	"action_type" text NOT NULL,
	"action_data" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chatbot_conditions" (
	"id" serial PRIMARY KEY NOT NULL,
	"node_id" integer NOT NULL,
	"condition_type" text NOT NULL,
	"variable" text NOT NULL,
	"value" text NOT NULL,
	"next_node_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chatbot_flows" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"consultant_id" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"is_default" boolean DEFAULT false,
	"trigger_keywords" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chatbot_nodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"flow_id" integer NOT NULL,
	"node_type" text NOT NULL,
	"content" text NOT NULL,
	"response_type" text DEFAULT 'text',
	"response_options" text,
	"position" integer NOT NULL,
	"next_node_id" integer,
	"wait_for_input" boolean DEFAULT false,
	"variable_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chatbot_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"chat_id" integer NOT NULL,
	"flow_id" integer NOT NULL,
	"current_node_id" integer,
	"session_data" text,
	"is_active" boolean DEFAULT true,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"last_interaction_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"duration" text NOT NULL,
	"fee" numeric NOT NULL,
	"content" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "courses_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "email_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_id" integer,
	"subject" text NOT NULL,
	"body_text" text,
	"body_html" text,
	"recipient_email" text NOT NULL,
	"recipient_name" text,
	"sender_id" integer,
	"status" text NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"lead_id" integer,
	"student_id" integer,
	"titan_message_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"subject" text NOT NULL,
	"body_text" text NOT NULL,
	"body_html" text NOT NULL,
	"is_default" boolean DEFAULT false,
	"category" text NOT NULL,
	"variables" text[],
	"created_by" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "follow_ups" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer NOT NULL,
	"contact_date" timestamp NOT NULL,
	"contact_time" text,
	"contact_type" text NOT NULL,
	"notes" text,
	"outcome" text,
	"next_follow_up" timestamp,
	"next_follow_up_time" text,
	"priority" text DEFAULT 'Medium' NOT NULL,
	"status" text DEFAULT 'Pending' NOT NULL,
	"is_notified" boolean DEFAULT false,
	"created_by" integer NOT NULL,
	"consultant_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_number" text NOT NULL,
	"student_id" integer NOT NULL,
	"amount" numeric NOT NULL,
	"payment_mode" text NOT NULL,
	"transaction_id" text,
	"payment_date" timestamp DEFAULT now() NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"email" text,
	"phone" text NOT NULL,
	"whatsapp_number" text,
	"consultant_id" integer NOT NULL,
	"source" text NOT NULL,
	"interested_courses" text NOT NULL,
	"status" text DEFAULT 'New' NOT NULL,
	"priority" text DEFAULT 'Medium' NOT NULL,
	"followup_status" text DEFAULT 'Pending',
	"notes" text,
	"meeting_date" timestamp,
	"assigned_to" integer,
	"last_contact_date" timestamp,
	"next_follow_up_date" timestamp,
	"next_follow_up_time" text,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proposals" (
	"id" serial PRIMARY KEY NOT NULL,
	"proposal_number" text NOT NULL,
	"company_name" text NOT NULL,
	"contact_person" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"course_ids" text NOT NULL,
	"trainer_id" integer,
	"total_amount" numeric NOT NULL,
	"discount" numeric DEFAULT '0',
	"final_amount" numeric NOT NULL,
	"cover_page" text,
	"content" text,
	"company_profile" text,
	"company_profile_filename" text,
	"company_profile_mime_type" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "proposals_proposal_number_unique" UNIQUE("proposal_number")
);
--> statement-breakpoint
CREATE TABLE "quotations" (
	"id" serial PRIMARY KEY NOT NULL,
	"quotation_number" text NOT NULL,
	"company_name" text NOT NULL,
	"contact_person" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"course_id" integer NOT NULL,
	"participants" integer NOT NULL,
	"total_amount" numeric NOT NULL,
	"discount" numeric DEFAULT '0',
	"final_amount" numeric NOT NULL,
	"validity" date NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "quotations_quotation_number_unique" UNIQUE("quotation_number")
);
--> statement-breakpoint
CREATE TABLE "schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"course_id" integer NOT NULL,
	"trainer_id" integer NOT NULL,
	"student_ids" text NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"status" text DEFAULT 'confirmed' NOT NULL,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"full_name" text NOT NULL,
	"father_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"dob" date NOT NULL,
	"gender" text NOT NULL,
	"address" text NOT NULL,
	"course_id" integer NOT NULL,
	"batch" text NOT NULL,
	"registration_date" timestamp DEFAULT now() NOT NULL,
	"course_fee" numeric NOT NULL,
	"discount" numeric DEFAULT '0',
	"total_fee" numeric NOT NULL,
	"initial_payment" numeric NOT NULL,
	"balance_due" numeric NOT NULL,
	"payment_mode" text NOT NULL,
	"payment_status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "students_student_id_unique" UNIQUE("student_id")
);
--> statement-breakpoint
CREATE TABLE "titan_email_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_name" text,
	"sender_name" text NOT NULL,
	"sender_email" text NOT NULL,
	"email_password" text,
	"reply_to_email" text,
	"imap_server" text,
	"imap_port" integer,
	"imap_security" text,
	"imap_username" text,
	"imap_password" text,
	"smtp_server" text,
	"smtp_port" integer,
	"smtp_security" text,
	"smtp_username" text,
	"smtp_password" text,
	"smtp_auth_required" boolean DEFAULT true,
	"api_key" text,
	"api_secret" text,
	"connection_timeout" integer DEFAULT 30,
	"enabled" boolean DEFAULT false,
	"use_api" boolean DEFAULT true,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trainers" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"specialization" text NOT NULL,
	"courses" text NOT NULL,
	"availability" text NOT NULL,
	"profile_pdf" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"role" text DEFAULT 'counselor' NOT NULL,
	"full_name" text NOT NULL,
	"email" text,
	"phone" text,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "whatsapp_chats" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer NOT NULL,
	"phone_number" text NOT NULL,
	"consultant_id" integer,
	"last_message_time" timestamp DEFAULT now() NOT NULL,
	"unread_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "whatsapp_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"chat_id" integer NOT NULL,
	"message_id" text,
	"content" text NOT NULL,
	"media_url" text,
	"media_type" text,
	"direction" text NOT NULL,
	"status" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"sent_by" integer,
	"is_template_message" boolean DEFAULT false,
	"template_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "whatsapp_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"api_key" text NOT NULL,
	"phone_number_id" text NOT NULL,
	"business_account_id" text NOT NULL,
	"access_token" text NOT NULL,
	"webhook_verify_token" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "whatsapp_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"content" text NOT NULL,
	"type" text NOT NULL,
	"variables" text,
	"is_active" boolean DEFAULT true,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "whatsapp_templates_name_unique" UNIQUE("name")
);

--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8
-- Dumped by pg_dump version 16.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: campaigns; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.campaigns (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    platform text NOT NULL,
    ad_account text,
    ad_campaign_id text,
    target_audience text,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone,
    budget numeric,
    status text NOT NULL,
    results text,
    conversions integer DEFAULT 0,
    impressions integer DEFAULT 0,
    clicks integer DEFAULT 0,
    cost_per_lead numeric,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.campaigns OWNER TO neondb_owner;

--
-- Name: campaigns_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.campaigns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.campaigns_id_seq OWNER TO neondb_owner;

--
-- Name: campaigns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.campaigns_id_seq OWNED BY public.campaigns.id;


--
-- Name: certificates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.certificates (
    id integer NOT NULL,
    certificate_number text NOT NULL,
    student_id integer NOT NULL,
    course_id integer NOT NULL,
    issue_date timestamp without time zone DEFAULT now() NOT NULL,
    issued_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.certificates OWNER TO neondb_owner;

--
-- Name: certificates_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.certificates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.certificates_id_seq OWNER TO neondb_owner;

--
-- Name: certificates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.certificates_id_seq OWNED BY public.certificates.id;


--
-- Name: courses; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.courses (
    id integer NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    duration text NOT NULL,
    fee numeric NOT NULL,
    content text,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.courses OWNER TO neondb_owner;

--
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.courses_id_seq OWNER TO neondb_owner;

--
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;


--
-- Name: email_history; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.email_history (
    id integer NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    subject text NOT NULL,
    recipient_email text NOT NULL,
    student_id integer,
    lead_id integer,
    template_id integer,
    body_text text,
    body_html text,
    sent_at timestamp without time zone,
    sent_by integer,
    error_message text,
    titan_message_id text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.email_history OWNER TO neondb_owner;

--
-- Name: email_history_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.email_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.email_history_id_seq OWNER TO neondb_owner;

--
-- Name: email_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.email_history_id_seq OWNED BY public.email_history.id;


--
-- Name: email_templates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.email_templates (
    id integer NOT NULL,
    name text NOT NULL,
    subject text NOT NULL,
    body_text text,
    body_html text NOT NULL,
    category text DEFAULT 'general'::text NOT NULL,
    variables text,
    is_default boolean DEFAULT false,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.email_templates OWNER TO neondb_owner;

--
-- Name: email_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.email_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.email_templates_id_seq OWNER TO neondb_owner;

--
-- Name: email_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.email_templates_id_seq OWNED BY public.email_templates.id;


--
-- Name: follow_ups; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.follow_ups (
    id integer NOT NULL,
    lead_id integer NOT NULL,
    contact_date timestamp without time zone NOT NULL,
    contact_time text,
    contact_type text NOT NULL,
    notes text,
    outcome text,
    next_follow_up timestamp without time zone,
    next_follow_up_time text,
    priority text DEFAULT 'Medium'::text NOT NULL,
    status text DEFAULT 'Pending'::text NOT NULL,
    is_notified boolean DEFAULT false,
    created_by integer NOT NULL,
    consultant_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.follow_ups OWNER TO neondb_owner;

--
-- Name: follow_ups_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.follow_ups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.follow_ups_id_seq OWNER TO neondb_owner;

--
-- Name: follow_ups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.follow_ups_id_seq OWNED BY public.follow_ups.id;


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.invoices (
    id integer NOT NULL,
    invoice_number text NOT NULL,
    student_id integer NOT NULL,
    amount numeric NOT NULL,
    payment_mode text NOT NULL,
    transaction_id text,
    payment_date timestamp without time zone DEFAULT now() NOT NULL,
    status text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.invoices OWNER TO neondb_owner;

--
-- Name: invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.invoices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.invoices_id_seq OWNER TO neondb_owner;

--
-- Name: invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.invoices_id_seq OWNED BY public.invoices.id;


--
-- Name: leads; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.leads (
    id integer NOT NULL,
    full_name text NOT NULL,
    email text,
    phone text NOT NULL,
    whatsapp_number text,
    consultant_id integer NOT NULL,
    source text NOT NULL,
    interested_courses text NOT NULL,
    status text DEFAULT 'New'::text NOT NULL,
    priority text DEFAULT 'Medium'::text NOT NULL,
    followup_status text DEFAULT 'Pending'::text,
    notes text,
    meeting_date timestamp without time zone,
    assigned_to integer,
    last_contact_date timestamp without time zone,
    next_follow_up_date timestamp without time zone,
    next_follow_up_time text,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.leads OWNER TO neondb_owner;

--
-- Name: leads_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.leads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.leads_id_seq OWNER TO neondb_owner;

--
-- Name: leads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.leads_id_seq OWNED BY public.leads.id;


--
-- Name: proposals; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.proposals (
    id integer NOT NULL,
    proposal_number text NOT NULL,
    company_name text NOT NULL,
    contact_person text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    course_ids text NOT NULL,
    total_amount numeric NOT NULL,
    discount numeric DEFAULT '0'::numeric,
    final_amount numeric NOT NULL,
    cover_page text,
    content text,
    status text DEFAULT 'draft'::text NOT NULL,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    company_profile_filename text,
    company_profile_mime_type text
);


ALTER TABLE public.proposals OWNER TO neondb_owner;

--
-- Name: proposals_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.proposals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.proposals_id_seq OWNER TO neondb_owner;

--
-- Name: proposals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.proposals_id_seq OWNED BY public.proposals.id;


--
-- Name: quotations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.quotations (
    id integer NOT NULL,
    quotation_number text NOT NULL,
    company_name text NOT NULL,
    contact_person text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    course_id integer NOT NULL,
    participants integer NOT NULL,
    total_amount numeric NOT NULL,
    discount numeric DEFAULT '0'::numeric,
    final_amount numeric NOT NULL,
    validity date NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.quotations OWNER TO neondb_owner;

--
-- Name: quotations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.quotations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quotations_id_seq OWNER TO neondb_owner;

--
-- Name: quotations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.quotations_id_seq OWNED BY public.quotations.id;


--
-- Name: schedules; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.schedules (
    id integer NOT NULL,
    title text NOT NULL,
    course_id integer NOT NULL,
    trainer_id integer NOT NULL,
    student_ids text NOT NULL,
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone NOT NULL,
    status text DEFAULT 'confirmed'::text NOT NULL,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.schedules OWNER TO neondb_owner;

--
-- Name: schedules_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.schedules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.schedules_id_seq OWNER TO neondb_owner;

--
-- Name: schedules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.schedules_id_seq OWNED BY public.schedules.id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO neondb_owner;

--
-- Name: students; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.students (
    id integer NOT NULL,
    student_id text NOT NULL,
    full_name text NOT NULL,
    father_name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    dob date NOT NULL,
    gender text NOT NULL,
    address text NOT NULL,
    course_id integer NOT NULL,
    batch text NOT NULL,
    registration_date timestamp without time zone DEFAULT now() NOT NULL,
    course_fee numeric NOT NULL,
    discount numeric DEFAULT '0'::numeric,
    total_fee numeric NOT NULL,
    initial_payment numeric NOT NULL,
    balance_due numeric NOT NULL,
    payment_mode text NOT NULL,
    payment_status text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.students OWNER TO neondb_owner;

--
-- Name: students_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.students_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.students_id_seq OWNER TO neondb_owner;

--
-- Name: students_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.students_id_seq OWNED BY public.students.id;


--
-- Name: titan_email_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.titan_email_settings (
    id integer NOT NULL,
    api_key text,
    api_secret text,
    sender_name text NOT NULL,
    sender_email text NOT NULL,
    reply_to_email text,
    enabled boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.titan_email_settings OWNER TO neondb_owner;

--
-- Name: titan_email_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.titan_email_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.titan_email_settings_id_seq OWNER TO neondb_owner;

--
-- Name: titan_email_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.titan_email_settings_id_seq OWNED BY public.titan_email_settings.id;


--
-- Name: trainers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.trainers (
    id integer NOT NULL,
    full_name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    specialization text NOT NULL,
    courses text NOT NULL,
    availability text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    profile_pdf text
);


ALTER TABLE public.trainers OWNER TO neondb_owner;

--
-- Name: trainers_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.trainers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trainers_id_seq OWNER TO neondb_owner;

--
-- Name: trainers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.trainers_id_seq OWNED BY public.trainers.id;


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_sessions (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.user_sessions OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    role text DEFAULT 'counselor'::text NOT NULL,
    full_name text NOT NULL,
    email text,
    phone text
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: campaigns id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.campaigns ALTER COLUMN id SET DEFAULT nextval('public.campaigns_id_seq'::regclass);


--
-- Name: certificates id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.certificates ALTER COLUMN id SET DEFAULT nextval('public.certificates_id_seq'::regclass);


--
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);


--
-- Name: email_history id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_history ALTER COLUMN id SET DEFAULT nextval('public.email_history_id_seq'::regclass);


--
-- Name: email_templates id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_templates ALTER COLUMN id SET DEFAULT nextval('public.email_templates_id_seq'::regclass);


--
-- Name: follow_ups id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.follow_ups ALTER COLUMN id SET DEFAULT nextval('public.follow_ups_id_seq'::regclass);


--
-- Name: invoices id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices ALTER COLUMN id SET DEFAULT nextval('public.invoices_id_seq'::regclass);


--
-- Name: leads id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.leads ALTER COLUMN id SET DEFAULT nextval('public.leads_id_seq'::regclass);


--
-- Name: proposals id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.proposals ALTER COLUMN id SET DEFAULT nextval('public.proposals_id_seq'::regclass);


--
-- Name: quotations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quotations ALTER COLUMN id SET DEFAULT nextval('public.quotations_id_seq'::regclass);


--
-- Name: schedules id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.schedules ALTER COLUMN id SET DEFAULT nextval('public.schedules_id_seq'::regclass);


--
-- Name: students id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.students ALTER COLUMN id SET DEFAULT nextval('public.students_id_seq'::regclass);


--
-- Name: titan_email_settings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.titan_email_settings ALTER COLUMN id SET DEFAULT nextval('public.titan_email_settings_id_seq'::regclass);


--
-- Name: trainers id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.trainers ALTER COLUMN id SET DEFAULT nextval('public.trainers_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: campaigns; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.campaigns (id, name, description, platform, ad_account, ad_campaign_id, target_audience, start_date, end_date, budget, status, results, conversions, impressions, clicks, cost_per_lead, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: certificates; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.certificates (id, certificate_number, student_id, course_id, issue_date, issued_by, created_at) FROM stdin;
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.courses (id, name, description, duration, fee, content, active, created_at) FROM stdin;
1	AutoCAD	Complete AutoCAD training for beginners to advanced users	12 weeks	5000	Module 1: Introduction to AutoCAD\nModule 2: 2D Drawing and Editing\nModule 3: Working with Layers\nModule 4: Advanced Drawing Techniques\nModule 5: 3D Modeling Basics\nModule 6: Advanced 3D Techniques\nModule 7: Rendering and Visualization\nModule 8: Working with External References\nModule 9: Layouts and Printing\nModule 10: AutoCAD Customization	t	2025-04-15 22:32:44.52224
2	Revit Architecture	Master Revit for architectural design and documentation	8 weeks	4500	Module 1: Introduction to BIM and Revit\nModule 2: Basic Modeling and Editing\nModule 3: Creating Building Elements\nModule 4: Working with Views and Visibility\nModule 5: Dimensioning and Annotation\nModule 6: Creating Schedules and Quantity Takeoffs\nModule 7: Documentation and Printing\nModule 8: Collaboration and Coordination	t	2025-04-15 22:32:44.52224
3	3DS Max	Learn 3D modeling, animation, and rendering with 3DS Max	10 weeks	6000	Module 1: 3DS Max Interface\nModule 2: 3D Modeling Basics\nModule 3: Advanced Modeling Techniques\nModule 4: Materials and Texturing\nModule 5: Lighting Techniques\nModule 6: Camera Setup and Animation\nModule 7: Particle Systems and Effects\nModule 8: Advanced Rendering\nModule 9: Post-Production and Compositing\nModule 10: Final Project	t	2025-04-15 22:32:44.52224
4	Primavera P6	Professional project management software training	6 weeks	3500	Module 1: Introduction to Project Management\nModule 2: Primavera P6 Interface\nModule 3: Creating and Setting Up Projects\nModule 4: Creating Project Schedules\nModule 5: Resource Management\nModule 6: Tracking and Analyzing Projects\nModule 7: Reporting and Documentation\nModule 8: Advanced Features and Tips	t	2025-04-15 22:32:44.52224
\.


--
-- Data for Name: email_history; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.email_history (id, status, subject, recipient_email, student_id, lead_id, template_id, body_text, body_html, sent_at, sent_by, error_message, titan_message_id, created_at) FROM stdin;
\.


--
-- Data for Name: email_templates; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.email_templates (id, name, subject, body_text, body_html, category, variables, is_default, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: follow_ups; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.follow_ups (id, lead_id, contact_date, contact_time, contact_type, notes, outcome, next_follow_up, next_follow_up_time, priority, status, is_notified, created_by, consultant_id, created_at) FROM stdin;
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.invoices (id, invoice_number, student_id, amount, payment_mode, transaction_id, payment_date, status, created_at) FROM stdin;
\.


--
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.leads (id, full_name, email, phone, whatsapp_number, consultant_id, source, interested_courses, status, priority, followup_status, notes, meeting_date, assigned_to, last_contact_date, next_follow_up_date, next_follow_up_time, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: proposals; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.proposals (id, proposal_number, company_name, contact_person, email, phone, course_ids, total_amount, discount, final_amount, cover_page, content, status, created_by, created_at, company_profile_filename, company_profile_mime_type) FROM stdin;
\.


--
-- Data for Name: quotations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.quotations (id, quotation_number, company_name, contact_person, email, phone, course_id, participants, total_amount, discount, final_amount, validity, status, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: schedules; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.schedules (id, title, course_id, trainer_id, student_ids, start_time, end_time, status, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.session (sid, sess, expire) FROM stdin;
m963mxLHx5avXtsVicyLjHQup4SxIn61	{"cookie":{"originalMaxAge":86400000,"expires":"2025-04-18T17:56:40.341Z","httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-04-18 17:56:41
Q8n6vT9wkBZhuneU692Gil34rXXNn6m6	{"cookie":{"originalMaxAge":86400000,"expires":"2025-04-18T20:28:34.312Z","httpOnly":true,"path":"/"},"passport":{"user":2}}	2025-04-18 20:35:49
3K7C_5gKg3KCpSsYeiQNqqUpu9gQ8SPU	{"cookie":{"originalMaxAge":86400000,"expires":"2025-04-19T07:28:12.078Z","httpOnly":true,"path":"/"},"passport":{"user":2}}	2025-04-19 07:28:33
oI39mEcSfuJXbSXlS7uCmp3WYnbTf7M0	{"cookie":{"originalMaxAge":86400000,"expires":"2025-04-18T18:04:23.189Z","httpOnly":true,"path":"/"},"passport":{"user":2}}	2025-04-19 03:22:42
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.students (id, student_id, full_name, father_name, email, phone, dob, gender, address, course_id, batch, registration_date, course_fee, discount, total_fee, initial_payment, balance_due, payment_mode, payment_status, created_at) FROM stdin;
\.


--
-- Data for Name: titan_email_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.titan_email_settings (id, api_key, api_secret, sender_name, sender_email, reply_to_email, enabled, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: trainers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.trainers (id, full_name, email, phone, specialization, courses, availability, created_at, profile_pdf) FROM stdin;
1	Ahmed Hassan	ahmed.hassan@orbitinstitute.com	+971 50 123 4567	AutoCAD & BIM Specialist	AutoCAD, Revit Architecture	Weekdays 9am-5pm, Weekends upon request	2025-04-15 22:32:58.144958	\N
2	Sarah Khan	sarah.khan@orbitinstitute.com	+971 55 987 6543	3D Modeling Expert	3DS Max, Maya, Blender	Evenings and Weekends	2025-04-15 22:32:58.144958	\N
3	Mohammed Al-Farsi	mohammed.alfarsi@orbitinstitute.com	+971 52 456 7890	Project Management Specialist	Primavera P6, MS Project	Weekdays 10am-7pm	2025-04-15 22:32:58.144958	\N
4	Fatima Ahmed	fatima.ahmed@orbitinstitute.com	+971 54 789 0123	Interior Design & Visualization	AutoCAD, 3DS Max, SketchUp	Flexible schedule	2025-04-15 22:32:58.144958	\N
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_sessions (sid, sess, expire) FROM stdin;
409-DGet9Oestgq5X-gvEJK2XMJ-DMXT	{"cookie":{"originalMaxAge":86400000,"expires":"2025-04-19T15:20:21.678Z","httpOnly":true,"path":"/"},"passport":{"user":2}}	2025-04-19 15:41:03
nFnETn85y-wEi9kJri-RmMaLuuP7NsZV	{"cookie":{"originalMaxAge":86400000,"expires":"2025-04-19T09:10:34.241Z","httpOnly":true,"path":"/"},"passport":{"user":2}}	2025-04-19 15:36:32
P8WfF8orR-a2nySsgpQXlMaCLKC6myms	{"cookie":{"originalMaxAge":86400000,"expires":"2025-04-19T14:22:38.717Z","httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-04-19 15:36:59
5l4SJfuECOxoKhxSiZOLNig8nrSfdtzL	{"cookie":{"originalMaxAge":86400000,"expires":"2025-04-19T10:14:39.815Z","httpOnly":true,"path":"/"},"passport":{"user":2}}	2025-04-19 15:00:45
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, password, role, full_name, email, phone) FROM stdin;
1	admin	6a12e6179119bfb9b6fb6742bd9a3840b5b0a3ce1b3794787df96905475f2adca3a9eb44573bcd35aa8088f72e52c3ec62a74d721d5383ece588712a499af95c.7de728943829a0b714eb821b8e80cc0f	admin	Admin User	admin@orbitinstitute.com	+971 123456789
2	superadmin	c8130dfeeae120bb8a53f88258bfb842bec1f02528433c9201ef6da0342a137d5635f8217a87440065a4ef39035ef68342e9dbc64df288f9a6f2a1a4d4ced7f8.446e5d11dce9bb5a8dc999f68d0f47e8	superadmin	Super Admin	superadmin@orbitinstitute.com	+971 987654321
\.


--
-- Name: campaigns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.campaigns_id_seq', 1, false);


--
-- Name: certificates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.certificates_id_seq', 1, false);


--
-- Name: courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.courses_id_seq', 4, true);


--
-- Name: email_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.email_history_id_seq', 1, false);


--
-- Name: email_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.email_templates_id_seq', 1, false);


--
-- Name: follow_ups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.follow_ups_id_seq', 1, false);


--
-- Name: invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.invoices_id_seq', 1, false);


--
-- Name: leads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.leads_id_seq', 1, false);


--
-- Name: proposals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.proposals_id_seq', 1, false);


--
-- Name: quotations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.quotations_id_seq', 1, false);


--
-- Name: schedules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.schedules_id_seq', 1, false);


--
-- Name: students_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.students_id_seq', 1, false);


--
-- Name: titan_email_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.titan_email_settings_id_seq', 1, false);


--
-- Name: trainers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.trainers_id_seq', 4, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);


--
-- Name: certificates certificates_certificate_number_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_certificate_number_unique UNIQUE (certificate_number);


--
-- Name: certificates certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_pkey PRIMARY KEY (id);


--
-- Name: courses courses_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_name_unique UNIQUE (name);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: email_history email_history_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_history
    ADD CONSTRAINT email_history_pkey PRIMARY KEY (id);


--
-- Name: email_templates email_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_pkey PRIMARY KEY (id);


--
-- Name: follow_ups follow_ups_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.follow_ups
    ADD CONSTRAINT follow_ups_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_invoice_number_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_unique UNIQUE (invoice_number);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: proposals proposals_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_pkey PRIMARY KEY (id);


--
-- Name: proposals proposals_proposal_number_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_proposal_number_unique UNIQUE (proposal_number);


--
-- Name: quotations quotations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_pkey PRIMARY KEY (id);


--
-- Name: quotations quotations_quotation_number_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_quotation_number_unique UNIQUE (quotation_number);


--
-- Name: schedules schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT schedules_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: students students_student_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_student_id_unique UNIQUE (student_id);


--
-- Name: titan_email_settings titan_email_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.titan_email_settings
    ADD CONSTRAINT titan_email_settings_pkey PRIMARY KEY (id);


--
-- Name: trainers trainers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.trainers
    ADD CONSTRAINT trainers_pkey PRIMARY KEY (id);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (sid);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--


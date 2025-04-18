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

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, password, role, full_name, email, phone) FROM stdin;
1	admin	6a12e6179119bfb9b6fb6742bd9a3840b5b0a3ce1b3794787df96905475f2adca3a9eb44573bcd35aa8088f72e52c3ec62a74d721d5383ece588712a499af95c.7de728943829a0b714eb821b8e80cc0f	admin	Admin User	admin@orbitinstitute.com	+971 123456789
2	superadmin	c8130dfeeae120bb8a53f88258bfb842bec1f02528433c9201ef6da0342a137d5635f8217a87440065a4ef39035ef68342e9dbc64df288f9a6f2a1a4d4ced7f8.446e5d11dce9bb5a8dc999f68d0f47e8	superadmin	Super Admin	superadmin@orbitinstitute.com	+971 987654321
\.


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- PostgreSQL database dump complete
--


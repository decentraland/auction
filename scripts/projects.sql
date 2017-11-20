--
-- PostgreSQL database dump
--

-- Dumped from database version 9.5.10
-- Dumped by pg_dump version 10.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

SET search_path = public, pg_catalog;

--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY projects (id, name, "desc", link, public, parcels, priority, disabled, "createdAt", "updatedAt") FROM stdin;
04c9005d-e441-4690-9e97-95fbef02aa08	SUREAL District	A district out of the boundaries of what you know as our physical world. Out of body experiences, magic, new laws of physics, mystical encounters, anything goes.	https://github.com/decentraland/districts/issues/34	t	\N	0	f	2017-09-29 15:04:43.838	2017-10-04 18:17:47.487
0e47d0f6-6da1-4bbe-b6f0-2a4d4216acbc	Altcoin Rollercoaster Park	A rollercoaster themepark with rides based on historical and/or live price charts.	https://github.com/decentraland/districts/issues/7	t	\N	0	f	2017-09-29 14:49:29.207	2017-10-04 18:17:48.116
106f1557-4a92-41a4-9f18-40fcb90b4031	Dragon City	A perfect combination of China’s ancient culture and Western modernization, a reflection of both the Eastern and Western civilizations.	https://github.com/decentraland/districts/issues/30	t	\N	0	f	2017-09-29 13:34:45.776	2017-10-04 18:17:48.44
219ac351-e6ce-4e17-8b84-eb008afddf69	AETHERIAN project	Aetherian City will be one of the main attractions for visitors and dwellers of Decentraland, as it intends to be the largest cyberpunk-agglomeration of the metaverse.	https://github.com/decentraland/districts/issues/33	t	\N	0	f	2017-09-29 12:48:32.404	2017-09-29 15:17:17.037
2674bb85-14f1-4f6e-9273-29263c8321fb	Amusement Park with Carnival Games	An amusement park site in Decentraland, complete with rides, carnival games, gardens, and so on.	https://github.com/decentraland/districts/issues/2	t	\N	0	f	2017-09-29 14:45:41.934	2017-10-04 18:17:49.086
2d0043ab-3dbb-419f-8744-5ffe166a4270	Decentraland Museum	Create the best place to showcase 2D, 3D and any sort of artwork in Decentraland.	https://github.com/decentraland/districts/issues/53	t	\N	0	f	2017-09-30 23:10:36.318	2017-10-04 18:17:49.441
30741c80-faaf-48ee-8788-6aa25cc5dbc6	Tech Sector: A Home for Developers	Do you want to join meetups with other remote developers who are building parts of Decentraland, Blockchain Software and other technologies? Walk down the streets of the Tech Sector and something is bound to catch your eye	https://github.com/decentraland/districts/issues/11	t	\N	0	f	2017-09-29 14:53:32.432	2017-10-04 18:17:50.086
33f1aabf-6f0a-4cd8-bf86-5bf072b4cf3b	Toke Social: A resort for cannabis connoisseurs	An artistic style lounge for cannabis smokers to hang around, talk non-sense, and view the world from a different lens.	https://github.com/decentraland/districts/issues/32	t	\N	0	f	2017-09-29 15:02:54.583	2017-10-04 18:17:50.429
441fab17-a61b-429e-9156-4311774fbeb3	Anarchy	Every LAND bought here must COMMIT to let anyone build whatever he wants in this land. We can add some anti-vandalism thing here later if necessary.	https://github.com/decentraland/districts/issues/37	t	\N	0	f	2017-09-29 15:07:28.981	2017-10-04 18:17:50.762
47e02c36-9774-4b1e-b7ee-bab79ba337ec	Star Kingdom	A community in Decentraland for the micronation called the Star Kingdom. 	https://github.com/decentraland/districts/issues/15	t	\N	0	f	2017-09-29 14:56:06.173	2017-10-04 18:17:51.074
5b5bded6-fd94-4dfa-a1d3-4e13799b4247	DCL China City	A district where Chinese people can get together to share culture, value and lauguage.	https://github.com/decentraland/districts/issues/20	t	\N	0	f	2017-09-29 14:58:26.213	2017-10-04 18:17:51.385
5c75635d-512a-42f0-a433-8449830fd66b	War Thunder Community Park	The WT Park will be supported with developers and will become a VR museum of WWII vehicles with unsurpassed quality.	https://github.com/decentraland/districts/issues/9	t	\N	0	f	2017-09-29 14:50:58.26	2017-10-04 18:17:51.718
68ddd785-2c09-4fd9-bde1-4e6088c26e21	SF Zone - a home for science fiction fans	SF-friendly district, with sub districts specific to the different subgenres of the genre, leaving enough space for subgenres we are not aware of but which exist or are going to exist.	https://github.com/decentraland/districts/issues/13	t	\N	0	f	2017-09-29 14:55:00.688	2017-10-04 18:17:52.056
6d7567b9-fbd4-4b94-929d-9d27350b2a4e	Central Business District	What better place to conduct your virtual business than the beautiful conference centers and office spaces of Decentraland's Central Business District?	https://github.com/decentraland/districts/issues/16	t	\N	0	f	2017-09-29 14:56:33.6	2017-10-04 18:17:52.381
7260a387-15b6-43b7-99cd-6443002354c4	Engineering Park	An area where engineers can meet to discuss, explore, share and showcase ideas. These ideas could be related to the classical branches of engineering or to new branches and possibilities that nobody has even thought of yet.	https://github.com/decentraland/districts/issues/29	t	\N	0	f	2017-09-29 15:02:00.91	2017-10-04 18:17:52.697
7ca33cfa-2b65-48b7-8f51-20e9e597196a	Hacker City	A place for developers to gather and build the earliest scripts and items that will be used in Decentraland.	https://github.com/decentraland/districts/issues/36	t	\N	0	f	2017-09-29 14:07:14.872	2017-10-04 18:17:53.338
9541ffe4-b07e-4d12-a161-bed7476a1a36	Casino Featuring ETH Based Online Gambling	A unique platform wherein the Casino has no edge but a 5% cut will be taken only from the winnings of participants	https://github.com/decentraland/districts/issues/10	f	\N	0	f	2017-09-29 12:51:59.617	2017-10-04 18:17:53.96
9ac004a0-de6a-463f-86cb-03e118e6b187	Central Marketplace	Set up a central open-air marketplace where vendors can actively sell in-app goods	https://github.com/decentraland/districts/issues/3	t	\N	0	f	2017-09-29 14:46:39.343	2017-10-04 18:17:54.287
9b40cc9a-386b-4ad4-b15f-d1aef620f0da	Democratic People's Republic of Yetepey	This district will aim to work together and realize the goals of Supreme Leader Yetepey. 	https://github.com/decentraland/districts/issues/50	t	\N	0	f	2017-09-30 23:07:42.765	2017-10-04 18:17:54.614
a1f52795-cf17-46e0-8ba8-f222391953d4	Embassy Town	A district where other projects can have official embassies in Decentraland.	https://github.com/decentraland/districts/issues/19	t	\N	0	f	2017-09-29 14:57:45.518	2017-10-04 18:17:54.926
ac63d553-15fa-4ef9-9432-cae6d18da592	VARC - A District for All things Architecture	VARC will be a district for Architectural professionals, students, hobbyists, and admirers. I envision this district having many roles and projects under four main categories: Presentation, Education, Design, and Commerce.	https://github.com/decentraland/districts/issues/35	t	\N	0	f	2017-09-29 15:06:55.084	2017-10-04 18:17:55.55
81550f53-00a3-4b65-8a23-dba0c0c689d4	Festival Land	This district is for people who want to make a Festival city in Decentraland.	https://github.com/decentraland/districts/issues/14	t	\N	0	f	2017-09-29 14:55:21.725	2017-10-04 18:17:53.645
2f6bd57f-a78d-49fe-8378-afed2908e9da	Design Quarter	Core hub for Modern Design and Visual Identity in VR. Center of Excellence for Virtual Arts from concept to completed construction.	https://github.com/decentraland/districts/issues/23	t	\N	0	f	2017-09-29 15:00:51.497	2017-10-04 18:17:49.765
ae98119e-8bd9-427b-a01f-8ecf3aeabf3f	Star City	Aims to establish a city with houses, businesses, community centers, casinos, shops, and so much more.	https://github.com/decentraland/districts/issues/47	t	\N	0	f	2017-09-29 15:39:37.094	2017-10-04 18:17:55.897
b7edf8fe-c462-4977-a02f-5af36b1d7d8a	The Anarchist International (A-Squat)	This district is a refuge for Anarchists to gather outside the Statist-Corporate systems they are battling against for the liberation of humankind.	https://github.com/decentraland/districts/issues/18	t	\N	0	f	2017-09-29 14:57:06.44	2017-10-04 18:17:56.243
bc851635-ebd5-489a-9ec9-935d79230784	MusicHub	The district of musicians, fans, producers, and media. Come to listen to the latest tracks produced by residents, stay for live concerts.	https://github.com/decentraland/districts/issues/40	t	\N	0	f	2017-09-29 15:09:10.693	2017-10-04 18:17:56.555
bd8c2deb-674b-425b-8e1d-dcb965785187	Virtual Reality Shopping District	VRS District bridges the gap between Decentraland, district0x and eCommerce store owners by acting as a resource to high-end businesses interested in creating their own Virtual Reality Shop. 	https://github.com/decentraland/districts/issues/45	t	\N	0	f	2017-09-29 15:11:44.995	2017-10-04 18:17:56.881
d8c7f63f-de4d-4bbd-bda9-28f0e571bc40	Dragon Kingdom	We are thinking of open a district called Dragon Kingdom where Chinese people can get together to share culture, value and language. but we also welcome people from all over the world.	https://github.com/decentraland/districts/issues/49	t	\N	0	f	2017-09-29 16:47:57.618	2017-10-04 18:17:57.198
db2f5609-b1bd-4320-b7d5-d494ec1d93d1	The Whale Club	Provide an exclusive area for MANA holders to relax	https://github.com/decentraland/districts/issues/5	t	\N	0	f	2017-09-29 14:47:05.4	2017-10-04 18:17:57.843
e3118325-fe60-45bd-9a10-358a26ce66e4	Fashion Street	Bring top fashion brands (Gucci, Prada, Ralph Lauren etc.) in DCL. Each store will give DCL users a high sensory shopping experience.	https://github.com/decentraland/districts/issues/31	t	\N	0	f	2017-09-29 15:02:28.064	2017-10-04 18:17:58.181
f38bb916-16ae-4405-8226-8651003e6aa2	Virtual Sand Hill Road	In Silicon Valley, Sand Hill Road is notable for its concentration of venture capital companies.	https://github.com/decentraland/proposals/issues/72	t	\N	0	f	2017-09-29 10:10:30.632	2017-10-04 18:17:58.511
f5d8e722-fdce-4d41-b38b-adfed2e0cf6c	Red Light District	A "red-light district" within the Decentraland to help contain/manage/curate Adult services such as; Adult Live-chat, VR pornography, dating services and Adult themes e-stores.	https://github.com/decentraland/districts/issues/6	t	\N	0	f	2017-09-29 14:47:54.775	2017-10-04 18:17:58.819
faba40bd-21bc-4321-93e6-3e38bce32ea8	Decentraland University	Create the definitive centre of education in Decentraland.	https://github.com/decentraland/districts/issues/54	t	\N	0	f	2017-09-30 23:10:57.585	2017-10-04 18:17:59.15
fc07f87e-9363-4ef7-ad9a-2d6bb303faea	Arena: a futuristic urban hotbed of creativity	Arena is an urban community and hotbed of creativity. This is somewhere for like minded people to move forwards in VR as a loose creative collective.	https://github.com/decentraland/districts/issues/12	t	\N	0	f	2017-09-29 14:54:16.487	2017-10-04 18:17:59.496
ff047550-b48c-42cb-badc-f57cb337d9e7	The Chill Zone	This will be a haven for all who wanna come chill. Features arcades, ping pong, board games, a stage, music, among others.	https://github.com/decentraland/districts/issues/51	t	\N	0	f	2017-09-30 23:09:32.193	2017-10-04 18:17:59.815
7527b864-7c47-4195-85f3-7c0b14b4b4b7	Shwedagon Pagoda	Full size - beautiful Swedagon Pagoda - 100% replica of a real one	https://github.com/decentraland/districts/issues/60	t	\N	\N	f	2017-10-05 13:28:43.969	2017-10-05 13:28:43.969
b8df8308-69aa-4cbd-bd0c-113c363b3441	Decentramon	You can use blank cards to go into the "wild" and capture Decentramon. Once captured, that decentremon is yours to keep, train, battle, use as a pet, or use however you wish. 	https://github.com/decentraland/districts/issues/52	t	\N	\N	f	2017-10-05 13:31:08.89	2017-10-05 13:31:08.89
88da8758-e405-4fa8-b51b-5bb3811a4818	Chobury - Democratic City for All	Chobury is designed to be Democratic city that has social spaces, residential areas and commercial areas.	https://github.com/decentraland/districts/issues/55	t	\N	\N	f	2017-10-05 14:04:47.361	2017-10-05 14:04:47.361
d115380d-67ff-4b35-9981-0a565ed1bf6f	Freedom city	All free people can cooperate freely. In the city of freedom, there is no unified management, unified planning, you have complete control of their own land.	https://github.com/decentraland/districts/issues/56	t	\N	\N	f	2017-10-05 14:06:34.933	2017-10-05 14:06:34.933
992e008a-ebdd-47e9-9fa9-7b14610a98d7	E for EVERYONE	EVERYONE, will be a no sale/no ads zone - a series of explorable sandboxes with limited goals, focused on open play.	https://github.com/decentraland/districts/issues/57	t	\N	\N	f	2017-10-05 14:09:11.209	2017-10-05 14:09:11.209
d9bfa18a-c856-457d-8d85-e2dc3b7648a1	Vegas City	A digital sin city, party town gambling district of Decentraland. Designed in a style that emulates the Vegas strip, lies a long row of casinos, shopping, concert and performance halls, nightclubs, and sin.	https://github.com/decentraland/districts/issues/22	t	\N	0	f	2017-09-29 12:50:02.45	2017-10-04 18:17:57.531
78519470-9a08-4943-a107-9f17d0dcdd40	Decentraland Conference Center	A conference center in a natural, sylvan setting.	https://github.com/decentraland/districts/issues/27	t	\N	0	f	2017-09-29 10:07:35.3	2017-10-14 14:24:36.983
abb312ef-0c51-4cbe-a456-a9c9b8c13c25	Greenpoint: A Meeting Point for Grassroots Movements	The Movement aims at building an environment that thrives to create new opportunities for human collaboration, a meeting point to connect to at any time. Greenpoint is a place where people can meet, new organizations can be created, and existing organizations can connect.	https://github.com/decentraland/districts/issues/8	t	\N	0	f	2017-09-29 14:50:15.995	2017-10-14 14:29:44.637
d3a3a640-0712-487c-81b7-a8de9d7c508e	 Bitunia	Bitunia is about Cryptocurrency, helping and teaching each other all about Bit- and Altcoins. Tech Analysis, informing each other about developments, spread the philosophy of decentralization, trading and so on.	https://github.com/decentraland/districts/issues/61	t	\N	\N	f	2017-10-28 16:40:57.121	2017-10-28 16:40:57.121
8f3b14a5-557f-49c6-ba89-199a47e7c9f8	Little India (Bharat)	Many great cities of the world have a place called "Little India”, usually representing culture and traditions of India out of India. Same will be the purpose of our district: to showcase the great wonders of India, the culture, the festivals (Holi, Diwali, Pongal), among others.	https://github.com/decentraland/districts/issues/62	t	\N	\N	f	2017-10-28 16:43:03.054	2017-10-28 16:43:03.054
4d1b480d-b3f5-418c-8921-17604041ce79	innerGlitch - Science, Technology & Discovery	innerGlitch is an educational project dedicated to the spreading of science literacy and general curiosity using different kinds of media. It will be a city-like layout with portions of LAND dedicated to particular topics, scientific conference rooms, interactive simulations, educational related activities, etc.	https://github.com/decentraland/districts/issues/63	t	\N	\N	f	2017-10-28 16:50:03.991	2017-10-28 16:50:03.991
c6e2dcfb-b8ac-4eed-b3b2-6ef266dbe992	Bittrex Tomorrow	There will be a skyscraper for each crypto exchange which lists MANA as a token, the height of the buildings will be updated each day with the total volume of MANA traded respective to the exchanges. The walls will plastered with info on each transaction which took place the previous day.	https://github.com/decentraland/districts/issues/64	t	\N	\N	f	2017-10-28 16:51:44.135	2017-10-28 16:51:44.135
848470eb-148d-41d1-8f0e-674b7e6895f3	The Forest	Just a bit of quiet, wild and beautiful nature in the crowded and noisy city.	https://github.com/decentraland/districts/issues/66	t	\N	\N	f	2017-10-28 16:53:57.397	2017-10-28 16:53:57.397
ff5159ad-358c-42bb-ae1c-db211bf77227	The Battleground	An Environment for PvP, RPG and RTS Gaming within Decentraland	https://github.com/decentraland/districts/issues/71	t	\N	\N	f	2017-10-28 16:54:23.905	2017-10-28 16:54:23.905
423c2731-9e34-470c-9a61-8fcc0c6bad6c	EcoGames	We have 3D artists and game developers from around the world who are ready to implement multiplayer mini games.	https://github.com/decentraland/districts/issues/72	t	\N	\N	f	2017-10-28 16:55:46.656	2017-10-28 16:55:46.656
153afe16-4820-4e7a-8b88-0daef567003e	Hunted District	An area dedicated to what scares us the dark side of thing and anything related to horror. The town will host various genres and themes such as goar, ghost, zombies, cults, among other horror subjects.	https://github.com/decentraland/districts/issues/73	t	\N	\N	f	2017-10-28 17:00:34.939	2017-10-28 17:00:34.939
\.


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('projects_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--


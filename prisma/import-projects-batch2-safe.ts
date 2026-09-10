/**
 * SAFE, INSERT-ONLY project importer — Batch 2.
 *
 * Safety guarantees:
 * - NEVER updates existing Project rows.
 * - NEVER deletes data.
 * - NEVER uses upsert.
 * - Existing rows are matched ONLY by Project.projectCode and skipped.
 * - Only new rows are inserted with: projectCode, name, contractor.
 * - Existing location, staff assignments, accomplishment, status, items,
 *   tests, attachments, timestamps, and all other related data remain untouched.
 *
 * Default behavior is DRY RUN.
 *
 * Dry run:
 *   npx tsx prisma/import-projects-batch2-safe.ts
 *
 * Actual import — PowerShell:
 *   $env:CONFIRM_PROJECT_IMPORT="YES"; npx tsx prisma/import-projects-batch2-safe.ts
 *
 * Actual import — bash/zsh:
 *   CONFIRM_PROJECT_IMPORT=YES npx tsx prisma/import-projects-batch2-safe.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const projects: Array<{
  projectCode: string;
  name: string;
  contractor: string;
}> = [
  {
    "projectCode": "20-CFM1RD059",
    "name": "Concreting of Road from National Highway - Brgy. Matingen, Sultan Kudarat, Maguindanao",
    "contractor": "CONFIACON Construction and Engineering"
  },
  {
    "projectCode": "21-RIM1BR436",
    "name": "Construction of Neketan Bridge, DOS",
    "contractor": "SYNDTITE CONSTRUCTION CORPORATION"
  },
  {
    "projectCode": "21-SDFM2RD147",
    "name": "Concreting of Camp Bad'r Access Road, Guindulungan, Maguindanao del sur",
    "contractor": "TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "22-RIM2RD505",
    "name": "Concreting of Malatimon-Kakal Road, Ampatuan",
    "contractor": "ACQ Solomonic Builders Development Corp."
  },
  {
    "projectCode": "22-RIM2RD594",
    "name": "Concreting of Kauran - Matagabong - Kapinpilan Road Phase 3, Ampatuan",
    "contractor": "PATE-KHAY Construction"
  },
  {
    "projectCode": "22-RIM2BR601",
    "name": "Construction of Bridge, Tuayan Mother, Datu Hoffer",
    "contractor": "SEN Young General Construction and Supply Corporation"
  },
  {
    "projectCode": "22-RIM2RD530",
    "name": "Concreting of Brgy Pinditen Road , Datu Salibo",
    "contractor": "0.00"
  },
  {
    "projectCode": "22-RIM2RD533",
    "name": "Concreting of Meta FMR Via Sitio Monosiac/Diate, Datu Unsay",
    "contractor": "ACQ Solomonic Builders Development Corp."
  },
  {
    "projectCode": "22-SDFM2RD039",
    "name": "Construction of Access Road at Camp Bad'r Phase 2, Guindulungan",
    "contractor": "TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "23-RIMSFC455",
    "name": "Construction of Revetment, Brgy. Montay, Datu Piang",
    "contractor": "PATE-KHAY Construction"
  },
  {
    "projectCode": "23-RIMNBR352",
    "name": "Construction of Pantawan Bridge with slope protection, Buldon",
    "contractor": "Minrock Multi-Builders / Strong Point Construction and Supply (JV)"
  },
  {
    "projectCode": "23-RIMNRD346",
    "name": "Construction of Brgy. Kuden - Brgy. Poblacion Road, Talitay",
    "contractor": "TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "2021SDF-TT-WS",
    "name": "Upgrading, Improvement and Expansion of Bongao Water Supply System, Phase 1, Bongao, Tawi-Tawi",
    "contractor": "VINHAR Construction & Marketing / JH Construction Inc. (JV)"
  },
  {
    "projectCode": "21-RIM1RD415",
    "name": "Concreting of Simuay Seashore Boulevard Road (Phase 1), Sultan Mastura",
    "contractor": "Micah Construction & Supply"
  },
  {
    "projectCode": "21-RIM1RD824",
    "name": "Concreting of Brgy. Damatog - Brgy Sabaken, Phase II, Northern Kabutanlan (Sta. 1+300 - Sta. 3+300)",
    "contractor": "AV MESIONA"
  },
  {
    "projectCode": "21-RIM2BR839",
    "name": "Construction of Foot Bridge at Brgy. Pandi, Datu Salibo",
    "contractor": "Jargon Construction & Supply"
  },
  {
    "projectCode": "23-RIMNRD286",
    "name": "Concreting of Baguainged Road, Brgy. Bayanga Norte, Matanog",
    "contractor": "JELM Construction Construction"
  },
  {
    "projectCode": "23-RIMSRD402",
    "name": "Concreting of Brgy. Meta - Brgy. Talibadok Road, Datu Unsay",
    "contractor": "NAVI GEO CONSTRUCTION CORPORATION"
  },
  {
    "projectCode": "20-CFM1BR067",
    "name": "Construction of Matengen Bridge, Matengen, Sultan Kudarat",
    "contractor": "SEN Young General Construction and Supply Corporation"
  },
  {
    "projectCode": "21-RIM1RD424",
    "name": "Concreting of Bagoinged - Tinonggos Road, Phase 2, Datu Odin Sinsuat, Mag (Sta 1+200 - Sta 3+200)",
    "contractor": "CORICS Construction"
  },
  {
    "projectCode": "23-RIMSRD430",
    "name": "Concreting of Brgy. Timanan - Kulati - Bakel Road, South Upi",
    "contractor": "PATE-KHAY Construction"
  },
  {
    "projectCode": "2020HERITAGE",
    "name": "Rehabilitation of Heritage Building, Barangay Kalanganan II, Cotabato City",
    "contractor": "Negotiated: TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "22-RIM1RD431",
    "name": "Concreting Of Brgy. Dadtumeg Road, Kabuntalan",
    "contractor": "Minrock Multi-Builders"
  },
  {
    "projectCode": "22-RIM1RD439",
    "name": "Concreting Of Poblacion Dalican - Sibuto Phase 2, DOS",
    "contractor": "CORICS Construction"
  },
  {
    "projectCode": "2020ISO-1",
    "name": "Construction of Isolation Building with Access Road and line Canal at Sanitarium Hospital, Sultan Kudarat Mag.",
    "contractor": "FFJJ Construction"
  },
  {
    "projectCode": "2020ISO-2",
    "name": "Construction of Isolation Building with Access Road and line Canal at Datu Blah District Hospital, Upi Mag.",
    "contractor": "CORICS Construction"
  },
  {
    "projectCode": "2020ISO-4",
    "name": "Construction of Isolation Building with Access Road and line Canal at Buluan District Hospital, Buluan",
    "contractor": "CORICS Construction"
  },
  {
    "projectCode": "2020ISO-3",
    "name": "Construction of Isolation Building with Access Road and line Canal Datu Odin Sinsuat District Hospital, Mag.",
    "contractor": "CORICS Construction"
  },
  {
    "projectCode": "22-RIM2RD555",
    "name": "Concreting of Nabantog-Tukanalipao Road, Mamasapano",
    "contractor": "PATE-KHAY Construction"
  },
  {
    "projectCode": "22-RIM2RD572",
    "name": "Construction of Lepak - Kabuling Road , Pandag",
    "contractor": "ACGR Development Construction & Supply"
  },
  {
    "projectCode": "22-RIM2RD582",
    "name": "Concreting of Zeneben-Bulod Road, Sultan sa Barongis",
    "contractor": "ACGR Development Construction & Supply"
  },
  {
    "projectCode": "22-RIM2RD591",
    "name": "Concreting of Sitio Lebal-Sitio Petad Road, Buluan",
    "contractor": "J-1 Builders Corporation"
  },
  {
    "projectCode": "23-RIMSBR450",
    "name": "Construction of Concrete Bridge, GSKP - Tulunan, GSKP",
    "contractor": "0.00"
  },
  {
    "projectCode": "22-RIM2RD595",
    "name": "Concreting of Bagong-Malingao Road, Shariff Aguak",
    "contractor": "ACQ Solomonic Builders Development Corp."
  },
  {
    "projectCode": "23-RIMNRD291",
    "name": "Concreting of Lipawan-Ruminimbang Road Phase 3, Barira",
    "contractor": "Negotiated: STONELINE CONSTRUCTION"
  },
  {
    "projectCode": "2020ISO-5",
    "name": "Construction of Isolation Building with Access Road and line Canal at Cotabato Regional and Medical Center",
    "contractor": "CORICS Construction"
  },
  {
    "projectCode": "23-RIMNRD322",
    "name": "Construction of Labungan - Sitio Ulango Road Phase 2, DOS",
    "contractor": "CORICS Construction"
  },
  {
    "projectCode": "23-SDFMNRD044",
    "name": "Construction of Road at Purok Ladap, Brgy. Olas, Sultan Kudarat",
    "contractor": "BANDAR KUTAWATO Construction and Supply"
  },
  {
    "projectCode": "23-RIMSRD368",
    "name": "Construction of Tomicor Road, Ampatuan",
    "contractor": "Prestige-Builders Construction"
  },
  {
    "projectCode": "23-RIMSRD411",
    "name": "Construction of Sitio Bulig, Brgy. Daladagan - Sentro Daladagan Road Phase 2, Mangudadatu",
    "contractor": "ARS Construction and Supply"
  },
  {
    "projectCode": "23-SDFMNRD034",
    "name": "Construction of Road (Crossing Gulf) at Brgy. Ungap - Brgy. Sandakan, Sultan Kudarat",
    "contractor": "ARS Construction and Supply"
  },
  {
    "projectCode": "23-RIMSRD443",
    "name": "Concreting of Bakat - Pidsandawan Road Phase 2, Rajah Buayan",
    "contractor": "Minrock Multi-Builders"
  },
  {
    "projectCode": "23-RIMSRD447",
    "name": "Concreting of Road from Sentro Daladagan - National Highway, Mangudadatu",
    "contractor": "GC & S CONSTRUCTION & SUPPLY"
  },
  {
    "projectCode": "23-RIMSFC453",
    "name": "Construction of Flood Control, Poblacion, Buluan",
    "contractor": "TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "2020ISO-7",
    "name": "Construction of Isolation Building with Access Road and line Canal at Wao, Lanao Del Sur",
    "contractor": "PATE-KHAY Construction"
  },
  {
    "projectCode": "23-RIMSFC460",
    "name": "Construction of Flood Control, Brgy. Badak, GSKP",
    "contractor": "MIM Construction / YG Construction Services (JV)"
  },
  {
    "projectCode": "23-SDFMNRD037",
    "name": "Construction of Road at Basak - Boronay, Brgy. Bayanga Norte, Matanog",
    "contractor": "INFINEAT CONSTRUCTION"
  },
  {
    "projectCode": "20RIM2BR129",
    "name": "Construction of Concrete Bridge at Guinibon, DAS",
    "contractor": "PATE-KHAY Construction"
  },
  {
    "projectCode": "20-TD53OB291",
    "name": "Construction of Multi-Purpose Learning Center at Pantukan, Davao de Oro",
    "contractor": "Micah Construction & Supply"
  },
  {
    "projectCode": "24-RIMSBR495",
    "name": "Construction of Bridge, Sitio Proper, Brgy. Bagombong, Mamasapano",
    "contractor": "Gibuild Developmemt Corporation"
  },
  {
    "projectCode": "24-RIMSFC499",
    "name": "Construction of Revetment, Brgy. Ambadao - Brgy. Montay, Datu Piang",
    "contractor": "PATE-KHAY Construction"
  },
  {
    "projectCode": "24-RIMSFC500",
    "name": "Construction of Revetment (Phase 4), Brgy. Reina Regente, Datu Piang",
    "contractor": "TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "20-TD53OB288",
    "name": "Construction of Multi-Purpose Learning Center at Banay-Banay, Davao Oriental",
    "contractor": "Micah Construction & Supply"
  },
  {
    "projectCode": "24-RIMSRD404",
    "name": "Concreting of Road at Brgy. Meta - Sitio Pancio, Brgy. Iganagampong, Datu Unsay",
    "contractor": "ECOMIXED Construction and Development Corporation"
  },
  {
    "projectCode": "21-SDFM2RD151",
    "name": "Construction of Calean-Tenok-Paitan Road, Mangungudatu, Maguindanao del sur",
    "contractor": "TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "24-RIMSRD459",
    "name": "Concreting of Road at Sitio Kalot, Brgy. Iganagampong, Datu Unsay",
    "contractor": "Gibuild Developmemt Corporation"
  },
  {
    "projectCode": "20RIM1RD092",
    "name": "Concreting of Maitong-Langeban Road, Phase 2, Kabuntalan",
    "contractor": "Negotiated: TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "20-TD53OB293",
    "name": "Construction of Multi-Purpose Learning Center at Waan, Davao del Sur",
    "contractor": "Micah Construction & Supply"
  },
  {
    "projectCode": "20-TD53OB292",
    "name": "Construction of Multi-Purpose Learning Center at Panabo, Davao del Norte",
    "contractor": "Micah Construction & Supply"
  },
  {
    "projectCode": "20-TD53OB294",
    "name": "Construction of Multi-Purpose Learning Center at Sirawan, Davao del Sur",
    "contractor": "Micah Construction & Supply"
  },
  {
    "projectCode": "20-TD53OB290",
    "name": "Construction of Multi-Purpose Learning Center at Dahican, Davao Oriental",
    "contractor": "Micah Construction & Supply"
  },
  {
    "projectCode": "20-TD53OB295",
    "name": "Construction of Multi-Purpose Learning Center at Camalian, Davao Occidental",
    "contractor": "Micah Construction & Supply"
  },
  {
    "projectCode": "20-TD29OB298",
    "name": "Construction of Solar Dryer at Brgy. Molon Palimbang, Sultan Kudarat Province",
    "contractor": "BIG SEVEN Construction and Supply Corporation"
  },
  {
    "projectCode": "20-TD29OB297",
    "name": "Construction of Warehouse at Brgy. Molon Palimbang, Sultan Kudarat Province",
    "contractor": "BIG SEVEN Construction and Supply Corporation"
  },
  {
    "projectCode": "21-RIM2FC524",
    "name": "Construction of Protection Dike, Talapas, Datu Montawal",
    "contractor": "SEN Young General Construction and Supply Corporation"
  },
  {
    "projectCode": "2021TT-A.1.33",
    "name": "Concreting of Tawi-Tawi Circumferential Rd. Nalil - Lupa Pula Section (with exception), Bangao",
    "contractor": "BENRAM Construction"
  },
  {
    "projectCode": "21-RITTPO362",
    "name": "Expansion of Bongao Port Phase V",
    "contractor": "JV - BENRAM Construction / MAJDA Construction and Development"
  },
  {
    "projectCode": "21-RIM1RD397",
    "name": "Concreting of Nabalawag - Rumidas Road, Barira",
    "contractor": "JV - HHH DEVELOPMENT AND CONSTRUCTION / HMI ENTERPRISES"
  },
  {
    "projectCode": "21-RIM1RD405",
    "name": "Concreting of Ganasi Road, Upi",
    "contractor": "CONFIACON Construction and Engineering"
  },
  {
    "projectCode": "21-RIM1RD416",
    "name": "Concreting of Gambar - Katidtuan Road, Kabuntalan",
    "contractor": "H-ROYAL CONSTRUCTION"
  },
  {
    "projectCode": "21-RIM1RD409",
    "name": "Concreting of Ladia - Dalomangcob Road, Sultan Kudrat, Mag.",
    "contractor": "ARS Construction and Supply"
  },
  {
    "projectCode": "21-RIM1RD413",
    "name": "Concreting of Rumidas - Pinasangka Road, Buldon",
    "contractor": "PATE-KHAY Construction"
  },
  {
    "projectCode": "21-RIM1RD425",
    "name": "Concreting of Bugawas - Sifaran Road, (Phase 2), DOS (Sta. 1+200 - Sta. 3+900)",
    "contractor": "ARS Construction and Supply"
  },
  {
    "projectCode": "21-RIM1RD404",
    "name": "Concreting of Ranao Pilayan - Bantek Road (Phase 2), Upi (Sta 0+900 - Sta. 2+800)",
    "contractor": "ACQ Solomonic Builders Development Corp."
  },
  {
    "projectCode": "2021RI-M1-B5.2",
    "name": "Construction of Dike from Sitio Dadiangas, Brgy. Bugawasan - Brgy. Pinguiaman - Bialong - Sitio Cawa, Brgy. Bugawas, DOS",
    "contractor": "HERVELYN INTER TRADING BUILDER CORPORATION"
  },
  {
    "projectCode": "21-RIM2RD450",
    "name": "Concreting of Old Maganoy to Dimampao Road Bounded to Rajah Buayan (Phase 3), Datu Abdullah Sangki (Sta. 1+500 - Sta. 3+500)",
    "contractor": "TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "21-RIM2RD453",
    "name": "Concreting of Lomoyon - Kalumenga - Bunawan Road, Datu Paglas, (Sta. 0+000 - Sta. 2+000)",
    "contractor": "H-ROYAL CONSTRUCTION"
  },
  {
    "projectCode": "21-RIM2RD463",
    "name": "Concreting of Sitio Kiamco Road (Phase 1), Datu Unsay (Sta. 0+000 - Sta. 2+000)",
    "contractor": "SYNDTITE CONSTRUCTION CORPORATION"
  },
  {
    "projectCode": "21-RIM2RD490",
    "name": "Concreting of Sitio Minangat - Sitio Basag Road (Phase 2), Bakat, Shariff Saydona",
    "contractor": "Jargon Construction & Supply"
  },
  {
    "projectCode": "21-RIM2RD491",
    "name": "Concreting of Looy - Bongo Road, Phase 1, South Upi (Sta. 0+000 - Sta. 2+000)",
    "contractor": "LIONS CONVERGENCE CONSTRUCTION"
  },
  {
    "projectCode": "21-RIM2FC519",
    "name": "Construction of Revetment along Poblacion Datu Piang Boulevard, Datu Piang",
    "contractor": "HERVELYN INTER TRADING BUILDER CORPORATION"
  },
  {
    "projectCode": "21-RIM2FC521",
    "name": "Construction of Protection Dike along Talayan River (Talayan-Guindulungan Bridge), Talayan",
    "contractor": "Jargon Construction & Supply"
  },
  {
    "projectCode": "24-RIMSFC498",
    "name": "Construction of Revetment (Phase 2), Brgy. Montay, Datu Piang",
    "contractor": "PATE-KHAY Construction"
  },
  {
    "projectCode": "24-RIMSFC502",
    "name": "Construction of Revetment, Sampao Proper, Brgy. Sampao, Guindulungan",
    "contractor": "APEIRON Constuction Solutions"
  },
  {
    "projectCode": "21-RIM2FC523",
    "name": "Construction of Protection Dike along Kabunlan River (Manungkaling Section), Mamasapano",
    "contractor": "SYNDTITE CONSTRUCTION CORPORATION"
  },
  {
    "projectCode": "21-RIM2FC525",
    "name": "Construction of Protection Dike at Brar River, Datu Anggal Midtimbang",
    "contractor": "PATE-KHAY Construction"
  },
  {
    "projectCode": "21-RIM2FC526",
    "name": "Construction of Slope Protection along Kabulnan River (Labu Labu Section) Shariff Aguak",
    "contractor": "Jargon Construction & Supply"
  },
  {
    "projectCode": "21-TD37-OB243",
    "name": "Concreting Of Barangay Road/FMR At Salaman, Lebak",
    "contractor": "ARGE Construction and Supply"
  },
  {
    "projectCode": "22-RIM1BR461",
    "name": "Construction of Kumagingking Bridge, Buldon",
    "contractor": "J.H.R. Enterprises"
  },
  {
    "projectCode": "22-RIM2RD496",
    "name": "Concreting of Zapakan-Dapantis Road Phase 3, Rajah Buayan",
    "contractor": "CONFIACON Construction and Engineering"
  },
  {
    "projectCode": "22-RIM2RD508",
    "name": "Concreting of Madanding to Balili, Tukanalugong Municipal Road, Datu Abdullah Sangki",
    "contractor": "ACQ Solomonic Builders Development Corp."
  },
  {
    "projectCode": "24-RIMSBR496",
    "name": "Construction of Bridge, Brgy. Pilar, South Upi",
    "contractor": "Gibuild Developmemt Corporation"
  },
  {
    "projectCode": "22-RIM2RD543",
    "name": "Concreting of Sitio Tamelang-Sitio Lagpan Road, Sultan sa Barongis",
    "contractor": "ACQ Solomonic Builders Development Corp."
  },
  {
    "projectCode": "23-RIMSRD422",
    "name": "Construction of Pidsandawan- Tabungao Road , Rajah Buayan",
    "contractor": "Minrock Multi-Builders"
  },
  {
    "projectCode": "22-RIM1RD380",
    "name": "Concreting of Matanog-Sultan Dumalondong Road Phase 1, Matanog",
    "contractor": "KLD Engineering Construction"
  },
  {
    "projectCode": "24-RIMNRD282",
    "name": "Construction of Road Dike (Earth) at Brgy. Pinaring - Brgy. Maidapa - Brgy. Katidtuan Phase 1, Sultan Kudarat",
    "contractor": "MUST Enterprises"
  },
  {
    "projectCode": "24-RIMNRD283",
    "name": "Construction of Road Dike (Earth) at Brgy. Katidtuan - Brgy. Lower Pangangkalan Phase 1, Sultan Kudarat",
    "contractor": "DQMB Construction & Supply Corp."
  },
  {
    "projectCode": "24-RIMNRD289",
    "name": "Construction of Road at Brgy. Lipawan - Brgy. Ruminimbang (Phase 4), Barira",
    "contractor": "AMP's Construction"
  },
  {
    "projectCode": "24-RIMNRD294",
    "name": "Construction of Road at Sitio Sumiyabang - Sitio Tataya, Brgy. Poblacion, Barira",
    "contractor": "INFINEAT CONSTRUCTION"
  },
  {
    "projectCode": "24-RIMNRD297",
    "name": "Construction of Road at Brgy. Kulimpang - Brgy. Piers - Brgy. Karim - Binaan Falls (Phase 4), Buldon",
    "contractor": "PATE-KHAY Construction"
  },
  {
    "projectCode": "24-RIMNRD348",
    "name": "Construction of Road at Sitio Kabutuyen - Sitio Baka, Brgy. Blensong Upi",
    "contractor": "ARS Construction and Supply"
  },
  {
    "projectCode": "24-RIMNBR357",
    "name": "Construction of Bridge, Brgy. Nekitan, Sultan Kudarat",
    "contractor": "APEIRON Constuction Solutions"
  },
  {
    "projectCode": "24-RIMNFC360",
    "name": "Rehabilitation/ Construction of Riverbank Protection, Matuber Bridge (South Side), Brgy. Matuber, Datu Blah Sinsuat",
    "contractor": "STONELINE CONSTRUCTION"
  },
  {
    "projectCode": "24-RIMSRD392",
    "name": "Concreting of Road at Brgy. Banaba – Brgy. Madanding, Datu Abdullah Sangki",
    "contractor": "SEE Construction and Supply / AKV Builders and Const. Supplies (JV)"
  },
  {
    "projectCode": "24-RIMSRD393",
    "name": "Concreting of Road at Brgy. Guinibon – Brgy. Sugadol (Phase 1), Datu Abdullah Sangki",
    "contractor": "NYN Construction"
  },
  {
    "projectCode": "24-RIMSRD396",
    "name": "Concreting of Road at Sitio Muntod, Brgy. Limpongo - Brgy. Sayap (Phase 3), Datu Hoffer Ampatuan",
    "contractor": "C.M. Construction"
  },
  {
    "projectCode": "24-RIMSRD398",
    "name": "Construction of Road at Brgy. Manindolo - Brgy. Kalumenga, Datu Paglas",
    "contractor": "KLD Engineering Construction"
  },
  {
    "projectCode": "24-RIMSRD400",
    "name": "Concreting of Road at Brgy. Madidis, Datu Paglas - Brgy. Sinalayan, Tulunan, Datu Paglas",
    "contractor": "RENCH BUILDERS AND SUPPLY"
  },
  {
    "projectCode": "24-RIMSRD419",
    "name": "Concreting of Road at Gaunan Elementary School - Brgy. Malibpolok, Rajah Buayan",
    "contractor": "SIMPAL Construction"
  },
  {
    "projectCode": "24-RIMSRD429",
    "name": "Construction of Road at Sitio Kuhan, South Upi",
    "contractor": "MIM Construction"
  },
  {
    "projectCode": "24-RIMSRD432",
    "name": "Concreting of Road at Brgy. Darampua (Phase 2), Sultan sa Barongis",
    "contractor": "Gibuild Developmemt Corporation"
  },
  {
    "projectCode": "24-RIMSRD435",
    "name": "Concreting of Road at Brgy. Zeneben - Brgy. Bulod (Phase 2), Sultan sa Barongis",
    "contractor": "RENCH BUILDERS AND SUPPLY"
  },
  {
    "projectCode": "24-RIMSRD436",
    "name": "Concreting of Road at Sitio Lower (Akas), Brgy. Fukol - Sitio Upper (Palao), Brgy. Boboguiron (Phase 1), Talayan",
    "contractor": "0.00"
  },
  {
    "projectCode": "22-RIM1RD430",
    "name": "Concreting Of Gambar - Katidtuan Road Phase 2, Kabuntalan",
    "contractor": "PATE-KHAY Construction"
  },
  {
    "projectCode": "24-RIMSRD439",
    "name": "Concreting of Road at Upper Malating, Brgy. Salman, Ampatuan",
    "contractor": "Prestige-Builders Construction"
  },
  {
    "projectCode": "24-RIMSRD447",
    "name": "Construction of Road at Sitio Kiteb - Sitio Binantal, Brgy. Talibadok, Datu Hoffer Ampatuan",
    "contractor": "ECBJ EAST COAST Construction"
  },
  {
    "projectCode": "24-RIMSRD451",
    "name": "Concreting of Road from National Highway - Sitio Kitampok, Brgy. Tunggol, Datu Montawal",
    "contractor": "SEE Construction and Supply / AKV Builders and Const. Supplies (JV)"
  },
  {
    "projectCode": "24-RIMSRD467",
    "name": "Construction of Road at Brgy. Tinambulan (Phase 2), Mangudadatu",
    "contractor": "RENCH BUILDERS AND SUPPLY"
  },
  {
    "projectCode": "24-RIMSRD468",
    "name": "Construction of Road from National Highway - Inner Kalnian, Brgy. Kalian, Mangudadatu",
    "contractor": "TRIPLE S Construction"
  },
  {
    "projectCode": "24-RIMSRD470",
    "name": "Concreting of Road at Sitio Alba, Brgy. Galakit, Pagalungan",
    "contractor": "ANGKAT Construction and Supply"
  },
  {
    "projectCode": "24-RIMSRD480",
    "name": "Concreting of Road at Brgy. Timbangan (Phase 3), Shariff Aguak",
    "contractor": "AJ USMAN Construction Services"
  },
  {
    "projectCode": "22-RIM1FC473",
    "name": "Construction of Dike from Sitio Dadiangas, Brgy. Bugawas - Brgy. Pinguiaman - Bialong-Sitio Cawa, Brgy. Bugawas, DOS (phase 2), DOS",
    "contractor": "SEN Young General Construction and Supply Corporation"
  },
  {
    "projectCode": "22-RIM2RD509",
    "name": "Concreting of Sitio Makabimbang-Tulunan Road Phase 3, Datu Anggal Midtimbang",
    "contractor": "NEN Builders & Development Services Corporation"
  },
  {
    "projectCode": "22-RIM2RD569",
    "name": "Concreting of Tehran Street Phase 2, Paglat",
    "contractor": "GABRIELLAS Enterprises"
  },
  {
    "projectCode": "22-RIM2RD581",
    "name": "Concreting of Kalye Putol to Sitio Beneringan to Provincial Road , South Upi",
    "contractor": "J.H.R. Enterprises"
  },
  {
    "projectCode": "22-RIM2RD590",
    "name": "Concreting of La Frutera Plantation Road, Buluan",
    "contractor": "ARS Construction and Supply"
  },
  {
    "projectCode": "22-RICORD1062",
    "name": "Concreting of Road at Barangay Bagua Mother, Cotabato City",
    "contractor": "NYN Construction"
  },
  {
    "projectCode": "22-RICORD1078",
    "name": "Concreting of Roads at Barangay Bagua 2, Cotabato City",
    "contractor": "INFINEAT CONSTRUCTION"
  },
  {
    "projectCode": "22-RICORD1082",
    "name": "Concreting of Roads at Barangay Poblacion 8, Cotabato City",
    "contractor": "Rysha Enterprises"
  },
  {
    "projectCode": "23-RIMNRD297",
    "name": "Construction of Sitio Serten - Sitio Penulen Road, DOS",
    "contractor": "RESH Construction Services"
  },
  {
    "projectCode": "23-RIMSFC456",
    "name": "Construction of Flood Control Phase 3 (along Dansalan River), Reina Regente Section, Datu Piang",
    "contractor": "TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "23-RIMSFC461",
    "name": "Construction Of Flood Control, Brgy. Lower Dlag, Pandag",
    "contractor": "ARS Construction and Supply"
  },
  {
    "projectCode": "23-RIMSFC463",
    "name": "Construction of Protection Dike, Brgy. Talapas , Datu Montawal",
    "contractor": "LICSAL CONSTRUCTION CORP."
  },
  {
    "projectCode": "23-RIMNRD292",
    "name": "Concreting of Ruminimbang - Korosoyan Road, Barira",
    "contractor": "PATE-KHAY Construction"
  },
  {
    "projectCode": "23-RIMNRD301",
    "name": "Construction of Making - Sitio Nabunturan Road, Parang",
    "contractor": "TRIPLE S Construction"
  },
  {
    "projectCode": "23-RIMSFC462",
    "name": "Construction of Riverbank Protection Phase 3 (along Muti-Ahan Road), Brgy. Tambunan II, Guindulungan",
    "contractor": "PATE-KHAY Construction"
  },
  {
    "projectCode": "24-RIMSFC501",
    "name": "Construction of Revetment, Brgy. Dado - Brgy. Kalipapa, Datu Piang",
    "contractor": "SIMPAL Construction"
  },
  {
    "projectCode": "24-RIMSRD437",
    "name": "Construction of Road at Sitio Manga, Brgy. Timbaluan - Sitio 3000, Brgy. Tamar (Phase 2), Talayan",
    "contractor": "INFINEAT CONSTRUCTION"
  },
  {
    "projectCode": "25-RIMSFC322",
    "name": "Construction of Revetment, Brgy Ambadao, Datu Piang",
    "contractor": "RNS Construction Engineering"
  },
  {
    "projectCode": "25-RICCOI643",
    "name": "Construction of Multi-Purpose Building of the Hall of Justice at Bangsamoro Government Center (BGC)",
    "contractor": "VILLAR GENERAL CONSTRUCTION AND SUPPLY"
  },
  {
    "projectCode": "25-RIL2RD444",
    "name": "Construction of Road with Reinforced Concrete Box Culvert at Brgy. Tubaran Proper, Tubaran - Brgy. Marogong Proper, Marogong (Phase 2), Tubaran",
    "contractor": "FP ALONTO Construction Services"
  },
  {
    "projectCode": "25-RIMSRD291",
    "name": "Construction of Road at Sitio Namli - Sitio Mimbago, Brgy. Layog, Pagalungan",
    "contractor": "STM BUILDERS AND TRADING CORPORATION"
  },
  {
    "projectCode": "25-RIMSRD305",
    "name": "Concreting of Road at Sitio Binaton - Sitio Duka - Sitio Lumbos, Brgy. Romongaob (Phase 2), South Upi",
    "contractor": "AKV BUILDERS and Construction Supplies"
  },
  {
    "projectCode": "25-RIMSBR320",
    "name": "Construction of Bridge, Brgy. Poblacion - Brgy. Lower Siling, Buluan",
    "contractor": "GENETIAN Builder & Enterprises, Inc."
  },
  {
    "projectCode": "25-RIMSBR321",
    "name": "Construction of Bridge, Brgy. Sampao, Guindulungan",
    "contractor": "0.00"
  },
  {
    "projectCode": "25-RICCWS620",
    "name": "Construction of Water System Level 2, MPW-BARMM Regional Office, Bangsamoro Government Center, Brgy. Rosary Heights 7, Cotabato City",
    "contractor": "0.00"
  },
  {
    "projectCode": "23-SDFMSRD057",
    "name": "Construction of Road at Sitio Muntod, Brgy. Limpongo - Brgy. Sayap (Phase 4), Datu Hoffer Ampatuan",
    "contractor": "RENCH BUILDERS AND SUPPLY"
  },
  {
    "projectCode": "26-RIMNRD080",
    "name": "Concreting of Roads at 6ID Camp Siongco Compound, Brgy. Awang (Phase 1), Datu Odin Sinsuat",
    "contractor": "0.00"
  },
  {
    "projectCode": "26-RIMNRD089",
    "name": "Concreting of Road at Brgy. Mirab - Brgy. Sefegefen, Upi",
    "contractor": "0.00"
  },
  {
    "projectCode": "26-RIMNBR094",
    "name": "Construction of Cadoongan Bridge, Brgy. Karim, Buldon",
    "contractor": "0.00"
  },
  {
    "projectCode": "26-RIMNBR095",
    "name": "Construction of Bridge, Sitio Tambak, Brgy. Bugasan Sur, Matanog",
    "contractor": "0.00"
  },
  {
    "projectCode": "26-RIMNOI102",
    "name": "Improvement of Islamic Studies Academic Building, MSU Maguindanao, Brgy. Poblacion, Datu Odin Sinsuat",
    "contractor": "0.00"
  },
  {
    "projectCode": "26-RIMSRD126",
    "name": "Concreting of Road at Brgy. Tuayan I, Datu Hoffer Ampatuan",
    "contractor": "0.00"
  },
  {
    "projectCode": "26-RIMSBR132",
    "name": "Construction of Bridge, Brgy. Bagoenged, Pagalungan",
    "contractor": "0.00"
  },
  {
    "projectCode": "26-RIMSBR133",
    "name": "Construction of Liongan Bridge, Brgy. Boboguiron, Talayan",
    "contractor": "0.00"
  },
  {
    "projectCode": "26-RIMSFC134",
    "name": "Construction of Revetment Dike at Duaminanga Elementary School, Brgy. Duaminanga, Datu Piang",
    "contractor": "0.00"
  },
  {
    "projectCode": "26-RIMSFC135",
    "name": "Construction of Revetment Dike (Phase 2), Brgy. Dado - Brgy. Kalipapa, Datu Piang",
    "contractor": "0.00"
  },
  {
    "projectCode": "26-RIMSFC136",
    "name": "Construction of Flood Control Structure, Brgy. Bakat, Shariff Saydona Mustapha",
    "contractor": "0.00"
  },
  {
    "projectCode": "26-RIL1OI188",
    "name": "Rehabilitation of Dormitories and Hostel, MSU Main Campus, Marawi City",
    "contractor": "0.00"
  },
  {
    "projectCode": "26-RIL2RD206",
    "name": "Construction of Road at Brgy. Lumbac - Brgy. Notong, Pualas",
    "contractor": "0.00"
  }
];

async function main() {
  const codes = projects.map((project) => project.projectCode);

  const existing = await prisma.project.findMany({
    where: {
      projectCode: { in: codes },
    },
    select: {
      projectCode: true,
    },
  });

  const existingCodes = new Set(existing.map((project) => project.projectCode));
  const newProjects = projects.filter(
    (project) => !existingCodes.has(project.projectCode),
  );

  console.log(`Source projects: ${projects.length}`);
  console.log(`Already in database (will NOT be changed): ${existing.length}`);
  console.log(`New projects ready to insert: ${newProjects.length}`);

  if (newProjects.length === 0) {
    console.log("Nothing to import.");
    return;
  }

  if (process.env.CONFIRM_PROJECT_IMPORT !== "YES") {
    console.log("\nDRY RUN ONLY — no database changes were made.");
    console.log(
      'Run again with CONFIRM_PROJECT_IMPORT=YES only after reviewing these counts.',
    );
    return;
  }

  // INSERT ONLY. Do not replace this with update(), upsert(), deleteMany(),
  // or any destructive synchronization logic.
  const result = await prisma.project.createMany({
    data: newProjects,
    skipDuplicates: true,
  });

  console.log(`\nInserted ${result.count} new project(s).`);
  console.log(
    "Existing project rows and all related database data were left untouched.",
  );
}

main()
  .catch((error) => {
    console.error("Project import failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

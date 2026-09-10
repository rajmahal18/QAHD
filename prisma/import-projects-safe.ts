/**
 * SAFE, INSERT-ONLY project importer for the QAH Testing MVP.
 *
 * Safety contract:
 * - NEVER updates existing Project rows.
 * - NEVER deletes data.
 * - NEVER uses upsert.
 * - Existing rows are matched ONLY by Project.projectCode and skipped.
 * - Only new rows are inserted with: projectCode, name, contractor.
 * - Existing location, staff assignments, accomplishment, status, items,
 *   tests, attachments, timestamps, and all other existing data remain untouched.
 *
 * Default behavior is DRY RUN.
 * To actually insert the new rows, set:
 *   CONFIRM_PROJECT_IMPORT=YES
 *
 * Example:
 *   CONFIRM_PROJECT_IMPORT=YES npx tsx prisma/import-projects-safe.ts
 *
 * PowerShell:
 *   $env:CONFIRM_PROJECT_IMPORT="YES"; npx tsx prisma/import-projects-safe.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const projects: Array<{
  projectCode: string;
  name: string;
  contractor: string;
}> = [
  {
    "projectCode": "20-CF63BRD095",
    "name": "Concreting/Rehabilitation of Road at manaulanan-inatilan Boundary to Manaulanan Elementary School, Pikit",
    "contractor": "ALPEBEL Builders and Supply Corporation"
  },
  {
    "projectCode": "20-CF63BRD096",
    "name": "Concreting of Road at Sitio Proper, Brgy. Batulawan, Pikit",
    "contractor": "J & S Escuadra Construction and Supply"
  },
  {
    "projectCode": "20-CF63BRD097",
    "name": "Concreting of Road from Panatan Bridge-Datu Binasing Phase II with Line Canal, Pigcawayan",
    "contractor": "BAMEC Developer General Contractor & Engineering"
  },
  {
    "projectCode": "20-CF63BRD098",
    "name": "Concreting of Road at Brgy. Buricain to Brgy. Balacayon (Buricain Gap), Pigcawayan",
    "contractor": "ARS Construction and Supply"
  },
  {
    "projectCode": "20-CF63BRD099",
    "name": "Concreting of Road at Brgy. Matilak to Brgy. Kadingilan (Brgy. Matilak section), Pigcawayan",
    "contractor": "BULANAN Construction"
  },
  {
    "projectCode": "20-CF63BRD121",
    "name": "Concreting of Datu Binasing Poblacion Barangay Road, Datu Binasing, Pigcawayan",
    "contractor": "J & S Escuadra Construction and Supply"
  },
  {
    "projectCode": "20RI63BRD143",
    "name": "Concreting of road from Panatan Bridge-Datu Binasing (Missing Link), Pigcawayan",
    "contractor": "BAMEC Developer General Contractor & Engineering"
  },
  {
    "projectCode": "20RI63BRD144",
    "name": "Concreting of brgy. Lower baguer road, Pigcawayan",
    "contractor": "BAMEC Developer General Contractor & Engineering"
  },
  {
    "projectCode": "20RI63BRD140",
    "name": "Concreting of Upper Pangangkalan Road, Pigcawayan",
    "contractor": "DAWING Construction"
  },
  {
    "projectCode": "20RI63BRD141",
    "name": "Concreting of Lower Pangangkalan Road, pigcawayan",
    "contractor": "DAWING Construction"
  },
  {
    "projectCode": "20RI63BRD145",
    "name": "Concreting of brgy. Datu mantil road, Pigcawayan",
    "contractor": "SYNDTITE CONSTRUCTION CORPORATION"
  },
  {
    "projectCode": "20RI63BRD139",
    "name": "Concreting of Libungan Torreta Road, Pigcawayan",
    "contractor": "SYNDTITE CONSTRUCTION CORPORATION"
  },
  {
    "projectCode": "20RI63BRD137",
    "name": "Concreting of Matilak road, Pigcawayan",
    "contractor": "SYNDTITE CONSTRUCTION CORPORATION"
  },
  {
    "projectCode": "20RI63BRD138",
    "name": "Concreting of Kadingilan Road, Pigcawayan",
    "contractor": "SYNDTITE CONSTRUCTION CORPORATION"
  },
  {
    "projectCode": "20RI63BRD135",
    "name": "Concreting of Buricain Road, Pigcawayan",
    "contractor": "ARS Construction and Supply"
  },
  {
    "projectCode": "20RI63BRD136",
    "name": "Concreting of Balacayon Road, Pigcawayan",
    "contractor": "ARS Construction and Supply"
  },
  {
    "projectCode": "20RI63BRD142",
    "name": "Concreting of brgy. patot, Pigcawayan",
    "contractor": "SYNDTITE CONSTRUCTION CORPORATION"
  },
  {
    "projectCode": "20RI63BRD134",
    "name": "Concreting of Simsiman Road, Pigcawayan",
    "contractor": "SYNDTITE CONSTRUCTION CORPORATION"
  },
  {
    "projectCode": "20RI63BRD146",
    "name": "Concreting of Road at Brgy. Dunguan, Aleosan",
    "contractor": "Schaminco Engineering Design and Construction"
  },
  {
    "projectCode": "20RI63BRD176",
    "name": "Concreting of Road at Brgy. Balong, Pikit",
    "contractor": "ANGKAT Construction and Supply"
  },
  {
    "projectCode": "20RI63BRD154",
    "name": "Concreting of Road at Brgy. Tupig, Carmen",
    "contractor": "SYNDTITE CONSTRUCTION CORPORATION"
  },
  {
    "projectCode": "20RI63BRD148",
    "name": "Concreting of Road at Brgy. Kibayao, Carmen",
    "contractor": "Gulf-Canary Construction & Development"
  },
  {
    "projectCode": "20RI63BRD152",
    "name": "Concreting of Road at Brgy. Nasapian, Carmen",
    "contractor": "Negotiated: TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "20RI63BRD149",
    "name": "Concreting of Road at Brgy. Kitulaan, Carmen",
    "contractor": "JV - ARS Construction & Supply / Big Seven Construction & Supply"
  },
  {
    "projectCode": "20RI63BRD151",
    "name": "Concreting of Road at Brgy. Manarapan, Carmen",
    "contractor": "JV - ARS Construction & Supply / Big Seven Construction & Supply"
  },
  {
    "projectCode": "20RI63BRD150",
    "name": "Concreting of Road at Brgy. Langogan, Carmen",
    "contractor": "STONELINE CONSTRUCTION"
  },
  {
    "projectCode": "20RI63BRD153",
    "name": "Concreting of Road at Brgy. Pebpoloan, Carmen",
    "contractor": "STONELINE CONSTRUCTION"
  },
  {
    "projectCode": "20RI63BRD158",
    "name": "Concreting of Road at Brgy. Sanggadong, Kabacan",
    "contractor": "KLD Engineering Construction"
  },
  {
    "projectCode": "20RI63BRD155",
    "name": "Concreting of Road at Brgy. Buluan, Kabacan",
    "contractor": "Gulf-Canary Construction & Development"
  },
  {
    "projectCode": "20RI63BRD157",
    "name": "Concreting of Road at Brgy. Pedtad, Kabacan",
    "contractor": "Gulf-Canary Construction & Development"
  },
  {
    "projectCode": "20RI63BRD156",
    "name": "Concreting of Road at Brgy. Nanga-an, Kabacan",
    "contractor": "JV - Tamontaka Builders / PLUMBS Eng’g and Construction"
  },
  {
    "projectCode": "20RI63BRD160",
    "name": "Concreting of Road at Brgy. Simone, Kabacan",
    "contractor": "JV - Tamontaka Builders / PLUMBS Eng’g and Construction"
  },
  {
    "projectCode": "20RI63BRD159",
    "name": "Concreting of Road at Brgy. Simbuhay, Kabacan",
    "contractor": "TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "20RI63BRD161",
    "name": "Concreting of Road at Brgy. Tamped, Kabacan",
    "contractor": "TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "20RI63BRD165",
    "name": "Concreting of Road at Brgy. Kapinpilan, Midsayap",
    "contractor": "Llaban Construction"
  },
  {
    "projectCode": "20RI63BRD171",
    "name": "Concreting of Road at Brgy. Sambulawan, Midsayap",
    "contractor": "Llaban Construction"
  },
  {
    "projectCode": "20RI63BRD173",
    "name": "Concreting of Road at Brgy. Tumbras, Midsayap",
    "contractor": "JV - ARS Construction & Supply / HAQ Construction"
  },
  {
    "projectCode": "20RI63BRD167",
    "name": "Concreting of Road at Brgy. Malingao, Midsayap",
    "contractor": "JV - ARS Construction & Supply / HAQ Construction"
  },
  {
    "projectCode": "20RI63BRD172",
    "name": "Concreting of Road at Brgy. Tugal, Midsayap",
    "contractor": "PATE-KHAY Construction"
  },
  {
    "projectCode": "20RI63BRD168",
    "name": "Concreting of Road at Brgy. Mudseng, Midsayap",
    "contractor": "PATE-KHAY Construction"
  },
  {
    "projectCode": "20RI63BRD162",
    "name": "Concreting of Road at Brgy. Damatulan, Midsayap",
    "contractor": "Gulf-Canary Construction & Development"
  },
  {
    "projectCode": "20RI63BRD163",
    "name": "Concreting of Road at Brgy. Kadigasan, Midsayap",
    "contractor": "Gulf-Canary Construction & Development"
  },
  {
    "projectCode": "20RI63BRD169",
    "name": "Concreting of Road at Brgy. Nabalawag, Midsayap",
    "contractor": "RDEN Construction and Supply"
  },
  {
    "projectCode": "20RI63BRD164",
    "name": "Concreting of Road at Brgy. Kadingilan, Midsayap",
    "contractor": "RDEN Construction and Supply"
  },
  {
    "projectCode": "20RI63BRD166",
    "name": "Concreting of Road at Brgy. Kudarangan, Midsayap",
    "contractor": "RNS Construction Engineering"
  },
  {
    "projectCode": "20RI63BRD170",
    "name": "Concreting of Road at Brgy. Olandang, Midsayap",
    "contractor": "RNS Construction Engineering"
  },
  {
    "projectCode": "20RI63BRD174",
    "name": "Concreting of Road at Brgy. Central Labas, Midsayap",
    "contractor": "BIG SEVEN Construction and Supply Corporation"
  },
  {
    "projectCode": "20RI63BRD180",
    "name": "Concreting of Road at Brgy. Bualan, Pikit",
    "contractor": "Gulf-Canary Construction & Development"
  },
  {
    "projectCode": "20RI63BRD183",
    "name": "Concreting of Road at Brgy. Fort Pikit, Pikit",
    "contractor": "CURVE-LINE Construction"
  },
  {
    "projectCode": "20RI63BRD179",
    "name": "Concreting of Road at Brgy. Batulawan, Pikit",
    "contractor": "CURVE-LINE Construction"
  },
  {
    "projectCode": "20RI63BRD177",
    "name": "Concreting of Road at Brgy. Balungis, Pikit",
    "contractor": "CURVE-LINE Construction"
  },
  {
    "projectCode": "20RI63BRD191",
    "name": "Concreting of Road at Brgy. Nabundas, Pikit",
    "contractor": "CURVE-LINE Construction"
  },
  {
    "projectCode": "20RI63BRD193",
    "name": "Concreting of Road at Brgy. Nunguan, Pikit",
    "contractor": "TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "20RI63BRD185",
    "name": "Concreting of Road at Brgy. Gokoton (Gokotan), Pikit",
    "contractor": "TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "20RI63BRD175",
    "name": "Concreting of Road at Brgy. Bagoaingud (Bagoinged), Pikit",
    "contractor": "ANGKAT Construction and Supply"
  },
  {
    "projectCode": "20RI63BRD196",
    "name": "Concreting of Road at Brgy. Rajah Muda, Pikit",
    "contractor": "ANGKAT Construction and Supply"
  },
  {
    "projectCode": "20RI63BRD178",
    "name": "Concreting of Road at Brgy. Barungis, Pikit",
    "contractor": "Schaminco Engineering Design and Construction"
  },
  {
    "projectCode": "20RI63BRD181",
    "name": "Concreting of Road at Brgy. Buliok, Pikit",
    "contractor": "Schaminco Engineering Design and Construction"
  },
  {
    "projectCode": "20RI63BRD194",
    "name": "Concreting of Road at Brgy. Pamalian, Pikit",
    "contractor": "Negotiated: DST CONSTRUCTION AND SUPPLY"
  },
  {
    "projectCode": "20RI63BRD186",
    "name": "Concreting of Road at Brgy. Kabasalan, Pikit",
    "contractor": "ANGKAT Construction and Supply"
  },
  {
    "projectCode": "20RI63BRD184",
    "name": "Concreting of Road at Brgy. Gli-gli, Pikit",
    "contractor": "ANGKAT Construction and Supply"
  },
  {
    "projectCode": "20RI63BRD182",
    "name": "Concreting of Road at Brgy. Bulol, Pikit",
    "contractor": "ANGKAT Construction and Supply"
  },
  {
    "projectCode": "20RI63BRD189",
    "name": "Concreting of Road at Brgy. Macasendeg, Pikit",
    "contractor": "KEAN Construction"
  },
  {
    "projectCode": "20RI63BRD188",
    "name": "Concreting of Road at Brgy. Macabual, Pikit",
    "contractor": "ANGKAT Construction and Supply"
  },
  {
    "projectCode": "20RI63BRD147",
    "name": "Concreting of Road at Brgy. Tapodoc, Aleosan",
    "contractor": "Schaminco Engineering Design and Construction"
  },
  {
    "projectCode": "20RI63BRD187",
    "name": "Concreting of Road at Brgy. Lagunde, Pikit",
    "contractor": "Gulf-Canary Construction & Development"
  },
  {
    "projectCode": "20RI63BRD190",
    "name": "Concreting of Road at Brgy. Manaulanan, Pikit",
    "contractor": "Gulf-Canary Construction & Development"
  },
  {
    "projectCode": "20RI63BRD192",
    "name": "Concreting of Road at Brgy. Nalapaan, Pikit",
    "contractor": "STONELINE CONSTRUCTION"
  },
  {
    "projectCode": "20RI63BRD195",
    "name": "Concreting of Road at Brgy. Panicupan, Pikit",
    "contractor": "STONELINE CONSTRUCTION"
  },
  {
    "projectCode": "21-RI63BRD684",
    "name": "Concreting of Simsiman Road Phase 2, Pigcawayan",
    "contractor": "ARS Construction and Supply"
  },
  {
    "projectCode": "21-RI63BRD685",
    "name": "Concreting of Buricain Road Phase 2, Pigcawayan",
    "contractor": "Mark Anthony Construction and Supply"
  },
  {
    "projectCode": "21-RI63BRD686",
    "name": "Concreting of Balacayon Road Phase 2, Pigcawayan",
    "contractor": "Mark Anthony Construction and Supply"
  },
  {
    "projectCode": "21-RI63BRD687",
    "name": "Concreting of Matilak road Phase 2, Pigcawayan",
    "contractor": "Mark Anthony Construction and Supply"
  },
  {
    "projectCode": "21-RI63BRD688",
    "name": "Concreting of Kadingilan Road Phase 2, Pigcawayan",
    "contractor": "Mark Anthony Construction and Supply"
  },
  {
    "projectCode": "21-RI63BRD689",
    "name": "Concreting of Libungan Torreta Road Phase 2, Pigcawayan",
    "contractor": "KLD Engineering Construction"
  },
  {
    "projectCode": "21-RI63BRD690",
    "name": "Concreting of Upper Pangangkalan Road Phase 2, Pigcawayan",
    "contractor": "J & S Escuadra Construction and Supply"
  },
  {
    "projectCode": "21-RI63BRD692",
    "name": "Concreting of brgy. Patot Phase 2, Pigcawayan",
    "contractor": "DEDASE Construction Services"
  },
  {
    "projectCode": "21-RI63BRD693",
    "name": "Concreting of brgy. Lower baguer road Phase 2, Pigcawayan",
    "contractor": "BAMEC Developer General Contractor & Engineering"
  },
  {
    "projectCode": "21-RI63BRD695",
    "name": "Concreting of brgy. Datu Binasing road , Pigcawayan",
    "contractor": "BAMEC Developer General Contractor & Engineering"
  },
  {
    "projectCode": "21-RI63BRD694",
    "name": "Concreting of brgy. Datu mantil road Phase 2, Pigcawayan",
    "contractor": "RRJJ Quinto Builders Corp."
  },
  {
    "projectCode": "21-RI63BRD696",
    "name": "Concreting of Brgy. Dunguan Road Phase 2 , Aleosan",
    "contractor": "BATUA Engineering Services and Construction Supply"
  },
  {
    "projectCode": "21-RI63BRD697",
    "name": "Concreting of Brgy. Tapodoc Road Phase 2, Aleosan",
    "contractor": "Schaminco Engineering Design and Construction"
  },
  {
    "projectCode": "21-RI63BRD698",
    "name": "Concreting of Brgy. Kibayao Road Phase 2, Carmen",
    "contractor": "Gulf-Canary Construction & Development"
  },
  {
    "projectCode": "21-RI63BRD699",
    "name": "Concreting of Brgy. Kitulaan Road Phase 2, Carmen",
    "contractor": "BIG SEVEN Construction and Supply Corporation"
  },
  {
    "projectCode": "21-RI63BRD700",
    "name": "Concreting of Brgy. Langogan Road Phase 2, Carmen",
    "contractor": "STONELINE CONSTRUCTION"
  },
  {
    "projectCode": "21-RI63BRD703",
    "name": "Concreting of Brgy. Pebpoloan Road Phase 2, Carmen",
    "contractor": "STONELINE CONSTRUCTION"
  },
  {
    "projectCode": "21-RI63BRD701",
    "name": "Concreting of Brgy. Manarapan Road Phase 2, Carmen",
    "contractor": "BIG SEVEN Construction and Supply Corporation"
  },
  {
    "projectCode": "21-RI63BRD702",
    "name": "Concreting of Brgy. Nasapian Road Phase 2, Carmen",
    "contractor": "Negotiated: TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "21-RI63BRD704",
    "name": "Concreting of Brgy. Tupig Road Phase 2, Carmen",
    "contractor": "RDG Construction & Supply"
  },
  {
    "projectCode": "21-RI63BRD705",
    "name": "Concreting of Brgy. Buluan Road Phase 2, Kabacan",
    "contractor": "ACQ Solomonic Builders Development Corp."
  },
  {
    "projectCode": "21-RI63BRD706",
    "name": "Concreting of Brgy. Nanga-an Road Phase 2, Kabacan",
    "contractor": "ACQ Solomonic Builders Development Corp."
  },
  {
    "projectCode": "21-RI63BRD707",
    "name": "Concreting of Brgy. Pedtad Road Phase 2, Kabacan",
    "contractor": "Gulf-Canary Construction & Development"
  },
  {
    "projectCode": "21-RI63BRD708",
    "name": "Concreting of Brgy. Sanggadong Road Phase 2, Kabacan",
    "contractor": "E & D Construction"
  },
  {
    "projectCode": "21-RI63BRD709",
    "name": "Concreting of Brgy. Simbuhay Road Phase 2, Kabacan",
    "contractor": "TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "21-RI63BRD710",
    "name": "Concreting of Brgy. Simone Road Phase 2, Kabacan",
    "contractor": "TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "21-RI63BRD711",
    "name": "Concreting of Brgy. Tamped Road Phase 2, Kabacan",
    "contractor": "TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "21-RI63BRD712",
    "name": "Concreting of Brgy. Damatulan Road Phase 2, Midsayap",
    "contractor": "ALPEBEL Builders and Supply Corporation"
  },
  {
    "projectCode": "21-RI63BRD713",
    "name": "Concreting of Brgy. Kadigasan Road Phase 2, Midsayap",
    "contractor": "Gulf-Canary Construction & Development"
  },
  {
    "projectCode": "21-RI63BRD714",
    "name": "Concreting of Brgy. Kadingilan Road Phase 2, Midsayap",
    "contractor": "PADER Construction & Supply"
  },
  {
    "projectCode": "21-RI63BRD716",
    "name": "Concreting of Brgy. Kudarangan Road Phase 2, Midsayap",
    "contractor": "ALPEBEL Builders and Supply Corporation"
  },
  {
    "projectCode": "21-RI63BRD715",
    "name": "Concreting of Brgy. Kapinpilan Road Phase 2, Midsayap",
    "contractor": "MUST Enterprises"
  },
  {
    "projectCode": "21-RI63BRD721",
    "name": "Concreting of Brgy. Sambulawan Road Phase 2, Midsayap",
    "contractor": "MUST Enterprises"
  },
  {
    "projectCode": "21-RI63BRD719",
    "name": "Concreting of Brgy. Nabalawag Road Phase 2, Midsayap",
    "contractor": "PADER Construction & Supply"
  },
  {
    "projectCode": "21-RI63BRD717",
    "name": "Concreting of Brgy. Malingao Road Phase 2, Midsayap",
    "contractor": "HAQ Construction"
  },
  {
    "projectCode": "21-RI63BRD718",
    "name": "Concreting of Brgy. Mudseng Road Phase 2, Midsayap",
    "contractor": "PATE-KHAY Construction"
  },
  {
    "projectCode": "21-RI63BRD720",
    "name": "Concreting of Brgy. Olandang Road Phase 2, Midsayap",
    "contractor": "SYNDTITE CONSTRUCTION CORPORATION"
  },
  {
    "projectCode": "21-RI63BRD722",
    "name": "Concreting of Brgy. Tugal Phase Road 2, Midsayap",
    "contractor": "PATE-KHAY Construction"
  },
  {
    "projectCode": "21-RI63BRD723",
    "name": "Concreting of Brgy. Tumbras Road Phase 2, Midsayap",
    "contractor": "HAQ Construction"
  },
  {
    "projectCode": "21-RI63BRD724",
    "name": "Concreting of Brgy. Central Labas Road Phase 2, Midsayap",
    "contractor": "Rahadeem Builders & Construction Supply"
  },
  {
    "projectCode": "21-RI63BRD725",
    "name": "Concreting of Brgy. Bagoaingud (Bagoinged) Road Phase 2, Pikit",
    "contractor": "ACQ Solomonic Builders Development Corp."
  },
  {
    "projectCode": "21-RI63BRD726",
    "name": "Concreting of Brgy. Balong Road Phase 2, Pikit",
    "contractor": "BULANAN Construction"
  },
  {
    "projectCode": "21-RI63BRD727",
    "name": "Concreting of Brgy. Balungis Road Phase 2, Pikit",
    "contractor": "BANDAR KUTAWATO Construction and Supply"
  },
  {
    "projectCode": "21-RI63BRD728",
    "name": "Concreting of Brgy. Barungis Road Phase 2, Pikit",
    "contractor": "Jargon Construction & Supply"
  },
  {
    "projectCode": "21-RI63BRD729",
    "name": "Concreting of Brgy. Batulawan Road Phase 2, Pikit",
    "contractor": "CURVE-LINE Construction"
  },
  {
    "projectCode": "21-RI63BRD730",
    "name": "Concreting of Brgy. Bualan Road Phase 2, Pikit",
    "contractor": "Negotiated: DST CONSTRUCTION AND SUPPLY"
  },
  {
    "projectCode": "21-RI63BRD731",
    "name": "Concreting of Brgy. Buliok Road Phase 2, Pikit",
    "contractor": "ACQ Solomonic Builders Development Corp."
  },
  {
    "projectCode": "21-RI63BRD732",
    "name": "Concreting of Brgy. Bulol Road Phase 2, Pikit",
    "contractor": "RNS Construction Engineering"
  },
  {
    "projectCode": "21-RI63BRD733",
    "name": "Concreting of Brgy. Fort Pikit Road Phase 2, Pikit",
    "contractor": "CURVE-LINE Construction"
  },
  {
    "projectCode": "21-RI63BRD734",
    "name": "Concreting of Brgy. Gli-gli Road Phase 2, Pikit",
    "contractor": "BARRIST Builders and Construction Supply"
  },
  {
    "projectCode": "21-RI63BRD735",
    "name": "Concreting of Brgy. Gokoton (Gokotan) Road Phase 2, Pikit",
    "contractor": "ELMU Construction Services"
  },
  {
    "projectCode": "21-RI63BRD736",
    "name": "Concreting of Brgy. Kabasalan Road Phase 2, Pikit",
    "contractor": "Jargon Construction & Supply"
  },
  {
    "projectCode": "21-RI63BRD737",
    "name": "Concreting of Brgy. Lagunde Road Phase 2, Pikit",
    "contractor": "Gulf-Canary Construction & Development"
  },
  {
    "projectCode": "21-RI63BRD738",
    "name": "Concreting of Brgy. Macabual Road Phase 2, Pikit",
    "contractor": "KLD Engineering Construction"
  },
  {
    "projectCode": "21-RI63BRD739",
    "name": "Concreting of Brgy. Macasendeg Road Phase 2, Pikit",
    "contractor": "KEAN Construction"
  },
  {
    "projectCode": "21-RI63BRD740",
    "name": "Concreting of Brgy. Manaulanan Road Phase 2, Pikit",
    "contractor": "Gulf-Canary Construction & Development"
  },
  {
    "projectCode": "21-RI63BRD741",
    "name": "Concreting of Brgy. Nabundas Road Phase 2, Pikit",
    "contractor": "RDG Construction & Supply"
  },
  {
    "projectCode": "21-RI63BRD742",
    "name": "Concreting of Brgy. Nalapaan Road Phase 2, Pikit",
    "contractor": "Plumbs Engineering & Construction"
  },
  {
    "projectCode": "21-RI63BRD743",
    "name": "Concreting of Brgy. Nunguan Road Phase 2, Pikit",
    "contractor": "RDG Construction & Supply"
  },
  {
    "projectCode": "21-RI63BRD744",
    "name": "Concreting of Brgy. Pamalian Road Phase 2, Pikit",
    "contractor": "Gulf-Canary Construction & Development"
  },
  {
    "projectCode": "21-RI63BRD745",
    "name": "Concreting of Brgy. Panicupan Road Phase 2, Pikit",
    "contractor": "RDEN Construction and Supply"
  },
  {
    "projectCode": "21-RI63BRD746",
    "name": "Concreting of Brgy. Rajah Muda Road Phase 2, Pikit",
    "contractor": "ACQ Solomonic Builders Development Corp."
  },
  {
    "projectCode": "21-RI63BBR913",
    "name": "Construction of Nangaan Bridge, Kabacan",
    "contractor": "Negotiated: LICSAL CONSTRUCTION CORP."
  },
  {
    "projectCode": "21-RI63BBR914",
    "name": "Construction of Libungan Torreta (Pigcawayan) - Kabuntalan Bridge",
    "contractor": "Negotiated: LICSAL CONSTRUCTION CORP."
  },
  {
    "projectCode": "2021RI-B.7.1",
    "name": "Construction of Slope protection at Brgy. Libungan Torreta, Pigcawayan",
    "contractor": "Negotiated: KAPALAWAN CONSTRUCTION"
  },
  {
    "projectCode": "21-SDF63BOI186",
    "name": "Construction of Covered Court, Olandang Midsayap, North Cotabato",
    "contractor": "AMMARA Strukture Construction Services"
  },
  {
    "projectCode": "21-SDF63BOI187",
    "name": "Construction of Covered Court, Sitio Edzcap, Lagunde, Pikit, North Cotabato",
    "contractor": "ENGSU Construction Supplies"
  },
  {
    "projectCode": "21-SDF63BRD183",
    "name": "Concreting of Datu Binasing Cadastral Road, Datu Binasing, Pigcawayan North Cotabato",
    "contractor": "BLUEMOUNTAIN Developers and Construction Supply"
  },
  {
    "projectCode": "21-SDF63BRD184",
    "name": "Rehabilitation of Simsiman Road, Pigcawayan, North Cotabato",
    "contractor": "YG Construction Services"
  },
  {
    "projectCode": "21-SDF63BRD185",
    "name": "Concreting of Brgy. Kapinpilan-Sambulawan Road, Midsayap, North Cotabato",
    "contractor": "AMMARA Strukture Construction Services"
  },
  {
    "projectCode": "21-TD65-63B235",
    "name": "Construction Of Warehouse At Brgy. Barungis, Pikit",
    "contractor": "TG Construction"
  },
  {
    "projectCode": "21-TD65-63B236",
    "name": "Construction Of Solar Dryer At Brgy. Barungis, Pikit",
    "contractor": "MALAGUENA Construction"
  },
  {
    "projectCode": "21-TD57-63B238",
    "name": "Construction Of Covered Court (Option 2) At Brgy. Kapimpilan, Midsayap",
    "contractor": "BONG DAUDIE Construction"
  },
  {
    "projectCode": "21-TD72-63B347",
    "name": "Construction Of Covered Court (Option 2) At Brgy. Buluan, Kabacan",
    "contractor": "BARRIST Builders and Construction Supply"
  },
  {
    "projectCode": "21-TD01-63B350",
    "name": "Installation Of 25-Unit Solar Street Lights, Phase 2 At Brgy. Rajah Muda, Pikit",
    "contractor": "Rysha Enterprises"
  },
  {
    "projectCode": "21-TD01-63B351",
    "name": "Installation Of 10-Unit Solar Power Electrification System At Brgy. Rajah Muda, Pikit",
    "contractor": "Rysha Enterprises"
  },
  {
    "projectCode": "22-RI63BRD652",
    "name": "Concreting of Buricain road Phase 3, Pigcawayan",
    "contractor": "Mindanao Construction Services and Land Development Corp."
  },
  {
    "projectCode": "22-RI63BRD654",
    "name": "Concreting of Central Labas road Phase 3, Midsayap",
    "contractor": "KLD Engineering Construction"
  },
  {
    "projectCode": "22-RI63BRD655",
    "name": "Concreting of Malingao road Phase 3, Midsayap",
    "contractor": "ACQ Solomonic Builders Development Corp."
  },
  {
    "projectCode": "22-RI63BRD657",
    "name": "Opening/Concreting of Nabalawag road phase 3, Midsayap",
    "contractor": "Sunstone Construction and Supply"
  },
  {
    "projectCode": "22-RI63BRD658",
    "name": "Concreting of Mudseng - Tugal road (Gap Section), Midsayap",
    "contractor": "ACQ Solomonic Builders Development Corp."
  },
  {
    "projectCode": "22-RI63BRD659",
    "name": "Concreting of kadigasan - Kadingilan road (Gap Section), Midsayap",
    "contractor": "Mindanao Construction Services and Land Development Corp."
  },
  {
    "projectCode": "22-RI63BRD660",
    "name": "Concreting of Damatulan road phase 3, Midsayap",
    "contractor": "DINGO Builders and Supply"
  },
  {
    "projectCode": "22-RI63BRD661",
    "name": "Concreting of Brgy. Kibayao Road Phase 3, Carmen",
    "contractor": "ACQ Solomonic Builders Development Corp."
  },
  {
    "projectCode": "22-RI63BRD662",
    "name": "Concreting of Brgy. Kitulaan Road Phase 3, Carmen",
    "contractor": "ACQ Solomonic Builders Development Corp."
  },
  {
    "projectCode": "22-RI63BRD663",
    "name": "Concreting of Brgy. Langogan Road Phase 3, Carmen",
    "contractor": "ACQ Solomonic Builders Development Corp."
  },
  {
    "projectCode": "22-RI63BRD667",
    "name": "Concreting of Tapodoc road Phase 3, Aleosan",
    "contractor": "ARGE Construction and Supply"
  },
  {
    "projectCode": "22-RI63BRD668",
    "name": "Concreting of Brgy. Dunguan Road Phase 3 , Aleosan",
    "contractor": "ARGE Construction and Supply"
  },
  {
    "projectCode": "22-RI63BRD671",
    "name": "Concreting of Brgy. Road from Datu Binasing to Balacayon, Pigcawayan",
    "contractor": "Prestige-Builders Construction"
  },
  {
    "projectCode": "22-RI63BWS695",
    "name": "Construction of Water System Level II, Brgy. Gokotan, Pikit",
    "contractor": "J-1 Builders Corporation"
  },
  {
    "projectCode": "22-RI63BWS696",
    "name": "Construction of Water System Level II, Brgy. Nunguan, Pikit",
    "contractor": "J-1 Builders Corporation"
  },
  {
    "projectCode": "22-RI63BWS697",
    "name": "Construction of Water System Level II, Brgy. Bulol, Pikit",
    "contractor": "SHAN Construction & Enterprises"
  },
  {
    "projectCode": "22-RI63BWS698",
    "name": "Construction of Water System Level II, Brgy. Forth Pikit, Pikit",
    "contractor": "TG Construction"
  },
  {
    "projectCode": "22-RI63BWS699",
    "name": "Construction of Water System Level II, Brgy. Lower Baguer, Pigcawayan",
    "contractor": "BONG DAUDIE Construction"
  },
  {
    "projectCode": "22-RI63BWS700",
    "name": "Construction of Water System Level II, Brgy. Macasendeg, Pikit",
    "contractor": "KEAN Construction"
  },
  {
    "projectCode": "22-RI63BWS701",
    "name": "Construction of Water System Level II, Brgy. Libungan Torreta, Pigcawayan",
    "contractor": "Infineat Construction"
  },
  {
    "projectCode": "22-RI63BWS702",
    "name": "Construction of Water System Level II, Brgy. Matilac, Pigcawayan",
    "contractor": "BONG DAUDIE Construction"
  },
  {
    "projectCode": "22-RI63BWS703",
    "name": "Construction of Water System Level II, Brgy. Kadingilan, Pigcawayan",
    "contractor": "BONG DAUDIE Construction"
  },
  {
    "projectCode": "22-RI63BWS704",
    "name": "Construction of Water System Level II, Brgy. Datu Mantil, Pigcawayan",
    "contractor": "BONG DAUDIE Construction"
  },
  {
    "projectCode": "22-RI63BWS705",
    "name": "Construction of Water System Level II, Brgy. Upper Pangangkalan, Pigcawayan",
    "contractor": "Infineat Construction"
  },
  {
    "projectCode": "22-RI63BWS706",
    "name": "Construction of Water System Level II, Brgy. Lower Pangangkalan, Pigcawayan",
    "contractor": "Infineat Construction"
  },
  {
    "projectCode": "22-RI63BWS707",
    "name": "Construction of Water System Level II, Brgy. Balacayon, Pigcawayan",
    "contractor": "BONG DAUDIE Construction"
  },
  {
    "projectCode": "22-RI63BWS708",
    "name": "Construction of Water System Level II, Brgy. Kitulaan, Carmen",
    "contractor": "AL MOHANDIS Construction Company"
  },
  {
    "projectCode": "22-RI63BWS709",
    "name": "Construction of Water System Level II, Brgy. Langogan, Carmen",
    "contractor": "KLD Engineering Construction"
  },
  {
    "projectCode": "22-RI63BWS710",
    "name": "Construction of Water System Level II, Brgy. Manarapan, Carmen",
    "contractor": "AL MOHANDIS Construction Company"
  },
  {
    "projectCode": "22-RI63BWS711",
    "name": "Construction of Water System Level II, Brgy. Nasapian, Carmen",
    "contractor": "Rysha Enterprises"
  },
  {
    "projectCode": "22-RI63BWS712",
    "name": "Construction of Water System Level II, Brgy. Pebpoloan, Carmen",
    "contractor": "KLD Engineering Construction"
  },
  {
    "projectCode": "22-RI63BWS713",
    "name": "Construction of Water System Level II, Brgy. Barungis, Pikit",
    "contractor": "TG Construction"
  },
  {
    "projectCode": "22-RI63BWS714",
    "name": "Construction of Water System Level II, Brgy. Kabasalan, Pikit",
    "contractor": "SHAN Construction & Enterprises"
  },
  {
    "projectCode": "22-RI63BWS715",
    "name": "Construction of Water System Level II, Brgy. Balong, Pikit",
    "contractor": "TG Construction"
  },
  {
    "projectCode": "22-RI63BWS716",
    "name": "Construction of Water System Level II, Brgy. Bualan, Pikit",
    "contractor": "TG Construction"
  },
  {
    "projectCode": "22-RI63BWS717",
    "name": "Construction of Water System Level II, Brgy. Pamalian, Pikit",
    "contractor": "BARRIST Builders and Construction Supply"
  },
  {
    "projectCode": "22-RI63BWS718",
    "name": "Construction of Water System Level II, Brgy. Rajah Muda, Pikit",
    "contractor": "SHAN Construction & Enterprises"
  },
  {
    "projectCode": "22-RI63BWS719",
    "name": "Construction of Water System Level II, Brgy. Bagoinged, Pikit",
    "contractor": "SHAN Construction & Enterprises"
  },
  {
    "projectCode": "22-RI63BWS720",
    "name": "Construction of Water System Level II, Brgy. Buliok, Pikit",
    "contractor": "TG Construction"
  },
  {
    "projectCode": "22-RI63BWS721",
    "name": "Construction of Water System Level II, Brgy. Dunguan, Aleosan",
    "contractor": "KLD Engineering Construction"
  },
  {
    "projectCode": "22-RI63BWS722",
    "name": "Construction of Water System Level II, Brgy. Tapodoc, Aleosan",
    "contractor": "KLD Engineering Construction"
  },
  {
    "projectCode": "22-RI63BWS723",
    "name": "Construction of Water System Level II, Brgy. Damatulan, Midsayap",
    "contractor": "KLD Engineering Construction"
  },
  {
    "projectCode": "22-RI63BWS724",
    "name": "Construction of Water System Level II, Brgy. Kadigasan, Midsayap",
    "contractor": "KLD Engineering Construction"
  },
  {
    "projectCode": "22-RI63BWS725",
    "name": "Construction of Water System Level II, Brgy. Kudarangan, Midsayap",
    "contractor": "Micah Construction & Supply"
  },
  {
    "projectCode": "22-RI63BWS726",
    "name": "Construction of Water System Level II, Brgy. Olandang, Midsayap",
    "contractor": "Micah Construction & Supply"
  },
  {
    "projectCode": "22-RI63BWS727",
    "name": "Construction of Water System Level II, Brgy. Simone, Kabacan",
    "contractor": "TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "22-RI63BWS728",
    "name": "Construction of Water System Level II, Brgy. Buluan, Kabacan",
    "contractor": "TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "22-RI63BWS729",
    "name": "Construction of Water System Level II, Brgy. Simbuhay, Kabacan",
    "contractor": "TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "22-RI63BWS730",
    "name": "Construction of Water System Level II, Brgy. Tamped, Kabacan",
    "contractor": "TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "22-RI63BWS731",
    "name": "Construction of Water System Level II, Brgy. Pedtad, Kabacan",
    "contractor": "TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "22-RI63BWS732",
    "name": "Construction of Water System Level II, Brgy. Gli-Gli, Pikit",
    "contractor": "TG Construction"
  },
  {
    "projectCode": "22-RI63BWS733",
    "name": "Construction of Water System Level II, Brgy. Macabual, Pikit",
    "contractor": "TG Construction"
  },
  {
    "projectCode": "22-RI63BWS734",
    "name": "Construction of Water System Level II, Brgy. Lagunde, Pikit",
    "contractor": "TG Construction"
  },
  {
    "projectCode": "22-RI63BWS735",
    "name": "Construction of Water System Level II, Brgy. Manaulanan, Pikit",
    "contractor": "BARRIST Builders and Construction Supply"
  },
  {
    "projectCode": "22-RI63BWS736",
    "name": "Construction of Water System Level II, Brgy. Nalapaan, Pikit",
    "contractor": "TG Construction"
  },
  {
    "projectCode": "22-RI63BWS737",
    "name": "Construction of Water System Level II, Brgy. Panicupan, Pikit",
    "contractor": "TG Construction"
  },
  {
    "projectCode": "22-RI63BWS738",
    "name": "Construction of Water System Level II, Brgy. Tupig, Carmen",
    "contractor": "Rysha Enterprises"
  },
  {
    "projectCode": "22-RI63BWS739",
    "name": "Construction of Water System Level II, Brgy. Nangaan, Kabacan",
    "contractor": "TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "22-RI63BWS740",
    "name": "Construction of Water System Level II, Brgy. Sanggadong, Kabacan",
    "contractor": "E & D Construction"
  },
  {
    "projectCode": "22-RI63BWS741",
    "name": "Construction of Water System Level II, Brgy. Patot, Pigcawayan",
    "contractor": "CONFIACON Construction and Engineering"
  },
  {
    "projectCode": "22-RI63BWS742",
    "name": "Construction of Water System Level II, Brgy. Kapinpilan, Midsayap",
    "contractor": "BONG DAUDIE Construction"
  },
  {
    "projectCode": "22-RI63BWS743",
    "name": "Construction of Water System Level II, Brgy. Sambulawan, Midsayap",
    "contractor": "BONG DAUDIE Construction"
  },
  {
    "projectCode": "22-RI63BWS744",
    "name": "Construction of Water System Level II, Brgy. Malingao, Midsayap",
    "contractor": "Micah Construction & Supply"
  },
  {
    "projectCode": "22-RI63BWS745",
    "name": "Construction of Water System Level II, Brgy. Tumbras, Midsayap",
    "contractor": "Micah Construction & Supply"
  },
  {
    "projectCode": "22-RI63BWS746",
    "name": "Construction of Water System Level II, Brgy. Tugal, Midsayap",
    "contractor": "Micah Construction & Supply"
  },
  {
    "projectCode": "22-RI63BWS747",
    "name": "Construction of Water System Level II, Brgy. Simsiman, Pigcawayan",
    "contractor": "BONG DAUDIE Construction"
  },
  {
    "projectCode": "22-RI63BBR694",
    "name": "Construction of Libungan Torreta (Pigcawayan) - Kabuntalan Bridge Phase 2",
    "contractor": "LICSAL CONSTRUCTION CORP."
  },
  {
    "projectCode": "22-RI63BFC748",
    "name": "Construction of Flood Mitigation Structure at Brgy. Nabundas, Pikit",
    "contractor": "ACGR Development Construction & Supply"
  },
  {
    "projectCode": "22-RI63BFC749",
    "name": "Construction of Flood Mitigation Structure at Brgy. Fort Pikit, Pikit",
    "contractor": "ACGR Development Construction & Supply"
  },
  {
    "projectCode": "22-RI63BFC750",
    "name": "Construction of Flood Mitigation Structure at Brgy. Balongis, Pikit",
    "contractor": "ACGR Development Construction & Supply"
  },
  {
    "projectCode": "22-RI63BFC751",
    "name": "Construction of Flood Mitigation Structure at Brgy. Macasendeg, Pikit",
    "contractor": "ACGR Development Construction & Supply"
  },
  {
    "projectCode": "22-RI63BFC752",
    "name": "Construction of Flood Mitigation Structure at Brgy. Kabasalan, Pikit",
    "contractor": "ACGR Development Construction & Supply"
  },
  {
    "projectCode": "22-RI63BFC753",
    "name": "Construction of Flood Mitigation Structure at Brgy. Barungis, Pikit",
    "contractor": "ACGR Development Construction & Supply"
  },
  {
    "projectCode": "22-RI63BFC754",
    "name": "Construction of Flood Mitigation Structure at Brgy. Buliok , Pikit",
    "contractor": "ACGR Development Construction & Supply"
  },
  {
    "projectCode": "22-RI63BFC755",
    "name": "Construction of Flood Mitigation Structure at Brgy. Baguinged, Pikit",
    "contractor": "ACGR Development Construction & Supply"
  },
  {
    "projectCode": "22-RI63BFC756",
    "name": "Construction of Flood Mitigation Structure at Brgy. Rajah Muda, Pikit",
    "contractor": "ACGR Development Construction & Supply"
  },
  {
    "projectCode": "22-RI63BFC757",
    "name": "Construction of Box Culvert (Double Barrel),Brgy. Bulol, Pikit",
    "contractor": "Mark Anthony Construction and Supply"
  },
  {
    "projectCode": "22-RI63BFC758",
    "name": "Construction of Box Culvert,Brgy. Kabasalan, Pikit",
    "contractor": "MALAGUENA Construction"
  },
  {
    "projectCode": "22-RI63BFC759",
    "name": "Construction of Flood Mitigation Structure at Brgy. Simone, Kabacan",
    "contractor": "LICSAL CONSTRUCTION CORP."
  },
  {
    "projectCode": "22-RI63BFC760",
    "name": "Construction of Flood Mitigation Structure at Brgy. Simbuhay, Kabacan",
    "contractor": "GABRIELLAS Enterprises"
  },
  {
    "projectCode": "22-RI63BFC761",
    "name": "Construction of Flood Mitigation Structure at Brgy. Tamped, Kabacan",
    "contractor": "GABRIELLAS Enterprises"
  },
  {
    "projectCode": "22-SDF63BRD041",
    "name": "Concreting of Brgy. Bulol Road Phase 3, Pikit,",
    "contractor": "IJG Construction"
  },
  {
    "projectCode": "22-SDF63BRD042",
    "name": "Construction (Opening) Access Road At Camp Usman, Brgy. Simone, Kabacan",
    "contractor": "TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "22-SDF63BBR043",
    "name": "Construction of Bridge Connecting Nangaan - Simone, Kabacan",
    "contractor": "APEIRON Constuction Solutions"
  },
  {
    "projectCode": "22-SDF63BOI044",
    "name": "Construction of Warehouse with Solar Dryer, Sitio Sampaloc, Brgy. Pebpoloan, Carmen, North Cotabato",
    "contractor": "KAPALAWAN Construction"
  },
  {
    "projectCode": "23-RI63BRD470",
    "name": "Concreting of Brgy. Manarapan - Brgy. Langogan, Carmen",
    "contractor": "ESMCSIL Construction & Agri Venture, Inc."
  },
  {
    "projectCode": "23-RI63BRD471",
    "name": "Upgrading of Road from Manaulanan-Inatilan Boundary to Manaulanan Elementary School Phase 2, Pikit",
    "contractor": "KAPALAWAN Construction"
  },
  {
    "projectCode": "23-RI63BRD472",
    "name": "Concreting of Brgy. Buricain Road Phase 4, Pigcawayan",
    "contractor": "ARS Construction and Supply"
  },
  {
    "projectCode": "23-RI63BRD473",
    "name": "Concreting of Brgy. Simsiman Road Phase 3, Pigcawayan",
    "contractor": "YG Construction Services"
  },
  {
    "projectCode": "23-RI63BRD474",
    "name": "Concreting of Brgy. Datu Binasing Road Phase 2, Pigcawayan",
    "contractor": "TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "23-RI63BRD475",
    "name": "Construction of Brgy. Datu Binasing to Crossing Buricain Road, Pigcawayan",
    "contractor": "BLUEMOUNTAIN Developers and Construction Supply"
  },
  {
    "projectCode": "23-RI63BRD476",
    "name": "Construction of Swip Road, Pigcawayan",
    "contractor": "HAQ Construction"
  },
  {
    "projectCode": "23-RI63BRD477",
    "name": "Concreting of Brgy. Kadingilan Road Phase 3, Pigcawayan",
    "contractor": "ARS Construction and Supply"
  },
  {
    "projectCode": "23-RI63BRD478",
    "name": "Construction of Brgy. Damatulan Road Phase 4, Midsayap",
    "contractor": "GC & S CONSTRUCTION & SUPPLY"
  },
  {
    "projectCode": "23-RI63BRD479",
    "name": "Construction of Brgy. Kadingilan Road Phase 3, Midsayap",
    "contractor": "PADER Construction & Supply"
  },
  {
    "projectCode": "23-RI63BRD480",
    "name": "Concreting of Brgy. Tumbras Road Phase 3, Midsayap",
    "contractor": "HAQ Construction"
  },
  {
    "projectCode": "23-RI63BRD481",
    "name": "Concreting of Brgy. Tugal Road Phase 3, Midsayap",
    "contractor": "River-Stone Construction Services"
  },
  {
    "projectCode": "23-RI63BRD482",
    "name": "Concreting of Brgy. Tumbras to Brgy. Malingao Road, Midsayap",
    "contractor": "DQMB Construction & Supply Corp."
  },
  {
    "projectCode": "23-RI63BRD483",
    "name": "Concreting of Brgy. Dunguan Road Phase 4, Aleosan",
    "contractor": "RESH Construction Services"
  },
  {
    "projectCode": "23-RI63BRD484",
    "name": "Concreting of Brgy. Tapodoc Road Phase 4, Aleosan",
    "contractor": "NKU Construction & Supply"
  },
  {
    "projectCode": "23-RI63BRD485",
    "name": "Concreting of Brgy. Pedtad Road Phase 3, Kabacan",
    "contractor": "TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "23-RI63BRD486",
    "name": "Concreting of Brgy. Sanggadong Road Phase 3, Kabacan",
    "contractor": "ESMCSIL Construction & Agri Venture, Inc."
  },
  {
    "projectCode": "23-RI63BRD487",
    "name": "Concreting of Brgy. Nangaan to Brgy. Simone Road, Kabacan",
    "contractor": "TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "23-RI63BRD488",
    "name": "Concreting of Brgy. Buluan to Brgy. Nangaan Road, Kabacan",
    "contractor": "ALQADR Construction"
  },
  {
    "projectCode": "23-RI63BRD489",
    "name": "Concreting of Brgy. Tamped Road Phase 3, Kabacan",
    "contractor": "TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "23-RI63BRD490",
    "name": "Concreting of Brgy. Tupig Road Phase 3, Carmen",
    "contractor": "DQMB Construction & Supply Corp."
  },
  {
    "projectCode": "23-RI63BRD491",
    "name": "Concreting of Brgy. Langogan Road Phase 4, Carmen",
    "contractor": "MJ Tiongson Construction/EB Marzan (JV)"
  },
  {
    "projectCode": "23-RI63BRD492",
    "name": "Concreting of Brgy. Kibayao to Brgy. Nasapian Road, Carmen",
    "contractor": "DQMB Construction & Supply Corp."
  },
  {
    "projectCode": "23-RI63BRD493",
    "name": "Construction of Brgy. Kitulaan - Brgy. Pebpoloan - Brgy. Langogan Road, Carmen",
    "contractor": "EB MARZAN Trucking and Construction Inc."
  },
  {
    "projectCode": "23-RI63BRD494",
    "name": "Construction of Brgy. Pebpoloan Road Phase 3, Carmen",
    "contractor": "EB MARZAN Trucking and Construction Inc."
  },
  {
    "projectCode": "23-RI63BRD495",
    "name": "Concreting of Brgy. Nabundas Road Phase 3, Pikit",
    "contractor": "SANNY Construction"
  },
  {
    "projectCode": "23-RI63BRD496",
    "name": "Concreting of Brgy. Gokotan Road Phase 3, Pikit",
    "contractor": "KAPALAWAN Construction"
  },
  {
    "projectCode": "23-RI63BRD497",
    "name": "Concreting of Brgy. Rajah Muda Road Phase 3, Pikit",
    "contractor": "TG Construction"
  },
  {
    "projectCode": "23-RI63BRD498",
    "name": "Concreting of Brgy. Nalapaan Road (Gap Section), Pikit",
    "contractor": "KAPALAWAN Construction"
  },
  {
    "projectCode": "23-RI63BBR499",
    "name": "Construction of Patot Bridge, Pigcawayan",
    "contractor": "LICSAL CONSTRUCTION CORP."
  },
  {
    "projectCode": "23-RI63BFC500",
    "name": "Construction of Grouted Riprap, Brgy. Libungan Toretta, Pigcawayan",
    "contractor": "CONFIACON Construction and Engineering"
  },
  {
    "projectCode": "23-RI63BFC501",
    "name": "Construction of Grouted Riprap, Upper Pangangkalan, Pigcawayan",
    "contractor": "AMMARA Strukture Construction Services"
  },
  {
    "projectCode": "23-RI63BFC502",
    "name": "Construction of Flood Mitigation Structure Phase 2, Brgy. Simone, Kabacan",
    "contractor": "SEE Construction and Supply"
  },
  {
    "projectCode": "23-RI63BFC503",
    "name": "Construction of Earth Dike from Brgy. Lower Baguer-Brgy. Lower Pangangkalan, Pigcawayan",
    "contractor": "LICSAL CONSTRUCTION CORP."
  },
  {
    "projectCode": "23-RI63BFC504",
    "name": "Construction of Earth Dike from Brgy. Simsiman - Brgy. Buricain - Brgy. Balacayon, Pigcawayan",
    "contractor": "TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "23-RI63BFC505",
    "name": "Construction of Earth Dike from Brgy. Mudseng - Brgy. Olandang, Midsayap",
    "contractor": "O.G Santos Constrcution/ E21 Builders (JV)"
  },
  {
    "projectCode": "23-RI63BFC506",
    "name": "Construction of Earth Dike from Brgy. Olandang- Brgy. Kadigasan, Midsayap",
    "contractor": "EB MARZAN Trucking and Construction Inc."
  },
  {
    "projectCode": "23-RI63BFC507",
    "name": "Construction of Earth Dike from Brgy. Kadingilan-Brgy. Sambulawan, Midsayap",
    "contractor": "Sunstone Construction and Supply"
  },
  {
    "projectCode": "23-RI63BOI509",
    "name": "Concreting of Shoulder from Brgy. Simsiman - Brgy.Buricain - Brgy.Balacayon - Brgy. Matilac - Brgy.Kadingilan - Brgy.Datu Mantil - Brgy.Libungan Torreta , Pigcawayan",
    "contractor": "LICSAL CONSTRUCTION CORP."
  },
  {
    "projectCode": "23-SDFSGARD068",
    "name": "Concreting of Farm to Market Road (FMR) at Sitio Upper Ganassi, Brgy. Nunguan, Pikit",
    "contractor": "KAPALAWAN Construction"
  },
  {
    "projectCode": "23-SDFSGARD069",
    "name": "Construction of Road at Brgy. Bulol- Brgy. Kabasalan, Pikit",
    "contractor": "FORTSTONE CONSTRUCTION ENTERPRISES"
  },
  {
    "projectCode": "23-SDFSGARD070",
    "name": "Construction of Road at Brgy. Buliok (Phase 3), Pikit",
    "contractor": "TG Construction"
  },
  {
    "projectCode": "23-SDFSGAFC071",
    "name": "Construction of Flood Mitigation Structure, Phase 3, Brgy. Simone, Kabacan",
    "contractor": "KAPALAWAN Construction"
  },
  {
    "projectCode": "23-TD1463B001",
    "name": "Concreting of Barangay Road/FMR at Crossing Kadingilan, Brgy. Nabalawag, Midsayap",
    "contractor": "MEGABLUE Konstrak Corporation"
  },
  {
    "projectCode": "23-TD0163B004",
    "name": "Concreting of Barangay Road/FMR, Sitio Pasagui, Brgy. Rajah Muda, Pikit, North Cotabato",
    "contractor": "TG Construction"
  },
  {
    "projectCode": "23-TD0163B003",
    "name": "Construction of Water system, Sitio Diaden, Brgy. Balungis, Pikit, North Cotabato",
    "contractor": "C.M. Construction"
  },
  {
    "projectCode": "23-TD6763B055",
    "name": "Construction of One (Storey, Two (2) Classrooms School Building in Basic and Madaris Education, Sitio Dagadas, Brgy. Buliok, Pikit, North Cotabato",
    "contractor": "C.M. Construction"
  },
  {
    "projectCode": "23-TD2163B106",
    "name": "Construction of Multi-Purpose Building, Brgy. Malingao, Midsayap, North Cotabato",
    "contractor": "ALQADR Construction"
  },
  {
    "projectCode": "23-TD7363B120",
    "name": "Installation of Solar Street Light, Tamped-Simbuay-Sanggadong-Pedtad-Buluan-Simone-Nangaan, Kabacan, North Cotabato",
    "contractor": "MIM Construction"
  },
  {
    "projectCode": "23-TD736B121",
    "name": "Installation of Solar Street Light, Kibayaw, Carmen, North Cotabato",
    "contractor": "MIM Construction"
  },
  {
    "projectCode": "23-TD7363B122",
    "name": "Installation of Solar Street Light, Nasapian, Carmen, North Cotabato",
    "contractor": "MIM Construction"
  },
  {
    "projectCode": "23-TD7363B123",
    "name": "Installation of Solar Street Light, Kitolaan, Carmen, North Cotabato",
    "contractor": "MIM Construction"
  },
  {
    "projectCode": "24-RISGARD804",
    "name": "Concreting of Road at Brgy. Nalapaan - Brgy.Lagunde, Malidegao",
    "contractor": "ANIMAS BROS Construction Corporation"
  },
  {
    "projectCode": "24-RISGARD805",
    "name": "Construction of Road at Purok 1, Brgy. Simsiman, Pahamuddin",
    "contractor": "AMP's Construction"
  },
  {
    "projectCode": "24-RISGARD806",
    "name": "Construction of Road at Sitio Bangon, Brgy. Simsiman, Pahamuddin",
    "contractor": "AMP's Construction"
  },
  {
    "projectCode": "24-RISGARD807",
    "name": "Construction of Road Dike (Earth) at Brgy. Libungan Torreta, Pahamuddin",
    "contractor": "AMP's Construction"
  },
  {
    "projectCode": "24-RISGARD808",
    "name": "Construction of Road at Purok 3, Brgy. Buricain, Pahamuddin",
    "contractor": "IMACS Builders"
  },
  {
    "projectCode": "24-RISGARD809",
    "name": "Construction of Road at Purok 2, Brgy. Buricain, Pahamuddin",
    "contractor": "BHUILDER'S Construction"
  },
  {
    "projectCode": "24-RISGARD810",
    "name": "Construction of Road at Brgy. Buricain - Brgy. Matilac, Pahamuddin",
    "contractor": "ARS Construction and Supply"
  },
  {
    "projectCode": "24-RISGARD811",
    "name": "Concreting of Road at Sitio Sumlay, Purok 4, Brgy. Matilac, Pahamuddin",
    "contractor": "NKU Construction & Supply"
  },
  {
    "projectCode": "24-RISGARD812",
    "name": "Concreting of Road at Brgy. Matilac (Gap Section), Pahamuddin",
    "contractor": "ARS Construction and Supply"
  },
  {
    "projectCode": "24-RISGARD813",
    "name": "Construction of Road at Brgy. Lower Baguer (Phase 3), Pahamuddin",
    "contractor": "AKV BUILDERS and Construction Supplies"
  },
  {
    "projectCode": "24-RISGARD814",
    "name": "Construction of Road at Purok 4, Brgy. Patot, Pahamuddin",
    "contractor": "AMANAH Construction Services"
  },
  {
    "projectCode": "24-RISGARD815",
    "name": "Concreting of Road at Purok 1, Brgy. Buricain, Pahamuddin",
    "contractor": "KLD Engineering Construction"
  },
  {
    "projectCode": "24-RISGARD816",
    "name": "Construction of Road at Purok 1, Brgy. Central Labas, Kadayangan",
    "contractor": "BATUA Engineering Services and Construction Supply"
  },
  {
    "projectCode": "24-RISGARD817",
    "name": "Construction of Road at Brgy. Tumbras (Phase 4), Kadayangan",
    "contractor": "ECOMIXED Construction and Development Corporation"
  },
  {
    "projectCode": "24-RISGARD818",
    "name": "Construction of Road at Sitio Damagi - Sitio Basak, Brgy. Tugal, Kadayangan",
    "contractor": "PHILTIL Construction"
  },
  {
    "projectCode": "24-RISGARD819",
    "name": "Construction of Road at Purok 1 - Purok 6, Brgy. Mudseng, Kadayangan",
    "contractor": "BLUE BLADE Construction Supply"
  },
  {
    "projectCode": "24-RISGARD820",
    "name": "Construction of Road at Brgy. Kadingilan - Brgy. Damatulan (Phase 1), Nabalawag",
    "contractor": "BANDAR KUTAWATO Construction and Supply"
  },
  {
    "projectCode": "24-RISGARD821",
    "name": "Concreting of Road at Brgy. Kadigasan - Brgy. Damatulan (Gap Section), Nabalawag",
    "contractor": "E21 Builders, Inc."
  },
  {
    "projectCode": "24-RISGARD822",
    "name": "Construction of Road at Brgy. Malingao - Northern Kabuntalan, Kadayangan",
    "contractor": "NKU Construction & Supply"
  },
  {
    "projectCode": "24-RISGARD823",
    "name": "Construction of Road at Sitio Milikano, Brgy. Kadingilan, Nabalawag",
    "contractor": "SILVER ROAD Construction"
  },
  {
    "projectCode": "24-RISGARD824",
    "name": "Concreting of Road at Brgy. Mudseng (Phase 3), Kadayangan",
    "contractor": "SILVER ROAD Construction"
  },
  {
    "projectCode": "24-RISGARD825",
    "name": "Construction of Road at Sitio Sulok, Brgy. Dunguan, Nabalawag",
    "contractor": "RESH Construction Services"
  },
  {
    "projectCode": "24-RISGARD826",
    "name": "Concreting of Road at Purok 2, Brgy. Sanggadong, Old Kaabakan",
    "contractor": "NKG Construction"
  },
  {
    "projectCode": "24-RISGARD827",
    "name": "Concreting of Road at Brgy. Sanggadong (Gap Section), Old Kaabakan",
    "contractor": "ESMCSIL Construction & Agri Venture, Inc."
  },
  {
    "projectCode": "24-RISGARD828",
    "name": "Concreting of Road at Purok 1, Brgy. Sanggadong, Old Kaabakan",
    "contractor": "NKG Construction"
  },
  {
    "projectCode": "24-RISGARD829",
    "name": "Construction of Road at Brgy. Pedtad (Phase 4), Old Kaabakan",
    "contractor": "SANNY Construction"
  },
  {
    "projectCode": "24-RISGARD830",
    "name": "Concreting of Road at Sitio Proper, Brgy. Pedtad, Old Kaabakan",
    "contractor": "TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "24-RISGARD831",
    "name": "Construction of Road at Sitio Simandig, Brgy. Buluan, Old Kaabakan",
    "contractor": "SANNY Construction"
  },
  {
    "projectCode": "24-RISGARD832",
    "name": "Concreting of Road at Brgy. Nangaan - Brgy. Simone (Phase 2), Old Kaabakan",
    "contractor": "TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "24-RISGARD833",
    "name": "Construction of Road at Sitio Tumbao, Brgy. Simbuhay, Old Kaabakan",
    "contractor": "KAPALAWAN Construction"
  },
  {
    "projectCode": "24-RISGARD834",
    "name": "Construction of Road at Sitio Kawayan, Brgy. Tamped, Old Kaabakan",
    "contractor": "TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "24-RISGARD835",
    "name": "Construction of Road at Sitio Pagadatan,Brgy. Langogan, Kapalawan",
    "contractor": "MALAGUENA Construction"
  },
  {
    "projectCode": "24-RISGARD836",
    "name": "Concreting of Road at Sitio Linek - Sitio Bulibod, Brgy.Langogan, Kapalawan",
    "contractor": "MALAGUENA Construction"
  },
  {
    "projectCode": "24-RISGARD837",
    "name": "Construction of Road at Sitio Pinguiaman , Brgy. Kitulaan (Phase 1) , Kapalawan",
    "contractor": "EB MARZAN Trucking and Construction Inc."
  },
  {
    "projectCode": "24-RISGARD838",
    "name": "Construction of Road at Brgy. Kitulaan - Brgy. Manarapan, Kapalawan",
    "contractor": "EB MARZAN Trucking and Construction Inc."
  },
  {
    "projectCode": "24-RISGARD839",
    "name": "Construction of Road at Brgy. Manarapan (Phase 3), Kapalawan",
    "contractor": "ESMCSIL Construction & Agri Venture, Inc."
  },
  {
    "projectCode": "24-RISGARD840",
    "name": "Construction of Road at Brgy. Manarapan - Brgy. Langogan (Phase 2), Kapalawan",
    "contractor": "EB MARZAN Trucking and Construction Inc."
  },
  {
    "projectCode": "24-RISGARD841",
    "name": "Construction of Road at Brgy. Kibayao - Brgy. Nasapian (Phase 2), Kapalawan",
    "contractor": "KAPALAWAN Construction"
  },
  {
    "projectCode": "24-RISGARD842",
    "name": "Concreting of Road at Sitio Sambayangan, Brgy. Tupig, Kapalawan",
    "contractor": "EB MARZAN Trucking and Construction Inc."
  },
  {
    "projectCode": "24-RISGAWS843",
    "name": "Construction of Water System Level 2, Sitio Mahad, Brgy. Manaulanan, Tugunan",
    "contractor": "IJG Construction"
  },
  {
    "projectCode": "24-RISGAWS844",
    "name": "Construction of Water System Level 2, Brgy. Kibayao, Kapalawan",
    "contractor": "IJG Construction"
  },
  {
    "projectCode": "24-RISGAPO845",
    "name": "Construction of Fish Port with Landing, Brgy. Lower Pangangkalan, Pahamuddin",
    "contractor": "ARKB Construction"
  },
  {
    "projectCode": "24-RISGABR846",
    "name": "Construction of Libungan Torreta (Pigcawayan) - Kabuntalan Bridge Phase 3",
    "contractor": "LICSAL CONSTRUCTION CORP."
  },
  {
    "projectCode": "24-RISGAFC847",
    "name": "Construction of Flood Control Structure, Brgy. Libungan Toretta, Pahamuddin",
    "contractor": "E21 Builders, Inc."
  },
  {
    "projectCode": "24-RISGAFC848",
    "name": "Construction of Flood Control Structure, Brgy. Upper Pangangkalan, Pahamuddin",
    "contractor": "AMANAH Construction Services"
  },
  {
    "projectCode": "24-RISGAFC849",
    "name": "Construction of Flood Control Structure, Brgy. Lower Pangangkalan, Pahamuddin",
    "contractor": "ESMCSIL Construction & Agri Venture, Inc."
  },
  {
    "projectCode": "24-RISGAFC850",
    "name": "Construction of Flood Control Structure (Phase 2), Brgy. Nabundas, Malidegao",
    "contractor": "ECBJ EAST COAST Construction"
  },
  {
    "projectCode": "24-RISGAFC851",
    "name": "Construction of Flood Control Structure, Brgy. Buluan, Old Kaabakan",
    "contractor": "RENCH BUILDERS AND SUPPLY"
  },
  {
    "projectCode": "24-SF1363B193<br>",
    "name": "Concreting of Barangay Road/FMR, Brgy. Tupig, Kapalawan",
    "contractor": "EB MARZAN Trucking and Construction Inc."
  },
  {
    "projectCode": "24-SF0863B196",
    "name": "Concreting of Barangay Road/FMR",
    "contractor": "KEAN Construction"
  },
  {
    "projectCode": "24-SF0863B197",
    "name": "Construction of Multi-Purpose Building Brgy. Nabalawag, Nabalawag",
    "contractor": "MIM Construction"
  },
  {
    "projectCode": "24-SF2363B020",
    "name": "Construction of Multi-Purpose Building at Brgy. Buricain Pahamuddin",
    "contractor": "ENRA T-SQUARE Construction"
  },
  {
    "projectCode": "24-SF2363B034",
    "name": "Construction of Multi-Purpose Building, Brgy. Balacayon, Pahamuddin",
    "contractor": "ELBA Construction"
  },
  {
    "projectCode": "24-SF2363B255",
    "name": "Construction of Covered Court (Option 1), Brgy. Balacayon, Pahamuddin",
    "contractor": "ZIYADH CONSTRUCTION SERVICES"
  },
  {
    "projectCode": "24-SF2363B194",
    "name": "Construction of Covered Court (Option 1), Brgy. Buricain, Pahamuddin",
    "contractor": "ARKB Construction"
  },
  {
    "projectCode": "24-SF2363B205",
    "name": "Installation of Solar Street Lights at Brgy. Libungan Torreta, Pahamuddin",
    "contractor": "ENRA T-SQUARE Construction"
  },
  {
    "projectCode": "24-SF1563B217",
    "name": "Installation of Solar Street Lights",
    "contractor": "NKG Construction"
  },
  {
    "projectCode": "24-SF7363B238",
    "name": "Construction of Water System Level II (Option 1), Brgy. Simone, Old Kaabakan",
    "contractor": "SANNY Construction"
  },
  {
    "projectCode": "24-SF7363B239",
    "name": "Installation of Solar Street Lights",
    "contractor": "NKG Construction"
  },
  {
    "projectCode": "24-TD1463B001",
    "name": "Concreting of Road/ FMR, Crossing kapinpilan, Brgy. Tumbras, Kadayangan",
    "contractor": "AMMARA Strukture Construction Services"
  },
  {
    "projectCode": "24-TD6463B288",
    "name": "Concreting of Barangay Road/FMR, Sitio Navagvag, Brgy. Tamped, Old Kaabakan",
    "contractor": "KAPALAWAN Construction"
  },
  {
    "projectCode": "24-TD7363B084",
    "name": "Construction of Water System Level II (Option 1), Brgy. Tamped, Old Kaabakan",
    "contractor": "KAPALAWAN Construction"
  },
  {
    "projectCode": "24-TD7363B085",
    "name": "Construction of Water System Level II (Option 1), Brgy. Simsiman, Pahamuddin",
    "contractor": "ZIYADH CONSTRUCTION SERVICES"
  },
  {
    "projectCode": "24-TD1463B183",
    "name": "Rehabilitation of Hanging Bridge",
    "contractor": "-"
  },
  {
    "projectCode": "24-TD6163B091",
    "name": "Construction of Covered Court (Option 2), Brgy. Damatulan, Nabalawag",
    "contractor": "BANDAR KUTAWATO Construction and Supply"
  },
  {
    "projectCode": "24-TD0163B99",
    "name": "Construction of Multi-Purpose Building Brgy. Rajah Muda, Ligawasan",
    "contractor": "SHAN Construction & Enterprises"
  },
  {
    "projectCode": "24-TD0163B100",
    "name": "Construction of Covered Court (Option 2), Brgy. Gligli, Ligawasan",
    "contractor": "MIM Construction"
  },
  {
    "projectCode": "24-TD563B123",
    "name": "Installation of Solar Street Lights, Brgy. Batulawan, Malidegao",
    "contractor": "MIM Construction"
  },
  {
    "projectCode": "24-TD2163B159",
    "name": "Construction of Covered Court (Option 2), Brgy. Malingao, Kadayangan",
    "contractor": "ALQADR Construction"
  },
  {
    "projectCode": "24-TD1563B219",
    "name": "Construction of Warehouse with Solar Dryer, Brgy. Nalapaan, Malidegao",
    "contractor": "KAPALAWAN Construction"
  },
  {
    "projectCode": "24-TD7363B229",
    "name": "Installation of Solar Street Lights, Old Kaabakan",
    "contractor": "MIM Construction"
  },
  {
    "projectCode": "24-TD7363B230",
    "name": "Installation of Solar Street Lights, Kapalawan",
    "contractor": "MIM Construction"
  },
  {
    "projectCode": "25-RISGARD525",
    "name": "Concreting of Road at Sitio Proper, Brgy. Gokotan, Malidegao",
    "contractor": "TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "25-RISGARD526",
    "name": "Construction of Road Dike at Brgy. Balacayon - Brgy. Libungan Torreta, Pahamuddin",
    "contractor": "E21 Builders, Inc."
  },
  {
    "projectCode": "25-RISGARD527",
    "name": "Construction of Road at Brgy. Lower Baguer - Brgy. Balacayon, Pahamuddin",
    "contractor": "IZAAN CONSTRUCTION SERVICES"
  },
  {
    "projectCode": "25-RISGARD528",
    "name": "Construction of Road at Brgy. Tugal- Brgy. Mudseng, Kadayangan",
    "contractor": "NKG Construction"
  },
  {
    "projectCode": "25-RISGARD529",
    "name": "Concreting of Road at Sitio Tampat - Sitio Bintad, Brgy. Olandang, Nabalawag",
    "contractor": "ESMCSIL Construction & Agri Venture, Inc."
  },
  {
    "projectCode": "25-RISGARD530",
    "name": "Concreting of Road at Sitio Tampat - Sitio Bual, Brgy. Olandang, Nabalawag",
    "contractor": "ESMCSIL Construction & Agri Venture, Inc."
  },
  {
    "projectCode": "25-RISGARD531",
    "name": "Concreting of Road at Brgy. Batulawan - Brgy. Fort Pikit, Malidegao",
    "contractor": "IJG Construction"
  },
  {
    "projectCode": "25-RISGARD532",
    "name": "Construction of Road at Brgy. Lagunde (Phase 3), Tugunan",
    "contractor": "MIM Construction"
  },
  {
    "projectCode": "25-RISGARD533",
    "name": "Concreting of Road Brgy. Tapodoc - Brgy. Bualan, Tugunan",
    "contractor": "KAPALAWAN Construction"
  },
  {
    "projectCode": "25-RISGARD534",
    "name": "Concreting of Road at Purok 1 - Purok 2 - Purok 5, Brgy. Bualan, Tugunan",
    "contractor": "NKG Construction"
  },
  {
    "projectCode": "25-RISGARD535",
    "name": "Concreting of Road at Brgy. Pedtad (Phase 5), Old Kaabakan",
    "contractor": "SANNY Construction"
  },
  {
    "projectCode": "25-RISGARD536",
    "name": "Construction of Road at Sitio Bulukan, Brgy. Pebpoloan, Kapalawan",
    "contractor": "EB MARZAN Trucking and Construction Inc."
  },
  {
    "projectCode": "25-RISGARD537",
    "name": "Construction of Road at Sitio Huwebisan, Brgy. Tupig, Kapalawan",
    "contractor": "EB MARZAN Trucking and Construction Inc."
  },
  {
    "projectCode": "25-RISGARD538",
    "name": "Construction of Road at Brgy. Libungan Torreta (Phase 3), Pahamuddin",
    "contractor": "ARKB Construction"
  },
  {
    "projectCode": "25-RISGAWS539",
    "name": "Construction of Water System Level 2 , Purok 2, Brgy. Buricain, Pahamuddin",
    "contractor": "-"
  },
  {
    "projectCode": "25-RISGAWS540",
    "name": "Construction of Water System Level 2, Purok 3, Brgy. Buricain, Pahamuddin",
    "contractor": "RENCH BUILDERS AND SUPPLY"
  },
  {
    "projectCode": "25-RISGAWS541",
    "name": "Construction of Water System Level 2, Purok 3, Brgy. Libungan Torreta, Pahamuddin",
    "contractor": "AJ USMAN Construction Services"
  },
  {
    "projectCode": "25-RISGABR542",
    "name": "Construction of Bridge, Brgy. Pamalian, Tugunan",
    "contractor": "4AM Construction"
  },
  {
    "projectCode": "25-RISGABR543",
    "name": "Construction of Bridge, Sitio Pikeg, Brgy. Nasapian, Kapalawan",
    "contractor": "RENCH BUILDERS AND SUPPLY"
  },
  {
    "projectCode": "25-RISGAFC544",
    "name": "Construction of Flood Control Structure (Phase 2), Brgy. Libungan Torreta, Pahamuddin",
    "contractor": "E21 Builders, Inc."
  },
  {
    "projectCode": "25-RISGAFC545",
    "name": "Construction of Flood Control Structure (Phase 2), Brgy. Upper Pangangkalan, Pahamuddin",
    "contractor": "GENETIAN Builder & Enterprises, Inc."
  },
  {
    "projectCode": "25-RISGAFC546",
    "name": "Construction of Flood Control Structure (Phase 2), Brgy. Lower Pangangkalan, Pahamuddin",
    "contractor": "GENETIAN Builder & Enterprises, Inc."
  },
  {
    "projectCode": "25-RISGAFC547",
    "name": "Construction of Flood Control Structure (Phase 2), Brgy. Buluan, Old Kaabakan",
    "contractor": "RENCH BUILDERS AND SUPPLY"
  },
  {
    "projectCode": "25-RISGAFC548",
    "name": "Construction of Flood Control Structure, Purok 1-Purok 4, Brgy. Damatulan, Nabalawag",
    "contractor": "TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "25-RISGAFC549",
    "name": "Construction of Flood Control Structure (Phase 2), Brgy. Fort Pikit, Malidegao",
    "contractor": "ECBJ EAST COAST Construction"
  },
  {
    "projectCode": "25-RISGAFC550",
    "name": "Construction of Flood Control Structure (Phase 2), Brgy. Balungis, Malidegao",
    "contractor": "GT&M BUILDERS & SUPPLY CORP."
  },
  {
    "projectCode": "25-RISGAFC551",
    "name": "Construction of Flood Control Structure at Dimanalao Elementary School, Sitio Punol, Brgy. Batulawan, Malidegao",
    "contractor": "EB MARZAN Trucking and Construction Inc."
  },
  {
    "projectCode": "25-RISGAFC552",
    "name": "Construction of Flood Control Structure, Brgy. Gokotan, Malidegao",
    "contractor": "TAMONTAKA BUILDERS"
  },
  {
    "projectCode": "25-RISGAOI553",
    "name": "Installation of Solar Street Lights, Purok 3, Brgy. Malingao, Kadayangan",
    "contractor": "MIM Construction"
  },
  {
    "projectCode": "25-RISGAOI554",
    "name": "Installation of Solar Street Lights, Purok 4- Purok 7, Brgy. Malingao, Kadayangan",
    "contractor": "MIM Construction"
  },
  {
    "projectCode": "25-RISGAOI555",
    "name": "Installation of Solar Street lights, Sitio Popoyon - Sitio Rehab, Brgy. Dunguan, Nabalawag",
    "contractor": "KAPALAWAN Construction"
  },
  {
    "projectCode": "25-RISGAOI556",
    "name": "Installation of Solar Street Lights, Brgy. Dunguan, Nabalawag",
    "contractor": "KAPALAWAN Construction"
  },
  {
    "projectCode": "25-RISGAOI557",
    "name": "Installation of Solar Street Lights, Sitio Alagasi, Brgy. Nalapaan, Malidegao",
    "contractor": "RNS Construction Engineering"
  },
  {
    "projectCode": "25-RISGAOI558",
    "name": "Installation of Solar Street Lights, Sitio Proper, Brgy.Bulol, Ligawasan",
    "contractor": "KAPALAWAN Construction"
  },
  {
    "projectCode": "25-RISGAOI559",
    "name": "Installation of Solar Street Lights, Brgy. Tapodoc, Tugunan",
    "contractor": "SANNY Construction"
  },
  {
    "projectCode": "25-RISGAOI560",
    "name": "Construction of Government Center, Brgy. Libungan Torreta, Pahamuddin",
    "contractor": "-"
  },
  {
    "projectCode": "25-RISGAOI561",
    "name": "Construction of Public Market, Brgy. Libungan Torreta, Pahamuddin",
    "contractor": "ENRA T-SQUARE Construction"
  },
  {
    "projectCode": "25-RISGAOI562",
    "name": "Construction of Public Market, Brgy. Simsiman, Pahamuddin",
    "contractor": "CANTILEVER Construction"
  },
  {
    "projectCode": "25-RISGAOI563",
    "name": "Installation of Solar Street Lights, Pahamuddin",
    "contractor": "-"
  },
  {
    "projectCode": "25-RISGAOI564",
    "name": "Installation of Solar Street Lights, Kadayangan",
    "contractor": "-"
  },
  {
    "projectCode": "25-RISGAOI565",
    "name": "Installation of Solar Street Lights, Nabalawag",
    "contractor": "-"
  },
  {
    "projectCode": "25-RISGAOI566",
    "name": "Installation of Solar Street Lights, Malidegao",
    "contractor": "-"
  },
  {
    "projectCode": "25-RISGAOI567",
    "name": "Installation of Solar Street Lights, Ligawasan",
    "contractor": "-"
  },
  {
    "projectCode": "25-RISGAOI568",
    "name": "Installation of Solar Street Lights, Tugunan",
    "contractor": "-"
  },
  {
    "projectCode": "25-RISGAOI569",
    "name": "Installation of Solar Street Lights, Kapalawan",
    "contractor": "EB MARZAN Trucking and Construction Inc."
  },
  {
    "projectCode": "25-RISGAOI570",
    "name": "Installation of Solar Street Lights, Old Kaabakan",
    "contractor": "KAPALAWAN Construction"
  },
  {
    "projectCode": "25-RISGAOI666",
    "name": "Installation of Solar Street Lights",
    "contractor": "ALQADR Construction"
  },
  {
    "projectCode": "25-RISGAOI681",
    "name": "Installation of Solar Street Lights",
    "contractor": "-"
  },
  {
    "projectCode": "25-RISGAOI687",
    "name": "Installation of Solar Street Lights",
    "contractor": "-"
  },
  {
    "projectCode": "25-RISGAOI688",
    "name": "Installation of Solar Street Lights",
    "contractor": "-"
  },
  {
    "projectCode": "25-RISGAOI693",
    "name": "Installation of Solar Street Lights, Kadayangan",
    "contractor": "ALQADR Construction"
  },
  {
    "projectCode": "25-RISGAOI695",
    "name": "Installation of Solar Street Lights",
    "contractor": "-"
  },
  {
    "projectCode": "25-RISGAOI696",
    "name": "Installation of Solar Street Lights",
    "contractor": "-"
  },
  {
    "projectCode": "25-RISGAOI697",
    "name": "Installation of Solar Street Lights",
    "contractor": "-"
  },
  {
    "projectCode": "25-RISGAOI698",
    "name": "Installation of Solar Street Lights",
    "contractor": "-"
  },
  {
    "projectCode": "25-RISGAOI699",
    "name": "Installation of Solar Street Lights",
    "contractor": "-"
  },
  {
    "projectCode": "25-RISGAOI716",
    "name": "Installation of Solar Street Lights, Brgy. Tumbras and Brgy. Tugal, Kadayangan",
    "contractor": "-"
  },
  {
    "projectCode": "25-RISGAOI752",
    "name": "Installation of Solar Street Lights",
    "contractor": "-"
  },
  {
    "projectCode": "25-RISGAOI767",
    "name": "Installation of Solar Street Lights",
    "contractor": "-"
  },
  {
    "projectCode": "25-RISGAOI768",
    "name": "Installation of Solar Street Lights",
    "contractor": "-"
  },
  {
    "projectCode": "25-RISGAOI769",
    "name": "Installation of Solar Street Lights",
    "contractor": "-"
  },
  {
    "projectCode": "25-RISGAOI770",
    "name": "Installation of Solar Street Lights",
    "contractor": "-"
  },
  {
    "projectCode": "25-RISGAOI778",
    "name": "Installation of Solar Street Lights",
    "contractor": "-"
  },
  {
    "projectCode": "25-RISGAOI779",
    "name": "Installation of Solar Street Lights",
    "contractor": "-"
  },
  {
    "projectCode": "25-RISGAOI798",
    "name": "Installation of Solar Street Lights",
    "contractor": "-"
  },
  {
    "projectCode": "26-RISGARD241",
    "name": "Construction of Road at Purok 3, Brgy. Malingao, Kadayangan",
    "contractor": "AJ USMAN Construction Services"
  },
  {
    "projectCode": "26-RISGARD242",
    "name": "Construction of Road at Purok 1, Brgy. Tumbras - Brgy. Malingao, Kadayangan",
    "contractor": "Smart Move Builders"
  },
  {
    "projectCode": "26-RISGARD243",
    "name": "Construction of Road at Sitio Damagi - Purok Manga, Brgy. Tumbras, Kadayangan",
    "contractor": "Smart Move Builders"
  },
  {
    "projectCode": "26-RISGARD244",
    "name": "Concreting of Road at Sitio Gaunan, Brgy. Langogan, Kapalawan",
    "contractor": "EB MARZAN Trucking and Construction Inc."
  },
  {
    "projectCode": "26-RISGARD245",
    "name": "Construction of Road with Reinforced Concrete Box Culvert at Sitio Minito, Brgy. Nasapian, Kapalawan",
    "contractor": "-"
  },
  {
    "projectCode": "26-RISGARD246",
    "name": "Concreting of Road at Brgy. Gli-gli, Ligawasan - Brgy. Poblacion, Pikit, Ligawasan",
    "contractor": "NIRVANA Construction & Supplies"
  },
  {
    "projectCode": "26-RISGARD247",
    "name": "Concreting of Road at Brgy. Bulol - Brgy. Bagoaingud, Ligawasan",
    "contractor": "-"
  },
  {
    "projectCode": "26-RISGARD248",
    "name": "Construction of Road at Brgy. Gokotan (Phase 4), Malidegao",
    "contractor": "KAPALAWAN Construction"
  },
  {
    "projectCode": "26-RISGARD249",
    "name": "Construction of Road at Brgy. Dungguan - Brgy. Nabalawag (Phase 1), Nabalawag",
    "contractor": "-"
  },
  {
    "projectCode": "26-RISGARD250",
    "name": "Construction of Road with Reinforced Concrete Box Culvert at Sitio Kawayan, Brgy. Kadigasan, Nabalawag",
    "contractor": "-"
  },
  {
    "projectCode": "26-RISGARD251",
    "name": "Concreting of Approach Road to Brgy. Libungan Torreta (Pigcawayan) - Kabuntalan Bridge, Pahamuddin",
    "contractor": "-"
  },
  {
    "projectCode": "26-RISGARD252",
    "name": "Concreting of Road at Brgy. Lagunde - Brgy. Panicupan, Tugunan",
    "contractor": "HATTA 1845 CONSTRUCTION SERVICES"
  },
  {
    "projectCode": "26-RISGARD253",
    "name": "Concreting of Road at Brgy. Lagunde (Gap Section), Tugunan",
    "contractor": "-"
  },
  {
    "projectCode": "26-RISGARD254",
    "name": "Concreting of Road at Brgy. Macabual (Gap Section), Tugunan",
    "contractor": "-"
  },
  {
    "projectCode": "26-RISGARD255",
    "name": "Concreting of Road at Sitio Blah, Brgy. Manaulanan, Tugunan",
    "contractor": "KAPALAWAN Construction"
  },
  {
    "projectCode": "26-RISGABR256",
    "name": "Construction of Bridge, Sitio Punol, Brgy. Batulawan, Malidegao",
    "contractor": "-"
  },
  {
    "projectCode": "26-RISGAFC257",
    "name": "Construction of Flood Control Structure (Phase 3), Brgy. Buluan, Old Kaabakan",
    "contractor": "MULTI-B CONSTRUCTION CORP."
  },
  {
    "projectCode": "26-RISGAFC258",
    "name": "Construction of Flood Control Structure, Brgy. Libungan Torreta (Phase 3), Pahamuddin",
    "contractor": "-"
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

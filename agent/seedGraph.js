require('dotenv').config();
const { getDriver, closeDriver } = require('./neo4jClient');

async function seed() {
  const driver = getDriver();
  const session = driver.session();

  console.log(' Connecting to Neo4j Aura to seed multi-clerk land fraud graph...');

  try {
    // 1. Wipe existing graph cleanly
    console.log(' Clearing existing graph database...');
    await session.run('MATCH (n) DETACH DELETE n');

    // 2. Setup schema constraints & indexes
    console.log(' Creating constraints and indexes...');
    try {
      await session.run('CREATE CONSTRAINT unique_clerk_id IF NOT EXISTS FOR (c:Clerk) REQUIRE c.id IS UNIQUE');
      await session.run('CREATE CONSTRAINT unique_prop_id IF NOT EXISTS FOR (p:Property) REQUIRE p.id IS UNIQUE');
      await session.run('CREATE CONSTRAINT unique_citizen_id IF NOT EXISTS FOR (c:Citizen) REQUIRE c.id IS UNIQUE');
      await session.run('CREATE CONSTRAINT unique_company_id IF NOT EXISTS FOR (c:Company) REQUIRE c.id IS UNIQUE');
    } catch (e) {
      console.log('Indexes/constraints note:', e.message);
    }

    // 3. Insert Clerks (5 diverse cases)
    console.log(' Seeding Clerks (5 administrative profiles)...');
    await session.run(`
      CREATE (c1:Clerk {
        id: 'CLK-042',
        name: 'R. Sharma',
        zone: 'Zone 4 - Dharampeth',
        department: 'Revenue & Land Titles',
        serviceYears: 14,
        status: 'FLAGGED'
      })
      CREATE (c2:Clerk {
        id: 'CLK-017',
        name: 'V. Patil',
        zone: 'Zone 2 - Sitabuldi',
        department: 'Commercial Land Registry',
        serviceYears: 9,
        status: 'FLAGGED'
      })
      CREATE (c3:Clerk {
        id: 'CLK-089',
        name: 'S. Kulkarni',
        zone: 'Zone 7 - Wardha Road Corridor',
        department: 'Agricultural Conversion Unit',
        serviceYears: 18,
        status: 'CRITICAL_FLAG'
      })
      CREATE (c4:Clerk {
        id: 'CLK-023',
        name: 'N. Deshmukh',
        zone: 'Zone 1 - Sadar & Civil Lines',
        department: 'Valuation & Stamp Office',
        serviceYears: 6,
        status: 'UNDER_WATCH'
      })
      CREATE (c5:Clerk {
        id: 'CLK-008',
        name: 'A. Mishra',
        zone: 'Zone 5 - Mahal & Gandhibagh',
        department: 'Residential Title Verification',
        serviceYears: 11,
        status: 'CLEAN'
      })
    `);

    // 4. Insert Citizens & Entities
    console.log(' Seeding Citizens & Corporate Entities across Nagpur...');
    await session.run(`
      // Ring 1 Entities (Circular loop with CLK-042)
      CREATE (g1:Citizen {id: 'CIT-101', name: 'Anil Gupta', pan: 'AGUPT8821K', address: '14, West High Court Rd, Dharampeth', phone: '+91-9823011221'})
      CREATE (g2:Citizen {id: 'CIT-102', name: 'Suresh Yadav', pan: 'SYADA4419P', address: 'Plot 88, VIP Road, Dharampeth', phone: '+91-9823011222'})
      CREATE (g3:Citizen {id: 'CIT-103', name: 'Priya Devi', pan: 'PDEVI6710M', address: '14, West High Court Rd, Dharampeth', phone: '+91-9823011223'})
      CREATE (g4:Citizen {id: 'CIT-104', name: 'Vikram Joshi', pan: 'VJOSH9921B', address: 'Flat 402, Gokulpeth Residency', phone: '+91-9823011224'})

      // Ring 2 Entities (Rapid Flipping & Shell Company with CLK-017)
      CREATE (cmp1:Company {id: 'CMP-501', name: 'Sunrise Properties LLP', cin: 'U70100MH2021PTC388912', registeredAddress: 'B-102, Silver Arcade, Sitabuldi', incorporationDate: '2021-03-12'})
      CREATE (cmp2:Company {id: 'CMP-502', name: 'Vidarbha Realty Ventures', cin: 'U70100MH2019PTC112344', registeredAddress: 'Shop 12, Yashwant Stadium Complex', incorporationDate: '2019-11-04'})
      CREATE (d1:Citizen {id: 'CIT-201', name: 'Mahesh Patil', pan: 'MPATI3321A', address: 'B-102, Silver Arcade, Sitabuldi', phone: '+91-9890123456'})
      CREATE (d2:Citizen {id: 'CIT-202', name: 'Rajesh Solanki', pan: 'RSOLA9012H', address: 'Flat 12, Empress Mill Quarters', phone: '+91-9890123457'})
      CREATE (d3:Citizen {id: 'CIT-203', name: 'Kavita Chawla', pan: 'KCHAW7712E', address: '33, Wardha Road, Somalwada', phone: '+91-9890123458'})

      // Ring 3 Entities (Ghost Land / Duplicate Coordinates with CLK-089)
      CREATE (gh1:Citizen {id: 'CIT-301', name: 'Deepak Bopche', pan: 'DBOPC5512N', address: 'Village Jamtha, Wardha Road', phone: '+91-9765432101'})
      CREATE (gh2:Citizen {id: 'CIT-302', name: 'Harish Nimje', pan: 'HNIMJ1245L', address: 'Survey Line 4, Butibori MIDC', phone: '+91-9765432102'})
      CREATE (gh3:Citizen {id: 'CIT-303', name: 'Santosh Gaikwad', pan: 'SGAIK9912Q', address: 'Unregistered Slum Cluster, MIDC Gate 2', phone: '+91-9765432103'})
      CREATE (gh4:Citizen {id: 'CIT-304', name: 'Omkar Wankhede', pan: 'OWANK4411T', address: 'Near VCA Stadium, Jamtha', phone: '+91-9765432104'})

      // Ring 4 Entities (Severe Undervaluation with CLK-023)
      CREATE (uv1:Citizen {id: 'CIT-401', name: 'Gopal Bajaj', pan: 'GBAJA7711K', address: 'Bungalow 7, Civil Lines, Nagpur', phone: '+91-9822334455'})
      CREATE (uv2:Citizen {id: 'CIT-402', name: 'Naveen Singhania', pan: 'NSING6621R', address: 'Plot 41, Palm Road, Civil Lines', phone: '+91-9822334456'})

      // Clean Case Entities (with CLK-008)
      CREATE (cl1:Citizen {id: 'CIT-001', name: 'Sunil Deshpande', pan: 'SDESH8812F', address: 'Plot 105, Reshimbagh, Mahal', phone: '+91-9422114477'})
      CREATE (cl2:Citizen {id: 'CIT-002', name: 'Meena Korde', pan: 'MKORD5541J', address: 'Flat 201, Ayachit Mandir Road, Mahal', phone: '+91-9422114488'})
      CREATE (cl3:Citizen {id: 'CIT-003', name: 'Dr. Sanjay Tijare', pan: 'STIJA3321Y', address: 'Plot 12, Tilak Nagar, Nagpur', phone: '+91-9422114499'})
      CREATE (cl4:Citizen {id: 'CIT-004', name: 'Anita Bawankar', pan: 'ABAWA7721U', address: '44, New Subedar Layout, Nagpur', phone: '+91-9422114400'})
    `);

    // 5. Seed Properties
    console.log(' Seeding Properties across Nagpur Urban & Suburban areas...');
    await session.run(`
      // CLK-042 Properties (Circular Ring - Dharampeth)
      CREATE (p1:Property {id: 'PROP-1021', surveyNo: 'SY-401/A', location: 'Dharampeth West, Nagpur', areaSqFt: 3400, marketValuationINR: 18500000, circleRateINR: 17000000, lastUpdated: '2026-06-12'})
      CREATE (p2:Property {id: 'PROP-1087', surveyNo: 'SY-401/B', location: 'Dharampeth West, Nagpur', areaSqFt: 2800, marketValuationINR: 15200000, circleRateINR: 14000000, lastUpdated: '2026-06-14'})
      CREATE (p3:Property {id: 'PROP-1103', surveyNo: 'SY-402/1', location: 'VIP Road, Dharampeth', areaSqFt: 4200, marketValuationINR: 24000000, circleRateINR: 22000000, lastUpdated: '2026-06-15'})
      CREATE (p4:Property {id: 'PROP-1155', surveyNo: 'SY-402/2', location: 'VIP Road, Dharampeth', areaSqFt: 3100, marketValuationINR: 16800000, circleRateINR: 15500000, lastUpdated: '2026-06-18'})

      // CLK-017 Properties (Rapid Flipping & Shell Company - Sitabuldi)
      CREATE (p5:Property {id: 'PROP-0721', surveyNo: 'SY-109/C', location: 'Main Commercial Hub, Sitabuldi', areaSqFt: 5500, marketValuationINR: 42000000, circleRateINR: 38000000, lastUpdated: '2026-07-01'})
      CREATE (p6:Property {id: 'PROP-0734', surveyNo: 'SY-110/A', location: 'Variety Square, Sitabuldi', areaSqFt: 4100, marketValuationINR: 31000000, circleRateINR: 29000000, lastUpdated: '2026-07-04'})
      CREATE (p7:Property {id: 'PROP-0756', surveyNo: 'SY-110/B', location: 'Tekdi Road, Sitabuldi', areaSqFt: 6200, marketValuationINR: 48000000, circleRateINR: 44000000, lastUpdated: '2026-07-10'})
      CREATE (p8:Property {id: 'PROP-0789', surveyNo: 'SY-111/1', location: 'Munje Square, Sitabuldi', areaSqFt: 3900, marketValuationINR: 29500000, circleRateINR: 27000000, lastUpdated: '2026-07-15'})
      CREATE (p9:Property {id: 'PROP-0801', surveyNo: 'SY-111/2', location: 'Station Road, Sitabuldi', areaSqFt: 4800, marketValuationINR: 36000000, circleRateINR: 33000000, lastUpdated: '2026-07-20'})
      CREATE (p10:Property {id: 'PROP-0815', surveyNo: 'SY-112/A', location: 'Loha Pul Corridor, Sitabuldi', areaSqFt: 5100, marketValuationINR: 39000000, circleRateINR: 36000000, lastUpdated: '2026-07-28'})

      // CLK-089 Properties (Ghost Land & Coordinate Collision - Wardha Road)
      CREATE (p11:Property {id: 'PROP-3001', surveyNo: 'SY-880/Jamtha', location: 'Jamtha Green Belt (Protected Forest Edge)', areaSqFt: 22000, marketValuationINR: 88000000, circleRateINR: 45000000, lastUpdated: '2026-05-10'})
      CREATE (p12:Property {id: 'PROP-3002', surveyNo: 'SY-880/Jamtha-DUP', location: 'Jamtha Green Belt (Overlapping Plot)', areaSqFt: 22000, marketValuationINR: 88000000, circleRateINR: 45000000, lastUpdated: '2026-05-11'})
      CREATE (p13:Property {id: 'PROP-3003', surveyNo: 'SY-881/MIDC', location: 'Butibori Industrial Buffer', areaSqFt: 18500, marketValuationINR: 62000000, circleRateINR: 35000000, lastUpdated: '2026-05-18'})
      CREATE (p14:Property {id: 'PROP-3004', surveyNo: 'SY-882/MIHAN', location: 'MIHAN Special Economic Zone Boundary', areaSqFt: 35000, marketValuationINR: 140000000, circleRateINR: 80000000, lastUpdated: '2026-05-24'})

      // CLK-023 Properties (Undervaluation Anomaly - Civil Lines)
      CREATE (p15:Property {id: 'PROP-2011', surveyNo: 'SY-22/Heritage', location: 'Palm Road, Civil Lines, Nagpur', areaSqFt: 8800, marketValuationINR: 95000000, circleRateINR: 82000000, lastUpdated: '2026-08-01'})
      CREATE (p16:Property {id: 'PROP-2012', surveyNo: 'SY-23/Heritage', location: 'Temple Road, Civil Lines, Nagpur', areaSqFt: 7200, marketValuationINR: 78000000, circleRateINR: 68000000, lastUpdated: '2026-08-03'})

      // CLK-008 Properties (Clean Standard Registrations - Mahal)
      CREATE (p17:Property {id: 'PROP-0101', surveyNo: 'SY-55/1', location: 'Tilak Nagar, Mahal', areaSqFt: 1800, marketValuationINR: 8500000, circleRateINR: 8000000, lastUpdated: '2026-04-10'})
      CREATE (p18:Property {id: 'PROP-0102', surveyNo: 'SY-55/2', location: 'Reshimbagh, Nagpur', areaSqFt: 2200, marketValuationINR: 10500000, circleRateINR: 10000000, lastUpdated: '2026-04-15'})
      CREATE (p19:Property {id: 'PROP-0103', surveyNo: 'SY-56/A', location: 'Ayachit Road, Mahal', areaSqFt: 1500, marketValuationINR: 7200000, circleRateINR: 7000000, lastUpdated: '2026-04-20'})
      CREATE (p20:Property {id: 'PROP-0104', surveyNo: 'SY-56/B', location: 'New Subedar Layout, Nagpur', areaSqFt: 2400, marketValuationINR: 11500000, circleRateINR: 11000000, lastUpdated: '2026-04-25'})
    `);

    // 6. Seed Complex Fraud Relationships & Links
    console.log(' Wiring Neo4j Graph Relationships & Fraud Patterns...');
    await session.run(`
      // --- PATTERN 1: CLK-042 (Circular Ownership Ring) ---
      MATCH (c:Clerk {id: 'CLK-042'})
      MATCH (p1:Property {id: 'PROP-1021'}), (p2:Property {id: 'PROP-1087'}), (p3:Property {id: 'PROP-1103'}), (p4:Property {id: 'PROP-1155'})
      CREATE (c)-[:APPROVED {date: '2026-06-12', feeINR: 150000, registryHash: '0x8f11a4...'}]->(p1)
      CREATE (c)-[:APPROVED {date: '2026-06-14', feeINR: 130000, registryHash: '0x3c22b1...'}]->(p2)
      CREATE (c)-[:APPROVED {date: '2026-06-15', feeINR: 180000, registryHash: '0x99dd41...'}]->(p3)
      CREATE (c)-[:APPROVED {date: '2026-06-18', feeINR: 140000, registryHash: '0x77ee82...'}]->(p4)

      WITH c
      MATCH (g1:Citizen {id: 'CIT-101'}), (g2:Citizen {id: 'CIT-102'}), (g3:Citizen {id: 'CIT-103'}), (g4:Citizen {id: 'CIT-104'})
      MATCH (p1:Property {id: 'PROP-1021'}), (p2:Property {id: 'PROP-1087'}), (p3:Property {id: 'PROP-1103'}), (p4:Property {id: 'PROP-1155'})
      
      // Ownership
      CREATE (g1)-[:OWNS {since: '2026-06-18', purchasePriceINR: 18500000}]->(p1)
      CREATE (g2)-[:OWNS {since: '2026-06-14', purchasePriceINR: 15200000}]->(p2)
      CREATE (g3)-[:OWNS {since: '2026-06-15', purchasePriceINR: 24000000}]->(p3)
      CREATE (g4)-[:OWNS {since: '2026-06-18', purchasePriceINR: 16800000}]->(p4)

      // Circular Transfers (Gupta -> Yadav -> Devi -> Gupta)
      CREATE (g1)-[:TRANSFERRED_TO {date: '2026-06-12', considerationINR: 18000000, deedNo: 'DEED/2026/0441'}]->(g2)
      CREATE (g2)-[:TRANSFERRED_TO {date: '2026-06-14', considerationINR: 19200000, deedNo: 'DEED/2026/0449'}]->(g3)
      CREATE (g3)-[:TRANSFERRED_TO {date: '2026-06-18', considerationINR: 21500000, deedNo: 'DEED/2026/0488'}]->(g1)
      CREATE (g1)-[:SAME_ADDRESS_AS {flag: 'BENAMI_INDICATOR'}]->(g3)

      // --- PATTERN 2: CLK-017 (Rapid Flipping & Shell Company) ---
      WITH c
      MATCH (c2:Clerk {id: 'CLK-017'})
      MATCH (p5:Property {id: 'PROP-0721'}), (p6:Property {id: 'PROP-0734'}), (p7:Property {id: 'PROP-0756'}), (p8:Property {id: 'PROP-0789'}), (p9:Property {id: 'PROP-0801'}), (p10:Property {id: 'PROP-0815'})
      CREATE (c2)-[:APPROVED {date: '2026-07-01', feeINR: 320000, registryHash: '0x12a890...'}]->(p5)
      CREATE (c2)-[:APPROVED {date: '2026-07-04', feeINR: 280000, registryHash: '0x9923bb...'}]->(p6)
      CREATE (c2)-[:APPROVED {date: '2026-07-10', feeINR: 390000, registryHash: '0xcca810...'}]->(p7)
      CREATE (c2)-[:APPROVED {date: '2026-07-15', feeINR: 250000, registryHash: '0xdf3391...'}]->(p8)
      CREATE (c2)-[:APPROVED {date: '2026-07-20', feeINR: 310000, registryHash: '0x7612ef...'}]->(p9)
      CREATE (c2)-[:APPROVED {date: '2026-07-28', feeINR: 340000, registryHash: '0xaa3412...'}]->(p10)

      WITH c2
      MATCH (cmp1:Company {id: 'CMP-501'}), (d1:Citizen {id: 'CIT-201'}), (d2:Citizen {id: 'CIT-202'}), (d3:Citizen {id: 'CIT-203'})
      MATCH (p5:Property {id: 'PROP-0721'}), (p6:Property {id: 'PROP-0734'}), (p7:Property {id: 'PROP-0756'})
      CREATE (d1)-[:DIRECTOR_OF {din: '00891234', since: '2021-03-12'}]->(cmp1)
      CREATE (cmp1)-[:OWNS {since: '2026-07-10', purchasePriceINR: 48000000}]->(p7)
      CREATE (d2)-[:TRANSFERRED_TO {date: '2026-07-01', considerationINR: 25000000, deedNo: 'DEED/2026/0890'}]->(d3)
      CREATE (d3)-[:TRANSFERRED_TO {date: '2026-07-10', considerationINR: 41000000, deedNo: 'DEED/2026/0912'}]->(cmp1)
      CREATE (d1)-[:SAME_ADDRESS_AS {flag: 'CLERK_COLLUSION_SUSPECT'}]->(c2)

      // --- PATTERN 3: CLK-089 (Ghost Land & Coordinate Collision) ---
      WITH c2
      MATCH (c3:Clerk {id: 'CLK-089'})
      MATCH (p11:Property {id: 'PROP-3001'}), (p12:Property {id: 'PROP-3002'}), (p13:Property {id: 'PROP-3003'}), (p14:Property {id: 'PROP-3004'})
      CREATE (c3)-[:APPROVED {date: '2026-05-10', feeINR: 800000, registryHash: '0x55aa12...'}]->(p11)
      CREATE (c3)-[:APPROVED {date: '2026-05-11', feeINR: 800000, registryHash: '0x55aa13...'}]->(p12)
      CREATE (c3)-[:APPROVED {date: '2026-05-18', feeINR: 550000, registryHash: '0x77aa44...'}]->(p13)
      CREATE (c3)-[:APPROVED {date: '2026-05-24', feeINR: 1200000, registryHash: '0x88bb99...'}]->(p14)

      WITH c3
      MATCH (gh1:Citizen {id: 'CIT-301'}), (gh2:Citizen {id: 'CIT-302'}), (gh3:Citizen {id: 'CIT-303'}), (gh4:Citizen {id: 'CIT-304'})
      MATCH (p11:Property {id: 'PROP-3001'}), (p12:Property {id: 'PROP-3002'})
      CREATE (gh1)-[:OWNS {since: '2026-05-10', purchasePriceINR: 88000000}]->(p11)
      CREATE (gh2)-[:OWNS {since: '2026-05-11', purchasePriceINR: 88000000}]->(p12)
      CREATE (gh1)-[:TRANSFERRED_TO {date: '2026-05-15', considerationINR: 90000000, deedNo: 'DEED/2026/GHOST-1'}]->(gh3)
      CREATE (gh2)-[:TRANSFERRED_TO {date: '2026-05-18', considerationINR: 92000000, deedNo: 'DEED/2026/GHOST-2'}]->(gh4)

      // --- PATTERN 4: CLK-023 (Severe Undervaluation) ---
      WITH c3
      MATCH (c4:Clerk {id: 'CLK-023'})
      MATCH (p15:Property {id: 'PROP-2011'}), (p16:Property {id: 'PROP-2012'})
      CREATE (c4)-[:APPROVED {date: '2026-08-01', feeINR: 200000, registryHash: '0x333910...'}]->(p15)
      CREATE (c4)-[:APPROVED {date: '2026-08-03', feeINR: 180000, registryHash: '0x444911...'}]->(p16)

      WITH c4
      MATCH (uv1:Citizen {id: 'CIT-401'}), (uv2:Citizen {id: 'CIT-402'})
      MATCH (p15:Property {id: 'PROP-2011'})
      // Registered at 28M while market is 95M (Circle rate is 82M -> Massive Stamp duty evasion)
      CREATE (uv1)-[:TRANSFERRED_TO {date: '2026-08-01', considerationINR: 28000000, deedNo: 'DEED/2026/UNDERVAL-1'}]->(uv2)
      CREATE (uv2)-[:OWNS {since: '2026-08-01', purchasePriceINR: 28000000}]->(p15)

      // --- PATTERN 5: CLK-008 (Clean Standard Cases) ---
      WITH c4
      MATCH (c5:Clerk {id: 'CLK-008'})
      MATCH (p17:Property {id: 'PROP-0101'}), (p18:Property {id: 'PROP-0102'}), (p19:Property {id: 'PROP-0103'}), (p20:Property {id: 'PROP-0104'})
      CREATE (c5)-[:APPROVED {date: '2026-04-10', feeINR: 80000, registryHash: '0x0011aa...'}]->(p17)
      CREATE (c5)-[:APPROVED {date: '2026-04-15', feeINR: 100000, registryHash: '0x0022bb...'}]->(p18)
      CREATE (c5)-[:APPROVED {date: '2026-04-20', feeINR: 70000, registryHash: '0x0033cc...'}]->(p19)
      CREATE (c5)-[:APPROVED {date: '2026-04-25', feeINR: 110000, registryHash: '0x0044dd...'}]->(p20)

      WITH c5
      MATCH (cl1:Citizen {id: 'CIT-001'}), (cl2:Citizen {id: 'CIT-002'}), (cl3:Citizen {id: 'CIT-003'}), (cl4:Citizen {id: 'CIT-004'})
      MATCH (p17:Property {id: 'PROP-0101'}), (p18:Property {id: 'PROP-0102'})
      CREATE (cl1)-[:OWNS {since: '2026-04-10', purchasePriceINR: 8500000}]->(p17)
      CREATE (cl2)-[:OWNS {since: '2026-04-15', purchasePriceINR: 10500000}]->(p18)
    `);

    // 7. Verification Summary
    const countRes = await session.run(`
      MATCH (c:Clerk) WITH count(c) as clerks
      MATCH (p:Property) WITH clerks, count(p) as properties
      MATCH (cit:Citizen) WITH clerks, properties, count(cit) as citizens
      MATCH (cmp:Company) WITH clerks, properties, citizens, count(cmp) as companies
      MATCH ()-[r]->() WITH clerks, properties, citizens, companies, count(r) as relationships
      RETURN clerks, properties, citizens, companies, relationships
    `);

    const r = countRes.records[0];
    console.log('\n================ SEEDING COMPLETE ================');
    console.log(` Clerks Seeded:        ${r.get('clerks').toInt()}`);
    console.log(` Properties Seeded:    ${r.get('properties').toInt()}`);
    console.log(` Citizens Seeded:      ${r.get('citizens').toInt()}`);
    console.log(` Companies Seeded:     ${r.get('companies').toInt()}`);
    console.log(` Relationships Seeded: ${r.get('relationships').toInt()}`);
    console.log('===================================================\n');

  } catch (error) {
    console.error(' Seeding Error:', error);
  } finally {
    await session.close();
    await closeDriver();
  }
}

seed();

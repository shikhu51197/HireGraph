import { getSession, closeDriver } from '../server/src/db/neo4j';

const seedData = async () => {
  const session = getSession();
  try {
    console.log('Clearing existing data...');
    await session.run(`MATCH (n) DETACH DELETE n`);

    console.log('Inserting seed data...');
    await session.run(`
      // Create Skills
      CREATE (nodejs:Skill {id: 's1', name: 'Node.js', category: 'Backend'})
      CREATE (react:Skill {id: 's2', name: 'React', category: 'Frontend'})
      CREATE (pg:Skill {id: 's3', name: 'PostgreSQL', category: 'Database'})
      CREATE (redis:Skill {id: 's4', name: 'Redis', category: 'Database'})
      CREATE (express:Skill {id: 's5', name: 'Express.js', category: 'Backend'})
      CREATE (ts:Skill {id: 's6', name: 'TypeScript', category: 'Language'})
      CREATE (js:Skill {id: 's7', name: 'JavaScript', category: 'Language'})
      CREATE (neo4j:Skill {id: 's8', name: 'Neo4j', category: 'Database'})
      
      // Create relationships between related skills
      CREATE (express)-[:RELATED_TO]->(nodejs)
      CREATE (nodejs)-[:RELATED_TO]->(express)
      CREATE (js)-[:RELATED_TO]->(ts)
      CREATE (ts)-[:RELATED_TO]->(js)
      CREATE (react)-[:RELATED_TO]->(js)
      CREATE (nodejs)-[:RELATED_TO]->(js)
      
      // Create Candidates
      CREATE (shikha:Candidate {id: 'c1', name: 'Shikha Gupta', experience: 4, location: 'Remote'})
      CREATE (rahul:Candidate {id: 'c2', name: 'Rahul Sharma', experience: 3, location: 'New York'})
      CREATE (alice:Candidate {id: 'c3', name: 'Alice Smith', experience: 5, location: 'London'})
      CREATE (bob:Candidate {id: 'c4', name: 'Bob Jones', experience: 2, location: 'Berlin'})
      
      // Create Companies
      CREATE (techcorp:Company {id: 'com1', name: 'TechCorp'})
      CREATE (startupx:Company {id: 'com2', name: 'StartupX'})
      CREATE (globex:Company {id: 'com3', name: 'Globex'})
      
      // Create Jobs
      CREATE (job1:Job {id: 'j1', title: 'Senior Backend Engineer', experience: 4})
      CREATE (job2:Job {id: 'j2', title: 'Full Stack Developer', experience: 3})
      CREATE (job3:Job {id: 'j3', title: 'Frontend React Developer', experience: 2})
      
      // Candidate Skills
      CREATE (shikha)-[:HAS_SKILL]->(nodejs)
      CREATE (shikha)-[:HAS_SKILL]->(react)
      CREATE (shikha)-[:HAS_SKILL]->(pg)
      CREATE (shikha)-[:HAS_SKILL]->(ts)
      
      CREATE (rahul)-[:HAS_SKILL]->(express)
      CREATE (rahul)-[:HAS_SKILL]->(redis)
      CREATE (rahul)-[:HAS_SKILL]->(js)
      
      CREATE (alice)-[:HAS_SKILL]->(react)
      CREATE (alice)-[:HAS_SKILL]->(ts)
      CREATE (alice)-[:HAS_SKILL]->(neo4j)
      CREATE (alice)-[:HAS_SKILL]->(nodejs)
      
      CREATE (bob)-[:HAS_SKILL]->(react)
      CREATE (bob)-[:HAS_SKILL]->(js)
      
      // Candidate Experience
      CREATE (shikha)-[:WORKED_AT]->(techcorp)
      CREATE (rahul)-[:WORKED_AT]->(startupx)
      CREATE (alice)-[:WORKED_AT]->(globex)
      CREATE (bob)-[:WORKED_AT]->(startupx)
      
      // Company Tech Stack
      CREATE (techcorp)-[:USES]->(nodejs)
      CREATE (techcorp)-[:USES]->(pg)
      CREATE (startupx)-[:USES]->(express)
      CREATE (startupx)-[:USES]->(redis)
      CREATE (globex)-[:USES]->(react)
      CREATE (globex)-[:USES]->(neo4j)
      
      // Job Requirements
      CREATE (job1)-[:REQUIRES]->(nodejs)
      CREATE (job1)-[:REQUIRES]->(pg)
      CREATE (job1)-[:REQUIRES]->(redis)
      
      CREATE (job2)-[:REQUIRES]->(react)
      CREATE (job2)-[:REQUIRES]->(nodejs)
      CREATE (job2)-[:REQUIRES]->(ts)
      
      CREATE (job3)-[:REQUIRES]->(react)
      CREATE (job3)-[:REQUIRES]->(js)
    `);
    
    console.log('Seed data inserted successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await session.close();
    await closeDriver();
  }
};

seedData();

import { Router } from 'express';
import { getSession } from '../db/neo4j';

const router = Router();

// Get all candidates
router.get('/', async (req, res) => {
  const session = getSession();
  try {
    const result = await session.run(
      `MATCH (c:Candidate) RETURN c.id AS id, c.name AS name, c.experience AS experience, c.location AS location`
    );
    const candidates = result.records.map(record => ({
      id: record.get('id'),
      name: record.get('name'),
      experience: record.get('experience'),
      location: record.get('location')
    }));
    res.json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Database error while fetching candidates' });
  } finally {
    await session.close();
  }
});

// Get specific candidate with their skills and companies
router.get('/:id', async (req, res) => {
  const session = getSession();
  const candidateId = req.params.id;
  try {
    const result = await session.run(`
      MATCH (c:Candidate {id: $candidateId})
      OPTIONAL MATCH (c)-[:HAS_SKILL]->(s:Skill)
      OPTIONAL MATCH (c)-[:WORKED_AT]->(company:Company)
      RETURN c.id AS id, c.name AS name, c.experience AS experience, c.location AS location,
             collect(DISTINCT s.name) AS skills,
             collect(DISTINCT company.name) AS companies
    `, { candidateId });

    if (result.records.length === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const record = result.records[0];
    const candidate = {
      id: record.get('id'),
      name: record.get('name'),
      experience: record.get('experience'),
      location: record.get('location'),
      skills: record.get('skills'),
      companies: record.get('companies')
    };

    res.json(candidate);
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({ error: 'Database error while fetching candidate' });
  } finally {
    await session.close();
  }
});

export default router;

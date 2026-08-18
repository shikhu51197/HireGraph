import { Router } from 'express';
import { getSession } from '../db/neo4j';

const router = Router();

// Get all jobs
router.get('/', async (req, res) => {
  const session = getSession();
  try {
    const result = await session.run(
      `MATCH (j:Job) RETURN j.id AS id, j.title AS title, j.experience AS experience`
    );
    const jobs = result.records.map(record => ({
      id: record.get('id'),
      title: record.get('title'),
      experience: record.get('experience').toNumber ? record.get('experience').toNumber() : record.get('experience')
    }));
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Database error while fetching jobs' });

  } finally {
    await session.close();
  }
});

// Match candidates for a specific job (multi-hop traversal query)
// This query finds candidates who have skills directly required by the job OR skills related to those required skills.
router.get('/:id/candidates', async (req, res) => {
  const session = getSession();
  const jobId = req.params.id;
  try {
    // 1st Query: Candidates with direct skills
    const directResult = await session.run(`
      MATCH (c:Candidate)-[:HAS_SKILL]->(s:Skill)<-[:REQUIRES]-(j:Job {id: $jobId})
      RETURN c.id AS id, c.name AS name, c.experience AS experience, c.location AS location, collect(s.name) AS matchedSkills
    `, { jobId });

    // 2nd Query: Multi-hop traversal (Graph really matters here)
    // Find candidates who have a skill that is RELATED_TO a skill REQUIRED by the job
    // IMPORTANT: Exclude skills that the candidate already directly possesses
    const relatedResult = await session.run(`
      MATCH (c:Candidate)-[:HAS_SKILL]->(candidateSkill:Skill)-[:RELATED_TO]->(requiredSkill:Skill)<-[:REQUIRES]-(j:Job {id: $jobId})
      WHERE NOT (c)-[:HAS_SKILL]->(requiredSkill)
      RETURN c.id AS id, c.name AS name, c.experience AS experience, c.location AS location,
             collect(DISTINCT candidateSkill.name) AS relatedSkillsHeld,
             collect(DISTINCT requiredSkill.name) AS matchedRequiredSkills
    `, { jobId });

    // Process and merge results
    const candidatesMap = new Map();

    directResult.records.forEach(record => {
      const id = record.get('id');
      candidatesMap.set(id, {
        id,
        name: record.get('name'),
        experience: record.get('experience').toNumber ? record.get('experience').toNumber() : record.get('experience'),
        location: record.get('location'),
        matchedSkills: record.get('matchedSkills'),
        relatedSkillsHeld: [],
        matchedRequiredSkills: [],
        matchScore: record.get('matchedSkills').length * 20 // basic score
      });
    });

    relatedResult.records.forEach(record => {
      const id = record.get('id');
      if (!candidatesMap.has(id)) {
        candidatesMap.set(id, {
          id,
          name: record.get('name'),
          experience: record.get('experience').toNumber ? record.get('experience').toNumber() : record.get('experience'),
          location: record.get('location'),
          matchedSkills: [],
          relatedSkillsHeld: record.get('relatedSkillsHeld'),
          matchedRequiredSkills: record.get('matchedRequiredSkills'),
          matchScore: record.get('relatedSkillsHeld').length * 10 // related skills give less score
        });
      } else {
        const candidate = candidatesMap.get(id);
        candidate.relatedSkillsHeld = record.get('relatedSkillsHeld');
        candidate.matchedRequiredSkills = record.get('matchedRequiredSkills');
        candidate.matchScore += record.get('relatedSkillsHeld').length * 10;
      }
    });

    res.json(Array.from(candidatesMap.values()).sort((a, b) => b.matchScore - a.matchScore));
  } catch (error) {
    console.error('Error fetching matching candidates:', error);
    res.status(500).json({ error: 'Database error while matching candidates' });
  } finally {
    await session.close();
  }
});

export default router;

export interface Job {
  id: string;
  title: string;
  experience: number;
}

export interface Candidate {
  id: string;
  name: string;
  experience: number;
  location: string;
  matchedSkills: string[];
  relatedSkillsHeld: string[];
  matchedRequiredSkills: string[];
  matchScore: number;
}

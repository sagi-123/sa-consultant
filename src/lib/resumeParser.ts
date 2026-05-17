// src/lib/resumeParser.ts
export interface ParsedResume {
  name: string;
  title: string;
  experience: string;
  email: string;
  phone: string;
  location: string;
  skills: { category: string; items: string[] }[];
  experienceTimeline: {
    role: string;
    company: string;
    duration: string;
    description: string;
  }[];
  education: { degree: string; institution: string; year: string }[];
  projects: { name: string; description: string; technologies: string[]; link: string }[];
  links: {
    linkedin: string;
    github: string;
    portfolio: string;
  };
}

/** Robustly extracts JSON string from an LLM response */
function extractJSON(text: string): string {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    return text.substring(start, end + 1);
  }
  return text.trim();
}

/** Parse a PDF resume using Groq (Llama 3.3) */
export async function parseResumeWithAI(text: string): Promise<ParsedResume> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Groq API key not found in .env');
  }

  const prompt = `You are an expert HR recruiter and data extraction AI.
Extract the following information from the resume text below.
You must return a valid JSON object matching this schema:

{
  "name": "Full name of the candidate",
  "title": "Current or most recent job title",
  "experience": "Total years of experience as a string e.g. '5 Years'",
  "email": "Email address if found, else empty string",
  "phone": "Phone number if found, else empty string",
  "location": "City, Country if found, else empty string",
  "skills": [
    { "category": "Category name e.g. Frontend", "items": ["Skill1", "Skill2"] }
  ],
  "experienceTimeline": [
    {
      "role": "Job Title",
      "company": "Company Name",
      "duration": "e.g. Jan 2020 - Present",
      "description": "One sentence summary of responsibilities"
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "University Name",
      "year": "e.g. 2016 - 2020"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Short summary of the project",
      "technologies": ["Tech1", "Tech2"],
      "link": "Project URL if found, else empty string"
    }
  ],
  "links": {
    "linkedin": "Full LinkedIn URL if found, else empty string",
    "github": "Full GitHub URL if found, else empty string",
    "portfolio": "Portfolio or personal website URL if found, else empty string"
  }
}

Resume Text:
${text.substring(0, 6000)}`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a resume parsing assistant. You must respond with a JSON object only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 2048,
      response_format: { type: 'json_object' }
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    console.error('Groq API error:', err);
    throw new Error(err.error?.message || 'Failed to communicate with Groq API');
  }

  const data = await response.json();
  const raw = data?.choices?.[0]?.message?.content;

  if (!raw) {
    console.error('Unexpected Groq response:', data);
    throw new Error('Invalid response from Groq API');
  }

  console.log('Groq raw response:', raw);
  const cleanJSON = extractJSON(raw);
  console.log('Groq extracted clean JSON:', cleanJSON);

  try {
    const parsed = JSON.parse(cleanJSON);
    
    // Defensive property mapping with defaults to prevent UI crashes
    return {
      name: parsed.name || '',
      title: parsed.title || '',
      experience: parsed.experience || '',
      email: parsed.email || '',
      phone: parsed.phone || '',
      location: parsed.location || '',
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      experienceTimeline: Array.isArray(parsed.experienceTimeline) ? parsed.experienceTimeline : [],
      education: Array.isArray(parsed.education) ? parsed.education : [],
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      links: {
        linkedin: parsed.links?.linkedin || '',
        github: parsed.links?.github || '',
        portfolio: parsed.links?.portfolio || ''
      }
    };
  } catch (e) {
    console.error('Failed to parse JSON from Groq:', cleanJSON, e);
    return {
      name: '',
      title: 'Could not parse JSON',
      experience: 'N/A',
      email: '',
      phone: '',
      location: '',
      skills: [],
      experienceTimeline: [],
      education: [],
      projects: [],
      links: { linkedin: '', github: '', portfolio: '' },
    };
  }
}

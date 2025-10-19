/**
 * Prompt Templates for Resume Analysis
 * 
 * These templates provide structured prompts for consistent AI analysis
 */

/**
 * Resume Analysis Sections
 */
export const RESUME_SECTIONS = [
    'Contact Information',
    'Professional Summary',
    'Work Experience',
    'Education',
    'Skills',
    'Certifications',
    'Projects',
    'Awards',
    'Publications',
    'Volunteer Work',
] as const;

/**
 * ATS Scoring Criteria
 */
export const ATS_CRITERIA = {
    formatting: {
        weight: 20,
        factors: [
            'Clean, simple layout without tables or complex formatting',
            'Standard fonts (Arial, Calibri, Times New Roman)',
            'No headers/footers with critical information',
            'No images or graphics',
            'Standard section headings',
            'Consistent formatting throughout',
        ],
    },
    keywords: {
        weight: 30,
        factors: [
            'Job-relevant keywords present',
            'Industry-specific terminology',
            'Technical skills mentioned',
            'Action verbs in experience',
            'Quantifiable achievements',
        ],
    },
    structure: {
        weight: 25,
        factors: [
            'Clear section organization',
            'Reverse chronological order',
            'Complete contact information',
            'Professional summary included',
            'Relevant sections present',
        ],
    },
    content: {
        weight: 25,
        factors: [
            'Relevant experience highlighted',
            'Measurable achievements',
            'No gaps in employment',
            'Appropriate length (1-2 pages)',
            'No typos or grammatical errors',
        ],
    },
};

/**
 * Comprehensive Resume Analysis Prompt
 */
export function buildAnalysisPrompt(
    resumeText: string,
    jobDescription?: string
): string {
    return `You are a Senior Talent Acquisition Specialist and a highly sophisticated Applicant Tracking System (ATS) engine. Your task is to perform a rigorous, direct, and quantifiable analysis based *only* on the provided Job Description (JD) and Candidate Resume.

${jobDescription ? `JOB DESCRIPTION:
${jobDescription}

` : ''}CANDIDATE RESUME:
${resumeText}

Your response MUST be a single, structured JSON document containing the following mandatory sections:

1. **Match Score:** Calculate a single percentage (1-100%) indicating how well the resume aligns with the JD's mandatory and desired requirements (keywords, skills, technologies, and experience duration). A lower score should be given if critical skills are missing or mentioned only generically.

2. **Key Strengths & Relevant Keywords Found:** List specific skills, technologies, and achievements in the resume that directly match the JD, paying attention to the exact language used.

3. **Critical Gaps & Missing Requirements:** Identify *all* crucial mandatory skills or experience levels (e.g., '5 years experience,' 'React,' 'PostgreSQL') explicitly requested in the JD that are either missing from the resume or only vaguely referenced. This is the most important section for the recruiter.

4. **ATS Optimization Suggestions:** Provide 3-5 specific, actionable suggestions for the candidate to modify their resume's wording, structure, or content to increase their ATS score against this specific JD. Focus on incorporating missing keywords and quantifying experience.

OUTPUT FORMAT (strict JSON):
{
  "ats_score": <number 1-100>,
  "overall_score": <number 1-100>,
  "strengths": [
    "<specific skill/technology/achievement that matches JD with evidence>",
    "<at least 3-5 items with exact keyword matches>"
  ],
  "weaknesses": [
    "<critical missing skill or experience level from JD>",
    "<at least 3-5 items with specific gaps>"
  ],
  "improvements": [
    {
      "category": "<Keywords|Experience|Skills|Structure>",
      "issue": "<specific missing requirement from JD>",
      "suggestion": "<exact wording change to incorporate missing keyword>",
      "priority": "<high|medium|low>"
    }
  ],
  "sections": [
    {
      "name": "<section name>",
      "score": <0-100>,
      "feedback": "<specific alignment feedback with JD requirements>"
    }
  ],
  "keywords": {
    "present": ["<exact keywords found in both JD and resume>"],
    "missing": ["<critical keywords from JD not in resume>"],
    "suggestions": ["<specific keywords to add from JD>"]
  },
  "summary": "<2-3 sentence professional, objective analysis of match quality>"
}

CRITICAL RULES:
1. Return ONLY valid JSON (no markdown, no code blocks, no extra text)
2. All scores must be integers between 1-100
3. Provide at least 5 actionable improvements
4. Be ruthlessly specific - cite exact examples from resume and JD
5. Lower scores significantly for missing mandatory requirements
6. Focus on exact keyword matching between JD and resume
7. Maintain professional, objective, analytical tone
${jobDescription ? '8. Base ALL analysis strictly on JD alignment - this is a recruiter tool' : ''}

Begin analysis:`;
}

/**
 * Section-Specific Feedback Prompt
 */
export function buildFeedbackPrompt(
    resumeText: string,
    section: string,
    specificQuestion?: string
): string {
    return `You are a Senior Talent Acquisition Specialist specializing in resume optimization for ATS systems and recruiter review.

RESUME SECTION (${section}):
${resumeText}

${specificQuestion ? `SPECIFIC QUESTION:\n${specificQuestion}\n\n` : ''}ANALYSIS TASK:
Provide a rigorous, direct, and quantifiable analysis of this ${section} section. Your response must be structured in four parts:

1. **Match Score (1-100%):** Rate this section's effectiveness for ATS parsing and recruiter appeal.

2. **Key Strengths:** List specific elements that work well:
   - Strong action verbs and quantifiable achievements
   - Relevant keywords and technical terms
   - Clear, ATS-friendly formatting
   - Cite exact examples from the text

3. **Critical Gaps:** Identify specific weaknesses:
   - Missing keywords or industry terms
   - Vague or generic descriptions
   - Lack of quantification or metrics
   - ATS parsing issues
   - Be ruthlessly specific about what's missing

4. **Optimization Suggestions:** Provide 3-5 actionable improvements:
   - Exact wording changes to incorporate keywords
   - How to quantify achievements with metrics
   - Structural changes for better ATS parsing
   - Before/after examples where applicable

RESPONSE FORMAT:
Use clear Markdown formatting with headers (##) and bullet points (-).
Maintain a professional, objective, analytical tone throughout.
Keep total response between 300-500 words.
Focus on practical, implementable changes.

Begin analysis:`;
}

/**
 * Keyword Analysis Prompt
 */
export function buildKeywordPrompt(
    resumeText: string,
    jobDescription: string
): string {
    return `You are an ATS keyword optimization expert. Analyze the job description and resume to identify optimal keywords.

JOB DESCRIPTION:
${jobDescription}

CURRENT RESUME:
${resumeText}

TASK:
Identify 10-15 high-value keywords that should be added to or emphasized in the resume. Focus on:

1. Keywords present in job description but missing in resume
2. Industry-standard terms for this role
3. Technical skills and tools
4. Action verbs that add impact
5. Certifications or qualifications

CRITERIA FOR SELECTION:
- Relevant to candidate's actual experience
- High ATS matching value
- Industry-standard terminology
- Not overly generic
- Naturally integrable into resume

OUTPUT:
Return ONLY a JSON array of keyword strings, no other text.
Example: ["keyword1", "keyword2", ...]

Keywords:`;
}

/**
 * Professional Summary Generation Prompt
 */
export function buildSummaryPrompt(
    resumeText: string,
    targetRole?: string
): string {
    return `You are a professional resume writer specializing in compelling executive summaries.

RESUME CONTENT:
${resumeText}

${targetRole ? `TARGET ROLE: ${targetRole}\n\n` : ''}TASK:
Write a powerful professional summary (3-4 sentences, 50-75 words) that:

1. Leads with years of experience and primary expertise
2. Highlights 2-3 key achievements with metrics
3. Showcases unique value proposition
4. Uses strong action-oriented language
5. Is ATS-friendly (includes relevant keywords)
${targetRole ? '6. Aligns with the target role' : ''}

STYLE:
- Third person or first person (your choice based on resume tone)
- Confident but not arrogant
- Specific and quantifiable
- Industry-appropriate language

OUTPUT:
Return ONLY the professional summary text, no headers or extra formatting.

Professional Summary:`;
}

/**
 * Achievement Quantification Prompt
 */
export function buildQuantificationPrompt(achievement: string): string {
    return `You are a resume optimization expert. Help make this achievement more impactful by adding quantification.

CURRENT ACHIEVEMENT:
"${achievement}"

TASK:
Rewrite this achievement to include specific metrics, percentages, or numbers. If exact numbers aren't available, suggest reasonable ranges or estimates.

FRAMEWORK: Use the CAR method (Challenge-Action-Result)
- Challenge: What was the problem/situation?
- Action: What did you do?
- Result: What was the measurable outcome?

EXAMPLES:
Before: "Managed a team"
After: "Led a cross-functional team of 8 members to deliver 15+ projects ahead of schedule"

Before: "Improved sales"
After: "Increased quarterly sales by 35% ($2.1M to $2.8M) through targeted B2B outreach"

OUTPUT:
Return 2-3 alternative versions, each on a new line, starting with a bullet point.

Quantified versions:`;
}

/**
 * ATS Compatibility Check Prompt
 */
export function buildATSCheckPrompt(resumeText: string): string {
    return `You are an ATS (Applicant Tracking System) compliance expert. Evaluate this resume for ATS compatibility.

RESUME:
${resumeText}

TASK:
Identify specific ATS compatibility issues and provide fixes.

CHECK FOR:
1. Complex formatting (tables, text boxes, columns)
2. Headers/footers with critical info
3. Images, graphics, or special characters
4. Unusual fonts or styling
5. Non-standard section headings
6. Missing keywords or context
7. Date format consistency
8. File format issues (if detectable)

OUTPUT FORMAT (JSON):
{
  "ats_score": <0-100>,
  "issues": [
    {
      "severity": "<critical|high|medium|low>",
      "issue": "<description>",
      "location": "<where in resume>",
      "fix": "<how to resolve>",
      "example": "<before/after if applicable>"
    }
  ],
  "quick_wins": [
    "<3-5 immediate fixes for biggest impact>"
  ],
  "compatibility": "<excellent|good|fair|poor>"
}

Return ONLY valid JSON.

Analysis:`;
}

/**
 * Cover Letter Personalization Prompt
 */
export function buildCoverLetterPrompt(
    resumeText: string,
    jobDescription: string,
    companyName: string
): string {
    return `You are a professional cover letter writer. Create a compelling, personalized cover letter.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

COMPANY: ${companyName}

TASK:
Write a 3-paragraph cover letter (250-300 words) that:

PARAGRAPH 1 (Opening):
- Express enthusiasm for the specific role
- Mention how you found the position
- Brief value proposition (1-2 sentences)

PARAGRAPH 2 (Body):
- Highlight 2-3 relevant achievements from resume
- Connect skills to job requirements
- Show knowledge of company/industry
- Quantify impact where possible

PARAGRAPH 3 (Closing):
- Reiterate interest and fit
- Call to action (request interview)
- Professional sign-off

STYLE:
- Professional but personable
- Company-specific (not generic)
- Achievement-focused
- Confident and enthusiastic
- Error-free and polished

OUTPUT:
Return the cover letter text only (no subject line or signature block).

Cover Letter:`;
}

/**
 * Interview Prep Questions Prompt
 */
export function buildInterviewPrepPrompt(
    resumeText: string,
    jobDescription: string
): string {
    return `You are an interview preparation coach. Based on this resume and job description, generate likely interview questions.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

TASK:
Generate 10-15 interview questions the candidate should prepare for, including:

1. EXPERIENCE-BASED (3-4 questions):
   - Questions about specific roles/achievements on resume
   - Gap explanations if needed
   - Career progression reasoning

2. TECHNICAL/SKILLS (3-4 questions):
   - Job-specific technical questions
   - Skill demonstration scenarios
   - Problem-solving questions

3. BEHAVIORAL (3-4 questions):
   - Common STAR method questions
   - Culture fit questions
   - Leadership/teamwork scenarios

4. COMPANY-SPECIFIC (2-3 questions):
   - Why this company/role?
   - Knowledge of company/industry
   - Long-term goals alignment

OUTPUT FORMAT (JSON):
{
  "questions": [
    {
      "category": "<Experience|Technical|Behavioral|Company>",
      "question": "<the question>",
      "difficulty": "<easy|medium|hard>",
      "tip": "<brief answering strategy>"
    }
  ]
}

Return ONLY valid JSON.

Questions:`;
}

/**
 * Inline Suggestions Prompt (for real-time editor feedback)
 */
export function buildInlineSuggestionsPrompt(
    resumeText: string,
    jobDescription?: string
): string {
    return `You are an expert resume editor providing real-time, line-by-line suggestions for improvement.

${jobDescription ? `TARGET POSITION:
${jobDescription}

` : ''}RESUME CONTENT:
${resumeText}

TASK:
Analyze the resume and provide specific, actionable inline suggestions. For each issue found, identify:
1. The exact location (line number, column number, text length)
2. The severity (error, warning, or info)
3. The category (ats, content, formatting, or grammar)
4. The original problematic text
5. A clear explanation of the issue
6. A specific suggested replacement

CATEGORIES:
- **ats**: ATS compatibility issues (keywords, formatting for parsing)
- **content**: Content quality (achievements, quantification, relevance)
- **formatting**: Structure and presentation issues
- **grammar**: Grammar, spelling, punctuation errors

SEVERITY LEVELS:
- **error**: Critical issues that will hurt ATS parsing or credibility (typos, missing sections, bad formatting)
- **warning**: Important improvements that significantly impact quality (weak verbs, missing quantification)
- **info**: Helpful suggestions for optimization (keyword additions, style improvements)

OUTPUT FORMAT (strict JSON array):
[
  {
    "id": "<unique-id>",
    "line": <line-number>,
    "column": <column-number>,
    "length": <text-length>,
    "severity": "<error|warning|info>",
    "category": "<ats|content|formatting|grammar>",
    "message": "<clear explanation of the issue>",
    "suggestion": "<specific replacement text>",
    "originalText": "<the problematic text>"
  }
]

GUIDELINES:
1. Provide 8-15 suggestions (prioritize quality over quantity)
2. Focus on the most impactful changes
3. Be specific with line/column numbers
4. Provide complete replacement text, not just descriptions
5. Include a mix of severity levels (errors first, then warnings, then info)
6. Ensure suggestions are actionable and clear
7. Target ATS optimization as top priority
${jobDescription ? '8. Heavily weight job description alignment' : ''}

IMPORTANT:
- Return ONLY a valid JSON array
- No markdown formatting, no code blocks
- No explanatory text before or after the JSON
- Ensure all strings are properly escaped
- Line numbers start at 1

Begin analysis:`;
}

/**
 * Export all prompt builders
 */
export const PromptBuilder = {
    analysis: buildAnalysisPrompt,
    feedback: buildFeedbackPrompt,
    keywords: buildKeywordPrompt,
    summary: buildSummaryPrompt,
    quantification: buildQuantificationPrompt,
    atsCheck: buildATSCheckPrompt,
    coverLetter: buildCoverLetterPrompt,
    interviewPrep: buildInterviewPrepPrompt,
    inlineSuggestions: buildInlineSuggestionsPrompt,
};

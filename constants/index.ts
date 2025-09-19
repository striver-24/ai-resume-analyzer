export const resumes: Resume[] = [
    {
        id: "1",
        companyName: "Google",
        jobTitle: "Frontend Developer",
        imagePath: "public/images/resume_01.png",
        resumePath: "/resumes/resume-1.pdf",
        feedback: {
            overallScore: 85,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
    {
        id: "2",
        companyName: "Microsoft",
        jobTitle: "Cloud Engineer",
        imagePath: "public/images/resume_02.png",
        resumePath: "/resumes/resume-2.pdf",
        feedback: {
            overallScore: 55,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
    {
        id: "3",
        companyName: "Apple",
        jobTitle: "iOS Developer",
        imagePath: "public/images/resume_03.png",
        resumePath: "/resumes/resume-3.pdf",
        feedback: {
            overallScore: 75,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
];

export const AIResponseFormat = `
  interface Feedback {
    overallScore: number; //max 100
    ATS: {
      score: number;
      tips: { type: "good" | "improve"; tip: string; }[];
    };

    toneAndStyle: CategoryFeedback;
    content: CategoryFeedback;
    structure: CategoryFeedback;
    skills: CategoryFeedback;

    mockInterview: {
      questions: {
        question: string;
        whyTheyAsk: string;
        strongAnswer: string;
        followUps?: string[];
      }[]; // 10–12 items, must directly relate to both the job description and the resume content
    };
  }

  interface CategoryFeedback {
    score: number; //max 100
    tips: {
      type: "good" | "improve";
      tip: string; // short title
      explanation: string; // detailed explanation
    }[]; // 3–4 tips

    problems: {
      snippet: string;          // exact text or a short paraphrase from resume that needs change
      reason: string;           // why this is a problem
      suggestion: string;       // how to fix
      severity?: "low" | "med" | "high"; // drives color if you want
      page?: number;            // starts at 1 if known
      line?: number;            // rough line number
      sectionGuess?: string;    // e.g., "Experience", "Summary"
      source?: "JD" | "ATS";  // tag whether the suggestion is driven by JD alignment or ATS best practices
    }[]; // 3–8 per category if applicable
  }`;

export const prepareInstructions = ({
                                        jobTitle,
                                        jobDescription,
                                    }: {
    jobTitle: string;
    jobDescription: string;
}) =>
    `You are an expert in ATS (Applicant Tracking System) and resume analysis.
  Please analyze and rate this resume and suggest how to improve it.
  The rating can be low if the resume is bad.
  Be thorough and detailed. Don't be afraid to point out any mistakes or areas for improvement.
  If there is a lot to improve, don't hesitate to give low scores. This is to help the user to improve their resume.
  If available, use the job description for the job user is applying to to give more detailed feedback.
  If provided, take the job description into consideration.
  The job title is: ${jobTitle}
  The job description is: ${jobDescription}
  Provide the feedback using the following format: ${AIResponseFormat}
  Return the analysis as a JSON object, without any other text and without the backticks.
  Focus problems[].snippet on short, recognizable text spans from the resume where possible.
  Generate mockInterview.questions that directly reflect resume strengths/weaknesses and the job description; ensure there are 10–12.
  Provide improvement suggestions mapped with tags: source: "JD" or "ATS" for each suggestion.
  Do not include any other text or comments.`;
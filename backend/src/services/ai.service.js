const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");


const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

// Native Gemini API Type Schema definition
const geminiSchema = {
    type: "object",
    properties: {
        title: { 
            type: "string", 
            description: "The title of the job for which the interview report is generated" 
        },
        matchScore: { 
            type: "number", 
            description: "A score between 0 and 100 indicating how well the candidate's profile matches the job description" 
        },
        technicalQuestions: {
            type: "array",
            description: "Technical questions tailored to the candidate and job description",
            items: {
                type: "object",
                properties: {
                    question: { type: "string", description: "The technical question to be asked in the interview" },
                    intention: { type: "string", description: "The intention of the interviewer behind asking this question" },
                    answer: { type: "string", description: "How to answer this question, what points to cover, and what approach to take" }
                },
                required: ["question", "intention", "answer"]
            }
        },
        behavioralQuestions: {
            type: "array",
            description: "Behavioral questions tailored to the candidate's experience",
            items: {
                type: "object",
                properties: {
                    question: { type: "string", description: "The behavioral question to be asked in the interview" },
                    intention: { type: "string", description: "The intention of the interviewer behind asking this question" },
                    answer: { type: "string", description: "How to answer this question using frameworks like STAR, what to highlight" }
                },
                required: ["question", "intention", "answer"]
            }
        },
        skillGaps: {
            type: "array",
            description: "List of skill gaps identified in the candidate's profile",
            items: {
                type: "object",
                properties: {
                    skill: { type: "string", description: "The skill which the candidate is lacking or weak in" },
                    severity: { 
                        type: "string", 
                        enum: ["low", "medium", "high"],
                        description: "How crucial this skill is for the role" 
                    }
                },
                required: ["skill", "severity"]
            }
        },
        preparationPlan: {
            type: "array",
            description: "A structured day-wise preparation plan for the candidate",
            items: {
                type: "object",
                properties: {
                    day: { type: "number", description: "The day number in the preparation plan, starting from 1" },
                    focus: { type: "string", description: "The main focus of this day (e.g., System Design, Mock Interview)" },
                    tasks: { 
                        type: "array", 
                        items: { type: "string" },
                        description: "Actionable tasks to complete on this day" 
                    }
                },
                required: ["day", "focus", "tasks"]
            }
        }
    },
    required: ["title", "matchScore", "technicalQuestions", "behavioralQuestions", "skillGaps", "preparationPlan"]
};

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const prompt = `
        Generate a detailed interview report for a candidate using these details:
        
        [Candidate Resume]
        ${resume}
        
        [Candidate Self Description]
        ${selfDescription}
        
        [Target Job Description]
        ${jobDescription}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash", 
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: geminiSchema, // Using the native schema directly
            }
        });

        const reportData = JSON.parse(response.text);
        return reportData;

    } catch (error) {
        console.error("Error generating interview report:", error);
        throw error;
    }
}

const pdf = require("html-pdf-node");

async function generatePdfFromHtml(htmlContent) {
    const file = { content: htmlContent };

    const options = {
        format: "A4",
        printBackground: true,
        margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    };

    const pdfBuffer = await pdf.generatePdf(file, options);
    return pdfBuffer;
}


module.exports = { generateInterviewReport, generateResumePdf };
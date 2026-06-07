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


async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
    });

    const page = await browser.newPage();

    await page.setContent(htmlContent, {
        waitUntil: "networkidle0",
    });

    const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm",
        },
    });

    await browser.close();

    return pdfBuffer;
}
async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        }
    })


    const jsonContent = JSON.parse(response.text)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer

}



module.exports = { generateInterviewReport, generateResumePdf };
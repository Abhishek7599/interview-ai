const pdfParse = require("pdf-parse");
const {generateInterviewReport,generateResumePdf} = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")



/**
 *@description controller to generate interview report on the basis of user self description, resume pdf and job description
 */
async function generateInterviewReportController(req, res) {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({
                message: "Resume file is required"
            });
        }

        // ✅ Correct PDF parsing
        const data = await pdfParse(req.file.buffer);
        const resumeContent = data.text;

        const { selfDescription, jobDescription } = req.body;

        const interviewReportByAi = await generateInterviewReport({
            resume: resumeContent,
            selfDescription,
            jobDescription,
        });

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeContent,
            selfDescription,
            jobDescription,
            ...interviewReportByAi
        });

        return res.status(201).json({
            message: "Interview report generated successfully",
            interviewReport
        });

    } catch (error) {
        console.error("Error generating interview report:", error);

        return res.status(500).json({
            message: "Internal server error while generating interview report"
        });
    }
}

async function getInterviewReportByIdController(req,res) {
    const {interviewId} = req.params;

    const interviewReport = await interviewReportModel.findOne({_id: interviewId, user: req.user.id});
    if (!interviewReport) {
        return res.status(404).json({message: "Interview report not found"});
    }

    res.status(200).json({
        message: "Interview report retrieved successfully",
        interviewReport
    });
}

/**
 * @description controller to get all interview reports of logged in user
 */
async function getAllInterviewReportsController(req,res) {
    const interviewReports = await interviewReportModel.find({user: req.user.id}).sort({createdAt: -1}).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan");

    res.status(200).json({
        message: "Interview reports retrieved successfully",
        interviewReports
    });
}

async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params;

        const interviewReport = await interviewReportModel.findById(interviewReportId);

        if (!interviewReport) {
            return res.status(404).json({ message: "Not found" });
        }

        const pdfBuffer = await generateResumePdf(interviewReport);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=resume.pdf`
        );

        return res.end(pdfBuffer);

    } catch (error) {
        console.error("PDF ERROR:", error);

        return res.status(500).json({
            message: "PDF generation failed",
            error: error.message
        });
    }
}


module.exports = { generateInterviewReportController, getInterviewReportByIdController,getAllInterviewReportsController, generateResumePdfController }
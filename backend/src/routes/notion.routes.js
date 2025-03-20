const express = require("express");
const router = express.Router();
const notionController = require("../controllers/notion.controller");

// Get Notion content by ID
router.get("/content/:notionId", notionController.getNotionContent);

// Sync a course lesson with Notion content
router.post("/sync/:courseId/:lessonId", notionController.syncWithNotion);

module.exports = router;

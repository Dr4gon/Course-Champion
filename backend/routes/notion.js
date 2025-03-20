const express = require("express");
const router = express.Router();
const axios = require("axios");
const { authenticateToken } = require("../middleware/auth");

// Mock Notion configuration - in a real app, these would come from environment variables
const NOTION_CLIENT_ID = "your-client-id";
const NOTION_CLIENT_SECRET = "your-client-secret";
const NOTION_REDIRECT_URI = "http://localhost:3000/api/notion/callback";

/**
 * @route   GET /api/notion/auth
 * @desc    Get OAuth URL for Notion authentication
 * @access  Private
 */
router.get("/auth", authenticateToken, (req, res) => {
  const state = Buffer.from(
    JSON.stringify({
      userId: req.user.id,
      courseId: req.query.courseId,
      lessonId: req.query.lessonId,
    })
  ).toString("base64");

  const notionAuthUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${NOTION_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    NOTION_REDIRECT_URI
  )}&response_type=code&state=${state}`;

  res.json({ authUrl: notionAuthUrl });
});

/**
 * @route   GET /api/notion/callback
 * @desc    Handle Notion OAuth callback
 * @access  Public
 */
router.get("/callback", async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  try {
    // Decode state parameter to get user and course information
    const stateData = JSON.parse(Buffer.from(state, "base64").toString());

    // Exchange code for access token
    // In a real implementation, this would be an actual API call:
    // const tokenResponse = await axios.post('https://api.notion.com/v1/oauth/token', {
    //   grant_type: 'authorization_code',
    //   code,
    //   redirect_uri: NOTION_REDIRECT_URI
    // }, {
    //   headers: {
    //     'Authorization': `Basic ${Buffer.from(`${NOTION_CLIENT_ID}:${NOTION_CLIENT_SECRET}`).toString('base64')}`,
    //     'Content-Type': 'application/json'
    //   }
    // });

    // Mock response for demonstration
    const tokenResponse = {
      data: {
        access_token: "mock_access_token_" + Date.now(),
        workspace_id: "mock_workspace_id",
        workspace_name: "Demo Workspace",
        workspace_icon: "https://example.com/icon.png",
        bot_id: "mock_bot_id",
      },
    };

    // Save the token to the database (in a real implementation)
    // await User.findByIdAndUpdate(stateData.userId, {
    //   $set: {
    //     'notionIntegration.accessToken': tokenResponse.data.access_token,
    //     'notionIntegration.workspaceId': tokenResponse.data.workspace_id,
    //     'notionIntegration.workspaceName': tokenResponse.data.workspace_name
    //   }
    // });

    // Create a new page in Notion for this course/lesson (in a real implementation)
    // const pageResponse = await axios.post('https://api.notion.com/v1/pages', {
    //   parent: { database_id: 'your-database-id' },
    //   properties: {
    //     title: { title: [{ text: { content: `Course Notes: ${stateData.courseId} - Lesson ${stateData.lessonId}` } }] },
    //     Course: { rich_text: [{ text: { content: stateData.courseId.toString() } }] },
    //     Lesson: { rich_text: [{ text: { content: stateData.lessonId.toString() } }] }
    //   }
    // }, {
    //   headers: {
    //     'Authorization': `Bearer ${tokenResponse.data.access_token}`,
    //     'Content-Type': 'application/json',
    //     'Notion-Version': '2022-06-28'
    //   }
    // });

    // Redirect to the frontend with success
    res.redirect(
      `http://localhost:8080/courses/${stateData.courseId}?lesson=${stateData.lessonId}&notion=success`
    );
  } catch (error) {
    console.error("Notion OAuth error:", error);
    res.redirect(`http://localhost:8080/courses?error=notion_auth_failed`);
  }
});

/**
 * @route   POST /api/notion/sync
 * @desc    Sync course content with Notion
 * @access  Private
 */
router.post("/sync", authenticateToken, async (req, res) => {
  const { courseId, lessonId, notes } = req.body;

  if (!courseId || !lessonId) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  try {
    // In a real implementation, we would retrieve the user's Notion access token
    // const user = await User.findById(req.user.id);
    // if (!user.notionIntegration || !user.notionIntegration.accessToken) {
    //   return res.status(400).json({ message: 'User not connected to Notion' });
    // }

    // Then we would push the notes to Notion
    // const notionResponse = await axios.patch(`https://api.notion.com/v1/pages/${pageId}`, {
    //   properties: {
    //     // Update properties
    //   },
    //   children: [
    //     // Add blocks for each note
    //     ...notes.map(note => ({
    //       object: 'block',
    //       type: 'paragraph',
    //       paragraph: {
    //         rich_text: [{ type: 'text', text: { content: note.text } }]
    //       }
    //     }))
    //   ]
    // }, {
    //   headers: {
    //     'Authorization': `Bearer ${user.notionIntegration.accessToken}`,
    //     'Content-Type': 'application/json',
    //     'Notion-Version': '2022-06-28'
    //   }
    // });

    // Mock success response for demonstration
    setTimeout(() => {
      res.json({
        success: true,
        message: "Notes synced to Notion successfully",
        syncedAt: new Date().toISOString(),
      });
    }, 1000);
  } catch (error) {
    console.error("Notion sync error:", error);
    res.status(500).json({ message: "Failed to sync with Notion" });
  }
});

/**
 * @route   GET /api/notion/pages
 * @desc    Get list of Notion pages for user
 * @access  Private
 */
router.get("/pages", authenticateToken, async (req, res) => {
  try {
    // In a real implementation, we would:
    // 1. Retrieve the user's Notion access token
    // 2. Query Notion for the user's pages

    // Mock response for demonstration
    setTimeout(() => {
      res.json({
        pages: [
          {
            id: "page1",
            title: "Course Notes: Introduction to Programming",
            lastEdited: new Date(Date.now() - 86400000).toISOString(),
            url: "https://notion.so/page1",
          },
          {
            id: "page2",
            title: "Course Notes: Web Development Basics",
            lastEdited: new Date(Date.now() - 172800000).toISOString(),
            url: "https://notion.so/page2",
          },
          {
            id: "page3",
            title: "Course Notes: Advanced JavaScript",
            lastEdited: new Date(Date.now() - 259200000).toISOString(),
            url: "https://notion.so/page3",
          },
        ],
      });
    }, 500);
  } catch (error) {
    console.error("Notion pages error:", error);
    res.status(500).json({ message: "Failed to retrieve Notion pages" });
  }
});

/**
 * @route   DELETE /api/notion/disconnect
 * @desc    Disconnect Notion integration
 * @access  Private
 */
router.delete("/disconnect", authenticateToken, async (req, res) => {
  try {
    // In a real implementation, we would:
    // 1. Revoke the Notion access token
    // 2. Remove the Notion integration details from the user's account

    // Mock response for demonstration
    setTimeout(() => {
      res.json({
        success: true,
        message: "Notion integration disconnected successfully",
      });
    }, 500);
  } catch (error) {
    console.error("Notion disconnect error:", error);
    res
      .status(500)
      .json({ message: "Failed to disconnect Notion integration" });
  }
});

module.exports = router;

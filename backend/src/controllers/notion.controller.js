// Note: This is a simulated Notion API integration for demo purposes
// In a real app, you would use the official Notion API client

/**
 * Simulates fetching a Notion page or database
 * @param {string} notionId - Notion page or database ID
 * @returns {Promise<Object>} - The fetched content
 */
const fetchNotionContent = async (notionId) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Return mock Notion content
  return {
    id: notionId,
    title: "Sample Notion Page",
    blocks: [
      {
        type: "heading_1",
        content: "Course Introduction",
      },
      {
        type: "paragraph",
        content:
          "Welcome to this course! This content was imported from Notion.",
      },
      {
        type: "heading_2",
        content: "Learning Objectives",
      },
      {
        type: "bulleted_list",
        items: [
          "Understand the basics",
          "Learn advanced techniques",
          "Apply knowledge to real-world problems",
        ],
      },
      {
        type: "callout",
        content: "Note: This course requires some prior knowledge.",
      },
    ],
    lastSynced: new Date().toISOString(),
  };
};

/**
 * Fetches content from a Notion page and returns it in a format suitable for the course
 */
exports.getNotionContent = async (req, res) => {
  try {
    const { notionId } = req.params;

    if (!notionId) {
      return res.status(400).json({ message: "Notion ID is required" });
    }

    const notionContent = await fetchNotionContent(notionId);

    // Convert Notion content to HTML for the course
    const htmlContent = convertNotionToHtml(notionContent);

    res.json({
      notionId,
      html: htmlContent,
      lastSynced: notionContent.lastSynced,
    });
  } catch (error) {
    console.error("Error fetching Notion content:", error);
    res.status(500).json({ message: "Failed to fetch Notion content" });
  }
};

/**
 * Syncs a course lesson with Notion content
 */
exports.syncWithNotion = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const { notionId } = req.body;

    if (!notionId) {
      return res.status(400).json({ message: "Notion ID is required" });
    }

    // Fetch Notion content
    const notionContent = await fetchNotionContent(notionId);

    // Convert to HTML
    const htmlContent = convertNotionToHtml(notionContent);

    // In a real app, we would update the lesson content in the database
    // For demo purposes, just return success
    res.json({
      message: "Lesson successfully synced with Notion",
      courseId,
      lessonId,
      notionId,
      lastSynced: notionContent.lastSynced,
    });
  } catch (error) {
    console.error("Error syncing with Notion:", error);
    res.status(500).json({ message: "Failed to sync with Notion" });
  }
};

/**
 * Converts Notion content to HTML
 * @param {Object} notionContent - The Notion content to convert
 * @returns {string} - HTML content
 */
const convertNotionToHtml = (notionContent) => {
  let html = `<h1>${notionContent.title}</h1>`;

  notionContent.blocks.forEach((block) => {
    switch (block.type) {
      case "heading_1":
        html += `<h1>${block.content}</h1>`;
        break;
      case "heading_2":
        html += `<h2>${block.content}</h2>`;
        break;
      case "heading_3":
        html += `<h3>${block.content}</h3>`;
        break;
      case "paragraph":
        html += `<p>${block.content}</p>`;
        break;
      case "bulleted_list":
        html += "<ul>";
        block.items.forEach((item) => {
          html += `<li>${item}</li>`;
        });
        html += "</ul>";
        break;
      case "callout":
        html += `<div class="callout">${block.content}</div>`;
        break;
      default:
        // Handle other block types
        break;
    }
  });

  return html;
};

const express = require('express');
const router = express.Router();
const { getPageMarkdown, extractPageId, importNotionPage, getCachedPageData } = require('../services/notionService');

/**
 * @route   GET /api/notion/page
 * @desc    Get a Notion page content in Markdown format (legacy endpoint)
 * @access  Public
 * @param   {string} url - URL of the Notion page
 */
router.get('/page', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a Notion page URL',
      });
    }

    try {
      // Validate URL by checking if a page ID can be extracted
      extractPageId(url);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    const pageData = await getPageMarkdown(url);

    res.json({
      success: true,
      data: pageData,
    });
  } catch (error) {
    console.error('Notion page error:', error.message);

    // Notion API error handling
    if (error.message.includes('API') || error.message.includes('Unauthorized') || error.message.includes('Access')) {
      return res.status(403).json({
        success: false,
        error: 'Error accessing the Notion page. Please check your API key and page permissions.',
      });
    }

    res.status(500).json({
      success: false,
      error: `Error retrieving Notion page: ${error.message}`,
    });
  }
});

/**
 * @route   GET /api/notion/import
 * @desc    Import a complete Notion page with all content and metadata
 * @access  Public
 * @param   {string} url - URL of the Notion page
 * @param   {string} format - Output format ('all', 'markdown', 'html', 'json')
 * @param   {boolean} cache - Whether to use cache (default: true)
 * @param   {boolean} children - Whether to include nested children (default: true)
 */
router.get('/import', async (req, res) => {
  try {
    const { url, format, cache, children } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a Notion page URL',
      });
    }

    try {
      // Validate URL by checking if a page ID can be extracted
      extractPageId(url);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    // Parse options
    const options = {
      outputFormat: ['all', 'markdown', 'html', 'json'].includes(format) ? format : 'all',
      useCache: cache !== 'false',
      includeChildren: children !== 'false',
    };

    // Import the complete page
    const pageData = await importNotionPage(url, options);

    res.json({
      success: true,
      data: pageData,
    });
  } catch (error) {
    console.error('Notion import error:', error.message);

    // Notion API error handling
    if (error.message.includes('API') || error.message.includes('Unauthorized') || error.message.includes('Access')) {
      return res.status(403).json({
        success: false,
        error: 'Error accessing the Notion page. Please check your API key and page permissions.',
      });
    }

    res.status(500).json({
      success: false,
      error: `Error importing Notion page: ${error.message}`,
    });
  }
});

/**
 * @route   GET /api/notion/cached/:pageId
 * @desc    Get a cached Notion page if available
 * @access  Public
 * @param   {string} pageId - ID of the Notion page
 */
router.get('/cached/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;

    const cachedData = await getCachedPageData(pageId);

    if (!cachedData) {
      return res.status(404).json({
        success: false,
        error: 'No cached data found for this page ID',
      });
    }

    res.json({
      success: true,
      data: cachedData,
    });
  } catch (error) {
    console.error('Cache retrieval error:', error.message);

    res.status(500).json({
      success: false,
      error: `Error retrieving cached page: ${error.message}`,
    });
  }
});

module.exports = router;

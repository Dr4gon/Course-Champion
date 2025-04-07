const { Client } = require('@notionhq/client');
const dotenv = require('dotenv');
const fs = require('fs').promises;
const path = require('path');

dotenv.config();

// Initialize Notion client with API key from environment variables
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// Cache directory for storing imported pages
const CACHE_DIR = path.join(__dirname, '../cache/notion');

/**
 * Extract page ID from a Notion URL
 * @param {string} url - Notion page URL
 * @returns {string} - The page ID
 */
const extractPageId = url => {
  try {
    // Regular expression to match Notion page ID patterns
    const pattern = /([a-zA-Z0-9]{32})|([a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12})/;
    const match = url.match(pattern);

    if (!match) {
      throw new Error('Invalid Notion URL: Could not extract page ID');
    }

    return match[0];
  } catch (error) {
    throw new Error(`Error extracting page ID: ${error.message}`);
  }
};

/**
 * Retrieve all blocks for a page recursively, including nested blocks
 * @param {string} blockId - Block ID to retrieve children for
 * @param {number} depth - Current depth of recursion (used to prevent infinite loops)
 * @returns {Array} - Array of block objects with their children
 */
const getAllBlocksRecursive = async (blockId, depth = 0) => {
  if (depth > 5) {
    // Prevent excessive recursion
    return [];
  }

  try {
    const blocks = [];
    let cursor;
    let hasMore = true;

    // Paginate through all blocks
    while (hasMore) {
      const response = await notion.blocks.children.list({
        block_id: blockId,
        start_cursor: cursor,
        page_size: 100,
      });

      const newBlocks = response.results;
      blocks.push(...newBlocks);

      hasMore = response.has_more;
      cursor = response.next_cursor;
    }

    // Process blocks with children in parallel batches
    const blocksWithChildren = blocks.filter(block => block.has_children);
    const BATCH_SIZE = 5; // Process 5 blocks at a time to avoid rate limiting

    for (let i = 0; i < blocksWithChildren.length; i += BATCH_SIZE) {
      const batch = blocksWithChildren.slice(i, i + BATCH_SIZE);
      const childBlocksPromises = batch.map(block => getAllBlocksRecursive(block.id, depth + 1));

      const childBlocksResults = await Promise.all(childBlocksPromises);

      // Update the original blocks with their children
      batch.forEach((block, index) => {
        const blockIndex = blocks.findIndex(b => b.id === block.id);
        if (blockIndex !== -1) {
          blocks[blockIndex].children = childBlocksResults[index];
        }
      });

      // Add a small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < blocksWithChildren.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return blocks;
  } catch (error) {
    console.error(`Error retrieving blocks for ${blockId}:`, error);
    return [];
  }
};

/**
 * Get simple block children (non-recursive version)
 * @param {string} blockId - Block ID to retrieve children for
 * @returns {Array} - Array of block objects
 */
const getBlockChildren = async blockId => {
  try {
    const { results } = await notion.blocks.children.list({
      block_id: blockId,
    });
    return results;
  } catch (error) {
    throw new Error(`Error retrieving block children: ${error.message}`);
  }
};

/**
 * Convert Notion blocks to Markdown
 * @param {Array} blocks - Array of Notion blocks
 * @returns {string} - Markdown representation of the blocks
 */
const convertToMarkdown = async blocks => {
  let markdown = '';

  for (const block of blocks) {
    switch (block.type) {
      case 'paragraph':
        markdown += getParagraphText(block) + '\n\n';
        break;

      case 'heading_1':
        markdown += `# ${getTextContent(block.heading_1.rich_text)}\n\n`;
        break;

      case 'heading_2':
        markdown += `## ${getTextContent(block.heading_2.rich_text)}\n\n`;
        break;

      case 'heading_3':
        markdown += `### ${getTextContent(block.heading_3.rich_text)}\n\n`;
        break;

      case 'bulleted_list_item':
        markdown += `* ${getTextContent(block.bulleted_list_item.rich_text)}\n`;
        break;

      case 'numbered_list_item':
        markdown += `1. ${getTextContent(block.numbered_list_item.rich_text)}\n`;
        break;

      case 'to_do':
        const isChecked = block.to_do.checked;
        markdown += `- [${isChecked ? 'x' : ' '}] ${getTextContent(block.to_do.rich_text)}\n`;
        break;

      case 'toggle':
        markdown += `<details><summary>${getTextContent(block.toggle.rich_text)}</summary>\n\n`;

        // Handle nested content
        if (block.has_children) {
          const children = await getBlockChildren(block.id);
          markdown += await convertToMarkdown(children);
        }

        markdown += '</details>\n\n';
        break;

      case 'code':
        const language = block.code.language || '';
        markdown += `\`\`\`${language}\n${getTextContent(block.code.rich_text)}\n\`\`\`\n\n`;
        break;

      case 'quote':
        markdown += `> ${getTextContent(block.quote.rich_text)}\n\n`;
        break;

      case 'divider':
        markdown += '---\n\n';
        break;

      case 'callout':
        const emoji = block.callout.icon && block.callout.icon.type === 'emoji' ? block.callout.icon.emoji : '';
        markdown += `> ${emoji} **Note:** ${getTextContent(block.callout.rich_text)}\n\n`;
        break;

      case 'bookmark':
        markdown += `[${
          block.bookmark.caption?.length ? getTextContent(block.bookmark.caption) : block.bookmark.url
        }](${block.bookmark.url})\n\n`;
        break;

      case 'equation':
        markdown += `$$\n${block.equation.expression}\n$$\n\n`;
        break;

      case 'table':
        // Handle tables in the nested loop since we need the children
        if (block.has_children) {
          const tableRows = await getBlockChildren(block.id);
          const numColumns = block.table.table_width;

          // Create header row
          let tableMarkdown = '';

          // Create the table rows
          for (let i = 0; i < tableRows.length; i++) {
            const row = tableRows[i];

            if (row.type === 'table_row') {
              const cells = row.table_row.cells;

              // Create row with cell content
              tableMarkdown += '| ';
              for (let j = 0; j < cells.length; j++) {
                tableMarkdown += getTextContent(cells[j]) + ' | ';
              }
              tableMarkdown += '\n';

              // Add separator row after header
              if (i === 0 && block.table.has_column_header) {
                tableMarkdown += '| ';
                for (let j = 0; j < numColumns; j++) {
                  tableMarkdown += '--- | ';
                }
                tableMarkdown += '\n';
              }
            }
          }

          markdown += tableMarkdown + '\n';
        }
        break;

      case 'image':
        const imageUrl = block.image.type === 'external' ? block.image.external.url : block.image.file.url;
        const imageCaption =
          block.image.caption && block.image.caption.length > 0 ? getTextContent(block.image.caption) : 'Image';
        markdown += `![${imageCaption}](${imageUrl})\n\n`;
        break;

      // Handle nested blocks using the already loaded children
      default:
        if (block.has_children) {
          // Use children from recursive fetch if available
          const children = block.children || (await getBlockChildren(block.id));
          markdown += await convertToMarkdown(children);
        }
        break;
    }
  }

  return markdown;
};

/**
 * Convert blocks to HTML
 * @param {Array} blocks - Array of Notion blocks
 * @returns {string} - HTML representation of blocks
 */
const convertToHTML = async blocks => {
  let html = '';

  for (const block of blocks) {
    switch (block.type) {
      case 'paragraph':
        html += `<p>${getTextContentHTML(block.paragraph.rich_text)}</p>\n`;
        break;

      case 'heading_1':
        html += `<h1>${getTextContentHTML(block.heading_1.rich_text)}</h1>\n`;
        break;

      case 'heading_2':
        html += `<h2>${getTextContentHTML(block.heading_2.rich_text)}</h2>\n`;
        break;

      case 'heading_3':
        html += `<h3>${getTextContentHTML(block.heading_3.rich_text)}</h3>\n`;
        break;

      case 'bulleted_list_item':
        html += `<ul><li>${getTextContentHTML(block.bulleted_list_item.rich_text)}</li></ul>\n`;
        break;

      case 'numbered_list_item':
        html += `<ol><li>${getTextContentHTML(block.numbered_list_item.rich_text)}</li></ol>\n`;
        break;

      case 'to_do':
        const isChecked = block.to_do.checked;
        html += `<div class="todo"><input type="checkbox" ${
          isChecked ? 'checked' : ''
        } disabled /> ${getTextContentHTML(block.to_do.rich_text)}</div>\n`;
        break;

      case 'toggle':
        html += `<details><summary>${getTextContentHTML(block.toggle.rich_text)}</summary>\n`;

        if (block.has_children) {
          const children = block.children || (await getBlockChildren(block.id));
          html += await convertToHTML(children);
        }

        html += '</details>\n';
        break;

      case 'code':
        const language = block.code.language || '';
        html += `<pre><code class="language-${language}">${getTextContentHTML(block.code.rich_text)}</code></pre>\n`;
        break;

      case 'quote':
        html += `<blockquote>${getTextContentHTML(block.quote.rich_text)}</blockquote>\n`;
        break;

      case 'divider':
        html += '<hr />\n';
        break;

      case 'image':
        const imageUrl = block.image.type === 'external' ? block.image.external.url : block.image.file.url;
        const imageCaption =
          block.image.caption && block.image.caption.length > 0 ? getTextContentHTML(block.image.caption) : 'Image';
        html += `<figure><img src="${imageUrl}" alt="${imageCaption}" /><figcaption>${imageCaption}</figcaption></figure>\n`;
        break;

      default:
        if (block.has_children) {
          const children = block.children || (await getBlockChildren(block.id));
          html += await convertToHTML(children);
        }
        break;
    }
  }

  return html;
};

/**
 * Get text content from paragraph block
 * @param {Object} block - Notion paragraph block
 * @returns {string} - Formatted paragraph text
 */
const getParagraphText = block => {
  if (!block.paragraph || !block.paragraph.rich_text) {
    return '';
  }

  return getTextContent(block.paragraph.rich_text);
};

/**
 * Extract text content from rich_text array with formatting for Markdown
 * @param {Array} richTextArray - Notion rich text array
 * @returns {string} - Formatted text content
 */
const getTextContent = richTextArray => {
  if (!richTextArray || richTextArray.length === 0) {
    return '';
  }

  return richTextArray
    .map(textObj => {
      let text = textObj.plain_text;

      // Apply basic formatting
      if (textObj.annotations) {
        if (textObj.annotations.bold) text = `**${text}**`;
        if (textObj.annotations.italic) text = `*${text}*`;
        if (textObj.annotations.strikethrough) text = `~~${text}~~`;
        if (textObj.annotations.code) text = `\`${text}\``;
      }

      // Handle links
      if (textObj.href) {
        text = `[${text}](${textObj.href})`;
      }

      return text;
    })
    .join('');
};

/**
 * Extract text content from rich_text array with HTML formatting
 * @param {Array} richTextArray - Notion rich text array
 * @returns {string} - HTML formatted text content
 */
const getTextContentHTML = richTextArray => {
  if (!richTextArray || richTextArray.length === 0) {
    return '';
  }

  return richTextArray
    .map(textObj => {
      let text = textObj.plain_text;
      text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      // Apply HTML formatting
      if (textObj.annotations) {
        if (textObj.annotations.bold) text = `<strong>${text}</strong>`;
        if (textObj.annotations.italic) text = `<em>${text}</em>`;
        if (textObj.annotations.strikethrough) text = `<del>${text}</del>`;
        if (textObj.annotations.code) text = `<code>${text}</code>`;
        if (textObj.annotations.underline) text = `<u>${text}</u>`;

        // Handle color
        if (textObj.annotations.color && textObj.annotations.color !== 'default') {
          text = `<span class="color-${textObj.annotations.color}">${text}</span>`;
        }
      }

      // Handle links
      if (textObj.href) {
        text = `<a href="${textObj.href}">${text}</a>`;
      }

      return text;
    })
    .join('');
};

/**
 * Get Notion page database properties
 * @param {Object} pageInfo - Page info from Notion API
 * @returns {Object} - Extracted properties
 */
const extractPageProperties = pageInfo => {
  if (!pageInfo.properties) {
    return {};
  }

  const properties = {};

  // Process each property based on its type
  Object.entries(pageInfo.properties).forEach(([key, property]) => {
    switch (property.type) {
      case 'title':
        properties[key] = property.title.map(t => t.plain_text).join('');
        break;
      case 'rich_text':
        properties[key] = property.rich_text.map(t => t.plain_text).join('');
        break;
      case 'number':
        properties[key] = property.number;
        break;
      case 'select':
        properties[key] = property.select?.name || null;
        break;
      case 'multi_select':
        properties[key] = property.multi_select.map(option => option.name);
        break;
      case 'date':
        properties[key] = property.date;
        break;
      case 'checkbox':
        properties[key] = property.checkbox;
        break;
      case 'url':
        properties[key] = property.url;
        break;
      case 'email':
        properties[key] = property.email;
        break;
      case 'phone_number':
        properties[key] = property.phone_number;
        break;
      case 'people':
        properties[key] = property.people.map(person => ({
          id: person.id,
          name: person.name,
          avatar_url: person.avatar_url,
        }));
        break;
      case 'files':
        properties[key] = property.files.map(file => ({
          name: file.name,
          url: file.type === 'external' ? file.external.url : file.file.url,
        }));
        break;
      case 'relation':
        properties[key] = property.relation.map(rel => rel.id);
        break;
      default:
        // For other types, store the raw value
        properties[key] = property;
    }
  });

  return properties;
};

/**
 * Cache the imported page to the filesystem
 * @param {string} pageId - Notion page ID
 * @param {Object} pageData - The page data to cache
 * @returns {boolean} - Success status
 */
const cachePageData = async (pageId, pageData) => {
  try {
    // Create cache directory if it doesn't exist
    await fs.mkdir(CACHE_DIR, { recursive: true });

    const cachePath = path.join(CACHE_DIR, `${pageId}.json`);
    await fs.writeFile(cachePath, JSON.stringify(pageData, null, 2));
    return true;
  } catch (error) {
    console.error('Error caching page data:', error);
    return false;
  }
};

/**
 * Get cached page data if available
 * @param {string} pageId - Notion page ID
 * @returns {Object|null} - Cached page data or null if not available
 */
const getCachedPageData = async pageId => {
  try {
    const cachePath = path.join(CACHE_DIR, `${pageId}.json`);
    const data = await fs.readFile(cachePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Cache miss or error reading cache
    return null;
  }
};

/**
 * Import a complete Notion page with all content and metadata
 * @param {string} pageUrl - URL of the Notion page
 * @param {Object} options - Import options
 * @returns {Object} - Complete page data
 */
const importNotionPage = async (pageUrl, options = {}) => {
  const {
    useCache = true,
    outputFormat = 'all', // 'all', 'markdown', 'html', 'json'
    includeChildren = true,
  } = options;

  try {
    const pageId = extractPageId(pageUrl);

    // Try to get from cache if enabled
    if (useCache) {
      const cachedData = await getCachedPageData(pageId);
      if (cachedData) {
        // Return only requested format if specified
        if (outputFormat !== 'all') {
          return {
            id: cachedData.id,
            title: cachedData.title,
            [outputFormat]: cachedData[outputFormat],
            properties: cachedData.properties,
            lastUpdated: cachedData.lastUpdated,
            url: cachedData.url,
          };
        }
        return cachedData;
      }
    }

    // Get basic page information
    const pageInfo = await notion.pages.retrieve({
      page_id: pageId,
    });

    // Get all blocks (with or without children based on the option)
    const blocks = includeChildren ? await getAllBlocksRecursive(pageId) : await getBlockChildren(pageId);

    // Get page metadata
    let title = 'Notion Page';
    if (pageInfo.properties && pageInfo.properties.title) {
      const titleProp = pageInfo.properties.title;
      if (titleProp.title && titleProp.title.length > 0) {
        title = getTextContent(titleProp.title);
      }
    }

    // Extract page properties
    const properties = extractPageProperties(pageInfo);

    // Convert content to requested formats
    let markdown = '';
    let html = '';

    if (outputFormat === 'all' || outputFormat === 'markdown') {
      markdown = await convertToMarkdown(blocks);
    }

    if (outputFormat === 'all' || outputFormat === 'html') {
      html = await convertToHTML(blocks);
    }

    // Build the final result
    const pageData = {
      id: pageId,
      title,
      url: pageUrl,
      lastUpdated: pageInfo.last_edited_time,
      createdTime: pageInfo.created_time,
      properties,
      // Include requested formats
      blocks: outputFormat === 'all' || outputFormat === 'json' ? blocks : undefined,
      markdown: outputFormat === 'all' || outputFormat === 'markdown' ? markdown : undefined,
      html: outputFormat === 'all' || outputFormat === 'html' ? html : undefined,
      icon: pageInfo.icon || null,
      cover: pageInfo.cover || null,
    };

    // Cache the result if caching is enabled
    if (useCache) {
      await cachePageData(pageId, pageData);
    }

    return pageData;
  } catch (error) {
    throw new Error(`Error importing Notion page: ${error.message}`);
  }
};

/**
 * Get Notion page content as Markdown (legacy function for backward compatibility)
 * @param {string} pageUrl - URL of the Notion page
 * @returns {Object} - Object containing page info and markdown content
 */
const getPageMarkdown = async pageUrl => {
  try {
    const result = await importNotionPage(pageUrl, { outputFormat: 'markdown' });
    return {
      id: result.id,
      title: result.title,
      markdown: result.markdown,
      lastUpdated: result.lastUpdated,
    };
  } catch (error) {
    throw new Error(`Error retrieving Notion page: ${error.message}`);
  }
};

module.exports = {
  getPageMarkdown,
  extractPageId,
  importNotionPage,
  convertToMarkdown,
  convertToHTML,
  getCachedPageData,
};

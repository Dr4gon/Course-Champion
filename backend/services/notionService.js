const { Client } = require('@notionhq/client');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Notion client with API key from environment variables
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

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
 * Retrieve all blocks for a page
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

      case 'image':
        const imageUrl = block.image.type === 'external' ? block.image.external.url : block.image.file.url;
        const imageCaption =
          block.image.caption && block.image.caption.length > 0 ? getTextContent(block.image.caption) : 'Image';
        markdown += `![${imageCaption}](${imageUrl})\n\n`;
        break;

      // Handle nested blocks
      default:
        if (block.has_children) {
          const children = await getBlockChildren(block.id);
          markdown += await convertToMarkdown(children);
        }
        break;
    }
  }

  return markdown;
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
 * Extract text content from rich_text array with formatting
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
 * Get Notion page content as Markdown
 * @param {string} pageUrl - URL of the Notion page
 * @returns {Object} - Object containing page info and markdown content
 */
const getPageMarkdown = async pageUrl => {
  try {
    const pageId = extractPageId(pageUrl);

    // Get page information
    const pageInfo = await notion.pages.retrieve({
      page_id: pageId,
    });

    // Get all blocks in the page
    const blocks = await getBlockChildren(pageId);

    // Convert blocks to Markdown
    const markdown = await convertToMarkdown(blocks);

    // Get page title
    let title = 'Notion Page';
    if (pageInfo.properties && pageInfo.properties.title) {
      const titleProp = pageInfo.properties.title;
      if (titleProp.title && titleProp.title.length > 0) {
        title = getTextContent(titleProp.title);
      }
    }

    return {
      id: pageId,
      title,
      markdown,
      lastUpdated: pageInfo.last_edited_time,
    };
  } catch (error) {
    throw new Error(`Error retrieving Notion page: ${error.message}`);
  }
};

module.exports = {
  getPageMarkdown,
  extractPageId,
};

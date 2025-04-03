const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');

/**
 * Performance test for Notion import endpoint
 *
 * This test measures the response time of the Notion import endpoint
 * and verifies it's within acceptable limits for a good user experience.
 */
describe('Notion API Performance Tests', function () {
  // Set timeout higher than normal for performance tests
  this.timeout(99000);

  // Sample Notion page URL for testing - should be a valid public page
  // Use an actual Notion page that's publicly accessible for best results
  const testNotionPageUrl =
    process.env.TEST_NOTION_URL ||
    'https://www.notion.so/Notion-Official-Public-Test-Page-4d63b8f0dc7c4190a2047ae9051e2167';

  // Maximum acceptable response time in milliseconds
  const maxAcceptableResponseTime = 5000; // 5 seconds

  it('should respond to markdown import requests within acceptable time', async function () {
    // Start timing
    const startTime = Date.now();

    // Make request to the Notion import endpoint
    const response = await request(app).get('/api/notion/import').query({
      url: testNotionPageUrl,
      format: 'markdown',
      cache: false, // Disable cache to test actual import speed
      children: true,
    });

    // End timing
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Log the response time for reporting
    console.log(`Notion import response time: ${responseTime}ms`);

    // Assert response is successful
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('success', true);
    expect(response.body).to.have.property('data');
    expect(response.body.data).to.have.property('markdown');

    // Assert response time is within acceptable limits
    expect(responseTime).to.be.at.most(maxAcceptableResponseTime, `Notion import took too long (${responseTime}ms)`);

    // Additional assertions for response size
    const markdownLength = response.body.data.markdown.length;
    console.log(`Markdown content length: ${markdownLength} characters`);

    // Log performance metrics
    const charactersPerMs = markdownLength / responseTime;
    console.log(`Processing speed: ${charactersPerMs.toFixed(2)} characters/ms`);
  });

  it('should be faster when using cache', async function () {
    // First request to ensure the page is cached
    await request(app).get('/api/notion/import').query({
      url: testNotionPageUrl,
      format: 'markdown',
      cache: true,
      children: true,
    });

    // Now measure cached response time
    const startTime = Date.now();

    const response = await request(app).get('/api/notion/import').query({
      url: testNotionPageUrl,
      format: 'markdown',
      cache: true, // Enable cache this time
      children: true,
    });

    const cachedResponseTime = Date.now() - startTime;

    // Log the cached response time
    console.log(`Cached notion import response time: ${cachedResponseTime}ms`);

    // Cached responses should be significantly faster (at least 50% faster)
    expect(cachedResponseTime).to.be.at.most(
      maxAcceptableResponseTime / 2,
      `Cached response should be at least twice as fast as uncached`
    );

    // Validate that the response is still correct
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('success', true);
    expect(response.body.data).to.have.property('markdown');
  });
});

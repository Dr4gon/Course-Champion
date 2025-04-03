/**
 * Notion API Benchmark Script
 *
 * This script runs performance benchmarks on the Notion import endpoint
 * to gather detailed metrics on response times and throughput.
 *
 * Usage:
 *   node notion-performance-benchmark.js [iterations] [url]
 *
 *   iterations: Number of test iterations (default: 5)
 *   url: Notion page URL to test (default: uses TEST_NOTION_URL env var or fallback)
 *
 * Example:
 *   node notion-performance-benchmark.js 10 https://www.notion.so/my-page
 */

const request = require('supertest');
const app = require('../app');

// Configuration
const iterations = parseInt(process.argv[2]) || 5;
const testNotionPageUrl =
  process.argv[3] ||
  process.env.TEST_NOTION_URL ||
  'https://www.notion.so/Notion-Official-Public-Test-Page-4d63b8f0dc7c4190a2047ae9051e2167';

// Statistics tracking
const stats = {
  uncached: {
    times: [],
    avg: 0,
    min: Infinity,
    max: 0,
    median: 0,
    contentLength: 0,
  },
  cached: {
    times: [],
    avg: 0,
    min: Infinity,
    max: 0,
    median: 0,
  },
};

// Helper to calculate statistics
function calculateStats(timesArray) {
  const sorted = [...timesArray].sort((a, b) => a - b);

  const sum = timesArray.reduce((a, b) => a + b, 0);
  const avg = sum / timesArray.length;
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const median = sorted[Math.floor(sorted.length / 2)];

  return { avg, min, max, median };
}

// Main benchmark function
async function runBenchmark() {
  console.log('======================================');
  console.log('Notion Import API Performance Benchmark');
  console.log('======================================');
  console.log(`Test URL: ${testNotionPageUrl}`);
  console.log(`Iterations: ${iterations}`);
  console.log('--------------------------------------');

  // First, run uncached tests
  console.log('\n1. Testing uncached performance...');
  for (let i = 0; i < iterations; i++) {
    process.stdout.write(`   Run ${i + 1}/${iterations}: `);
    const startTime = Date.now();

    try {
      // Make request with cache disabled
      const response = await request(app).get('/api/notion/import').query({
        url: testNotionPageUrl,
        format: 'markdown',
        cache: false,
        children: true,
      });

      const elapsed = Date.now() - startTime;
      stats.uncached.times.push(elapsed);
      stats.uncached.contentLength = response.body.data.markdown.length;

      if (elapsed < stats.uncached.min) stats.uncached.min = elapsed;
      if (elapsed > stats.uncached.max) stats.uncached.max = elapsed;

      process.stdout.write(`${elapsed}ms ✓\n`);
    } catch (err) {
      process.stdout.write(`ERROR ✗\n`);
      console.error(`   Error: ${err.message}`);
    }
  }

  // Calculate uncached stats
  const uncachedStats = calculateStats(stats.uncached.times);
  stats.uncached = { ...stats.uncached, ...uncachedStats };

  // Next, run cached tests
  console.log('\n2. Testing cached performance...');

  // First request to ensure caching
  await request(app).get('/api/notion/import').query({
    url: testNotionPageUrl,
    format: 'markdown',
    cache: true,
    children: true,
  });

  for (let i = 0; i < iterations; i++) {
    process.stdout.write(`   Run ${i + 1}/${iterations}: `);
    const startTime = Date.now();

    try {
      // Make request with cache enabled
      const response = await request(app).get('/api/notion/import').query({
        url: testNotionPageUrl,
        format: 'markdown',
        cache: true,
        children: true,
      });

      const elapsed = Date.now() - startTime;
      stats.cached.times.push(elapsed);

      if (elapsed < stats.cached.min) stats.cached.min = elapsed;
      if (elapsed > stats.cached.max) stats.cached.max = elapsed;

      process.stdout.write(`${elapsed}ms ✓\n`);
    } catch (err) {
      process.stdout.write(`ERROR ✗\n`);
      console.error(`   Error: ${err.message}`);
    }
  }

  // Calculate cached stats
  const cachedStats = calculateStats(stats.cached.times);
  stats.cached = { ...stats.cached, ...cachedStats };

  // Output final results
  console.log('\n======================================');
  console.log('Results Summary');
  console.log('======================================');

  console.log('\nUncached Performance:');
  console.log(`  Average: ${stats.uncached.avg.toFixed(2)}ms`);
  console.log(`  Min: ${stats.uncached.min}ms`);
  console.log(`  Max: ${stats.uncached.max}ms`);
  console.log(`  Median: ${stats.uncached.median}ms`);
  console.log(`  Content Length: ${stats.uncached.contentLength} characters`);
  console.log(`  Processing Speed: ${(stats.uncached.contentLength / stats.uncached.avg).toFixed(2)} chars/ms`);

  console.log('\nCached Performance:');
  console.log(`  Average: ${stats.cached.avg.toFixed(2)}ms`);
  console.log(`  Min: ${stats.cached.min}ms`);
  console.log(`  Max: ${stats.cached.max}ms`);
  console.log(`  Median: ${stats.cached.median}ms`);

  // Calculate improvement factor
  const improvement = (stats.uncached.avg / stats.cached.avg).toFixed(2);
  console.log(`\nCache Speedup Factor: ${improvement}x`);
  console.log(`Cache Reduces Response Time by: ${(100 - (stats.cached.avg / stats.uncached.avg) * 100).toFixed(2)}%`);

  console.log('\n======================================');
}

// Run the benchmark
runBenchmark().catch(err => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});

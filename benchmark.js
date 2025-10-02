/*!
 * content-disposition benchmark
 * Performance testing for optimizations
 */

'use strict'

const contentDisposition = require('./index')
const { performance } = require('perf_hooks')

// Benchmark configuration
const ITERATIONS = 100000

// Test cases
const testCases = [
  { name: 'simple attachment', fn: () => contentDisposition() },
  { name: 'simple inline', fn: () => contentDisposition(undefined, { type: 'inline' }) },
  { name: 'ASCII filename', fn: () => contentDisposition('plans.pdf') },
  { name: 'ISO-8859-1 filename', fn: () => contentDisposition('«plans».pdf') },
  { name: 'Unicode filename', fn: () => contentDisposition('планы.pdf') },
  { name: 'Unicode with euro', fn: () => contentDisposition('€ rates.pdf') },
  { name: 'Special characters', fn: () => contentDisposition("€'*%().pdf") },
  { name: 'Hex escape', fn: () => contentDisposition('the%20plans.pdf') },
  { name: 'Long ASCII filename', fn: () => contentDisposition('this-is-a-very-long-filename-with-many-characters-0123456789.pdf') },
  { name: 'Long Unicode filename', fn: () => contentDisposition('это-очень-длинное-имя-файла-с-юникод-символами.pdf') }
]

// Warmup phase
console.log('Warming up...')
for (let i = 0; i < 10000; i++) {
  testCases.forEach(tc => tc.fn())
}

console.log('\nRunning benchmarks...\n')

// Run benchmarks
const results = []

testCases.forEach(testCase => {
  const start = performance.now()

  for (let i = 0; i < ITERATIONS; i++) {
    testCase.fn()
  }

  const end = performance.now()
  const duration = end - start
  const opsPerSec = Math.round(ITERATIONS / (duration / 1000))

  results.push({
    name: testCase.name,
    duration,
    opsPerSec
  })

  console.log(`${testCase.name.padEnd(30)} ${opsPerSec.toLocaleString().padStart(12)} ops/sec  (${duration.toFixed(2)}ms)`)
})

console.log('\nBenchmark complete!')
console.log(`Total operations: ${(ITERATIONS * testCases.length).toLocaleString()}`)

// Calculate average performance
const avgOpsPerSec = Math.round(results.reduce((sum, r) => sum + r.opsPerSec, 0) / results.length)
console.log(`Average performance: ${avgOpsPerSec.toLocaleString()} ops/sec`)

// Test cache effectiveness
console.log('\n--- Cache Effectiveness Test ---')
const cachedStart = performance.now()
for (let i = 0; i < ITERATIONS; i++) {
  contentDisposition('планы.pdf') // Repeated call - should hit cache
}
const cachedEnd = performance.now()
const cachedDuration = cachedEnd - cachedStart

console.log(`Cached operations: ${Math.round(ITERATIONS / (cachedDuration / 1000)).toLocaleString()} ops/sec (${cachedDuration.toFixed(2)}ms)`)

#!/usr/bin/env node
/**
 * Génère un résumé lisible des résultats de tests avec les ÉCHECS EN PREMIER.
 * Lit test-results/frontend.json, backend.xml, editor.json, e2e.json (si présents)
 * et écrit :
 *   - test-results/FAILURES.md  (détail des échecs, lisible)
 *   - test-results/SUMMARY.txt  (une ligne par suite: passed/failed/total)
 *   - test-results/summary.json (machine-readable: failed list + counts)
 */

const fs = require('fs');
const path = require('path');

const TEST_RESULTS_DIR = path.join(__dirname, '..', 'test-results');

function readJsonSafe(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

function parseJestResults(data) {
  if (!data || typeof data !== 'object') return { failed: [], passed: 0, failedCount: 0, total: 0 };
  const failed = [];
  const suites = data.testResults || [];
  for (const suite of suites) {
    const name = suite.name || suite.assertionResults?.length ? 'suite' : '';
    for (const t of suite.assertionResults || []) {
      if (t.status === 'failed') {
        failed.push({
          file: suite.name ? path.relative(path.join(__dirname, '..'), suite.name) : '',
          name: t.fullName || t.title,
          message: (t.failureMessages || []).join('\n').slice(0, 500),
        });
      }
    }
  }
  return {
    failed,
    passed: data.numPassedTests || 0,
    failedCount: data.numFailedTests || 0,
    total: data.numTotalTests || 0,
  };
}

function parseJunitXml(xml) {
  if (!xml || typeof xml !== 'string') return { failed: [], passed: 0, failedCount: 0, errors: 0, total: 0 };
  const failed = [];
  const totalMatch = xml.match(/tests="(\d+)"\s+time=/);
  const total = totalMatch ? parseInt(totalMatch[1], 10) : 0;
  const failuresMatch = xml.match(/failures="(\d+)"/);
  const errorsMatch = xml.match(/errors="(\d+)"/);
  const failedCount = (failuresMatch ? parseInt(failuresMatch[1], 10) : 0) + (errorsMatch ? parseInt(errorsMatch[1], 10) : 0);
  const passed = Math.max(0, total - failedCount);
  // <testcase ... name="..." classname="..."> optional <failure> or <error>
  const testcaseRe = /<testcase\s[^>]*classname="([^"]*)"[^>]*name="([^"]*)"[^>]*>(\s*<(?:failure|error)[^>]*>([\s\S]*?)<\/\s*(?:failure|error)\s*>)?/gi;
  let m;
  while ((m = testcaseRe.exec(xml)) !== null) {
    const classname = m[1];
    const name = m[2];
    const failureText = (m[4] || '').trim().replace(/\s+/g, ' ').slice(0, 400);
    if (failureText) {
      failed.push({
        file: classname,
        name,
        message: failureText,
      });
    }
  }
  return { failed, passed, failedCount, errors: errorsMatch ? parseInt(errorsMatch[1], 10) : 0, total };
}

function parsePlaywrightResults(data) {
  if (!data || !Array.isArray(data)) return { failed: [], passed: 0, failedCount: 0, total: 0 };
  const failed = [];
  for (const spec of data) {
    const specs = spec.specs || [];
    for (const s of specs) {
      const tests = s.tests || [];
      for (const t of tests) {
        const results = t.results || [];
        const failedResult = results.find(r => r.status === 'failed' || r.status === 'timedOut');
        if (failedResult) {
          failed.push({
            file: spec.file || '',
            name: s.title || t.title || 'test',
            message: (failedResult.error || '').toString().slice(0, 400),
          });
        }
      }
    }
  }
  const total = data.reduce((acc, s) => acc + (s.stats?.expected || 0) + (s.stats?.unexpected || 0) + (s.stats?.flaky || 0) || 0, 0);
  const failedCount = failed.length;
  const passed = Math.max(0, total - failedCount);
  return { failed, passed, failedCount, total };
}

function main() {
  if (!fs.existsSync(TEST_RESULTS_DIR)) {
    fs.mkdirSync(TEST_RESULTS_DIR, { recursive: true });
  }

  const frontend = readJsonSafe(path.join(TEST_RESULTS_DIR, 'frontend.json'));
  const editor = readJsonSafe(path.join(TEST_RESULTS_DIR, 'editor.json'));
  const backendXml = readFileSafe(path.join(TEST_RESULTS_DIR, 'backend.xml'));
  const e2ePath = path.join(TEST_RESULTS_DIR, 'e2e.json');
  let e2e = null;
  if (fs.existsSync(e2ePath)) {
    try {
      const content = fs.readFileSync(e2ePath, 'utf8');
      const parsed = JSON.parse(content);
      e2e = Array.isArray(parsed) ? parsed : (parsed.config ? [parsed] : null);
    } catch {}
  }

  const jFrontend = parseJestResults(frontend);
  const jEditor = parseJestResults(editor);
  const jBackend = parseJunitXml(backendXml);
  const jE2e = parsePlaywrightResults(e2e);

  const lines = [];
  const summaryLines = [];
  const summaryJson = { suites: {}, failed: [], totalFailed: 0, totalPassed: 0, total: 0 };

  lines.push('# Résumé des tests – ÉCHECS EN PREMIER');
  lines.push('');
  lines.push('Généré par `scripts/generate-test-summary.js` après `make tests`.');
  lines.push('');

  const suites = [
    { key: 'frontend', label: 'Frontend (Jest)', ...jFrontend },
    { key: 'editor', label: 'Éditeur (Jest)', ...jEditor },
    { key: 'backend', label: 'Backend (pytest)', ...jBackend },
    { key: 'e2e', label: 'E2E (Playwright)', ...jE2e },
  ];

  for (const s of suites) {
    summaryJson.suites[s.key] = { passed: s.passed, failed: s.failedCount, total: s.total };
    summaryJson.totalFailed += s.failedCount || 0;
    summaryJson.totalPassed += s.passed || 0;
    summaryJson.total += s.total || 0;
    s.failed.forEach(f => summaryJson.failed.push({ suite: s.key, ...f }));
    const status = (s.failedCount || 0) > 0 ? 'FAIL' : 'OK';
    summaryLines.push(`${s.key}: ${s.passed}/${s.total} passed, ${s.failedCount || 0} failed [${status}]`);
  }

  // Section: échecs d’abord
  lines.push('---');
  lines.push('## Échecs par suite');
  lines.push('');

  for (const s of suites) {
    if (s.failed && s.failed.length > 0) {
      lines.push(`### ${s.label} – ${s.failed.length} échec(s)`);
      lines.push('');
      s.failed.forEach((f, i) => {
        lines.push(`- **${i + 1}. ${f.name}**`);
        if (f.file) lines.push(`  - Fichier: \`${f.file}\``);
        if (f.message) lines.push(`  - Message: \`${f.message.replace(/\n/g, ' ')}\``);
        lines.push('');
      });
    }
  }

  lines.push('---');
  lines.push('## Résumé par suite');
  lines.push('');
  summaryLines.forEach(l => lines.push(`- ${l}`));
  lines.push('');
  lines.push(`**Total: ${summaryJson.totalPassed} passés, ${summaryJson.totalFailed} échoués.**`);
  lines.push('');

  const failuresMdPath = path.join(TEST_RESULTS_DIR, 'FAILURES.md');
  const summaryTxtPath = path.join(TEST_RESULTS_DIR, 'SUMMARY.txt');
  const summaryJsonPath = path.join(TEST_RESULTS_DIR, 'summary.json');

  fs.writeFileSync(failuresMdPath, lines.join('\n'), 'utf8');
  fs.writeFileSync(summaryTxtPath, summaryLines.join('\n') + '\n', 'utf8');
  fs.writeFileSync(summaryJsonPath, JSON.stringify(summaryJson, null, 2), 'utf8');

  console.log('Résumé écrit: test-results/FAILURES.md, SUMMARY.txt, summary.json');
}

main();

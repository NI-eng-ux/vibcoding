#!/usr/bin/env node
/**
 * ============================================================
 * Vibcoding 数据自动更新脚本
 * 用法: node update-data.js [--dry-run]
 *
 * 功能:
 *   1. 从 GitHub API 获取最新 Star 数
 *   2. 更新 data.json（唯一数据源，浏览器通过 fetch 加载）
 *
 * 环境变量:
 *   GITHUB_TOKEN — GitHub Personal Access Token（可选，提高 API 限额）
 * ============================================================
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = __dirname;
const DATA_JSON = path.join(ROOT, 'data.json');
const DRY_RUN = process.argv.includes('--dry-run');

// ============================================================
// 工具函数
// ============================================================

function fetchGitHubAPI(repoPath) {
  return new Promise((resolve, reject) => {
    const token = process.env.GITHUB_TOKEN || '';
    const headers = {
      'User-Agent': 'vibcoding-updater/1.0',
      'Accept': 'application/vnd.github.v3+json',
    };
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }

    const url = `https://api.github.com/repos/${repoPath}`;
    https.get(url, { headers }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(new Error(`JSON 解析失败: ${e.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body.slice(0, 200)}`));
        }
      });
    }).on('error', reject);
  });
}

function formatStars(count) {
  if (count === undefined || count === null) return '?';
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k';
  }
  return String(count);
}

// ============================================================
// 主流程
// ============================================================

async function main() {
  console.log('📊 Vibcoding 数据更新工具');
  console.log('═══════════════════════════\n');

  // 1. 读取当前数据
  if (!fs.existsSync(DATA_JSON)) {
    console.error('❌ 找不到 data.json，请确保在项目根目录运行此脚本');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(DATA_JSON, 'utf-8'));
  const repos = data.githubProjects.map(p => p.fullName);
  console.log(`📋 共 ${repos.length} 个 GitHub 项目需要更新\n`);

  // 2. 逐个查询 GitHub API
  let updated = 0;
  let failed = 0;

  for (const repo of repos) {
    process.stdout.write(`🔍 ${repo} ... `);
    try {
      const apiData = await fetchGitHubAPI(repo);
      const stars = apiData.stargazers_count;
      if (stars !== undefined && stars !== null && stars > 0) {
        const formatted = formatStars(stars);
        console.log(`⭐ ${formatted} (${stars.toLocaleString()} stars)`);

        // 更新 data.json
        const project = data.githubProjects.find(p => p.fullName === repo);
        if (project) {
          project.stars = formatted;
          updated++;
        }
      } else {
        console.log('⚠️ 无数据，跳过');
        failed++;
      }
    } catch (err) {
      console.log(`❌ ${err.message}`);
      failed++;
    }

    // GitHub API 限流：无 Token 60次/小时，有 Token 5000次/小时
    await new Promise(r => setTimeout(r, 1200));
  }

  // 3. 更新元数据
  const today = new Date().toISOString().slice(0, 10);
  data._meta.updated = today;
  console.log(`\n📅 更新日期: ${today}`);

  // 4. 保存 data.json（浏览器通过 fetch 直接加载）
  if (!DRY_RUN) {
    fs.writeFileSync(DATA_JSON, JSON.stringify(data, null, 2) + '\n', 'utf-8');
    console.log('✅ data.json 已更新');
  } else {
    console.log('🏁 --dry-run 模式，未写入文件');
  }

  // 5. 统计
  console.log('\n═══════════════════════════');
  console.log(`✅ 成功: ${updated}  |  ❌ 失败: ${failed}  |  📦 总计: ${repos.length}`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('💥 脚本异常:', err);
  process.exit(1);
});

/**
 * 依赖版本自动更新脚本
 *
 * 【功能说明】
 * 自动检查 src/project-settings/constant.ts 中定义的所有 npm 依赖包，
 * 并将它们的版本号更新到 npm 上的最新版本。
 *
 * 【执行时机】
 * - 手动执行：pnpm update-versions
 * - 建议在发布新版本前、定期维护时、或发现依赖有安全漏洞时执行
 * - 不会自动执行（没有配置 git hooks 或 CI/CD）
 *
 * 【使用场景】
 * 保持 CLI 工具模板中的依赖包版本始终最新，确保用户创建新项目时使用最新依赖
 */

import { readFile, writeFile } from 'node:fs/promises';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const execAsync = promisify(exec);

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONSTANT_FILE_PATH = join(__dirname, '../src/project-settings/constant.ts');

/**
 * 获取 npm 包的最新版本
 * @param {string} packageName - 包名
 * @returns {Promise<string>} 最新版本号
 */
async function getLatestVersion(packageName) {
   try {
      const { stdout } = await execAsync(`pnpm view ${packageName} version`, {
         encoding: 'utf8',
      });
      return stdout.trim();
   } catch (error) {
      console.error(`❌ 获取 ${packageName} 版本失败:`, error.message);
      return null;
   }
}

/**
 * 更新版本号，保留前缀
 * @param {string} currentVersion - 当前版本 (如 ^1.2.3)
 * @param {string} latestVersion - 最新版本 (如 1.4.0)
 * @returns {string} 更新后的版本 (如 ^1.4.0)
 */
function updateVersion(currentVersion, latestVersion) {
   // 提取前缀 (^, ~, >=, >, <, <=, 或无前缀)
   const prefixMatch = currentVersion.match(/^([^0-9]+)/);
   const prefix = prefixMatch ? prefixMatch[1] : '';
   return `${prefix}${latestVersion}`;
}

/**
 * 收集 constant.ts 中所有导出的依赖
 * @param {string} content - 文件内容
 * @returns {Array<{name: string, version: string, exportName: string}>} 所有依赖包
 */
function collectAllPackages(content) {
   const packages = [];

   // 匹配 export const XXX = { ... } 或 export const XXX: Record<string, string> = { ... }
   const exportRegex = /export\s+const\s+(\w+)\s*(?::\s*[^{=]+)?\s*=\s*{([^}]+)}/g;

   let match;
   while ((match = exportRegex.exec(content)) !== null) {
      const exportName = match[1];
      const objectContent = match[2];

      // 匹配对象中的键值对 'package': 'version'
      const depRegex = /'([^']+)':\s*'([^']+)'/g;
      let depMatch;

      while ((depMatch = depRegex.exec(objectContent)) !== null) {
         packages.push({
            name: depMatch[1],
            version: depMatch[2],
            exportName,
         });
      }
   }

   return packages;
}

/**
 * 更新 constant.ts 中的依赖版本
 * @param {string} content - 文件内容
 * @param {Array<{name: string, oldVersion: string, newVersion: string}>} updates - 更新列表
 * @returns {string} 更新后的文件内容
 */
function updateContent(content, updates) {
   let updatedContent = content;

   for (const { name, oldVersion, newVersion } of updates) {
      // 转义特殊字符
      const escapedVersion = oldVersion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`'${name}':\\s*'${escapedVersion}'`, 'g');

      if (regex.test(updatedContent)) {
         updatedContent = updatedContent.replace(regex, `'${name}': '${newVersion}'`);
         console.log(`✅ ${name}: ${oldVersion} → ${newVersion}`);
      }
   }

   return updatedContent;
}

/**
 * 主函数
 */
async function main() {
   console.log('🔍 开始检查依赖版本...\n');

   // 读取 constant.ts 文件
   const content = await readFile(CONSTANT_FILE_PATH, 'utf8');

   // 收集所有依赖包
   const packages = collectAllPackages(content);

   if (packages.length === 0) {
      console.log('❌ 未找到任何依赖包');
      return;
   }

   console.log(`📦 找到 ${packages.length} 个依赖包\n`);

   const updates = [];
   let successCount = 0;
   let failCount = 0;

   // 获取每个包的最新版本
   for (const pkg of packages) {
      const latestVersion = await getLatestVersion(pkg.name);

      if (latestVersion) {
         const newVersion = updateVersion(pkg.version, latestVersion);

         // 只在版本不同时更新
         if (newVersion !== pkg.version) {
            updates.push({
               name: pkg.name,
               oldVersion: pkg.version,
               newVersion,
            });
            successCount++;
         } else {
            console.log(`⏭️  ${pkg.name}: 已是最新版本 (${latestVersion})`);
         }
      } else {
         failCount++;
      }
   }

   console.log(
      `\n📊 统计: 成功 ${successCount} 个, 跳过 ${packages.length - successCount - failCount} 个, 失败 ${failCount} 个\n`,
   );

   // 如果有更新，写入文件
   if (updates.length > 0) {
      const updatedContent = updateContent(content, updates);
      await writeFile(CONSTANT_FILE_PATH, updatedContent, 'utf8');
      console.log(`\n✨ 成功更新 ${updates.length} 个依赖包到最新版本!`);
   } else {
      console.log('\n✨ 所有依赖都已是最新版本!');
   }
}

main().catch(error => {
   console.error('❌ 脚本执行失败:', error);
   process.exit(1);
});

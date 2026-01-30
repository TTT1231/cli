import { intro, outro, text, select, confirm, spinner, isCancel } from '@clack/prompts';
import chalk from 'chalk';
import cliProgress from 'cli-progress';
import { PackageManager } from '../types';
import { customMultiselect } from './customMultiselect';
import { customSelect } from './customSelect';

export function showIntro(message: string): void {
   intro(chalk.bgBlue(chalk.white(' CLI Scaffolding Tool ')));
   console.log(chalk.gray(message));
}

export function showOutro(message: string): void {
   outro(chalk.green(message));
}

export async function promptProjectName(defaultName?: string): Promise<string> {
   const defaultProjectName = defaultName || 'my-project';
   const name = await text({
      message: '项目名称:',
      placeholder: defaultProjectName,
      validate: value => {
         // 如果用户没有输入，使用默认值，不需要验证
         if (!value) return undefined;
         if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
            return '项目名称只能包含字母、数字、连字符和下划线';
         }
         return undefined;
      },
   });

   // 检查用户是否取消了操作
   if (isCancel(name)) {
      showError('操作已取消');
      process.exit(0);
   }

   // 如果用户没有输入任何内容，返回默认项目名
   return (name as string) || defaultProjectName;
}

export async function promptTemplate(templates: Record<string, any>): Promise<string> {
   const templateOptions = Object.entries(templates).map(([key, template]) => ({
      value: key,
      label: template.name,
   }));

   const template = await customSelect({
      message: '选择项目模板:',
      options: templateOptions,
   });

   return template;
}

export async function promptOverwrite(targetDir: string): Promise<boolean> {
   const overwrite = await confirm({
      message: `目录 ${chalk.yellow(targetDir)} 已存在，是否覆盖？`,
      initialValue: false,
   });

   // 检查用户是否取消了操作
   if (isCancel(overwrite)) {
      showError('操作已取消');
      process.exit(0);
   }

   return overwrite as boolean;
}

/**
 * 询问用户是否初始化 Git 仓库（Yes/No 选择框，默认选中 Yes）
 * @returns 用户选择结果（true = Yes，false = No）
 */
export async function promptInitGit(): Promise<boolean> {
   const initGit = await confirm({
      message: '是否初始化Git',
      initialValue: true, // 核心配置：默认选中 Yes
      // 注：@clack/prompts 的 confirm 组件会自动渲染为 Yes/No 选择框
      // 按 Enter 直接确认默认的 Yes，按方向键可切换到 No
   });

   // 处理用户取消操作（和其他 prompt 保持一致逻辑）
   if (isCancel(initGit)) {
      showError('操作已取消');
      process.exit(0);
   }

   return initGit as boolean;
}
export async function promptPackageManager(): Promise<PackageManager> {
   const packageManager = await customSelect<PackageManager>({
      message: '选择包管理器:',
      options: [
         { value: 'pnpm', label: 'pnpm' },
         { value: 'npm', label: 'npm' },
         { value: 'yarn', label: 'yarn' },
      ],
   });

   return packageManager;
}

export async function promptInstallDeps(): Promise<boolean> {
   const install = await confirm({
      message: '是否安装依赖?',
      initialValue: true,
   });

   // 检查用户是否取消了操作
   if (isCancel(install)) {
      showError('操作已取消');
      process.exit(0);
   }

   return install as boolean;
}

export async function promptToolOptions(
   options: Array<{ value: string; label: string }>,
): Promise<string[]> {
   const tools = await customMultiselect({
      message: '选择要配置的工具:',
      options: options,
      required: false,
      initialValues: [], // 默认全部未选择
   });

   // 归一化：确保返回值是 options 中的 value（避免意外返回 label 导致逻辑未命中）
   const valueByLabel = new Map(options.map(o => [o.label, o.value]));
   const valueSet = new Set(options.map(o => o.value));
   const normalized = tools
      .map(t => (valueSet.has(t) ? t : valueByLabel.get(t) || null))
      .filter((v): v is string => v !== null);

   return normalized;
}

export function createSpinner(message?: string) {
   return spinner();
}

export function createProgressBar(title: string = '下载进度'): cliProgress.SingleBar {
   return new cliProgress.SingleBar(
      {
         format: `${chalk.cyan(title)} |${chalk.green('{bar}')}| ${chalk.yellow('{percentage}%')} | ${chalk.gray('{value}/{total}')} | ${chalk.blue('{status}')}`,
         barCompleteChar: '\u2588',
         barIncompleteChar: '\u2591',
         hideCursor: true,
         clearOnComplete: false,
         stopOnComplete: true,
         forceRedraw: true,
      },
      cliProgress.Presets.shades_classic,
   );
}

export function showError(message: string): void {
   console.error(chalk.red(`✖ ${message}`));
}

export function showSuccess(message: string): void {
   console.log(chalk.green(`✓ ${message}`));
}

export function showWarning(message: string): void {
   console.log(chalk.yellow(`⚠ ${message}`));
}

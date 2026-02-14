#!/usr/bin/env node

import { cac } from 'cac';
import chalk from 'chalk';
import updateNotifier from 'update-notifier';
import { newProject, addProjectSettings, updateCommand } from './commands';

import pkg from '../package.json';
import { listTemplates } from './commands/ls';

// 检查更新
const notifier = updateNotifier({ pkg, shouldNotifyInNpmScript: true });
if (process.env.CI !== 'true') {
   notifier.notify({ isGlobal: true });
}

const cli = cac('trw');

// 全局选项
cli.help().version(pkg.version, '-v, -V, --version');

// create 命令
cli.command('new [project-name]', '创建新项目').action(async projectName => {
   await newProject(projectName);
});

// ls 命名,用于列出可用模板
cli.command('ls', '模板列表').action(async () => {
   await listTemplates();
});
// add 命令，用于配置项目
cli.command('add [config-type]', '添加项目配置').action(async configType => {
   await addProjectSettings(configType);
});

// update 命令，用于更新CLI工具
cli.command('update', '更新CLI工具').action(async () => {
   await updateCommand();
});

// 错误处理
process.on('unhandledRejection', err => {
   console.error(chalk.red('Unhandled rejection:'), err);
   process.exit(1);
});

process.on('uncaughtException', err => {
   console.error(chalk.red('Uncaught exception:'), err);
   process.exit(1);
});

// 解析命令行参数
cli.parse();

// 如果没有提供任何参数，显示帮助信息
if (process.argv.length === 2) {
   cli.outputHelp();
}

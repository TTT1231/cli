import { Prompt, isCancel } from '@clack/core';
import chalk from 'chalk';

interface Option {
   value: string;
   label: string;
   hint?: string;
}

interface CustomSelectOptions {
   message: string;
   options: Option[];
   initialValue?: string;
}

class CustomSelectPrompt extends Prompt {
   private options: Option[];
   private message: string;
   private cursor: number = 0;

   constructor({ message, options, initialValue }: CustomSelectOptions) {
      super({
         render: () => this.renderPrompt(),
      });

      this.message = message;
      this.options = options;

      // 设置初始值
      const initialIndex = options.findIndex(o => o.value === initialValue);
      this.cursor = initialIndex >= 0 ? initialIndex : 0;

      // 初始化 value 属性
      this.value = options[this.cursor]?.value;

      // 方向键/回车/取消 使用 core 的 cursor 事件
      this.on('cursor', (action?: any) => {
         this.handleCursorAction(action);
      });

      // 回车提交
      this.on('submit', () => {
         this.value = this.options[this.cursor]?.value;
      });
   }

   private renderPrompt(): string {
      const title = chalk.cyan(`${this.message}\n`);

      const optionsList = this.options
         .map((option, index) => {
            const isCurrent = index === this.cursor;

            // 使用 ○/● 作为指示器，保持宽度一致
            const indicator = isCurrent ? chalk.green('●') : chalk.gray('○');

            // 选项文本 - 当前选中项用青色高亮
            const label = isCurrent ? chalk.cyan(option.label) : chalk.white(option.label);

            // 提示文本
            const hint = option.hint ? chalk.gray(`  ${option.hint}`) : '';

            return `${indicator} ${label}${hint}`;
         })
         .join('\n');

      return `${title}${optionsList}`;
   }

   private handleCursorAction(action?: string): void {
      switch (action) {
         case 'up':
            this.cursor = this.cursor > 0 ? this.cursor - 1 : this.options.length - 1;
            this.emit('active');
            break;
         case 'down':
            this.cursor = this.cursor < this.options.length - 1 ? this.cursor + 1 : 0;
            this.emit('active');
            break;
         case 'cancel':
            this.emit('cancel');
            break;
      }
   }
}

export async function customSelect<T extends string = string>(
   options: CustomSelectOptions,
): Promise<T> {
   const prompt = new CustomSelectPrompt(options);
   const result = await prompt.prompt();

   if (isCancel(result)) {
      // 导入 showError 函数来显示取消消息
      const { showError } = await import('./prompt');
      showError('操作已取消');
      process.exit(0);
   }

   return result as T;
}

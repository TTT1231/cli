import { Prompt, isCancel } from '@clack/core';
import chalk from 'chalk';

interface Option {
   value: string;
   label: string;
   hint?: string;
}

interface CustomMultiselectOptions {
   message: string;
   options: Option[];
   required?: boolean;
   initialValues?: string[];
}

class CustomMultiselectPrompt extends Prompt {
   private selectedValues: Set<string>;
   private options: Option[];
   private message: string;
   private cursor: number = 0;

   constructor({ message, options, initialValues = [] }: CustomMultiselectOptions) {
      super({
         render: () => this.renderPrompt(),
      });

      this.message = message;
      this.options = options;
      this.selectedValues = new Set(initialValues);
      this.cursor = 0;

      // 初始化 value 属性
      this.value = Array.from(this.selectedValues);

      // 方向键/空格/回车/取消 使用 core 的 cursor 事件
      this.on('cursor', (action?: any) => {
         this.handleCursorAction(action);
      });
      // 回车提交：确保在提交时将选中值赋给 this.value
      this.on('submit', () => {
         const selectedArray = Array.from(this.selectedValues);
         this.value = selectedArray;
      });
      // 额外绑定字母键（例如 a）用于全选/取消全选
      this.on('key', (raw?: string) => {
         if (!raw) return;
         if (raw.toLowerCase() === 'a') {
            // 全选/取消全选
            if (this.selectedValues.size === this.options.length) {
               this.selectedValues.clear();
            } else {
               this.options.forEach(option => this.selectedValues.add(option.value));
            }
            // 更新 value 属性
            this.value = Array.from(this.selectedValues);
            // 激活一次以刷新输出
            this.emit('active');
         }
      });
   }

   private renderPrompt(): string {
      const title = chalk.cyan(`${this.message}\n`);

      const instructions = chalk.gray(
         '  ↑↓ 移动光标  │  空格 选择/取消  │  A 全选  │  回车 确认\n',
      );

      const optionsList = this.options
         .map((option, index) => {
            const isSelected = this.selectedValues.has(option.value);
            const isCurrent = index === this.cursor;
            const isLast = index === this.options.length - 1;

            // 选择状态指示器 - 统一使用 ○/◉，保持宽度一致
            // 选中的用实心圆 ◉，未选用的用空心圆 ○
            const checkbox = isSelected ? chalk.green('◉') : chalk.gray('○');

            // 当前行额外加上箭头指示器 - 每行都预留位置，防止文字偏移
            // 最后一行使用结束符号 └
            let cursor: string;
            if (isCurrent) {
               cursor = chalk.cyan('>');
            } else if (isLast) {
               cursor = chalk.gray('└');
            } else {
               cursor = chalk.gray('│');
            }

            // 选项文本
            const label = isCurrent ? chalk.cyan(option.label) : option.label;

            // 提示文本
            const hint = option.hint ? chalk.gray(` (${option.hint})`) : '';

            return `${cursor} ${checkbox} ${label}${hint}`;
         })
         .join('\n');

      // 移除底部"已选择 X 项"提示文本
      return `${title}${instructions}\n${optionsList}`;
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
         case 'space': {
            const currentValue = this.options[this.cursor].value;
            if (this.selectedValues.has(currentValue)) {
               this.selectedValues.delete(currentValue);
            } else {
               this.selectedValues.add(currentValue);
            }
            // 更新 value 属性
            this.value = Array.from(this.selectedValues);
            this.emit('active');
            break;
         }
         case 'cancel':
            this.emit('cancel');
            break;
      }
   }
}

export async function customMultiselect(options: CustomMultiselectOptions): Promise<string[]> {
   const prompt = new CustomMultiselectPrompt(options);
   const result = await prompt.prompt();

   if (isCancel(result)) {
      // 导入 showError 函数来显示取消消息
      const { showError } = await import('./prompt');
      showError('操作已取消');
      process.exit(0);
   }

   // 确保返回的是字符串数组
   return Array.isArray(result) ? result : [];
}

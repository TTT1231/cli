import path from 'node:path';
import { execa } from 'execa';
import { showSuccess, showError, createSpinner } from '../utils/prompt';
import pkg from '../../package.json';

const projectRoot = path.resolve(__dirname, '..');

/**
 * update CLI tool，check remote version, pull latest code and rebuild if update available
 */
export async function updateCommand(): Promise<void> {
   try {
      const currentVersion = pkg.version;
      console.log(`\nChecking for updates... (current: v${currentVersion})\n`);

      // fetch remote info
      const fetchSpinner = createSpinner();
      fetchSpinner.start('Checking remote version...');
      await execa('git', ['fetch', 'origin', 'main'], { cwd: projectRoot });
      fetchSpinner.stop();

      // get remote package.json version
      const { stdout: remotePkg } = await execa('git', ['show', 'origin/main:package.json'], {
         cwd: projectRoot,
      });
      const remoteVersion = JSON.parse(remotePkg).version;

      // compare versions
      if (remoteVersion === currentVersion) {
         showSuccess(`Already up to date (v${currentVersion})\n`);
         return;
      }

      // pull latest code
      const pullSpinner = createSpinner();
      pullSpinner.start('Pulling latest code...');
      await execa('git', ['pull'], { cwd: projectRoot });
      pullSpinner.stop();

      // rebuild (pnpm link directory will auto sync)
      const buildSpinner = createSpinner();
      buildSpinner.start('Building update...');
      await execa('pnpm', ['build'], { cwd: projectRoot });
      buildSpinner.stop();

      showSuccess(`\nUpdate complete! (v${remoteVersion})\n`);
   } catch (error) {
      const message =
         error instanceof Error
            ? getErrorMessage(error)
            : 'Update failed, please check network or Git config';
      showError(message);
      process.exit(1);
   }
}

//error message
function getErrorMessage(error: Error): string {
   const message = error.message;

   if (message.includes('not a git repository')) {
      return 'Not a Git repository, please clone project first';
   }

   if (message.includes('could not read') || message.includes('not found')) {
      return 'Git not installed or configured correctly';
   }

   if (message.includes('network') || message.includes('timeout')) {
      return 'Network connection failed, please check your network';
   }

   return `Update failed: ${message}`;
}

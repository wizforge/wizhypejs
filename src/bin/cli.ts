#!/usr/bin/env node
// Load environment variables from .env file
import 'dotenv/config'

import { Command } from 'commander'
import { spawn } from 'child_process'

const pkg = { name: 'wizhypejs', version: '0.1.0' }
const program = new Command()

program
  .name('hype')
  .description('Hype — backend page-routing framework CLI')
  .version(pkg.version)

function runNpmScript(script: string, cwd = process.cwd()) {
  const child = spawn('npm', ['run', script], { cwd, stdio: 'inherit', shell: true })
  child.on('exit', (code) => process.exit(code ?? 0))
}

program
  .command('build')
  .description('Build this project (runs ./tsconfig build)')
  .action(() => {
    // Prefer running the package build script so local configuration is respected
    runNpmScript('build')
  })

program
  .command('dev')
  .description('Run development server (runs npm run dev)')
  .action(() => {
    runNpmScript('dev')
  })

program
  .command('start')
  .description('Run the built project (runs npm run start)')
  .action(() => {
    runNpmScript('start')
  })

program
  .command('run <script>')
  .description('Run an npm script inside the current project')
  .action((script: string) => {
    runNpmScript(script)
  })

program.parse(process.argv)

// If no args, show help
if (!process.argv.slice(2).length) program.outputHelp()

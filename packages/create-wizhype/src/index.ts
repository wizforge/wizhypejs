#!/usr/bin/env node
import { Command } from 'commander'
import { createProject } from './createProject.js'

const program = new Command()

program
  .name('create-wizhype')
  .description('Scaffold a new wizhypejs project')
  .version('1.0.0')

program
  .argument('<project-name>', 'Name of the project to create')
  .option('-t, --template <template>', 'Template type (default: basic)', 'basic')
  .option('-l, --language <language>', 'Language: ts or js (default: ts)', 'ts')
  .action(async (projectName, options) => {
    await createProject(projectName, options.template, options.language)
  })

program.parse(process.argv)

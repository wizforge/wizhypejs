import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function createProject(projectName: string, template: string, language: string) {
  try {
    const cwd = process.cwd()
    const targetDir = path.resolve(cwd, projectName)
    
    // Templates are bundled in the package
    const templatesRoot = path.resolve(__dirname, '..', 'templates')
    const langDir = path.join(templatesRoot, language.toLowerCase())
    
    if (!fs.existsSync(langDir)) {
      throw new Error(`Language template not found: ${language}. Supported: ts, js`)
    }
    
    // Create project directory
    await fs.ensureDir(targetDir)
    
    // Copy template
    await fs.copy(langDir, targetDir, { overwrite: false })
    
    // Update package.json name
    const pkgPath = path.join(targetDir, 'package.json')
    if (await fs.pathExists(pkgPath)) {
      const pkg = await fs.readJson(pkgPath)
      pkg.name = projectName
      await fs.writeJson(pkgPath, pkg, { spaces: 2 })
    }
    
    console.log(chalk.green(`✓ Created project ${projectName} at ${targetDir}`))
    console.log('')
    console.log(chalk.cyan('Next steps:'))
    console.log(chalk.cyan(`  cd ${projectName}`))
    console.log(chalk.cyan('  npm install'))
    console.log(chalk.cyan('  npm run dev'))
    console.log('')
  } catch (err) {
    console.error(chalk.red('✗ Failed to create project:'), err)
    process.exit(1)
  }
}

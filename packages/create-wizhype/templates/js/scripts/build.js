import fs from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const root = process.cwd()
const src = path.join(root, 'src')
const dist = path.join(root, 'dist')

async function copyDir(srcDir, destDir) {
  await fs.mkdir(destDir, { recursive: true })
  const entries = await fs.readdir(srcDir, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name)
    const destPath = path.join(destDir, entry.name)
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath)
    } else if (entry.isSymbolicLink()) {
      try {
        const link = await fs.readlink(srcPath)
        await fs.symlink(link, destPath)
      } catch (e) {
        // ignore symlink errors
      }
    } else {
      await fs.copyFile(srcPath, destPath)
    }
  }
}

async function run() {
  if (!existsSync(src)) {
    console.error('No src/ directory found — nothing to build.')
    process.exit(1)
  }

  try {
    // remove dist if exists
    await fs.rm(dist, { recursive: true, force: true })
  } catch (e) {
    // ignore
  }

  try {
    // Prefer fs.cp if available (Node >= 18)
    if (typeof fs.cp === 'function') {
      await fs.mkdir(dist, { recursive: true })
      await fs.cp(src, dist, { recursive: true })
    } else {
      // fallback to manual copy
      await copyDir(src, dist)
    }
    console.log('Built project into dist/')
  } catch (err) {
    console.error('Build failed:', err)
    process.exit(1)
  }
}

run()

import { Pool } from "@neondatabase/serverless"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const envPath = path.join(__dirname, "..", ".env.local")
const envContent = fs.readFileSync(envPath, "utf-8")
const envVars = Object.fromEntries(
  envContent
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("#"))
    .map((l) => l.split("="))
    .map(([k, ...v]) => [k.trim(), v.join("=").trim()])
)

const DATABASE_URL = envVars.DATABASE_URL
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL no encontrada en .env.local")
  process.exit(1)
}

const pool = new Pool({ connectionString: DATABASE_URL })

async function runMigrations() {
  console.log("🚀 Corriendo migraciones...")

  const migrationsDir = path.join(__dirname, "..", "supabase", "migrations")
  const files = fs.readdirSync(migrationsDir).sort().filter(f => f.includes("neon"))

  for (const file of files) {
    if (!file.endsWith(".sql")) continue
    console.log(`📄 Ejecutando ${file}...`)
    const content = fs.readFileSync(path.join(migrationsDir, file), "utf-8")
    
    try {
      await pool.query(content)
      console.log(`✅ ${file} completado`)
    } catch (err) {
      const msg = err.message || String(err)
      console.error(`❌ Error: ${msg.slice(0, 300)}`)
    }
  }

  await pool.end()
  console.log("🎉 Migraciones completadas!")
}

runMigrations().catch(console.error)

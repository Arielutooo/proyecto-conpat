/**
 * Uso:  npx tsx scripts/crear-usuario.ts
 *
 * Requiere en el entorno:
 *   NEXT_PUBLIC_SUPABASE_URL   — URL del proyecto Supabase
 *   SUPABASE_SERVICE_ROLE_KEY  — Service Role Key (Settings → API)
 *
 * El script crea el usuario en auth.users y asigna su rol en public.user_roles.
 */

import { createClient } from '@supabase/supabase-js'
import * as readline from 'readline'

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('\n❌  Faltan variables de entorno:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY\n')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const ask = (q: string): Promise<string> => new Promise(res => rl.question(q, res))

async function main() {
  console.log('\n╔══════════════════════════════╗')
  console.log('║   CONPAT — Crear Usuario      ║')
  console.log('╚══════════════════════════════╝\n')

  const email     = (await ask('  Email:              ')).trim()
  const name      = (await ask('  Nombre completo:    ')).trim()
  const password  = (await ask('  Contraseña inicial: ')).trim()

  console.log('\n  Roles disponibles:')
  console.log('    1 → admin       (acceso completo al CRM)')
  console.log('    2 → cfo_externo (portal CFO, solo sus carteras)')
  console.log('    3 → master      (auditoría + acceso completo)\n')

  const roleNum = (await ask('  Selecciona rol [1/2/3]: ')).trim()
  rl.close()

  const roleMap: Record<string, string> = { '1': 'admin', '2': 'cfo_externo', '3': 'master' }
  const role = roleMap[roleNum]

  if (!role) {
    console.error('\n❌  Opción de rol inválida.\n')
    process.exit(1)
  }

  if (!email || !password || password.length < 10) {
    console.error('\n❌  Email inválido o contraseña demasiado corta (mínimo 10 caracteres).\n')
    process.exit(1)
  }

  console.log(`\n  Creando usuario '${email}' con rol '${role}'…`)

  // 1. Crear usuario en auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, must_change_password: true },
  })

  if (authError || !authData.user) {
    console.error('\n❌  Error al crear usuario:', authError?.message ?? 'desconocido')
    process.exit(1)
  }

  const userId = authData.user.id

  // 2. Asignar rol en public.user_roles
  const { error: roleError } = await supabase
    .from('user_roles')
    .insert({ user_id: userId, role })

  if (roleError) {
    console.error('\n❌  Usuario creado pero fallo al asignar rol:', roleError.message)
    console.error(`   User ID: ${userId}`)
    console.error('   Asigna el rol manualmente en la tabla user_roles.\n')
    process.exit(1)
  }

  console.log('\n✅  Usuario creado exitosamente:')
  console.log(`   ID:    ${userId}`)
  console.log(`   Email: ${email}`)
  console.log(`   Rol:   ${role}`)
  console.log('   El usuario deberá cambiar su contraseña al primer inicio de sesión.\n')
}

main().catch(err => {
  console.error('\n❌  Error inesperado:', err)
  process.exit(1)
})

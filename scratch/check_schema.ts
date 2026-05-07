import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkColumn() {
  const { data, error } = await supabase
    .from('teacher_details')
    .select('whatsapp_number')
    .limit(1)

  if (error) {
    if (error.code === 'PGRST204' || error.message.includes('column "whatsapp_number" does not exist')) {
      console.log('COLUMN_NOT_FOUND')
    } else {
      console.error('ERROR:', error)
    }
  } else {
    console.log('COLUMN_EXISTS')
  }
}

checkColumn()

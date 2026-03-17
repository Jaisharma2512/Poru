import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cgffdzufxxhlcnqhecsx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZmZkenVmeHhobGNucWhlY3N4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NjYxNTcsImV4cCI6MjA4OTM0MjE1N30.a8zRmNc_vLlLkcfEXV0Mc8_ggqslyITReheWD9tNgno'

export const supabase = createClient(supabaseUrl, supabaseKey)
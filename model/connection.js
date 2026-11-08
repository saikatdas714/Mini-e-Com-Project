require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || supabaseUrl.includes('YOUR_PROJECT_REF')) {
    console.warn('\n⚠️ [SUPABASE CONFIG]: SUPABASE_URL is not set yet in your .env file!');
    console.warn('👉 Please update SUPABASE_URL in .env with your project URL (e.g. https://xxxxxxxx.supabase.co)\n');
}

const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseKey || 'placeholder-key',
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false
        }
    }
);

console.log('Supabase client initialized');

module.exports = supabase;

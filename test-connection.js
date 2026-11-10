require('dotenv').config();
const supabase = require('./model/connection');

async function testConnection() {
    console.log('Testing Supabase connection...');
    console.log('SUPABASE_URL:', process.env.SUPABASE_URL || '(not set)');

    if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('YOUR_PROJECT_REF')) {
        console.error('\n❌ ERROR: SUPABASE_URL is not configured in .env.');
        console.error('👉 Please set SUPABASE_URL in your .env file.\n');
        process.exitCode = 1;
        return;
    }

    try {
        const { data, error } = await supabase.from('products').select('*').limit(5);

        if (error) {
            console.error('\n❌ Supabase query failed:', error.message);
            if (error.code === 'PGRST205' || error.message.includes('schema cache')) {
                console.log('\n💡 The database tables do not exist yet in your Supabase project!');
                console.log('👉 Go to Supabase Dashboard -> SQL Editor -> paste contents of supabase_schema.sql -> click Run.\n');
            }
            process.exitCode = 1;
            return;
        }

        console.log('\n✅ Successfully connected to Supabase database!');
        console.log(`Found ${data.length} product(s) in the database:\n`);
        data.forEach(p => console.log(` - [#${p.id}] ${p.name} (₹${p.price})`));
        console.log('\nYou are ready to run: npm run dev\n');
    } catch (err) {
        console.error('\n❌ Unexpected error:', err.message);
        process.exitCode = 1;
    }
}

testConnection();

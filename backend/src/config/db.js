const { createClient } = require('@supabase/supabase-js');
const ENV = require('./env');

const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SERVICE_KEY);

module.exports = supabase;

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eneulkdykuttunjnorjh.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuZXVsa2R5a3V0dHVuam5vcmpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNjkwMTUsImV4cCI6MjA4ODc0NTAxNX0.I-VF3i2I-LYH7jXqF96hQFpPFjl6tH0KcgD5p_OQHB4',
  },
  images: { unoptimized: true },
}

module.exports = nextConfig

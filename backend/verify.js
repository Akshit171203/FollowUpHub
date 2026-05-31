import { Pool } from 'pg';
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_bQ2y0REqdvxn@ep-patient-cell-ap2b75aj-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require',
});
pool.query("UPDATE users SET verified = true WHERE email = 'raghavmittal8895@gmail.com';", (err, res) => {
  console.log(err ? err : "Success");
  pool.end();
});

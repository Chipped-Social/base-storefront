import { Pool, QueryResult } from 'pg';
import fs from 'fs';
import path from 'path';

// Path to SSL certificate
const sslCertPath = path.join(process.cwd(), 'certs', 'ca-certificate.crt');
const sslCert = fs.readFileSync(sslCertPath);

// Create a connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  host: process.env.DB_HOST,
  ssl: {
    ca: sslCert
  }
});

// Test connection
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to PostgreSQL database');
  }
});

// Generic query function
export async function query(text: string, params?: any[]): Promise<QueryResult> {
  try {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}

// Initialize the database with required tables
export async function initDatabase() {
  try {
    // Create consolidated orders table
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS orders (
          order_id VARCHAR(255) PRIMARY KEY,
          order_date VARCHAR(10) NOT NULL,
          email VARCHAR(255),
          first_name VARCHAR(255),
          last_name VARCHAR(255),
          address1 VARCHAR(255),
          address2 VARCHAR(255),
          city VARCHAR(255),
          state VARCHAR(255),
          postal_code VARCHAR(255),
          country_code VARCHAR(10),
          product_name VARCHAR(255),
          product_sku VARCHAR(255),
          quantity INTEGER DEFAULT 1,
          payer VARCHAR(255),
          order_status VARCHAR(50) NOT NULL DEFAULT 'PENDING'
        );
      `);
      console.log('Orders table initialized');
    } catch (error: any) {
      console.log('Orders table already exists or error:', error.message || String(error));
    }

    console.log('Database initialization completed');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Order-related functions
export async function storeOrderData(
  orderId: string,
  email: string,
  physicalAddress: any,
  size?: string
) {
  // Format date as MM/DD/YYYY
  const today = new Date();
  const orderDate = `${today.getMonth()+1}/${today.getDate()}/${today.getFullYear()}`;
  
  // Extract address data
  const addressData = physicalAddress.physicalAddress || physicalAddress;
  const firstName = addressData.name?.firstName || '';
  const lastName = addressData.name?.familyName || '';
  
  // Determine product details based on size
  const sizeValue = size || 'M';
  const productName = `Base ${sizeValue === 'S' ? 'small' : sizeValue === 'M' ? 'medium' : 'large'}`;
  const productSku = `base${sizeValue === 'S' ? 'small' : sizeValue === 'M' ? 'medium' : 'large'}`;
  
  try {
    const result = await query(
      `INSERT INTO orders 
       (order_id, order_date, email, first_name, last_name, address1, address2, 
       city, state, postal_code, country_code, product_name, product_sku, 
       quantity, order_status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
       RETURNING *`,
      [
        orderId,
        orderDate,
        email,
        firstName,
        lastName,
        addressData.address1 || '',
        addressData.address2 || '',
        addressData.city || '',
        addressData.state || '',
        addressData.postalCode || '',
        addressData.countryCode || '',
        productName,
        productSku,
        1,
        'PENDING'
      ]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error storing order data:', error);
    throw error;
  }
}

// Initialize the database on import
initDatabase().catch(console.error);

export default {
  query,
  storeOrderData,
};

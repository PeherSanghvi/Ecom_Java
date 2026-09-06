const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

async function seedAdmin() {
  const client = new MongoClient('mongodb://localhost:27017/?replicaSet=rs0&directConnection=true');
  try {
    await client.connect();
    const db = client.db('ecommerce');
    const users = db.collection('users');

    // Check if admin already exists
    const existing = await users.findOne({ email: 'admin@example.com' });
    if (existing) {
      if (existing.role === 'ADMIN') {
        console.log('Admin user already exists with ADMIN role. Checking password...');
        // Update to ensure password is correct
        const hash = await bcrypt.hash('adminpass', 11);
        await users.updateOne(
          { email: 'admin@example.com' },
          { $set: { password: hash, role: 'ADMIN', updated_at: new Date() } }
        );
        console.log('Admin password refreshed for admin@example.com');
      } else {
        // User exists but not admin - update role and password
        const hash = await bcrypt.hash('adminpass', 11);
        await users.updateOne(
          { email: 'admin@example.com' },
          { $set: { password: hash, role: 'ADMIN', updated_at: new Date() } }
        );
        console.log('Promoted existing user admin@example.com to ADMIN role');
      }
    } else {
      // Create fresh admin user
      const hash = await bcrypt.hash('adminpass', 11);
      const now = new Date();
      await users.insertOne({
        name: 'Admin User',
        email: 'admin@example.com',
        password: hash,
        phone: '9999999999',
        address: { Street: '1 Admin St', City: 'Mumbai', State: 'Maharashtra', Pincode: '400001', Country: 'India' },
        role: 'ADMIN',
        created_at: now,
        updated_at: now
      });
      console.log('Created admin user: admin@example.com / adminpass');
    }

    // Verify
    const admin = await users.findOne({ email: 'admin@example.com' });
    const valid = await bcrypt.compare('adminpass', admin.password);
    console.log(`Verification: email=${admin.email}, role=${admin.role}, password_valid=${valid}`);
  } finally {
    await client.close();
  }
}

seedAdmin().catch(console.error);

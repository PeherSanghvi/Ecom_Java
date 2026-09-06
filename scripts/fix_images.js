const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb://localhost:27017/ecommerce?replicaSet=rs0&directConnection=true';
const DB_NAME = 'ecommerce';
const COLLECTION = 'products';

async function fixImages() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const col = client.db(DB_NAME).collection(COLLECTION);
    
    // 1. Get valid images from Fashion or Electronics
    const validProducts = await col.find({ department: { $in: ['Fashion', 'Electronics'] }, 'images.0': { $regex: '^(?!.*via.placeholder.com).*' } }).toArray();
    const validImages = validProducts.map(p => p.images).flat().filter(img => img && !img.includes('placeholder.com'));
    
    if (validImages.length === 0) {
      console.log('No valid images found.');
      return;
    }
    
    console.log(`Found ${validImages.length} valid images. Fixing Home and Beauty...`);
    
    // 2. Get Home and Beauty products
    const targetProducts = await col.find({ department: { $in: ['Home', 'Beauty'] } }).toArray();
    let updated = 0;
    
    for (const p of targetProducts) {
      const randomImg = validImages[Math.floor(Math.random() * validImages.length)];
      await col.updateOne({ _id: p._id }, { $set: { images: [randomImg] } });
      updated++;
    }
    
    console.log(`Successfully updated ${updated} products with valid images.`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

fixImages();

// seed_products.js
// Restores original 200 products to MongoDB with proper categorization
const { MongoClient } = require('mongodb');
const fs = require('fs');

// MongoDB connection string for Docker container
const MONGO_URI = 'mongodb://localhost:27017/ecommerce?replicaSet=rs0&directConnection=true';
const DB_NAME = 'ecommerce';
const COLLECTION_NAME = 'products';

// Fashion keyword mappings for categorization
const fashionMappings = {
  'Tops': ['top', 'shirt', 'blouse', 'sweater', 'hoodie', 'tank', 'tee', 't-shirt', 'crop', 'vest'],
  'Dresses': ['dress', 'gown', 'midi'],
  'Jeans': ['jeans', 'denim'],
  'Shoes': ['shoe', 'sneaker', 'boot', 'heel', 'loafer', 'sandal', 'slipper', 'trainer'],
  'Accessories': ['accessories', 'scarf', 'belt', 'hat', 'bag', 'purse', 'wallet', 'watch', 'body', 'pyjama', 'pajama'],
  'Trousers': ['trouser', 'pant', 'slack', 'jogger', 'legging', 'flare'],
  'Coats': ['coat', 'jacket', 'blazer', 'cardigan', 'parka'],
  'Shorts': ['short'],
  'Skirts': ['skirt'],
  'Jumpers': ['jumper', 'knit']
};

function categorizeProduct(title) {
  const titleLower = title.toLowerCase();
  for (const [subCat, keywords] of Object.entries(fashionMappings)) {
    for (const keyword of keywords) {
      if (titleLower.includes(keyword)) {
        return subCat;
      }
    }
  }
  return 'Accessories'; // Default
}

async function seedProducts() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✓ Connected to MongoDB');

    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Load products from JSON file
    console.log('📂 Loading original products seed file...');
    let jsonData = fs.readFileSync('original_products_seed.json', 'utf8');
    // Remove BOM if present
    if (jsonData.charCodeAt(0) === 0xFEFF) {
      jsonData = jsonData.slice(1);
    }
    let products = JSON.parse(jsonData);
    console.log(`✓ Loaded ${products.length} products from seed file`);

    // Transform products for .NET model
    console.log('🔧 Transforming products...');
    const transformedProducts = products.map(product => {
      const { _id, ...productWithoutId } = product;
      
      // Categorize product
      const subcategory = categorizeProduct(product.title);
      
      return {
        ...productWithoutId,
        // Add department and subcategory fields
        department: 'Fashion',
        subcategory: subcategory,
        // Ensure dates are Date objects
        created_at: product.created_at ? new Date(product.created_at) : new Date(),
        updated_at: product.updated_at ? new Date(product.updated_at) : new Date()
      };
    });

    // Delete existing products
    console.log('🗑️  Deleting existing products...');
    const deleteResult = await collection.deleteMany({});
    console.log(`✓ Deleted ${deleteResult.deletedCount} existing products`);

    // Insert new products
    console.log('💾 Inserting transformed products...');
    const insertResult = await collection.insertMany(transformedProducts);
    console.log(`✓ Inserted ${insertResult.insertedCount} products`);

    // Verify and show statistics
    const totalCount = await collection.countDocuments({});
    console.log(`\n📊 Final count: ${totalCount} products in database`);

    // Show subcategory distribution
    const subcategoryCounts = {};
    transformedProducts.forEach(p => {
      subcategoryCounts[p.subcategory] = (subcategoryCounts[p.subcategory] || 0) + 1;
    });

    console.log('\n📈 Subcategory distribution:');
    Object.entries(subcategoryCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([subcat, count]) => {
        console.log(`  ${subcat}: ${count}`);
      });

    console.log('\n✅ Database seed complete!');

  } catch (error) {
    console.error('❌ Error during seed:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seed script
seedProducts();

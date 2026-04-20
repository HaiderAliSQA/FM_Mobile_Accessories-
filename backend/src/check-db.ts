import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const ProductSchema = new mongoose.Schema({
  name: String,
  category: String,
  isVisible: Boolean,
  isDiscontinued: Boolean,
  isFeatured: Boolean,
  isNewArrival: Boolean
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function checkProducts() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI not found');
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    const products = await Product.find({});
    console.log(`Total Products: ${products.length}`);
    
    const categories = [...new Set(products.map(p => p.category))];
    console.log('Existing Categories:', categories);
    
    products.forEach(p => {
      console.log(`- ${p.name} | Cat: ${p.category} | Visible: ${p.isVisible} | Discontinued: ${p.isDiscontinued}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkProducts();

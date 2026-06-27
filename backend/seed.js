const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
global.crypto = require('crypto');
require('dotenv').config();

const User = require('./models/User');
const EntrepreneurProfile = require('./models/EntrepreneurProfile');
const Product = require('./models/Product');
const ServiceRequest = require('./models/ServiceRequest');
const Order = require('./models/Order');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hunarhub');
    console.log('MongoDB Connected for Seeding...');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // 1. Clear Database
    await User.deleteMany();
    await EntrepreneurProfile.deleteMany();
    await Product.deleteMany();
    await ServiceRequest.deleteMany();
    await Order.deleteMany();
    console.log('Cleared existing database records.');

    // 2. Hash passwords
    const salt = await bcrypt.genSalt(10);
    const commonPassword = await bcrypt.hash('password123', salt);

    // 3. Create Admin User
    const admin = await User.create({
      name: 'Admin Supervisor',
      email: 'admin@hunarhub.com',
      password: commonPassword,
      role: 'admin',
      phone: '+91 98765 43210',
      location: 'Hyderabad, India'
    });
    console.log('Created Admin user.');

    // 4. Create Customers
    const customer1 = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@gmail.com',
      password: commonPassword,
      role: 'customer',
      phone: '+91 87654 32109',
      location: 'Madhapur, Hyderabad'
    });

    const customer2 = await User.create({
      name: 'Anjali Desai',
      email: 'anjali@gmail.com',
      password: commonPassword,
      role: 'customer',
      phone: '+91 76543 21098',
      location: 'Gachibowli, Hyderabad'
    });
    console.log('Created Customer users.');

    // 5. Create Micro-Entrepreneurs (Users & Profiles)
    const entrepreneursData = [
      {
        name: 'Ram Kumar (Kumhar)',
        email: 'ram.kumhar@gmail.com',
        phone: '+91 99999 11111',
        location: 'Kukatpally, Hyderabad',
        category: 'Potter',
        businessName: 'Ram Clay Crafts & Pottery',
        bio: 'Third generation master potter specializing in hand-thrown earthen kitchenware, decorative clay lamps (diyas), and summer cooling pots. Utilizing traditional techniques passed down through generations.',
        experience: 18,
        pricingDetails: 'Pots: ₹150 - ₹500, Custom clay items: Hourly rate ₹300',
        skills: ['Wheel Throwing', 'Clay Sculptures', 'Terracotta Art', 'Terracotta Baking', 'Earthen Cookware'],
        products: [
          { name: 'Traditional Earthen Water Pot (Matka)', price: 250, description: 'Handcrafted natural clay cooling pot. Keeps water naturally cool and mineral-rich. Capacity: 5 Liters.', stock: 15, category: 'Potter' },
          { name: 'Set of 4 Terracotta Tea Cups (Kullad)', price: 120, description: 'Clay cups baked to perfection, giving your tea a traditional earthy aroma. Reusable and eco-friendly.', stock: 50, category: 'Potter' },
          { name: 'Decorative Handpainted Clay Vase', price: 450, description: 'Ornate, colorful hand-painted terracotta vase for home decor.', stock: 8, category: 'Potter' }
        ]
      },
      {
        name: 'Mohammad Shafi',
        email: 'shafi.leather@gmail.com',
        phone: '+91 99999 22222',
        location: 'Charminar, Hyderabad',
        category: 'Cobbler',
        businessName: 'Shafi Leather Works',
        bio: 'Expert cobbler and custom shoe artisan with 25+ years of experience. We handle orthological sole modification, premium leather restoration, boot repairs, and custom hand-stitched sandals.',
        experience: 26,
        pricingDetails: 'Stitching/Repairs: ₹50 - ₹200, Custom leather soles: ₹500 - ₹1200',
        skills: ['Leather Stitching', 'Sole Replacement', 'Heel Restoration', 'Polishing & Shining', 'Custom Sandals'],
        products: [
          { name: 'Handmade Pure Leather Kolhapuri Chappals', price: 850, description: 'Premium quality buffalo leather sandals, hand-stitched with durable threads. Unisex traditional design.', stock: 10, category: 'Cobbler' },
          { name: 'Premium Leather Polish & Restorer Kit', price: 199, description: 'A wax-based polishing paste with brush, designed to restore moisture and shine to natural leather.', stock: 20, category: 'Cobbler' }
        ]
      },
      {
        name: 'Savita Devi',
        email: 'savita.tailor@gmail.com',
        phone: '+91 99999 33333',
        location: 'Ameerpet, Hyderabad',
        category: 'Tailor',
        businessName: 'Savita Boutique & Alterations',
        bio: 'Self-made tailor specializing in women traditional wear, blouses, designer sarees, and custom alterations. Known for precise fits and quick turnaround times.',
        experience: 12,
        pricingDetails: 'Simple blouse: ₹350, Salwar Kameez: ₹600, Minor alteration: ₹80',
        skills: ['Pattern Making', 'Custom Fitting', 'Embroidery', 'Sari Borders', 'Alteration Works'],
        products: [
          { name: 'Hand-Embroidered Cotton Kurti (Size M)', price: 699, description: 'Pure cotton women tunic with exquisite Chikankari floral embroidery work on front side.', stock: 5, category: 'Tailor' },
          { name: 'Recycled Fabric Tote Bag', price: 150, description: 'Eco-friendly tote bag stitched from premium leftover block-print cotton fabrics. Sturdy and double-stitched.', stock: 30, category: 'Tailor' }
        ]
      },
      {
        name: 'Hari Prasad',
        email: 'hari.artisan@gmail.com',
        phone: '+91 99999 44444',
        location: 'Secunderabad, Hyderabad',
        category: 'Artisan',
        businessName: 'Hari Woodcrafts & Toys',
        bio: 'Artisan hand-carving organic wooden toys, kitchen ladles, and home statues from local neem and teak wood. Child-safe, lead-free natural lacquer paint finish.',
        experience: 15,
        pricingDetails: 'Kitchen tools: ₹100 - ₹300, Wooden toys: ₹200 - ₹800',
        skills: ['Wood Carving', 'Natural Lacquer Coating', 'Wood Turning', 'Hand-painting'],
        products: [
          { name: 'Traditional Wooden Spinning Top (Lattu)', price: 120, description: 'Eco-friendly neem wood spinning top painted with organic colors. Completely safe for kids.', stock: 40, category: 'Artisan' },
          { name: 'Neem Wood Spatula & Ladle Set (3 pcs)', price: 299, description: 'Antibacterial neem wood kitchen spatulas. Heat-resistant, non-toxic, and gentle on non-stick pans.', stock: 25, category: 'Artisan' },
          { name: 'Hand-Carved Wooden Elephant Statue', price: 950, description: 'Exquisite, detailed teak wood elephant figurine for living room decoration.', stock: 3, category: 'Artisan' }
        ]
      },
      {
        name: 'Sunita Gowda',
        email: 'sunita.vendors@gmail.com',
        phone: '+91 99999 55555',
        location: 'Jubilee Hills, Hyderabad',
        category: 'Small Vendor',
        businessName: 'Sunita Homemade Spices & Pickles',
        bio: 'Sourcing organic raw materials directly from local farms. We roast, grind, and bottle traditional Andhra pickles (Avakaya) and spices under strict hygiene guidelines without preservatives.',
        experience: 8,
        pricingDetails: 'Pickles: ₹180 - ₹350 per bottle (500g), Homemade spice powders: ₹80 - ₹150',
        skills: ['Traditional Pickling', 'Spice Grinding', 'Food Preservation', 'Organic Sourcing'],
        products: [
          { name: 'Andhra Special Avakaya (Mango) Pickle (500g)', price: 240, description: 'Fiery mango pickle made with premium cold-pressed sesame oil, fresh mustard, and spicy Guntur chilies.', stock: 30, category: 'Small Vendor' },
          { name: 'Pure Organic Turmeric Powder (250g)', price: 99, description: 'Hand-ground farm-fresh turmeric with high curcumin content. Adds rich color and medicinal properties.', stock: 50, category: 'Small Vendor' },
          { name: 'Homemade Garam Masala Mix (150g)', price: 120, description: 'Freshly roasted whole spices, ground in small batches to preserve fragrance and authentic taste.', stock: 45, category: 'Small Vendor' }
        ]
      }
    ];

    for (const ent of entrepreneursData) {
      // Create entrepreneur user
      const user = await User.create({
        name: ent.name,
        email: ent.email,
        password: commonPassword,
        role: 'entrepreneur',
        phone: ent.phone,
        location: ent.location
      });

      // Create entrepreneur profile (automatically verified for mock data)
      const profile = await EntrepreneurProfile.create({
        user: user._id,
        businessName: ent.businessName,
        bio: ent.bio,
        category: ent.category,
        skills: ent.skills,
        experience: ent.experience,
        pricingDetails: ent.pricingDetails,
        verified: true,
        isAvailable: true,
        rating: { average: 0, count: 0 },
        earnings: 0
      });

      // Create products for this entrepreneur
      for (const prod of ent.products) {
        await Product.create({
          entrepreneur: user._id,
          name: prod.name,
          description: prod.description,
          price: prod.price,
          category: prod.category,
          stock: prod.stock,
          image: '' // empty image initially
        });
      }
      console.log(`Seeded entrepreneur: ${ent.name} and their products.`);
    }

    // 6. Add some mock requests, orders, and reviews to simulate activity
    const ram = await User.findOne({ name: 'Ram Kumar (Kumhar)' });
    const savita = await User.findOne({ name: 'Savita Devi' });
    const hari = await User.findOne({ name: 'Hari Prasad' });

    // Customer 1 places a request to Ram Kumar
    const request1 = await ServiceRequest.create({
      customer: customer1._id,
      entrepreneur: ram._id,
      serviceType: 'Custom Clay Pots',
      description: 'Need 10 large customized clay pots for backyard gardening with custom drainage holes.',
      proposedDate: new Date(Date.now() + 86400000 * 3), // 3 days from now
      proposedPrice: 1500,
      status: 'completed',
      notes: 'Please keep the walls thick for durability.',
      feedback: {
        rating: 5,
        comment: 'Beautifully made pots. Perfectly tailored to my garden specifications. Kept his word on delivery time.'
      }
    });

    // Increment Ram's earnings
    await EntrepreneurProfile.findOneAndUpdate(
      { user: ram._id },
      { $inc: { earnings: 1500 } }
    );

    // Customer 2 places a request to Savita Devi
    await ServiceRequest.create({
      customer: customer2._id,
      entrepreneur: savita._id,
      serviceType: 'Salwar Suit Alteration',
      description: 'Fitting adjustments on 3 newly bought suits. Need it done urgently.',
      proposedDate: new Date(Date.now() + 86400000), // 1 day from now
      proposedPrice: 350,
      status: 'accepted',
      notes: 'Will drop off garments in the afternoon.'
    });

    // Customer 1 orders a product from Hari Prasad
    const spinningTop = await Product.findOne({ name: 'Traditional Wooden Spinning Top (Lattu)' });
    const order1 = await Order.create({
      product: spinningTop._id,
      customer: customer1._id,
      entrepreneur: hari._id,
      quantity: 2,
      totalPrice: 240,
      shippingAddress: 'Flat 402, Sai Residency, Madhapur, Hyderabad',
      status: 'delivered',
      feedback: {
        rating: 4,
        comment: 'Very nostalgic toy. Fine finish, perfectly safe for kids. Good wood quality.'
      }
    });

    // Decrement stock
    spinningTop.stock -= 2;
    await spinningTop.save();

    // Increment Hari's earnings
    await EntrepreneurProfile.findOneAndUpdate(
      { user: hari._id },
      { $inc: { earnings: 240 } }
    );

    // 7. Calculate ratings for Ram and Hari
    const ramProfile = await EntrepreneurProfile.findOne({ user: ram._id });
    ramProfile.rating = { average: 5.0, count: 1 };
    await ramProfile.save();

    const hariProfile = await EntrepreneurProfile.findOne({ user: hari._id });
    hariProfile.rating = { average: 4.0, count: 1 };
    await hariProfile.save();

    console.log('Seeded Service Requests, Orders, and Ratings successfully.');
    console.log('Database Seeding Completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

connectDB().then(seedData);

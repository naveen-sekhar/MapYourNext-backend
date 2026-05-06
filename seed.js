import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '..', '.env') });

import mongoose from 'mongoose';
import User from './models/User.js';
import Category from './models/Category.js';
import Destination from './models/Destination.js';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mapyournext';

const seedCategories = [
  { name: 'Beaches', type: 'destination', icon: '🏖️', description: 'Coastal destinations with sandy shores and ocean views' },
  { name: 'Mountains', type: 'destination', icon: '🏔️', description: 'High-altitude destinations with scenic peaks and valleys' },
  { name: 'Heritage', type: 'destination', icon: '🏛️', description: 'Historical and cultural landmarks' },
  { name: 'Adventure', type: 'destination', icon: '🧗', description: 'Thrilling activities and extreme sports destinations' },
  { name: 'Wildlife', type: 'destination', icon: '🐅', description: 'National parks and wildlife sanctuaries' },
  { name: 'Photography', type: 'hobby', icon: '📸', description: 'Destinations ideal for photography enthusiasts' },
  { name: 'Trekking', type: 'hobby', icon: '🥾', description: 'Trails and trekking routes' },
  { name: 'Culinary Arts', type: 'hobby', icon: '🍳', description: 'Food culture and culinary experiences' },
  { name: 'Yoga', type: 'hobby', icon: '🧘', description: 'Yoga retreats and wellness destinations' },
  { name: 'Birdwatching', type: 'hobby', icon: '🐦', description: 'Biodiversity-rich bird habitats' },
];

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding');

    // Clear existing seed data
    await Category.deleteMany({});
    await Destination.deleteMany({});
    console.log('Cleared existing categories and destinations');

    // 1. Seed categories — use create() one-by-one so pre-save slug hook runs
    const categories = [];
    for (const cat of seedCategories) {
      const created = await Category.create(cat);
      categories.push(created);
    }
    console.log(`✅ Seeded ${categories.length} categories`);

    const catMap = {};
    categories.forEach((c) => { catMap[c.name] = c._id; });

    // 2. Seed admin user
    let admin = await User.findOne({ email: 'admin@mapyournext.in' });
    if (!admin) {
      admin = await User.create({
        email: 'admin@mapyournext.in',
        passwordHash: 'Admin@123456',
        role: 'admin',
        profile: { name: 'MapYourNext Admin' },
      });
      console.log('✅ Admin user created (admin@mapyournext.in / Admin@123456)');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // 3. Seed destinations — use create() so pre-save slug hook runs
    const destData = [
      {
        name: 'Goa',
        location: { address: 'Panaji, Goa', coordinates: [73.8278, 15.4909], state: 'Goa', country: 'India' },
        categories: [catMap['Beaches'], catMap['Adventure']],
        hobbies: [catMap['Photography'], catMap['Culinary Arts']],
        entryFee: { amount: 0 },
        budgetRange: { min: 3000, max: 15000 },
        bestSeasons: ['October', 'November', 'December', 'January', 'February'],
        safetyRating: { overall: 7, soloWomen: 3, riskLevel: 'low' },
        accessibility: { wheelchairFriendly: false, ageSuitability: 'all' },
        media: { coverImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800', gallery: [] },
        addedBy: admin._id,
      },
      {
        name: 'Manali',
        location: { address: 'Manali, Himachal Pradesh', coordinates: [77.1887, 32.2396], state: 'Himachal Pradesh', country: 'India' },
        categories: [catMap['Mountains'], catMap['Adventure']],
        hobbies: [catMap['Trekking'], catMap['Photography']],
        entryFee: { amount: 0 },
        budgetRange: { min: 4000, max: 20000 },
        bestSeasons: ['March', 'April', 'May', 'June', 'September', 'October'],
        safetyRating: { overall: 8, soloWomen: 4, riskLevel: 'low' },
        accessibility: { wheelchairFriendly: false, ageSuitability: 'all' },
        media: { coverImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800', gallery: [] },
        addedBy: admin._id,
      },
      {
        name: 'Jaipur',
        location: { address: 'Jaipur, Rajasthan', coordinates: [75.7873, 26.9124], state: 'Rajasthan', country: 'India' },
        categories: [catMap['Heritage']],
        hobbies: [catMap['Photography'], catMap['Culinary Arts']],
        entryFee: { amount: 200 },
        budgetRange: { min: 2500, max: 12000 },
        bestSeasons: ['October', 'November', 'December', 'January', 'February', 'March'],
        safetyRating: { overall: 7, soloWomen: 3, riskLevel: 'low' },
        accessibility: { wheelchairFriendly: true, ageSuitability: 'all' },
        media: { coverImage: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800', gallery: [] },
        addedBy: admin._id,
      },
    ];

    for (const dest of destData) {
      await Destination.create(dest);
    }
    console.log(`✅ Seeded ${destData.length} destinations`);

    console.log('\n🎉 Seed complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();

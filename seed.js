require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');
const Booking = require('./models/Booking');

const connectDB = require('./config/db');

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      Booking.deleteMany({})
    ]);

    // Create demo users
    console.log('Creating demo users...');
    const users = await User.create([
      {
        name: 'Demo User',
        email: 'demo@linemate.com',
        password: 'demo123'
      },
      {
        name: 'John Smith',
        email: 'john@example.com',
        password: 'password123'
      },
      {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123'
      },
      {
        name: 'Admin User',
        email: 'admin@linemate.com',
        password: 'admin123'
      }
    ]);

    console.log(`Created ${users.length} users`);

    // Create events
    console.log('Creating events...');
    const now = new Date();
    const events = await Event.create([
      {
        name: 'React Summit 2026',
        description: 'Join the biggest React conference of the year! Featuring talks from core team members, hands-on workshops, and networking opportunities with industry leaders. Learn about React 19 features, Server Components, and the future of web development. Perfect for frontend developers of all skill levels.',
        date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        time: '09:00 AM',
        venue: 'Tech Convention Center, San Francisco',
        category: 'Tech',
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        totalSeats: 500,
        availableSeats: 500,
        price: 299,
        organizer: 'React Community'
      },
      {
        name: 'Summer Music Festival',
        description: 'A three-day outdoor music festival featuring top artists from around the world. Multiple stages, food trucks, art installations, and camping options available. Lineup includes rock, pop, EDM, and indie artists. Bring your friends and enjoy amazing performances under the summer sky!',
        date: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
        time: '12:00 PM',
        venue: 'Golden Gate Park, San Francisco',
        category: 'Concert',
        imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
        totalSeats: 10000,
        availableSeats: 10000,
        price: 149,
        organizer: 'SF Music Guild'
      },
      {
        name: 'AI/ML Workshop: Hands-on with LLMs',
        description: 'Dive deep into Large Language Models in this practical workshop. Build and deploy your own LLM-powered applications using Groq, learn about prompt engineering, RAG systems, and fine-tuning techniques. Prerequisites: Basic Python knowledge. All materials and cloud credits provided.',
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        time: '10:00 AM',
        venue: 'Innovation Hub, Palo Alto',
        category: 'Workshop',
        imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
        totalSeats: 50,
        availableSeats: 50,
        price: 99,
        organizer: 'AI Builders Club'
      },
      {
        name: 'Startup Networking Meetup',
        description: 'Connect with fellow entrepreneurs, investors, and tech professionals at our monthly networking event. Pitch your ideas, find co-founders, or discover your next career opportunity. Includes lightning talks, open mic pitches, and structured networking sessions with refreshments.',
        date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        time: '06:00 PM',
        venue: 'WeWork Downtown, San Jose',
        category: 'Meetup',
        imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800',
        totalSeats: 100,
        availableSeats: 100,
        price: 0,
        organizer: 'Silicon Valley Startups'
      },
      {
        name: 'Photography Masterclass',
        description: 'Learn professional photography techniques from award-winning photographers. This full-day masterclass covers composition, lighting, post-processing, and building a photography business. Bring your camera! Lunch and course materials included.',
        date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        time: '08:30 AM',
        venue: 'Art District Studio, Los Angeles',
        category: 'Art',
        imageUrl: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800',
        totalSeats: 30,
        availableSeats: 30,
        price: 199,
        organizer: 'LA Photo Collective'
      },
      {
        name: 'Food & Wine Expo 2026',
        description: 'Indulge in a culinary adventure featuring 50+ restaurants, wineries, and artisanal food producers. Sample dishes from celebrity chefs, attend cooking demonstrations, and participate in wine tasting sessions. VIP tickets include exclusive access to the chef\'s table experience.',
        date: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000),
        time: '11:00 AM',
        venue: 'Convention Center, Napa Valley',
        category: 'Food',
        imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
        totalSeats: 2000,
        availableSeats: 2000,
        price: 75,
        organizer: 'Napa Valley Events'
      },
      {
        name: 'NBA Finals Watch Party',
        description: 'Watch the NBA Finals on our giant 30-foot LED screen! Enjoy game-day food specials, halftime contests with prizes, and an electric atmosphere. Wear your team jersey and get a free drink. Doors open one hour before tipoff.',
        date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        time: '05:00 PM',
        venue: 'Sports Arena Bar & Grill, Oakland',
        category: 'Sports',
        imageUrl: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800',
        totalSeats: 300,
        availableSeats: 300,
        price: 10,
        organizer: 'Bay Area Sports Fans'
      },
      {
        name: 'Cybersecurity Conference 2026',
        description: 'Stay ahead of the curve at the premier cybersecurity conference. Topics include zero-trust architecture, cloud security, AI-powered threat detection, and incident response. Network with CISOs, security researchers, and solution providers. CEUs available.',
        date: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000),
        time: '08:00 AM',
        venue: 'Marriott Marquis, San Diego',
        category: 'Conference',
        imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
        totalSeats: 800,
        availableSeats: 800,
        price: 499,
        organizer: 'CyberSec Alliance'
      },
      {
        name: 'Yoga & Wellness Retreat',
        description: 'Escape the city for a day of mindfulness and rejuvenation. This retreat includes guided yoga sessions, meditation workshops, organic meals, and nature walks. Suitable for all levels. Mats, props, and wellness kit included. Limited to ensure personal attention.',
        date: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
        time: '07:00 AM',
        venue: 'Redwood Retreat Center, Santa Cruz',
        category: 'Other',
        imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
        totalSeats: 25,
        availableSeats: 25,
        price: 129,
        organizer: 'Wellness Collective'
      },
      {
        name: 'Blockchain & Web3 Developer Day',
        description: 'A full day dedicated to blockchain development. Learn about smart contracts, DeFi protocols, NFT standards, and building dApps. Hands-on coding sessions with Solidity, Rust, and Web3.js. Previous blockchain experience helpful but not required.',
        date: new Date(now.getTime() + 16 * 24 * 60 * 60 * 1000),
        time: '09:30 AM',
        venue: 'TechSpace, Austin',
        category: 'Tech',
        imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
        totalSeats: 120,
        availableSeats: 120,
        price: 79,
        organizer: 'Web3 Builders'
      },
      {
        name: 'Jazz Night Under the Stars',
        description: 'Experience an enchanting evening of live jazz music in a beautiful outdoor amphitheater. Featuring renowned jazz quartets and vocalists. Bring your picnic blankets and enjoy wine and cheese under the stars. A magical night for music lovers.',
        date: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
        time: '07:30 PM',
        venue: 'Hollywood Bowl, Los Angeles',
        category: 'Concert',
        imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800',
        totalSeats: 3500,
        availableSeats: 3500,
        price: 45,
        organizer: 'LA Jazz Foundation'
      },
      {
        name: 'Digital Marketing Bootcamp',
        description: 'Transform your marketing skills in this intensive bootcamp. Cover SEO, SEM, social media strategy, content marketing, analytics, and marketing automation. Real-world case studies and hands-on projects. Certificate provided upon completion.',
        date: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
        time: '09:00 AM',
        venue: 'Business Center, Chicago',
        category: 'Workshop',
        imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
        totalSeats: 40,
        availableSeats: 40,
        price: 249,
        organizer: 'Growth Marketing Pro'
      }
    ]);

    console.log(`Created ${events.length} events`);

    // Create some sample bookings for demo user
    console.log('Creating sample bookings...');
    if (events.length >= 3) {
      await Booking.create([
        {
          user: users[0]._id,
          event: events[2]._id,
          seats: 2,
          totalPrice: events[2].price * 2,
          status: 'confirmed'
        },
        {
          user: users[0]._id,
          event: events[6]._id,
          seats: 1,
          totalPrice: events[6].price * 1,
          status: 'confirmed'
        }
      ]);

      // Update available seats for booked events
      await Event.findByIdAndUpdate(events[2]._id, { $inc: { availableSeats: -2 } });
      await Event.findByIdAndUpdate(events[6]._id, { $inc: { availableSeats: -1 } });

      console.log('Created sample bookings for demo user');
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Demo Accounts:');
    console.log('  Email: demo@linemate.com  | Password: demo123');
    console.log('  Email: john@example.com   | Password: password123');
    console.log('  Email: jane@example.com   | Password: password123');
    console.log('  Email: admin@linemate.com | Password: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();

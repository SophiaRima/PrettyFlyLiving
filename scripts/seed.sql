-- Local placeholder content, taken from design/concept/index.html.
-- Run with `npm run db:seed` (local D1 only). Safe to re-run: it clears the
-- content tables first. Inbox and admin tables are left untouched.
--
-- Little Urban Nook (property 7) is a real Pretty Fly Living studio, using
-- the client's own photos and details from its Airbnb listing. Every stay and
-- extra service shows those real photos: they live in scripts/seed-media/ and
-- npm run db:seed copies them into local R2. The six other stays are still
-- concept placeholders, borrowing the studio's photos until theirs arrive.
--
-- Guide images starting with https:// are Unsplash placeholders (there are
-- no client photos of Nairobi venues yet). mediaUrl() passes them through.

DELETE FROM availability_blocks;
DELETE FROM guide_photos;
DELETE FROM property_photos;
DELETE FROM reviews;
DELETE FROM booking_requests;
DELETE FROM properties;
DELETE FROM guides;
DELETE FROM faqs;
DELETE FROM extra_services;

-- ---------------------------------------------------------------- properties

INSERT INTO properties (id, slug, name, area, address, property_type, tag, rating, description, bedrooms, bathrooms, sleeps, monthly_price_kes, min_nights, amenities, is_featured, is_published, sort_order) VALUES
(1, 'the-lennox-residence', 'The Lennox Residence', 'Kilimani', 'Kilimani, Nairobi', 'Apartment', 'Guest favourite', 4.9,
 'A calm, light-filled apartment designed for slow mornings, comfortable workdays and easy evenings. Settle into a thoughtfully furnished home close to Nairobi’s cafés, shops and everyday essentials.',
 2, 2, 4, 60000, 30, '["Fast Wi-Fi","Fully equipped kitchen","Swimming pool","Secure parking","Smart TV","24/7 security"]', 1, 1, 1),
(2, 'skyline-apartments', 'Skyline Apartments', 'Westlands', 'Westlands, Nairobi', 'Apartment', 'City views', 4.8,
 'An airy city base with modern finishes, generous windows and space to unwind after a day in Nairobi. Ideal for business trips, couples and longer visits.',
 2, 2, 4, 60000, 30, '["High-speed Wi-Fi","Balcony","Gym access","Equipped kitchen","Laundry","Secure access"]', 1, 1, 2),
(3, 'the-urban-loft', 'The Urban Loft', 'Kileleshwa', 'Kileleshwa, Nairobi', 'Loft', 'Couples’ pick', 4.9,
 'A considered, comfortable loft in a leafy neighbourhood. Enjoy an easy-to-live-in layout, warm textures and a quieter side of the city, within reach of Nairobi’s favourite spots.',
 1, 1, 2, 60000, 30, '["Wi-Fi","Kitchenette","Smart TV","Lift access","On-site security","Fresh linens"]', 1, 1, 3),
(4, 'the-garden-suite', 'The Garden Suite', 'Lavington', 'Lavington, Nairobi', 'Apartment', 'Room to unwind', 4.8,
 'A spacious apartment for families and small groups, with welcoming communal spaces and room to make yourself at home during a longer Nairobi stay.',
 3, 2, 6, 60000, 30, '["Full kitchen","Family dining","Wi-Fi","Laundry","Secure parking","24-hour security"]', 0, 1, 4),
(5, 'parkview-hideaway', 'Parkview Hideaway', 'Kilimani', 'Kilimani, Nairobi', 'Apartment', 'Easy city living', 4.7,
 'A comfortable, well-appointed home base for solo travellers and couples, with the essentials covered and Nairobi on your doorstep.',
 1, 1, 2, 60000, 30, '["Wi-Fi","Kitchen","Smart TV","Lift","Security","Work-friendly desk"]', 0, 1, 5),
(6, 'the-terrace-residence', 'The Terrace Residence', 'Westlands', 'Westlands, Nairobi', 'Apartment', 'Made for longer stays', 4.9,
 'A generous, light-filled residence with room for everyone. Settle in for a work assignment, family visit or extended city break.',
 3, 2, 6, 60000, 30, '["Balcony","Wi-Fi","Full kitchen","Laundry","Parking","Secure building"]', 0, 1, 6);

INSERT INTO properties (id, slug, name, area, address, property_type, tag, rating, description, good_to_know, bedrooms, bathrooms, sleeps, monthly_price_kes, min_nights, amenities, is_featured, is_published, sort_order) VALUES
(7, 'little-urban-nook', 'Little Urban Nook', 'Kilimani', 'Near Yaya Centre, Kilimani, Nairobi', 'Apartment', 'Near Yaya Centre', 4.7,
 'The Little Urban Nook is best suited for one guest looking for a clean, comfortable and private place to stay in a prime location. Whether you’re in Nairobi for business, a quick city escape or simply passing through, you’ll have the essentials you need for a relaxing stay, and a peaceful little space to return to after a busy day. Small space, thoughtfully done, and everything you need in one little nook.',
 'Airport pick-up and drop-off can be arranged at an additional cost. Longer stays come with special discounts, complimentary cleaning, and free early check-in and late check-out when available. Please note that a new building is going up on the next plot, so there may be construction noise during working hours: Monday to Friday from about 9am to 5pm, and Saturday from 9am to about 2pm. There is no work on Sundays, and the digging stage is expected to finish soon.',
 0, 1, 1, 60000, 30,
 '["Fast Wi-Fi","Ethernet connection","Smart TV","Free secure parking","Shared heated pool (seasonal)","Shared gym","Games room","Courtyard garden","Rooftop terrace","Coffee shop in the building","Lift","24/7 security","Doorman and reception","Security cameras in shared areas","Self check-in with lockbox","Luggage drop-off","Housekeeping twice a week","Microwave","Mini fridge","Kettle","Coffee","Dishes and cutlery","Wine glasses","Hot water","Shampoo, body soap and shower gel","Bidet","Towels, bed linen and toilet paper","Extra pillows and blankets","Wardrobe and hangers","Iron","Clothes drying rack","Cleaning products","Books and reading material","Laundromat nearby"]',
 1, 1, 0);

INSERT INTO property_photos (property_id, r2_key, alt, sort_order) VALUES
(1, 'properties/9f63fde530f12b33a0698e8cc549aede.webp', 'Heated pool in the building', 0),
(1, 'properties/84afa3f201a4bccb9f88630a7da67c3d.webp', 'Bed by the window in the afternoon light', 1),
(1, 'properties/6a803b346d43f3e2e9942d9d564087ff.webp', 'The studio, with the bed, smart TV, mini fridge and microwave', 2),
(1, 'properties/3f33fffaadbe51f07fdb55ba337fcd25.webp', 'Bathroom sink with a lit mirror and shelves', 3),
(1, 'properties/2c8a99b0845107df9bf56bf9aca8e4b2.webp', 'Courtyard garden with seating', 4),
(2, 'properties/fef864218620e55ca618464d69755e42.webp', 'City view over Kilimani from the window', 0),
(2, 'properties/6f74c2c7ffdcea2cfc28b5494f1900b3.webp', 'Fully equipped gym in the building', 1),
(2, 'properties/45dbd32b3e70ba9014888a1b7bd7de75.webp', 'Smart TV, desk and mini fridge at the foot of the bed', 2),
(2, 'properties/97ca53928501f550e43c020c3d9041a8.webp', 'Shower with a hand-held shower head', 3),
(2, 'properties/13e3fc0852980bc946109f6f3dd94cc4.webp', 'Lift lobby on the building''s 15th floor', 4),
(3, 'properties/7b95f0e55a812ded97ecdbf61cb1c9d4.webp', 'Desk, smart TV and kitchenette corner', 0),
(3, 'properties/37b3c730c2e917382cc790dfc432ae7e.webp', 'Made-up bed with a cushion and woven throw', 1),
(3, 'properties/eebdee560cb8975cd6d25f8ec262d92d.webp', 'Kettle, glasses and dishes on the kitchenette shelves', 2),
(3, 'properties/fe18945513d382d939d98112088008ef.webp', 'Bedside table by the window', 3),
(3, 'properties/f343282c4dc9d5d973be06e489929abb.webp', 'Shower room with a glass screen, toilet and sink', 4),
(4, 'properties/2c8a99b0845107df9bf56bf9aca8e4b2.webp', 'Courtyard garden with seating', 0),
(4, 'properties/2af83536ab9660a1d734ce3009724674.webp', 'Bed and bedside table under the window', 1),
(4, 'properties/db751fa63b7c2d8fbb64ca38d935b7ba.webp', 'Microwave on top of the mini fridge', 2),
(4, 'properties/11f3f516ba42dded022c86e0c984034d.webp', 'Fresh towels and bed linen', 3),
(4, 'properties/a68b1dd8e013ab53d28a21b80b5954ef.webp', 'Shared games room with a pool table', 4),
(5, 'properties/501c750f8e22a11f4ccdf0fd729cff5b.webp', 'Work desk and chair with shelves and the smart TV', 0),
(5, 'properties/462807ae4a3185d8601505c967f2a0b3.webp', 'Bed with rolled towels and a city view', 1),
(5, 'properties/8f6ae1e90d34434a88eeb9b6e8060696.webp', 'Wardrobe with hangers and an iron', 2),
(5, 'properties/79f0175babb6f41f161e7aa7796f71a9.webp', 'Wooden desk chair and wall desk', 3),
(5, 'properties/99511b3e10153857cdb6eecad2e9370f.webp', 'Secure basement parking', 4),
(6, 'properties/710e6c7bf7331292f374562d7933d6f1.webp', 'Heated pool with floor-to-ceiling windows', 2),
(6, 'properties/40b00effbb1dc1c89efe7623591d1bc2.webp', 'Single bed with fresh towels beside the window', 1),
(6, 'properties/24609267507fca55f35d23456a6b6ea1.webp', 'Games room with pool and table tennis tables', 0),
(6, 'properties/d28b9cd9e64dbf42ea450150a3d8f9f5.webp', 'Mini fridge with a freezer compartment', 3),
(6, 'properties/13ee750e71939f8a291c715ce8c34a70.webp', 'Entrance hall leading into the studio', 4),
(7, 'properties/54a8bd1e95de36377bcdd8e789d5ac7b.webp', 'Small double bed by the window with fresh towels', 0),
(7, 'properties/6a803b346d43f3e2e9942d9d564087ff.webp', 'The studio, with the bed, smart TV, mini fridge and microwave', 1),
(7, 'properties/fef864218620e55ca618464d69755e42.webp', 'City view over Kilimani from the window', 2),
(7, 'properties/501c750f8e22a11f4ccdf0fd729cff5b.webp', 'Work desk and chair with shelves and the smart TV', 3),
(7, 'properties/9f63fde530f12b33a0698e8cc549aede.webp', 'Heated pool in the building', 4),
(7, 'properties/f343282c4dc9d5d973be06e489929abb.webp', 'Shower room with a glass screen, toilet and sink', 5),
(7, 'properties/7b95f0e55a812ded97ecdbf61cb1c9d4.webp', 'Desk, smart TV and kitchenette corner', 6),
(7, 'properties/6f74c2c7ffdcea2cfc28b5494f1900b3.webp', 'Fully equipped gym in the building', 7),
(7, 'properties/2c8a99b0845107df9bf56bf9aca8e4b2.webp', 'Courtyard garden with seating', 8),
(7, 'properties/a68b1dd8e013ab53d28a21b80b5954ef.webp', 'Shared games room with a pool table', 9),
(7, 'properties/37b3c730c2e917382cc790dfc432ae7e.webp', 'Made-up bed with a cushion and woven throw', 10),
(7, 'properties/84afa3f201a4bccb9f88630a7da67c3d.webp', 'Bed by the window in the afternoon light', 11),
(7, 'properties/2af83536ab9660a1d734ce3009724674.webp', 'Bed and bedside table under the window', 12),
(7, 'properties/462807ae4a3185d8601505c967f2a0b3.webp', 'Bed with rolled towels and a city view', 13),
(7, 'properties/11f3f516ba42dded022c86e0c984034d.webp', 'Fresh towels and bed linen', 14),
(7, 'properties/45dbd32b3e70ba9014888a1b7bd7de75.webp', 'Smart TV, desk and mini fridge at the foot of the bed', 15),
(7, 'properties/79f0175babb6f41f161e7aa7796f71a9.webp', 'Wooden desk chair and wall desk', 16),
(7, 'properties/fe18945513d382d939d98112088008ef.webp', 'Bedside table by the window', 17),
(7, 'properties/eebdee560cb8975cd6d25f8ec262d92d.webp', 'Kettle, glasses and dishes on the kitchenette shelves', 18),
(7, 'properties/db751fa63b7c2d8fbb64ca38d935b7ba.webp', 'Microwave on top of the mini fridge', 19),
(7, 'properties/d28b9cd9e64dbf42ea450150a3d8f9f5.webp', 'Mini fridge with a freezer compartment', 20),
(7, 'properties/8f6ae1e90d34434a88eeb9b6e8060696.webp', 'Wardrobe with hangers and an iron', 21),
(7, 'properties/3f33fffaadbe51f07fdb55ba337fcd25.webp', 'Bathroom sink with a lit mirror and shelves', 22),
(7, 'properties/97ca53928501f550e43c020c3d9041a8.webp', 'Shower with a hand-held shower head', 23),
(7, 'properties/710e6c7bf7331292f374562d7933d6f1.webp', 'Heated pool with floor-to-ceiling windows', 24),
(7, 'properties/24609267507fca55f35d23456a6b6ea1.webp', 'Games room with pool and table tennis tables', 25),
(7, 'properties/922cd64a6a7bfa5c27662e7cbe3816d0.webp', 'Front door of the studio', 26),
(7, 'properties/13ee750e71939f8a291c715ce8c34a70.webp', 'Entrance hall leading into the studio', 27),
(7, 'properties/3fc03fe9ca39d5c0fb473531570b9d80.webp', 'Home fragrance diffuser on a shelf', 28),
(7, 'properties/13e3fc0852980bc946109f6f3dd94cc4.webp', 'Lift lobby on the building''s 15th floor', 29),
(7, 'properties/99511b3e10153857cdb6eecad2e9370f.webp', 'Secure basement parking', 30);

-- Sample blocks so date search and the calendar have something to show.
INSERT INTO availability_blocks (property_id, start_date, end_date, source, note) VALUES
(1, '2026-11-01', '2026-12-01', 'booking', 'Seed: November booking'),
(2, '2026-11-15', '2027-01-15', 'booking', 'Seed: two-month stay'),
(3, '2026-12-20', '2027-01-05', 'admin', 'Seed: owner holiday');

-- ------------------------------------------------------------------- reviews

INSERT INTO reviews (guest_name, context, body, rating, is_featured, sort_order, is_published) VALUES
('Guest review', 'Recent Nairobi stay', 'The apartment felt like home from the moment we walked in. Beautifully kept, easy to settle into, and the team was so helpful.', 5, 1, 1, 1),
('Guest review', 'Nairobi, Kenya', 'A beautiful, comfortable apartment and communication that made everything simple. I’d happily stay again.', 5, 0, 2, 1);

-- -------------------------------------------------------------------- guides

INSERT INTO guides (slug, title, category, excerpt, cover_r2_key, highlights, body_md, is_featured, sort_order, is_published) VALUES
('a-taste-of-nairobi', 'A taste of Nairobi', 'Food',
 'From slow brunches to Kenyan favourites, find your next table.',
 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=85',
 '["Brunch & coffee","Kenyan favourites","Dinner tables"]',
 '## Start with a table

Nairobi’s food scene is best explored with curiosity. From relaxed brunch spots and cafés to Kenyan dishes and special-occasion dinners, there’s something for every kind of day.

Ask your host or our team for current local recommendations, and check opening times before setting off.', 1, 1, 1),
('the-city-after-dark', 'The city after dark', 'Nightlife',
 'Cocktail bars, live music and places with a little atmosphere.',
 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=900&q=85',
 '["Golden-hour drinks","Live music","Late-night bites"]',
 '## Find your own kind of night

As the city settles into evening, Nairobi offers everything from intimate live-music rooms to rooftop drinks and lively restaurants. Choose your mood and plan your journey home.

For a smooth evening, confirm event schedules in advance and use a trusted transport option.', 1, 2, 1),
('wildlife-close-to-home', 'Wildlife close to home', 'Attractions',
 'A memorable day out, just beyond the city centre.',
 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=900&q=85',
 '["Nairobi National Park","Conservation stories","Plan the drive"]',
 '## A little wilderness, not far away

One of Nairobi’s special qualities is how quickly the city can give way to open space and wildlife. A visit to Nairobi National Park or a conservation experience can make a memorable day.

Check official attraction information for opening hours, tickets, access and any seasonal changes before travelling.', 1, 3, 1),
('a-local-shopping-edit', 'A local shopping edit', 'Shopping',
 'Design finds, markets and independent Nairobi favourites.',
 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=85',
 '["Design stores","Markets & makers","A little Nairobi"]',
 '## Bring a little Nairobi home

Explore a mix of shopping centres, independent shops, artisan markets and locally made pieces. Leave time to browse and discover items you won’t find anywhere else.

Market days and vendor availability vary, so check current details and carry a suitable payment option.', 1, 4, 1),
('make-a-day-of-it', 'Make a day of it', 'Activities',
 'Outdoor escapes and memorable experiences around Nairobi.',
 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=900&q=85',
 '["A nature walk","An active escape","A full-day plan"]',
 '## Make the most of a free day

Balance your city plans with a walk, a nature outing or an experience that takes you somewhere new. Nairobi has plenty to offer whether you prefer active adventures or an unhurried afternoon.

Check weather, travel times and advance booking requirements for the activity you choose.', 0, 5, 1),
('arts-culture-and-more', 'Arts, culture & more', 'Entertainment',
 'Creative spaces, galleries and the city’s cultural calendar.',
 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=900&q=85',
 '["Gallery hopping","Live performance","Pop-ups & events"]',
 '## Discover the creative side of the city

Galleries, performances, pop-ups and cultural spaces offer another way to get to know Nairobi. Keep an eye on current listings and build a little flexibility into your plans.

Schedules change regularly. Check venue websites or official social pages for up-to-date event information.', 0, 6, 1);

-- Guide galleries (client revision: several photos per guide). The cover
-- (guides.cover_r2_key) is shown first, then these in order.
INSERT INTO guide_photos (guide_id, r2_key, alt, sort_order) VALUES
((SELECT id FROM guides WHERE slug = 'a-taste-of-nairobi'), 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1400&q=80', 'Shared plates at a Nairobi table', 1),
((SELECT id FROM guides WHERE slug = 'a-taste-of-nairobi'), 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80', 'Freshly prepared dishes', 2),
((SELECT id FROM guides WHERE slug = 'a-taste-of-nairobi'), 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80', 'A relaxed restaurant interior', 3),
((SELECT id FROM guides WHERE slug = 'a-taste-of-nairobi'), 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1400&q=80', 'Open-air terrace dining', 4),
((SELECT id FROM guides WHERE slug = 'the-city-after-dark'), 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1400&q=80', 'A cocktail on the bar', 1),
((SELECT id FROM guides WHERE slug = 'the-city-after-dark'), 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1400&q=80', 'A drink being poured', 2),
((SELECT id FROM guides WHERE slug = 'the-city-after-dark'), 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=1400&q=80', 'Bartender at work', 3),
((SELECT id FROM guides WHERE slug = 'the-city-after-dark'), 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1400&q=80', 'Live music on stage', 4),
((SELECT id FROM guides WHERE slug = 'wildlife-close-to-home'), 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1400&q=80', 'Giraffe at sunset', 1),
((SELECT id FROM guides WHERE slug = 'wildlife-close-to-home'), 'https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=1400&q=80', 'Elephant in the bush', 2),
((SELECT id FROM guides WHERE slug = 'wildlife-close-to-home'), 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1400&q=80', 'Game drive across the plains', 3),
((SELECT id FROM guides WHERE slug = 'wildlife-close-to-home'), 'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?auto=format&fit=crop&w=1400&q=80', 'Savanna and distant mountains', 4),
((SELECT id FROM guides WHERE slug = 'a-local-shopping-edit'), 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1400&q=80', 'An independent shop', 1),
((SELECT id FROM guides WHERE slug = 'a-local-shopping-edit'), 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1400&q=80', 'Browsing a clothing rail', 2),
((SELECT id FROM guides WHERE slug = 'a-local-shopping-edit'), 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=80', 'Shopping bags after a day out', 3),
((SELECT id FROM guides WHERE slug = 'a-local-shopping-edit'), 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1400&q=80', 'Handmade craft supplies', 4),
((SELECT id FROM guides WHERE slug = 'make-a-day-of-it'), 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=1400&q=80', 'Hiking through green hills', 1),
((SELECT id FROM guides WHERE slug = 'make-a-day-of-it'), 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1400&q=80', 'Walkers on a mountain trail', 2),
((SELECT id FROM guides WHERE slug = 'make-a-day-of-it'), 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=80', 'A quiet forest path', 3),
((SELECT id FROM guides WHERE slug = 'make-a-day-of-it'), 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1400&q=80', 'Sunset over the plains', 4),
((SELECT id FROM guides WHERE slug = 'arts-culture-and-more'), 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1400&q=80', 'An evening event', 1),
((SELECT id FROM guides WHERE slug = 'arts-culture-and-more'), 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1400&q=80', 'Concert crowd and lights', 2),
((SELECT id FROM guides WHERE slug = 'arts-culture-and-more'), 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80', 'Audience at a performance', 3),
((SELECT id FROM guides WHERE slug = 'arts-culture-and-more'), 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=1400&q=80', 'Colourful contemporary art', 4);

-- ---------------------------------------------------------------------- faqs

INSERT INTO faqs (audience, question, answer, sort_order, is_published) VALUES
('guest', 'How do I book a stay?', 'Browse our available properties and submit a booking request with your preferred dates and contact details. Our team will check availability and contact you to confirm the next steps.', 1, 1),
('guest', 'Is my booking confirmed when I send a request?', 'No. A request is an enquiry only. Your reservation is confirmed after our team has checked availability and explicitly confirmed the booking with you.', 2, 1),
('guest', 'Can I book for a month or longer?', 'Many stays can accommodate extended visits. Share your dates and requirements so we can confirm the suitable options and rates.', 3, 1),
('guest', 'What is included in the apartment?', 'Each listing describes its amenities. If something specific matters to your stay, please ask us before confirming.', 4, 1),
('guest', 'How do I check in?', 'Arrival instructions and access details are shared once your reservation is confirmed.', 5, 1),
('guest', 'Can I change my dates?', 'Please contact us as soon as possible. Changes depend on availability and the terms agreed for your reservation.', 6, 1),
('owner', 'What does property management include?', 'Services can include listing set-up, pricing support, guest communication, check-in and check-out coordination, cleaning and maintenance coordination, reviews and booking-channel management. The scope is agreed with each owner.', 1, 1),
('owner', 'Do you manage Airbnb and Booking.com listings?', 'We can discuss management across Airbnb, Booking.com and other relevant channels, depending on your property and the agreed scope.', 2, 1),
('owner', 'How are fees calculated?', 'Fees and any additional operating costs are discussed transparently during the property assessment and documented before work begins.', 3, 1),
('owner', 'Can I still use my property personally?', 'Owner stays and calendar blocks can be discussed as part of the management plan. Dates must be coordinated with existing reservations.', 4, 1),
('owner', 'How do you handle repairs?', 'We coordinate maintenance according to the agreed process and approval limits. Larger or unexpected costs should be discussed with the owner.', 5, 1),
('owner', 'How do I get started?', 'Send an enquiry through our property management form. We’ll learn about your property and arrange a conversation about your goals.', 6, 1);

-- ------------------------------------------------------------ extra services
-- Not in the concept; placeholders until Sophiah supplies the real list.

INSERT INTO extra_services (title, description, image_r2_key, sort_order, is_published) VALUES
('Airport transfers', 'A trusted driver waiting when you land, so your stay starts calmly.', 'properties/99511b3e10153857cdb6eecad2e9370f.webp', 1, 1),
('Weekly housekeeping', 'Fresh linens and a tidy home, scheduled around your plans.', 'properties/11f3f516ba42dded022c86e0c984034d.webp', 2, 1),
('Pre-arrival groceries', 'Arrive to a stocked kitchen with the essentials you asked for.', 'properties/eebdee560cb8975cd6d25f8ec262d92d.webp', 3, 1);

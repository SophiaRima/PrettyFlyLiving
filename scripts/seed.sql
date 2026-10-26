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
 'Airport pick-up and drop-off can be arranged at an additional cost. Longer stays come with special discounts, complimentary cleaning, and free early check-in and late check-out when available.
Please note that a new building is going up on the next plot, so there may be construction noise during working hours: Monday to Friday from about 9am to 5pm, and Saturday from 9am to about 2pm. There is no work on Sundays, and the digging stage is expected to finish soon.
Check-in and check-out: Check in after 3:00 PM and check out before 10:00 AM. Self check-in with a lockbox.
House rules: Only 1 overnight guest. No pets (service animals only). No smoking, including vaping and e-cigarettes. Quiet hours are 11:00 PM to 7:00 AM. No parties or events. Commercial photography and filming are allowed. Please lock up at check-out.
During your stay: Please keep your key and fob safe. A replacement fee applies if the key or fob is lost, damaged or not returned at check-out. Please be respectful of your neighbours and keep noise to a minimum, especially during quiet hours.
Safety & property: Exterior security cameras cover the shared pathways, lifts, gate and other shared spaces. No carbon monoxide or smoke alarm has been reported for the apartment, so you may want to bring a portable detector.',
 0, 1, 1, 60000, 30,
 '["Fast Wi-Fi","Ethernet connection","Smart TV","Free secure parking","Shared heated pool (seasonal)","Shared gym","Games room","Courtyard garden","Rooftop terrace","Coffee shop in the building","Lift","24/7 security","Doorman and reception","Security cameras in shared areas","Self check-in with lockbox","Luggage drop-off","Housekeeping twice a week","Microwave","Mini fridge","Kettle","Coffee","Dishes and cutlery","Wine glasses","Hot water","Shampoo, body soap and shower gel","Bidet","Towels, bed linen and toilet paper","Extra pillows and blankets","Wardrobe and hangers","Iron","Clothes drying rack","Cleaning products","Books and reading material","Laundromat nearby"]',
 1, 1, 0);

INSERT INTO property_photos (property_id, r2_key, alt, width, height, sort_order) VALUES
(1, 'properties/9f63fde530f12b33a0698e8cc549aede.webp', 'Heated pool in the building', 1200, 554, 0),
(1, 'properties/84afa3f201a4bccb9f88630a7da67c3d.webp', 'Bed by the window in the afternoon light', 924, 2000, 1),
(1, 'properties/6a803b346d43f3e2e9942d9d564087ff.webp', 'The studio, with the bed, smart TV, mini fridge and microwave', 1200, 1600, 2),
(1, 'properties/3f33fffaadbe51f07fdb55ba337fcd25.webp', 'Bathroom sink with a lit mirror and shelves', 924, 2000, 3),
(1, 'properties/2c8a99b0845107df9bf56bf9aca8e4b2.webp', 'Courtyard garden with seating', 1200, 554, 4),
(2, 'properties/fef864218620e55ca618464d69755e42.webp', 'City view over Kilimani from the window', 924, 2000, 0),
(2, 'properties/6f74c2c7ffdcea2cfc28b5494f1900b3.webp', 'Fully equipped gym in the building', 960, 1280, 1),
(2, 'properties/45dbd32b3e70ba9014888a1b7bd7de75.webp', 'Smart TV, desk and mini fridge at the foot of the bed', 924, 2000, 2),
(2, 'properties/97ca53928501f550e43c020c3d9041a8.webp', 'Shower with a hand-held shower head', 925, 2000, 3),
(2, 'properties/13e3fc0852980bc946109f6f3dd94cc4.webp', 'Lift lobby on the building''s 15th floor', 1066, 1599, 4),
(3, 'properties/7b95f0e55a812ded97ecdbf61cb1c9d4.webp', 'Desk, smart TV and kitchenette corner', 1200, 1600, 0),
(3, 'properties/37b3c730c2e917382cc790dfc432ae7e.webp', 'Made-up bed with a cushion and woven throw', 924, 2000, 1),
(3, 'properties/eebdee560cb8975cd6d25f8ec262d92d.webp', 'Kettle, glasses and dishes on the kitchenette shelves', 924, 2000, 2),
(3, 'properties/fe18945513d382d939d98112088008ef.webp', 'Bedside table by the window', 924, 2000, 3),
(3, 'properties/f343282c4dc9d5d973be06e489929abb.webp', 'Shower room with a glass screen, toilet and sink', 924, 2000, 4),
(4, 'properties/2c8a99b0845107df9bf56bf9aca8e4b2.webp', 'Courtyard garden with seating', 1200, 554, 0),
(4, 'properties/2af83536ab9660a1d734ce3009724674.webp', 'Bed and bedside table under the window', 1200, 1600, 1),
(4, 'properties/db751fa63b7c2d8fbb64ca38d935b7ba.webp', 'Microwave on top of the mini fridge', 924, 2000, 2),
(4, 'properties/11f3f516ba42dded022c86e0c984034d.webp', 'Fresh towels and bed linen', 1208, 2000, 3),
(4, 'properties/a68b1dd8e013ab53d28a21b80b5954ef.webp', 'Shared games room with a pool table', 1200, 554, 4),
(5, 'properties/501c750f8e22a11f4ccdf0fd729cff5b.webp', 'Work desk and chair with shelves and the smart TV', 924, 2000, 0),
(5, 'properties/462807ae4a3185d8601505c967f2a0b3.webp', 'Bed with rolled towels and a city view', 900, 2000, 1),
(5, 'properties/8f6ae1e90d34434a88eeb9b6e8060696.webp', 'Wardrobe with hangers and an iron', 924, 2000, 2),
(5, 'properties/79f0175babb6f41f161e7aa7796f71a9.webp', 'Wooden desk chair and wall desk', 924, 2000, 3),
(5, 'properties/99511b3e10153857cdb6eecad2e9370f.webp', 'Secure basement parking', 1599, 1066, 4),
(6, 'properties/710e6c7bf7331292f374562d7933d6f1.webp', 'Heated pool with floor-to-ceiling windows', 1200, 554, 2),
(6, 'properties/40b00effbb1dc1c89efe7623591d1bc2.webp', 'Single bed with fresh towels beside the window', 1249, 2000, 1),
(6, 'properties/24609267507fca55f35d23456a6b6ea1.webp', 'Games room with pool and table tennis tables', 1200, 554, 0),
(6, 'properties/d28b9cd9e64dbf42ea450150a3d8f9f5.webp', 'Mini fridge with a freezer compartment', 924, 2000, 3),
(6, 'properties/13ee750e71939f8a291c715ce8c34a70.webp', 'Entrance hall leading into the studio', 1080, 1620, 4),
(7, 'properties/54a8bd1e95de36377bcdd8e789d5ac7b.webp', 'Small double bed by the window with fresh towels', 1086, 1448, 0),
(7, 'properties/6a803b346d43f3e2e9942d9d564087ff.webp', 'The studio, with the bed, smart TV, mini fridge and microwave', 1200, 1600, 1),
(7, 'properties/fef864218620e55ca618464d69755e42.webp', 'City view over Kilimani from the window', 924, 2000, 2),
(7, 'properties/501c750f8e22a11f4ccdf0fd729cff5b.webp', 'Work desk and chair with shelves and the smart TV', 924, 2000, 3),
(7, 'properties/9f63fde530f12b33a0698e8cc549aede.webp', 'Heated pool in the building', 1200, 554, 4),
(7, 'properties/f343282c4dc9d5d973be06e489929abb.webp', 'Shower room with a glass screen, toilet and sink', 924, 2000, 5),
(7, 'properties/7b95f0e55a812ded97ecdbf61cb1c9d4.webp', 'Desk, smart TV and kitchenette corner', 1200, 1600, 6),
(7, 'properties/6f74c2c7ffdcea2cfc28b5494f1900b3.webp', 'Fully equipped gym in the building', 960, 1280, 7),
(7, 'properties/2c8a99b0845107df9bf56bf9aca8e4b2.webp', 'Courtyard garden with seating', 1200, 554, 8),
(7, 'properties/a68b1dd8e013ab53d28a21b80b5954ef.webp', 'Shared games room with a pool table', 1200, 554, 9),
(7, 'properties/37b3c730c2e917382cc790dfc432ae7e.webp', 'Made-up bed with a cushion and woven throw', 924, 2000, 10),
(7, 'properties/84afa3f201a4bccb9f88630a7da67c3d.webp', 'Bed by the window in the afternoon light', 924, 2000, 11),
(7, 'properties/2af83536ab9660a1d734ce3009724674.webp', 'Bed and bedside table under the window', 1200, 1600, 12),
(7, 'properties/462807ae4a3185d8601505c967f2a0b3.webp', 'Bed with rolled towels and a city view', 900, 2000, 13),
(7, 'properties/11f3f516ba42dded022c86e0c984034d.webp', 'Fresh towels and bed linen', 1208, 2000, 14),
(7, 'properties/45dbd32b3e70ba9014888a1b7bd7de75.webp', 'Smart TV, desk and mini fridge at the foot of the bed', 924, 2000, 15),
(7, 'properties/79f0175babb6f41f161e7aa7796f71a9.webp', 'Wooden desk chair and wall desk', 924, 2000, 16),
(7, 'properties/fe18945513d382d939d98112088008ef.webp', 'Bedside table by the window', 924, 2000, 17),
(7, 'properties/eebdee560cb8975cd6d25f8ec262d92d.webp', 'Kettle, glasses and dishes on the kitchenette shelves', 924, 2000, 18),
(7, 'properties/db751fa63b7c2d8fbb64ca38d935b7ba.webp', 'Microwave on top of the mini fridge', 924, 2000, 19),
(7, 'properties/d28b9cd9e64dbf42ea450150a3d8f9f5.webp', 'Mini fridge with a freezer compartment', 924, 2000, 20),
(7, 'properties/8f6ae1e90d34434a88eeb9b6e8060696.webp', 'Wardrobe with hangers and an iron', 924, 2000, 21),
(7, 'properties/3f33fffaadbe51f07fdb55ba337fcd25.webp', 'Bathroom sink with a lit mirror and shelves', 924, 2000, 22),
(7, 'properties/97ca53928501f550e43c020c3d9041a8.webp', 'Shower with a hand-held shower head', 925, 2000, 23),
(7, 'properties/710e6c7bf7331292f374562d7933d6f1.webp', 'Heated pool with floor-to-ceiling windows', 1200, 554, 24),
(7, 'properties/24609267507fca55f35d23456a6b6ea1.webp', 'Games room with pool and table tennis tables', 1200, 554, 25),
(7, 'properties/922cd64a6a7bfa5c27662e7cbe3816d0.webp', 'Front door of the studio', 924, 2000, 26),
(7, 'properties/13ee750e71939f8a291c715ce8c34a70.webp', 'Entrance hall leading into the studio', 1080, 1620, 27),
(7, 'properties/3fc03fe9ca39d5c0fb473531570b9d80.webp', 'Home fragrance diffuser on a shelf', 924, 2000, 28),
(7, 'properties/13e3fc0852980bc946109f6f3dd94cc4.webp', 'Lift lobby on the building''s 15th floor', 1066, 1599, 29),
(7, 'properties/99511b3e10153857cdb6eecad2e9370f.webp', 'Secure basement parking', 1599, 1066, 30);

-- No blocked dates are seeded: Sophiah blocks dates herself in the dashboard.

-- ------------------------------------------------------------------- reviews

-- The listing's real Airbnb reviews, word for word. The 4- and 3-star ones
-- are seeded unpublished; Sophiah can publish them from /admin/reviews.
INSERT INTO reviews (guest_name, context, body, rating, property_id, is_featured, sort_order, is_published) VALUES
('Nelson', 'Stayed a few nights · Airbnb review', 'The place was incredibly neat, comfortable, and honestly even better than the pictures and description suggest; they simply don’t do it justice. The host was very responsive, collaborative, and easy to communicate with, which made the whole experience even better. I would definitely recommend the place.', 5, 7, 1, 1, 1),
('Jack', 'Stayed one night · Airbnb review', 'Great little place. Extremely clean. Bathroom was really good. Had a smart TV. It is small but it is very fit for purpose and personally I thought it was great. Especially for shorter term stays. Would 100% return. Great communication and easy check in also! Very secure place', 5, 7, 0, 2, 1),
('Alisha', 'Stayed a few nights · Airbnb review', 'Lovely stay! Sophiah was great and very responsive. The flat was cozy and clean, and I felt very safe', 5, 7, 0, 3, 1),
('Patrick', 'Stayed one night · Airbnb review', 'Incredibly nice place, comfortable bed and the host is superb. Great value for money!', 5, 7, 0, 4, 1),
('Faris', 'Stayed a few nights · Airbnb review', 'Great view in a great location. I will come back for sure.', 5, 7, 0, 5, 1),
('Mike', 'Stayed a few nights · Airbnb review', 'Lovely place, great location, and an excellent host. Would definitely come back', 5, 7, 0, 6, 1),
('Jonan', 'Stayed a few nights · Airbnb review', 'Its a small beautiful place. Sophiah responds promptly and is understanding', 5, 7, 0, 7, 1),
('Abel', 'Stayed a few nights · Airbnb review', 'The Place is so nice,safe,Privacy and cost effective ,but also the Host Sophia is very proactive in Communications,even the receptionist at a gate they are so helpfully the moment i needed assistance,i really recommend for those people who are expecting to visit to Nairobi to check for this Appartment.', 5, 7, 0, 8, 1),
('Pauline', 'Stayed a few nights · Airbnb review', 'Sophiahs place is exactly as described,very cozy suitable for an individual who needs access to all parts of Nairobi.The building is in a really nice neighborhood,near yaya center and other shopping centers. Sophiah is very responsive and I appreciate the late check out and early check in . The construction going on in the next lot is noisy but they do work within a set amount of hours . Thank you for a wonderful stay', 5, 7, 0, 9, 1),
('Yohan', 'Airbnb review', 'There is construction going on the side of the building a lot of noise', 4, 7, 0, 10, 0),
('Lailah', 'Stayed a few nights · Airbnb review', 'This dsq room is as described and fit for 1 person staying a short time, comfortable and clean. Its located near yaya shopping centre and the building is easy to get to. Be careful walking in the area at night as its not well lit and could be targetted and mugged. Instructions to get in were not clear nut once we reached out to Sophiah, she quickly gave us the information we needed. Thank you Sophiah for hosting me!', 3, 7, 0, 11, 0);

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
((SELECT id FROM guides WHERE slug = 'a-taste-of-nairobi'), 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=800&q=80', 'Shared plates at a Nairobi table', 1),
((SELECT id FROM guides WHERE slug = 'a-taste-of-nairobi'), 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80', 'Freshly prepared dishes', 2),
((SELECT id FROM guides WHERE slug = 'a-taste-of-nairobi'), 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80', 'A relaxed restaurant interior', 3),
((SELECT id FROM guides WHERE slug = 'a-taste-of-nairobi'), 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80', 'Open-air terrace dining', 4),
((SELECT id FROM guides WHERE slug = 'the-city-after-dark'), 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80', 'A cocktail on the bar', 1),
((SELECT id FROM guides WHERE slug = 'the-city-after-dark'), 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=80', 'A drink being poured', 2),
((SELECT id FROM guides WHERE slug = 'the-city-after-dark'), 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=800&q=80', 'Bartender at work', 3),
((SELECT id FROM guides WHERE slug = 'the-city-after-dark'), 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80', 'Live music on stage', 4),
((SELECT id FROM guides WHERE slug = 'wildlife-close-to-home'), 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=800&q=80', 'Giraffe at sunset', 1),
((SELECT id FROM guides WHERE slug = 'wildlife-close-to-home'), 'https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=800&q=80', 'Elephant in the bush', 2),
((SELECT id FROM guides WHERE slug = 'wildlife-close-to-home'), 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80', 'Game drive across the plains', 3),
((SELECT id FROM guides WHERE slug = 'wildlife-close-to-home'), 'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?auto=format&fit=crop&w=800&q=80', 'Savanna and distant mountains', 4),
((SELECT id FROM guides WHERE slug = 'a-local-shopping-edit'), 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80', 'An independent shop', 1),
((SELECT id FROM guides WHERE slug = 'a-local-shopping-edit'), 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80', 'Browsing a clothing rail', 2),
((SELECT id FROM guides WHERE slug = 'a-local-shopping-edit'), 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80', 'Shopping bags after a day out', 3),
((SELECT id FROM guides WHERE slug = 'a-local-shopping-edit'), 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80', 'Handmade craft supplies', 4),
((SELECT id FROM guides WHERE slug = 'make-a-day-of-it'), 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=800&q=80', 'Hiking through green hills', 1),
((SELECT id FROM guides WHERE slug = 'make-a-day-of-it'), 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80', 'Walkers on a mountain trail', 2),
((SELECT id FROM guides WHERE slug = 'make-a-day-of-it'), 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80', 'A quiet forest path', 3),
((SELECT id FROM guides WHERE slug = 'make-a-day-of-it'), 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80', 'Sunset over the plains', 4),
((SELECT id FROM guides WHERE slug = 'arts-culture-and-more'), 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=800&q=80', 'An evening event', 1),
((SELECT id FROM guides WHERE slug = 'arts-culture-and-more'), 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80', 'Concert crowd and lights', 2),
((SELECT id FROM guides WHERE slug = 'arts-culture-and-more'), 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80', 'Audience at a performance', 3),
((SELECT id FROM guides WHERE slug = 'arts-culture-and-more'), 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=800&q=80', 'Colourful contemporary art', 4);

-- ---------------------------------------------------------------------- faqs

INSERT INTO faqs (audience, question, answer, sort_order, is_published) VALUES
('guest', 'How do I book a stay through Pretty Fly Living?', 'Browse our collection of properties, choose an apartment that suits your needs and submit a booking enquiry with your preferred dates. You can expect a response from our team within one hour. We’ll confirm availability, share the applicable rates and guide you through the booking process. Your reservation is confirmed once all booking requirements have been completed and confirmation has been issued.', 1, 1),
('guest', 'What is the minimum length of stay?', 'Pretty Fly Living specialises in furnished accommodation for extended stays, with a minimum booking of 30 consecutive nights. Whether you’re looking for a temporary home or accommodation for a longer period, our apartments are designed to provide a comfortable and convenient place to settle in.', 2, 1),
('guest', 'What is included in the monthly price?', 'Inclusions vary by property. Each listing provides details about the amenities, utilities, cleaning arrangements and any additional charges. Before confirming your booking, we’ll clarify the applicable rate and what’s included so you can plan your stay with confidence.', 3, 1),
('guest', 'What are the check-in and check-out times?', 'Check-in and check-out times vary by property and will be communicated as part of your booking details. Early check-in or late check-out may be available on request, subject to availability and any applicable additional charges.', 4, 1),
('guest', 'Is cleaning included during my stay?', 'Cleaning arrangements depend on the property. Some apartments include complimentary housekeeping at scheduled intervals. Your property listing or booking confirmation will specify the cleaning frequency. Additional cleaning may also be available on request, potentially at an extra cost.', 5, 1),
('guest', 'Are Wi-Fi, electricity and water included?', 'Inclusions vary by apartment. Please check the property listing for details about Wi-Fi, electricity, water and other utilities. We’ll clarify any applicable usage limits or additional charges before your booking is confirmed.', 6, 1),
('guest', 'How do I access the property when I arrive?', 'We’ll share your check-in instructions before arrival. Depending on the property, access may be arranged using a key, access code, key fob or another agreed method. Please review the instructions carefully and contact us if you need assistance.', 7, 1),
('guest', 'What is your cancellation and refund policy?', 'Cancellation and refund terms depend on the booking conditions applicable to your reservation. Please review these terms before completing your booking. If your plans change, contact us as soon as possible so we can explain the options available under your booking terms.', 8, 1),
('guest', 'Can you arrange airport transfers or local experiences?', 'Yes. We can help arrange optional airport pickups and drop-offs, as well as personalised experiences through our Nairobi, With a Local service. These services must be arranged in advance, are subject to availability and may incur additional charges. Contact us during your booking enquiry to discuss the options.', 9, 1),
('guest', 'Who can I contact if I need assistance during my stay?', 'Our team is available to assist with stay-related questions and coordinate the resolution of issues that arise. You’ll receive the relevant contact details and instructions with your booking information. Please contact us promptly if anything needs attention during your stay.', 10, 1),
('owner', 'What property management services do you offer?', 'We provide hands-on support across the key areas of furnished rental management, including listing creation and optimisation, pricing, booking management, guest communication, cleaner sourcing, housekeeping coordination, property inspections and maintenance coordination. We also market suitable properties through the Pretty Fly Living direct-booking website, helping owners reach potential guests while keeping their properties well managed.', 1, 1),
('owner', 'Do you manage properties with just one unit?', 'Absolutely. We work with individual property owners as well as those with multiple units. Whether you own a single studio, a one-bedroom apartment or a portfolio of properties with different layouts, we’d love to hear from you. We discuss your needs and the level of management support that best suits your property.', 2, 1),
('owner', 'Where will my property be listed?', 'Pretty Fly Living is at the heart of our listing and distribution strategy. Suitable properties are featured on our direct-booking website, where guests can discover available stays and make booking enquiries. We may also list properties on platforms such as Airbnb, Booking.com and Vrbo to expand their reach and connect with a wider audience. Our aim is to grow Pretty Fly Living as a destination for discovering and booking quality stays, while using other platforms strategically to support property visibility.', 3, 1),
('owner', 'Can I choose only the services I need?', 'We can discuss a management arrangement based on your property’s requirements. Whether you need comprehensive property management and co-hosting or support with specific services such as listing optimisation, pricing, guest communication or housekeeping coordination, we’ll work with you to establish a suitable scope of work.', 4, 1),
('owner', 'How much do your property management services cost?', 'Our fees depend on factors such as the number of units, the property requirements and the level of management involved. We discuss the applicable fees, services and responsibilities with you before proceeding, so you understand what is included and how the arrangement will work.', 5, 1),
('owner', 'How do you determine pricing for my property?', 'We consider factors such as location, comparable properties, amenities, seasonality and booking demand when recommending rates. We also review pricing and listing performance to identify opportunities to improve your property’s market positioning and work towards stronger occupancy and revenue across Pretty Fly Living and other relevant booking channels.', 6, 1),
('owner', 'Can you guarantee bookings or a specific monthly income?', 'We cannot guarantee a particular number of bookings or level of income. Performance depends on factors such as location, property condition, pricing, competition and market demand. Our focus is on presenting your property effectively, reaching potential guests through Pretty Fly Living and other suitable channels, and making informed management decisions to support its performance.', 7, 1),
('owner', 'Who handles cleaning and property maintenance?', 'We help source and coordinate suitable cleaners, schedule housekeeping and organise property preparation between stays, with a focus on keeping your property clean and guest-ready. We also coordinate maintenance and repairs with relevant service providers where needed. Cleaning arrangements, repair costs and approval procedures are agreed with you in advance.', 8, 1),
('owner', 'Will I retain control over my property?', 'Yes. You remain the owner of your property. Before management begins, we agree on our responsibilities, spending limits, approval requirements and communication arrangements. We keep you informed about important operational matters and consult you on decisions outside the authority agreed upon.', 9, 1),
('owner', 'How do I get started with Pretty Fly Living?', 'Complete our Property Management Enquiry Form with your contact details, property information and the services you’re interested in. We’ll review your enquiry and get in touch to discuss your property, your goals, and how it could fit into the Pretty Fly Living portfolio.', 10, 1);

-- ------------------------------------------------------------ extra services
-- Client copy (2026-10). Photos are free-licence Unsplash images in seed-media/services/.

INSERT INTO extra_services (eyebrow, title, description, details, cta_label, image_r2_key, image_width, image_height, sort_order, is_published) VALUES
(NULL, 'Airport Transfers', 'Start and end your journey with less hassle. We can arrange reliable airport pickups and drop-offs to get you between the airport and your accommodation comfortably.', 'Available on request · Additional charges apply', 'Enquire about airport transfers', 'services/9a5f02fcfda665a986d2b43de76d3f7b.webp', 2000, 1186, 1, 1),
('See the city differently', 'Nairobi, With a Local', 'Discover Nairobi with someone who knows the city. From local food spots and cultural attractions to wildlife, markets and hidden gems, enjoy a personalised day shaped around your interests.', 'Personalised experiences · Advance booking required', 'Explore the experience', 'services/41100b61f1e10dd527789ba16f43a7f0.webp', 2000, 1333, 2, 1),
(NULL, 'Extra Cleaning and Laundry', 'Arrange additional housekeeping or laundry assistance when you need a little extra convenience beyond what is included in your stay.', 'Available on request · Additional charges may apply', 'Enquire about cleaning and laundry', 'services/4587825388d7e92e10cfa9cc501e4489.webp', 2000, 1333, 3, 1);

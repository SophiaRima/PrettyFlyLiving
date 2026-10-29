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
-- The six Nairobi guides are the real articles from guides-production.sql,
-- with Wikimedia Commons and Unsplash photos in seed-media/guides/ (credited
-- at the end of each guide).

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
('Nelson', NULL, 'The place was incredibly neat, comfortable, and honestly even better than the pictures and description suggest; they simply don’t do it justice. The host was very responsive, collaborative, and easy to communicate with, which made the whole experience even better. I would definitely recommend the place.', 5, 7, 1, 1, 1),
('Jack', NULL, 'Great little place. Extremely clean. Bathroom was really good. Had a smart TV. It is small but it is very fit for purpose and personally I thought it was great. Especially for shorter term stays. Would 100% return. Great communication and easy check in also! Very secure place', 5, 7, 0, 2, 1),
('Alisha', NULL, 'Lovely stay! Sophiah was great and very responsive. The flat was cozy and clean, and I felt very safe', 5, 7, 0, 3, 1),
('Patrick', NULL, 'Incredibly nice place, comfortable bed and the host is superb. Great value for money!', 5, 7, 0, 4, 1),
('Faris', NULL, 'Great view in a great location. I will come back for sure.', 5, 7, 0, 5, 1),
('Mike', NULL, 'Lovely place, great location, and an excellent host. Would definitely come back', 5, 7, 0, 6, 1),
('Jonan', NULL, 'Its a small beautiful place. Sophiah responds promptly and is understanding', 5, 7, 0, 7, 1),
('Abel', NULL, 'The Place is so nice,safe,Privacy and cost effective ,but also the Host Sophia is very proactive in Communications,even the receptionist at a gate they are so helpfully the moment i needed assistance,i really recommend for those people who are expecting to visit to Nairobi to check for this Appartment.', 5, 7, 0, 8, 1),
('Pauline', NULL, 'Sophiahs place is exactly as described,very cozy suitable for an individual who needs access to all parts of Nairobi.The building is in a really nice neighborhood,near yaya center and other shopping centers. Sophiah is very responsive and I appreciate the late check out and early check in . The construction going on in the next lot is noisy but they do work within a set amount of hours . Thank you for a wonderful stay', 5, 7, 0, 9, 1),
('Yohan', NULL, 'There is construction going on the side of the building a lot of noise', 4, 7, 0, 10, 0),
('Lailah', NULL, 'This dsq room is as described and fit for 1 person staying a short time, comfortable and clean. Its located near yaya shopping centre and the building is easy to get to. Be careful walking in the area at night as its not well lit and could be targetted and mugged. Instructions to get in were not clear nut once we reached out to Sophiah, she quickly gave us the information we needed. Thank you Sophiah for hosting me!', 3, 7, 0, 11, 0);

-- -------------------------------------------------------------------- guides
-- The same six guides as scripts/guides-production.sql, published locally.

INSERT INTO guides (slug, title, category, excerpt, cover_r2_key, cover_width, cover_height, highlights, body_md, is_featured, sort_order, is_published) VALUES
('wildlife-close-to-home', 'Wildlife close to home', 'Attractions',
 'Rhinos, baby elephants and giraffes, all within a short drive of the city centre.',
 'guides/b6c298f3faa5a6ea41c3943bd26cd548.webp', 1600, 1067,
 '["Nairobi National Park","Baby elephants","Giraffe Centre"]',
 'Few cities let you watch rhinos graze with office towers on the horizon. Nairobi’s wildlife is close enough for a morning out, with time to be back for lunch.

## Nairobi National Park

The park begins at the edge of the city, with its main gate on Langata Road. Open plains and acacia scrub are home to rhinos, giraffes, zebras, buffalo and plenty of birdlife, and the skyline makes the backdrop unlike any other safari.

The easiest way in is a game drive with a driver or guide. Park entry fees are set by the [Kenya Wildlife Service](https://kws.go.ke/) and are paid online through eCitizen, so sort them out before you set off.

## Sheldrick Wildlife Trust nursery

Inside the park, the Trust raises orphaned elephants and, now and then, rhinos. During the public visit you watch the keepers bring the youngest elephants out for their milk feeds and a mud bath, and hear each one’s story.

- The public visit runs every day except 25 December, from 11am to 12 noon.
- It is by advance booking only, made by email with the Trust’s Nairobi office. Allow at least two business days for a reply, and ignore third-party booking sites, which the Trust doesn’t accept.
- The entry donation is paid in cash on arrival, and Nairobi National Park fees apply on top.

Everything you need is on the Trust’s [nursery visit page](https://www.sheldrickwildlifetrust.org/nursery-visit).

## Giraffe Centre

In Lang’ata, the [Giraffe Centre](https://giraffecentre.org/) lets you meet its giraffes eye to eye from a raised feeding platform. Stay for a short talk on giraffes and conservation, walk the nature trail, and stop at the Tea House.

It is open from 9am to 5pm every day, including weekends and public holidays. Payment is by M-Pesa, Visa or Mastercard.

## Make a morning of it

The nursery and the Giraffe Centre are both on the Lang’ata side of the city, so they pair well: the elephants at 11, then the giraffes after lunch. Arrive early at the park gate, as the nursery visit starts on time.

Times and fees change from season to season, so check each official site before you go. Prefer to go with someone who knows the way? Ask us about Nairobi, With a Local.

## Photo credits

- Rhinos grazing in Nairobi National Park: Brihaspati on [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Rhino%27s_images_clicked_in_Nairobi_National_Park_10.jpg), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0)
- Visitors feeding giraffes from the platform at the Giraffe Centre: Noroi on [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Feedings_at_Giraffe_Centre_Nairobi_2025.jpg), [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en)
- Orphaned baby elephants running to their keepers at the Sheldrick nursery: U.S. Department of State on [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:A_Group_of_Baby_Elephants_Race_for_Food_from_Caretakers_at_the_Sheldrick_Elephant_Orphanage_(16737778013).jpg), public domain
- A keeper bottle-feeding a baby elephant at the Sheldrick nursery: U.S. Department of State on [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:A_Caretakers_Feeds_a_Baby_Elephant_at_the_Sheldrick_Elephant_Orphanage_(16735530794).jpg), public domain
- A giraffe up close on a path at the Giraffe Centre: GioRan on [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Giraffe_at_Giraffe_Centre_Nairobi,_Kenya.jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0)',
 1, 1, 1),
('make-a-day-of-it', 'Make a day of it', 'Activities',
 'Forest trails, a ridge-top hike and green spaces for a slower Nairobi day.',
 'guides/38d4ca2a5373c39a5cd380c417812e97.webp', 1600, 739,
 '["Karura Forest","Ngong Hills hike","Nairobi Arboretum"]',
 'Nairobi is greener than most visitors expect. These are our favourite ways to swap the city for trees, trails and a wide-open view.

## Karura Forest

On the city’s northern edge, Karura is a protected forest looked after by the Kenya Forest Service and the community group [Friends of Karura](https://friendsofkarura.org/essential-information/). Well-marked trails wind through the trees for walking, running and cycling, and the favourite route leads to a waterfall and caves along the river.

- The forest opens daily from 6am. The last tickets are sold at 5:30pm and the exit gates close by 7pm.
- Entry is paid by M-Pesa through eCitizen.
- Pick up a trail map at the gate, and wear shoes you don’t mind getting muddy after rain.

## Ngong Hills

The Ngong Hills rise south-west of the city, and walking their grassy ridge is one of the classic Nairobi day hikes. On a clear day you see the Rift Valley falling away on one side and the city on the other, with wind turbines turning along the top.

Start early, before the midday heat, and bring water, sun cream and a warm layer for the wind. We recommend going with a guide or a group rather than alone.

## Nairobi Arboretum

For something gentler, the Arboretum is a short drive from Kilimani: shaded paths under tall trees, a lawn for a picnic, and birdsong a world away from the traffic. It is a good choice for an unhurried morning or a run.

## Before you go

Check the weather and the latest opening times, and plan your transport home before you set off. Want a day planned around what you enjoy? Ask us about Nairobi, With a Local.

## Photo credits

- Morning light on a trail in Karura Forest: Queen Asali on [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Karura_Forest-Nairobi.jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0)
- Rapids on the river in Karura Forest: Amr F.Nagy on [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Karura_Forest_(58070).jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0)
- A hiker on the grassy ridge of the Ngong Hills: Petersoleeh on [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Ngong_Hills_Hike.jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0)
- Wind turbines along the top of the Ngong Hills: safaritravelplus on [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Ngong_Hills_Photo.jpg), [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en)
- A shaded path in the Nairobi Arboretum: Ahero dala on [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Nairobi_Arboretum_Park_09.JPG), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0)',
 1, 2, 1),
('a-taste-of-nairobi', 'A taste of Nairobi', 'Food',
 'Nyama choma, chapati and a famous charcoal pit: where to start with Kenyan food.',
 'guides/c2d9fc0583d12cd38eec596332a66940.webp', 1600, 1200,
 '["Nyama choma","Carnivore","Kenyan staples"]',
 'Kenyan food is generous, unfussy and made for sharing. Here is where to start.

## The Kenyan table

- **Nyama choma** means grilled meat, usually goat or beef. It is a weekend ritual, ordered by weight, brought to the table on a board, and shared with friends.
- **Ugali** is a firm maize-meal staple, eaten by hand with stews, greens or nyama choma.
- **Sukuma wiki** is sautéed collard greens, the everyday side for almost everything.
- **Chapati** is a soft, layered flatbread, perfect with a bean or beef stew.
- **Kachumbari** is a fresh tomato and onion salad that cuts through grilled meat.

## Carnivore

Nairobi’s best-known meat restaurant is an experience as much as a meal. At [Carnivore](https://www.tamarind.co.ke/locations/carnivore), meats are roasted on traditional Maasai swords over a huge charcoal pit at the entrance, then carved at your table onto hot cast-iron plates.

The fixed-price meal includes soup, salads, vegetable sides, sauces, dessert and coffee, and there is a vegetarian menu too. Book ahead for dinner, especially at weekends.

## Coffee and brunch

Kenya grows some of the world’s most celebrated coffee, and Nairobi has no shortage of cafés to drink it in, many of them around Kilimani, Westlands and Karen. Ask us for our current favourites near your stay: they change faster than any guide can keep up with.

## Good to know

Opening hours and menus change, so check before you go. Card and M-Pesa payments are widely accepted, and a tip of around ten per cent is appreciated where service isn’t included.

## Photo credits

- Meat roasting on Maasai swords over the charcoal pit at Carnivore: khym54 on [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Meat_roasting_at_Carnivore_restaurant_in_Nairobi.jpg), [CC BY 2.0](https://creativecommons.org/licenses/by/2.0)
- Nyama choma, Kenyan grilled meat, fresh off the grill: safaritravelplus on [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Nyama_choma_barbeque.jpg), [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en)
- Ugali with creamed spinach: Queen Asali on [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Plate_of_ugali_with_creamed_spinach.jpg), [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en)
- A stack of freshly made chapati: safaritravelplus on [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Chapati_kenya.jpg), [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en)
- The roasting pit at Carnivore restaurant: Bahnfrend on [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Meat_roasting,_Carnivore,_2025_(01).jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0)',
 1, 3, 1),
('a-local-shopping-edit', 'A local shopping edit', 'Shopping',
 'Beadwork, carvings and handmade ceramics: where to find a little Nairobi to take home.',
 'guides/05987e9a8ef11a116bc26038a90ccc3f.webp', 1600, 1067,
 '["Maasai Market","Beadwork and carvings","Kazuri beads"]',
 'The best souvenirs from Nairobi are made by hand, and the city’s markets are where to find them.

## The Maasai Market

Despite the name, the Maasai Market is a travelling craft market that sets up in a different part of the city on different days of the week. Two of its regular stops are easy to reach:

- **Fridays** on the rooftop at the [Village Market](https://www.villagemarket-kenya.com/) in Gigiri.
- **Sundays** at Yaya Centre in Kilimani, a few minutes from Little Urban Nook.

The days and venues do change, so check the current schedule before you go.

## What to look for

- Beaded necklaces, bracelets and belts
- Shuka blankets in bold Maasai checks, and kikoy cloth
- Carved wooden bowls, spoons, masks and animals
- Soapstone dishes and sculptures
- Baskets and leather sandals

Bargaining is expected and part of the fun: start at around half the first price and settle somewhere in between, with a smile. Bring cash or M-Pesa.

## Kazuri beads

In Karen, Kazuri makes hand-shaped ceramic beads and pottery, painted and fired in its own workshop by local women artisans. Visitors can usually watch the beads being made before browsing the shop. It pairs well with a morning at the Giraffe Centre.

## Malls for everything else

For everyday shopping, Yaya Centre, The Junction and Prestige Plaza are all close to Kilimani, with supermarkets, pharmacies and cafés under one roof.

## Photo credits

- Maasai beaded necklaces at an open-air market in Nairobi: Queen Asali on [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Maasai_Beaded_Necklaces.jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0)
- The Maasai Market on the rooftop at the Village Market: Aliceinthealice on [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:The_Maasai_Markets_in_Nairobi_on_the_rooftop_at_The_Village_Market_03.jpg), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0)
- Shuka blankets and printed cloth on a Maasai Market stall: Wawerumacha on [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:The_Maasai_Market_Shukas.jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0)
- Carved wooden masks for sale in Nairobi: Ninaras on [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:African_masks_in_Nairobi_01.jpg), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0)
- Carved wooden bowls and spoons at a Nairobi market: Ninara on [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Shopping_in_Nairobi,_Kenya_(51949018030).jpg), [CC BY 2.0](https://creativecommons.org/licenses/by/2.0)',
 1, 4, 1),
('arts-culture-and-more', 'Arts, culture & more', 'Entertainment',
 'Museums, traditional dance and the stage: the creative side of Nairobi.',
 'guides/541bce556a6491944a733d5f96fb66a9.webp', 1600, 1200,
 '["Karen Blixen Museum","Bomas of Kenya","Kenya National Theatre","Nairobi National Museum"]',
 'Nairobi’s history and creativity are worth a day of their own. Start with these.

## Nairobi National Museum

On Museum Hill, a short drive from the city centre, the [Nairobi National Museum](https://museums.or.ke/nairobi-national-museum/) tells Kenya’s story through its natural history, cultures, art and early human finds. Leave time for the gardens around the museum.

## Karen Blixen Museum

At the foot of the Ngong Hills, the [Karen Blixen Museum](https://museums.or.ke/karen-blixen/) is the farmhouse at the centre of the Danish author’s coffee farm, made famous by *Out of Africa*. The house was built in 1912 and opened as a museum in 1986, run by the National Museums of Kenya.

Inside are furniture and belongings from the original household. Outside, old farm machinery stands in gardens with a short nature trail. Guided tours run throughout the day.

## Bomas of Kenya

In Langata, near the main gate of Nairobi National Park, [Bomas of Kenya](https://www.bomasofkenya.co.ke/) recreates the traditional homesteads of Kenya’s communities. Walk through the villages, then stay for the afternoon performance of traditional song and dance. Check the day’s show times before you go.

## Kenya National Theatre

On Harry Thuku Road, next to the University of Nairobi, the Kenya National Theatre stages plays, musicals and concerts by Kenyan and visiting companies. Check what’s on before you go, as programmes change from week to week.

## Good to know

Museums and venues set their own hours and fees, so check each official site before you go. Several of these places are in Karen and Langata, so they combine well with the Giraffe Centre or a visit to the elephants.

## Photo credits

- The Karen Blixen Museum farmhouse and lawn in Karen: Grenadille on [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Karen_Blixen_museum,_Karen,_Kenya.jpg), [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en)
- Tinga Tinga Tales: The Musical on stage at the Kenya National Theatre: Hilary Murugu on [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Tinga_Tinga_Tales_The_Musical_2018_at_The_Kenya_National_Theatre.jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0)
- A traditional Kamba homestead at Bomas of Kenya: Alexander Leisser on [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Kamba_village_01.jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0)
- A vintage tractor in the grounds of the Karen Blixen Museum: Alexander Leisser on [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Karen_blixen_museum_in_nairobi_kenya_05.jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0)
- The Luo village at Bomas of Kenya: Alexander Leisser on [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Luo_village_01.jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0)',
 0, 5, 1),
('the-city-after-dark', 'The city after dark', 'Nightlife',
 'Golden-hour drinks, live music and a good table: how to spend a Nairobi evening.',
 'guides/010fb668cb78c2eeb852bbb7be87b130.webp', 1600, 1000,
 '["Westlands","Rooftop drinks","Live music"]',
 'As the sun goes down, Nairobi settles into a long, easy evening. Whether you want a quiet drink with a view or a night of music, there is a corner of the city for it.

## Westlands

Westlands is the heart of Nairobi’s nightlife, with bars, restaurants, lounges and clubs within a few streets of each other. It is lively from the early evening, busiest at the weekend, and a short ride from Kilimani.

One local favourite is The Alchemist: an open-air space with food trucks, DJs and live music, closer to a night market than a nightclub.

## Drinks with a view

Several of the city’s hotels and newer towers have rooftop bars. Go for golden hour, when the light over the skyline is at its best, and stay for dinner.

## Closer to home

Kilimani has its own relaxed restaurants and lounges, many of them a short ride from Little Urban Nook, for evenings when you would rather not cross town.

## Getting home safely

- Use a ride-hailing app or a taxi you trust, and book your ride home before you leave.
- Avoid walking alone late at night, even for short distances.
- Carry a little cash as well as M-Pesa or a card.

Venues, events and opening hours change often, so check a venue’s own pages or social media before you head out.

## Photo credits

- Nairobi''s city centre lit up at dusk: Nbi101 on [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Nairobi_night_skyline_at_dusk_.jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0)
- A bar glowing with warm evening light: [Unsplash](https://unsplash.com/photos/1514933651103-005eec06c04b), Unsplash Licence
- A cocktail being served at the bar: [Unsplash](https://unsplash.com/photos/1514362545857-3bc16c4c7d1b), Unsplash Licence
- A band playing live music on a small stage: [Unsplash](https://unsplash.com/photos/1507676184212-d03ab07a01bf), Unsplash Licence
- The Nairobi skyline glowing at night: Antony Trivet on [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:IMAGES-1551_05.jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0)',
 0, 6, 1);

-- Gallery photos, shown after the cover (client revision: several photos per guide).
INSERT INTO guide_photos (guide_id, r2_key, alt, width, height, sort_order) VALUES
((SELECT id FROM guides WHERE slug = 'wildlife-close-to-home'), 'guides/a146157526ce2c716b7ac943f9ef86a6.webp', 'Visitors feeding giraffes from the platform at the Giraffe Centre', 1600, 1200, 1),
((SELECT id FROM guides WHERE slug = 'wildlife-close-to-home'), 'guides/1702bf96874dc22c04f9ce92db725400.webp', 'Orphaned baby elephants running to their keepers at the Sheldrick nursery', 1600, 1065, 2),
((SELECT id FROM guides WHERE slug = 'wildlife-close-to-home'), 'guides/fe58ba739c3c8f5477cea3b3925fc9ab.webp', 'A keeper bottle-feeding a baby elephant at the Sheldrick nursery', 1600, 1064, 3),
((SELECT id FROM guides WHERE slug = 'wildlife-close-to-home'), 'guides/aab9f8c8dc2b533ef19e487c2ec004c0.webp', 'A giraffe up close on a path at the Giraffe Centre', 1600, 902, 4),
((SELECT id FROM guides WHERE slug = 'make-a-day-of-it'), 'guides/44273d36732a516cd8fd3c67405954db.webp', 'Rapids on the river in Karura Forest', 1600, 1200, 1),
((SELECT id FROM guides WHERE slug = 'make-a-day-of-it'), 'guides/5addcaf1157b2004d2b1d7f150262198.webp', 'A hiker on the grassy ridge of the Ngong Hills', 1600, 1067, 2),
((SELECT id FROM guides WHERE slug = 'make-a-day-of-it'), 'guides/78769f4e96e5ba0b133dcb4706b38931.webp', 'Wind turbines along the top of the Ngong Hills', 1200, 800, 3),
((SELECT id FROM guides WHERE slug = 'make-a-day-of-it'), 'guides/4b78fc0e328500db0c8a8eab1961bd1d.webp', 'A shaded path in the Nairobi Arboretum', 1600, 1200, 4),
((SELECT id FROM guides WHERE slug = 'a-taste-of-nairobi'), 'guides/a01292d946841de8f39b1f1e97487685.webp', 'Nyama choma, Kenyan grilled meat, fresh off the grill', 1600, 1067, 1),
((SELECT id FROM guides WHERE slug = 'a-taste-of-nairobi'), 'guides/75d351c0715e5259d0293a6ae9d61923.webp', 'Ugali with creamed spinach', 1600, 739, 2),
((SELECT id FROM guides WHERE slug = 'a-taste-of-nairobi'), 'guides/136434bef7b0999043d58fe236473cc7.webp', 'A stack of freshly made chapati', 1600, 1067, 3),
((SELECT id FROM guides WHERE slug = 'a-taste-of-nairobi'), 'guides/caf8b1e8ee0cf7b3536ab7f993386e16.webp', 'The roasting pit at Carnivore restaurant', 1600, 1200, 4),
((SELECT id FROM guides WHERE slug = 'a-local-shopping-edit'), 'guides/641a9da743ad29c41d24232275a52667.webp', 'The Maasai Market on the rooftop at the Village Market', 1600, 1200, 1),
((SELECT id FROM guides WHERE slug = 'a-local-shopping-edit'), 'guides/a69a285b4f3ff5e3e3c2af9878aa7de7.webp', 'Shuka blankets and printed cloth on a Maasai Market stall', 1600, 800, 2),
((SELECT id FROM guides WHERE slug = 'a-local-shopping-edit'), 'guides/d66e45f91687bf4de4cf642c6d112660.webp', 'Carved wooden masks for sale in Nairobi', 1600, 1038, 3),
((SELECT id FROM guides WHERE slug = 'a-local-shopping-edit'), 'guides/46a234c338b93308fa476211e3bab5e4.webp', 'Carved wooden bowls and spoons at a Nairobi market', 1600, 1098, 4),
((SELECT id FROM guides WHERE slug = 'arts-culture-and-more'), 'guides/9a032c5dea9573e2684783264e88b22c.webp', 'Tinga Tinga Tales: The Musical on stage at the Kenya National Theatre', 1600, 900, 1),
((SELECT id FROM guides WHERE slug = 'arts-culture-and-more'), 'guides/a4f6272bdd7e18794fd17bb585433f3d.webp', 'A traditional Kamba homestead at Bomas of Kenya', 1600, 1064, 2),
((SELECT id FROM guides WHERE slug = 'arts-culture-and-more'), 'guides/c630a0a355e665b1f77bcbcaeecd7c45.webp', 'A vintage tractor in the grounds of the Karen Blixen Museum', 1600, 1064, 3),
((SELECT id FROM guides WHERE slug = 'arts-culture-and-more'), 'guides/ba060ed97efaea03312fba9f54fc4aa3.webp', 'The Luo village at Bomas of Kenya', 1600, 1064, 4),
((SELECT id FROM guides WHERE slug = 'the-city-after-dark'), 'guides/f89b4ce7d0674f2d7a4836aa483d378f.webp', 'A bar glowing with warm evening light', 1600, 1200, 1),
((SELECT id FROM guides WHERE slug = 'the-city-after-dark'), 'guides/f1534dcc0cb2d87bbaae57bffadc6d75.webp', 'A cocktail being served at the bar', 1600, 1066, 2),
((SELECT id FROM guides WHERE slug = 'the-city-after-dark'), 'guides/667e23282e9bda74e1ddd8d43d7e5704.webp', 'A band playing live music on a small stage', 1600, 1068, 3),
((SELECT id FROM guides WHERE slug = 'the-city-after-dark'), 'guides/7fd75d49f71884131bc184a5a996aa79.webp', 'The Nairobi skyline glowing at night', 1600, 1067, 4);

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
('owner', 'Where will my property be listed?', 'Pretty Fly Living is at the heart of our listing and distribution strategy. Suitable properties are featured on our direct-booking website, where guests can discover available stays and make booking enquiries. We may also list properties on platforms such as Booking.com and Vrbo to expand their reach and connect with a wider audience. Our aim is to grow Pretty Fly Living as a destination for discovering and booking quality stays, while using other platforms strategically to support property visibility.', 3, 1),
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

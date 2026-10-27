-- The six Nairobi guides for Things to Do, loaded into production as
-- unpublished drafts for Sophiah to review and publish in /admin/guides.
-- Venue facts come from each venue's official site (linked in the text).
-- Photos are from Wikimedia Commons (credited at the end of each guide) and
-- Unsplash; they live in scripts/seed-media/guides/.
--
-- Run once, on a production database with no guides yet:
--   npx wrangler d1 execute DB --remote --file=./scripts/guides-production.sql
--   node scripts/seed-media.ts --remote --file scripts/guides-production.sql
-- A second run stops at the unique slug before anything is duplicated.

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
 1, 1, 0),
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
 1, 2, 0),
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
 1, 3, 0),
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
 1, 4, 0),
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
 0, 5, 0),
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
 0, 6, 0);

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

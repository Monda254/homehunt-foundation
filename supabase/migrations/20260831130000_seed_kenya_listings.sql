-- =============================================================
-- HomeHunt Seeding — Kenyan Properties & Listings across 47 Counties
-- =============================================================

-- 1. Setup default landlord user to own the seed listings
INSERT INTO auth.users (id, email, raw_user_meta_data, email_confirmed_at, role, aud)
VALUES (
  'e68846c4-1111-4444-8888-000000000001',
  'landlord.seed@homehunt.co',
  '{"full_name": "Kenyan Landlord Ltd", "first_name": "Kenyan", "last_name": "Landlord", "phone_number": "+254712345678", "role": "landlord"}'::jsonb,
  now(),
  'authenticated',
  'authenticated'
)
ON CONFLICT (id) DO NOTHING;

-- Explicitly sync the profile record to ACTIVE status
UPDATE public.profiles
SET status = 'ACTIVE'::public.account_status,
    full_name = 'Kenyan Landlord Ltd',
    first_name = 'Kenyan',
    last_name = 'Landlord',
    phone_number = '+254712345678'
WHERE id = 'e68846c4-1111-4444-8888-000000000001';

-- Elevate the user role to landlord
INSERT INTO public.user_roles (user_id, role)
VALUES ('e68846c4-1111-4444-8888-000000000001', 'landlord')
ON CONFLICT (user_id, role) DO UPDATE SET role = 'landlord';

-- 2. Populate all 47 counties using PL/pgSQL loop
DO $$
DECLARE
  landlord_id UUID := 'e68846c4-1111-4444-8888-000000000001';
  county_rec RECORD;
  prop_id UUID;
  bld_id UUID;
  unit_id UUID;
  list_id UUID;
  base_price NUMERIC;
  rand_lat NUMERIC;
  rand_lng NUMERIC;
  listing_title TEXT;
  listing_desc TEXT;
  prop_desc TEXT;
BEGIN
  FOR county_rec IN (
    SELECT * FROM (
      VALUES
        ('Mombasa', 'Mombasa', -4.0435, 39.6682),
        ('Kwale', 'Diani', -4.2797, 39.5924),
        ('Kilifi', 'Kilifi', -3.6307, 39.8499),
        ('Tana River', 'Hola', -1.4988, 40.0336),
        ('Lamu', 'Lamu', -2.2686, 40.9020),
        ('Taita-Taveta', 'Voi', -3.3973, 38.5559),
        ('Garissa', 'Garissa', -0.4532, 39.6461),
        ('Wajir', 'Wajir', 1.7471, 40.0573),
        ('Mandera', 'Mandera', 3.9366, 41.8569),
        ('Marsabit', 'Marsabit', 2.3369, 37.9902),
        ('Isiolo', 'Isiolo', 0.3546, 37.5833),
        ('Meru', 'Meru', 0.0516, 37.6472),
        ('Tharaka-Nithi', 'Chuka', -0.3292, 37.6453),
        ('Embu', 'Embu', -0.5311, 37.4511),
        ('Kitui', 'Kitui', -1.3686, 38.0106),
        ('Machakos', 'Machakos', -1.5177, 37.2634),
        ('Makueni', 'Wote', -1.7807, 37.6256),
        ('Nyandarua', 'Ol Kalou', -0.2638, 36.3789),
        ('Nyeri', 'Nyeri', -0.4218, 36.9507),
        ('Kirinyaga', 'Kerugoya', -0.4986, 37.2803),
        ('Murang''a', 'Murang''a', -0.7211, 37.1517),
        ('Kiambu', 'Kiambu', -1.1611, 36.8258),
        ('Turkana', 'Lodwar', 3.1192, 35.5973),
        ('West Pokot', 'Kapenguria', 1.2422, 35.1211),
        ('Samburu', 'Maralal', 1.0967, 36.6983),
        ('Trans-Nzoia', 'Kitale', 1.0150, 35.0061),
        ('Uasin Gishu', 'Eldoret', 0.5143, 35.2697),
        ('Elgeyo-Marakwet', 'Iten', 0.6725, 35.5089),
        ('Nandi', 'Kapsabet', 0.2039, 35.1053),
        ('Baringo', 'Kabarnet', 0.4906, 35.7411),
        ('Laikipia', 'Nanyuki', 0.0167, 37.0722),
        ('Nakuru', 'Nakuru', -0.3031, 36.0800),
        ('Narok', 'Narok', -1.0783, 35.8600),
        ('Kajiado', 'Kitengela', -1.5000, 36.9600),
        ('Kericho', 'Kericho', -0.3678, 35.2831),
        ('Bomet', 'Bomet', -0.7817, 35.3411),
        ('Kakamega', 'Kakamega', 0.2842, 34.7525),
        ('Vihiga', 'Mbale', 0.0800, 34.7200),
        ('Bungoma', 'Bungoma', 0.5636, 34.5606),
        ('Busia', 'Busia', 0.4608, 34.1114),
        ('Siaya', 'Siaya', -0.0617, 34.2881),
        ('Kisumu', 'Kisumu', -0.0917, 34.7680),
        ('Homa Bay', 'Homa Bay', -0.5292, 34.4539),
        ('Migori', 'Migori', -1.0634, 34.4731),
        ('Kisii', 'Kisii', -0.6817, 34.7717),
        ('Nyamira', 'Nyamira', -0.5636, 34.9358),
        ('Nairobi', 'Nairobi', -1.2921, 36.8219)
    ) AS t(county_name, town_name, lat, lng)
  ) LOOP
    -- Determine base multiplier for premium locations
    IF county_rec.county_name IN ('Nairobi', 'Mombasa', 'Kiambu', 'Nakuru', 'Uasin Gishu') THEN
      base_price := 1.5;
    ELSE
      base_price := 0.8;
    END IF;

    -- =========================================================
    -- 1. APARTMENT PROPERTY
    -- =========================================================
    rand_lat := county_rec.lat + (random() * 0.02 - 0.01);
    rand_lng := county_rec.lng + (random() * 0.02 - 0.01);
    prop_desc := 'Stunning modern apartment block in the heart of ' || county_rec.town_name || ', ' || county_rec.county_name || ' county. Featuring state-of-the-art facilities, direct road access, secure gated entry, and reliable utilities.';
    
    INSERT INTO public.properties (
      property_type, name, description, status, owner_user_id, created_by_user_id,
      country, county, town, address, latitude, longitude
    ) VALUES (
      'APARTMENT',
      county_rec.county_name || ' Plaza Apartments',
      prop_desc,
      'ACTIVE',
      landlord_id,
      landlord_id,
      'Kenya',
      county_rec.county_name,
      county_rec.town_name,
      county_rec.town_name || ' Central Road',
      rand_lat,
      rand_lng
    ) RETURNING id INTO prop_id;

    -- Add Property Amenities
    INSERT INTO public.property_amenities (property_id, amenity) VALUES
      (prop_id, 'Gym'),
      (prop_id, 'Swimming Pool'),
      (prop_id, 'Backup Generator'),
      (prop_id, 'High Speed Lift'),
      (prop_id, 'Borehole Water')
    ON CONFLICT DO NOTHING;

    -- Add a building
    INSERT INTO public.buildings (property_id, name, floors, year_built)
    VALUES (prop_id, 'Block A', 5, 2024)
    RETURNING id INTO bld_id;

    -- Studio Unit
    INSERT INTO public.units (property_id, building_id, unit_number, unit_type, floor, bedrooms, bathrooms, status)
    VALUES (prop_id, bld_id, '101', 'STUDIO', 1, 0, 1, 'AVAILABLE')
    RETURNING id INTO unit_id;
    
    listing_title := 'Modern Studio Apartment at ' || county_rec.county_name || ' Plaza';
    listing_desc := 'Spacious and well-lit studio unit at ' || county_rec.county_name || ' Plaza. Fully tiled, fitted wardrobe, spacious bathroom, and modern kitchen cabinets. Ready for occupancy.';
    
    INSERT INTO public.listings (
      property_id, unit_id, title, description, listing_type, status, price, deposit_amount, availability_date, published_at, created_by_user_id
    ) VALUES (
      prop_id, unit_id, listing_title, listing_desc, 'FOR_RENT', 'PUBLISHED', ROUND(16000 * base_price, -3), ROUND(16000 * base_price, -3), CURRENT_DATE, now(), landlord_id
    ) RETURNING id INTO list_id;

    INSERT INTO public.property_media (property_id, unit_id, listing_id, media_type, url, sort_order, is_primary) VALUES
      (prop_id, unit_id, list_id, 'IMAGE', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80', 0, true),
      (prop_id, unit_id, list_id, 'IMAGE', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80', 1, false),
      (prop_id, unit_id, list_id, 'IMAGE', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80', 2, false),
      (prop_id, unit_id, list_id, 'IMAGE', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80', 3, false);

    -- Bedsitter Unit
    INSERT INTO public.units (property_id, building_id, unit_number, unit_type, floor, bedrooms, bathrooms, status)
    VALUES (prop_id, bld_id, '102', 'BEDSITTER', 1, 0, 1, 'AVAILABLE')
    RETURNING id INTO unit_id;
    
    listing_title := 'Comfortable Bedsitter at ' || county_rec.county_name || ' Plaza';
    listing_desc := 'Budget-friendly bedsitter with separate shower/toilet. Comes with kitchenette, clean tap water, token electricity meter, and secure parking. Ideal for students or young professionals.';
    
    INSERT INTO public.listings (
      property_id, unit_id, title, description, listing_type, status, price, deposit_amount, availability_date, published_at, created_by_user_id
    ) VALUES (
      prop_id, unit_id, listing_title, listing_desc, 'FOR_RENT', 'PUBLISHED', ROUND(11000 * base_price, -3), ROUND(11000 * base_price, -3), CURRENT_DATE, now(), landlord_id
    ) RETURNING id INTO list_id;

    INSERT INTO public.property_media (property_id, unit_id, listing_id, media_type, url, sort_order, is_primary) VALUES
      (prop_id, unit_id, list_id, 'IMAGE', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80', 0, true),
      (prop_id, unit_id, list_id, 'IMAGE', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80', 1, false),
      (prop_id, unit_id, list_id, 'IMAGE', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80', 2, false),
      (prop_id, unit_id, list_id, 'IMAGE', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80', 3, false);

    -- One Bedroom
    INSERT INTO public.units (property_id, building_id, unit_number, unit_type, floor, bedrooms, bathrooms, status)
    VALUES (prop_id, bld_id, '201', 'ONE_BEDROOM', 2, 1, 1, 'AVAILABLE')
    RETURNING id INTO unit_id;
    
    listing_title := 'Stunning 1 Bedroom Apartment at ' || county_rec.county_name || ' Plaza';
    listing_desc := 'Beautiful one bedroom apartment offering modern finishes, large living room, private balcony, master en-suite, and standard security. Rent includes water utility bills.';
    
    INSERT INTO public.listings (
      property_id, unit_id, title, description, listing_type, status, price, deposit_amount, availability_date, published_at, created_by_user_id
    ) VALUES (
      prop_id, unit_id, listing_title, listing_desc, 'FOR_RENT', 'PUBLISHED', ROUND(26000 * base_price, -3), ROUND(26000 * base_price, -3), CURRENT_DATE, now(), landlord_id
    ) RETURNING id INTO list_id;

    INSERT INTO public.property_media (property_id, unit_id, listing_id, media_type, url, sort_order, is_primary) VALUES
      (prop_id, unit_id, list_id, 'IMAGE', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80', 0, true),
      (prop_id, unit_id, list_id, 'IMAGE', 'https://images.unsplash.com/photo-1560185127-6a2806647f81?auto=format&fit=crop&w=800&q=80', 1, false),
      (prop_id, unit_id, list_id, 'IMAGE', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80', 2, false),
      (prop_id, unit_id, list_id, 'IMAGE', 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=800&q=80', 3, false);

    -- Two Bedroom
    INSERT INTO public.units (property_id, building_id, unit_number, unit_type, floor, bedrooms, bathrooms, status)
    VALUES (prop_id, bld_id, '202', 'TWO_BEDROOM', 2, 2, 2, 'AVAILABLE')
    RETURNING id INTO unit_id;
    
    listing_title := 'Charming 2 Bedroom Apartment at ' || county_rec.county_name || ' Plaza';
    listing_desc := 'Elegant 2 bedroom apartment featuring high-speed elevator access, pool privileges, secure gated perimeter, and closed kitchen. Master bedroom is ensuite with fitted wardrobes.';
    
    INSERT INTO public.listings (
      property_id, unit_id, title, description, listing_type, status, price, deposit_amount, availability_date, published_at, created_by_user_id
    ) VALUES (
      prop_id, unit_id, listing_title, listing_desc, 'FOR_RENT', 'PUBLISHED', ROUND(38000 * base_price, -3), ROUND(38000 * base_price, -3), CURRENT_DATE, now(), landlord_id
    ) RETURNING id INTO list_id;

    INSERT INTO public.property_media (property_id, unit_id, listing_id, media_type, url, sort_order, is_primary) VALUES
      (prop_id, unit_id, list_id, 'IMAGE', 'https://images.unsplash.com/photo-1560185127-6a2806647f81?auto=format&fit=crop&w=800&q=80', 0, true),
      (prop_id, unit_id, list_id, 'IMAGE', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80', 1, false),
      (prop_id, unit_id, list_id, 'IMAGE', 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=800&q=80', 2, false),
      (prop_id, unit_id, list_id, 'IMAGE', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80', 3, false);

    -- Three Bedroom
    INSERT INTO public.units (property_id, building_id, unit_number, unit_type, floor, bedrooms, bathrooms, status)
    VALUES (prop_id, bld_id, '301', 'THREE_BEDROOM', 3, 3, 3, 'AVAILABLE')
    RETURNING id INTO unit_id;
    
    listing_title := 'Executive 3 Bedroom Apartment at ' || county_rec.county_name || ' Plaza';
    listing_desc := 'Luxurious 3-bedroom apartment with panoramic views of the city. Includes pool, gym, laundry room, master bedroom with balcony, and large kitchen. Excellent neighborhood.';
    
    INSERT INTO public.listings (
      property_id, unit_id, title, description, listing_type, status, price, deposit_amount, availability_date, published_at, created_by_user_id
    ) VALUES (
      prop_id, unit_id, listing_title, listing_desc, 'FOR_RENT', 'PUBLISHED', ROUND(55000 * base_price, -3), ROUND(55000 * base_price, -3), CURRENT_DATE, now(), landlord_id
    ) RETURNING id INTO list_id;

    INSERT INTO public.property_media (property_id, unit_id, listing_id, media_type, url, sort_order, is_primary) VALUES
      (prop_id, unit_id, list_id, 'IMAGE', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80', 0, true),
      (prop_id, unit_id, list_id, 'IMAGE', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80', 1, false),
      (prop_id, unit_id, list_id, 'IMAGE', 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=800&q=80', 2, false),
      (prop_id, unit_id, list_id, 'IMAGE', 'https://images.unsplash.com/photo-1560185127-6a2806647f81?auto=format&fit=crop&w=800&q=80', 3, false);


    -- =========================================================
    -- 2. GATED COMMUNITY PROPERTY (With Gym, Pool, Spa, DSQ)
    -- =========================================================
    rand_lat := county_rec.lat + (random() * 0.02 - 0.01);
    rand_lng := county_rec.lng + (random() * 0.02 - 0.01);
    prop_desc := 'Elite luxury gated community estate in ' || county_rec.town_name || ', ' || county_rec.county_name || '. Premium environment featuring top security, high-end clubhouse, gym, pool, spa, and children playgrounds.';
    
    INSERT INTO public.properties (
      property_type, name, description, status, owner_user_id, created_by_user_id,
      country, county, town, address, latitude, longitude
    ) VALUES (
      'TOWNHOUSE',
      county_rec.county_name || ' Gated Gardens',
      prop_desc,
      'ACTIVE',
      landlord_id,
      landlord_id,
      'Kenya',
      county_rec.county_name,
      county_rec.town_name,
      county_rec.town_name || ' Gated Area',
      rand_lat,
      rand_lng
    ) RETURNING id INTO prop_id;

    -- Add Property Amenities
    INSERT INTO public.property_amenities (property_id, amenity) VALUES
      (prop_id, 'Gym'),
      (prop_id, 'Swimming Pool'),
      (prop_id, 'Spa'),
      (prop_id, 'DSQ'),
      (prop_id, 'Kids Play Area'),
      (prop_id, '24/7 Security')
    ON CONFLICT DO NOTHING;

    -- 3 Bedroom with DSQ
    INSERT INTO public.units (property_id, unit_number, unit_type, floor, bedrooms, bathrooms, status, description)
    VALUES (prop_id, 'Villa A1', 'HOUSE', 1, 3, 3, 'AVAILABLE', 'Luxury 3-bedroom townhouse with servant quarter DSQ in gated community.')
    RETURNING id INTO unit_id;
    
    listing_title := 'Luxury 3 Bedroom Townhouse with DSQ at ' || county_rec.county_name || ' Gated Gardens';
    listing_desc := 'High-end 3 bedroom townhouse featuring servant quarters (DSQ), en-suite master bedroom, private front lawn, and community pool, spa & gym access. Secure family-friendly environment.';
    
    INSERT INTO public.listings (
      property_id, unit_id, title, description, listing_type, status, price, deposit_amount, availability_date, published_at, created_by_user_id
    ) VALUES (
      prop_id, unit_id, listing_title, listing_desc, 'FOR_RENT', 'PUBLISHED', ROUND(95000 * base_price, -3), ROUND(95000 * base_price, -3), CURRENT_DATE, now(), landlord_id
    ) RETURNING id INTO list_id;

    INSERT INTO public.property_media (property_id, unit_id, listing_id, media_type, url, sort_order, is_primary) VALUES
      (prop_id, unit_id, list_id, 'IMAGE', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', 0, true),
      (prop_id, unit_id, list_id, 'IMAGE', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80', 1, false),
      (prop_id, unit_id, list_id, 'IMAGE', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80', 2, false),
      (prop_id, unit_id, list_id, 'IMAGE', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80', 3, false);


    -- =========================================================
    -- 3. OWN COMPOUND PROPERTY (With DSQ, Garden)
    -- =========================================================
    rand_lat := county_rec.lat + (random() * 0.02 - 0.01);
    rand_lng := county_rec.lng + (random() * 0.02 - 0.01);
    prop_desc := 'Stunning own compound family bungalow located in a quiet leafy area in ' || county_rec.town_name || ', ' || county_rec.county_name || '. Offers total privacy, own compound gate, security, DSQ, and well-manicured gardens.';
    
    INSERT INTO public.properties (
      property_type, name, description, status, owner_user_id, created_by_user_id,
      country, county, town, address, latitude, longitude
    ) VALUES (
      'HOUSE',
      county_rec.county_name || ' Serene Villa',
      prop_desc,
      'ACTIVE',
      landlord_id,
      landlord_id,
      'Kenya',
      county_rec.county_name,
      county_rec.town_name,
      county_rec.town_name || ' suburban estate',
      rand_lat,
      rand_lng
    ) RETURNING id INTO prop_id;

    -- Add Property Amenities
    INSERT INTO public.property_amenities (property_id, amenity) VALUES
      (prop_id, 'DSQ'),
      (prop_id, 'Private Garden'),
      (prop_id, 'Electric Fence'),
      (prop_id, 'Backup Generator')
    ON CONFLICT DO NOTHING;

    -- 3 Bedroom own compound with DSQ
    INSERT INTO public.units (property_id, unit_number, unit_type, floor, bedrooms, bathrooms, status, description)
    VALUES (prop_id, 'Main House', 'HOUSE', 1, 3, 3, 'AVAILABLE', 'Spacious 3 bedroom house with detached DSQ and private compound.')
    RETURNING id INTO unit_id;
    
    listing_title := 'Cozy 3 Bedroom Own Compound House with DSQ at ' || county_rec.county_name;
    listing_desc := 'Beautiful standalone own compound house in ' || county_rec.town_name || '. Offers massive garden lawn, private driveway, electric fencing, detached servant quarters (DSQ), and large kitchen space.';
    
    INSERT INTO public.listings (
      property_id, unit_id, title, description, listing_type, status, price, deposit_amount, availability_date, published_at, created_by_user_id
    ) VALUES (
      prop_id, unit_id, listing_title, listing_desc, 'FOR_RENT', 'PUBLISHED', ROUND(72000 * base_price, -3), ROUND(72000 * base_price, -3), CURRENT_DATE, now(), landlord_id
    ) RETURNING id INTO list_id;

    INSERT INTO public.property_media (property_id, unit_id, listing_id, media_type, url, sort_order, is_primary) VALUES
      (prop_id, unit_id, list_id, 'IMAGE', 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80', 0, true),
      (prop_id, unit_id, list_id, 'IMAGE', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', 1, false),
      (prop_id, unit_id, list_id, 'IMAGE', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80', 2, false),
      (prop_id, unit_id, list_id, 'IMAGE', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80', 3, false);

  END LOOP;
END$$;

-- ============================================
-- Connec'Kër - Seed Data
-- Execute AFTER setup.sql in Supabase SQL Editor
-- ============================================

-- Create demo users (without auth, for display purposes)
INSERT INTO public.users (id, email, full_name, phone, role, company_name) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'agence@dakarimmo.sn', 'Agence Dakar Immo', '+221 33 823 45 67', 'announcer', 'Dakar Immo SARL'),
  ('a0000000-0000-0000-0000-000000000002', 'fatou.sarr@email.com', 'Fatou Sarr', '+221 77 234 56 78', 'announcer', NULL),
  ('a0000000-0000-0000-0000-000000000003', 'touba.immo@email.com', 'Agence Touba Immo', '+221 33 867 89 01', 'announcer', 'Touba Immobilier'),
  ('a0000000-0000-0000-0000-000000000004', 'admin@connecker.com', 'Admin Connecker', '+221 77 000 00 00', 'admin', 'Connecker'),
  ('a0000000-0000-0000-0000-000000000005', 'amadou.diallo@email.com', 'Amadou Diallo', '+221 77 123 45 67', 'user', NULL),
  ('a0000000-0000-0000-0000-000000000006', 'sci.invest@email.com', 'SCI Dakar Invest', '+221 33 845 67 89', 'announcer', 'SCI Dakar Invest');

-- Properties
INSERT INTO public.properties (id, title, description, property_type, transaction_type, status, price, currency, surface_area, rooms, bedrooms, bathrooms, address, city, district, country, latitude, longitude, features, views_count, leads_count, announcer_id) VALUES
(
  'b0000000-0000-0000-0000-000000000001',
  'Villa moderne avec piscine aux Almadies',
  'Magnifique villa contemporaine situee dans le quartier prisé des Almadies. Cette propriete d''exception offre 350m2 de surface habitable avec piscine a debordement, jardin paysager tropical et une vue imprenable sur l''ocean. Finitions haut de gamme, cuisine equipee italienne, systeme domotique complet. Ideal pour famille ou representation diplomatique.',
  'villa', 'sale', 'published', 285000000, 'XOF', 350, 7, 4, 3,
  'Rue des Almadies', 'Dakar', 'Almadies', 'SN', 14.7469, -17.5139,
  ARRAY['Piscine', 'Jardin', 'Garage double', 'Climatisation centrale', 'Domotique', 'Vue mer', 'Gardien 24h'],
  234, 12, 'a0000000-0000-0000-0000-000000000001'
),
(
  'b0000000-0000-0000-0000-000000000002',
  'Appartement T3 standing au Plateau',
  'Bel appartement de standing au coeur du Plateau, entierement renove avec des materiaux de qualite. Situe au 5eme etage avec ascenseur, il offre une vue degagee sur la ville. Deux chambres spacieuses, salon lumineux, cuisine americaine equipee. Residence securisee avec gardien et parking souterrain.',
  'apartment', 'rent', 'published', 850000, 'XOF', 95, 4, 2, 2,
  'Rue Carnot', 'Dakar', 'Plateau', 'SN', 14.6697, -17.4381,
  ARRAY['Ascenseur', 'Balcon', 'Gardien', 'Parking souterrain', 'Cuisine equipee', 'Climatisation'],
  189, 8, 'a0000000-0000-0000-0000-000000000002'
),
(
  'b0000000-0000-0000-0000-000000000003',
  'Terrain constructible a Saly Portudal',
  'Beau terrain bien situe a Saly, a 5 minutes de la plage. Ideal pour projet residentiel ou touristique. Titre foncier en regle, terrain viabilise (eau, electricite). Zone en plein developpement avec forte plus-value attendue. Possibilite de diviser en 2 lots.',
  'land', 'sale', 'published', 45000000, 'XOF', 500, 0, 0, 0,
  'Route de Saly', 'Mbour', 'Saly Portudal', 'SN', 14.4497, -17.0162,
  ARRAY['Titre foncier', 'Viabilise', 'Bord de route', 'Proche plage'],
  156, 15, 'a0000000-0000-0000-0000-000000000003'
),
(
  'b0000000-0000-0000-0000-000000000004',
  'Maison familiale avec terrasse a Ngor',
  'Grande maison familiale dans le quartier calme de Ngor. Terrasse panoramique avec vue sur mer et l''ile de Ngor. 4 chambres, 2 salles de bain, grand salon, cuisine independante. Garage pour 2 vehicules. Quartier residentiel securise, proche de la corniche.',
  'house', 'sale', 'published', 180000000, 'XOF', 250, 6, 4, 2,
  'Rue de Ngor', 'Dakar', 'Ngor', 'SN', 14.7535, -17.5177,
  ARRAY['Terrasse', 'Vue mer', 'Garage double', 'Jardin', 'Quartier calme'],
  312, 21, 'a0000000-0000-0000-0000-000000000001'
),
(
  'b0000000-0000-0000-0000-000000000005',
  'Studio meuble et equipe a Mermoz',
  'Studio entierement meuble et equipe, ideal pour jeune professionnel ou expatrie. Situe au 2eme etage d''une residence moderne a Mermoz. Wifi haut debit inclus, climatisation, cuisine equipee. A proximite des commerces, restaurants et transports.',
  'studio', 'rent', 'published', 350000, 'XOF', 35, 1, 1, 1,
  'Avenue Cheikh Anta Diop', 'Dakar', 'Mermoz', 'SN', 14.7068, -17.4677,
  ARRAY['Meuble', 'Wifi inclus', 'Climatisation', 'Cuisine equipee', 'Proche commerces'],
  98, 5, 'a0000000-0000-0000-0000-000000000006'
),
(
  'b0000000-0000-0000-0000-000000000006',
  'Bureau open space moderne au Plateau',
  'Espace de bureau moderne en open space au centre d''affaires du Plateau. 120m2 amenageables, fibre optique installee, climatisation centrale. Ideal pour startup, cabinet ou representation commerciale. Immeuble securise avec reception.',
  'office', 'rent', 'published', 1200000, 'XOF', 120, 3, 0, 1,
  'Avenue Leopold Sedar Senghor', 'Dakar', 'Plateau', 'SN', 14.6685, -17.4352,
  ARRAY['Climatisation centrale', 'Fibre optique', 'Parking', 'Securite 24h', 'Reception'],
  67, 3, 'a0000000-0000-0000-0000-000000000003'
),
(
  'b0000000-0000-0000-0000-000000000007',
  'Villa neuve avec jardin a Ouakam',
  'Villa neuve de 200m2 dans une residence fermee a Ouakam. Construction recente avec finitions soignees. 3 chambres avec placards, 2 salles de bain, salon double, terrasse couverte et jardin privatif. Parfait pour famille.',
  'villa', 'sale', 'published', 195000000, 'XOF', 200, 5, 3, 2,
  'Cite Ouakam', 'Dakar', 'Ouakam', 'SN', 14.7255, -17.4865,
  ARRAY['Jardin privatif', 'Terrasse', 'Residence fermee', 'Neuf', 'Placards integres'],
  145, 9, 'a0000000-0000-0000-0000-000000000006'
),
(
  'b0000000-0000-0000-0000-000000000008',
  'Appartement T4 vue mer a Virage',
  'Superbe T4 en front de mer sur la corniche Ouest. Vue panoramique sur l''ocean depuis le salon et la chambre principale. 130m2, 3 chambres, 2 sdb, grand balcon. Residence de standing avec piscine commune.',
  'apartment', 'rent', 'published', 1500000, 'XOF', 130, 5, 3, 2,
  'Corniche Ouest', 'Dakar', 'Fann', 'SN', 14.6905, -17.4656,
  ARRAY['Vue mer panoramique', 'Balcon', 'Piscine commune', 'Standing', 'Front de mer'],
  278, 18, 'a0000000-0000-0000-0000-000000000001'
),
(
  'b0000000-0000-0000-0000-000000000009',
  'Terrain 1000m2 titre foncier a Diamniadio',
  'Grand terrain de 1000m2 idealement situe a Diamniadio, a proximite du nouveau pole urbain et de l''aeroport AIBD. Titre foncier definitif. Zone en plein essor avec infrastructure moderne (autoroute, TER).',
  'land', 'sale', 'published', 35000000, 'XOF', 1000, 0, 0, 0,
  'Zone de Diamniadio', 'Diamniadio', 'Diamniadio', 'SN', 14.7500, -17.1833,
  ARRAY['Titre foncier definitif', '1000m2', 'Proche autoroute', 'Proche AIBD', 'Zone en developpement'],
  203, 24, 'a0000000-0000-0000-0000-000000000003'
),
(
  'b0000000-0000-0000-0000-000000000010',
  'Local commercial 80m2 a Medina',
  'Local commercial de 80m2 sur avenue passante a la Medina. Ideal pour boutique, restaurant ou bureau. Vitrine donnant sur rue, arrieres-boutique, toilettes. Bon etat general, disponible immediatement.',
  'commercial', 'rent', 'published', 600000, 'XOF', 80, 2, 0, 1,
  'Avenue Blaise Diagne', 'Dakar', 'Medina', 'SN', 14.6739, -17.4468,
  ARRAY['Avenue passante', 'Vitrine', 'Disponible immediatement', 'Bon etat'],
  89, 6, 'a0000000-0000-0000-0000-000000000002'
);

-- Property images
INSERT INTO public.property_images (property_id, url, is_primary, sort_order) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80', true, 0),
  ('b0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', false, 1),
  ('b0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80', true, 0),
  ('b0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80', false, 1),
  ('b0000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80', true, 0),
  ('b0000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', true, 0),
  ('b0000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80', false, 1),
  ('b0000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80', true, 0),
  ('b0000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80', true, 0),
  ('b0000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', true, 0),
  ('b0000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80', true, 0),
  ('b0000000-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80', true, 0),
  ('b0000000-0000-0000-0000-000000000010', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80', true, 0);

-- Leads
INSERT INTO public.leads (property_id, sender_name, sender_email, sender_phone, message, status) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Amadou Diallo', 'amadou.diallo@email.com', '+221 77 123 45 67', 'Bonjour, je suis tres interesse par cette villa. Est-il possible de planifier une visite ce week-end ?', 'new'),
  ('b0000000-0000-0000-0000-000000000001', 'Aissatou Ba', 'aissatou.ba@email.com', '+221 77 456 78 90', 'Le prix est-il negociable ? Je suis acheteuse cash et prete a conclure rapidement.', 'new'),
  ('b0000000-0000-0000-0000-000000000002', 'Moussa Fall', 'moussa.fall@email.com', '+221 78 234 56 78', 'Je recherche un appartement pour ma famille de 4 personnes. Le T3 m''interesse. Quel est le montant de la caution ?', 'read'),
  ('b0000000-0000-0000-0000-000000000003', 'Ibrahim Ndiaye', 'ibrahim@email.com', '+221 76 345 67 89', 'Je souhaite construire une residence touristique. Ce terrain est-il viabilise ? Quelle est la nature du sol ?', 'contacted'),
  ('b0000000-0000-0000-0000-000000000004', 'Sophie Martin', 'sophie.martin@email.com', '+221 77 567 89 01', 'Expatriee francaise, je cherche une maison pour 2 ans. Celle-ci est-elle disponible a la location egalement ?', 'new'),
  ('b0000000-0000-0000-0000-000000000008', 'Ousmane Diop', 'ousmane@email.com', '+221 77 890 12 34', 'Tres interesse par le T4 vue mer. Peut-on organiser une visite cette semaine ?', 'new');

-- Favorites
INSERT INTO public.favorites (user_id, property_id) VALUES
  ('a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001'),
  ('a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000004'),
  ('a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000008');

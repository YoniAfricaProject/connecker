import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Lang = 'fr' | 'en';

const translations = {
  // Common
  'common.all': { fr: 'Tous', en: 'All' },
  'common.close': { fr: 'Fermer', en: 'Close' },
  'common.search': { fr: 'Rechercher', en: 'Search' },
  'common.apply': { fr: 'Appliquer', en: 'Apply' },
  'common.reset': { fr: 'Reinitialiser', en: 'Reset' },
  'common.next': { fr: 'Suivant', en: 'Next' },
  'common.back': { fr: 'Retour', en: 'Back' },
  'common.save': { fr: 'Enregistrer', en: 'Save' },
  'common.cancel': { fr: 'Annuler', en: 'Cancel' },
  'common.delete': { fr: 'Supprimer', en: 'Delete' },
  'common.loading': { fr: 'Chargement...', en: 'Loading...' },
  'common.error': { fr: 'Erreur', en: 'Error' },
  'common.seeAll': { fr: 'Voir tout', en: 'See all' },
  'common.clear': { fr: 'Effacer', en: 'Clear' },
  'common.publish': { fr: 'Publier', en: 'Publish' },
  'common.month': { fr: '/mois', en: '/month' },

  // Auth
  'auth.login': { fr: 'Connexion', en: 'Login' },
  'auth.loginSub': { fr: 'Connectez-vous a votre compte Connec\'Ker', en: 'Sign in to your Connec\'Ker account' },
  'auth.email': { fr: 'Email', en: 'Email' },
  'auth.emailPlaceholder': { fr: 'votre@email.com', en: 'your@email.com' },
  'auth.password': { fr: 'Mot de passe', en: 'Password' },
  'auth.passwordPlaceholder': { fr: 'Votre mot de passe', en: 'Your password' },
  'auth.signIn': { fr: 'Se connecter', en: 'Sign in' },
  'auth.noAccount': { fr: 'Pas de compte ?', en: 'No account?' },
  'auth.createAccount': { fr: 'Creer un compte', en: 'Create account' },
  'auth.wrongCredentials': { fr: 'Email ou mot de passe incorrect', en: 'Incorrect email or password' },
  'auth.register': { fr: 'Inscription', en: 'Sign up' },
  'auth.registerSub': { fr: 'Creez votre compte Connec\'Ker', en: 'Create your Connec\'Ker account' },
  'auth.fullName': { fr: 'Nom complet', en: 'Full name' },
  'auth.phone': { fr: 'Telephone', en: 'Phone' },
  'auth.iAm': { fr: 'Je suis', en: 'I am' },
  'auth.individual': { fr: 'Particulier', en: 'Individual' },
  'auth.announcer': { fr: 'Annonceur', en: 'Announcer' },
  'auth.signUp': { fr: 'Creer mon compte', en: 'Create my account' },
  'auth.hasAccount': { fr: 'Deja un compte ?', en: 'Already have an account?' },
  'auth.signInLink': { fr: 'Se connecter', en: 'Sign in' },
  'auth.successTitle': { fr: 'Compte cree !', en: 'Account created!' },
  'auth.successSub': { fr: 'Verifiez votre email pour activer votre compte', en: 'Check your email to activate your account' },
  'auth.goToLogin': { fr: 'Aller a la connexion', en: 'Go to login' },
  'auth.connectRequired': { fr: 'Connectez-vous', en: 'Sign in' },

  // Home
  'home.hello': { fr: 'Bonjour', en: 'Hello' },
  'home.welcome': { fr: 'bienvenue !', en: 'welcome!' },
  'home.findIdeal': { fr: 'Trouvez le bien', en: 'Find the perfect' },
  'home.ideal': { fr: 'ideal', en: 'property' },
  'home.searchPlaceholder': { fr: 'Dakar, Thies, Saint-Louis...', en: 'Dakar, Thies, Saint-Louis...' },
  'home.trends': { fr: 'Vos tendances immo', en: 'Real estate trends' },
  'home.featured': { fr: 'Annonces en vedette', en: 'Featured listings' },
  'home.recentlyViewed': { fr: 'Recemment consultes', en: 'Recently viewed' },
  'home.contactFirst': { fr: 'Prenez contact en premier', en: 'Be the first to contact' },
  'home.explore': { fr: 'Explorer', en: 'Explore' },
  'home.apartments': { fr: 'Appartements', en: 'Apartments' },
  'home.houses': { fr: 'Maisons', en: 'Houses' },
  'home.villas': { fr: 'Villas', en: 'Villas' },
  'home.lands': { fr: 'Terrains', en: 'Lands' },
  'home.estimateTitle': { fr: 'Estimez votre bien', en: 'Estimate your property' },
  'home.estimateDesc': { fr: 'Obtenez une estimation gratuite basee sur les prix du marche dans votre quartier', en: 'Get a free estimate based on market prices in your neighborhood' },
  'home.estimateBtn': { fr: 'Estimer maintenant', en: 'Estimate now' },
  'home.buy': { fr: 'Acheter', en: 'Buy' },
  'home.rent': { fr: 'Louer', en: 'Rent' },
  'home.sale': { fr: 'Vente', en: 'Sale' },
  'home.rental': { fr: 'Location', en: 'Rental' },
  'home.new': { fr: 'Nouveau', en: 'New' },
  'home.rentSuffix': { fr: '/m²', en: '/m²' },
  'home.noResults': { fr: 'Aucun bien trouve. Modifiez vos criteres.', en: 'No properties found. Modify your criteria.' },

  // Search
  'search.title': { fr: 'Rechercher', en: 'Search' },
  'search.placeholder': { fr: 'Ville, quartier, type...', en: 'City, neighborhood, type...' },
  'search.purchase': { fr: 'Achat', en: 'Purchase' },
  'search.noResults': { fr: 'Aucun bien trouve', en: 'No properties found' },
  'search.noResultsSub': { fr: 'Modifiez vos filtres pour elargir la recherche', en: 'Modify your filters to broaden your search' },
  'search.clearFilters': { fr: 'Effacer les filtres', en: 'Clear filters' },
  'search.advancedFilters': { fr: 'Filtres avances', en: 'Advanced filters' },
  'search.transaction': { fr: 'Transaction', en: 'Transaction' },
  'search.city': { fr: 'Ville', en: 'City' },
  'search.commune': { fr: 'Commune', en: 'District' },
  'search.neighborhood': { fr: 'Quartier', en: 'Neighborhood' },
  'search.propertyType': { fr: 'Type de bien', en: 'Property type' },
  'search.price': { fr: 'Prix (XOF)', en: 'Price (XOF)' },
  'search.minRooms': { fr: 'Pieces minimum', en: 'Minimum rooms' },
  'search.minBedrooms': { fr: 'Chambres minimum', en: 'Minimum bedrooms' },
  'search.surface': { fr: 'Surface (m²)', en: 'Surface (m²)' },
  'search.features': { fr: 'Caracteristiques', en: 'Features' },
  'search.allCities': { fr: 'Toutes les villes', en: 'All cities' },
  'search.allCommunes': { fr: 'Toutes les communes', en: 'All districts' },
  'search.allNeighborhoods': { fr: 'Tous les quartiers', en: 'All neighborhoods' },
  'search.allTypes': { fr: 'Tous les types', en: 'All types' },

  // Publish
  'publish.title': { fr: 'Publier une annonce', en: 'Post a listing' },
  'publish.connectRequired': { fr: 'Vous devez etre connecte pour publier une annonce', en: 'You must be signed in to post a listing' },
  'publish.information': { fr: 'Informations', en: 'Information' },
  'publish.titleField': { fr: 'Titre *', en: 'Title *' },
  'publish.titlePlaceholder': { fr: 'Ex: Belle villa avec piscine', en: 'Ex: Beautiful villa with pool' },
  'publish.transactionType': { fr: 'Transaction', en: 'Transaction' },
  'publish.type': { fr: 'Type', en: 'Type' },
  'publish.price': { fr: 'Prix (XOF) *', en: 'Price (XOF) *' },
  'publish.description': { fr: 'Description', en: 'Description' },
  'publish.descriptionPlaceholder': { fr: 'Decrivez votre bien...', en: 'Describe your property...' },
  'publish.locationDetails': { fr: 'Localisation & details', en: 'Location & details' },
  'publish.address': { fr: 'Adresse *', en: 'Address *' },
  'publish.surface': { fr: 'Surface m²', en: 'Surface m²' },
  'publish.rooms': { fr: 'Pieces', en: 'Rooms' },
  'publish.bedrooms': { fr: 'Chambres', en: 'Bedrooms' },
  'publish.bathrooms': { fr: 'Sdb', en: 'Bath.' },
  'publish.photosEquipment': { fr: 'Photos & equipements', en: 'Photos & equipment' },
  'publish.photos': { fr: 'Photos', en: 'Photos' },
  'publish.addPhotos': { fr: 'Ajouter des photos', en: 'Add photos' },
  'publish.equipment': { fr: 'Equipements', en: 'Equipment' },
  'publish.successTitle': { fr: 'Annonce publiee !', en: 'Listing published!' },
  'publish.successSub': { fr: 'Elle sera visible apres validation par notre equipe', en: 'It will be visible after our team validates it' },
  'publish.publishAnother': { fr: 'Publier une autre', en: 'Publish another' },
  'publish.requiredFields': { fr: 'Titre, prix et adresse sont obligatoires', en: 'Title, price and address are required' },
  'publish.publishError': { fr: 'Impossible de publier', en: 'Unable to publish' },

  // Favorites
  'favorites.title': { fr: 'Mes favoris', en: 'My favorites' },
  'favorites.connectRequired': { fr: 'Pour sauvegarder vos biens preferes', en: 'To save your favorite properties' },
  'favorites.empty': { fr: 'Aucun favori', en: 'No favorites' },
  'favorites.emptySub': { fr: 'Explorez les biens et cliquez sur le coeur', en: 'Browse properties and click the heart' },
  'favorites.exploreBtn': { fr: 'Explorer', en: 'Explore' },

  // Profile
  'profile.title': { fr: 'Mon profil', en: 'My profile' },
  'profile.myAccount': { fr: 'Mon compte', en: 'My account' },
  'profile.accountSub': { fr: 'Connectez-vous pour gerer votre profil, vos annonces et vos favoris', en: 'Sign in to manage your profile, listings and favorites' },
  'profile.personalInfo': { fr: 'Informations personnelles', en: 'Personal information' },
  'profile.personalInfoSub': { fr: 'Nom, telephone, email...', en: 'Name, phone, email...' },
  'profile.myFolder': { fr: 'Mon dossier', en: 'My folder' },
  'profile.myFolderSub': { fr: 'Situation professionnelle, documents...', en: 'Professional situation, documents...' },
  'profile.messages': { fr: 'Messages', en: 'Messages' },
  'profile.messagesSub': { fr: 'Recevoir et envoyer des messages', en: 'Receive and send messages' },
  'profile.notifications': { fr: 'Notifications', en: 'Notifications' },
  'profile.notificationsSub': { fr: 'Personnalisez vos alertes', en: 'Customize your alerts' },
  'profile.myFavorites': { fr: 'Mes favoris', en: 'My favorites' },
  'profile.myFavoritesSub': { fr: 'Biens sauvegardes', en: 'Saved properties' },
  'profile.security': { fr: 'Connexion & securite', en: 'Login & security' },
  'profile.securitySub': { fr: 'Modifiez votre email, mot de passe...', en: 'Change your email, password...' },
  'profile.language': { fr: 'Parametres de langue', en: 'Language settings' },
  'profile.tools': { fr: 'Outils & services', en: 'Tools & services' },
  'profile.toolsSub': { fr: 'Trouvez un agent, un notaire...', en: 'Find an agent, a notary...' },
  'profile.estimate': { fr: 'Estimation de bien', en: 'Property estimate' },
  'profile.estimateSub': { fr: 'Obtenez une idee de la valeur', en: 'Get a value estimate' },
  'profile.logout': { fr: 'Deconnexion', en: 'Logout' },

  // Tabs
  'tab.home': { fr: 'Accueil', en: 'Home' },
  'tab.search': { fr: 'Rechercher', en: 'Search' },
  'tab.publish': { fr: 'Publier', en: 'Publish' },
  'tab.favorites': { fr: 'Favoris', en: 'Favorites' },
  'tab.profile': { fr: 'Profil', en: 'Profile' },

  // Property detail
  'property.bedrooms': { fr: 'ch', en: 'bd' },
  'property.bathrooms': { fr: 'sdb', en: 'bath' },
  'property.description': { fr: 'Description', en: 'Description' },
  'property.features': { fr: 'Equipements', en: 'Features' },
  'property.contact': { fr: 'Contacter', en: 'Contact' },
  'property.whatsapp': { fr: 'WhatsApp', en: 'WhatsApp' },
  'property.call': { fr: 'Appeler', en: 'Call' },

  // Onboarding
  'onboarding.skip': { fr: 'Passer', en: 'Skip' },
  'onboarding.start': { fr: 'Commencer', en: 'Get started' },

  // Language page
  'language.title': { fr: 'Langue', en: 'Language' },
  'language.hint': { fr: 'La traduction Wolof sera disponible prochainement', en: 'Wolof translation will be available soon' },

  // Features (for filters)
  'feature.pool': { fr: 'Piscine', en: 'Pool' },
  'feature.garden': { fr: 'Jardin', en: 'Garden' },
  'feature.garage': { fr: 'Garage', en: 'Garage' },
  'feature.ac': { fr: 'Climatisation', en: 'Air conditioning' },
  'feature.elevator': { fr: 'Ascenseur', en: 'Elevator' },
  'feature.balcony': { fr: 'Balcon', en: 'Balcony' },
  'feature.terrace': { fr: 'Terrasse', en: 'Terrace' },
  'feature.security': { fr: 'Gardien', en: 'Security' },
  'feature.parking': { fr: 'Parking', en: 'Parking' },
  'feature.seaView': { fr: 'Vue mer', en: 'Sea view' },
  'feature.furnished': { fr: 'Meuble', en: 'Furnished' },
  'feature.kitchen': { fr: 'Cuisine equipee', en: 'Equipped kitchen' },
  'feature.titleDeed': { fr: 'Titre foncier', en: 'Title deed' },

  // Availability
  'availability.all': { fr: 'Toutes', en: 'All' },
  'availability.immediate': { fr: 'Immediate', en: 'Immediate' },
  'availability.future': { fr: 'A venir', en: 'Upcoming' },

  // Filters active
  'filters.active': { fr: 'Filtres avances actifs', en: 'Advanced filters active' },

  // Property types
  'type.apartment': { fr: 'Appart.', en: 'Apt.' },
  'type.house': { fr: 'Maison', en: 'House' },
  'type.villa': { fr: 'Villa', en: 'Villa' },
  'type.land': { fr: 'Terrain', en: 'Land' },
  'type.studio': { fr: 'Studio', en: 'Studio' },
} as const;

type TranslationKey = keyof typeof translations;

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'fr',
  setLang: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr');

  // Load saved language on mount
  React.useEffect(() => {
    AsyncStorage.getItem('app_language').then(saved => {
      if (saved === 'fr' || saved === 'en') setLangState(saved);
    });
  }, []);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    AsyncStorage.setItem('app_language', newLang);
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    const entry = translations[key];
    return entry ? entry[lang] : key;
  }, [lang]);

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);

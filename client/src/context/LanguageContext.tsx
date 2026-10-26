import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ml';

interface Translations {
  [key: string]: {
    en: string;
    ml: string;
  };
}

export const translations: Translations = {
  appName: { en: 'CooLink', ml: 'കൂലിങ്ക് (CooLink)' },
  tagline: {
    en: 'Find Work. Find Workers. Without Waiting.',
    ml: 'കവലകളിൽ കാത്തുനിൽക്കാതെ തൊഴിൽ കണ്ടെത്താം.',
  },
  traditionalProblem: {
    en: 'Stop waiting at bus stands, railway stations, and junctions hoping for work.',
    ml: 'ജോലിക്കായി ബസ് സ്റ്റാൻഡുകളിലും കവലകളിലും കാത്തുനിൽക്കുന്നത് അവസാനിപ്പിക്കാം.',
  },
  imLookingForWork: { en: "I'M LOOKING FOR WORK", ml: 'എനിക്ക് ജോലി വേണം (തൊഴിലാളി)' },
  iNeedWorkers: { en: 'I NEED WORKERS', ml: 'പണിക്കാരെ വേണം (കോൺട്രാക്ടർ / വീട്ടുടമസ്ഥൻ)' },
  areYouAvailable: {
    en: 'ARE YOU AVAILABLE FOR WORK TODAY?',
    ml: 'ഇന്ന് നിങ്ങൾക്ക് പണിക്ക് പോകാൻ സാധിക്കുമോ?',
  },
  available: { en: 'AVAILABLE', ml: 'പണിക്ക് തയ്യാറാണ്' },
  busy: { en: 'BUSY / WORKING', ml: 'പണിയിലാണ്' },
  notAvailable: { en: 'NOT AVAILABLE', ml: 'ഇന്ന് ലഭ്യമല്ല' },
  availableToday: { en: 'Available Today', ml: 'ഇന്ന് ലഭ്യമാണ്' },
  availableTomorrow: { en: 'Available Tomorrow', ml: 'നാളെ ലഭ്യമാണ്' },
  verifiedWorker: { en: 'Verified Worker', ml: 'തിരിച്ചറിഞ്ഞ തൊഴിലാളി' },
  pendingVerification: { en: 'Verification Pending', ml: 'പരിശോധനയിലാണ്' },
  dailyWage: { en: 'Daily Wage', ml: 'ദിവസക്കൂലി' },
  experience: { en: 'Experience', ml: 'പരിചയം' },
  years: { en: 'years', ml: 'വർഷം' },
  completedJobs: { en: 'Completed Jobs', ml: 'പൂർത്തിയാക്കിയ ജോലികൾ' },
  reviews: { en: 'Reviews', ml: 'അഭിപ്രായങ്ങൾ' },
  requestWorker: { en: 'Request Worker', ml: 'പണിക്ക് വിളിക്കുക' },
  accept: { en: 'ACCEPT', ml: 'സ്വീകരിക്കുക' },
  reject: { en: 'DECLINE', ml: 'നിരസിക്കുക' },
  newWorkRequest: { en: 'New Work Request', ml: 'പുതിയ തൊഴിൽ ക്ഷണം' },
  searchPlaceholder: {
    en: 'Search by skill (Mason, Plumber, Electrician...)',
    ml: 'തൊഴിൽ തിരയുക (മേസ്തിരി, പ്ലംബർ, വയർമാൻ...)',
  },
  allSkills: { en: 'All Trades', ml: 'എല്ലാ തൊഴിലുകളും' },
  location: { en: 'Location', ml: 'സ്ഥലം' },
  filterVerifiedOnly: { en: 'Verified Only', ml: 'തിരിച്ചറിഞ്ഞവർ മാത്രം' },
  filterAvailableToday: { en: 'Available Today', ml: 'ഇന്ന് ലഭ്യമായവർ' },
  postJob: { en: 'Post a Job', ml: 'പുതിയ ജോലി നൽകുക' },
  login: { en: 'Log In', ml: 'ലോഗിൻ' },
  register: { en: 'Register', ml: 'രജിസ്റ്റർ ചെയ്യുക' },
  logout: { en: 'Log Out', ml: 'പുറത്തിറങ്ങുക' },
  dashboard: { en: 'Dashboard', ml: 'ഡാഷ്‌ബോർഡ്' },
  profile: { en: 'Profile', ml: 'പ്രൊഫൈൽ' },
  messages: { en: 'Messages', ml: 'സന്ദേശങ്ങൾ' },
  notifications: { en: 'Notifications', ml: 'അറിയിപ്പുകൾ' },
  phone: { en: 'Mobile Number', ml: 'മൊബൈൽ നമ്പർ' },
  password: { en: 'Password', ml: 'പാസ്‌വേഡ്' },
  fullName: { en: 'Full Name', ml: 'മുഴുവൻ പേര്' },
  role: { en: 'I am a...', ml: 'ഞാൻ ഒരു...' },
  worker: { en: 'Daily-Wage Worker', ml: 'ദിവസവേതന തൊഴിലാളി' },
  employer: { en: 'Contractor / House Owner', ml: 'കോൺട്രാക്ടർ / വീട്ടുടമസ്ഥൻ' },
  admin: { en: 'Administrator', ml: 'അഡ്മിനിസ്ട്രേറ്റർ' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('coolink_language') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('coolink_language', lang);
  };

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][language] || translations[key].en;
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

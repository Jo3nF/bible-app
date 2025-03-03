// Bible service that only uses Reina-Valera Bible
const BIBLE_VERSION = 'reina-valera'; // Only Reina-Valera

export const getBibleVersions = () => {
  // Return only Reina-Valera as the available version
  return [
    {
      id: 'reina-valera',
      name: 'Reina-Valera',
      language: 'es',
      year: '1960',
      isDefault: true
    }
  ];
};

export const getCurrentBibleVersion = () => {
  // Always return Reina-Valera as the current version
  return getBibleVersions()[0];
};

// Other Bible functions continue to work with only Reina-Valera 
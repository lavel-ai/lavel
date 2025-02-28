// packages/schema/src/config/normalization.config.ts
export type NormalizationConfig = {
  enableFeedback: boolean;
  strictness: 'strict' | 'moderate' | 'relaxed';
  localization: {
    defaultLocale: string;
    defaultPhoneRegion: string;
  };
  textNormalization: {
    trimWhitespace: boolean;
    normalizeCase: boolean;
    removeExtraSpaces: boolean;
  };
};

const defaultConfig: NormalizationConfig = {
  enableFeedback: true,
  strictness: process.env.NODE_ENV === 'production' ? 'moderate' : 'relaxed',
  localization: {
    defaultLocale: 'es-MX',
    defaultPhoneRegion: 'MX',
  },
  textNormalization: {
    trimWhitespace: true,
    normalizeCase: true,
    removeExtraSpaces: true,
  },
};

let currentConfig = { ...defaultConfig };

export function getNormalizationConfig(): NormalizationConfig {
  return currentConfig;
}

export function configureNormalization(config: Partial<NormalizationConfig>): void {
  currentConfig = {
    ...currentConfig,
    ...config,
  };
}
/*
  ElevenLabs voice IDs mapped by region, gender, and personality.

  Voice IDs are ElevenLabs pre-built voices. Each region has male and female
  variants; where ElevenLabs doesn't offer a native accent, we fall back to
  the closest available voice.

  Lookup priority in resolveElevenLabsVoiceId():
    1. Explicit nationality + gender + personality
    2. Explicit nationality + gender
    3. Gender + personality (no region)
    4. Gender default
*/

// ─── ElevenLabs voice registry ────────────────────────────────────────────────
// Format: ELEVENLABS_VOICES[region][gender][style] = voiceId
// Styles: default | professional | authoritative | casual | warm | confident
export const ELEVENLABS_VOICES = {
  US: {
    Male: {
      default:        'TxGEqnHWrfWFTfGW9XjX', // Josh
      professional:   'TxGEqnHWrfWFTfGW9XjX', // Josh
      authoritative:  'ErXwobaYiN019PkySvjV', // Antoni
      casual:         'VR6AewLTigWG4xSOukaG', // Arnold
      warm:           'VR6AewLTigWG4xSOukaG', // Arnold
    },
    Female: {
      default:        'EXAVITQu4vr4xnSDxMaL', // Bella
      professional:   'EXAVITQu4vr4xnSDxMaL', // Bella
      confident:      'jsCqWAovK2LkecY7zXl4', // Dorothy
      authoritative:  'jsCqWAovK2LkecY7zXl4', // Dorothy
      warm:           '21m00Tcm4TlvDq8ikWAM', // Rachel
      casual:         'MF3mGyEYCl7XYWbV9V6O', // Elli
    },
  },

  UK: {
    Male: {
      default:        'N2lVS1w4EtoT3dr4eOWO', // Callum – British male
      professional:   'N2lVS1w4EtoT3dr4eOWO', // Callum
      authoritative:  'N2lVS1w4EtoT3dr4eOWO', // Callum
      casual:         'CYw3kZ02Hs0563khs1Fj', // Dave – British casual
      warm:           'CYw3kZ02Hs0563khs1Fj', // Dave
    },
    Female: {
      default:        'ThT5KcBeYPX3keUQqHPh', // Dorothy – British female
      professional:   'ThT5KcBeYPX3keUQqHPh', // Dorothy
      confident:      'ThT5KcBeYPX3keUQqHPh', // Dorothy
      warm:           'AZnzlk1XvdvUeBnXmlld', // Domi – British warm
      casual:         'AZnzlk1XvdvUeBnXmlld', // Domi
    },
  },

  // India – closest available: ElevenLabs "Meera" (Indian English female)
  // and "Rishi" (Indian English male)
  Indian: {
    Male: {
      default:        'giB9SBGRjhHhRPW4JKCE', // Rishi – Indian English male
      professional:   'giB9SBGRjhHhRPW4JKCE',
      authoritative:  'giB9SBGRjhHhRPW4JKCE',
      casual:         'giB9SBGRjhHhRPW4JKCE',
      warm:           'giB9SBGRjhHhRPW4JKCE',
    },
    Female: {
      default:        'nPczCjzI2devNBz1zQrb', // Meera – Indian English female
      professional:   'nPczCjzI2devNBz1zQrb',
      confident:      'nPczCjzI2devNBz1zQrb',
      warm:           'nPczCjzI2devNBz1zQrb',
      casual:         'nPczCjzI2devNBz1zQrb',
    },
  },

  Australian: {
    Male: {
      default:        'ZQe5CZNOzWyzPSCn5a3c', // James – Australian male
      professional:   'ZQe5CZNOzWyzPSCn5a3c',
      authoritative:  'ZQe5CZNOzWyzPSCn5a3c',
      casual:         'ZQe5CZNOzWyzPSCn5a3c',
      warm:           'ZQe5CZNOzWyzPSCn5a3c',
    },
    Female: {
      default:        'Zlb1dXrM653N07WRdFW3', // Nicole – Australian female
      professional:   'Zlb1dXrM653N07WRdFW3',
      confident:      'Zlb1dXrM653N07WRdFW3',
      warm:           'Zlb1dXrM653N07WRdFW3',
      casual:         'Zlb1dXrM653N07WRdFW3',
    },
  },

  // African accents: fallback to neutral US voices but noting the persona context.
  // ElevenLabs does not yet have dedicated Nigerian/Ghanaian/South African voices
  // in their default library; we use the closest warm/neutral voices.
  Nigerian: {
    Male: {
      default:        'pNInz6obpgDQGcFmaJgB', // Adam – neutral, warm
      professional:   'TxGEqnHWrfWFTfGW9XjX',
      authoritative:  'ErXwobaYiN019PkySvjV',
      casual:         'VR6AewLTigWG4xSOukaG',
      warm:           'pNInz6obpgDQGcFmaJgB',
    },
    Female: {
      default:        '21m00Tcm4TlvDq8ikWAM', // Rachel – warm neutral
      professional:   'EXAVITQu4vr4xnSDxMaL',
      confident:      'jsCqWAovK2LkecY7zXl4',
      warm:           '21m00Tcm4TlvDq8ikWAM',
      casual:         'MF3mGyEYCl7XYWbV9V6O',
    },
  },

  Ghanaian: {
    Male: {
      default:        'pNInz6obpgDQGcFmaJgB',
      professional:   'TxGEqnHWrfWFTfGW9XjX',
      authoritative:  'ErXwobaYiN019PkySvjV',
      casual:         'VR6AewLTigWG4xSOukaG',
      warm:           'pNInz6obpgDQGcFmaJgB',
    },
    Female: {
      default:        '21m00Tcm4TlvDq8ikWAM',
      professional:   'EXAVITQu4vr4xnSDxMaL',
      confident:      'jsCqWAovK2LkecY7zXl4',
      warm:           '21m00Tcm4TlvDq8ikWAM',
      casual:         'MF3mGyEYCl7XYWbV9V6O',
    },
  },

  'South African': {
    Male: {
      default:        'pNInz6obpgDQGcFmaJgB',
      professional:   'TxGEqnHWrfWFTfGW9XjX',
      authoritative:  'ErXwobaYiN019PkySvjV',
      casual:         'VR6AewLTigWG4xSOukaG',
      warm:           'pNInz6obpgDQGcFmaJgB',
    },
    Female: {
      default:        'EXAVITQu4vr4xnSDxMaL',
      professional:   'EXAVITQu4vr4xnSDxMaL',
      confident:      'jsCqWAovK2LkecY7zXl4',
      warm:           '21m00Tcm4TlvDq8ikWAM',
      casual:         'MF3mGyEYCl7XYWbV9V6O',
    },
  },

  // Middle East / Arabic region: ElevenLabs doesn't have Arabic-accented English
  // pre-built voices; use professional US voices with formal style.
  Arabic: {
    Male: {
      default:        'ErXwobaYiN019PkySvjV', // Antoni – formal/authoritative
      professional:   'ErXwobaYiN019PkySvjV',
      authoritative:  'ErXwobaYiN019PkySvjV',
      casual:         'TxGEqnHWrfWFTfGW9XjX',
      warm:           'TxGEqnHWrfWFTfGW9XjX',
    },
    Female: {
      default:        'jsCqWAovK2LkecY7zXl4', // Dorothy – confident/formal
      professional:   'jsCqWAovK2LkecY7zXl4',
      confident:      'jsCqWAovK2LkecY7zXl4',
      warm:           'EXAVITQu4vr4xnSDxMaL',
      casual:         'MF3mGyEYCl7XYWbV9V6O',
    },
  },

  Canadian: {
    Male: {
      default:        'TxGEqnHWrfWFTfGW9XjX',
      professional:   'TxGEqnHWrfWFTfGW9XjX',
      authoritative:  'ErXwobaYiN019PkySvjV',
      casual:         'VR6AewLTigWG4xSOukaG',
      warm:           'VR6AewLTigWG4xSOukaG',
    },
    Female: {
      default:        '21m00Tcm4TlvDq8ikWAM',
      professional:   'EXAVITQu4vr4xnSDxMaL',
      confident:      'jsCqWAovK2LkecY7zXl4',
      warm:           '21m00Tcm4TlvDq8ikWAM',
      casual:         'MF3mGyEYCl7XYWbV9V6O',
    },
  },

  // Fallback / default region
  Default: {
    Male: {
      default:        'TxGEqnHWrfWFTfGW9XjX',
      professional:   'TxGEqnHWrfWFTfGW9XjX',
      authoritative:  'ErXwobaYiN019PkySvjV',
      casual:         'VR6AewLTigWG4xSOukaG',
      warm:           'VR6AewLTigWG4xSOukaG',
    },
    Female: {
      default:        'EXAVITQu4vr4xnSDxMaL',
      professional:   'EXAVITQu4vr4xnSDxMaL',
      confident:      'jsCqWAovK2LkecY7zXl4',
      authoritative:  'jsCqWAovK2LkecY7zXl4',
      warm:           '21m00Tcm4TlvDq8ikWAM',
      casual:         'MF3mGyEYCl7XYWbV9V6O',
    },
    'Non-binary': {
      default:        'pNInz6obpgDQGcFmaJgB',
      warm:           'yoZ06aMxZJJ28mfd3POQ',
    },
  },
};

// Legacy flat map for backwards-compat (voice key → ElevenLabs ID)
const LEGACY_VOICE_KEYS = {
  english_male:               'TxGEqnHWrfWFTfGW9XjX',
  english_male_casual:        'VR6AewLTigWG4xSOukaG',
  english_male_authoritative: 'ErXwobaYiN019PkySvjV',
  english_male_deep:          'N2lVS1w4EtoT3dr4eOWO',
  english_female:             'EXAVITQu4vr4xnSDxMaL',
  english_female_friendly:    'MF3mGyEYCl7XYWbV9V6O',
  english_female_confident:   'jsCqWAovK2LkecY7zXl4',
  english_female_warm:        '21m00Tcm4TlvDq8ikWAM',
  english_neutral:            'pNInz6obpgDQGcFmaJgB',
  english_neutral_warm:       'yoZ06aMxZJJ28mfd3POQ',
};

function personalityToStyle(personality = '') {
  const p = personality.toLowerCase();
  if (/authoritative|aggressive|assertive|rude|direct/i.test(p)) return 'authoritative';
  if (/confident|skeptical|formal|professional/i.test(p)) return 'confident';
  if (/casual|chatty|friendly|nice|enthusiastic|cooperative/i.test(p)) return 'casual';
  if (/warm|empathetic|understanding/i.test(p)) return 'warm';
  return 'default';
}

/**
 * Resolves the correct ElevenLabs voice ID for a bot/prospect.
 *
 * Priority:
 *  1. If voiceId is already a raw ElevenLabs ID (not a key name), use it directly
 *  2. Resolve legacy voice key string
 *  3. Region (nationality) + gender + personality style
 *  4. Gender + personality style (no region)
 *  5. Gender default
 */
export function resolveElevenLabsVoiceId(bot = {}) {
  const { voiceId, voice, gender = 'Male', personality = '', nationality = '' } = bot;

  // 1. Raw ElevenLabs ID passed directly (not a named key)
  if (voiceId && !LEGACY_VOICE_KEYS[voiceId] && voiceId.length > 15) {
    return voiceId;
  }

  // 2. Legacy voice key
  const legacyKey = voiceId || voice;
  if (legacyKey && LEGACY_VOICE_KEYS[legacyKey]) {
    return LEGACY_VOICE_KEYS[legacyKey];
  }

  const style = personalityToStyle(personality);
  const genderKey = gender === 'Female' ? 'Female' : gender === 'Non-binary' ? 'Non-binary' : 'Male';

  // 3. Region-specific voice
  if (nationality) {
    const regionMap = ELEVENLABS_VOICES[nationality];
    if (regionMap) {
      const genderMap = regionMap[genderKey] || regionMap['Male'];
      if (genderMap) {
        return genderMap[style] || genderMap.professional || genderMap.default;
      }
    }
  }

  // 4. Default region fallback
  const defaultMap = ELEVENLABS_VOICES.Default[genderKey] || ELEVENLABS_VOICES.Default.Male;
  return defaultMap[style] || defaultMap.professional || defaultMap.default;
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

export const NATIONALITY_OPTIONS = [
  { value: 'US',            label: 'American (US English)' },
  { value: 'UK',            label: 'British (UK English)' },
  { value: 'Australian',    label: 'Australian' },
  { value: 'Canadian',      label: 'Canadian' },
  { value: 'Indian',        label: 'Indian (Indian English)' },
  { value: 'Nigerian',      label: 'Nigerian' },
  { value: 'Ghanaian',      label: 'Ghanaian' },
  { value: 'South African', label: 'South African' },
  { value: 'Arabic',        label: 'Middle Eastern / Arabic' },
];

export const VOICE_OPTIONS = {
  male: [
    { value: 'english_male',               label: 'English Male - Professional', gender: 'Male' },
    { value: 'english_male_casual',        label: 'English Male - Casual',       gender: 'Male' },
    { value: 'english_male_authoritative', label: 'English Male - Authoritative', gender: 'Male' },
    { value: 'english_male_deep',          label: 'English Male - Deep',          gender: 'Male' },
  ],
  female: [
    { value: 'english_female',           label: 'English Female - Professional', gender: 'Female' },
    { value: 'english_female_friendly',  label: 'English Female - Friendly',    gender: 'Female' },
    { value: 'english_female_confident', label: 'English Female - Confident',   gender: 'Female' },
    { value: 'english_female_warm',      label: 'English Female - Warm',        gender: 'Female' },
  ],
  neutral: [
    { value: 'english_neutral',      label: 'English Neutral - Professional', gender: 'Non-binary' },
    { value: 'english_neutral_warm', label: 'English Neutral - Warm',        gender: 'Non-binary' },
  ],
};

export const ALL_VOICES = [
  ...VOICE_OPTIONS.male,
  ...VOICE_OPTIONS.female,
  ...VOICE_OPTIONS.neutral,
];

export function getVoicesByGender(gender) {
  switch (gender) {
    case 'Male':      return VOICE_OPTIONS.male;
    case 'Female':    return VOICE_OPTIONS.female;
    case 'Non-binary': return VOICE_OPTIONS.neutral;
    default:          return ALL_VOICES;
  }
}

export function getDefaultVoiceForGender(gender) {
  switch (gender) {
    case 'Male':      return 'english_male';
    case 'Female':    return 'english_female';
    case 'Non-binary': return 'english_neutral';
    default:          return 'english_male';
  }
}

export const GENDER_OPTIONS = [
  { value: 'Male',       label: 'Male',       icon: '♂️' },
  { value: 'Female',     label: 'Female',     icon: '♀️' },
  { value: 'Non-binary', label: 'Non-binary', icon: '⚥' },
];

export const PERSONA_TYPES = [
  { value: 'Technical Buyer',  label: 'Technical Buyer' },
  { value: 'Business Buyer',   label: 'Business Buyer' },
  { value: 'Executive',        label: 'Executive' },
  { value: 'End User',         label: 'End User' },
  { value: 'Champion',         label: 'Champion' },
  { value: 'Influencer',       label: 'Influencer' },
  { value: 'Gatekeeper',       label: 'Gatekeeper' },
  { value: 'Decision Maker',   label: 'Decision Maker' },
  { value: 'Economic Buyer',   label: 'Economic Buyer' },
];

export const PERSONALITY_TYPES = [
  { value: 'Analytical',   label: 'Analytical' },
  { value: 'Friendly',     label: 'Friendly' },
  { value: 'Skeptical',    label: 'Skeptical' },
  { value: 'Enthusiastic', label: 'Enthusiastic' },
  { value: 'Reserved',     label: 'Reserved' },
  { value: 'Aggressive',   label: 'Aggressive' },
  { value: 'Cooperative',  label: 'Cooperative' },
  { value: 'Indecisive',   label: 'Indecisive' },
];

export const ROLEPLAY_TYPES = [
  { value: 'Cold Call',          label: 'Cold Call' },
  { value: 'Discovery Call',     label: 'Discovery Call' },
  { value: 'Demo Call',          label: 'Demo Call' },
  { value: 'Negotiation',        label: 'Negotiation' },
  { value: 'Follow-up',          label: 'Follow-up' },
  { value: 'Objection Handling', label: 'Objection Handling' },
  { value: 'Closing',            label: 'Closing' },
];

/** Returns a human-readable description of the voice that will be used. */
export function getVoiceDescription(bot = {}) {
  const { gender = 'Male', personality = '', nationality = '' } = bot;
  const nationalityLabel = nationality
    ? NATIONALITY_OPTIONS.find(n => n.value === nationality)?.label || nationality
    : null;
  const style = personalityToStyle(personality);
  const styleLabel = style === 'default' ? 'professional' : style;

  if (nationalityLabel) {
    return `${nationalityLabel} ${gender.toLowerCase()} voice, ${styleLabel} tone`;
  }
  return `${gender} voice, ${styleLabel} tone`;
}

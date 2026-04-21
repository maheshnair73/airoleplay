// ElevenLabs pre-built voice IDs mapped by gender and personality tone.
// These are ElevenLabs' publicly available default voices.
export const ELEVENLABS_VOICES = {
  // Male voices
  english_male: 'TxGEqnHWrfWFTfGW9XjX',           // Josh - professional male
  english_male_casual: 'VR6AewLTigWG4xSOukaG',      // Arnold - casual male
  english_male_authoritative: 'ErXwobaYiN019PkySvjV', // Antoni - authoritative male
  english_male_deep: 'N2lVS1w4EtoT3dr4eOWO',         // Callum - deep/formal

  // Female voices
  english_female: 'EXAVITQu4vr4xnSDxMaL',           // Bella - professional female
  english_female_friendly: 'MF3mGyEYCl7XYWbV9V6O',  // Elli - friendly female
  english_female_confident: 'jsCqWAovK2LkecY7zXl4',  // Dorothy - confident female
  english_female_warm: '21m00Tcm4TlvDq8ikWAM',        // Rachel - warm female

  // Neutral/non-binary
  english_neutral: 'pNInz6obpgDQGcFmaJgB',           // Adam - neutral professional
  english_neutral_warm: 'yoZ06aMxZJJ28mfd3POQ',       // Sam - warm neutral
};

// Personality to voice style hints
const PERSONALITY_VOICE_MAP = {
  // Male personalities
  Analytical: 'english_male',
  Reserved: 'english_male',
  Skeptical: 'english_male_authoritative',
  Aggressive: 'english_male_authoritative',
  Friendly: 'english_male_casual',
  Enthusiastic: 'english_male_casual',
  Cooperative: 'english_male_casual',
  Indecisive: 'english_male',
};

export const VOICE_OPTIONS = {
  male: [
    { value: 'english_male', label: 'English Male - Professional', gender: 'Male' },
    { value: 'english_male_casual', label: 'English Male - Casual', gender: 'Male' },
    { value: 'english_male_authoritative', label: 'English Male - Authoritative', gender: 'Male' },
    { value: 'english_male_deep', label: 'English Male - Deep', gender: 'Male' },
  ],
  female: [
    { value: 'english_female', label: 'English Female - Professional', gender: 'Female' },
    { value: 'english_female_friendly', label: 'English Female - Friendly', gender: 'Female' },
    { value: 'english_female_confident', label: 'English Female - Confident', gender: 'Female' },
    { value: 'english_female_warm', label: 'English Female - Warm', gender: 'Female' },
  ],
  neutral: [
    { value: 'english_neutral', label: 'English Neutral - Professional', gender: 'Non-binary' },
    { value: 'english_neutral_warm', label: 'English Neutral - Warm', gender: 'Non-binary' },
  ]
};

export const ALL_VOICES = [
  ...VOICE_OPTIONS.male,
  ...VOICE_OPTIONS.female,
  ...VOICE_OPTIONS.neutral
];

export function getVoicesByGender(gender) {
  switch (gender) {
    case 'Male':
      return VOICE_OPTIONS.male;
    case 'Female':
      return VOICE_OPTIONS.female;
    case 'Non-binary':
      return VOICE_OPTIONS.neutral;
    default:
      return ALL_VOICES;
  }
}

export function getDefaultVoiceForGender(gender) {
  switch (gender) {
    case 'Male':
      return 'english_male';
    case 'Female':
      return 'english_female';
    case 'Non-binary':
      return 'english_neutral';
    default:
      return 'english_male';
  }
}

/**
 * Resolves the correct ElevenLabs voice ID based on the bot's gender and personality.
 * Falls back gracefully through: voice key -> gender+personality -> gender default -> male default.
 */
export function resolveElevenLabsVoiceId(bot) {
  const voiceKey = bot.voice || bot.voiceKey;
  const gender = bot.gender || 'Male';
  const personality = bot.personality || '';

  // If an explicit voice key is set and maps to an ElevenLabs ID, use it
  if (voiceKey && ELEVENLABS_VOICES[voiceKey]) {
    return ELEVENLABS_VOICES[voiceKey];
  }

  // Match by gender + personality
  if (gender === 'Female') {
    if (/confident|assertive|aggressive|authoritative/i.test(personality)) {
      return ELEVENLABS_VOICES.english_female_confident;
    }
    if (/warm|friendly|nice|enthusiastic|cooperative/i.test(personality)) {
      return ELEVENLABS_VOICES.english_female_friendly;
    }
    return ELEVENLABS_VOICES.english_female;
  }

  if (gender === 'Non-binary') {
    if (/warm|friendly|nice/i.test(personality)) {
      return ELEVENLABS_VOICES.english_neutral_warm;
    }
    return ELEVENLABS_VOICES.english_neutral;
  }

  // Default: Male
  if (/authoritative|aggressive|assertive|skeptical|formal/i.test(personality)) {
    return ELEVENLABS_VOICES.english_male_authoritative;
  }
  if (/casual|friendly|enthusiastic|cooperative/i.test(personality)) {
    return ELEVENLABS_VOICES.english_male_casual;
  }
  return ELEVENLABS_VOICES.english_male;
}

export const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male', icon: '♂️' },
  { value: 'Female', label: 'Female', icon: '♀️' },
  { value: 'Non-binary', label: 'Non-binary', icon: '⚥' }
];

export const PERSONA_TYPES = [
  { value: 'Technical Buyer', label: 'Technical Buyer' },
  { value: 'Business Buyer', label: 'Business Buyer' },
  { value: 'Executive', label: 'Executive' },
  { value: 'End User', label: 'End User' },
  { value: 'Champion', label: 'Champion' },
  { value: 'Influencer', label: 'Influencer' },
  { value: 'Gatekeeper', label: 'Gatekeeper' },
  { value: 'Decision Maker', label: 'Decision Maker' },
  { value: 'Economic Buyer', label: 'Economic Buyer' }
];

export const PERSONALITY_TYPES = [
  { value: 'Analytical', label: 'Analytical' },
  { value: 'Friendly', label: 'Friendly' },
  { value: 'Skeptical', label: 'Skeptical' },
  { value: 'Enthusiastic', label: 'Enthusiastic' },
  { value: 'Reserved', label: 'Reserved' },
  { value: 'Aggressive', label: 'Aggressive' },
  { value: 'Cooperative', label: 'Cooperative' },
  { value: 'Indecisive', label: 'Indecisive' }
];

export const ROLEPLAY_TYPES = [
  { value: 'Cold Call', label: 'Cold Call' },
  { value: 'Discovery Call', label: 'Discovery Call' },
  { value: 'Demo Call', label: 'Demo Call' },
  { value: 'Negotiation', label: 'Negotiation' },
  { value: 'Follow-up', label: 'Follow-up' },
  { value: 'Objection Handling', label: 'Objection Handling' },
  { value: 'Closing', label: 'Closing' }
];

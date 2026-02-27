export const VOICE_OPTIONS = {
  male: [
    { value: 'english_male', label: 'English Male - Professional', gender: 'Male' },
    { value: 'english_male_casual', label: 'English Male - Casual', gender: 'Male' },
    { value: 'english_male_authoritative', label: 'English Male - Authoritative', gender: 'Male' },
  ],
  female: [
    { value: 'english_female', label: 'English Female - Professional', gender: 'Female' },
    { value: 'english_female_friendly', label: 'English Female - Friendly', gender: 'Female' },
    { value: 'english_female_confident', label: 'English Female - Confident', gender: 'Female' },
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

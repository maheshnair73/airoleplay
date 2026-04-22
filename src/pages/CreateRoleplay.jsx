import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { User } from '@/api/entities';
import {
  ArrowLeft, Upload, Plus, X, CheckCircle2, Zap, BookOpen,
  FileText, Target, Users, Save, Library, UserPlus, Check,
  ChevronDown, Search
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import FrameworkSelector from '@/components/roleplay/FrameworkSelector';
import { ALL_VOICES } from '@/utils/voiceMapping';

// ── Constants ─────────────────────────────────────────────────────────────────

const INDUSTRIES = [
  'Technology & SaaS', 'Financial Services', 'Healthcare & Life Sciences',
  'Manufacturing & Industrial', 'Retail & E-commerce', 'Real Estate',
  'Professional Services', 'Education & EdTech', 'Energy & Utilities',
  'Logistics & Supply Chain', 'Media & Entertainment', 'Government & Public Sector',
  'Non-Profit', 'Hospitality & Travel', 'Construction', 'Telecommunications',
  'Legal Services', 'Insurance', 'Automotive', 'Other'
];

const PERSONALITY_TRAITS = [
  'Assertive', 'Collaborative', 'Cautious', 'Optimistic', 'Skeptical',
  'Technical', 'Non-Technical', 'Busy', 'Detailed', 'Direct',
  'Friendly', 'Formal', 'Curious', 'Risk-Averse', 'Growth-Focused',
  'Analytical', 'Impatient', 'Empathetic', 'Competitive', 'Creative'
];

const BUYING_STAGES = [
  'Problem Unaware', 'Problem Aware', 'Solution Aware',
  'Product Aware', 'Ready to Buy', 'Negotiation Phase'
];

const DEMEANORS = [
  'Friendly & Open', 'Skeptical but polite', 'Busy & impatient',
  'Very analytical', 'Hostile / challenging', 'Warm & collaborative',
  'Formal & reserved', 'Enthusiastic', 'Cautious & risk-averse'
];

// Diverse avatar set from Pexels — professional headshots, varied ethnicity
const AVATARS = [
  { id: 1,  url: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?w=200&h=200&fit=crop', label: 'Professional Man 1' },
  { id: 2,  url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=200&h=200&fit=crop', label: 'Professional Woman 1' },
  { id: 3,  url: 'https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?w=200&h=200&fit=crop', label: 'Professional Man 2' },
  { id: 4,  url: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?w=200&h=200&fit=crop', label: 'Professional Woman 2' },
  { id: 5,  url: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?w=200&h=200&fit=crop', label: 'Professional Man 3' },
  { id: 6,  url: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?w=200&h=200&fit=crop', label: 'Professional Woman 3' },
  { id: 7,  url: 'https://images.pexels.com/photos/3785104/pexels-photo-3785104.jpeg?w=200&h=200&fit=crop', label: 'Professional Man 4' },
  { id: 8,  url: 'https://images.pexels.com/photos/3756681/pexels-photo-3756681.jpeg?w=200&h=200&fit=crop', label: 'Professional Woman 4' },
  { id: 9,  url: 'https://images.pexels.com/photos/5792641/pexels-photo-5792641.jpeg?w=200&h=200&fit=crop', label: 'Professional Man 5' },
  { id: 10, url: 'https://images.pexels.com/photos/3671083/pexels-photo-3671083.jpeg?w=200&h=200&fit=crop', label: 'Professional Woman 5' },
  { id: 11, url: 'https://images.pexels.com/photos/2220316/pexels-photo-2220316.jpeg?w=200&h=200&fit=crop', label: 'Professional Man 6' },
  { id: 12, url: 'https://images.pexels.com/photos/3756678/pexels-photo-3756678.jpeg?w=200&h=200&fit=crop', label: 'Professional Woman 6' },
  { id: 13, url: 'https://images.pexels.com/photos/1181695/pexels-photo-1181695.jpeg?w=200&h=200&fit=crop', label: 'Professional Man 7' },
  { id: 14, url: 'https://images.pexels.com/photos/3776932/pexels-photo-3776932.jpeg?w=200&h=200&fit=crop', label: 'Professional Woman 7' },
  { id: 15, url: 'https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg?w=200&h=200&fit=crop', label: 'Professional Man 8' },
  { id: 16, url: 'https://images.pexels.com/photos/3756680/pexels-photo-3756680.jpeg?w=200&h=200&fit=crop', label: 'Professional Woman 8' },
  { id: 17, url: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?w=200&h=200&fit=crop', label: 'Professional Man 9' },
  { id: 18, url: 'https://images.pexels.com/photos/3783725/pexels-photo-3783725.jpeg?w=200&h=200&fit=crop', label: 'Professional Woman 9' },
];

const EMPTY_PERSONA = () => ({
  name: '', title: '', company: '', demeanor: '', traits: [],
  buyingStage: '', background: [], details: '', avatar_url: null,
  voice: '',
  _mode: 'build', // 'build' | 'library'
  _libraryId: null,
});

const steps = [
  { id: 'basic',     label: 'Basic Info',  icon: Zap },
  { id: 'scenario',  label: 'Scenario',    icon: Target },
  { id: 'framework', label: 'Evaluation',  icon: Target },
  { id: 'personas',  label: 'Personas',    icon: Users },
  { id: 'materials', label: 'Materials',   icon: BookOpen },
  { id: 'review',    label: 'Review',      icon: CheckCircle2 },
];

// ── All voices with accent filter tags ────────────────────────────────────────
const ALL_VOICE_OPTIONS = [
  // American
  { value: 'mark',        name: 'Mark',       accent: 'American', tag: 'Friendly',      gender: 'Male' },
  { value: 'chris',       name: 'Chris',      accent: 'American', tag: 'Upbeat',         gender: 'Male' },
  { value: 'austin',      name: 'Austin',     accent: 'American', tag: 'Southern',       gender: 'Male' },
  { value: 'cassidy',     name: 'Cassidy',    accent: 'American', tag: 'Grounded',       gender: 'Male' },
  { value: 'christopher', name: 'Christopher',accent: 'American', tag: 'Midwestern',     gender: 'Male' },
  { value: 'edwin',       name: 'Edwin',      accent: 'American', tag: 'Confident',      gender: 'Male' },
  { value: 'freya',       name: 'Freya',      accent: 'American', tag: 'Californian',    gender: 'Female' },
  { value: 'geraldine',   name: 'Geraldine',  accent: 'American', tag: 'Southern',       gender: 'Female' },
  { value: 'hope',        name: 'Hope',       accent: 'American', tag: 'Casual',         gender: 'Female' },
  { value: 'jamal',       name: 'Jamal',      accent: 'American', tag: 'Smooth',         gender: 'Male' },
  { value: 'jen',         name: 'Jen',        accent: 'American', tag: 'Bright',         gender: 'Female' },
  { value: 'jerry',       name: 'Jerry',      accent: 'American', tag: 'Bostonian',      gender: 'Male' },
  { value: 'joe',         name: 'Joe',        accent: 'American', tag: 'Confident',      gender: 'Male' },
  { value: 'joseph',      name: 'Joseph',     accent: 'American', tag: 'Hesitant',       gender: 'Male' },
  { value: 'karen',       name: 'Karen',      accent: 'American', tag: 'Professional',   gender: 'Female' },
  { value: 'marcus',      name: 'Marcus',     accent: 'American', tag: 'Deep',           gender: 'Male' },
  { value: 'naomi',       name: 'Naomi',      accent: 'American', tag: 'Warm',           gender: 'Female' },
  // Australian
  { value: 'emma',        name: 'Emma',       accent: 'Australian', tag: 'Confident',    gender: 'Female' },
  { value: 'lee',         name: 'Lee',        accent: 'Australian', tag: 'Warm',         gender: 'Male' },
  { value: 'mia',         name: 'Mia',        accent: 'Australian', tag: 'Friendly',     gender: 'Female' },
  { value: 'ryan',        name: 'Ryan',       accent: 'Australian', tag: 'Casual',       gender: 'Male' },
  // British
  { value: 'alex',        name: 'Alex',       accent: 'British',    tag: 'Calm',         gender: 'Male' },
  { value: 'isla',        name: 'Isla',       accent: 'British',    tag: 'Scottish',     gender: 'Female' },
  { value: 'john',        name: 'John',       accent: 'British',    tag: 'Northern',     gender: 'Male' },
  { value: 'lily',        name: 'Lily',       accent: 'British',    tag: 'Narrative',    gender: 'Female' },
  { value: 'oliver',      name: 'Oliver',     accent: 'British',    tag: 'Professional', gender: 'Male' },
  { value: 'sophie',      name: 'Sophie',     accent: 'British',    tag: 'Warm',         gender: 'Female' },
  // French
  { value: 'jean',        name: 'Jean',       accent: 'French',     tag: 'Pleasant',     gender: 'Male' },
  { value: 'claire',      name: 'Claire',     accent: 'French',     tag: 'Elegant',      gender: 'Female' },
  { value: 'pierre',      name: 'Pierre',     accent: 'French',     tag: 'Formal',       gender: 'Male' },
  { value: 'amelie',      name: 'Amelie',     accent: 'French',     tag: 'Warm',         gender: 'Female' },
  // Indian English
  { value: 'gulab',       name: 'Gulab',      accent: 'Indian English', tag: 'Confident',gender: 'Male' },
  { value: 'priya',       name: 'Priya',      accent: 'Indian English', tag: 'Friendly', gender: 'Female' },
  { value: 'arjun',       name: 'Arjun',      accent: 'Indian English', tag: 'Professional', gender: 'Male' },
  { value: 'meera',       name: 'Meera',      accent: 'Indian English', tag: 'Warm',     gender: 'Female' },
  { value: 'rishi',       name: 'Rishi',      accent: 'Indian English', tag: 'Calm',     gender: 'Male' },
  { value: 'kavya',       name: 'Kavya',      accent: 'Indian English', tag: 'Upbeat',   gender: 'Female' },
  // Arabic
  { value: 'haytham',     name: 'Haytham',    accent: 'Arabic',     tag: 'Warm',         gender: 'Male' },
  { value: 'layla',       name: 'Layla',      accent: 'Arabic',     tag: 'Professional', gender: 'Female' },
  { value: 'omar',        name: 'Omar',       accent: 'Arabic',     tag: 'Confident',    gender: 'Male' },
  { value: 'sara',        name: 'Sara',       accent: 'Arabic',     tag: 'Friendly',     gender: 'Female' },
  { value: 'khalid',      name: 'Khalid',     accent: 'Arabic',     tag: 'Formal',       gender: 'Male' },
  { value: 'nour',        name: 'Nour',       accent: 'Arabic',     tag: 'Calm',         gender: 'Female' },
  // Other
  { value: 'ellen',       name: 'Ellen',      accent: 'Other',      tag: 'Calm · German',gender: 'Female' },
  { value: 'akio',        name: 'Akio',       accent: 'Other',      tag: 'Formal · Japanese', gender: 'Male' },
  { value: 'sofia',       name: 'Sofia',      accent: 'Other',      tag: 'Warm · Spanish', gender: 'Female' },
  { value: 'luca',        name: 'Luca',       accent: 'Other',      tag: 'Friendly · Italian', gender: 'Male' },
];

const ACCENT_FILTERS = ['All', 'American', 'Australian', 'British', 'French', 'Indian English', 'Arabic', 'Other'];

// ── Voice Picker ──────────────────────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Cache audio blobs so repeat clicks don't re-fetch
const voiceAudioCache = {};
let currentAudio = null;

async function previewVoice(voiceKey) {
  // Stop any currently playing audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  if (!voiceAudioCache[voiceKey]) {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/voice-preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ voiceKey }),
    });
    if (!res.ok) throw new Error('Preview unavailable');
    const blob = await res.blob();
    voiceAudioCache[voiceKey] = URL.createObjectURL(blob);
  }

  const audio = new Audio(voiceAudioCache[voiceKey]);
  currentAudio = audio;
  audio.play();
}

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

const StopIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
    <path d="M6 6h12v12H6z"/>
  </svg>
);

const SpeakerIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
  </svg>
);

function VoicePicker({ value, onChange }) {
  const [accent, setAccent] = useState('All');
  const [loadingKey, setLoadingKey] = useState(null);
  const [playingKey, setPlayingKey] = useState(null);

  const visible = accent === 'All'
    ? ALL_VOICE_OPTIONS
    : ALL_VOICE_OPTIONS.filter(v => v.accent === accent);

  const selectedVoice = ALL_VOICE_OPTIONS.find(v => v.value === value);

  const handlePreview = async (e, voiceKey) => {
    e.stopPropagation();

    // If already playing this one, stop it
    if (playingKey === voiceKey) {
      if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; currentAudio = null; }
      setPlayingKey(null);
      return;
    }

    setLoadingKey(voiceKey);
    setPlayingKey(null);
    try {
      await previewVoice(voiceKey);
      setPlayingKey(voiceKey);
      // Clear playing state when audio ends
      if (currentAudio) {
        currentAudio.onended = () => setPlayingKey(null);
      }
    } catch {
      toast.error('Voice preview unavailable — ElevenLabs key not configured');
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <div>
      <Label className="font-medium mb-1 block">Voice</Label>
      <p className="text-xs text-slate-500 mb-3">Choose the primary voice for this persona. Click the play button to preview.</p>

      {/* Accent filter pills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {ACCENT_FILTERS.map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setAccent(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              accent === f
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Voice grid — 3-col */}
      <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
        {visible.map(v => {
          const isSelected = value === v.value;
          const isLoading = loadingKey === v.value;
          const isPlaying = playingKey === v.value;

          return (
            <div
              key={v.value + v.name}
              onClick={() => onChange(isSelected ? '' : v.value)}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {/* Play/stop preview button */}
              <button
                type="button"
                onClick={(e) => handlePreview(e, v.value)}
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  isPlaying
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : isLoading
                    ? 'bg-slate-200 text-slate-400'
                    : isSelected
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
                title={isPlaying ? 'Stop' : 'Preview voice'}
              >
                {isLoading ? (
                  <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                ) : isPlaying ? (
                  <StopIcon />
                ) : (
                  <PlayIcon />
                )}
              </button>

              <div className="min-w-0 flex-1">
                <p className={`text-xs font-semibold truncate ${isSelected ? 'text-blue-800' : 'text-slate-800'}`}>
                  {v.name}
                </p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide truncate leading-tight">
                  {v.tag}{v.accent !== 'Other' ? `, ${v.accent}` : ''}
                </p>
              </div>

              {isSelected && (
                <Check className="w-3 h-3 text-blue-600 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {selectedVoice && (
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
            <SpeakerIcon />
          </div>
          <span>Selected: <strong>{selectedVoice.name}</strong> — {selectedVoice.tag}, {selectedVoice.accent}</span>
          <button type="button" onClick={() => onChange('')} className="ml-auto text-slate-400 hover:text-red-500">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Avatar Picker ─────────────────────────────────────────────────────────────
function AvatarPicker({ value, onChange }) {
  return (
    <div>
      <Label className="font-medium mb-2 block">Avatar</Label>
      <p className="text-xs text-slate-500 mb-3">Choose an avatar to represent this persona</p>
      <div className="grid grid-cols-6 gap-2">
        {AVATARS.map(av => (
          <button
            key={av.id}
            type="button"
            onClick={() => onChange(value === av.url ? null : av.url)}
            className={`relative rounded-full overflow-hidden aspect-square border-2 transition-all hover:scale-105 ${
              value === av.url ? 'border-blue-600 ring-2 ring-blue-300' : 'border-transparent hover:border-slate-300'
            }`}
          >
            <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
            {value === av.url && (
              <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-white drop-shadow" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Library Persona Card ──────────────────────────────────────────────────────
function LibraryCard({ client, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-xl border-2 transition-all hover:shadow-md ${
        selected ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className="flex items-center gap-3">
        {client.avatar_url ? (
          <img src={client.avatar_url} alt={client.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 flex-shrink-0">
            {client.name?.[0] || '?'}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-semibold text-sm text-slate-900 truncate">{client.name}</p>
          <p className="text-xs text-slate-500 truncate">{client.title}{client.company_name ? ` · ${client.company_name}` : ''}</p>
          {client.personality && (
            <Badge variant="outline" className="text-[10px] mt-1">{client.personality}</Badge>
          )}
        </div>
        {selected && <Check className="w-4 h-4 text-blue-600 flex-shrink-0 ml-auto" />}
      </div>
    </button>
  );
}

// ── Persona Form ──────────────────────────────────────────────────────────────
function PersonaForm({ persona, idx, onChange, onRemove, canRemove, libraryClients, libraryLoading }) {
  const [bgInput, setBgInput] = useState('');
  const [libSearch, setLibSearch] = useState('');

  const filtered = libraryClients.filter(c =>
    !libSearch || `${c.name} ${c.title} ${c.personality}`.toLowerCase().includes(libSearch.toLowerCase())
  );

  const handleLibrarySelect = (client) => {
    onChange('_libraryId', client.id);
    onChange('_mode', 'library');
    onChange('name', client.name || '');
    onChange('title', client.title || '');
    onChange('company', client.company_name || client.company || '');
    onChange('demeanor', client.personality || '');
    onChange('traits', client.traits || []);
    onChange('background', client.background ? [client.background] : []);
    onChange('details', client.background || '');
    onChange('avatar_url', client.avatar_url || null);
    onChange('voice', client.voice || client.voiceId || '');
  };

  const selectedVoiceName = persona.voice
    ? (ALL_VOICE_OPTIONS.find(v => v.value === persona.voice)?.name || persona.voice)
    : null;

  const addBackground = () => {
    const val = bgInput.trim();
    if (!val) return;
    onChange('background', [...(persona.background || []), val]);
    setBgInput('');
  };

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {persona.avatar_url ? (
              <img src={persona.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                {persona.name?.[0] || (idx + 1)}
              </div>
            )}
            <h4 className="font-semibold text-slate-900">Persona {idx + 1}</h4>
          </div>
          <div className="flex items-center gap-2">
            {/* Mode toggle */}
            <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => onChange('_mode', 'library')}
                className={`flex items-center gap-1 px-3 py-1.5 font-medium transition-colors ${
                  persona._mode === 'library' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Library className="w-3 h-3" /> Library
              </button>
              <button
                type="button"
                onClick={() => onChange('_mode', 'build')}
                className={`flex items-center gap-1 px-3 py-1.5 font-medium transition-colors ${
                  persona._mode === 'build' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <UserPlus className="w-3 h-3" /> Build
              </button>
            </div>
            {canRemove && (
              <button type="button" onClick={onRemove} className="text-red-400 hover:text-red-600 p-1 rounded">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-5">
        {/* ── Library mode ── */}
        {persona._mode === 'library' && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search persona library..."
                value={libSearch}
                onChange={e => setLibSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            {libraryLoading ? (
              <p className="text-sm text-slate-400 text-center py-4">Loading library...</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No personas found</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {filtered.map(client => (
                  <LibraryCard
                    key={client.id}
                    client={client}
                    selected={persona._libraryId === client.id}
                    onSelect={() => handleLibrarySelect(client)}
                  />
                ))}
              </div>
            )}

            {persona._libraryId && (
              <>
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center gap-3">
                  {persona.avatar_url && (
                    <img src={persona.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-blue-900">{persona.name}</p>
                    <p className="text-xs text-blue-700">{persona.title}{persona.company ? ` · ${persona.company}` : ''}</p>
                    {selectedVoiceName && (
                      <p className="text-xs text-blue-600 mt-0.5 flex items-center gap-1">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6Z"/></svg>
                        {selectedVoiceName}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => { onChange('_libraryId', null); onChange('name', ''); onChange('voice', ''); }}
                    className="text-blue-400 hover:text-blue-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <VoicePicker value={persona.voice} onChange={v => onChange('voice', v)} />
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Build mode ── */}
        {persona._mode === 'build' && (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-medium text-sm">Name *</Label>
                <Input placeholder="e.g., Sarah Johnson" value={persona.name} onChange={e => onChange('name', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="font-medium text-sm">Job Title</Label>
                <Input placeholder="e.g., VP of Sales" value={persona.title} onChange={e => onChange('title', e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-medium text-sm">Company (optional)</Label>
              <Input placeholder="e.g., Acme Corp" value={persona.company} onChange={e => onChange('company', e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label className="font-medium text-sm">Personality</Label>
              <div className="relative">
                <select
                  value={persona.demeanor}
                  onChange={e => onChange('demeanor', e.target.value)}
                  className="w-full appearance-none px-3 py-2 pr-9 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Select demeanor...</option>
                  {DEMEANORS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-medium text-sm">Buying Stage</Label>
              <div className="relative">
                <select
                  value={persona.buyingStage}
                  onChange={e => onChange('buyingStage', e.target.value)}
                  className="w-full appearance-none px-3 py-2 pr-9 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Select a stage...</option>
                  {BUYING_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-medium text-sm">Personality Traits</Label>
              <div className="flex flex-wrap gap-1.5">
                {PERSONALITY_TRAITS.map(trait => (
                  <Badge
                    key={trait}
                    variant={persona.traits.includes(trait) ? 'default' : 'outline'}
                    onClick={() => {
                      const next = persona.traits.includes(trait)
                        ? persona.traits.filter(t => t !== trait)
                        : [...persona.traits, trait];
                      onChange('traits', next);
                    }}
                    className="cursor-pointer select-none text-xs"
                  >
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-medium text-sm">Background & Characteristics</Label>
              <p className="text-xs text-slate-500">Add up to 10 items. Each should be a single line.</p>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Passed up for a promotion"
                  value={bgInput}
                  onChange={e => setBgInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addBackground())}
                  className="text-sm"
                />
                <Button type="button" variant="outline" onClick={addBackground} size="sm">Add</Button>
              </div>
              {persona.background?.length > 0 && (
                <ul className="space-y-1 mt-2">
                  {persona.background.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg">
                      <span className="flex-1">{item}</span>
                      <button
                        type="button"
                        onClick={() => onChange('background', persona.background.filter((_, bi) => bi !== i))}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="font-medium text-sm">Additional Persona Behavior (optional)</Label>
              <Textarea
                placeholder="Tell the persona how to behave — specific objections to raise, speaking patterns, etc."
                value={persona.details}
                onChange={e => onChange('details', e.target.value)}
                rows={2}
                className="text-sm"
              />
            </div>

            <AvatarPicker value={persona.avatar_url} onChange={url => onChange('avatar_url', url)} />

            <div className="border-t border-slate-100 pt-4">
              <VoicePicker value={persona.voice} onChange={v => onChange('voice', v)} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function CreateRoleplay() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [libraryClients, setLibraryClients] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(false);

  // Persona mode: 'single' | 'multi'
  const [personaMode, setPersonaMode] = useState('single');
  const [multiCount, setMultiCount] = useState(2);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    difficulty: 'intermediate',
    company: '',
    context: '',
    objections: [],
    evaluation_framework: '',
    personas: [EMPTY_PERSONA()],
    materials: [],
    is_public: false,
  });

  useEffect(() => {
    User.me().then(setUser).catch(() => {});
    // Fetch library personas (ai_clients)
    setLibraryLoading(true);
    supabase
      .from('ai_clients')
      .select('id, name, title, company_name, company, personality, traits, background, avatar_url')
      .limit(60)
      .then(({ data }) => { setLibraryClients(data || []); setLibraryLoading(false); });
  }, []);

  // Keep persona array in sync with personaMode / multiCount
  useEffect(() => {
    setFormData(prev => {
      const target = personaMode === 'single' ? 1 : Math.max(2, multiCount);
      const current = prev.personas;
      if (current.length === target) return prev;
      if (current.length < target) {
        return { ...prev, personas: [...current, ...Array.from({ length: target - current.length }, EMPTY_PERSONA)] };
      }
      return { ...prev, personas: current.slice(0, target) };
    });
  }, [personaMode, multiCount]);

  const handleBasicChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handlePersonaChange = (idx, field, value) => {
    setFormData(prev => {
      const personas = [...prev.personas];
      personas[idx] = { ...personas[idx], [field]: value };
      return { ...prev, personas };
    });
  };

  const removePersona = (idx) => {
    setFormData(prev => ({ ...prev, personas: prev.personas.filter((_, i) => i !== idx) }));
    if (formData.personas.length - 1 < 2) setPersonaMode('single');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('File must be under 10MB'); return; }
    setLoading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`;
      const { error } = await supabase.storage.from('roleplay_materials').upload(path, file);
      if (error) throw error;
      const f = { id: Date.now(), name: file.name, storagePath: path, type: file.type, size: file.size };
      setUploadedFiles(prev => [...prev, f]);
      setFormData(prev => ({ ...prev, materials: [...prev.materials, f] }));
      toast.success('Material uploaded');
    } catch (err) {
      console.error(err);
      toast.error('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const removeMaterial = (id) => {
    setFormData(prev => ({ ...prev, materials: prev.materials.filter(m => m.id !== id) }));
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.description.trim()) { toast.error('Name and description are required'); return; }
    if (!formData.evaluation_framework) { toast.error('Please select an evaluation framework'); return; }
    if (formData.personas.some(p => !p.name.trim() && !p._libraryId)) { toast.error('Each persona needs a name or library selection'); return; }

    setLoading(true);
    try {
      const { data, error } = await supabase.from('ai_clients').insert([{
        name: formData.name,
        description: formData.description,
        industry: formData.industry,
        difficulty_level: formData.difficulty,
        company: formData.company,
        context: formData.context,
        objections: formData.objections,
        evaluation_framework: formData.evaluation_framework,
        personas_config: formData.personas,
        materials: formData.materials,
        user_id: user?.id,
        is_public: formData.is_public,
        is_scenario_template: false,
      }]).select();

      if (error) throw error;
      toast.success('Roleplay scenario created!');
      setTimeout(() => navigate(createPageUrl('LetsPractice')), 900);
    } catch (err) {
      console.error(err);
      toast.error('Failed to create roleplay');
    } finally {
      setLoading(false);
    }
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-8 py-5">
          <div className="flex items-center gap-4 mb-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(createPageUrl('LetsPractice'))} className="gap-2 text-slate-600">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </div>
          <div className="mb-3">
            <h1 className="text-2xl font-bold text-slate-900">Create Roleplay Scenario</h1>
            <p className="text-slate-500 text-sm">Build a custom scenario to practice with AI prospects</p>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-slate-500">
              <span>Step {currentStep + 1} of {steps.length} — {steps[currentStep].label}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-1.5">
              {steps.map((step, idx) => {
                const isActive = idx === currentStep;
                const isCompleted = idx < currentStep;
                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(idx)}
                    className={`w-full px-4 py-3 rounded-xl text-left flex items-center gap-3 transition-all text-sm font-medium ${
                      isActive ? 'bg-blue-600 text-white shadow-md' : isCompleted ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
                    {step.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4 border-b border-slate-100">
                <CardTitle className="text-lg">{steps[currentStep].label}</CardTitle>
              </CardHeader>

              <CardContent className="pt-6">
                {/* ── Step 1: Basic Info ── */}
                {currentStep === 0 && (
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <Label className="font-semibold">Scenario Name *</Label>
                      <Input placeholder="e.g., Discovery Call with Tech Buyer" value={formData.name} onChange={e => handleBasicChange('name', e.target.value)} className="text-base" />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-semibold">Description *</Label>
                      <Textarea placeholder="Describe the roleplay scenario and what the rep should practice..." value={formData.description} onChange={e => handleBasicChange('description', e.target.value)} rows={4} />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Industry — now a dropdown */}
                      <div className="space-y-1.5">
                        <Label className="font-semibold">Industry</Label>
                        <div className="relative">
                          <select
                            value={formData.industry}
                            onChange={e => handleBasicChange('industry', e.target.value)}
                            className="w-full appearance-none px-3 py-2 pr-9 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          >
                            <option value="">Select industry...</option>
                            {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="font-semibold">Difficulty Level</Label>
                        <div className="relative">
                          <select
                            value={formData.difficulty}
                            onChange={e => handleBasicChange('difficulty', e.target.value)}
                            className="w-full appearance-none px-3 py-2 pr-9 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-semibold">Prospect's Company</Label>
                      <Input placeholder="e.g., Acme Corp" value={formData.company} onChange={e => handleBasicChange('company', e.target.value)} />
                    </div>
                  </div>
                )}

                {/* ── Step 2: Scenario Context ── */}
                {currentStep === 1 && (
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <Label className="font-semibold">Scenario Context *</Label>
                      <p className="text-sm text-slate-500">Describe the situation — what is the conversation about? What should the AI know?</p>
                      <Textarea
                        placeholder="e.g., You are calling Sarah Johnson, CTO at TechCorp. She recently attended your webinar on AI automation..."
                        value={formData.context}
                        onChange={e => handleBasicChange('context', e.target.value)}
                        rows={6}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-semibold">Common Objections</Label>
                      <p className="text-sm text-slate-500">One per line — the AI will raise these during the conversation</p>
                      <Textarea
                        placeholder={`We already have a solution in place\nOur budget is frozen\nWe need to evaluate more options\nCan you send me information?`}
                        value={formData.objections.join('\n')}
                        onChange={e => handleBasicChange('objections', e.target.value.split('\n').filter(o => o.trim()))}
                        rows={5}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* ── Step 3: Framework ── */}
                {currentStep === 2 && (
                  <FrameworkSelector value={formData.evaluation_framework} onChange={v => handleBasicChange('evaluation_framework', v)} />
                )}

                {/* ── Step 4: Personas ── */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    {/* Single vs Multi toggle */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <Label className="font-semibold mb-3 block">How many personas will the rep practice with?</Label>
                      <div className="flex gap-3 mb-4">
                        <button
                          type="button"
                          onClick={() => setPersonaMode('single')}
                          className={`flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${personaMode === 'single' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
                        >
                          Single Persona
                        </button>
                        <button
                          type="button"
                          onClick={() => setPersonaMode('multi')}
                          className={`flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${personaMode === 'multi' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
                        >
                          Multiple Personas
                        </button>
                      </div>

                      {personaMode === 'multi' && (
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium text-slate-700">How many personas? (2–6)</Label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range" min={2} max={6}
                              value={multiCount}
                              onChange={e => setMultiCount(Number(e.target.value))}
                              className="flex-1 accent-blue-600"
                            />
                            <span className="w-8 text-center font-bold text-blue-600">{multiCount}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Persona forms */}
                    <div className="space-y-4">
                      {formData.personas.map((persona, idx) => (
                        <PersonaForm
                          key={idx}
                          persona={persona}
                          idx={idx}
                          onChange={(field, value) => handlePersonaChange(idx, field, value)}
                          onRemove={() => removePersona(idx)}
                          canRemove={formData.personas.length > 1}
                          libraryClients={libraryClients}
                          libraryLoading={libraryLoading}
                        />
                      ))}
                    </div>

                    {personaMode === 'multi' && formData.personas.length < 6 && (
                      <Button type="button" onClick={() => setFormData(p => ({ ...p, personas: [...p.personas, EMPTY_PERSONA()] }))} variant="outline" className="w-full gap-2">
                        <Plus className="w-4 h-4" /> Add Another Persona
                      </Button>
                    )}
                  </div>
                )}

                {/* ── Step 5: Materials ── */}
                {currentStep === 4 && (
                  <div className="space-y-5">
                    <div>
                      <h4 className="font-semibold mb-1">Upload Learning Materials (Optional)</h4>
                      <p className="text-sm text-slate-500 mb-4">Documents, decks, or guides that users can review before practicing.</p>
                      <div
                        className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                        onClick={() => document.getElementById('file-upload').click()}
                      >
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="font-medium text-slate-700">Click to upload materials</p>
                        <p className="text-sm text-slate-500">PDF, DOC, PPT — max 10MB</p>
                      </div>
                      <input id="file-upload" type="file" hidden accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" onChange={handleFileUpload} disabled={loading} />
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Uploaded ({uploadedFiles.length})</h4>
                        {uploadedFiles.map(f => (
                          <div key={f.id} className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <div>
                                <p className="text-sm font-medium">{f.name}</p>
                                <p className="text-xs text-slate-400">{(f.size / 1024).toFixed(1)} KB</p>
                              </div>
                            </div>
                            <button type="button" onClick={() => removeMaterial(f.id)} className="text-slate-400 hover:text-red-500">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Step 6: Review ── */}
                {currentStep === 5 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Review Your Scenario</h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-xs font-medium text-slate-500 mb-1">Scenario Name</p>
                        <p className="text-lg font-bold text-slate-900">{formData.name || '—'}</p>
                      </div>
                      <div className="p-4 bg-white rounded-xl border border-slate-200">
                        <p className="text-xs font-medium text-slate-500 mb-1">Description</p>
                        <p className="text-sm text-slate-700">{formData.description || '—'}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                          <p className="text-xs text-slate-500">Industry</p>
                          <p className="text-sm font-semibold mt-1">{formData.industry || '—'}</p>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                          <p className="text-xs text-slate-500">Difficulty</p>
                          <p className="text-sm font-semibold mt-1 capitalize">{formData.difficulty}</p>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                          <p className="text-xs text-slate-500">Personas</p>
                          <p className="text-sm font-semibold mt-1">{formData.personas.length}</p>
                        </div>
                      </div>
                      <div className="p-4 bg-white rounded-xl border border-slate-200">
                        <p className="text-xs font-medium text-slate-500 mb-2">Personas</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.personas.map((p, i) => (
                            <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-full pl-1 pr-3 py-1 border border-slate-200">
                              {p.avatar_url
                                ? <img src={p.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                                : <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center">{p.name?.[0] || '?'}</div>
                              }
                              <span className="text-xs font-medium text-slate-700">{p.name || 'Unnamed'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {uploadedFiles.length > 0 && (
                        <div className="p-4 bg-white rounded-xl border border-slate-200">
                          <p className="text-xs font-medium text-slate-500 mb-2">Materials ({uploadedFiles.length})</p>
                          {uploadedFiles.map(f => <p key={f.id} className="text-sm text-slate-600">• {f.name}</p>)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setCurrentStep(s => Math.max(0, s - 1))} disabled={currentStep === 0} className="flex-1">
                Previous
              </Button>
              {currentStep < steps.length - 1 ? (
                <Button onClick={() => setCurrentStep(s => s + 1)} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Next
                </Button>
              ) : (
                <Button onClick={handleSave} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700 gap-2">
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Scenario'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

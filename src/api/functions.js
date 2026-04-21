import { supabase } from '@/lib/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function invokeFunction(functionName, params) {
  // Use direct fetch with anon key so fake local-auth tokens don't get rejected
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Edge function ${functionName} failed (${res.status}): ${text}`);
  }
  return res.json();
}

export const teamsWebhook = (params) => invokeFunction('teams-webhook', params);
export const processCallRecording = (params) => invokeFunction('process-call-recording', params);
export const zoomWebhook = (params) => invokeFunction('zoom-webhook', params);
export const aiRoleplay = (params) => invokeFunction('ai-roleplay', params);
export const emailOAuth = (params) => invokeFunction('email-oauth', params);
export const syncEmails = (params) => invokeFunction('sync-emails', params);
export const initiateVoiceCall = (params) => invokeFunction('initiate-voice-call', params);
export const testDialerConnection = (params) => invokeFunction('test-dialer-connection', params);
export const initiateHumanCall = (params) => invokeFunction('initiate-human-call', params);
export const debugEffyVoice = (params) => invokeFunction('debug-effy-voice', params);
export const callRecordingWebhook = (params) => invokeFunction('call-recording-webhook', params);
export const analyzeCallRecording = (params) => invokeFunction('analyze-call-recording', params);
export const voiceGateWebhook = (params) => invokeFunction('voicegate-webhook', params);
export const voicegateAnalyticsWebhook = (params) => invokeFunction('voicegate-analytics-webhook', params);
export const sendEmail = (params) => invokeFunction('send-email', params);
export const sendTestEmail = (params) => invokeFunction('send-test-email', params);
export const sendEmailViaGmailAPI = (params) => invokeFunction('send-email-via-gmail-api', params);
export const createStripeSubscription = (params) => invokeFunction('create-stripe-subscription', params);
export const promoteSuperAdmin = (params) => invokeFunction('promote-super-admin', params);
export const promoteToSuperAdmin = (params) => invokeFunction('promote-to-super-admin', params);
export const testDocumentCreation = (params) => invokeFunction('test-document-creation', params);
export const generateThumbnail = (params) => invokeFunction('generate-thumbnail', params);
export const elevenlabsWebhook = (params) => invokeFunction('elevenlabs-webhook', params);
export const analyzeCoachingSubmission = (params) => invokeFunction('analyze-coaching-submission', params);
export const calculateEngagementScore = (params) => invokeFunction('calculate-engagement-score', params);
export const webrtcSignaling = (params) => invokeFunction('webrtc-signaling', params);
export const createMeetingLinks = (params) => invokeFunction('create-meeting-links', params);
export const switchRole = (params) => invokeFunction('switch-role', params);
export const generateReimbursementLetter = (params) => invokeFunction('generate-reimbursement-letter', params);
export const multiPartyAIRoleplay = (params) => invokeFunction('multi-party-ai-roleplay', params);

// Content Management Functions
export async function uploadContentMaterial(file, metadata) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const fileExt = file.name.split('.').pop().toLowerCase();
  const fileName = `${Date.now()}-${file.name}`;
  const storagePath = `${user.id}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('roleplay-content')
    .upload(storagePath, file);

  if (uploadError) throw uploadError;

  const fileSizeKb = Math.ceil(file.size / 1024);

  const { data, error } = await supabase
    .from('roleplay_content_materials')
    .insert({
      user_id: user.id,
      file_name: file.name,
      file_type: fileExt,
      storage_path: storagePath,
      file_size_kb: fileSizeKb,
      ...metadata
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteContentMaterial(materialId) {
  const material = await supabase
    .from('roleplay_content_materials')
    .select('storage_path')
    .eq('id', materialId)
    .maybeSingle();

  if (material?.data?.storage_path) {
    await supabase.storage.from('roleplay-content').remove([material.data.storage_path]);
  }

  const { error } = await supabase
    .from('roleplay_content_materials')
    .delete()
    .eq('id', materialId);

  if (error) throw error;
}

export async function getContentLibrary(filters = {}) {
  let query = supabase
    .from('roleplay_content_materials')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  if (filters.search) {
    query = query.ilike('file_name', `%${filters.search}%`);
  }
  if (filters.visibility) {
    query = query.eq('visibility', filters.visibility);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function linkMaterialToSession(sessionId, materialIds) {
  const links = materialIds.map(materialId => ({
    session_id: sessionId,
    content_material_id: materialId
  }));

  const { error } = await supabase
    .from('roleplay_session_content_links')
    .insert(links);

  if (error) throw error;
}

export async function getSessionMaterials(sessionId) {
  const { data, error } = await supabase
    .from('roleplay_session_content_links')
    .select('content_material_id, roleplay_content_materials(*)')
    .eq('session_id', sessionId);

  if (error) throw error;
  return data?.map(link => link.roleplay_content_materials) || [];
}

export async function getContentUsageStats(materialId) {
  const { data, error } = await supabase
    .from('content_usage_analytics')
    .select('*')
    .eq('content_material_id', materialId);

  if (error) throw error;
  return data || [];
}

export async function recordContentUsage(materialId, sessionId, durationMinutes) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('content_usage_analytics')
    .insert({
      content_material_id: materialId,
      session_id: sessionId,
      user_id: user.id,
      session_duration_minutes: durationMinutes
    });

  if (error) throw error;
}

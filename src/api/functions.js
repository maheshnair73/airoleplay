import { supabase } from '@/lib/supabase';

async function invokeFunction(functionName, params) {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: params
  });
  if (error) throw error;
  return data;
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

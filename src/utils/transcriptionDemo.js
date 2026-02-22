import { supabase } from '@/lib/supabase';

export async function createDemoTranscription(sessionId, videoUrl = null) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data: transcription, error: transcriptionError } = await supabase
            .from('call_transcriptions')
            .insert({
                session_id: sessionId,
                video_url: videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                duration: 180,
                created_by: user.id
            })
            .select()
            .single();

        if (transcriptionError) throw transcriptionError;

        const demoSegments = [
            {
                transcription_id: transcription.id,
                speaker_name: 'Sales Rep',
                speaker_type: 'user',
                start_time: 2.5,
                end_time: 12.8,
                text: 'Hi, thanks for taking the time to meet with me today. I wanted to discuss how our solution can help streamline your operations and reduce costs.',
                confidence: 0.96
            },
            {
                transcription_id: transcription.id,
                speaker_name: 'Prospect',
                speaker_type: 'participant',
                start_time: 13.2,
                end_time: 18.5,
                text: 'Sure, I am interested to hear more. What exactly does your solution do?',
                confidence: 0.94
            },
            {
                transcription_id: transcription.id,
                speaker_name: 'Sales Rep',
                speaker_type: 'user',
                start_time: 19.0,
                end_time: 35.5,
                text: 'Great question. Our platform provides AI-powered sales coaching and roleplay capabilities. It helps your team practice real scenarios, get instant feedback, and improve their closing rates by up to 40%.',
                confidence: 0.97
            },
            {
                transcription_id: transcription.id,
                speaker_name: 'Prospect',
                speaker_type: 'participant',
                start_time: 36.0,
                end_time: 42.3,
                text: 'Interesting. How does it compare to traditional training methods?',
                confidence: 0.95
            },
            {
                transcription_id: transcription.id,
                speaker_name: 'Sales Rep',
                speaker_type: 'user',
                start_time: 43.0,
                end_time: 60.8,
                text: 'Unlike traditional training which happens quarterly or annually, our platform allows for continuous practice. Your team can roleplay anytime, get AI-powered insights immediately, and track their improvement over time.',
                confidence: 0.96
            },
            {
                transcription_id: transcription.id,
                speaker_name: 'Prospect',
                speaker_type: 'participant',
                start_time: 61.5,
                end_time: 68.2,
                text: 'That sounds valuable. What is the pricing structure?',
                confidence: 0.93
            },
            {
                transcription_id: transcription.id,
                speaker_name: 'Sales Rep',
                speaker_type: 'user',
                start_time: 69.0,
                end_time: 85.5,
                text: 'We have flexible pricing based on team size. For your organization of around 50 sales reps, it would be $150 per user per month, which includes unlimited roleplay sessions, analytics, and dedicated support.',
                confidence: 0.95
            },
            {
                transcription_id: transcription.id,
                speaker_name: 'Prospect',
                speaker_type: 'participant',
                start_time: 86.0,
                end_time: 92.8,
                text: 'That is a significant investment. Can you share some ROI data?',
                confidence: 0.96
            },
            {
                transcription_id: transcription.id,
                speaker_name: 'Sales Rep',
                speaker_type: 'user',
                start_time: 93.5,
                end_time: 115.2,
                text: 'Absolutely. Our customers typically see a 25-40% improvement in win rates within the first quarter. For a team your size, if that translates to even just 2-3 additional deals per month, you are looking at a 10x return on investment.',
                confidence: 0.97
            },
            {
                transcription_id: transcription.id,
                speaker_name: 'Prospect',
                speaker_type: 'participant',
                start_time: 116.0,
                end_time: 124.5,
                text: 'Those are impressive numbers. Do you have case studies from companies in our industry?',
                confidence: 0.94
            },
            {
                transcription_id: transcription.id,
                speaker_name: 'Sales Rep',
                speaker_type: 'user',
                start_time: 125.0,
                end_time: 142.8,
                text: 'Yes, we have several clients in the SaaS space who have seen tremendous results. I can send you a detailed case study after this call. Would you be open to a pilot program with a small team to see the results firsthand?',
                confidence: 0.96
            },
            {
                transcription_id: transcription.id,
                speaker_name: 'Prospect',
                speaker_type: 'participant',
                start_time: 143.5,
                end_time: 152.0,
                text: 'A pilot sounds reasonable. What would that entail?',
                confidence: 0.95
            },
            {
                transcription_id: transcription.id,
                speaker_name: 'Sales Rep',
                speaker_type: 'user',
                start_time: 152.8,
                end_time: 175.5,
                text: 'We can start with 10 users for 30 days at no cost. This gives your team time to experience the platform, and we can measure the improvement in their performance. After the trial, we can discuss a full rollout based on the results.',
                confidence: 0.97
            },
            {
                transcription_id: transcription.id,
                speaker_name: 'Prospect',
                speaker_type: 'participant',
                start_time: 176.0,
                end_time: 180.0,
                text: 'That works for me. Let us move forward with the pilot.',
                confidence: 0.96
            }
        ];

        const { error: segmentsError } = await supabase
            .from('transcription_segments')
            .insert(demoSegments);

        if (segmentsError) throw segmentsError;

        return transcription;
    } catch (error) {
        console.error('Error creating demo transcription:', error);
        throw error;
    }
}

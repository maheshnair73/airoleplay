import { PersonalizedTrainingAssignment, TrainingDocument } from '@/api/entities';

const SCORE_THRESHOLD = 70;

const TRAINING_MAPPINGS = {
  objection_handling: {
    category: 'Objection Handling',
    trigger: 'Low objection handling score',
    priority: 'high'
  },
  discovery: {
    category: 'Discovery Techniques',
    trigger: 'Insufficient discovery questions',
    priority: 'high'
  },
  closing: {
    category: 'Closing Strategies',
    trigger: 'Weak closing techniques',
    priority: 'medium'
  },
  product_knowledge: {
    category: 'Product Knowledge',
    trigger: 'Product knowledge gaps identified',
    priority: 'high'
  },
  communication: {
    category: 'Communication Skills',
    trigger: 'Communication improvement needed',
    priority: 'medium'
  }
};

export async function analyzeSessionAndAssignTraining(session, agentEmail) {
  try {
    const analysisResults = session.analysis_results || {};
    const assignedTrainings = [];

    const allDocuments = await TrainingDocument.list();

    if (analysisResults.objection_handling_score < SCORE_THRESHOLD) {
      const doc = allDocuments.find(d => d.category === TRAINING_MAPPINGS.objection_handling.category);
      if (doc) {
        await createTrainingAssignment({
          agent_email: agentEmail,
          document_id: doc.id,
          reason: `Your objection handling score was ${Math.round(analysisResults.objection_handling_score)}%. This training will help you handle objections more effectively.`,
          priority: TRAINING_MAPPINGS.objection_handling.priority,
          triggered_by_session_id: session.id,
          due_date: calculateDueDate(TRAINING_MAPPINGS.objection_handling.priority)
        });
        assignedTrainings.push(doc.title);
      }
    }

    if (analysisResults.questions_count < 5) {
      const doc = allDocuments.find(d => d.category === TRAINING_MAPPINGS.discovery.category);
      if (doc) {
        await createTrainingAssignment({
          agent_email: agentEmail,
          document_id: doc.id,
          reason: `You asked only ${analysisResults.questions_count} questions during the call. Effective discovery requires more open-ended questions.`,
          priority: TRAINING_MAPPINGS.discovery.priority,
          triggered_by_session_id: session.id,
          due_date: calculateDueDate(TRAINING_MAPPINGS.discovery.priority)
        });
        assignedTrainings.push(doc.title);
      }
    }

    if (analysisResults.closing_score && analysisResults.closing_score < SCORE_THRESHOLD) {
      const doc = allDocuments.find(d => d.category === TRAINING_MAPPINGS.closing.category);
      if (doc) {
        await createTrainingAssignment({
          agent_email: agentEmail,
          document_id: doc.id,
          reason: `Your closing score was ${Math.round(analysisResults.closing_score)}%. Learn advanced closing techniques to improve deal closure.`,
          priority: TRAINING_MAPPINGS.closing.priority,
          triggered_by_session_id: session.id,
          due_date: calculateDueDate(TRAINING_MAPPINGS.closing.priority)
        });
        assignedTrainings.push(doc.title);
      }
    }

    if (analysisResults.talk_speed_wpm && (analysisResults.talk_speed_wpm > 180 || analysisResults.talk_speed_wpm < 120)) {
      const doc = allDocuments.find(d => d.category === TRAINING_MAPPINGS.communication.category);
      if (doc) {
        await createTrainingAssignment({
          agent_email: agentEmail,
          document_id: doc.id,
          reason: `Your speaking pace was ${analysisResults.talk_speed_wpm} WPM. Optimal pace is 130-160 WPM for clear communication.`,
          priority: TRAINING_MAPPINGS.communication.priority,
          triggered_by_session_id: session.id,
          due_date: calculateDueDate(TRAINING_MAPPINGS.communication.priority)
        });
        assignedTrainings.push(doc.title);
      }
    }

    return assignedTrainings;
  } catch (error) {
    console.error('Error analyzing session for training assignment:', error);
    return [];
  }
}

async function createTrainingAssignment(data) {
  try {
    const existingAssignments = await PersonalizedTrainingAssignment.list();

    const duplicate = existingAssignments.find(
      a => a.agent_email === data.agent_email &&
           a.document_id === data.document_id &&
           (a.status === 'pending' || a.status === 'in_progress')
    );

    if (duplicate) {
      console.log('Training already assigned, skipping duplicate');
      return null;
    }

    return await PersonalizedTrainingAssignment.create({
      ...data,
      assigned_by: 'system',
      assigned_date: new Date().toISOString(),
      status: 'pending'
    });
  } catch (error) {
    console.error('Error creating training assignment:', error);
    throw error;
  }
}

function calculateDueDate(priority) {
  const now = new Date();

  switch (priority) {
    case 'critical':
      now.setDate(now.getDate() + 1);
      break;
    case 'high':
      now.setDate(now.getDate() + 3);
      break;
    case 'medium':
      now.setDate(now.getDate() + 7);
      break;
    case 'low':
      now.setDate(now.getDate() + 14);
      break;
    default:
      now.setDate(now.getDate() + 7);
  }

  return now.toISOString();
}

export async function calculatePerformanceCorrelation(agentEmail, documentId) {
  try {
    const { RoleplaySession, AgentTrainingAttempt, TrainingPerformanceCorrelation } = await import('@/api/entities');

    const attempts = await AgentTrainingAttempt.list();
    const lastAttempt = attempts
      .filter(a => a.agent_email === agentEmail && a.document_id === documentId && a.passed)
      .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))[0];

    if (!lastAttempt) return null;

    const trainingDate = new Date(lastAttempt.completed_at);
    const preTrainingDate = new Date(trainingDate);
    preTrainingDate.setDate(preTrainingDate.getDate() - 30);

    const postTrainingDate = new Date(trainingDate);
    postTrainingDate.setDate(postTrainingDate.getDate() + 30);

    const allSessions = await RoleplaySession.list();
    const userSessions = allSessions.filter(s => s.user_email === agentEmail);

    const preSessions = userSessions.filter(s => {
      const sessionDate = new Date(s.created_date);
      return sessionDate >= preTrainingDate && sessionDate < trainingDate;
    });

    const postSessions = userSessions.filter(s => {
      const sessionDate = new Date(s.created_date);
      return sessionDate > trainingDate && sessionDate <= postTrainingDate;
    });

    if (preSessions.length === 0 || postSessions.length === 0) {
      return null;
    }

    const preAvgScore = preSessions.reduce((sum, s) =>
      sum + (s.overall_score || s.analysis_results?.overall_score || 0), 0
    ) / preSessions.length;

    const postAvgScore = postSessions.reduce((sum, s) =>
      sum + (s.overall_score || s.analysis_results?.overall_score || 0), 0
    ) / postSessions.length;

    const improvement = postAvgScore - preAvgScore;

    const correlationData = {
      agent_email: agentEmail,
      training_document_id: documentId,
      pre_training_avg_score: preAvgScore,
      post_training_avg_score: postAvgScore,
      improvement_percentage: improvement,
      calls_analyzed_pre: preSessions.length,
      calls_analyzed_post: postSessions.length,
      training_completed_date: trainingDate.toISOString(),
      measurement_date: new Date().toISOString()
    };

    await TrainingPerformanceCorrelation.create(correlationData);

    return correlationData;
  } catch (error) {
    console.error('Error calculating performance correlation:', error);
    return null;
  }
}

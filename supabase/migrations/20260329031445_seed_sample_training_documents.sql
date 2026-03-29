/*
  # Seed Sample Training Documents

  1. Sample Data
    - Creates initial training documents across different categories
    - Adds sample quiz questions for each document
    - Provides realistic content for demo and testing

  2. Categories Included
    - Product Knowledge
    - Objection Handling
    - Discovery Techniques
    - Closing Strategies
    - Communication Skills
*/

-- Insert sample training documents
INSERT INTO training_documents (title, description, content, category, difficulty_level, estimated_time_minutes, passing_score, created_by, is_active) VALUES
(
  'Mastering Objection Handling',
  'Learn proven techniques to handle common sales objections with confidence',
  '# Mastering Objection Handling

## Introduction
Objections are a natural part of the sales process. They indicate interest and engagement from your prospect. This training will teach you how to turn objections into opportunities.

## The 5-Step Framework

### 1. Listen Completely
Never interrupt when a prospect raises an objection. Let them fully express their concern. This shows respect and often reveals the real issue behind the objection.

### 2. Acknowledge and Validate
Show empathy and understanding. Use phrases like "I understand your concern" or "That''s a valid point."

### 3. Clarify the Real Issue
Ask follow-up questions to ensure you understand the root cause. Often, the stated objection masks a deeper concern.

### 4. Respond with Value
Address the objection by relating it back to the value your solution provides. Use case studies or data when possible.

### 5. Confirm Resolution
Ask if your response has addressed their concern. This prevents the same objection from resurfacing later.

## Common Objections

### "It''s too expensive"
This is rarely about actual price. It''s about perceived value. Reframe the conversation around ROI and total cost of ownership.

### "We''re happy with our current solution"
Probe deeper to find gaps in their current solution. No solution is perfect. Look for areas of frustration or unmet needs.

### "I need to think about it"
This often means they need more information or haven''t seen enough value. Ask what specific concerns they need to think about.

### "Send me some information"
This is often a polite brush-off. Instead, offer to share specific resources that address their particular situation during a scheduled follow-up call.

## Practice Makes Perfect
The best way to improve objection handling is through regular practice and role-play scenarios.',
  'Objection Handling',
  'intermediate',
  25,
  80,
  'system',
  true
),
(
  'Effective Discovery Techniques',
  'Master the art of asking powerful questions to uncover customer needs',
  '# Effective Discovery Techniques

## Why Discovery Matters
Discovery is the foundation of consultative selling. Without proper discovery, you''re just guessing at what your prospect needs.

## The SPIN Selling Framework

### Situation Questions
Understand the prospect''s current state. Examples:
- "Tell me about your current process for..."
- "How many people are on your team?"
- "What systems are you currently using?"

### Problem Questions
Identify difficulties and dissatisfactions:
- "What challenges are you facing with..."
- "How does this problem impact your team?"
- "What have you tried so far?"

### Implication Questions
Explore the consequences of problems:
- "What happens if this issue continues?"
- "How does this affect your revenue/costs?"
- "What other areas of the business does this impact?"

### Need-Payoff Questions
Focus on the value of solving the problem:
- "How would solving this improve your operations?"
- "What would be the impact of increasing efficiency by 20%?"
- "If we could eliminate this bottleneck, what would that mean for your team?"

## Best Practices

### Listen More, Talk Less
Aim for an 80/20 ratio - let the prospect talk 80% of the time. Your job is to guide the conversation with thoughtful questions.

### Use the "Peeling the Onion" Technique
When you get a surface-level answer, ask "Why?" or "Can you tell me more about that?" to dig deeper.

### Take Notes
Document key pain points, priorities, and decision criteria. This shows you''re engaged and helps you tailor your pitch.

### Avoid Leading Questions
Don''t ask questions that assume the answer you want. Stay genuinely curious about their situation.',
  'Discovery Techniques',
  'intermediate',
  30,
  75,
  'system',
  true
),
(
  'Advanced Closing Strategies',
  'Learn multiple closing techniques to confidently move deals forward',
  '# Advanced Closing Strategies

## The Psychology of Closing
Closing isn''t a single moment - it''s a series of micro-commitments throughout the sales process. Every "yes" brings you closer to the final decision.

## Closing Techniques

### The Assumptive Close
Proceed as if the prospect has already decided to buy. Focus on implementation details:
- "When would you like to get started?"
- "Should we set up training for the first or second week of next month?"

### The Alternative Close
Give them a choice between two positive options:
- "Would you prefer the monthly or annual plan?"
- "Should we onboard your sales team first, or start with marketing?"

### The Summary Close
Recap all the benefits and value points you''ve discussed, then ask for the commitment:
- "So we''ve agreed that this will increase your efficiency by 30% and save your team 10 hours per week. Are you ready to move forward?"

### The Urgency Close
Create genuine urgency (never fake it):
- "We have a promotion ending this quarter"
- "Implementation typically takes 6 weeks, so starting now means you''ll be live before your Q4 push"

### The Trial Close
Test their readiness throughout the conversation:
- "How does this sound so far?"
- "Does this align with what you''re looking for?"
- "Are there any concerns I haven''t addressed?"

## Handling "I Need to Think About It"

### Option 1: Isolate the Concern
"Of course, this is an important decision. Can I ask - is it the timing, the budget, or something about the solution that you need to think about?"

### Option 2: Offer to Think Together
"I completely understand. What specifically would you like to think about? Maybe we can think through it together right now."

## Key Principles
- Never be pushy or aggressive
- Create urgency through value, not pressure
- Make it easy to say yes
- Address concerns proactively',
  'Closing Strategies',
  'advanced',
  35,
  85,
  'system',
  true
),
(
  'Product Knowledge Fundamentals',
  'Deep dive into product features, benefits, and competitive advantages',
  '# Product Knowledge Fundamentals

## Why Product Knowledge Matters
You can''t sell what you don''t understand. Deep product knowledge builds confidence and credibility.

## Features vs. Benefits

### Features
Technical specifications and capabilities. What the product does.

### Benefits
How those features improve the customer''s situation. Why it matters.

### Example:
- **Feature**: "Our platform uses AI to analyze call transcripts"
- **Benefit**: "Your managers save 5 hours per week on call reviews and get instant insights into rep performance"

## Your Product''s Core Value Proposition
[This section would be customized based on your actual product]

### Primary Use Cases
1. Use case 1
2. Use case 2
3. Use case 3

### Target Customer Profile
- Industry
- Company size
- Key pain points
- Decision makers

## Competitive Positioning

### Our Advantages
- Point 1
- Point 2
- Point 3

### When to Use Competitive Information
Only when the prospect brings it up. Never bash competitors - focus on your unique value.

## Integration Capabilities
Understanding how your product integrates with other tools is crucial for enterprise sales.

## Common Questions and Answers
Memorize answers to the 10 most common questions you receive about the product.',
  'Product Knowledge',
  'beginner',
  20,
  70,
  'system',
  true
),
(
  'Communication Excellence for Sales',
  'Develop clear, persuasive communication skills that build trust',
  '# Communication Excellence for Sales

## The Foundation of Sales Communication
Trust is built through clarity, authenticity, and active listening.

## Verbal Communication Best Practices

### Pace and Tone
- Speak at 130-150 words per minute (conversational pace)
- Vary your tone to maintain engagement
- Pause after important points to let them sink in

### Clarity Over Cleverness
- Use simple language
- Avoid jargon unless your prospect uses it first
- Be direct and specific

### Mirroring and Matching
Subtly match your prospect''s:
- Energy level
- Speaking pace
- Formality
- Technical depth

## Active Listening Skills

### The Three Levels of Listening

**Level 1: Internal Listening**
Listening while thinking about what you''ll say next. Avoid this.

**Level 2: Focused Listening**
Fully focused on the other person''s words.

**Level 3: Global Listening**
Noticing not just words, but tone, energy, and what''s not being said.

### Show You''re Listening
- Paraphrase what you heard
- Ask clarifying questions
- Reference earlier points in the conversation

## Written Communication

### Email Best Practices
- Subject lines should be clear and action-oriented
- Keep emails under 5 sentences when possible
- One clear call-to-action per email
- Always proofread

### Follow-up Communication
- Send meeting recaps within 24 hours
- Confirm next steps and ownership
- Reference specific points from your conversation

## Building Rapport

### Find Common Ground
- Research their LinkedIn before calls
- Listen for personal details they share
- Remember and reference previous conversations

### Use Stories
People remember stories far better than facts. Build a library of customer success stories.

## Handling Difficult Conversations
Stay calm, acknowledge emotions, focus on solutions, and know when to involve your manager.',
  'Communication Skills',
  'intermediate',
  25,
  75,
  'system',
  true
);

-- Insert sample quiz questions for Objection Handling
INSERT INTO training_quiz_questions (document_id, question_text, question_type, options, correct_answer, explanation, difficulty, order_index, is_active) 
SELECT 
  id,
  'When a prospect says "It''s too expensive", what should you do first?',
  'multiple_choice',
  '["Immediately offer a discount", "Ask what they are comparing it to", "List all the features", "End the conversation"]'::jsonb,
  'Ask what they are comparing it to',
  'Understanding their frame of reference helps you address the real concern and reframe value versus cost. Price is relative, and you need to know their comparison point.',
  'medium',
  1,
  true
FROM training_documents WHERE title = 'Mastering Objection Handling';

INSERT INTO training_quiz_questions (document_id, question_text, question_type, options, correct_answer, explanation, difficulty, order_index, is_active) 
SELECT 
  id,
  'What is the first step in the 5-step objection handling framework?',
  'multiple_choice',
  '["Acknowledge and validate", "Listen completely", "Clarify the real issue", "Respond with value"]'::jsonb,
  'Listen completely',
  'You must let the prospect fully express their concern without interrupting. This shows respect and often reveals the real issue behind the objection.',
  'easy',
  2,
  true
FROM training_documents WHERE title = 'Mastering Objection Handling';

-- Insert sample quiz questions for Discovery Techniques
INSERT INTO training_quiz_questions (document_id, question_text, question_type, options, correct_answer, explanation, difficulty, order_index, is_active) 
SELECT 
  id,
  'What is the ideal talk-to-listen ratio during discovery?',
  'multiple_choice',
  '["50/50", "80/20 (you talk 80%)", "80/20 (prospect talks 80%)", "20/80 (you talk 20%)"]'::jsonb,
  '80/20 (prospect talks 80%)',
  'During discovery, your job is to guide the conversation with thoughtful questions while letting the prospect talk 80% of the time. This ensures you truly understand their needs.',
  'easy',
  1,
  true
FROM training_documents WHERE title = 'Effective Discovery Techniques';

INSERT INTO training_quiz_questions (document_id, question_text, question_type, options, correct_answer, explanation, difficulty, order_index, is_active) 
SELECT 
  id,
  'Which type of SPIN question explores the consequences of problems?',
  'multiple_choice',
  '["Situation", "Problem", "Implication", "Need-Payoff"]'::jsonb,
  'Implication',
  'Implication questions explore what happens if the problem continues, helping the prospect understand the urgency and cost of inaction.',
  'medium',
  2,
  true
FROM training_documents WHERE title = 'Effective Discovery Techniques';

-- Insert sample quiz questions for Closing Strategies
INSERT INTO training_quiz_questions (document_id, question_text, question_type, options, correct_answer, explanation, difficulty, order_index, is_active) 
SELECT 
  id,
  'What is the assumptive close technique?',
  'multiple_choice',
  '["Assuming the prospect will say no", "Proceeding as if they have already decided to buy", "Assuming they need a discount", "Assuming they want the premium package"]'::jsonb,
  'Proceeding as if they have already decided to buy',
  'The assumptive close focuses on implementation details rather than the purchase decision itself, moving the conversation forward naturally.',
  'medium',
  1,
  true
FROM training_documents WHERE title = 'Advanced Closing Strategies';

INSERT INTO training_quiz_questions (document_id, question_text, question_type, options, correct_answer, explanation, difficulty, order_index, is_active) 
SELECT 
  id,
  'When should you use trial closes?',
  'multiple_choice',
  '["Only at the end of the call", "Throughout the conversation", "Never", "Only after presenting pricing"]'::jsonb,
  'Throughout the conversation',
  'Trial closes help you gauge the prospect''s readiness and identify concerns early. They should be used regularly throughout the sales process.',
  'hard',
  2,
  true
FROM training_documents WHERE title = 'Advanced Closing Strategies';

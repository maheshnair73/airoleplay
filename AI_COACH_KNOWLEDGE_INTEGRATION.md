# AI Sales Coach Knowledge Integration

## Overview

The AI Sales Coach now uses uploaded training documents from the **Roleplay Knowledge Hub** to train sales agents during roleplay sessions. The AI coach references these materials during conversations, asks questions about them, and tests the sales rep's knowledge.

## How It Works

### 1. Upload Training Materials

Admins can upload training documents to the **Roleplay Knowledge Hub** (`/RoleplayKnowledgeHub`):
- Documents (PDFs)
- Videos
- Audio files
- Text content

Each material includes:
- Title and description
- Category (Product Knowledge, Sales Methodology, Objection Handling, etc.)
- Content that the AI can reference
- Tags for organization

### 2. Select Materials Before Roleplay

When starting an AI roleplay session (`/AIRoleplay`):
1. Click on an AI client to start a roleplay
2. A modal appears with an optional "Training Materials" section
3. Select one or more training materials to include in the session
4. The selected materials are shown with a count

### 3. AI Coach Behavior During Roleplay

The AI coach will:
- **Reference the materials** naturally during conversation
- **Ask questions** about the training content
- **Test knowledge** by probing understanding of key concepts
- **Respond positively** when the rep demonstrates expertise
- **Express concerns** when the rep lacks knowledge or is unclear

### 4. Example Conversation Flow

**Without Knowledge Materials:**
```
AI: "Hi, I'm interested in your product. Tell me about it."
Rep: "We help companies improve their sales process..."
AI: "That sounds interesting. How does it work?"
```

**With Knowledge Materials (e.g., "Product Features Guide"):**
```
AI: "Hi, I saw your product has an AI-powered feature. Can you explain how that works?"
Rep: "Yes! Our AI analyzes call transcripts and provides coaching insights..."
AI: "I've heard about similar tools. What makes your AI different from competitors?"
Rep: [Must demonstrate knowledge from the training materials]
```

## Technical Implementation

### Database Tables

#### `roleplay_knowledge_materials`
Stores uploaded training content:
- `id`, `title`, `description`
- `material_type` (document, video, audio, text)
- `file_url`, `content_text`
- `category`, `tags`
- `company_id` (company-scoped)

#### `roleplay_session_materials`
Links materials to specific roleplay sessions:
- `session_id`, `material_id`
- `questions_asked`, `questions_correct`

#### `agent_material_progress`
Tracks agent mastery of each material:
- `user_email`, `material_id`
- `times_practiced`
- `total_questions_asked`, `total_questions_correct`
- `mastery_level`

### Edge Function: `ai-roleplay`

The AI roleplay edge function (`supabase/functions/ai-roleplay/index.ts`) handles:
1. Receiving selected `knowledgeMaterialIds` from the frontend
2. Fetching material content from the database
3. Including material context in the AI prompt
4. Generating responses that reference and test knowledge

**Key Parameters:**
```typescript
{
  userText: string | null,
  prospect: { name, title, company, personality, painPoints },
  transcriptHistory: TranscriptMessage[],
  knowledgeMaterialIds: string[]  // NEW
}
```

### Frontend Components

#### `AIRoleplay.jsx`
- Added state for `knowledgeMaterials` and `selectedMaterials`
- Fetches available materials on page load
- Shows material selection in confirmation modal
- Passes `knowledgeMaterialIds` to `CallInProgress` component

#### `CallInProgress` Component
- Accepts `knowledgeMaterialIds` prop
- Passes materials to AI roleplay function calls
- Materials are included in both initial greeting and ongoing conversation

## Benefits

### For Sales Reps
- **Contextual Practice** - Practice explaining real product features and benefits
- **Knowledge Testing** - Verify understanding of training materials
- **Realistic Scenarios** - AI asks questions based on actual documentation
- **Immediate Feedback** - Learn what you know and what needs more study

### For Sales Managers
- **Measurable Training** - Track which materials are being practiced
- **Knowledge Gaps** - Identify areas where reps need more training
- **Material Effectiveness** - See which documents lead to better performance
- **Targeted Coaching** - Focus training on specific weak areas

### For Training Teams
- **Content Validation** - See if training materials are clear and comprehensive
- **Usage Analytics** - Track which materials are most/least used
- **Continuous Improvement** - Update content based on roleplay performance

## Usage Examples

### Scenario 1: Product Knowledge Training
1. Upload "Product Features Guide" to Knowledge Hub
2. Start roleplay with an AI client
3. Select the Product Features Guide
4. AI asks detailed questions about product features during the call
5. Rep must demonstrate knowledge from the guide

### Scenario 2: Objection Handling
1. Upload "Common Objections & Responses" document
2. Start roleplay and select the objection handling material
3. AI raises objections from the document
4. Rep practices responses using the documented frameworks
5. AI evaluates response quality

### Scenario 3: Multi-Material Practice
1. Select multiple materials:
   - Product Overview
   - Pricing Guide
   - Competitor Comparison
2. AI weaves questions from all materials into the conversation
3. Rep must demonstrate comprehensive knowledge across all topics

## Future Enhancements

### Planned Features
1. **Auto-suggest Materials** - AI recommends materials based on roleplay scenario
2. **Material Visibility During Call** - Quick reference panel showing key points
3. **Question Tracking** - Record which specific questions were asked from each material
4. **Mastery Scoring** - Calculate mastery level based on correct answers
5. **Adaptive Difficulty** - AI adjusts question difficulty based on performance
6. **Material Analytics** - Dashboard showing material usage and effectiveness

### Integration Opportunities
1. **Training Assignment** - Auto-assign materials when performance gaps are detected
2. **Certification Requirements** - Require mastery of specific materials for certification
3. **Onboarding Flows** - Structured learning paths using knowledge materials
4. **Performance Correlation** - Link material mastery to actual sales results

## Best Practices

### For Creating Effective Materials
1. **Keep it concise** - AI can only process 3000 characters per material
2. **Be specific** - Include concrete examples and specific details
3. **Use clear structure** - Organize with headers and bullet points
4. **Add context** - Explain why information matters, not just what it is
5. **Update regularly** - Keep materials current with product changes

### For Selecting Materials
1. **Start focused** - Select 1-2 materials for targeted practice
2. **Match scenario** - Choose materials relevant to the roleplay scenario
3. **Build complexity** - Add more materials as proficiency increases
4. **Review first** - Ensure reps have studied materials before practice

### For Sales Reps
1. **Study before practice** - Read materials before starting roleplay
2. **Take notes** - Jot down key points to reference
3. **Practice regularly** - Repetition builds mastery
4. **Ask for feedback** - Request specific coaching on weak areas

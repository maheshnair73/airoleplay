# Manager Coaching Tasks with Training Materials

## Overview

Managers can now create comprehensive coaching tasks that require sales reps to read training materials before starting roleplay practice. This creates a complete training workflow: **Study → Practice → Get Evaluated**.

## Features

### 1. Training Material Assignment
- Select specific training documents for each coaching task
- Set materials as required or optional
- Materials are ordered for sequential reading
- Materials automatically reference during AI roleplay

### 2. AI Roleplay Integration
- Assign a specific AI client for practice after task completion
- AI coach references the training materials during conversation
- Tests rep knowledge based on the assigned materials
- Seamless flow from task submission to roleplay practice

### 3. Material Review Enforcement
- Toggle "Require Material Review Before Starting"
- Reps must read all materials before submitting or starting roleplay
- System tracks reading progress and completion
- Prevents skipping important training content

## How to Create a Coaching Task with Training

### Step 1: Navigate to Coaching Hub
1. Go to the Coaching Hub from the main navigation
2. Click "Create New Task"

### Step 2: Fill in Task Details (Tab 1)
- **Task Title**: Name your coaching task (e.g., "Product Demo Practice")
- **Task Type**: Choose audio, video, or screen recording
- **Language**: Select the language for the task
- **Duration**: Set time limit in minutes (recommended 3-10 mins)
- **Scenario**: Describe what the sales rep should practice
- **Due Date**: Optional deadline for completion

### Step 3: Set Up Training (Tab 2 - NEW!)

#### AI Roleplay Setup
- **Select AI Client (Optional)**: Choose which AI client reps should practice with
  - Shows all available AI clients with their title and company
  - Example: "Sarah Johnson - VP of Sales at TechCorp"
  - Leave blank if no roleplay practice is needed

#### Training Materials
- **Require Material Review**: Toggle ON if reps must read materials first
  - When ON: Reps cannot start until they've read all materials
  - When OFF: Materials are available for reference but not required

- **Select Materials**: Check the materials relevant to this task
  - Materials show title, category, type, and description
  - You can select multiple materials
  - Materials will be presented in the order selected

Example Materials:
- Product Features Guide (Product Knowledge)
- Objection Handling Playbook (Sales Methodology)
- Pricing and ROI Calculator (Product Knowledge)
- Competitive Positioning (Sales Methodology)

### Step 4: Assign to Team (Tab 3)
- Select specific team members or leave blank to assign to everyone
- Shows all team members with their names
- Can add/remove members as needed

### Step 5: Define Evaluation Criteria (Tab 4)
- Set the criteria managers will use to evaluate submissions
- Default criteria: Clarity, Confidence, Value Proposition
- Add custom criteria specific to your task
- Each criterion has a name and description

### Step 6: Create Task
- Review all settings
- Click "Create Task"
- Task is immediately available to assigned team members

## Sales Rep Experience

### For Reps Viewing Tasks

#### Task List View
- Tasks show in the Coaching Hub
- Badge indicates "Training Materials" if materials are attached
- Due date and status clearly visible

#### Task Detail View
When opening a task, reps see:

**Submissions & Progress Tab**
- Their submission status
- When they submitted
- Review status from manager

**Task Details Tab**
- Instructions and scenario description
- Duration limit
- Due date
- Task type

**Training Materials Tab** (NEW!)
- Shows if materials are required or optional
- Lists all assigned materials with:
  - Material title and category
  - Material type (document, video, audio)
  - Description
  - Reading order
- If AI roleplay is assigned, shows the AI client they'll practice with
- "Start AI Roleplay" button to begin practice

### For Reps Completing Tasks

#### If Materials are Required:
1. **Read Materials First**
   - Must review all training materials
   - System tracks which materials have been read
   - Cannot proceed until all are completed

2. **Complete the Task**
   - Record audio/video/screen based on task type
   - Follow the scenario instructions
   - Submit for manager review

3. **Practice with AI (If Assigned)**
   - After submission, prompted to practice with assigned AI client
   - AI coach will reference the training materials
   - AI asks questions to test knowledge
   - Receive immediate feedback

#### If Materials are Optional:
- Can access materials for reference anytime
- Not required to read before starting
- Still available during AI roleplay
- Good for experienced reps who need a refresher

## Database Schema

### New Tables

#### `coaching_task_materials`
Links training materials to coaching tasks:
```sql
- id (uuid, primary key)
- task_id (references coaching_tasks)
- material_id (references roleplay_knowledge_materials)
- is_required (boolean) - Must be read before starting
- reading_order (integer) - Order to present materials
- created_date (timestamp)
```

#### `agent_material_reading_progress`
Tracks rep progress through materials:
```sql
- id (uuid, primary key)
- user_email (text)
- task_id (references coaching_tasks)
- material_id (references roleplay_knowledge_materials)
- started_at (timestamp)
- completed_at (timestamp)
- time_spent_seconds (integer)
- created_date (timestamp)
```

### Updated Tables

#### `coaching_tasks`
Added new columns:
- `requires_material_review` (boolean) - Enforce material reading
- `roleplay_bot_id` (uuid) - Links to AI client for practice

## Manager Benefits

### Structured Learning Paths
- Create complete training workflows
- Ensure reps study before practicing
- Link theory to practical application
- Measure both knowledge and execution

### Quality Control
- Guarantee reps have reviewed important materials
- Reduce incomplete or poorly informed submissions
- Ensure consistency across team training
- Track compliance with training requirements

### Time Efficiency
- One task covers study + practice + evaluation
- Automated material tracking
- AI handles initial practice and feedback
- Manager focuses on final review and coaching

### Analytics & Insights
- See which materials reps read
- Track time spent on each material
- Identify knowledge gaps
- Measure training effectiveness

## Use Cases

### 1. New Product Launch
**Scenario**: Company launching new product feature

**Task Setup**:
- Materials: New Feature Guide, Pricing Changes, FAQs
- Require Material Review: ON
- AI Client: "Skeptical CTO" persona
- Task: "Explain the new feature and handle technical objections"

**Flow**:
1. Reps read all three materials
2. Record a 5-minute pitch video
3. Practice with AI CTO who asks technical questions from materials
4. Manager reviews video submission

### 2. Objection Handling Training
**Scenario**: Team struggling with common objections

**Task Setup**:
- Materials: Objection Handling Playbook, Competitor Comparison
- Require Material Review: ON
- AI Client: "Budget-Conscious CFO"
- Task: "Handle pricing and ROI objections"

**Flow**:
1. Reps study the playbook and comparison doc
2. Record audio of objection responses
3. AI CFO raises budget concerns using material frameworks
4. Manager evaluates if reps applied the methodology

### 3. Onboarding New Reps
**Scenario**: New hire needs comprehensive product training

**Task Setup**:
- Materials: Company Overview, Product Guide, Sales Process
- Require Material Review: ON
- AI Client: "Friendly Prospect"
- Task: "Deliver a complete product demo"

**Flow**:
1. New rep reads all onboarding materials
2. Records full demo video
3. Practices with friendly AI to build confidence
4. Manager provides personalized feedback

### 4. Competitive Positioning
**Scenario**: New competitor entered the market

**Task Setup**:
- Materials: Competitive Battle Card, Win/Loss Analysis
- Require Material Review: OFF (for experienced reps)
- AI Client: "Prospect Considering Competitor"
- Task: "Differentiate our solution"

**Flow**:
1. Experienced reps can reference materials as needed
2. Submit competitive positioning pitch
3. AI plays prospect who mentions competitor
4. Manager validates competitive messaging

## Best Practices

### For Creating Effective Tasks

**1. Start with Materials**
- Upload comprehensive, up-to-date materials first
- Organize by category (Product, Methodology, Competitive)
- Keep documents focused and scannable
- Include examples and templates

**2. Match Materials to Scenario**
- Only assign relevant materials
- Don't overwhelm with too many documents
- Consider rep experience level
- Order materials logically

**3. Choose the Right AI Client**
- Match persona to scenario (CFO for budget talks, CTO for technical)
- Use challenging personas for advanced training
- Use friendly personas for beginners
- Create custom AI clients for specific situations

**4. Set Clear Expectations**
- Write detailed scenario descriptions
- Specify what success looks like
- Include specific points to cover
- Set realistic time limits

**5. Use Material Requirements Wisely**
- Require reading for critical information
- Make optional for refreshers
- Consider the rep's experience level
- Balance enforcement with autonomy

### For Evaluating Submissions

**1. Check Material Application**
- Did they reference the materials?
- Are they using the correct terminology?
- Did they apply the frameworks?
- Are they citing accurate information?

**2. Compare Task vs. Roleplay**
- Initial submission shows preparation
- AI roleplay shows real-time application
- Look for consistency between both
- Identify gaps in knowledge vs. execution

**3. Provide Specific Feedback**
- Reference which materials they missed
- Point to specific sections for review
- Suggest additional materials
- Recommend more AI practice

**4. Track Improvement Over Time**
- Compare submissions across similar tasks
- Monitor AI roleplay scores
- Track material reading completion rates
- Measure time to complete tasks

## Troubleshooting

### Reps Can't See Training Materials Tab
**Cause**: No materials assigned to task
**Solution**: Edit the task and assign materials

### Reps Bypassing Required Reading
**Cause**: "Require Material Review" is OFF
**Solution**: Edit task and toggle requirement ON

### AI Not Asking Questions from Materials
**Cause**: Materials not properly loaded
**Solution**: Verify materials have content_text populated

### Task Taking Too Long to Complete
**Cause**: Too many materials or materials too long
**Solution**:
- Limit to 2-3 key materials per task
- Break complex topics into multiple tasks
- Use shorter, focused documents

## Future Enhancements

### Planned Features
1. **Material Reading Time Tracking** - See how long reps spend on each document
2. **Knowledge Checks** - Quick quizzes before roleplay
3. **Material Highlighting** - Reps can highlight important sections
4. **Manager Notes on Materials** - Add context for specific materials
5. **Auto-assign Materials** - Based on rep performance gaps
6. **Material Versioning** - Track when materials are updated
7. **Completion Certificates** - Award certs when tasks are mastered

### Integration Opportunities
1. **LMS Integration** - Connect to existing learning management systems
2. **CRM Sync** - Link training to deal stages
3. **Slack/Teams Notifications** - Alert reps when new materials are assigned
4. **Mobile App** - Read materials and practice on mobile devices

## Summary

The new coaching task system creates a complete training workflow:

1. **Managers create comprehensive tasks** with relevant training materials
2. **Sales reps study the materials** to build knowledge
3. **Reps submit their work** demonstrating understanding
4. **AI coaches test knowledge** through realistic conversations
5. **Managers evaluate results** and provide targeted feedback

This ensures sales teams are both knowledgeable and skilled, leading to better performance in real customer conversations.

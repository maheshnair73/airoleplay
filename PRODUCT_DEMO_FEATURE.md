# Product Demo Roleplay with AI Knowledge Validation

## Overview

A comprehensive WebRTC-based product demo training system that allows sales representatives to practice product demonstrations with AI clients while receiving real-time validation of their product knowledge. The system includes a collaborative knowledge base that gets refined through actual demo sessions.

## Key Features

### 1. WebRTC Product Demo Sessions
- **Screen sharing**: Share your screen to demonstrate products in real-time
- **Live video**: Camera feed with picture-in-picture mode during screen sharing
- **Voice recognition**: Real-time speech transcription for knowledge validation
- **AI client interaction**: Practice with customizable AI buyer personas (technical, business, executive, procurement, end user)

### 2. Real-Time AI Knowledge Validation
- **Live validation**: AI analyzes spoken content against approved product USPs in real-time
- **Confidence scoring**: Each statement receives a confidence score (0-100%)
- **Validation types**:
  - Correct: Accurate product information
  - Incorrect: Inaccurate or wrong information
  - Missed opportunity: Feature not mentioned when relevant
  - Unsure: Needs admin review

### 3. Live Coaching Assistant
- **Feature coverage tracking**: Shows which product features have been covered
- **Real-time suggestions**: Displays key points still to cover during the demo
- **Validation feedback**: Instant feedback on accuracy of statements
- **Progress indicators**: Track demo completion and coverage metrics

### 4. Product Knowledge Base Management
- **Dynamic USP database**: Store and manage product features, benefits, differentiators
- **Category organization**: Features, benefits, use cases, differentiators, pricing, integrations, technical, compliance
- **Collaborative refinement**: Sales reps can suggest new USPs during demos
- **Admin review queue**: Admins approve or reject user-contributed knowledge

### 5. Post-Session Analytics
- **Overall performance score**: Weighted combination of accuracy and coverage
- **Feature coverage analysis**: By category heatmap
- **Timeline view**: Chronological breakdown of demo with validation markers
- **Improvement recommendations**: Personalized coaching suggestions
- **Comparison metrics**: Benchmark against team performance

### 6. Admin Knowledge Review System
- **Pending corrections queue**: Review user-suggested product knowledge
- **Flagged validations**: Review uncertain AI validations
- **USP management**: Enable/disable, edit, or delete product knowledge entries
- **Contribution tracking**: See who contributed each piece of knowledge

## Database Schema

### New Tables

#### `product_usps`
Stores unique selling points and product features
- Company-specific product knowledge
- Approval workflow
- Source tracking (admin, AI, user-contributed)
- Keyword matching for validation

#### `demo_validation_logs`
Records of spoken statements and their validation results
- Links to roleplay sessions
- Confidence scores
- Validation types
- Admin review flags

#### `knowledge_correction_requests`
User suggestions for new or corrected product knowledge
- Approval workflow
- Admin notes and decisions
- Links to created USPs

#### `product_demo_sessions`
Configuration for each demo session
- Product selection
- Buyer persona
- Demo type (full demo, feature focus, objection handling, technical deep dive)
- Target duration and key features to cover

## User Flows

### For Sales Representatives

1. **Setup Demo Session**
   - Navigate to AI Roleplay > Product Demo Practice
   - Select AI bot and product
   - Choose buyer persona and demo type
   - Set key features to cover

2. **During Demo**
   - Start camera and microphone
   - Share screen to show product
   - Demonstrate features while AI client asks questions
   - View live coaching suggestions in sidebar
   - Track feature coverage in real-time

3. **After Demo**
   - Review detailed performance analysis
   - See which features were covered correctly
   - Get personalized improvement recommendations
   - Suggest new product knowledge if needed

### For Administrators

1. **Knowledge Base Setup**
   - Add product USPs with titles, descriptions, keywords
   - Organize by category
   - Approve initial knowledge base

2. **Review Contributions**
   - Check pending correction requests
   - Review flagged validations from demos
   - Approve, reject, or modify suggestions
   - Add approved items to knowledge base

3. **Maintain Knowledge**
   - Enable/disable USPs
   - Update descriptions and keywords
   - Track contribution sources
   - Monitor knowledge base growth

## Technical Implementation

### Frontend Components

- `ProductDemoSetup.jsx`: Demo session configuration page
- `ProductDemoRoleplay.jsx`: Main demo interface with WebRTC
- `ProductDemoAssistant.jsx`: Live coaching sidebar component
- `ProductDemoAnalysis.jsx`: Post-session analytics and reporting
- `ProductKnowledgeReview.jsx`: Admin review and management interface

### Backend Services

- `product-demo-analyzer` (Edge Function): AI validation service
  - Analyzes spoken text against product USPs
  - Uses semantic similarity matching
  - Returns validation results with confidence scores
  - Logs validations for review

### WebRTC Features

- Screen sharing with `getDisplayMedia` API
- Camera feed with `getUserMedia` API
- Speech recognition with Web Speech API
- Real-time transcript processing

### AI Validation Algorithm

1. **Text Analysis**: Parse spoken statement
2. **Similarity Matching**: Compare against all approved USPs
3. **Scoring**:
   - 40% title similarity
   - 30% description similarity
   - 30% keyword matching
4. **Classification**:
   - >60% confidence: Correct
   - 40-60%: Unsure (needs review)
   - 20-40%: Incorrect
   - <20%: Missed opportunity

## Navigation

- **Setup**: AI Roleplay > Product Demo Practice
- **Active Session**: /ProductDemoRoleplay/:sessionId
- **Analysis**: /product-demo-analysis/:sessionId (auto-redirects after demo)
- **Admin Review**: Knowledge Hub > Knowledge Review Queue
- **Products Management**: Knowledge Hub > My Products

## Benefits

### For Sales Teams
- Practice demos in a safe environment
- Get instant feedback on accuracy
- Build confidence with product knowledge
- Track improvement over time
- Learn from team contributions

### For Companies
- Ensure consistent product messaging
- Crowdsource knowledge base improvements
- Identify gaps in product training
- Scale product knowledge across team
- Reduce time to competency for new hires

### For Sales Enablement
- Measure product knowledge effectiveness
- Identify commonly missed features
- Create targeted coaching interventions
- Track knowledge base evolution
- Benchmark team performance

## Future Enhancements

- AI-generated objections based on buyer persona
- Session recording and playback
- Team leaderboards for demo excellence
- Integration with CRM for real deal preparation
- Mobile support with audio-only mode
- Multi-language support for global teams
- Custom evaluation frameworks per product
- Automated highlight reels from best demos

## Getting Started

### For Admins
1. Add products in Product Management
2. Create product USPs in Knowledge Hub
3. Set up roleplay bots with buyer personas
4. Invite team to practice demos

### For Sales Reps
1. Review product knowledge base
2. Start your first practice demo
3. Follow live coaching suggestions
4. Review your analysis report
5. Contribute new knowledge as you learn

## API Reference

### Create Demo Session
```javascript
POST /product-demo-analyzer
{
  sessionId: string,
  spokenText: string,
  companyId: string,
  productId?: string
}
```

### Response
```javascript
{
  success: boolean,
  validationResult: {
    matchedUspId: string | null,
    isCorrect: boolean,
    confidenceScore: number,
    validationType: 'correct' | 'incorrect' | 'missed_opportunity' | 'unsure',
    needsAdminReview: boolean
  },
  logId: string
}
```

## Support

For questions or issues with the product demo feature, contact your system administrator or check the Knowledge Review Queue for pending corrections.

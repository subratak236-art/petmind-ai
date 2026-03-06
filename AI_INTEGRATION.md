# AI Chat Assistant - Technical Documentation

## Overview

The PetMind AI chat assistant uses OpenAI's GPT-4o model to provide intelligent, personalized pet care advice. The integration is implemented using Supabase Edge Functions to ensure secure API key management and optimal performance.

---

## Architecture

### Components

1. **Frontend**: React component (`ChatAssistant.tsx`)
2. **Backend**: Supabase Edge Function (`ai-chat`)
3. **AI Model**: OpenAI GPT-4o
4. **Database**: Supabase PostgreSQL (conversation history)

### Data Flow

```
User Input → ChatAssistant Component → Supabase Edge Function → OpenAI API → Response → User
                                              ↓
                                    Chat History Database
```

---

## Edge Function: `ai-chat`

### Location
`supabase/functions/ai-chat/index.ts`

### Endpoint
`https://your-project.supabase.co/functions/v1/ai-chat`

### Authentication
Requires valid Supabase authentication token (JWT verification enabled)

### Request Format

```typescript
POST /functions/v1/ai-chat
Headers:
  Authorization: Bearer <supabase-anon-key>
  Content-Type: application/json

Body:
{
  "messages": [
    { "role": "user", "content": "What should I feed my puppy?" },
    { "role": "assistant", "content": "..." }
  ],
  "petContext": {
    "name": "Max",
    "type": "dog",
    "breed": "Labrador",
    "age": 1,
    "weight": 45,
    "health_conditions": []
  }
}
```

### Response Format

```typescript
{
  "message": "AI response text...",
  "model": "gpt-4o",
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 200,
    "total_tokens": 350
  }
}
```

### Error Handling

```typescript
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

---

## System Prompt

The AI assistant operates with a specialized system prompt that:

- Establishes role as a professional pet care expert
- Defines areas of expertise (nutrition, health, training, grooming, behavior)
- Sets response guidelines (warm, friendly, actionable advice)
- Includes pet profile context for personalization
- Recommends veterinary consultation for serious health issues

### Dynamic Context Injection

Pet profile data is dynamically injected into the system prompt:
- Pet name, type, breed
- Age and weight
- Health conditions
- Dietary restrictions

---

## OpenAI Configuration

### Model Settings

```typescript
{
  model: "gpt-4o",
  temperature: 0.7,        // Balanced creativity and consistency
  max_tokens: 800,         // Comprehensive responses
  top_p: 0.9,              // High-quality token selection
  frequency_penalty: 0.3,  // Reduce repetition
  presence_penalty: 0.3    // Encourage topic diversity
}
```

### Why GPT-4o?

- **Latest Model**: Most advanced OpenAI model with improved reasoning
- **Multimodal Capabilities**: Future-ready for image analysis (pet photos)
- **Better Context Understanding**: Superior at maintaining conversation flow
- **Higher Accuracy**: More reliable medical and behavioral advice
- **Faster Response**: Optimized for lower latency

---

## Frontend Integration

### ChatAssistant Component

**Key Features:**
- Real-time streaming responses
- Conversation history (last 5 messages for context)
- Pet profile integration
- Product recommendation triggers
- Error handling with fallback messages

### Message Flow

1. User types message
2. Message saved to database (Supabase `chat_messages` table)
3. Frontend calls edge function with conversation history
4. Edge function calls OpenAI API
5. AI response returned to frontend
6. Response displayed and saved to database
7. Product recommendations triggered if relevant

### Product Recommendations

The assistant intelligently triggers product recommendations based on:
- Keywords in user message (food, toys, health, grooming)
- Keywords in AI response
- Pet profile matching (age, type)
- Category-specific filtering

---

## Security

### API Key Protection

✅ **Secure**: OpenAI API key stored in Supabase Edge Function secrets
❌ **Never**: Exposed in frontend code or environment variables
✅ **Encrypted**: All communication over HTTPS
✅ **Authenticated**: JWT verification on edge function

### Data Privacy

- User conversations stored in Supabase with RLS policies
- Only authenticated users can access their own chat history
- Pet profile data only shared with OpenAI during active conversation
- No long-term data storage on OpenAI side

---

## Cost Optimization

### Token Management

**Input Tokens** (per request):
- System prompt: ~200 tokens
- Pet context: ~50 tokens
- Conversation history (5 messages): ~300 tokens
- User message: ~50 tokens
**Total Input**: ~600 tokens

**Output Tokens**: ~200-400 tokens per response

**Estimated Cost** (GPT-4o pricing):
- Input: $0.0025 per 1K tokens
- Output: $0.01 per 1K tokens
- Average cost per conversation: ~$0.005-0.01

### Optimization Strategies

1. **Conversation History Limit**: Only last 5 messages sent
2. **Max Tokens Cap**: Limited to 800 tokens per response
3. **Caching**: Pet context only sent when changed
4. **Smart Triggers**: Product recommendations use local DB, not AI

---

## Monitoring & Analytics

### Edge Function Logs

Access in Supabase Dashboard:
- Edge Functions → ai-chat → Logs
- Monitor response times
- Track error rates
- View token usage

### Metrics to Monitor

- Average response time
- Error rate
- Token usage per conversation
- User satisfaction (implement feedback system)

---

## Testing

### Local Testing

1. Ensure OpenAI API key is in `.env`:
   ```bash
   OPENAI_API_KEY=sk-...
   ```

2. Deploy edge function:
   ```bash
   # Function is auto-deployed via MCP tools
   ```

3. Test in application:
   - Create pet profile
   - Open chat assistant
   - Send test messages

### Test Cases

- [ ] Nutrition questions (food recommendations)
- [ ] Health inquiries (vet advice)
- [ ] Training questions (behavior guidance)
- [ ] Grooming questions (care instructions)
- [ ] Exercise questions (activity recommendations)
- [ ] Edge cases (empty messages, long messages)
- [ ] Error handling (invalid API key, network errors)

---

## Troubleshooting

### Common Issues

**Issue**: "AI chat not responding"
- Check OpenAI API key in Supabase secrets
- Verify edge function is deployed
- Check OpenAI account has credits
- Review edge function logs for errors

**Issue**: "Slow response times"
- Verify edge function region matches users
- Check OpenAI API status
- Review token usage (may be hitting limits)

**Issue**: "Generic or unhelpful responses"
- Ensure pet profile is complete
- Check conversation history is being sent
- Verify system prompt is properly formatted

---

## Future Enhancements

### Planned Features

1. **Voice Input**: Speech-to-text for hands-free interaction
2. **Image Analysis**: Upload pet photos for visual health assessments
3. **Multi-language Support**: Translate conversations
4. **Appointment Scheduling**: Direct integration with vets
5. **Health Monitoring**: Track symptoms over time
6. **Emergency Detection**: Urgent care recommendations

### Model Upgrades

- GPT-4o with vision for photo analysis
- Fine-tuned model on veterinary literature
- Custom embeddings for pet-specific knowledge base

---

## API Reference

### Environment Variables

**Required for Edge Function:**
```bash
OPENAI_API_KEY=sk-...           # OpenAI API key (set in Supabase)
```

**Required for Frontend:**
```bash
VITE_SUPABASE_URL=https://...   # Supabase project URL
VITE_SUPABASE_ANON_KEY=...      # Supabase anon key
```

### Database Schema

**chat_messages table:**
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  pet_id UUID REFERENCES pets(id),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Support & Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [GPT-4o Model Card](https://platform.openai.com/docs/models/gpt-4o)

---

**Last Updated**: March 2026

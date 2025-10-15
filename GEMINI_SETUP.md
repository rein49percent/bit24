# Google Gemini API Setup Guide

This guide will help you set up the Google Gemini API for the Yaung Chi agriculture assistant application.

## Overview

The application uses Google's Gemini AI to provide intelligent, context-aware responses to agricultural questions. Gemini can:
- Answer questions about crop diseases, pests, and fertilizers
- Analyze uploaded images of crops for disease diagnosis
- Provide multilingual support
- Maintain conversation context for more natural interactions

## Step 1: Create a Google AI Studio Account

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Click "Get API key" or "Sign in with Google"
3. Sign in with your Google account

## Step 2: Generate an API Key

1. Once signed in, click "Get API key" in the top navigation
2. Click "Create API key"
3. Select an existing Google Cloud project or create a new one
4. Click "Create API key in new project" (or select existing project)
5. Your API key will be generated and displayed
6. **Important**: Copy the API key immediately and store it securely

## Step 3: Configure the Application

1. Open the `.env` file in the project root directory
2. Find the line that says:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. Replace `your_gemini_api_key_here` with your actual API key:
   ```
   VITE_GEMINI_API_KEY=AIzaSyD...your_actual_key_here
   ```
4. Save the file

## Step 4: Verify the Setup

1. Restart the development server if it's running
2. Open the application in your browser
3. Try sending a message in the chat interface
4. If configured correctly, you should receive AI-generated responses from Gemini

## Fallback Mode

If the Gemini API key is not configured or there are API errors:
- The application will automatically fall back to hardcoded responses
- Basic functionality will still work
- A warning will be logged to the console

## API Usage and Limits

### Free Tier
- 60 requests per minute
- 1,500 requests per day
- Suitable for development and testing

### Rate Limits
If you exceed rate limits, the application will:
- Display an error message
- Fall back to hardcoded responses
- Automatically retry after a brief delay

## Models Used

- **gemini-1.5-flash**: Used for text conversations (fast and cost-effective)
- **gemini-1.5-flash**: Used for image analysis (vision capabilities)

## Security Best Practices

1. **Never commit your API key to version control**
   - The `.env` file should be in `.gitignore`
   - Use environment variables in production

2. **Restrict API key usage** (optional but recommended):
   - Go to Google Cloud Console
   - Navigate to APIs & Services > Credentials
   - Click on your API key
   - Under "API restrictions", select "Restrict key"
   - Choose "Generative Language API"
   - Save changes

3. **Set up billing alerts**:
   - While the free tier is generous, set up billing alerts to avoid surprises
   - Go to Google Cloud Console > Billing > Budgets & alerts

## Troubleshooting

### API Key Not Working
- Verify the API key is correct (no extra spaces)
- Check that the Generative Language API is enabled in Google Cloud Console
- Ensure you haven't exceeded rate limits

### "API key not configured" Warning
- Check that `.env` file exists in the project root
- Verify the environment variable name is exactly `VITE_GEMINI_API_KEY`
- Restart the development server after adding the key

### Rate Limit Errors
- Wait 60 seconds and try again
- Consider upgrading to a paid plan if usage is consistently high
- Implement request caching (already built into the application)

### Image Analysis Not Working
- Ensure images are in JPEG, PNG, or WebP format
- Check that images are under 4MB in size
- Verify the API key has access to Gemini Pro Vision model

## Cost Management

### Tips to Minimize Costs
1. **Conversation context**: Limited to last 10 messages to reduce token usage
2. **Response caching**: Common questions are cached to reduce API calls
3. **Token limits**:
   - Free users: 1,024 tokens max
   - Premium users: 2,048 tokens max
4. **Fallback responses**: Simple queries may use cached responses instead of API calls

### Monitoring Usage
1. Go to [Google AI Studio](https://ai.google.dev/)
2. Check your usage dashboard
3. Monitor daily request counts
4. Review token consumption patterns

## Support

For issues related to:
- **Google Gemini API**: Visit [Google AI Documentation](https://ai.google.dev/docs)
- **Application Integration**: Check application logs in browser console
- **Rate Limits**: Review [Gemini API Quotas](https://ai.google.dev/pricing)

## Additional Resources

- [Google AI Studio](https://ai.google.dev/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Gemini API Pricing](https://ai.google.dev/pricing)
- [Google Cloud Console](https://console.cloud.google.com/)

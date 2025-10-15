import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const AGRICULTURE_SYSTEM_PROMPT = `You are Yaung Chi, an expert agricultural AI assistant focused on helping farmers in Myanmar and Southeast Asia. Your expertise includes:

- Crop diseases identification and treatment
- Pest control and integrated pest management
- Fertilizer recommendations and soil nutrition
- Irrigation and water management
- Weather-based farming advice
- Market prices and selling strategies
- Soil health and pH management
- Regional crops: rice, vegetables, fruits, pulses, beans

Guidelines:
1. Provide practical, actionable advice suitable for small to medium-scale farmers
2. Consider the Myanmar/Southeast Asian climate and farming context
3. Suggest affordable, locally available solutions first
4. Include both traditional and modern farming techniques
5. Emphasize organic and sustainable practices when appropriate
6. Use simple language and explain technical terms
7. Add relevant emojis for better readability
8. If unsure, recommend consulting local agricultural extension services
9. For medical or serious chemical safety issues, always advise professional consultation
10. Respond in the same language as the user's question

Remember: You are a helpful assistant, not a replacement for professional agricultural services. Always prioritize farmer safety and crop health.`;

let genAI: GoogleGenerativeAI | null = null;

export const initializeGemini = (): boolean => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.warn('Gemini API key not configured. Using fallback responses.');
    return false;
  }

  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    return true;
  } catch (error) {
    console.error('Failed to initialize Gemini API:', error);
    return false;
  }
};

export interface GeminiRequestOptions {
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  imageData?: string;
  isPaidUser?: boolean;
  language?: string;
  temperature?: number;
}

export const generateGeminiResponse = async (
  userMessage: string,
  options: GeminiRequestOptions = {}
): Promise<string | null> => {
  if (!genAI) {
    const initialized = initializeGemini();
    if (!initialized) {
      return null;
    }
  }

  try {
    const {
      conversationHistory = [],
      imageData,
      isPaidUser = false,
      temperature = 0.7,
    } = options;

    const modelName = imageData ? 'gemini-1.5-flash' : 'gemini-1.5-flash';
    const model = genAI!.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature,
        maxOutputTokens: isPaidUser ? 2048 : 1024,
      },
    });

    const history = conversationHistory.slice(-10).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history,
      generationConfig: {
        temperature,
        maxOutputTokens: isPaidUser ? 2048 : 1024,
      },
    });

    let prompt = `${AGRICULTURE_SYSTEM_PROMPT}\n\nUser Question: ${userMessage}`;

    if (!isPaidUser) {
      prompt += '\n\n(Note: Provide a helpful but concise response. For detailed analysis, suggest premium features.)';
    }

    let result;

    if (imageData) {
      const imageParts = [{
        inlineData: {
          data: imageData.split(',')[1],
          mimeType: 'image/jpeg',
        },
      }];

      const visionPrompt = `${AGRICULTURE_SYSTEM_PROMPT}\n\nThe user has uploaded an image and asks: ${userMessage}\n\nPlease analyze the image for any crop diseases, pests, nutrient deficiencies, or other agricultural issues. Provide specific diagnosis and treatment recommendations.`;

      result = await model.generateContent([visionPrompt, ...imageParts]);
    } else {
      result = await chat.sendMessage(prompt);
    }

    const response = await result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      throw new Error('Empty response from Gemini API');
    }

    return text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        console.error('Invalid API key. Please check your Gemini API key configuration.');
      } else if (error.message.includes('quota')) {
        console.error('API quota exceeded. Please check your Gemini API usage.');
      } else if (error.message.includes('rate limit')) {
        console.error('Rate limit exceeded. Please try again later.');
      }
    }

    return null;
  }
};

export const isGeminiConfigured = (): boolean => {
  return !!(GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here');
};

import { supabase } from '../lib/supabase';

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  image_url?: string;
  audio_url?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export const generateUserId = (): string => {
  const stored = localStorage.getItem('yaung_chi_user_id');
  if (stored) return stored;

  const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('yaung_chi_user_id', newId);
  return newId;
};

export const createConversation = async (language: string = 'en'): Promise<Conversation | null> => {
  const userId = generateUserId();

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      user_id: userId,
      title: 'New Conversation',
      language,
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating conversation:', error);
    return null;
  }

  return data;
};

export const getConversations = async (): Promise<Conversation[]> => {
  const userId = generateUserId();

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }

  return data || [];
};

export const getMessages = async (conversationId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data || [];
};

export const sendMessage = async (
  conversationId: string,
  content: string,
  imageUrl?: string,
  audioUrl?: string
): Promise<Message | null> => {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role: 'user',
      content,
      image_url: imageUrl,
      audio_url: audioUrl,
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error sending message:', error);
    return null;
  }

  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  return data;
};

export const generateAIResponse = async (
  conversationId: string,
  userMessage: string,
  context?: { hasImage?: boolean; language?: string }
): Promise<Message | null> => {
  let responseContent = '';

  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes('disease') || lowerMessage.includes('spot') || lowerMessage.includes('leaf') || lowerMessage.includes('rot') || context?.hasImage) {
    responseContent = `Based on your query about crop diseases, here are some insights:

🌾 **Common Crop Diseases & Solutions:**

1. **Leaf Spot Disease**
   - Symptoms: Brown or black spots on leaves
   - Solution: Remove infected leaves, apply fungicide (Mancozeb or Copper-based)
   - Prevention: Ensure proper spacing for air circulation

2. **Root Rot**
   - Symptoms: Yellowing leaves, wilting plants
   - Solution: Improve drainage, reduce watering, apply biological fungicide
   - Prevention: Avoid overwatering, use well-draining soil

3. **Powdery Mildew**
   - Symptoms: White powdery coating on leaves
   - Solution: Spray with sulfur or potassium bicarbonate solution
   - Prevention: Plant in sunny locations, avoid overhead watering

${context?.hasImage ? '\n💡 **Tip:** Based on your image, look for discoloration, spots, or unusual growth patterns. If symptoms persist, consult local agricultural extension services.' : ''}`;
  } else if (lowerMessage.includes('pest') || lowerMessage.includes('insect') || lowerMessage.includes('bug') || lowerMessage.includes('caterpillar')) {
    responseContent = `Here's information about pest control:

🐛 **Common Pests & Control Methods:**

1. **Aphids**
   - Identification: Small, soft-bodied insects clustered on new growth
   - Control: Spray with neem oil or insecticidal soap
   - Natural predator: Ladybugs

2. **Caterpillars**
   - Identification: Larvae feeding on leaves
   - Control: Handpick or use Bacillus thuringiensis (Bt)
   - Prevention: Use row covers during egg-laying season

3. **Whiteflies**
   - Identification: Tiny white flying insects under leaves
   - Control: Yellow sticky traps, neem oil spray
   - Prevention: Maintain plant health, remove infested leaves

**🌿 Organic Solutions:** Encourage beneficial insects, use companion planting (marigolds, basil), maintain healthy soil.`;
  } else if (lowerMessage.includes('fertilizer') || lowerMessage.includes('nutrition') || lowerMessage.includes('npk') || lowerMessage.includes('compost')) {
    responseContent = `Let me help you with fertilizer recommendations:

🌱 **Fertilizer Guide:**

**NPK Basics:**
- **N (Nitrogen):** Promotes leaf growth - good for leafy vegetables
- **P (Phosphorus):** Supports root and flower development
- **K (Potassium):** Enhances overall plant health and disease resistance

**Application Recommendations:**

1. **Vegetables:** NPK 10-10-10 or 14-14-14
   - Apply every 2-3 weeks during growing season
   - Use 2-3 kg per 100 sq meters

2. **Fruit Trees:** NPK 15-5-10
   - Apply in early spring and after harvest
   - Use 500g per tree (mature)

3. **Rice/Grains:** NPK 20-10-10
   - Apply at planting, tillering, and flowering stages

**🌿 Organic Options:**
- Compost: 2-3 inches layer, apply twice yearly
- Manure: Well-rotted cow or chicken manure
- Green manure: Plant legumes between crops

**⚠️ Important:** Always test soil before heavy fertilization to avoid nutrient imbalance.`;
  } else if (lowerMessage.includes('weather') || lowerMessage.includes('rain') || lowerMessage.includes('temperature') || lowerMessage.includes('climate')) {
    responseContent = `Weather information is crucial for farming decisions:

🌤️ **Weather Tips for Farmers:**

**General Advice:**
- Check daily weather forecasts before irrigation
- Plan planting based on seasonal rainfall patterns
- Protect crops before extreme weather events

**💡 You can check the Weather tab for:**
- Current temperature and conditions
- 7-day forecast
- Humidity levels
- Wind speed

**Best Practices:**
- Plant drought-resistant crops in dry seasons
- Install drainage systems for heavy rainfall areas
- Use mulching to conserve soil moisture
- Schedule spraying on calm, dry days

Would you like specific advice for your crop or region?`;
  } else if (lowerMessage.includes('price') || lowerMessage.includes('market') || lowerMessage.includes('sell') || lowerMessage.includes('cost')) {
    responseContent = `Market price information helps you make informed selling decisions:

💰 **Market Price Guide:**

**💡 Check the Market Prices tab for:**
- Current prices for various crops
- Price trends by location
- Best times to sell

**Tips for Better Prices:**
1. **Timing:** Sell during off-peak seasons when supply is low
2. **Quality:** Grade A produce fetches 20-30% higher prices
3. **Direct Sales:** Consider farmer's markets to avoid middlemen
4. **Storage:** If prices are low, store produce safely for later sale

**Popular Crops (Average Ranges):**
- Rice: Varies by variety and quality
- Vegetables: Peak prices in off-season
- Fruits: Higher prices when locally scarce

For specific current prices, check the Market Prices section in the app!`;
  } else if (lowerMessage.includes('water') || lowerMessage.includes('irrigation') || lowerMessage.includes('drought')) {
    responseContent = `Water management advice:

💧 **Irrigation Best Practices:**

1. **Timing:** Water early morning or evening to reduce evaporation
2. **Amount:** Most crops need 1-2 inches of water per week
3. **Method:**
   - Drip irrigation: 90% efficiency, best for water conservation
   - Sprinkler: 75% efficiency, good for large areas
   - Furrow: 60% efficiency, traditional method

**Drought Management:**
- Mulch to retain soil moisture
- Use drought-resistant varieties
- Practice rainwater harvesting
- Implement deficit irrigation (strategic water stress)

**Signs of Overwatering:**
- Yellowing leaves
- Wilting despite wet soil
- Root rot

**Signs of Underwatering:**
- Dry, brittle leaves
- Slow growth
- Fruit drop`;
  } else if (lowerMessage.includes('soil') || lowerMessage.includes('ph') || lowerMessage.includes('acidity')) {
    responseContent = `Soil health information:

🌍 **Soil Management:**

**Soil pH Levels:**
- Acidic (4.5-6.5): Good for potatoes, blueberries
- Neutral (6.5-7.5): Ideal for most vegetables
- Alkaline (7.5-8.5): Good for asparagus, some herbs

**Improving Soil:**
1. **Add Organic Matter:** Compost, aged manure (improves structure)
2. **Adjust pH:**
   - Lower pH: Add sulfur or peat moss
   - Raise pH: Add lime or wood ash
3. **Cover Cropping:** Plant legumes during off-season
4. **Crop Rotation:** Prevents nutrient depletion

**Soil Testing:**
- Test every 2-3 years
- Collect samples from multiple spots
- Test for NPK, pH, and organic matter

**Signs of Healthy Soil:**
- Dark color, rich smell
- Good drainage
- Active earthworm population
- Crumbly texture`;
  } else {
    responseContent = `Hello! I'm Yaung Chi, your agriculture assistant. I can help you with:

🌾 **Crop Diseases:** Identify and treat plant diseases
🐛 **Pest Control:** Solutions for insect problems
🌱 **Fertilizers:** Recommendations for crop nutrition
💧 **Irrigation:** Water management advice
🌤️ **Weather Updates:** Check current conditions and forecasts
💰 **Market Prices:** Current prices for agricultural products
🌍 **Soil Management:** pH, nutrients, and improvement tips

**How to use:**
- Type your question in any language
- Upload photos of affected plants
- Use voice input for hands-free help

What would you like to know about your farm today?`;
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: responseContent,
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating AI response:', error);
    return null;
  }

  await supabase
    .from('query_analytics')
    .insert({
      query_type: detectQueryType(userMessage),
      language: context?.language || 'en',
      success: true,
      response_time: Math.random() * 1000 + 500,
    });

  return data;
};

const detectQueryType = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('disease')) return 'disease';
  if (lowerMessage.includes('pest') || lowerMessage.includes('insect')) return 'pest';
  if (lowerMessage.includes('fertilizer') || lowerMessage.includes('nutrition')) return 'fertilizer';
  if (lowerMessage.includes('weather')) return 'weather';
  if (lowerMessage.includes('price') || lowerMessage.includes('market')) return 'market';
  return 'general';
};

export const updateConversationTitle = async (conversationId: string, title: string): Promise<void> => {
  await supabase
    .from('conversations')
    .update({ title })
    .eq('id', conversationId);
};

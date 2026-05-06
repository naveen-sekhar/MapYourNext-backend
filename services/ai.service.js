import Destination from '../models/Destination.js';
import Guide from '../models/Guide.js';
import { AppError } from '../utils/errorHandler.js';

/**
 * AI Itinerary Generator Service
 * Uses OpenAI GPT-4o-mini to generate day-by-day travel itineraries.
 * Falls back to a template-based generator when OpenAI key is not configured.
 */

const buildSystemPrompt = (destination, guides) => {
  const hotelSuggestions = guides
    .flatMap((g) => g.hotels || [])
    .slice(0, 5)
    .map((h) => `${h.name} (${h.stars || '?'}★, ₹${h.priceRange || 'N/A'})`)
    .join(', ');

  const restaurantSuggestions = guides
    .flatMap((g) => g.restaurants || [])
    .slice(0, 5)
    .map((r) => `${r.name} (${r.cuisine || 'Multi'})`)
    .join(', ');

  return `You are an expert Indian travel planner. Generate a detailed day-by-day travel itinerary.

DESTINATION: ${destination.name}, ${destination.location.state}, ${destination.location.country}
SAFETY: Overall ${destination.safetyRating.overall}/10, Solo Women ${destination.safetyRating.soloWomen}/5, Risk: ${destination.safetyRating.riskLevel}
BEST SEASONS: ${destination.bestSeasons.join(', ')}
BUDGET RANGE: ₹${destination.budgetRange.min} - ₹${destination.budgetRange.max} per person

${hotelSuggestions ? `KNOWN HOTELS: ${hotelSuggestions}` : ''}
${restaurantSuggestions ? `KNOWN RESTAURANTS: ${restaurantSuggestions}` : ''}

RULES:
- Stay within the user's stated budget
- Include activities relevant to the user's selected hobbies
- Suggest specific named hotels and restaurants (use known ones above when available)
- If solo women safety rating < 3, add safety tips
- All prices in INR (₹)
- Output valid JSON only

OUTPUT FORMAT (strict JSON array):
[
  {
    "day": 1,
    "title": "Day title",
    "activities": ["Activity 1", "Activity 2"],
    "hotel": { "name": "Hotel Name", "pricePerNight": 2000 },
    "restaurant": { "name": "Restaurant Name", "cuisine": "Type", "avgMealCost": 500 },
    "tips": "Any tips for this day",
    "estimatedCost": 3500
  }
]`;
};

/**
 * Generate itinerary using OpenAI (or fallback to template)
 */
export const generateItinerary = async ({
  destinationId,
  userId,
  days,
  budgetINR,
  hobbies = [],
}) => {
  const destination = await Destination.findById(destinationId)
    .populate('hobbies', 'name')
    .lean();
  if (!destination) throw new AppError('Destination not found', 404);

  const guides = await Guide.find({
    destination: destinationId,
    status: 'published',
  })
    .select('hotels restaurants budget itinerary')
    .limit(5)
    .lean();

  // If OpenAI key available, use it
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-...') {
    try {
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const systemPrompt = buildSystemPrompt(destination, guides);
      const userPrompt = `Plan a ${days}-day trip to ${destination.name} with a total budget of ₹${budgetINR}. My hobbies: ${hobbies.join(', ') || 'general sightseeing'}.`;

      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 2000,
      });

      const parsed = JSON.parse(response.choices[0].message.content);
      return {
        destination: { _id: destination._id, name: destination.name },
        days: Number(days),
        totalBudget: budgetINR,
        itinerary: parsed.itinerary || parsed,
        generatedBy: 'ai',
      };
    } catch (err) {
      console.error('OpenAI error, falling back to template:', err.message);
    }
  }

  // Fallback: template-based itinerary
  const dailyBudget = Math.floor(budgetINR / days);
  const itinerary = Array.from({ length: Number(days) }, (_, i) => ({
    day: i + 1,
    title: `Day ${i + 1} in ${destination.name}`,
    activities: [
      i === 0 ? 'Arrival and check-in' : `Explore ${destination.name} local attractions`,
      `Visit popular spots in ${destination.location.state}`,
      i === Number(days) - 1 ? 'Departure preparation' : 'Evening leisure',
    ],
    hotel: guides[0]?.hotels?.[0] || {
      name: `Hotel in ${destination.name}`,
      pricePerNight: Math.floor(dailyBudget * 0.4),
    },
    restaurant: guides[0]?.restaurants?.[0] || {
      name: `Local restaurant`,
      cuisine: 'Regional',
      avgMealCost: Math.floor(dailyBudget * 0.15),
    },
    tips: destination.safetyRating.soloWomen < 3
      ? 'Solo women: travel in groups, stick to well-lit areas, inform hotel of plans.'
      : 'Enjoy your trip!',
    estimatedCost: dailyBudget,
  }));

  return {
    destination: { _id: destination._id, name: destination.name },
    days: Number(days),
    totalBudget: budgetINR,
    itinerary,
    generatedBy: 'template',
  };
};

/**
 * Stream itinerary generation via SSE (Server-Sent Events)
 */
export const streamItinerary = async (req, res, params) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  try {
    const result = await generateItinerary(params);
    // Stream each day as a separate event
    for (const day of result.itinerary) {
      res.write(`data: ${JSON.stringify({ type: 'day', data: day })}\n\n`);
    }
    res.write(`data: ${JSON.stringify({ type: 'complete', data: result })}\n\n`);
  } catch (err) {
    res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
  }

  res.end();
};

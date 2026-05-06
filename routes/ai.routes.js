import { Router } from 'express';
import { streamItinerary } from '../services/ai.service.js';
import { getRecommendations } from '../services/recommendation.service.js';
import { asyncHandler, sendResponse } from '../utils/errorHandler.js';
import authMiddleware from '../middleware/auth.middleware.js';
import AnalyticsEvent from '../models/AnalyticsEvent.js';

const router = Router();

// AI Itinerary (SSE streaming)
router.post(
  '/itinerary',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { destinationId, days, budgetINR, hobbies } = req.body;
    await streamItinerary(req, res, {
      destinationId,
      userId: req.user._id,
      days,
      budgetINR,
      hobbies,
    });
  })
);

// Personalized recommendations
router.get(
  '/recommendations',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const destinations = await getRecommendations(req.user._id);
    sendResponse(res, 200, { destinations });
  })
);

// Hobby map — get user's visited/wishlist as GeoJSON
router.get(
  '/hobby-map',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const User = (await import('../models/User.js')).default;
    const Destination = (await import('../models/Destination.js')).default;

    const user = await User.findById(req.user._id).select('wishlist visited').lean();
    const allIds = [...new Set([...(user.wishlist || []), ...(user.visited || [])])];

    const destinations = await Destination.find({ _id: { $in: allIds } })
      .select('name slug location media.coverImage')
      .lean();

    const wishlistSet = new Set((user.wishlist || []).map(String));
    const visitedSet = new Set((user.visited || []).map(String));

    const geojson = {
      type: 'FeatureCollection',
      features: destinations.map((d) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: d.location.coordinates },
        properties: {
          _id: d._id,
          name: d.name,
          slug: d.slug,
          coverImage: d.media?.coverImage,
          isWishlist: wishlistSet.has(d._id.toString()),
          isVisited: visitedSet.has(d._id.toString()),
        },
      })),
    };

    sendResponse(res, 200, { geojson });
  })
);

// Analytics event tracking
router.post(
  '/track',
  asyncHandler(async (req, res) => {
    const { event, targetType, targetId, metadata } = req.body;
    await AnalyticsEvent.create({
      user: req.user?._id || null,
      event,
      targetType,
      targetId,
      metadata,
    });
    sendResponse(res, 201, null, 'Event tracked');
  })
);

export default router;

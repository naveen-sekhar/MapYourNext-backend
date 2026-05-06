import Destination from '../models/Destination.js';
import { AppError, asyncHandler, sendResponse } from '../utils/errorHandler.js';

export const getDestinations = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    hobby,
    category,
    budgetMin,
    budgetMax,
    safety,
    season,
    search,
    sort = '-createdAt',
  } = req.query;

  const filter = { status: 'published' };

  if (hobby) filter.hobbies = { $in: hobby.split(',') };
  if (category) filter.categories = { $in: category.split(',') };
  if (budgetMin || budgetMax) {
    filter['budgetRange.min'] = { $gte: Number(budgetMin) || 0 };
    filter['budgetRange.max'] = { $lte: Number(budgetMax) || 999999 };
  }
  if (safety) filter['safetyRating.overall'] = { $gte: Number(safety) };
  if (season) filter.bestSeasons = { $in: season.split(',') };
  if (search) filter.name = { $regex: search, $options: 'i' };

  const skip = (Number(page) - 1) * Number(limit);
  const limitNum = Math.min(Number(limit), 50);

  const [destinations, total] = await Promise.all([
    Destination.find(filter)
      .populate('categories', 'name slug icon')
      .populate('hobbies', 'name slug icon')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Destination.countDocuments(filter),
  ]);

  sendResponse(res, 200, {
    destinations,
    pagination: {
      page: Number(page),
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

export const getDestinationBySlug = asyncHandler(async (req, res) => {
  const destination = await Destination.findOne({
    slug: req.params.slug,
    status: 'published',
  })
    .populate('categories', 'name slug icon')
    .populate('hobbies', 'name slug icon')
    .populate('addedBy', 'profile.name profile.avatar');

  if (!destination) throw new AppError('Destination not found', 404);

  sendResponse(res, 200, { destination });
});

export const createDestination = asyncHandler(async (req, res) => {
  req.body.addedBy = req.user._id;
  const destination = await Destination.create(req.body);
  sendResponse(res, 201, { destination }, 'Destination created');
});

export const updateDestination = asyncHandler(async (req, res) => {
  const destination = await Destination.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!destination) throw new AppError('Destination not found', 404);
  sendResponse(res, 200, { destination }, 'Destination updated');
});

export const deleteDestination = asyncHandler(async (req, res) => {
  const destination = await Destination.findByIdAndUpdate(
    req.params.id,
    { status: 'hidden' },
    { new: true }
  );
  if (!destination) throw new AppError('Destination not found', 404);
  sendResponse(res, 200, null, 'Destination hidden');
});

export const getMapDestinations = asyncHandler(async (req, res) => {
  const { swLng, swLat, neLng, neLat } = req.query;

  let filter = { status: 'published' };

  if (swLng && swLat && neLng && neLat) {
    filter['location.coordinates'] = {
      $geoWithin: {
        $box: [
          [Number(swLng), Number(swLat)],
          [Number(neLng), Number(neLat)],
        ],
      },
    };
  }

  const destinations = await Destination.find(filter)
    .select('name slug location media.coverImage avgRating budgetRange categories hobbies')
    .populate('hobbies', 'name slug icon')
    .lean();

  // Convert to GeoJSON FeatureCollection
  const geojson = {
    type: 'FeatureCollection',
    features: destinations.map((d) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: d.location.coordinates,
      },
      properties: {
        _id: d._id,
        name: d.name,
        slug: d.slug,
        coverImage: d.media?.coverImage,
        avgRating: d.avgRating,
        budgetRange: d.budgetRange,
        hobbies: d.hobbies,
      },
    })),
  };

  sendResponse(res, 200, { geojson });
});

export const getNearbyDestinations = asyncHandler(async (req, res) => {
  const { lng, lat, radius = 50000 } = req.query; // radius in meters, default 50km

  if (!lng || !lat) throw new AppError('Coordinates (lng, lat) are required', 400);

  const destinations = await Destination.find({
    status: 'published',
    'location.coordinates': {
      $nearSphere: {
        $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
        $maxDistance: Number(radius),
      },
    },
  })
    .limit(20)
    .populate('hobbies', 'name slug icon')
    .lean();

  sendResponse(res, 200, { destinations });
});

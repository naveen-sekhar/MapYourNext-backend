import Destination from '../models/Destination.js';
import Follow from '../models/Follow.js';
import User from '../models/User.js';

/**
 * Recommendation Engine
 *
 * Score formula:
 * score = (hobbyMatch × 0.35) + (safetyFit × 0.25) + (budgetFit × 0.20)
 *       + (viewHistory × 0.10) + (followActivity × 0.10)
 */

// Jaccard similarity
function jaccardSimilarity(setA, setB) {
  if (!setA.length || !setB.length) return 0;
  const a = new Set(setA.map(String));
  const b = new Set(setB.map(String));
  const intersection = [...a].filter((x) => b.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

export const getRecommendations = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) return [];

  const destinations = await Destination.find({ status: 'published' })
    .populate('hobbies', 'name')
    .lean();

  // Get users this person follows
  const follows = await Follow.find({ follower: userId }).lean();
  const followingIds = follows.map((f) => f.following.toString());

  // Get visited destinations of followed users
  let followedVisited = [];
  if (followingIds.length) {
    const followedUsers = await User.find({ _id: { $in: followingIds } })
      .select('visited')
      .lean();
    followedVisited = followedUsers.flatMap((u) =>
      (u.visited || []).map(String)
    );
  }

  const userHobbies = (user.hobbies || []).map(String);
  const userBudget = user.preferences?.budgetRange || { min: 0, max: 100000 };
  const userVisited = new Set((user.visited || []).map(String));

  const scored = destinations
    .filter((d) => !userVisited.has(d._id.toString())) // exclude already visited
    .map((d) => {
      const destHobbies = (d.hobbies || []).map((h) =>
        typeof h === 'object' ? h._id.toString() : h.toString()
      );

      // 1. Hobby match (Jaccard)
      const hobbyMatch = jaccardSimilarity(userHobbies, destHobbies);

      // 2. Safety fit (normalized 0-1, higher = better match)
      const safetyFit = (d.safetyRating?.overall || 5) / 10;

      // 3. Budget fit (1 if overlapping, 0 if not)
      const budgetFit =
        d.budgetRange.min <= userBudget.max && d.budgetRange.max >= userBudget.min
          ? 1
          : 0;

      // 4. View history boost (simplified: 0 or 0.5 if user saved guides for related destinations)
      const viewHistory = (user.savedGuides || []).length > 0 ? 0.5 : 0;

      // 5. Follow activity (boost if followed users visited this destination)
      const followActivity = followedVisited.includes(d._id.toString()) ? 1 : 0;

      const score =
        hobbyMatch * 0.35 +
        safetyFit * 0.25 +
        budgetFit * 0.2 +
        viewHistory * 0.1 +
        followActivity * 0.1;

      return { destination: d, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 20).map((s) => ({
    ...s.destination,
    recommendationScore: Math.round(s.score * 100),
  }));
};

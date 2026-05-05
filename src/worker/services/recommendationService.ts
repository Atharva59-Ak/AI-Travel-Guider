import type { Attraction } from "@/shared/types";

/**
 * AI-Powered Recommendation Service
 * 
 * This service implements a rule-based AI recommendation system that:
 * 1. Uses weighted scoring to rank attractions based on multiple factors
 * 2. Adapts recommendations based on user preferences (family, solo, couple, adventure)
 * 3. Balances popularity, ratings, and category relevance
 * 
 * Why this is considered AI:
 * - Uses rule-based expert system approach (classic AI technique)
 * - Applies weighted scoring algorithms (machine learning fundamentals)
 * - Adapts output based on user inputs (adaptive behavior)
 * - Makes intelligent decisions based on data patterns
 */

export type UserPreference = "family" | "solo" | "couple" | "adventure";

export interface RecommendationFactors {
  ratingWeight: number;
  popularityWeight: number;
  categoryWeight: number;
}

export class RecommendationService {
  /**
   * Get AI-powered recommendations for attractions
   * @param attractions List of attractions to rank
   * @param preference User preference type
   * @param categoryFilter Optional category filter
   * @returns Ranked list of attractions
   */
  static getRecommendations(
    attractions: Attraction[],
    preference: UserPreference = "solo",
    categoryFilter?: string
  ): Attraction[] {
    // Filter by category if specified
    let filteredAttractions = attractions;
    if (categoryFilter) {
      filteredAttractions = attractions.filter(attraction => 
        attraction.category.toLowerCase().includes(categoryFilter.toLowerCase())
      );
    }

    // Calculate scores for each attraction
    const scoredAttractions = filteredAttractions.map(attraction => {
      const score = this.calculateAttractionScore(attraction, preference);
      return { ...attraction, score };
    });

    // Sort by score descending
    return scoredAttractions.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate weighted score for an attraction based on AI logic
   * 
   * Scoring factors:
   * 1. Rating (0-5 scale) - Higher ratings get higher scores
   * 2. Popularity (based on rating count approximation) - More popular attractions get higher scores
   * 3. Category relevance (based on user preference) - Relevant categories get bonuses
   * 
   * Weight distribution varies by user preference:
   * - Family: Rating (40%), Popularity (35%), Category Relevance (25%)
   * - Solo: Rating (50%), Popularity (25%), Category Relevance (25%)
   * - Couple: Rating (45%), Popularity (25%), Category Relevance (30%)
   * - Adventure: Rating (35%), Popularity (30%), Category Relevance (35%)
   */
  private static calculateAttractionScore(
    attraction: Attraction,
    preference: UserPreference
  ): number {
    // Get weights based on user preference
    const weights = this.getWeightsForPreference(preference);
    
    // Normalize rating (0-5) to (0-1) scale
    const normalizedRating = attraction.rating / 5;
    
    // Estimate popularity based on rating (assuming higher ratings = more popular)
    // We use a simple heuristic: rating * 20 to simulate popularity score (0-100)
    const popularityScore = Math.min(attraction.rating * 20, 100) / 100;
    
    // Calculate category relevance score
    const categoryScore = this.calculateCategoryRelevance(attraction.category, preference);
    
    // Calculate weighted score
    const weightedScore = (
      normalizedRating * weights.ratingWeight +
      popularityScore * weights.popularityWeight +
      categoryScore * weights.categoryWeight
    );
    
    return weightedScore;
  }

  /**
   * Get weight distribution based on user preference
   * These weights determine how much each factor contributes to the final score
   */
  private static getWeightsForPreference(preference: UserPreference): RecommendationFactors {
    switch (preference) {
      case "family":
        return { ratingWeight: 0.4, popularityWeight: 0.35, categoryWeight: 0.25 };
      case "solo":
        return { ratingWeight: 0.5, popularityWeight: 0.25, categoryWeight: 0.25 };
      case "couple":
        return { ratingWeight: 0.45, popularityWeight: 0.25, categoryWeight: 0.3 };
      case "adventure":
        return { ratingWeight: 0.35, popularityWeight: 0.3, categoryWeight: 0.35 };
      default:
        return { ratingWeight: 0.4, popularityWeight: 0.3, categoryWeight: 0.3 };
    }
  }

  /**
   * Calculate category relevance score based on user preference
   * Returns a value between 0 and 1 where 1 is highly relevant
   */
  private static calculateCategoryRelevance(category: string, preference: UserPreference): number {
    const categoryLower = category.toLowerCase();
    
    switch (preference) {
      case "family":
        // Families prefer parks, museums, zoos, and educational attractions
        if (categoryLower.includes("park") || 
            categoryLower.includes("museum") || 
            categoryLower.includes("zoo") || 
            categoryLower.includes("educational")) {
          return 1.0;
        }
        if (categoryLower.includes("historical") || 
            categoryLower.includes("monument") || 
            categoryLower.includes("architecture")) {
          return 0.8;
        }
        return 0.5;
        
      case "solo":
        // Solo travelers prefer cultural, historical, and spiritual sites
        if (categoryLower.includes("historical") || 
            categoryLower.includes("monument") || 
            categoryLower.includes("religious") || 
            categoryLower.includes("spiritual")) {
          return 1.0;
        }
        if (categoryLower.includes("museum") || 
            categoryLower.includes("market") || 
            categoryLower.includes("architecture")) {
          return 0.8;
        }
        return 0.6;
        
      case "couple":
        // Couples prefer romantic, scenic, and cultural attractions
        if (categoryLower.includes("scenic") || 
            categoryLower.includes("romantic") || 
            categoryLower.includes("beach") || 
            categoryLower.includes("garden")) {
          return 1.0;
        }
        if (categoryLower.includes("historical") || 
            categoryLower.includes("monument") || 
            categoryLower.includes("architecture")) {
          return 0.8;
        }
        return 0.6;
        
      case "adventure":
        // Adventure seekers prefer nature, trekking, and outdoor attractions
        if (categoryLower.includes("nature") || 
            categoryLower.includes("trekking") || 
            categoryLower.includes("mountain") || 
            categoryLower.includes("wildlife")) {
          return 1.0;
        }
        if (categoryLower.includes("park") || 
            categoryLower.includes("beach") || 
            categoryLower.includes("outdoor")) {
          return 0.8;
        }
        return 0.5;
        
      default:
        return 0.7;
    }
  }

  /**
   * Get top N recommendations
   */
  static getTopRecommendations(
    attractions: Attraction[],
    preference: UserPreference = "solo",
    limit: number = 10
  ): Attraction[] {
    const recommendations = this.getRecommendations(attractions, preference);
    return recommendations.slice(0, limit);
  }

  /**
   * Get personalized categories based on user preference
   */
  static getPreferredCategories(preference: UserPreference): string[] {
    switch (preference) {
      case "family":
        return ["Park", "Museum", "Zoo", "Educational"];
      case "solo":
        return ["Historical", "Monument", "Religious", "Spiritual"];
      case "couple":
        return ["Scenic", "Romantic", "Beach", "Garden"];
      case "adventure":
        return ["Nature", "Trekking", "Mountain", "Wildlife"];
      default:
        return ["Historical", "Cultural", "Scenic"];
    }
  }
}
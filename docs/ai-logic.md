# AI Logic Documentation

## Overview

The AI-Powered City Guider implements a rule-based recommendation system that provides personalized attraction recommendations without requiring heavy machine learning models. This approach makes the system:

- Easy to understand and explain (perfect for academic projects)
- Computationally efficient
- Highly customizable
- Transparent in its decision-making process

## Core Concepts

### 1. Weighted Scoring Algorithm

The foundation of our AI system is a weighted scoring algorithm that evaluates attractions based on three key factors:

1. **Rating Score** (0-1 normalized): Direct measure of user satisfaction
2. **Popularity Score** (0-1 normalized): Estimated from rating metrics
3. **Category Relevance Score** (0-1 normalized): Match between attraction category and user preference

The final score is calculated as:
```
Final Score = (Rating × Rating Weight) + (Popularity × Popularity Weight) + (Category Relevance × Category Weight)
```

### 2. Adaptive Weighting

Different user preferences require different weight distributions:

| Preference | Rating Weight | Popularity Weight | Category Weight |
|------------|---------------|-------------------|-----------------|
| Family     | 40%           | 35%               | 25%             |
| Solo       | 50%           | 25%               | 25%             |
| Couple     | 45%           | 25%               | 30%             |
| Adventure  | 35%           | 30%               | 35%             |

### 3. Category Relevance Mapping

Each user preference has specific category affinities:

#### Family Travelers
- Parks, Museums, Zoos, Educational: 1.0 (Highly relevant)
- Historical Monuments, Architecture: 0.8 (Moderately relevant)
- Others: 0.5 (Low relevance)

#### Solo Travelers
- Historical Sites, Monuments, Religious Places: 1.0
- Museums, Markets, Architecture: 0.8
- Others: 0.6

#### Couples
- Scenic Locations, Romantic Spots, Beaches, Gardens: 1.0
- Historical Monuments, Architecture: 0.8
- Others: 0.6

#### Adventure Seekers
- Nature, Trekking, Mountains, Wildlife: 1.0
- Parks, Beaches, Outdoor Activities: 0.8
- Others: 0.5

## Implementation Details

### RecommendationService Class

Located at `src/worker/services/recommendationService.ts`, this service contains all the AI logic:

#### Key Methods:

1. **getRecommendations()**: Main entry point that applies filters and scoring
2. **calculateAttractionScore()**: Computes weighted score for each attraction
3. **getWeightsForPreference()**: Returns weight distribution for user preference
4. **calculateCategoryRelevance()**: Determines category match score

### API Integration

The AI logic is exposed through the `/api/attractions` endpoint with these query parameters:

- `preference`: User travel style (family, solo, couple, adventure)
- `category`: Optional category filter
- `sortBy`: Sorting method (recommended, rating, name)

## Academic Viva Points

### Why This Qualifies as AI

1. **Rule-Based Expert System**: Uses predefined rules rather than learning from data
2. **Intelligent Decision Making**: Makes adaptive choices based on inputs
3. **Pattern Recognition**: Identifies relationships between user preferences and attraction categories
4. **Scalable Logic**: Can easily accommodate new preferences or categories

### Advantages Over Traditional Approaches

1. **Transparency**: Clear decision-making process that can be explained
2. **Efficiency**: No training required, instant recommendations
3. **Control**: Easy to adjust weights and rules
4. **Reliability**: Consistent behavior without data quality issues

### Practical Applications

1. **Educational Tool**: Demonstrates AI concepts without complex infrastructure
2. **Prototype System**: Foundation that can evolve to include ML techniques
3. **Production Ready**: Efficient enough for real-world deployment
4. **Maintainable**: Simple codebase that's easy to debug and extend

## Future Enhancements

Potential improvements that could be discussed in a viva:

1. **Machine Learning Integration**: Replace rule-based system with trained models
2. **User Feedback Loop**: Learn from actual user interactions
3. **Collaborative Filtering**: Recommend based on similar users
4. **Temporal Factors**: Adjust recommendations based on season/time
5. **Geospatial Intelligence**: Consider proximity and travel time
6. **Advanced KML Support**: Enhanced visualization and analysis of geospatial data
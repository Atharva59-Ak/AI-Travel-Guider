import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sun, Cloud, CloudRain, CloudSnow, CloudLightning, 
  Droplets, Wind, Thermometer, Calendar, 
  Loader2, AlertCircle, RotateCcw 
} from "lucide-react";
import { cardHover } from "@/react-app/utils/animations";

interface WeatherCondition {
  id: number;
  name: string;
  icon: string;
  description: string;
}

interface WeatherData {
  current: {
    temp: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    feelsLike: number;
  };
  forecast: {
    date: string;
    day: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
  }[];
  bestTimeToVisit: {
    months: string[];
    summary: string;
    tips: string[];
    avoid: string[];
  };
}

interface WeatherCardProps {
  cityName: string;
}

const weatherConditions: Record<string, WeatherCondition> = {
  sunny: {
    id: 1,
    name: "Sunny",
    icon: "☀️",
    description: "Clear skies with bright sunshine"
  },
  cloudy: {
    id: 2,
    name: "Cloudy",
    icon: "☁️",
    description: "Mostly cloudy with some sunshine"
  },
  rainy: {
    id: 3,
    name: "Rainy",
    icon: "🌧️",
    description: "Rain showers expected"
  },
  snowy: {
    id: 4,
    name: "Snowy",
    icon: "❄️",
    description: "Snowfall expected"
  },
  stormy: {
    id: 5,
    name: "Stormy",
    icon: "⛈️",
    description: "Thunderstorms expected"
  }
};

const getWeatherIcon = (condition: string) => {
  switch (condition.toLowerCase()) {
    case 'sunny':
      return <Sun className="w-8 h-8 text-yellow-500" />;
    case 'cloudy':
      return <Cloud className="w-8 h-8 text-gray-400" />;
    case 'rainy':
      return <CloudRain className="w-8 h-8 text-blue-500" />;
    case 'snowy':
      return <CloudSnow className="w-8 h-8 text-blue-200" />;
    case 'stormy':
      return <CloudLightning className="w-8 h-8 text-purple-500" />;
    default:
      return <Sun className="w-8 h-8 text-yellow-500" />;
  }
};

const getBestTimeToVisit = (cityName: string): WeatherData['bestTimeToVisit'] => {
  // AI-generated best time to visit information based on the city
  const cityData: Record<string, WeatherData['bestTimeToVisit']> = {
    delhi: {
      months: ["October", "November", "February", "March"],
      summary: "The best time to visit Delhi is from October to March when the weather is pleasant with cool temperatures and low humidity.",
      tips: [
        "Visit during winter months for comfortable sightseeing",
        "Carry light woolens as nights can be cold",
        "Avoid summer months (April-June) due to extreme heat",
        "Winter months offer clear skies and perfect weather for exploring"
      ],
      avoid: [
        "Summer months (April-June) with temperatures up to 45°C",
        "Peak summer when air quality deteriorates",
        "Monsoon season (July-September) for outdoor activities"
      ]
    },
    mumbai: {
      months: ["November", "December", "January", "February"],
      summary: "The best time to visit Mumbai is from November to February when the weather is pleasant and humidity is low.",
      tips: [
        "Winter months offer perfect weather for beach activities",
        "Clear skies and cool temperatures ideal for sightseeing",
        "Festivals like Diwali and Christmas add to the experience",
        "Humidity levels are comfortable during these months"
      ],
      avoid: [
        "Monsoon season (June-September) with heavy rainfall",
        "Summer months (March-May) with high humidity",
        "Peak monsoon when flooding can occur in low-lying areas"
      ]
    },
    bangalore: {
      months: ["October", "November", "December", "January", "February", "March"],
      summary: "Bangalore enjoys a pleasant climate year-round, but the best time is from October to March.",
      tips: [
        "Weather is consistently pleasant with moderate temperatures",
        "Ideal for tech tours and garden visits",
        "Cool evenings perfect for outdoor dining",
        "Monsoon months offer lush greenery and relief from heat"
      ],
      avoid: [
        "Peak summer months can be uncomfortably hot",
        "Monsoon season might affect outdoor tech campus visits",
        "Humidity can be high during rainy season"
      ]
    },
    chennai: {
      months: ["November", "December", "January", "February"],
      summary: "The best time to visit Chennai is from November to February when temperatures are moderate and humidity is lower.",
      tips: [
        "Winter months offer comfortable weather for temple visits",
        "Beach activities are best during cooler months",
        "Cultural festivals are more enjoyable in pleasant weather",
        "Avoid direct sunlight during peak summer"
      ],
      avoid: [
        "Summer months (April-June) with extreme heat",
        "Monsoon season (June-October) with high humidity",
        "Coastal humidity can be oppressive during summers"
      ]
    },
    kolkata: {
      months: ["October", "November", "December", "January", "February"],
      summary: "The best time to visit Kolkata is from October to March when the weather is cool and dry.",
      tips: [
        "Winter months are perfect for exploring the city",
        "Durga Puja and other festivals are best experienced in pleasant weather",
        "Ideal conditions for river activities and cultural tours",
        "Clear skies offer great photography opportunities"
      ],
      avoid: [
        "Summer months with high temperatures and humidity",
        "Monsoon season with heavy rainfall",
        "Peak summer can be very uncomfortable for sightseeing"
      ]
    }
  };

  const lowerCityName = cityName.toLowerCase();
  return cityData[lowerCityName] || {
    months: ["October", "November", "December", "January", "February"],
    summary: `The best time to visit ${cityName} is from October to February when the weather is pleasant and ideal for travel.`,
    tips: [
      `Check local weather conditions before planning your trip to ${cityName}`,
      `Winter months typically offer the best weather for sightseeing`,
      `Consider seasonal festivals and events when planning your visit`,
      `Book accommodations in advance during peak season`
    ],
    avoid: [
      "Peak summer months with extreme temperatures",
      "Monsoon season if you prefer dry weather",
      "Crowded tourist seasons if you prefer quieter visits"
    ]
  };
};

export default function WeatherCard({ cityName }: WeatherCardProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Static sample weather data for major Indian cities
  const getStaticWeatherData = (city: string): WeatherData => {
    const cityWeatherData: Record<string, WeatherData> = {
      mumbai: {
        current: {
          temp: 32,
          condition: "Cloudy",
          humidity: 78,
          windSpeed: 15,
          feelsLike: 36
        },
        forecast: [
          { date: "Dec 27", day: "Fri", high: 33, low: 24, condition: "Partly Cloudy", icon: "cloudy" },
          { date: "Dec 28", day: "Sat", high: 32, low: 23, condition: "Sunny", icon: "sunny" },
          { date: "Dec 29", day: "Sun", high: 31, low: 24, condition: "Cloudy", icon: "cloudy" },
          { date: "Dec 30", day: "Mon", high: 30, low: 23, condition: "Rainy", icon: "rainy" },
          { date: "Dec 31", day: "Tue", high: 31, low: 24, condition: "Partly Cloudy", icon: "cloudy" }
        ],
        bestTimeToVisit: {
          months: ["November", "December", "January", "February"],
          summary: "The best time to visit Mumbai is from November to February when the weather is cool and pleasant with lower humidity.",
          tips: [
            "Winter season offers the most comfortable weather for exploring",
            "Book hotels in advance during peak tourist season and holidays",
            "Try local street food at Chowpatty Beach during evening hours",
            "Visit Gateway of India early morning to avoid crowds"
          ],
          avoid: [
            "Monsoon season (June-September) with heavy rainfall",
            "Peak summer months (March-May) with high humidity",
            "Crowded local trains during rush hours"
          ]
        }
      },
      delhi: {
        current: {
          temp: 18,
          condition: "Sunny",
          humidity: 45,
          windSpeed: 8,
          feelsLike: 16
        },
        forecast: [
          { date: "Dec 27", day: "Fri", high: 20, low: 8, condition: "Sunny", icon: "sunny" },
          { date: "Dec 28", day: "Sat", high: 21, low: 9, condition: "Partly Cloudy", icon: "cloudy" },
          { date: "Dec 29", day: "Sun", high: 19, low: 7, condition: "Cloudy", icon: "cloudy" },
          { date: "Dec 30", day: "Mon", high: 20, low: 8, condition: "Sunny", icon: "sunny" },
          { date: "Dec 31", day: "Tue", high: 22, low: 10, condition: "Sunny", icon: "sunny" }
        ],
        bestTimeToVisit: getBestTimeToVisit("Delhi")
      },
      bengaluru: {
        current: {
          temp: 24,
          condition: "Partly Cloudy",
          humidity: 65,
          windSpeed: 12,
          feelsLike: 26
        },
        forecast: [
          { date: "Dec 27", day: "Fri", high: 26, low: 16, condition: "Partly Cloudy", icon: "cloudy" },
          { date: "Dec 28", day: "Sat", high: 27, low: 17, condition: "Sunny", icon: "sunny" },
          { date: "Dec 29", day: "Sun", high: 25, low: 16, condition: "Cloudy", icon: "cloudy" },
          { date: "Dec 30", day: "Mon", high: 26, low: 17, condition: "Partly Cloudy", icon: "cloudy" },
          { date: "Dec 31", day: "Tue", high: 27, low: 16, condition: "Sunny", icon: "sunny" }
        ],
        bestTimeToVisit: getBestTimeToVisit("Bangalore")
      },
      chennai: {
        current: {
          temp: 29,
          condition: "Partly Cloudy",
          humidity: 75,
          windSpeed: 18,
          feelsLike: 33
        },
        forecast: [
          { date: "Dec 27", day: "Fri", high: 30, low: 23, condition: "Partly Cloudy", icon: "cloudy" },
          { date: "Dec 28", day: "Sat", high: 31, low: 24, condition: "Sunny", icon: "sunny" },
          { date: "Dec 29", day: "Sun", high: 29, low: 23, condition: "Cloudy", icon: "cloudy" },
          { date: "Dec 30", day: "Mon", high: 30, low: 24, condition: "Partly Cloudy", icon: "cloudy" },
          { date: "Dec 31", day: "Tue", high: 31, low: 23, condition: "Sunny", icon: "sunny" }
        ],
        bestTimeToVisit: getBestTimeToVisit("Chennai")
      },
      kolkata: {
        current: {
          temp: 26,
          condition: "Cloudy",
          humidity: 68,
          windSpeed: 10,
          feelsLike: 28
        },
        forecast: [
          { date: "Dec 27", day: "Fri", high: 27, low: 18, condition: "Partly Cloudy", icon: "cloudy" },
          { date: "Dec 28", day: "Sat", high: 28, low: 19, condition: "Sunny", icon: "sunny" },
          { date: "Dec 29", day: "Sun", high: 26, low: 17, condition: "Cloudy", icon: "cloudy" },
          { date: "Dec 30", day: "Mon", high: 27, low: 18, condition: "Partly Cloudy", icon: "cloudy" },
          { date: "Dec 31", day: "Tue", high: 28, low: 19, condition: "Sunny", icon: "sunny" }
        ],
        bestTimeToVisit: getBestTimeToVisit("Kolkata")
      },
      hyderabad: {
        current: {
          temp: 27,
          condition: "Sunny",
          humidity: 55,
          windSpeed: 14,
          feelsLike: 29
        },
        forecast: [
          { date: "Dec 27", day: "Fri", high: 29, low: 18, condition: "Sunny", icon: "sunny" },
          { date: "Dec 28", day: "Sat", high: 30, low: 19, condition: "Sunny", icon: "sunny" },
          { date: "Dec 29", day: "Sun", high: 28, low: 17, condition: "Partly Cloudy", icon: "cloudy" },
          { date: "Dec 30", day: "Mon", high: 29, low: 18, condition: "Sunny", icon: "sunny" },
          { date: "Dec 31", day: "Tue", high: 30, low: 19, condition: "Sunny", icon: "sunny" }
        ],
        bestTimeToVisit: getBestTimeToVisit("Hyderabad")
      }
    };

    // Return data for the requested city or default to Mumbai
    return cityWeatherData[city.toLowerCase()] || cityWeatherData["mumbai"];
  };

  // Use static data instead of API call
  useEffect(() => {
    const loadWeatherData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulate a small delay for realistic loading
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const staticData = getStaticWeatherData(cityName);
        setWeatherData(staticData);
      } catch (err) {
        setError('Failed to load weather data. Please try again.');
        console.error('Weather fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadWeatherData();
  }, [cityName]);

  const refreshWeather = () => {
    const fetchWeatherData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/weather?city=${encodeURIComponent(cityName)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }
        
        const data = await response.json();
        
        // Transform the API data to match our component structure
        const transformedData: WeatherData = {
          current: {
            temp: data.current.temp,
            condition: data.current.condition,
            humidity: data.current.humidity,
            windSpeed: data.current.windSpeed,
            feelsLike: data.current.feelsLike
          },
          forecast: data.forecast.map((day: any, i: number) => {
            const date = new Date(day.date);
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            
            return {
              date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              day: days[date.getDay()],
              high: day.high,
              low: day.low,
              condition: day.condition,
              icon: day.condition
            };
          }),
          bestTimeToVisit: data.bestTimeToVisit
        };
        
        setWeatherData(transformedData);
      } catch (err) {
        setError('Failed to refresh weather data.');
        console.error('Weather refresh error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900">Weather & Best Time to Visit</h3>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse" />
            </div>
          </div>
          
          {/* Loading skeleton for current weather */}
          <div className="flex items-center justify-between mb-8 p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-200 rounded-full animate-pulse" />
              <div>
                <div className="w-24 h-6 bg-slate-200 rounded mb-2 animate-pulse" />
                <div className="w-32 h-4 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="text-right">
              <div className="w-16 h-8 bg-slate-200 rounded mb-2 animate-pulse" />
              <div className="w-20 h-4 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
          
          {/* Loading skeleton for forecast */}
          <div className="mb-8">
            <div className="flex justify-between gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex-1 text-center p-3 bg-slate-50 rounded-lg">
                  <div className="w-8 h-8 bg-slate-200 rounded-full mx-auto mb-2 animate-pulse" />
                  <div className="w-12 h-4 bg-slate-200 rounded mx-auto mb-1 animate-pulse" />
                  <div className="w-16 h-3 bg-slate-200 rounded mx-auto animate-pulse" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Loading skeleton for best time */}
          <div className="space-y-4">
            <div className="w-32 h-5 bg-slate-200 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="w-full h-4 bg-slate-200 rounded animate-pulse" />
              <div className="w-5/6 h-4 bg-slate-200 rounded animate-pulse" />
              <div className="w-4/6 h-4 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900">Weather & Best Time to Visit</h3>
            <button
              onClick={refreshWeather}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RotateCcw className="w-5 h-5 text-slate-600" />
            </button>
          </div>
          
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">{error}</p>
            <button
              onClick={refreshWeather}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!weatherData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover="hover"
      variants={cardHover}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-slate-900">Weather & Best Time to Visit</h3>
          <button
            onClick={refreshWeather}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RotateCcw className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Current Weather */}
        <div className="flex items-center justify-between mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
          <div className="flex items-center gap-4">
            {getWeatherIcon(weatherData.current.condition)}
            <div>
              <div className="text-3xl font-bold text-slate-900">
                {weatherData.current.temp}°C
              </div>
              <div className="text-slate-600 capitalize">
                {weatherData.current.condition} • Feels like {weatherData.current.feelsLike}°C
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-slate-900 font-medium">
              {cityName}
            </div>
            <div className="text-sm text-slate-600">
              Today
            </div>
          </div>
        </div>

        {/* Weather Details */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <Droplets className="w-5 h-5 text-blue-500" />
            <div>
              <div className="text-xs text-slate-500">Humidity</div>
              <div className="font-medium text-slate-900">{weatherData.current.humidity}%</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <Wind className="w-5 h-5 text-green-500" />
            <div>
              <div className="text-xs text-slate-500">Wind</div>
              <div className="font-medium text-slate-900">{weatherData.current.windSpeed} km/h</div>
            </div>
          </div>
        </div>

        {/* 5-Day Forecast */}
        <div className="mb-8">
          <h4 className="font-medium text-slate-900 mb-4">5-Day Forecast</h4>
          <div className="flex justify-between gap-2">
            {weatherData.forecast.map((day, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex-1 text-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="text-sm font-medium text-slate-900">{day.day}</div>
                <div className="text-xs text-slate-500 mb-2">{day.date}</div>
                <div className="mx-auto mb-2">
                  {getWeatherIcon(day.condition)}
                </div>
                <div className="flex justify-center gap-2 text-sm">
                  <span className="font-medium text-slate-900">{day.high}°</span>
                  <span className="text-slate-500">{day.low}°</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Best Time to Visit */}
        <div>
          <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Best Time to Visit
          </h4>
          
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 mb-3">
              {weatherData.bestTimeToVisit.months.map((month, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                >
                  {month}
                </span>
              ))}
            </div>
            <p className="text-slate-700 leading-relaxed">
              {weatherData.bestTimeToVisit.summary}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h5 className="font-medium text-slate-900 mb-2">Travel Tips</h5>
              <ul className="space-y-2">
                {weatherData.bestTimeToVisit.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-slate-700">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-medium text-slate-900 mb-2">What to Avoid</h5>
              <ul className="space-y-2">
                {weatherData.bestTimeToVisit.avoid.map((avoid, index) => (
                  <li key={index} className="flex items-start gap-2 text-slate-700">
                    <span className="text-red-500 mt-1">•</span>
                    <span>{avoid}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
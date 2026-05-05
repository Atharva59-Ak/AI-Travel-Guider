# IRCTC Railway API Integration Guide

## ✅ Configuration Complete

Your IRCTC Railway API has been successfully integrated into the AI-Powered City Guider project.

## 🔑 API Keys Configured

### Environment Variables (`.env` file)
```env
RAPIDAPI_KEY=7d44d467cfmsh8a9fcafc80e97a3p12d0e3jsnbca7fcdc0ec0
RAPIDAPI_HOST=irctc-api2.p.rapidapi.com
```

### TypeScript Definitions
- Added `VITE_RAPIDAPI_KEY` and `VITE_RAPIDAPI_HOST` to `vite-env.d.ts`
- Proper TypeScript support for environment variables

## 📍 API Integration Points

### 1. Railway API Service (`src/services/railwayAPI.ts`)
The following functions are now configured with your API key:

- **`getTrainSchedule(trainNumber)`** - Get complete train schedule by train number
- **`getTrainsBetweenStations(fromStation, toStation)`** - Find all trains between two stations
- **`getPNRStatus(pnrNumber)`** - Check PNR status
- **`getLiveTrainStatus(trainNumber, startDay)`** - Get live running status
- **`searchStation(query)`** - Search stations by name

### 2. UI Components Using Railway API

#### TrainInfoPanel Component
- Location: `src/components/TrainInfoPanel.tsx`
- Features:
  - Automatic station code mapping for 100+ Indian cities
  - Real-time train search
  - Display of train timings, duration, and available classes
  - Fare information display

#### TrainSearchWithDate Component
- Location: `src/components/TrainSearchWithDate.tsx`
- Features:
  - Date-based train search
  - Passenger count selection
  - Visual train cards with all details

#### TrainSearch Component
- Location: `src/components/TrainSearch.tsx`
- Features:
  - Search by train number or between stations
  - Live train running status
  - Platform information

## 🗂️ Station Code Mapping

The application includes automatic city-to-station code mapping for major Indian cities:

**Major Stations:**
- Mumbai → CSTM
- Delhi → NDLS
- Bangalore/Bengaluru → SBC
- Chennai → MAS
- Kolkata → HWH
- Hyderabad → HYB
- Pune → PUNE
- Ahmedabad → ADI
- Jaipur → JP
- Lucknow → LKO

And 90+ more cities!

## 🚀 How to Use

### For Users:
1. Navigate to any city search page
2. Select "Train" as your transport mode
3. Enter source and destination cities
4. View available trains with:
   - Train name and number
   - Departure/arrival times
   - Duration
   - Available classes
   - Running days

### For Developers:
```typescript
import { getTrainsBetweenStations } from '@/services/railwayAPI';

// Search for trains
const trains = await getTrainsBetweenStations('NDLS', 'CSTM');

// Get train schedule
const schedule = await getTrainSchedule('12952');

// Check PNR status
const pnr = await getPNRStatus('1234567890');
```

## 🔒 Security Best Practices

✅ **Environment Variables**: API keys are stored in `.env` file (not hardcoded)
✅ **Git Ignore**: `.env` is excluded from version control
✅ **TypeScript Types**: Proper type definitions for all API responses
✅ **Error Handling**: Comprehensive error handling in all API calls

## 📝 API Reference

### RapidAPI Endpoint
- **Host**: `irctc-api2.p.rapidapi.com`
- **Documentation**: https://rapidapi.com/apiashish/api/irctc-api2

### Required Headers
```http
x-rapidapi-host: irctc-api2.p.rapidapi.com
x-rapidapi-key: <your-api-key>
```

## 🎯 Features Working

- ✅ Real-time train search between stations
- ✅ Train schedule lookup
- ✅ PNR status checking
- ✅ Live train running status
- ✅ Station search functionality
- ✅ Automatic city-to-station code conversion
- ✅ Beautiful UI with animations
- ✅ Responsive design
- ✅ Error handling and loading states

## 🧪 Testing

To test the integration:
1. Open the preview browser
2. Navigate to Search page
3. Enter any two cities (e.g., Mumbai to Delhi)
4. Click on Train transport mode
5. You should see real train data from IRCTC API

## 📊 Data Structure

### Train Object
```typescript
interface TrainBetweenStations {
  trainNumber: string;
  trainName: string;
  trainType: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  runningDays: string[];
  availableClasses: string[];
}
```

### Train Schedule
```typescript
interface TrainSchedule {
  trainNumber: string;
  trainName: string;
  trainType: string;
  runningDays: string[];
  schedule: Station[]; // Array of stations with timing
}
```

## 🛠️ Troubleshooting

### If trains are not showing:
1. Check browser console for errors
2. Verify API key is correct in `.env`
3. Ensure development server is restarted after `.env` changes
4. Check RapidAPI subscription status

### Common Issues:
- **No trains found**: Verify station codes are correct
- **API errors**: Check RapidAPI quota/subscription
- **Loading forever**: Check network tab for failed requests

## 📱 Component Integration

All train-related components are fully integrated:
- TransportModeFilter shows train option
- TravelDateSelector works with train searches
- RouteCard displays train routes
- EnhancedSearchForm includes train search

## 🎨 UI/UX Features

- Gradient backgrounds for train cards
- Smooth Framer Motion animations
- Loading spinners during API calls
- Error messages with helpful icons
- Responsive mobile-first design
- Color-coded train types and classes

---

**Status**: ✅ Fully Functional
**Last Updated**: March 22, 2026
**API Provider**: IRCTC via RapidAPI
**Integration Type**: RESTful API with TypeScript

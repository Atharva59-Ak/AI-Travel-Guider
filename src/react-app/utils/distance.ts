// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

// Filter places within a given radius from a center point
export const filterPlacesByRadius = (
  places: any[],
  center: { lat: number; lng: number },
  radius: number
): any[] => {
  return places.filter(place => {
    const distance = calculateDistance(
      center.lat,
      center.lng,
      place.latitude || place.lat,
      place.longitude || place.lng
    );
    return distance <= radius;
  }).map(place => ({
    ...place,
    distance: calculateDistance(
      center.lat,
      center.lng,
      place.latitude || place.lat,
      place.longitude || place.lng
    )
  })).sort((a, b) => a.distance - b.distance); // Sort by distance
};
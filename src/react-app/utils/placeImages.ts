const CITY_FALLBACKS: Record<string, string> = {
  mumbai: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&h=800&fit=crop",
  delhi: "https://images.unsplash.com/photo-1587135941948-670b381f08ce?w=1200&h=800&fit=crop",
  bengaluru: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&h=800&fit=crop",
  bangalore: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&h=800&fit=crop",
  pune: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&h=800&fit=crop",
  chennai: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&h=800&fit=crop",
  hyderabad: "https://images.unsplash.com/photo-1585234388634-5300a8c936a8?w=1200&h=800&fit=crop",
  kolkata: "https://images.unsplash.com/photo-1587135941948-670b381f08ce?w=1200&h=800&fit=crop",
  ahmedabad: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=1200&h=800&fit=crop",
  jaipur: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&h=800&fit=crop",
  agra: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=1200&h=800&fit=crop",
  varanasi: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=800&fit=crop",
  goa: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&h=800&fit=crop",
};

const normalize = (value: string) => value.trim().toLowerCase();

export const getCityFallbackImage = (city: string): string => {
  const key = normalize(city);
  return (
    CITY_FALLBACKS[key] ??
    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&h=800&fit=crop"
  );
};

export const getSearchImage = (name: string, city: string, extra = "india travel landmark"): string => {
  const query = encodeURIComponent(`${name} ${city} ${extra}`);
  return `https://source.unsplash.com/1200x800/?${query}`;
};

export const getImageCandidates = (
  name: string,
  city: string,
  primary?: string,
  extra = "india travel landmark"
): string[] => {
  const candidates = [
    primary?.trim(),
    getSearchImage(name, city, extra),
    getSearchImage(city, city, "india skyline"),
    getCityFallbackImage(city),
  ].filter((url): url is string => Boolean(url));

  return Array.from(new Set(candidates));
};

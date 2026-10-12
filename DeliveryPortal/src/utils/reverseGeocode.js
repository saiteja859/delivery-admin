/**
 * Precise Reverse Geocoding Utility
 * Converts (latitude, longitude) coordinates into rich, human-readable address breakdown:
 * - Street / Door / Road name
 * - Area / Locality / Suburb
 * - City / Town / District
 * - State
 * - Pincode / Postal Code
 * - Country
 * - Complete Formatted Address Line
 */

export async function reverseGeocode(latitude, longitude) {
  if (
    latitude === undefined ||
    latitude === null ||
    longitude === undefined ||
    longitude === null
  ) {
    return null;
  }

  const lat = Number(latitude);
  const lon = Number(longitude);

  if (isNaN(lat) || isNaN(lon)) {
    return null;
  }

  try {
    // Primary Provider: OpenStreetMap Nominatim (High accuracy reverse geocoding)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "en-US,en;q=0.9",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data && data.address) {
        const addr = data.address;

        const street =
          addr.road ||
          addr.street ||
          addr.pedestrian ||
          addr.footway ||
          addr.path ||
          addr.house_number ||
          addr.building ||
          "";

        const area =
          addr.suburb ||
          addr.neighbourhood ||
          addr.residential ||
          addr.quarter ||
          addr.commercial ||
          addr.industrial ||
          addr.village ||
          "";

        const city =
          addr.city ||
          addr.town ||
          addr.municipality ||
          addr.city_district ||
          "";

        const district =
          addr.county ||
          addr.state_district ||
          "";

        const state = addr.state || "";
        const pincode = addr.postcode || "";
        const country = addr.country || "";

        const formattedParts = [street, area, city, state, pincode].filter(Boolean);
        const formattedAddress = data.display_name || formattedParts.join(", ");

        return {
          latitude: lat,
          longitude: lon,
          street,
          area,
          city,
          district,
          state,
          pincode,
          country,
          formattedAddress,
        };
      }
    }
  } catch (err) {
    console.warn("Nominatim reverse geocode attempt failed, switching to fallback:", err);
  }

  try {
    // Secondary Fallback Provider: BigDataCloud Reverse Geocode API
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );

    if (response.ok) {
      const data = await response.json();
      if (data) {
        const street =
          data.localityInfo?.informative?.find(
            (i) => i.description === "road" || i.type === "street"
          )?.name || "";

        const area =
          data.locality ||
          data.localityInfo?.administrative?.find(
            (i) => i.order === 4 || i.order === 5
          )?.name ||
          "";

        const city =
          data.city ||
          data.localityInfo?.administrative?.find((i) => i.order === 3)?.name ||
          "";

        const state = data.principalSubdivision || "";
        const pincode = data.postcode || "";

        const formattedAddress = [street, area, city, state, pincode]
          .filter(Boolean)
          .join(", ");

        return {
          latitude: lat,
          longitude: lon,
          street,
          area,
          city,
          district: "",
          state,
          pincode,
          country: data.countryName || "",
          formattedAddress:
            formattedAddress || `Latitude ${lat.toFixed(4)}, Longitude ${lon.toFixed(4)}`,
        };
      }
    }
  } catch (err) {
    console.warn("Fallback reverse geocode error:", err);
  }

  return {
    latitude: lat,
    longitude: lon,
    street: "",
    area: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
    country: "",
    formattedAddress: `Lat: ${lat.toFixed(6)}, Lon: ${lon.toFixed(6)}`,
  };
}

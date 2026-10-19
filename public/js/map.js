mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
  container: "map",
  center: listing.geometry.coordinates,
  zoom: 12,
});

// Create the popup
const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
  `<h5>${listing.location}</h5>
     <p>Exact location will be provided after booking.</p>`,
);

// Create the marker and attach the popup
const marker = new mapboxgl.Marker({ color: "red" })
  .setLngLat(listing.geometry.coordinates)
  .setPopup(popup)
  .addTo(map);

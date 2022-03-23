mapboxgl.accessToken = 'pk.eyJ1IjoicGhvZW5peC0wNzMiLCJhIjoiY2twMWhtMTQ2MHprODJvbXJmNGR2cXM1NyJ9.cljH7mGnoy7-nOeYyXtr7A';

navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
  enableHighAccuracy: true
})

function successLocation(position) {
  setupMap([position.coords.longitude, position.coords.latitude])
}

function errorLocation() {
  setupMap([78.5971993,21.9488679])
}

function setupMap(center) {
  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: center,
    zoom: 15
  })

  const nav = new mapboxgl.NavigationControl()
  map.addControl(nav)

  var directions = new MapboxDirections({
    accessToken: mapboxgl.accessToken
  })

  map.addControl(directions, "top-left")
}

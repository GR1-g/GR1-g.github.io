import React from 'react';
import Map from './node_modules/react-map-gl/dist/es5/exports-maplibre';
import { getWeather } from './weather';

export function MapDraw(): React.JSX.Element {

    const [viewport, setViewport] = React.useState({
        longitude: -100,
        latitude: 40,
        zoom: 3.5
    });

    React.useEffect(() => {
        navigator.geolocation.getCurrentPosition((pos) => {
            setViewport({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                zoom: 3.5,
            });
        });
    }, [viewport]);

    return (
        <div>
            <Map
                mapboxAccessToken="<Mapbox access token>"
                initialViewState={{
                    longitude: 22.4, // -122.4,
                    latitude: 0, // 37.8,
                    zoom: 1, // 14
                }}
                style={{ width: 600, height: 565 }}
                onMouseDown={p => `${getWeather(p.lngLat.lat, p.lngLat.lng)}`
                }
                onMove={evt => setViewport(evt.viewState)}
                mapStyle="https://api.maptiler.com/maps/streets/style.json?key=NyRS6pvTven96lCtfhqi"
            >
            </Map>
        </div >
    );
}

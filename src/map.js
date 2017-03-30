export function createPlacemark(coords, params) {
    return new ymaps.Placemark(coords, params);
}

export function getProvider(friend) {
    return {
        provider: {
            geocode: function(request) {
                return ymaps.geocode(request)
                    .then(response => {
                        response.friend = friend;
                        return response;
                    });
            }
        }
    }
}

export function getAllPlacemark() {
    return JSON.parse(localStorage.getItem('placemarks')) || [];
}
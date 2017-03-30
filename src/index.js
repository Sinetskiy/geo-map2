import { createPlacemark, getProvider, getAllPlacemark } from './map';
import model from './model';
var friendBalloon = require('../friend-balloon.hbs');
var formFeedback = require('../form-feedback.hbs');

require('./map.css');
require('./friend.css');

var map;
var clusterer;
var popup = document.getElementById('popup'),
    headerText = document.getElementById('header-text'),
    addButton = document.getElementById('addButton');

new Promise(resolve => ymaps.ready(resolve))
    .then(() => model.login(5267932, 2))
    .then(() => {
        map = new ymaps.Map('map', {
            center: [55.751574, 37.573856],
            zoom: 9
        });

        map.events.add('click', function(e) {

            e.preventDefault();
            var coords = e.get('coords');
            var clientPixels = e.get('clientPixels');
            popup.style.left = clientPixels[0] + 'px';
            popup.style.top = clientPixels[1] + 'px';
            debugger;
            ymaps.geocode(coords, { kind: 'street' }).then(function(res) {
                var nearestStreet = res.geoObjects.get(0);
                headerText.innerText = `${nearestStreet.properties.get('description')}, ${nearestStreet.properties.get('name')}`;
                popup.style.display = 'block';
                debugger;
            });
        });

        document.getElementById('hider').onclick = function() {
            document.getElementById('popup').style.display = 'none';
        }

        clusterer = new ymaps.Clusterer({

            preset: 'islands#invertedVioletClusterIcons',

            groupByCoordinates: false,

            clusterDisableClickZoom: true,
            clusterHideIconOnBalloonOpen: false,
            geoObjectHideIconOnBalloonOpen: false
        });

        clusterer.options.set({
            gridSize: 80,
            clusterDisableClickZoom: true
        });
        map.geoObjects.add(clusterer);

        return getAllPlacemark();
    })
    .then(placemarks => {
        var promises = placemarks
            .filter(friend => friend.coords)
            .map(friend => {

                return ymaps.geocode(friend.coords);
            });

        return Promise.all(promises);
    })
    .then(geoResponse => {
        geoResponse
            .filter(response => {
                var geoObject = response.geoObjects.get(0);

                return geoObject && geoObject.geometry;
            })
            .forEach(response => {
                var geoObject = response.geoObjects.get(0);
                var coords = geoObject.geometry.getCoordinates();
                var placemark = createPlacemark(coords, {
                    balloonContent: formFeedback(response.friend)
                });

                clusterer.add(placemark);
            });
    });


/*

    ymaps.ready(function() {
    var mapCenter = [55.755381, 37.619044],
        map = new ymaps.Map('map', {
            center: mapCenter,
            zoom: 9,
            controls: []
        }),
        coords,
        placemarks = [],
        points = JSON.parse(localStorage.getItem('placemarks')) || [],
        feedbackWrap = document.getElementById('feedback-wrap'),
        popup = document.getElementById('popup'),
        addButton = document.getElementById('addButton'),
        headerText = document.getElementById('header-text'),
        link = document.getElementById('map');

    // Создаем собственный макет с информацией о выбранном геообъекте.
    var customItemContentLayout = ymaps.templateLayoutFactory.createClass(
        // Флаг "raw" означает, что данные вставляют "как есть" без экранирования html.
        '<h2 class=ballon_header>{{ properties.balloonContentHeader|raw }}</h2>' +
        '<div class=ballon_body>{{ properties.balloonContentBody|raw }}</div>' +
        '<div class=ballon_footer>{{ properties.balloonContentFooter|raw }}</div>'
    );

    var clusterer = new ymaps.Clusterer({
        clusterDisableClickZoom: true,
        clusterOpenBalloonOnClick: true,
        // Устанавливаем стандартный макет балуна кластера "Карусель".
        clusterBalloonContentLayout: 'cluster#balloonCarousel',
        // Устанавливаем собственный макет.
        clusterBalloonItemContentLayout: customItemContentLayout,
        // Устанавливаем режим открытия балуна. 
        // В данном примере балун никогда не будет открываться в режиме панели.
        clusterBalloonPanelMaxMapArea: 0,
        // Устанавливаем размеры макета контента балуна (в пикселях).
        clusterBalloonContentLayoutWidth: 200,
        clusterBalloonContentLayoutHeight: 130,
        // Устанавливаем максимальное количество элементов в нижней панели на одной странице
        clusterBalloonPagerSize: 5

    });

    map.events.add('click', function(e) {
        //  if (!map.balloon.isOpen()) {
        debugger;
        e.preventDefault();
        coords = e.get('coords');
        clientPixels = e.get('clientPixels');
        popup.style.left = clientPixels[0] + 'px';
        popup.style.top = clientPixels[1] + 'px';
        ymaps.geocode(coords, { kind: 'street' }).then(function(res) {
            var nearestStreet = res.geoObjects.get(0);
            headerText.innerText = `${nearestStreet.properties.get('description')}, ${nearestStreet.properties.get('name')}`;
            popup.style.display = 'block';
        });
        // } else {
        //     map.balloon.close();
        // }
    });

    addButton.addEventListener('click', function(e) {
        if (!coords) {
            return;
        }
        point = {
            coords: coords,
            userName: document.getElementById('feedback-name').value,
            place: document.getElementById('feedback-place').value,
            streatName: headerText.innerText,
            feedback: document.getElementById('feedback-textarea').value,
            date: (new Date()).toLocaleString("ru")
        }
        points.push(point);

        localStorage.setItem('placemarks', JSON.stringify(points));

        addPointToMap(point);

    });

    link.addEventListener('click', function(e) {
        var coords = e.target.dataset.coords;
        if (!coords) {
            return;
        }
        map.balloon.close();
        coords = coords.split(';');
        var feedbacks = getPointsByCoord(coords);
        debugger;

        feedbackWrap.innerHTML = createFeedbacks(feedbacks);
        popup.style.left = e.pageX + 'px';
        popup.style.top = e.pageY + 'px';
        headerText.innerText = feedbacks[0].streatName;
        popup.style.display = 'block';

    });

    function getPointsByCoord(coords) {
        return points.filter(v => v.coords[0] == coords[0] && v.coords[1] == coords[1]);
    }

    function addPointToMap(point) {
        var placemark = new ymaps.Placemark(point.coords, {
            balloonContentHeader: point.place,
            balloonContentBody: `<p><a href="#" data-coords="${point.coords[0]};${point.coords[1]}" >${point.streatName}</a></p> 
                                 <p>${point.feedback}</p>`,
            balloonContentFooter: point.date
        });
        placemarks.push(placemark);
        clusterer.add(placemarks);
        map.geoObjects.add(clusterer);
    }

    function createFeedbacks(feedbacks) {
        var templateFn = require('../feedbacks-template.hbs');
        debugger;
        return templateFn({
            feedbacks: feedbacks
        });
    }

    document.getElementById('hider').onclick = function() {
        document.getElementById('popup').style.display = 'none';
    }

    if (points.length > 0) {
        for (let point of points) {
            addPointToMap(point);
        }
    }

});

*/
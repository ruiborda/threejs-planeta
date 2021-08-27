import * as THREE from './snowpack/pkg/three.js'
import {OrbitControls} from "./snowpack/pkg/three/examples/jsm/controls/OrbitControls.js"
import {earth as tierra} from "./objects/earth.js";
import {markPosition} from "./objects/markPosition.js";

//sweetalert2 para ventana flotante o venta modal
import Swal from "./snowpack/pkg/sweetalert2.js";
//exportar css para sweetalet2
import './snowpack/pkg/sweetalert2/dist/sweetalert2.min.css.proxy.js';

//importar fondo negro
const starsTextureIMG = './stars.jpg'

const starsTexture = new THREE.TextureLoader().load(starsTextureIMG)

    //Raycasting se usa para seleccionar con el mouse (determinar qué objetos en el espacio 3D está sobre el mouse) entre otras cosas.
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const position = new THREE.Spherical();
//DOM
const setPosition = document.getElementById('setPosition')
window.addEventListener('auxclick', onMouseMove, false);

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(scene.children);

    for (let i = 0; i < intersects.length; i++) {
        markPosition.position.x = intersects[i].point.x
        markPosition.position.y = intersects[i].point.y
        markPosition.position.z = intersects[i].point.z
        camera.position.x = intersects[i].point.x * 2
        camera.position.y = intersects[i].point.y * 2
        camera.position.z = intersects[i].point.z * 2
        let [lat, lng] = vector3ToLatLng(intersects[i].point)
        fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}%2C+${lng}&key=b72194cb61a542cf8644a0f87f93a790`)
            .then(response => response.json())
            .then(data => Swal.fire({
                title: `
                Continente:${data.results[0].components.continent}
                Pais:${data.results[0].components.country}
                Region:${data.results[0].components.region}
                Estado:${data.results[0].components.state}
                Ciudad:${data.results[0].components.town}
                `,
                showConfirmButton: false,
                timer: 1500
            }));
        document.getElementById('lat').value = lat
        document.getElementById('lng').value = lng

    }
}

const scene = new THREE.Scene()
scene.background = starsTexture
//scene.fog = new THREE.Fog(0xfff, 0.1, 1000)
markPosition.position.z = 500
markPosition.position.x = 0
markPosition.position.y = 0
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)
tierra.rotation.y = -(Math.PI / 2)//igulaar la con la posicion de la rotacion
scene.add(tierra);
scene.add(markPosition)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 1000;
const controls = new OrbitControls(camera, renderer.domElement)
controls.minDistance = 560
controls.maxDistance = 1200
controls.listenToKeyEvents(window)
controls.screenSpacePanning = false
controls.enablePan = false

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.render(scene, camera)
});

function render() {
    renderer.render(scene, camera);
}


const animate = function () {
    window.requestAnimationFrame(animate)
    controls.update()
    render()
}
animate()

function latLngToVector3(lat, lon, radius) {
    var phi = (90 - lat) * (Math.PI / 180);
    var theta = Math.PI * (lon / 180);
    // theta = theta + (Math.PI / 2)//igulaar la con la posicion de la rotacion
    const spherical = new THREE.Spherical(radius, phi, theta);
    return new THREE.Vector3().setFromSpherical(spherical);
}

const vector3ToLatLng = (v3) => {
    const spherical = new THREE.Spherical().setFromVector3(v3);
    const lat = 180 * (0.5 - (spherical.phi / Math.PI));
    const lng = 180 * (spherical.theta / Math.PI);
    return [lat, lng]
};

function setMarkPositionFromLatLonRad(lat, lon, rad = 500) {
    const v3 = latLngToVector3(lat, lon, rad)
    markPosition.position.x = v3.x
    markPosition.position.y = v3.y
    markPosition.position.z = v3.z
    camera.position.x = v3.x * 2
    camera.position.y = v3.y * 2
    camera.position.z = v3.z * 2
}

setPosition.addEventListener('click', function () {
    setMarkPositionFromLatLonRad(document.getElementById('lat').value, document.getElementById('lng').value)
});

document.getElementById('searchCity').addEventListener('click', function () {
    fetch(`https://api.opencagedata.com/geocode/v1/geojson?q=${document.getElementById('cityName').value}&key=b72194cb61a542cf8644a0f87f93a790`)
        .then(response => response.json())
        .then(data => setMarkPositionFromLatLonRad(data.features[0].geometry.coordinates[1], data.features[0].geometry.coordinates[0]));
});
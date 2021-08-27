//importa la libreria three js
import * as THREE from 'three'
//importa la libreria orbitcontrols de threejs en la carpeta de ejemplos
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"
//importa el objeto tierra de la ruta ./objects/earth
import {earth as tierra} from "./objects/earth";
//importa el objeto markposition de la ruta ./objects/markPosition
import {markPosition} from "./objects/markPosition";

//sweetalert2 para ventana flotante o venta modal
import Swal from "sweetalert2";
//exportar css para sweetalet2
import 'sweetalert2/dist/sweetalert2.min.css';

//importar fondo negro
const starsTextureIMG = './stars.jpg'

const starsTexture = new THREE.TextureLoader().load(starsTextureIMG)

//Raycasting se usa para seleccionar con el mouse (determinar qué objetos en el espacio 3D está sobre el mouse) entre otras cosas.
const raycaster = new THREE.Raycaster();
//Se crea un modelo de vector 2D x y
const mouse = new THREE.Vector2();
//se crea un modelo de esfera, tiene parametro radio, phi , theta
const position = new THREE.Spherical();
//boton "ir"
const setPosition = document.getElementById('setPosition')
//escuchar click derecho , y mandar a la funcion onMouseMove para procesar el evento click derecho
window.addEventListener('auxclick', onMouseMove, false);

function onMouseMove(event) {
    //obtiene la posicion xy del click derecho del mouse
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    //se manda la posicion del mouse xy y la camara al objeto raycaster que se declaro en la linea 21
    raycaster.setFromCamera(mouse, camera);

    // calcula la interseccion del mouse xy y el objeto clickeado (click derecho) y devuelve un array
    const intersects = raycaster.intersectObjects(scene.children);

    //se recorre el array de  intersects
    for (let i = 0; i < intersects.length; i++) {
        //se mueve la posicion del punto blanco redondo para denotar el click derecho en el objeto tierra
        markPosition.position.x = intersects[i].point.x
        markPosition.position.y = intersects[i].point.y
        markPosition.position.z = intersects[i].point.z

        //se mueve la camara con los puntos de interseccion clickeado (click derecho) y se multiplica x2 para que este alejado
        camera.position.x = intersects[i].point.x * 2
        camera.position.y = intersects[i].point.y * 2
        camera.position.z = intersects[i].point.z * 2

        //se convierte los valos de la interseccion xyz en latitud y longitud
        let [lat, lng] = vector3ToLatLng(intersects[i].point)

        /**
         * usando api geocode de opencagedata, no se uso google api porque es de paga
         * para obtener datos de una ciudad se debe utilizar el link:
         * https://api.opencagedata.com/geocode/v1/json?q=${lat}%2C+${lng}&key=b72194cb61a542cf8644a0f87f93a790
         * donde lat es la titudud y lng es la longitud. Tambien existe un parametro para api key es decir la api o link
         * esta restringida por llave de seguridad.
         * el link obtiene datos de una coordanada lat,lng
         */
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
        //se cambia los valos de los inputs de latitud y longitud con los datos obtenidos en la linea 55
        document.getElementById('lat').value = lat
        document.getElementById('lng').value = lng

    }
}

// creando la ecena de threejs
const scene = new THREE.Scene()

//cargando la textura que es el fondo de imagen negra stars.jpg
scene.background = starsTexture

//posicion inicial del punto blanco en xyz
markPosition.position.z = 500
markPosition.position.x = 0
markPosition.position.y = 0

//creando el objeto webglrenderer
const renderer = new THREE.WebGLRenderer()

//redimensinar el objeto renderer
renderer.setSize(window.innerWidth, window.innerHeight)

//agregar objeto rendeareado en la etiqueta body del dom
document.body.appendChild(renderer.domElement)

//rotar la posicion incial de la tierra para las coordenadas 0,0
tierra.rotation.y = -(Math.PI / 2)//igulaar la con la posicion de la rotacion

//agregando el objeto tierra y el marcador blanco a la escena
scene.add(tierra);
scene.add(markPosition)

//creando la perspectiva de la camara
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

//mover la posiciion de la camara en z=1000 porque la tierra tiene un radio 500 y seria una distancia de 500 de 0,0 en xy
camera.position.z = 1000;

//crear objeto orbitconstrols, se le pasa la camara y renderer.domelement
const controls = new OrbitControls(camera, renderer.domElement)

//restringir orbitcontrols
//minima distancia de zoom 560 porque la tierra tiene radio 500 con centro en las coordenadas 0,0
controls.minDistance = 560

//maxima distancia de zoom 1200
controls.maxDistance = 1200

//restringir el cambio de posicion de los objetos de la escena como la tierra y markposition
controls.screenSpacePanning = false
controls.enablePan = false

//para redimensionar la el renderer cuando el tamanio de la pantalla cambie
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.render(scene, camera)
});

function render() {
    renderer.render(scene, camera);
}

//animacion
const animate = function () {
    window.requestAnimationFrame(animate)
    //actualizar los controles cada vez que haya cambios como zoom y otros eventos
    controls.update()
    render()
}
animate()

//funcion para convertir latitud y longitud a vector 3D xyz
function latLngToVector3(lat, lon, radius) {
    var phi = (90 - lat) * (Math.PI / 180);
    var theta = Math.PI * (lon / 180);
    // theta = theta + (Math.PI / 2)//igulaar la con la posicion de la rotacion
    const spherical = new THREE.Spherical(radius, phi, theta);
    return new THREE.Vector3().setFromSpherical(spherical);
}

//funcion para convertir vector con valores xyz a latitud y longitud
const vector3ToLatLng = (v3) => {
    const spherical = new THREE.Spherical().setFromVector3(v3);
    const lat = 180 * (0.5 - (spherical.phi / Math.PI));
    const lng = 180 * (spherical.theta / Math.PI);
    return [lat, lng]
};

//funcion para mover el marcador de posicion (esfera blanca)
function setMarkPositionFromLatLonRad(lat, lon, rad = 500) {
    const v3 = latLngToVector3(lat, lon, rad)
    markPosition.position.x = v3.x
    markPosition.position.y = v3.y
    markPosition.position.z = v3.z
    //para mover la posicion de la camara
    camera.position.x = v3.x * 2
    camera.position.y = v3.y * 2
    camera.position.z = v3.z * 2
}

//detectar click en boton "ir"
setPosition.addEventListener('click', function () {
    setMarkPositionFromLatLonRad(document.getElementById('lat').value, document.getElementById('lng').value)
});

//detectar click en boton 'buscar'
document.getElementById('searchCity').addEventListener('click', function () {
    /**
     * uso de api geocode de opencagedata, se manda por parametro el nombre de la ciudad del que se quiere obtener su latitud y longitud
     * https://api.opencagedata.com/geocode/v1/geojson?q=${NOMBRE_DE_LA_CIUDAD}&key=API_KEY
     */
    fetch(`https://api.opencagedata.com/geocode/v1/geojson?q=${document.getElementById('cityName').value}&key=b72194cb61a542cf8644a0f87f93a790`)
        .then(response => response.json())
        .then(data => setMarkPositionFromLatLonRad(data.features[0].geometry.coordinates[1], data.features[0].geometry.coordinates[0]));
});
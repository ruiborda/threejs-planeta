import * as THREE from "three";

const surface_texture = "../earth.png";
const earthTexture = new THREE.TextureLoader().load(surface_texture);
const geometry = new THREE.SphereGeometry(500, 64, 64);
const material = new THREE.MeshBasicMaterial({
    map: earthTexture,
    transparent: false
})
export const earth = new THREE.Mesh(geometry, material)
import * as THREE from "three";

const geometry = new THREE.SphereGeometry(5, 64, 64);
const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: false
})
export const markPosition = new THREE.Mesh(geometry, material)
<script setup>
  import * as THREE from 'three';
  import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
  const props = defineProps(['planetGroups', 'camera', 'controls']);
  const selectedPlanet = defineModel();

  let infoDivRenderer;

  function selectPlanet(planet) {
    selectedPlanet.value = planet;
    moveToPlanet(planet);
    if (infoDivRenderer) {
      infoDivRenderer.dispose();
      document.getElementById('planet-display').innerHTML = ''; // Réinitialiser le canvas
    }
    // Créer la scène
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);
    // Ajouter une caméra orthographique (parfaite pour un rendu 2D)
    const infoDivCamera = new THREE.PerspectiveCamera(75, 1.2, 0.1, 500);
    infoDivCamera.position.set(0, 0, 25);
    infoDivRenderer = new THREE.WebGLRenderer();
    infoDivRenderer.setSize(234, 196); // La taille de la div
    // Ajouter le renderer WebGL dans la div
    document
      .getElementById('planet-display')
      .appendChild(infoDivRenderer.domElement);

    // Charger le modèle 3D de la planète
    const loader = new GLTFLoader();
    loader.load(
      planet.userData.informations.path, // Le chemin vers le modèle GLTF
      (gltf) => {
        // Calculer la taille actuelle avec Box3
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const size = new THREE.Vector3();
        box.getSize(size);

        // Normaliser la taille de base à 1 unité (par exemple, diamètre de la Terre)
        const maxDimension = Math.max(size.x, size.y, size.z);
        const normalizeScale = 1 / maxDimension;
        gltf.scene.scale.set(normalizeScale, normalizeScale, normalizeScale);
        // Ajuster la taille en fonction de la taille réelle de la planète
        const planetDiameter = 25;
        gltf.scene.scale.multiplyScalar(planetDiameter);
        scene.add(gltf.scene);
      },
      undefined,
      (error) => {
        console.error('Erreur de chargement du modèle :', error);
      },
    );
    // Lumière simple
    const ambientLight = new THREE.AmbientLight(0xffffff, 3);
    scene.add(ambientLight);
    function animate() {
      if (scene.children[1]) {
        scene.children[1].rotation.y += planet.userData.rotationSpeed;
      }
      infoDivRenderer.render(scene, infoDivCamera);
    }
    infoDivRenderer.setAnimationLoop(animate);
  }
  // Fonction pour déplacer la caméra vers une planète
  function moveToPlanet(planet) {
    // Calculer la position cible (un peu en retrait pour bien voir la planète)
    const targetPosition = new THREE.Vector3();
    planet.children[1].getWorldPosition(targetPosition); // Obtenir la position mondiale de la planète
    // Positionner la caméra à une distance raisonnable
    const cameraTarget = targetPosition
      .clone()
      .add(new THREE.Vector3(50, 0, 0));
    // Animer la caméra vers cette position
    const duration = 2; // Durée en secondes
    const startPosition = props.camera.position.clone();
    const startTarget = props.controls.target.clone();
    let elapsed = 0;
    const animateCamera = () => {
      elapsed += 0.016; // Supposons ~60fps
      const t = Math.min(elapsed / duration, 1); // Interpolation de 0 à 1
      props.camera.position.lerpVectors(startPosition, cameraTarget, t);
      props.controls.target.lerpVectors(startTarget, targetPosition, t);
      props.controls.update();
      if (t < 1) {
        requestAnimationFrame(animateCamera); // Continuer l'animation
      }
    };
    animateCamera();
  }
</script>
<template>
  <div class="absolute top-10 left-10 w-[100px] rounded">
    <img src="/logo4000x4000.png" class="block mx-auto rounded-t" />
    <ul
      v-if="planetGroups.length === 8"
      class="divide-y-2 text-center bg-gray-700"
    >
      <li
        v-for="planet in planetGroups"
        :key="planet.uuid"
        :class="[
          selectedPlanet.name === planet.name
            ? selectedPlanet.userData.informations.color
            : '',
          'px-5 py-3 cursor-pointer transition hover:bg-gray-300 text-white',
        ]"
        @click="selectPlanet(planet)"
      >
        {{ planet.name }}
      </li>
    </ul>
  </div>
  <div
    class="p-2 absolute top-10 left-36 w-[250px] h-[500px] rounded bg-gray-700 text-white"
    v-show="selectedPlanet"
  >
    <p
      :class="`${selectedPlanet.userData?.informations.color} text-center font-medium text-lg`"
    >
      {{ selectedPlanet.name }}
    </p>
    <div id="planet-display" class="mt-2 mb-3" />
    <div v-if="selectedPlanet.userData">
      <ul class="space-y-2 text-sm">
        <li class="grid grid-cols-2">
          <span>Diamètre</span>
          <span class="font-medium">
            {{
              selectedPlanet.userData.informations.characteristics.diameter.toLocaleString()
            }}
            km
          </span>
        </li>
        <li class="grid grid-cols-2">
          <span>Masse</span>
          <span class="font-medium">
            {{ selectedPlanet.userData.informations.characteristics.weight }}
            kg
          </span>
        </li>
        <li class="grid grid-cols-2">
          <span>Température moy.</span>
          <span class="font-medium">
            {{
              selectedPlanet.userData.informations.characteristics
                .averageTemperature
            }}
            °C
          </span>
        </li>
        <li class="grid grid-cols-2">
          <span>Pér. rotation</span>
          <span class="font-medium">
            {{
              selectedPlanet.userData.informations.characteristics
                .rotationPeriod
            }}
          </span>
        </li>
        <li class="grid grid-cols-2">
          <span>Vit. rotation</span>
          <span class="font-medium">
            {{
              selectedPlanet.userData.informations.characteristics.rotationSpeed.toLocaleString()
            }}
            km/h
          </span>
        </li>
        <li class="grid grid-cols-2">
          <span>Pér. révolution</span>
          <span class="font-medium">
            {{
              selectedPlanet.userData.informations.characteristics.orbit.orbitalPeriod.toLocaleString()
            }}
            jours
          </span>
        </li>
        <li class="grid grid-cols-2">
          <span>Vitesse orbitale</span>
          <span class="font-medium">
            {{
              selectedPlanet.userData.informations.characteristics.orbit.orbitalSpeed.toLocaleString()
            }}
            km/s
          </span>
        </li>
        <li class="grid grid-cols-2">
          <span>Distance soleil</span>
          <span class="font-medium">
            {{
              selectedPlanet.userData.informations.characteristics.orbit.semiMajorAxis.toLocaleString()
            }}
            km
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

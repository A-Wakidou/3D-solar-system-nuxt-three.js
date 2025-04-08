<script setup>
import { PerspectiveCamera, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
const { app } = useRuntimeConfig()
const loading = ref(true)
const planetsData = [
  {
    name: 'Mercure',
    path: `${app.baseURL}models/mercury/scene.gltf`,
    size: 0.382,
    semiMajorAxis: 180,
    semiMinorAxis: 174,
    inclination: 7.01,
    speed: 0.003,
    rotationSpeed: 0.002,
    color: 'bg-gray-300/70',
    characteristics: {
      diameter: 4879.4, // km
      gravity: 3.7, // m/s²
      weight: '3,301 1×10^23', // kg
      averageTemperature: 167, // °C
      rotationPeriod: '	58,6458 jours',
      rotationSpeed: 10.892, // km/h
      orbit: {
        semiMajorAxis: 57909050, // millions km
        orbitalSpeed: 47.362, // km/s
        orbitalPeriod: 87.969, // days
        satellites: [],
      },
    },
    moons: [],
  },
  {
    name: 'Vénus',
    path: `${app.baseURL}models/venus/scene.gltf`,
    size: 0.949,
    semiMajorAxis: 300,
    semiMinorAxis: 297,
    inclination: 3.39,
    speed: 0.002,
    rotationSpeed: -0.0001,
    color: 'bg-yellow-700/70',
    characteristics: {
      diameter: 12103.6, // km
      gravity: 8.87, // m/s²
      weight: '4.8675×10^24', //  kg
      averageTemperature: 464, // °C
      rotationPeriod: '−243.023 jours',
      rotationSpeed: 6.52, // km/h
      orbit: {
        semiMajorAxis: 108209500, // millions km
        orbitalSpeed: 35.02571, // km/s
        orbitalPeriod: 224.667, // days
        satellites: [],
      },
    },
    moons: [],
  }, // Vénus tourne très lentement et rétrograde
  {
    name: 'Terre',
    path: `${app.baseURL}models/earth1/scene.gltf`,
    size: 1,
    semiMajorAxis: 450,
    semiMinorAxis: 447,
    inclination: 0.0,
    speed: 0.001,
    rotationSpeed: 0.005,
    color: 'bg-sky-800/70',
    characteristics: {
      diameter: 12756.274, // km
      gravity: 9.80665, // m/s²
      weight: '5.9736×10^24', //  kg
      averageTemperature: 15, // °C
      rotationPeriod: '23 h 56 min 4 s',
      rotationSpeed: 1674.364, // km/h
      orbit: {
        semiMajorAxis: 149597887.5, // millions km
        orbitalSpeed: 29.783, // km/s
        orbitalPeriod: 365.256363, // days
        satellites: ['Lune'],
      },
    },
    moons: [
      {
        name: 'Lune',
        path: `${app.baseURL}models/moon/scene.gltf`,
        size: 0.273,
        inclination: 5.145,
        speed: 0.012, // Earth speed * 12
        rotationSpeed: 0.005,
        distance: 40,
        color: 'bg-gray-200/70',
      },
    ],
  },
  {
    name: 'Mars',
    path: `${app.baseURL}models/mars/scene.gltf`,
    size: 0.532,
    semiMajorAxis: 600,
    semiMinorAxis: 585,
    inclination: 1.85,
    speed: 0.0008,
    rotationSpeed: 0.003,
    color: 'bg-orange-700/70',
    moons: [],
  },
  {
    name: 'Jupiter',
    path: `${app.baseURL}models/jupiter/scene.gltf`,
    size: 11.209,
    semiMajorAxis: 900,
    semiMinorAxis: 870,
    inclination: 1.31,
    speed: 0.0005,
    rotationSpeed: 0.001,
    color: 'bg-yellow-800/70',
    moons: [],
  },
  {
    name: 'Saturne',
    path: `${app.baseURL}models/saturn/scene.gltf`,
    size: 9.449,
    semiMajorAxis: 1200,
    semiMinorAxis: 1170,
    inclination: 2.49,
    speed: 0.0004,
    rotationSpeed: 0.009,
    color: 'bg-orange-200/70',
    moons: [],
  },
  {
    name: 'Uranus',
    path: `${app.baseURL}models/uranus/scene.gltf`,
    size: 4.007,
    semiMajorAxis: 1500,
    semiMinorAxis: 1485,
    inclination: 0.77,
    speed: 0.0003,
    rotationSpeed: -0.003,
    color: 'bg-cyan-500/70',
    moons: [],
  }, // Uranus tourne rétrograde
  {
    name: 'Neptune',
    path: `${app.baseURL}models/neptune/scene.gltf`,
    size: 3.883,
    semiMajorAxis: 1800,
    semiMinorAxis: 1794,
    inclination: 1.77,
    speed: 0.0002,
    rotationSpeed: 0.003,
    color: 'bg-blue-700/70',
    moons: [],
  },
];
const planetGroups = ref([]);
const selectedPlanet = ref(false);

const renderer = ref();
const camera = ref();
const controls = ref();

onMounted(() => {
  renderer.value = new WebGLRenderer({ antialias: true });
  camera.value = new PerspectiveCamera(75, 2, 0.1, 25000);
  controls.value = new OrbitControls(camera.value, renderer.value.domElement);
  document.body.appendChild(renderer.value.domElement);
});
</script>
<template>
  <div>
    <Loading v-if="loading" />
    <Scene3D v-if="controls" :planets-data="planetsData" :renderer="renderer" v-model:camera="camera"
      v-model:controls="controls" v-model:planet-groups="planetGroups" @modelsLoadingComplete="loading = false" />
    <SelectPlanet :planet-groups="planetGroups" :camera="camera" :controls="controls" v-model="selectedPlanet" />
  </div>
</template>

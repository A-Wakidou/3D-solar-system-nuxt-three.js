<script setup>
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const { app } = useRuntimeConfig()
const props = defineProps(['planetsData', 'renderer']);
const camera = defineModel('camera');
const controls = defineModel('controls');
const planetGroups = defineModel('planetGroups');

const orbitIsPaused = ref(false); // Orbit pause flag
onMounted(() => {
  camera.value.position.set(10000, 50, 50);
  // Activer l'inertie
  controls.value.enableDamping = true;
  controls.value.target.set(0, 5, 0);
  // Configurer les limites de zoom
  controls.value.minDistance = 500; // Distance minimale
  controls.value.maxDistance = 15000; // Distance maximale
  controls.value.update();
  const scene = new THREE.Scene();
  const loader = new GLTFLoader();

  const light = new THREE.AmbientLight(0xffffff, 3); // Color, Intensity
  scene.add(light);

  const solarSystem = new THREE.Group();
  solarSystem.name = 'Solar System';
  scene.add(solarSystem);
  let sunModel;

  // SUN
  loader.load(
    `${app.baseURL}models/sun1/scene.gltf`,
    (gltf) => {
      sunModel = gltf.scene;
      sunModel.name = 'Sun Model';
      // Calculer la taille actuelle avec Box3
      const box = new THREE.Box3().setFromObject(sunModel);
      const size = new THREE.Vector3();
      box.getSize(size);

      // Normaliser la taille de base à 1 unité (par exemple, diamètre de la Terre)
      const maxDimension = Math.max(size.x, size.y, size.z);
      const normalizeScale = 1 / maxDimension;
      sunModel.scale.set(normalizeScale, normalizeScale, normalizeScale);
      // Ajuster la taille en fonction de la taille réelle de la planète
      const planetDiameter = 50 * 20;
      sunModel.scale.multiplyScalar(planetDiameter);
      sunModel.position.set(0, 0, 0); // Centrer le modèle
      solarSystem.add(sunModel);
      // // Taille du halo légèrement supérieure au Soleil
      // const haloGeometry = new THREE.SphereGeometry(11, 32, 32); // Ajuster sunRadius
      // const haloMaterial = new THREE.MeshBasicMaterial({
      //   color: 0xffaa00, // Couleur chaude pour simuler la lumière solaire
      //   transparent: true,
      //   opacity: 0.4, // Halo semi-transparent
      //   side: THREE.BackSide, // Rendu de l'intérieur vers l'extérieur
      // });

      // const sunHalo = new THREE.Mesh(haloGeometry, haloMaterial);

      // // Ajoutez le halo autour du Soleil
      // sunModel.add(sunHalo);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% chargé');
    },
    (error) => {
      console.error('Erreur lors du chargement du fichier STL', error);
    },
  );

  const createPlanet = (data, model) => {
    // Global Orbit
    const orbit = new THREE.Group();
    orbit.rotation.x = THREE.MathUtils.degToRad(data.inclination);
    orbit.name = data.name;
    solarSystem.add(orbit);
    const orbitPath = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(
        new Array(100).fill(0).map((_, i) => {
          const angle = (i / 100) * Math.PI * 2;
          return new THREE.Vector3(
            Math.cos(angle) * data.semiMajorAxis * 5,
            0,
            Math.sin(angle) * data.semiMinorAxis * 5,
          );
        }),
      ),
      new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.1,
      }),
    );
    orbit.add(orbitPath);

    // Init planet and moons group
    const planetAndMoons = new THREE.Group();
    planetAndMoons.name = data.name + 'Planet and moons';

    // Add planet and sprite to planetAndMoons group
    const planetAndLabel = new THREE.Group();
    const planetSprite = createTextSprite(data.name);
    planetSprite.position.set(0, 250, 0);
    planetAndLabel.add(model.scene);
    planetAndLabel.add(planetSprite);
    planetAndMoons.add(planetAndLabel);
    orbit.add(planetAndMoons);
    // Data for animations
    model.scene.userData = data;
    // Add moons to planetAndMoons group
    const moons = [];
    if (data.moons.length > 0) {
      data.moons.forEach((moonData) => {
        loader.load(
          moonData.path,
          (gltf) => {
            const moonOrbit = new THREE.Group();
            gltf.scene.rotation.x = THREE.MathUtils.degToRad(
              moonData.inclination,
            );
            const sprite = createTextSprite(moonData.name);
            sprite.position.set(0, 250, 0);
            moonOrbit.position.set(moonData.distance, 0, 0);
            moonOrbit.add(gltf.scene);
            moonOrbit.add(sprite);
            moonOrbit.userData = {
              ...moonData,
              angle: 0,
            };
            planetAndMoons.add(moonOrbit);
            moons.push(moonOrbit);
          },
          undefined,
          (error) => {
            console.error('Erreur lors du chargement du modèle : ', error);
          },
        );
      });
    }
    // Calculer la taille actuelle avec Box3
    const box = new THREE.Box3().setFromObject(model.scene);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Normaliser la taille de base à 1 unité (par exemple, diamètre de la Terre)
    const maxDimension = Math.max(size.x, size.y, size.z);
    const normalizeScale = 1 / maxDimension;
    model.scene.scale.set(normalizeScale, normalizeScale, normalizeScale);
    // Ajuster la taille en fonction de la taille réelle de la planète
    const planetDiameter = data.size * 25;
    model.scene.scale.multiplyScalar(planetDiameter);
    // Ajouter des propriétés dynamiques pour l'animation
    orbit.userData = {
      planetAndMoons,
      moons: moons,
      angle: 0,
      speed: data.speed / 2,
      rotationSpeed: data.rotationSpeed,
      semiMajorAxis: data.semiMajorAxis * 5,
      semiMinorAxis: data.semiMinorAxis * 5,
      informations: data,
    };
    return orbit;
  };

  // Fonction pour charger tous les modèles
  const loadPlanets = () => {
    let planetsLoaded = 0;
    props.planetsData.forEach((data) => {
      loader.load(
        data.path,
        (gltf) => {
          // Une fois le modèle chargé, créer la planète et l'ajouter à la scène
          const planetGroup = createPlanet(data, gltf);
          planetGroups.value.push(planetGroup);
          // scene.add(planetGroup);

          // Vérifier si tous les modèles sont chargés
          planetsLoaded++;
          if (planetsLoaded === props.planetsData.length) {
            animate(); // Lancer l'animation lorsque toutes les planètes sont chargées
          }
        },
        undefined,
        (error) => {
          console.error('Erreur lors du chargement du modèle : ', error);
        },
      );
    });
  };

  function resizeRendererToDisplaySize(props) {
    const canvas = props.renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      props.renderer.setSize(width, height, false);
    }
    return needResize;
  }

  // const addStars = () => {
  //   // Créer la géométrie des étoiles
  //   const starCount = 100;
  //   const starGeometry = new THREE.BufferGeometry();
  //   const starPositions = [];

  //   for (let i = 0; i < starCount; i++) {
  //     const x = (Math.random() - 0.5) * 14000; // Positionner les étoiles dans une grande boîte
  //     const y = (Math.random() - 0.5) * 14000;
  //     const z = (Math.random() - 0.5) * 14000;
  //     starPositions.push(x, y, z);
  //   }

  //   starGeometry.setAttribute(
  //     'position',
  //     new THREE.Float32BufferAttribute(starPositions, 3),
  //   );

  //   // Créer le matériau des étoiles
  //   const starMaterial = new THREE.PointsMaterial({
  //     color: 0xffffff,
  //     size: 2, // Taille des particules
  //     sizeAttenuation: true, // Permet de réduire la taille des étoiles avec la distance
  //   });

  //   // Créer le nuage de particules
  //   const stars = new THREE.Points(starGeometry, starMaterial);

  //   // Ajouter les étoiles à la scène
  //   scene.add(stars);
  // };

  // addStars();

  function createAsteroidBelt() {
    const orbit = new THREE.Group();
    const asteroidCount = 1000; // Nombre total d'astéroïdes
    const beltInnerRadius = 3400; // Rayon intérieur de la ceinture
    const beltOuterRadius = 3600; // Rayon extérieur de la ceinture

    const asteroidGeometry = new THREE.BufferGeometry();
    const asteroidPositions = [];
    const asteroidSizes = [];

    for (let i = 0; i < asteroidCount; i++) {
      // Générer une position aléatoire dans la ceinture
      const radius = THREE.MathUtils.randFloat(
        beltInnerRadius,
        beltOuterRadius,
      );
      const angle = THREE.MathUtils.randFloat(0, Math.PI * 2); // Angle autour du Soleil
      const height = THREE.MathUtils.randFloat(-10, 10); // Léger décalage en hauteur

      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      const y = height;

      asteroidPositions.push(x, y, z);

      // Taille aléatoire pour chaque astéroïde
      asteroidSizes.push(THREE.MathUtils.randFloat(0.5, 2));
    }

    // Ajouter les positions des astéroïdes à la géométrie
    asteroidGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(asteroidPositions, 3),
    );

    // Matériau pour les astéroïdes
    const asteroidMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.5,
      sizeAttenuation: true, // Permet une variation de taille en fonction de la distance
    });

    // Créer le nuage d'astéroïdes
    const asteroidBelt = new THREE.Points(asteroidGeometry, asteroidMaterial);
    asteroidBelt.rotation.x = THREE.MathUtils.degToRad(7);

    const sprite = createTextSprite("Ceinture d'astéroîdes");
    sprite.position.set(3600, 250, 0);
    // Ajouter à la scène
    orbit.add(asteroidBelt);
    orbit.add(sprite);
    solarSystem.add(orbit);
    return asteroidBelt;
  }

  function createKuiperBelt() {
    const orbit = new THREE.Group();
    const kuiperObjectCount = 2000; // Nombre total d'objets dans la ceinture
    const beltInnerRadius = 10200; // Rayon intérieur de la ceinture (au-delà de Neptune)
    const beltOuterRadius = 10000; // Rayon extérieur de la ceinture

    const kuiperGeometry = new THREE.BufferGeometry();
    const kuiperPositions = [];
    const kuiperSizes = [];

    for (let i = 0; i < kuiperObjectCount; i++) {
      // Générer une position aléatoire dans la ceinture
      const radius = THREE.MathUtils.randFloat(
        beltInnerRadius,
        beltOuterRadius,
      );
      const angle = THREE.MathUtils.randFloat(0, Math.PI * 2); // Angle autour du Soleil
      const height = THREE.MathUtils.randFloat(-50, 50); // Léger décalage en hauteur (pour le volume)

      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      const y = height;

      kuiperPositions.push(x, y, z);

      // Taille aléatoire pour chaque objet
      kuiperSizes.push(THREE.MathUtils.randFloat(1, 3));
    }

    // Ajouter les positions des objets à la géométrie
    kuiperGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(kuiperPositions, 3),
    );

    // Matériau pour les objets
    const kuiperMaterial = new THREE.PointsMaterial({
      color: 0xb2b2ff, // Couleur grise pour simuler la glace et la roche
      size: 1.5,
      sizeAttenuation: true, // Taille dépendante de la distance
    });

    // Créer le nuage d'objets
    const kuiperBelt = new THREE.Points(kuiperGeometry, kuiperMaterial);
    kuiperBelt.rotation.x = THREE.MathUtils.degToRad(15);
    const sprite = createTextSprite('Ceinture de Kuiper');
    sprite.position.set(10200, 250, 0);
    // Ajouter à la scène
    orbit.add(kuiperBelt);
    orbit.add(sprite);
    solarSystem.add(orbit);

    // Retourner pour des animations potentielles
    return kuiperBelt;
  }

  function createTextSprite(text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const fontSize = 64;

    // Ajuster la taille du canvas
    canvas.width = fontSize * 10;
    canvas.height = fontSize * 4;

    // Effacer le canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Définir le style du texte
    context.font = `${fontSize}px fantasy`;
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    // Créer une texture à partir du canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter; // Meilleure qualité pour le texte
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;

    // Créer le sprite
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true, // Activer la transparence
      alphaTest: 0.1, // Supprimer les pixels presque transparents
    });
    const sprite = new THREE.Sprite(spriteMaterial);

    // Ajuster l'échelle du sprite
    sprite.scale.set(4 * 100, 4 * 50, 1);
    return sprite;
  }

  function animate() {
    requestAnimationFrame(animate);
    if (resizeRendererToDisplaySize(props)) {
      const canvas = props.renderer.domElement;
      camera.value.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.value.updateProjectionMatrix();
    }
    // Faire tourner chaque planète autour de son orbite
    planetGroups.value.forEach((orbit) => {
      if (!orbitIsPaused.value) {
        // Mettre à jour l'angle pour l'orbite
        orbit.userData.angle -= orbit.userData.speed;
        // Calculer la position sur l'orbite elliptique
        const x =
          Math.cos(orbit.userData.angle) * orbit.userData.semiMajorAxis;
        const z =
          Math.sin(orbit.userData.angle) * orbit.userData.semiMinorAxis;
        orbit.userData.planetAndMoons.position.set(x, 0, z);
      }
      // Faire tourner la planète sur son propre axe
      orbit.userData.planetAndMoons.children[0].children[0].rotation.y +=
        orbit.userData.rotationSpeed;
      if (orbit.userData.moons.length > 0) {
        orbit.userData.moons.forEach((moon) => {
          // Faire tourner la lune autour de sa planète
          moon.userData.angle -= moon.userData.speed;
          const x = Math.cos(moon.userData.angle) * moon.userData.distance;
          const z = Math.sin(moon.userData.angle) * moon.userData.distance;
          const y = Math.sin(moon.userData.inclination) * z;
          moon.position.set(x, y, z);
          // Faire tourner la lune sur son propre axe
          moon.children[0].rotation.y += moon.userData.rotationSpeed;
        });
      }
    });
    // Vitesse de rotation du soleil
    sunModel.rotation.y -= 0.000185 * 1.5;
    asteroidBelt.rotation.y += 0.0001;
    kuiperBelt.rotation.y += 0.00005;
    props.renderer.render(scene, camera.value);
  }

  const asteroidBelt = createAsteroidBelt();
  const kuiperBelt = createKuiperBelt();
  loadPlanets();
});
</script>

<template>
  <div class="absolute left-1/2 -translate-x-1/2 bottom-10 bg-white p-5 rounded-full">
    <img class="cursor-pointer" @click="orbitIsPaused = !orbitIsPaused" src="/assets/icons/pause.svg" />
  </div>
</template>

<style>
html,
body,
#canva-parent {
  margin: 0;
  height: 100%;
}

canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>

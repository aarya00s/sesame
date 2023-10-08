import { VRButton } from '/static/VRButton.js';

import * as THREE from '/static/three.module.js';
import { OrbitControls } from '/static/OrbitControls.js';
const markers = []; // to store all markers (satellites and seismic events) for interaction checks
let infoElement = document.getElementById('info');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener('mousemove', onMouseMove, false);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.xr.enabled = true;
document.body.appendChild(VRButton.createButton(renderer));
// Load and display the Moon
const textureLoader = new THREE.TextureLoader();
const moonTexture = textureLoader.load('/static/moon1.jpg'); 
const moonGeometry = new THREE.SphereGeometry(1.75, 64, 64);
const moonMaterial = new THREE.MeshBasicMaterial({ map: moonTexture });
const moon = new THREE.Mesh(moonGeometry, moonMaterial);
textureLoader.load('/static/back.jpg', function(texture) {
        // Set the scene's background to the loaded texture
        scene.background = texture;
      });
scene.add(moon);
let audioListener = new THREE.AudioListener();
let audio = new THREE.Audio(audioListener);
let audioLoader = new THREE.AudioLoader();

// Load a sound and set it as the Audio object's buffer
audioLoader.load('/static/audio/output_audio.wav', function (buffer) {
    audio.setBuffer(buffer);
    audio.setLoop(true);
    audio.setVolume(0.5);
    audio.pause()
});

// Add an AudioListener to the camera
camera.add(audioListener);

// Add a mute/unmute button
let muteUnmuteButton = document.createElement('div');
muteUnmuteButton.innerHTML = '<img src="/static/mute.png" width="50" height="50" alt="Mute/Unmute">';
muteUnmuteButton.style.position = 'absolute';
muteUnmuteButton.style.bottom = '10px';
muteUnmuteButton.style.right = '10px';
muteUnmuteButton.style.cursor = 'pointer';
muteUnmuteButton.onclick = function () {
    const imgElement = muteUnmuteButton.querySelector('img');  // Get the img element inside the button
    if (audio.isPlaying) {
        audio.pause();
        imgElement.src = "/static/mute.png";  // Path to the image used when the audio is muted
    } else {
        audio.play();
        imgElement.src = "/static/unmute.png";  // Path to the image used when the audio is playing
    }
};
document.body.appendChild(muteUnmuteButton);
// Setup controls
const controls = new OrbitControls(camera, renderer.domElement); // Adjust path
function onMouseMove(event) {
    // Normalize mouse position to (-1, 1) range
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}
const loadSatelliteData = async () => {
    try {
        const response = await fetch('/static/data/nakamura/Apollo_seismic_network.json');  // Adjust path
        const data = await response.json();
        addSatelliteMarkers(data);
    } catch (error) {
        console.error('Error loading satellite data:', error);
    }
};

const addSatelliteMarkers = (data) => {
    data.forEach(station => {
        // Convert lat/long to 3D coordinates on the sphere
        console.log(station);
        const lat = station.lat;
        const lon = station.lng;
        const radius = 1.75;

        const phi = (90 - lat) * (Math.PI / 180);
const theta = (lon + 180) * (Math.PI / 180);


        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        


        // Create a satellite marker
        const markerGeometry = new THREE.SphereGeometry(0.05, 32, 32);
        const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x6400FF  });
        console.log(x,y,z);
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.set(x, y, z);
        marker.userData={station};
        markers.push(marker);
        marker.lookAt(camera.position);
        scene.add(marker);
    });
};
let allSeismicData = [];

// Load and plot seismic data
const loadSeismicData = async () => {
    try {
        const response = await fetch('/static/data/nakamura/merged.json');  // Adjust path
        const data = await response.json();
        allSeismicData = data;  // Store all data
        filterSeismicDataByYear(1969);  // Display events for the initial year
    } catch (error) {
        console.error('Error loading seismic data:', error);
    }
};

// Function to filter and display seismic data for a specific year
const filterSeismicDataByYear = (year) => {
    // Filter data for the specified year
    const filteredData = allSeismicData.filter(event => new Date(event.year).getUTCFullYear() === year);

    // Remove existing seismic markers from the scene
    scene.children = scene.children.filter(child => child.type !== 'Mesh' || !child.userData.event);

    // Add new seismic markers for the filtered data
    addSeismicMarkers(filteredData);
};

// Add event listener to the slider
document.getElementById('yearSlider').addEventListener('input', (event) => {
    // Update label
    document.getElementById('yearLabel').textContent = event.target.value;

    // Update displayed seismic events
    filterSeismicDataByYear(Number(event.target.value));
});

const addSeismicMarkers = (data) => {
    data.forEach(event => {
        // Convert lat/long to 3D coordinates on the sphere
        const lat = event.lat;
        const lon = event.long;
        const radius = 1.75;
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        // Create a seismic event marker
        const markerGeometry = new THREE.SphereGeometry(0.05, 32, 32);
        const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.set(x, y, z);
        marker.userData={event};
        markers.push(marker);
        scene.add(marker);

        // Animate seismic event marker based on magnitude
        createPulsatingCircles(lat, lon, event.magn,scene);
    });
};
const createPulsatingCircles = (lat, lon, magnitude, scene) => {
    // Convert lat/long to 3D coordinates on the sphere
    const radius = 1.75; 
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    
    // Create a ring geometry (outerRadius, innerRadius, thetaSegments)
    const geometry = new THREE.RingGeometry(0.03 * magnitude, 0.02 * magnitude, 16);


    const material = new THREE.MeshBasicMaterial({ color: 0xFF4D00, side: THREE.DoubleSide, transparent: true, opacity: 1 });

    const circle = new THREE.Mesh(geometry, material);
    circle.position.set(x, y, z);
    
    const smallCircle = circle.clone();
    smallCircle.scale.set(0.5, 0.5, 0.5);
    
    // Align the circles tangent to the sphere
    circle.lookAt(new THREE.Vector3(0, 0, 0));
    smallCircle.lookAt(new THREE.Vector3(0, 0, 0));

    scene.add(circle);
    scene.add(smallCircle);
    

    const animateCircle = () => {
        circle.scale.x += 0.02 * magnitude;
        circle.scale.y += 0.02 * magnitude;
        circle.material.opacity -= 0.005;

        smallCircle.scale.x += 0.02 * magnitude;
        smallCircle.scale.y += 0.02 * magnitude;
        smallCircle.material.opacity -= 0.005;

        // If the main circle has grown to a certain size or is nearly transparent,
        // reset the scales and opacity to have a continuous effect
        if (circle.scale.x > 3 * magnitude || circle.material.opacity < 0.1) {
            circle.scale.x = 1;
            circle.scale.y = 1;
            circle.material.opacity = 1;

            smallCircle.scale.x = 0.5;
            smallCircle.scale.y = 0.5;
            smallCircle.material.opacity = 1;
        }
        
        requestAnimationFrame(animateCircle);
    };

    animateCircle();
};

const animateSeismicMarker = (marker, magnitude) => {
    // Define animation properties based on magnitude
    const scaleMax = 1 + magnitude * 0.1;  // Adjust scale factor as needed
    const scaleMin = 1;
    let scaleDirection = 1;  // 1 for growing, -1 for shrinking

    const animate = () => {
        if (marker.scale.x >= scaleMax) {
            scaleDirection = -1;
        } else if (marker.scale.x <= scaleMin) {
            scaleDirection = 1;
        }
        marker.scale.x += 0.01 * scaleDirection;
        marker.scale.y += 0.01 * scaleDirection;
        marker.scale.z += 0.01 * scaleDirection;
        requestAnimationFrame(animate);
    };
    animate();
};

// Animation loop
const animate = () => {
    raycaster.setFromCamera(mouse, camera);

    // Assume `markers` is an array containing all your markers.
    const intersects = raycaster.intersectObjects(markers);

    if (intersects.length > 0) {
        const intersectedObj = intersects[0].object;
        // Display information related to intersectedObj.
        displayInfo(intersectedObj);
    } else {
        // Hide information if no object is intersected.
        hideInfo();
    }

    renderer.render(scene, camera);
    controls.update();
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    controls.update();
};
animate();
function displayInfo(object) {
    // Extract relevant information from `object` and display it.
    if (object.userData.station) {
        infoElement.innerHTML = `Code: ${object.userData.station.code}<br>name: ${object.userData.station.name}<br>Mission: ${object.userData.station.mission}<br>Latitude: ${object.userData.station.lat}<br>Longitude: ${object.userData.station.lng}`;
    } else if (object.userData.event) {
        infoElement.innerHTML = `Seismic Event<br>Time: ${object.userData.event.year}/${object.userData.event.month}/${object.userData.event.day} ${object.userData.event.hour}:${object.userData.event.min}:${object.userData.event.sec}<br>Magnitude: ${object.userData.event.magn}<br>Latitude: ${object.userData.event.lat}<br>Longitude: ${object.userData.event.long}`;
    }
    infoElement.style.display = 'block';
}

function hideInfo() {
    // Hide the information box.
    infoElement.style.display = 'none';
}
// Handle window resize
window.addEventListener('resize', () => {
    raycaster.setFromCamera(mouse, camera);

    // Check for intersections
    const intersects = raycaster.intersectObjects(markers);

    if (intersects.length > 0) {
        // Display information related to the intersected object.
        displayInfo(intersects[0].object);
    } else {
        // Hide information if no object is intersected.
        hideInfo();
    }

    // Rendering and controls update
    renderer.render(scene, camera);
    controls.update();

    // Request the next frame
    requestAnimationFrame(animate);
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});
loadSatelliteData();
// Load seismic data
loadSeismicData();

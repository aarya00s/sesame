import * as THREE from '/static/three.module.js';
import { OrbitControls } from '/static/OrbitControls.js';
console.log("here")
// Create a scene
var scene = new THREE.Scene();

// Create a camera
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3;

// Create a renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add a sphere to represent the Earth
var earthGeometry = new THREE.SphereGeometry(1.75, 64, 64);
var textureLoader = new THREE.TextureLoader();
var earthTexture = new THREE.TextureLoader().load('/static/texture.jpg');
textureLoader.load('/static/stars.jpg', function(texture) {
  // Set the scene's background to the loaded texture
  scene.background = texture;
});
var earthMaterial = new THREE.MeshBasicMaterial({ map: earthTexture });
var earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

// Add controls for user interaction
var controls = new OrbitControls(camera, renderer.domElement);

// Create a Points object to hold the drifter data
var points = null;
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

// Add mouse click event listener
window.addEventListener('click', onMouseClick, false);

// Function to handle mouse click events
function onMouseClick(event) {
  // Calculate mouse position in normalized coordinates (-1 to +1) for both components
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  // Update the raycaster with the current mouse position
  raycaster.setFromCamera(mouse, camera);

  // Find the intersected objects
  var intersects = raycaster.intersectObjects([points]);

  // If an intersection is found, display the popup
  if (intersects.length > 0) {
    var intersectedPoint = intersects[0].point;
    var index = intersects[0].index;

    // Get the corresponding data item
    var dataItem = data[index];

    // Prepare the content for the popup
    var content = `Lat: ${dataItem.Lat}<br>Lon: ${dataItem.Lon}<br>Ocean: ${dataItem.ocean_name} <br> SST: ${dataItem.SST}`;

    // Show the popup at the mouse position
    showPopup(event.clientX, event.clientY, content);
  }
}

// Function to show the popup
function showPopup(x, y, content) {
  var popup = document.getElementById('popup');
  popup.innerHTML = content;
  popup.style.left = x + 'px';
  popup.style.top = y + 'px';
  popup.style.display = 'block';
}

// Function to hide the popup
function hidePopup() {
  var popup = document.getElementById('popup');
  popup.style.display = 'none';
}

// Add mouse out event listener to hide the popup when the mouse leaves the canvas
renderer.domElement.addEventListener('mouseout', hidePopup, false);

// Hold the data
var data = null;
var colorMapping = {};
// Function to plot the data for a given month
function plotData(month) {
  // Remove existing points if any
  
  if(data){
    
    // Create geometry to hold the data points
    var geometry = new THREE.BufferGeometry();
    if (points) scene.remove(points);

    // Filter data for the selected month
    const monthData = data.filter(item => item.Month == month);
    // Arrays to hold position and color data
    var positions = [];
    var colors = [];

    // Object to hold color mapping for the legend
    

    // Iterate through the data and extract the points for the given month
    var count = 0;
  monthData.forEach(item => {
 
      
            // Convert latitude and longitude to Cartesian coordinates
            var lat = item.Lat;
            var lon = item.Lon;
            var radius = 1.75;
            var phi = (90 - lat) * (Math.PI / 180);
            var theta = (lon + 180) * (Math.PI / 180);
            var x = -(radius * Math.sin(phi) * Math.cos(theta));
            var y = radius * Math.cos(phi);
            var z = radius * Math.sin(phi) * Math.sin(theta);

            positions.push(x, y, z);
            count++;
            // Get ocean name
            var oceanName = item.ocean_name;

            // Assign a color based on the ocean name
            var color;
            if (!colorMapping[oceanName]) {
                // Create a new random color for this ocean
                color = new THREE.Color(Math.random() * 0xffffff);
                colorMapping[oceanName] = color;
            } else {
                color = colorMapping[oceanName];
            }
           
            colors.push(color.r, color.g, color.b);
        }
    );
    

    // Set the positions and colors to the geometry
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    // Create a material for the points
    var material = new THREE.PointsMaterial({ size: 0.007, vertexColors: true });

    // Create the Points object and add it to the scene
    points = new THREE.Points(geometry, material);
    scene.add(points);

    // Update the legend
    updateLegend(colorMapping);
    document.getElementById('monthLabel').innerText = `Month: ${month}`;
  }
}

// Function to update the legend
function updateLegend(colorMapping) {
  var legend = document.getElementById('legend');
  legend.innerHTML = '';

  for (var oceanName in colorMapping) {
      var color = colorMapping[oceanName];
      var colorHex = color.getHexString();

      var legendItem = document.createElement('div');
      legendItem.className = 'legend-item';

      var colorBox = document.createElement('div');
      colorBox.className = 'color-box';
      colorBox.style.backgroundColor = '#' + colorHex;
      legendItem.appendChild(colorBox);

      var labelText = document.createTextNode(oceanName);
      legendItem.appendChild(labelText);

      legend.appendChild(legendItem);
  }
}

var animating = true;
var currentMonth = 3;

// Function to update the plot based on the slider value
function updatePlot() {
  const selectedMonth = document.getElementById('monthSlider').value;
  plotData(selectedMonth);
}

// Function to toggle animation on and off
function toggleAnimation(){
  animating = !animating;
  const button = document.getElementById('pauseButton');
  button.innerHTML = animating ? 'Pause' : 'Play';
}

// Function to animate the slider
var frameCounter = 0;

// Function to animate the slider
function animateSlider() {
  if (animating) {
    frameCounter++;
    // Change the month every 300 frames (you can adjust this value)
    if (frameCounter % 50 === 0) {
      currentMonth = (currentMonth % 12) + 1;
      document.getElementById('monthSlider').value = currentMonth;
      updatePlot();
    }
  }
}
// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  // earth.rotation.y += 0.002;
  animateSlider(); // Call the slider animation function
}
animate();
// Handle window resize
window.addEventListener('resize', function () {
  var width = window.innerWidth;
  var height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});
console.log("Starting to fetch data...");

fetch('/static/final.json')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    console.log("Response received, parsing JSON...");
    return response.json();
  })
  .then(responseData => {
    console.log("JSON parsed successfully, data:", responseData);
    data = responseData;
    plotData(1);
  })
  .catch(error => {
    console.error('Error loading data:', error);
  });

// fetch('/static/refined_data.json')
//   .then(response => response.text())
//   .then(text => {

//       // Split the text by newline and parse each line as JSON
//       data = text.trim().split('\n').map(line => JSON.parse(line));
//       console.log("done");
//       // Now data is an array of objects
//       plotData(1);
//   })
//   .catch(error => console.error('Error loading data:', error));
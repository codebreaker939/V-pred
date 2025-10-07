const firebaseConfig = {
    apiKey: "AIzaSyD9XmeCQfnruokxdJZVldwMs-dJW9_9gBc",
    authDomain: "vehiclepredictor.firebaseapp.com",
    databaseURL: "https://vehiclepredictor-default-rtdb.firebaseio.com",
    projectId: "vehiclepredictor",
    storageBucket: "vehiclepredictor.firebasestorage.app",
    messagingSenderId: "922346908925",
    appId: "1:922346908925:web:fe818e95d9cd00fc796294"
  };
  
  firebase.initializeApp(firebaseConfig);
  const database = firebase.database();
  
  const vehiclesContainer = document.getElementById('vehicles');
  const alertsContainer = document.getElementById('alerts');
  const timeContainer = document.getElementById('current-time');
  const vehicleImage = document.getElementById('vehicle-image');
  const vehicleName = document.getElementById('vehicle-name');
  
  let alertListener = null;
  
  const updateTime = () => {
      const now = new Date();
      timeContainer.textContent = now.toLocaleTimeString('en-US');
  };
  
  // public/app.js

// ... (Firebase config and other variable declarations remain the same) ...

const loadVehicles = async () => {
    try {
        const response = await fetch('/api/vehicles');
        const vehicles = await response.json();
        vehiclesContainer.innerHTML = ''; // Clear loader/previous content

        // Store vehicles globally or pass them around if needed, for now we will rely on event click

        vehicles.forEach(vehicle => {
            const vehicleDiv = document.createElement('div');
            vehicleDiv.className = 'vehicle-item';
            vehicleDiv.textContent = `${vehicle.make} ${vehicle.model} (${vehicle.vehicleId})`;
            vehicleDiv.dataset.vehicleId = vehicle.vehicleId; // Unique ID for highlighting

            // --- IMPORTANT CHANGE HERE ---
            // Store the full vehicle object directly on the DOM element for easy access
            vehicleDiv.dataset.vehicleData = JSON.stringify(vehicle); 

            vehicleDiv.onclick = () => selectVehicle(vehicle); // Pass the full vehicle object
            vehiclesContainer.appendChild(vehicleDiv);
        });

        // Optional: Auto-select the first vehicle if available
        if (vehicles.length > 0) {
            selectVehicle(vehicles[0]);
        }

    } catch (error) {
        console.error('Failed to load vehicles:', error);
        vehiclesContainer.innerHTML = '<p class="placeholder">Error loading vehicles.</p>';
    }
};

const selectVehicle = (vehicle) => {
    // Remove active class from any previously selected vehicle
    document.querySelectorAll('.vehicle-item').forEach(el => el.classList.remove('active'));

    // Add active class to the currently selected vehicle
    const selectedElement = document.querySelector(`[data-vehicle-id="${vehicle.vehicleId}"]`);
    if (selectedElement) {
        selectedElement.classList.add('active');
    }

    // --- UPDATED: Populate asset details with the selected vehicle's data ---
    vehicleName.textContent = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

    // Use the vehicle's specific image URL or a default if none is provided
    // Make sure you have a 'default-car.png' in public/images
    vehicleImage.src = vehicle.imageUrl || '/images/default-car.png'; 

    // Start listening for alerts for this vehicle's ID
    listenForAlerts(vehicle.vehicleId);
};

// ... (rest of app.js remains the same) ...
  
  const listenForAlerts = (vehicleId) => {
      if (alertListener) {
          alertListener.off();
      }
      alertsContainer.innerHTML = '<div class="loader"></div>';
      const alertsRef = database.ref(`alerts/${vehicleId}`);
      alertListener = alertsRef;
      
      alertListener.on('value', (snapshot) => {
          const alerts = snapshot.val();
          alertsContainer.innerHTML = '';
          if (alerts) {
              alerts.forEach(alert => {
                  const alertDiv = document.createElement('div');
                  const isCritical = alert.title.toLowerCase().includes('critical');
                  alertDiv.className = isCritical ? 'alert critical' : 'alert';
                  alertDiv.innerHTML = `<strong>${alert.title}</strong><p>${alert.details}</p>`;
                  alertsContainer.appendChild(alertDiv);
              });
          } else {
              alertsContainer.innerHTML = '<p class="placeholder">No active alerts.</p>';
          }
      });
  };
  
  loadVehicles();
  setInterval(updateTime, 1000);
  updateTime(); 
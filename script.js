const apikey = "0a6ac1e93dcc40cf924790aa50304d08";
const apiUrl = `https://api.openweathermap.org/data/2.5/weather?units=metric&appid=${apikey}&q=`;
const searchbox = document.querySelector(".search input");
const searchbutton = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");
const tempUnitSwitch = document.querySelector(".temp-unit-switch");
let lastSuccessfulData = JSON.parse(localStorage.getItem("lastSuccessfulData"));
let tempUnit = "C";

// Function to update humidity
function updateHumidity(humidity) {
  document.querySelector(".humidity").innerHTML = humidity + " %";
}

// Function to update wind speed
function updateWindSpeed(speed) {
  document.querySelector(".Wind").innerHTML = speed + " Km/hr";
}

function setWeatherIcon(weatherMain) {
  let iconSrc = "";
  if (weatherMain === "Clouds") {
    iconSrc = "images/clouds.png";
  } else if (weatherMain === "Clear") {
    iconSrc = "images/clear.png";
  } else if (weatherMain === "Rain") {
    iconSrc = "images/rain.png";
  } else if (weatherMain === "Drizzle") {
    iconSrc = "images/drizzle.png"; // Replace with the correct path to your drizzle image
  } else if (weatherMain === "Mist") {
    iconSrc = "images/mist.png";
  } else if (weatherMain === "Haze") {
    iconSrc = "images/haze.png"; // Replace with the correct path to your haze image
  }
  weatherIcon.src = iconSrc;
}

function setForecastWeatherIcon(weatherMain, forecastItem) {
  let iconSrc = "";
  if (weatherMain === "Clouds") {
    iconSrc = "images/clouds.png";
  } else if (weatherMain === "Clear") {
    iconSrc = "images/clear.png";
  } else if (weatherMain === "Rain") {
    iconSrc = "images/rain.png";
  } else if (weatherMain === "Drizzle") {
    iconSrc = "images/drizzle.png"; // Replace with the correct path to your drizzle image
  } else if (weatherMain === "Mist") {
    iconSrc = "images/mist.png";
  } else if (weatherMain === "Haze") {
    iconSrc = "images/haze.png"; // Replace with the correct path to your haze image
  }
  const iconElement = forecastItem.querySelector(".weather-icon_2");
  iconElement.src = iconSrc;
}

// Function to display 5-day forecast starting from tomorrow
function displayFiveDayForecast(forecastData) {
  const weatherContainer = document.querySelector(".weather-container");
  weatherContainer.innerHTML = "";

  const currentDate = new Date(); // Get today's date
  currentDate.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to zero

  // Find the index that corresponds to tomorrow's date
  let tomorrowIndex = 0;
  while (tomorrowIndex < forecastData.list.length) {
    const date = new Date(forecastData.list[tomorrowIndex].dt * 1000);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() > currentDate.getTime()) {
      break;
    }
    tomorrowIndex++;
  }

  // Display the forecast for the next five days starting from tomorrow
  for (let i = tomorrowIndex; i < tomorrowIndex + 5 * 8; i += 8) {
    const dayData = forecastData.list[i];
    const weatherMain = dayData.weather[0].main;
    const temperature = Math.round(dayData.main.temp);
    const date = new Date(dayData.dt * 1000); // Convert timestamp to date

    const forecastItem = document.createElement("div");
    forecastItem.classList.add("forecast-item");

    const iconElement = document.createElement("img");
    iconElement.classList.add("weather-icon_2");

    // Set the icon based on weather condition
    if (weatherMain === "Clouds") {
      iconElement.src = "images/clouds.png";
    } else if (weatherMain === "Clear") {
      iconElement.src = "images/clear.png";
    } else if (weatherMain === "Rain" || weatherMain === "Drizzle") {
      iconElement.src = "images/rain.png";
    } else if (weatherMain === "Mist") {
      iconElement.src = "images/mist.png";
    } else {
      // Set a default icon if condition not matched
      iconElement.src = "images/default.png";
    }

    forecastItem.appendChild(iconElement);

    const tempElement = document.createElement("h1");
    tempElement.classList.add("temp_1");
    tempElement.textContent = `${temperature} °C`; // Display temperature
    forecastItem.appendChild(tempElement);

    const dateElement = document.createElement("p");
    dateElement.textContent = formatDate(date); // Format date
    forecastItem.appendChild(dateElement);

    weatherContainer.appendChild(forecastItem);
  }
}

// Format date as desired (e.g., "Thu, Nov 30")
function formatDate(date) {
  const options = { weekday: "short", month: "short", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

// Function to fetch weather data
async function checkweather(city) {
  if (!city) {
    alert("Please enter a city name.");
    return;
  }

  const response = await fetch(apiUrl + city);
  var data = await response.json();
  if (data.cod === "404") {
    alert("City not found");
  } else {
    lastSuccessfulData = data;
    localStorage.setItem(
      "lastSuccessfulData",
      JSON.stringify(lastSuccessfulData)
    );
    weatherIcon.classList.remove("fade-in");
    void weatherIcon.offsetWidth;
    weatherIcon.classList.add("fade-in");
    document.querySelector(".city").innerHTML = data.name;
    let tempC = Math.round(data.main.temp);
    let tempF = Math.round((tempC * 9) / 5 + 32);
    if (tempUnit === "C") {
      document.querySelector(".temp").innerHTML = `${tempC} °C`;
    } else {
      document.querySelector(".temp").innerHTML = `${tempF} °F`;
    }
    updateHumidity(data.main.humidity); // Update humidity
    updateWindSpeed(data.wind.speed); // Update wind speed
    setWeatherIcon(data.weather[0].main); // Set weather icon

    // Fetch 5-day forecast data
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apikey}`
    );
    const forecastData = await forecastResponse.json();

    // Display 5-day forecast
    displayFiveDayForecast(forecastData);

    // Create hourly forecast chart using the entered city
    createHourlyForecastChart(city);
    const weatherDescription = data.weather[0].description;
    updateOtherDetails(data, weatherDescription);
  }
}

// Event listeners for search
searchbutton.addEventListener("click", () => {
  const cityName = searchbox.value.trim();
  if (cityName) {
    localStorage.setItem("city", cityName);
    checkweather(cityName);
  } else {
    alert("Please enter a city name.");
  }
});

searchbox.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    const cityName = searchbox.value.trim();
    if (cityName) {
      localStorage.setItem("city", cityName);
      checkweather(cityName);
    } else {
      alert("Please enter a city name.");
    }
  }
});

// Fetch weather data for the stored city
const storedCity = localStorage.getItem("city");
if (storedCity) {
  searchbox.value = storedCity;
}
checkweather(storedCity || "Chennai");

// Update UI with last successful data (if available)
if (lastSuccessfulData) {
  document.querySelector(".city").innerHTML = lastSuccessfulData.name;
  let tempC = Math.round(lastSuccessfulData.main.temp);
  let tempF = Math.round((tempC * 9) / 5 + 32);
  if (tempUnit === "C") {
    document.querySelector(".temp").innerHTML = `${tempC} °C`;
  } else {
    document.querySelector(".temp").innerHTML = `${tempF} °F`;
  }
  document.querySelector(".humidity").innerHTML =
    lastSuccessfulData.main.humidity + " %";
  document.querySelector(".Wind").innerHTML =
    lastSuccessfulData.wind.speed + " Km/hr";
  let lastWeatherMain = lastSuccessfulData.weather[0].main;
  if (lastWeatherMain == "Clouds") {
    weatherIcon.src = "images/clouds.png";
  } else if (lastWeatherMain == "Clear") {
    weatherIcon.src = "images/clear.png";
  } else if (lastWeatherMain == "Rain" || lastWeatherMain == "Drizzle") {
    weatherIcon.src = "images/rain.png";
  } else if (lastWeatherMain == "Mist") {
    weatherIcon.src = "images/mist.png";
  }
}

// Function to fetch hourly forecast data from the API based on the entered city name
async function fetchHourlyForecastData(city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apikey}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Extract hourly forecast data from the API response
    const hourlyForecastData = data.list.filter((item) =>
      item.dt_txt.includes("12:00:00")
    ); // Filter hourly data for a specific time

    return hourlyForecastData;
  } catch (error) {
    console.error("Error fetching hourly forecast:", error);
    return null;
  }
}

let hourlyChart = null; // Declare a variable to hold the chart instance globally

// Function to create a Chart.js graph using the hourly forecast data
async function createHourlyForecastChart(city) {
  const hourlyForecastData = await fetchHourlyForecastData(city);

  if (hourlyForecastData) {
    const currentTime = new Date(); // Get the current time

    const hourlyTemperatures = hourlyForecastData.map(
      (hourData) => hourData.main.temp
    );
    const hourlyTimeLabels = hourlyForecastData.map((hourData, index) => {
      const date = new Date(hourData.dt * 1000);

      // Use current time for the first label, then increment by one hour for subsequent labels
      if (index === 0) {
        return currentTime.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        });
      } else {
        currentTime.setHours(currentTime.getHours() + 1);
        return currentTime.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        });
      }
    });

    const hourlyForecastChart = document.getElementById("hourlyForecastChart");

    // Check if the chart instance exists and destroy it before creating a new chart
    if (hourlyChart) {
      hourlyChart.destroy();
    }

    hourlyChart = new Chart(hourlyForecastChart, {
      type: "line",
      data: {
        labels: hourlyTimeLabels,
        datasets: [
          {
            label: "Hourly Temperature",
            data: hourlyTemperatures,
            borderColor: "Aqua",
            tension: 0.4,
          },
        ],
      },
      options: {
        scales: {
          y: {
            title: {
              display: true,
              text: "Temperature (°C)",
              color: "white",
            },
            ticks: {
              color: "white",
            },
            grid: {
              color: "rgba(255, 255, 255, 0.2)", // Set Y-axis grid lines color to white
            },
          },
          x: {
            title: {
              display: true,
              text: "Time",
              color: "white",
            },
            ticks: {
              color: "white",
            },
            grid: {
              color: "rgba(255, 255, 255, 0.2)", // Set X-axis grid lines color to white
            },
          },
        },
        plugins: {
          legend: {
            display: false, // Hide the legend
          },
        },
      },
    });
  }
}

// Function to update other weather details
function updateOtherDetails(data, weatherDescription) {
  const feelsLike = data.main.feels_like;
  const windSpeed = data.wind.speed;
  const windDirection = getWindDirection(data.wind.deg);
  const pressure = data.main.pressure;
  const uvIndex = data.uvi ? data.uvi : "N/A"; // UV index might not be available in the response
  const dewPoint = data.main.dew_point ? data.main.dew_point : "N/A"; // Dew point might not be available in the response
  const visibility = data.visibility / 1000; // Convert visibility from meters to kilometers

  const otherDetails = document.querySelector(".Other_details");
  otherDetails.innerHTML = `
    <strong>Feels like</strong> ${feelsLike} °C. ${weatherDescription}. ${getWindDescription(
    windSpeed
  )}<br><br>
    <strong>Wind:</strong> ${windSpeed}m/s ${windDirection}<br><br>
    <strong>Pressure:</strong> ${pressure} hPa<br><br>
    <strong>UV:</strong> ${uvIndex}<br><br>
    <strong>Dew point:</strong> ${dewPoint} °C<br><br>
    <strong>Visibility:</strong> ${visibility}  km
  `;

  otherDetails.style.fontsize = "50px";
  otherDetails.style.lineHeight = "2.0";
  // Reapply the class to the updated content
  otherDetails.classList.add("Other_details");
}

function getWindDirection(deg) {
  const val = Math.floor(deg / 22.5 + 0.5);
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  return directions[val % 16];
}

// Function to get wind description based on wind speed
function getWindDescription(windSpeed) {
  if (windSpeed < 1.5) {
    return "Calm";
  } else if (windSpeed >= 1.5 && windSpeed < 3.4) {
    return "Light air";
  } else if (windSpeed >= 3.4 && windSpeed < 5.5) {
    return "Light breeze";
  } else if (windSpeed >= 5.5 && windSpeed < 7.9) {
    return "Gentle breeze";
  } else if (windSpeed >= 7.9 && windSpeed < 10.7) {
    return "Moderate breeze";
  } else {
    return "High wind";
  }
}

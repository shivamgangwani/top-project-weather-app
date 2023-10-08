const API_KEY = '89eaa46390aa42959be81444230810';
const RESULT_CONTAINER = document.querySelector("#weather-data");
const SEARCH_FORM = document.querySelector("form#get-weather-data");

let DataCache = [];

function constructApiUrl(place) {
    const out = new URL('https://api.weatherapi.com/v1/current.json');
    out.searchParams.set('key', API_KEY);
    out.searchParams.set('q', place);
    return out.href;
}

async function fetchWeatherData(place) {
    const endpoint = constructApiUrl(place);
    const response = await fetch(endpoint);
    const data = await response.json();
    return data;
}

async function getWeatherData(place) {
    const data = await fetchWeatherData(place);
    document.querySelector("#weather-data").textContent = JSON.stringify(data);
}

class WindCompass {
    constructor(config) {
        this.speed = {
            mph : config.wind_mph,
            kph : config.wind_kph
        };
        this.degree = config.wind_degree;
        this.wind_dir = config.wind_dir;
    }

    createCompassVisual() {
        let container = document.createElement("div");
        container.classList.add("wind-compass-visual");

        let north = document.createElement("span");
        north.classList.add("wind-compass-north");
        north.textContent = "N";

        let img = document.createElement("img");
        img.src = "assets/needle.svg";
        img.setAttribute("rotate", this.degree);
        container.append(north, img);
        return container;
    }

    createInfo(miles = false) {
        let info = document.createElement("span");
        info.classList.add("wind-compass-info");
        const speedInfo = miles ? `${this.speed.mph} mph` : `${this.speed.kph} kmph`;
        info.innerHTML = `${this.degree}&#176; ${this.wind_dir}<br>${speedInfo}`;
        return info;
    }

    createNode(miles = false) {
        let container = document.createElement("div");
        container.classList.add('wind-compass');

        const compassVisual = this.createCompassVisual();
        const compassInfo = this.createInfo(miles);
        container.append(compassVisual, compassInfo);
        return container;
    }
}

class Location {
    constructor(config) {
        this.name = config.name;
        this.region = config.region;
        this.country = config.country;
        this.timezone = config.tz_id;
        this.localtime = config.localtime;
    }

    createNode() {
        let regionName = document.createElement("h1");
        regionName.classList.add('location-name');
        regionName.textContent = this.name;

        let regionInfo = document.createElement("span");
        regionInfo.classList.add('location-region-info');
        regionInfo.textContent = `${this.region}, ${this.country}`;

        let timeInfo = document.createElement("span");
        timeInfo.classList.add('location-time-info');
        timeInfo.innerHTML = `Fetched at ${this.localtime}<br>${this.timezone}`;

        let container = document.createElement("div");
        container.classList.add('location');
        container.append(regionName, regionInfo, timeInfo);
        return container;
    }

}

class Temperature {
    constructor(config) {
        this.temp = {
            c: config.temp_c,
            f: config.temp_f
        };
        this.feels_like = {
            c: config.feelslike_c,
            f: config.feelslike_f
        };
    }

    createNode(f = false) {
        let unit = f ? 'F' : 'C';

        let currTmp = f ? this.temp.f : this.temp.c;
        let currInfo = `${currTmp}&#176; ${unit}`;
        let currContainer = document.createElement("h1");
        currContainer.classList.add("current-temp");
        currContainer.innerHTML = currInfo;

        let feelsLikeTmp = f ? this.feels_like.f : this.feels_like.c;
        let feelsLikeInfo = `Feels like ${feelsLikeTmp}&#176; ${unit}`;
        let feelsLikeContainer = document.createElement("span");
        feelsLikeContainer.classList.add("feels-like-temp");
        feelsLikeContainer.innerHTML = feelsLikeInfo;

        let tempInfo = document.createElement("div");
        tempInfo.classList.add("temperature-info");
        tempInfo.append(currContainer, feelsLikeContainer);
        return tempInfo;
    }
}

class Condition {
    constructor(config) {
        this.text = config.text;
        this.icon = "https://" + config.icon.substr(2, config.icon.length);
    }

    createNode() {
        let container = document.createElement("div");
        container.classList.add("conditions");

        let img = document.createElement("img");
        img.src = this.icon;

        let span = document.createElement("span");
        span.textContent = this.text;

        container.append(img, span);
        return container;
    }
}

class WeatherReport {
    constructor(config) {
        this.location = new Location(config.location);
        this.weather = config.current;
    }

    createNode(miles=false, fahrenheit=false) {
        let conditionInfo = new Condition(this.weather.condition).createNode();
        let temperatureInfo = new Temperature(this.weather).createNode(fahrenheit);
        let locationInfo = this.location.createNode();
        let windInfo = new WindCompass(this.weather).createNode(miles);

        let container = document.createElement("div");
        container.classList.add("weather-status");
        container.append(temperatureInfo, conditionInfo, locationInfo, windInfo);
        return container;
    }
}

// Temporary data
const data = {
    "location": {
        "name": "New Delhi",
        "region": "Delhi",
        "country": "India",
        "lat": 28.6,
        "lon": 77.2,
        "tz_id": "Asia/Kolkata",
        "localtime_epoch": 1696769124,
        "localtime": "2023-10-08 18:15"
    },
    "current": {
        "last_updated_epoch": 1696768200,
        "last_updated": "2023-10-08 18:00",
        "temp_c": 34,
        "temp_f": 93.2,
        "is_day": 0,
        "condition": {
            "text": "Mist",
            "icon": "//cdn.weatherapi.com/weather/64x64/night/143.png",
            "code": 1030
        },
        "wind_mph": 4.3,
        "wind_kph": 6.8,
        "wind_degree": 225,
        "wind_dir": "W",
        "pressure_mb": 1007,
        "pressure_in": 29.74,
        "precip_mm": 0,
        "precip_in": 0,
        "humidity": 44,
        "cloud": 0,
        "feelslike_c": 33.2,
        "feelslike_f": 91.8,
        "vis_km": 4,
        "vis_miles": 2,
        "uv": 1,
        "gust_mph": 13.8,
        "gust_kph": 22.2
    }
}

function rotateCompassNeedles() {
    document.querySelectorAll(".wind-compass-visual img").forEach((img) => {
        let deg = img.getAttribute("rotate");
        img.style.transform = `rotate(${deg}deg)`;
    })
}

function addWeatherReport(config) {
    const weather_report = new WeatherReport(config);
    const node = weather_report.createNode(miles=true, fahrenheit=true);
    RESULT_CONTAINER.prepend(node);
    DataCache.push(config);
    updateCache();
    setTimeout(rotateCompassNeedles, 100);
}

async function searchFormHandler(event) {
    event.preventDefault();
    let val = SEARCH_FORM.querySelector("#place").value;
    let submitBtn = SEARCH_FORM.querySelector("input[type='submit']");
    submitBtn.disabled = true;
    submitBtn.value = "Fetching...";
    let data = await fetchWeatherData(val);
    addWeatherReport(data);
    submitBtn.disabled = false;
    submitBtn.value = "Search";
}

function getCache() {
    const cache = localStorage.getItem("cache");
    if(cache) {
        JSON.parse(cache).forEach((item) => addWeatherReport(item));
    }
}

function updateCache() {
    localStorage.setItem("cache", JSON.stringify(DataCache));
}

function resetCache() {
    localStorage.removeItem("cache");
    window.location.href = window.location.href;
}

// Main thread
SEARCH_FORM.addEventListener('submit', searchFormHandler);
SEARCH_FORM.addEventListener('reset', resetCache);


window.addEventListener("DOMContentLoaded", getCache);

import { config } from "./config.js";

const elements = { //cache everything once this site loads
    searchBar: document.getElementById('search-bar'),
    current_locale: document.querySelectorAll('.current-location'),
    current_temperature: document.querySelectorAll('.current-temp'),
    current_conditions: document.querySelectorAll('.current-conditions'),
    feelslike: document.getElementById('feel-like'),
    highlow: document.getElementById('high-low'),
    dropdown: document.querySelector('.dropsearch'),
    currentTime: document.getElementById('time-now'),
    location_widgets: document.getElementById('location-widget-main'),
    weather_icon: document.getElementById('Weather-icon'),
    main_pageBG: document.querySelector('main')
}



let arrayTemps = []; //for each day of this week

function backgroundWeather(condition){
    if (condition == "Moderate rain at times" || condition == "Cloudy"){
        elements.location_widgets.classList.add('cloudy-day')
        elements.main_pageBG.classList.add('cloudy-day');

        //removals
        elements.location_widgets.classList.remove('not-as-cloudy-day')
        elements.main_pageBG.classList.remove('not-as-cloudy-day')
        elements.location_widgets.classList.remove('not-cloudy-day')
        elements.main_pageBG.classList.remove('not-cloudy-day')
    }
    else if(condition == "Partly cloudy"){
        elements.location_widgets.classList.add('not-as-cloudy-day')
        elements.main_pageBG.classList.add('not-as-cloudy-day')

        //removals
        elements.location_widgets.classList.remove('cloudy-day')
        elements.main_pageBG.classList.remove('cloudy-day')
        elements.location_widgets.classList.remove('not-cloudy-day')
        elements.main_pageBG.classList.remove('not-cloudy-day')
    }
    else if (condition == "Clear" || condition == "Sunny"){
        elements.location_widgets.classList.add('not-cloudy-day')
        elements.main_pageBG.classList.add('not-cloudy-day')

        //removals
        elements.location_widgets.classList.remove('cloudy-day')
        elements.main_pageBG.classList.remove('cloudy-day')
        elements.location_widgets.classList.remove('not-as-cloudy-day')
        elements.main_pageBG.classList.remove('not-as-cloudy-day')
    }
}
 

//this function extracts the current temperature, the current high, current low, and current conditions
const getWeather = async (location) =>{
    const url = `${config.MY_API_URL}/forecast.json?key=${config.MY_API_KEY}&q=${location}&days=7&aqi=no&alerts=no`;

    try{
        const response = await fetch(url);
        const data =  await response.json();
        console.log(data);

        const current_temp = data.current.temp_c;

        const high_temp = data.forecast.forecastday[0].day.maxtemp_c;
        const low_temp = data.forecast.forecastday[0].day.mintemp_c;
    
        const conditions = data.current.condition.text;
        const feel = data.current.feelslike_c;

        const local_time = data.location.localtime;
        const my_icon = data.current.condition.icon;
    
        return {current_temp, high_temp, low_temp, conditions, feel, local_time, my_icon};

    } catch (error) {
            console.error('Error fetching weather data:', error);
            return null;
        };
     
} 

const getMyLocation = async () => {

    const url = "http://ip-api.com/json/";

    const response = await fetch(url);
    const data = await response.json();

    console.log(data.city);

    return data.city;

}

window.addEventListener('DOMContentLoaded', function(){

    elements.searchBar.onkeyup = function(){ //auto complete
        let result = [];
        let input = elements.searchBar.value

        
        if (input.length){
            result = Object.values(searchAutoComplete(input)).filter((keyword)=>{
             keyword.toLowerCase().includes(input)
             });
           
        }

    }

    elements.searchBar.addEventListener('keydown', async function(e){
        if (e.key === 'Enter'){
            let location = elements.searchBar.value;

            try{
                const {current_temp, high_temp, low_temp, conditions, feel, local_time, my_icon} = await getWeather(location);

                backgroundWeather(conditions);

                console.log(`Current Temp: ${current_temp} Conditions: ${conditions} High: ${high_temp} Low: ${low_temp} Feels like ${feel}`); 
                //making sure we extracted the information

                elements.feelslike.textContent = `Feels like: ${feel}°C`;
                elements.highlow.textContent = `H: ${high_temp}°C L: ${low_temp}°C `
                elements.currentTime.textContent =  local_time;
                elements.weather_icon.src = my_icon;

                //--For each, seperating them to un clutter my code

                elements.current_locale.forEach(function(e){
                    e.textContent = location;
                
                })
                elements.current_temperature.forEach(function(item){
                    item.textContent = `${current_temp}°C`;
                })

                elements.current_conditions.forEach(function(e){
                    e.textContent = conditions
                })

                elements.searchBar.value = "";


            }catch (error) { console.error('Error fetching weather data:', error)};
            
            
        }
    })

    
})

//searching improvements

function displayResults(result){
    let content = "<ul>"

    result.forEach((list)=>{
        content += `<li><h5>${list.name}, ${list.country}</h5></li>`
    })

    content += "</ul>"
    elements.dropdown.innerHTML = content;

    fillautoSearch()
}

const searchAutoComplete = async (location_search) =>{
    const url = `http://api.weatherapi.com/v1/search.json?key=${config.MY_API_KEY}&q=${location_search}`;

    try{
        //extract the auto complete api which gives us an object in json format
        const response = await fetch(url);
        const data = await response.json();
        displayResults(data);
        return data;

    } catch (error){
        console.error("Error attempting to search: ", error);
        return null;
    }
}

function fillautoSearch(){

    elements.dropdown.addEventListener('click', function(e){
        if (e.target && e.target.tagName === 'LI'){
            elements.searchBar.value = e.target.textContent;
            elements.dropdown.innerHTML = "";
            
        }
    })
    
}



window.addEventListener("load", async function(){
    let DefaultLocation = await getMyLocation();

    console.log(DefaultLocation);
    try{
        const {current_temp, high_temp, low_temp, conditions, feel, local_time, my_icon} = await getWeather(DefaultLocation);

        backgroundWeather(conditions);
        //making sure we extracted the information

        elements.feelslike.textContent = `Feels like: ${feel} °C`;
        elements.highlow.textContent = `H: ${high_temp} °C L: ${low_temp} °C `
        elements.currentTime.textContent =  local_time;
        elements.weather_icon.src = my_icon;

        //--For each, seperating them to un clutter my code

        elements.current_locale.forEach(function(e){
            e.textContent = DefaultLocation;
        
        })
        elements.current_temperature.forEach(function(e){
            e.textContent = `${current_temp}°C`;
        })

        elements.current_conditions.forEach(function(e){
            e.textContent = conditions;
        })


    }catch (error) {console.error('Error fetching weather data:', error)};


})











   

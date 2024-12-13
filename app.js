import { config } from "./config.js";

let searchBar = document.getElementById('search-bar');

const sidebar = document.getElementById('sidebar');

const current_locale = document.querySelectorAll('.current-location')
const current_temperature = document.querySelectorAll('.current-temp')
const current_conditions = document.querySelectorAll('.current-conditions')
const feelslike = document.getElementById('feel-like')
const highlow = document.getElementById('high-low')

const dropdown = document.querySelector('.dropsearch')

const currentTime = document.getElementById('time-now')

const location_widgets = document.getElementById('location-widget-main');
const weather_icon = document.getElementById('Weather-icon');

const main_pageBG = document.querySelector('main');

const listSelect = document.querySelectorAll('li')

let arrayTemps = []; //for each day of this week

function backgroundWeather(condition){
    if (condition == "Moderate rain at times" || condition == "Cloudy"){
        location_widgets.classList.add('cloudy-day')
        main_pageBG.classList.add('cloudy-day');

        //removals
        location_widgets.classList.remove('not-as-cloudy-day')
        main_pageBG.classList.remove('not-as-cloudy-day')
        location_widgets.classList.remove('not-cloudy-day')
        main_pageBG.classList.remove('not-cloudy-day')
    }
    else if(condition == "Partly cloudy"){
        location_widgets.classList.add('not-as-cloudy-day')
        main_pageBG.classList.add('not-as-cloudy-day')

        //removals
        location_widgets.classList.remove('cloudy-day')
        main_pageBG.classList.remove('cloudy-day')
        location_widgets.classList.remove('not-cloudy-day')
        main_pageBG.classList.remove('not-cloudy-day')
    }
    else if (condition == "Clear" || condition == "Sunny"){
        location_widgets.classList.add('not-cloudy-day')
        main_pageBG.classList.add('not-cloudy-day')

        //removals
        location_widgets.classList.remove('cloudy-day')
        main_pageBG.classList.remove('cloudy-day')
        location_widgets.classList.remove('not-as-cloudy-day')
        main_pageBG.classList.remove('not-as-cloudy-day')
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

window.addEventListener('DOMContentLoaded', function(){

    searchBar.onkeyup = function(){ //auto complete
        let result = [];
        let input = searchBar.value

        
        if (input.length){
            result = Object.values(searchAutoComplete(input)).filter((keyword)=>{
             keyword.toLowerCase().includes(input)
             });
           
        }

    }

    searchBar.addEventListener('keydown', async function(e){
        if (e.key === 'Enter'){
            let location = searchBar.value;

            try{
                const {current_temp, high_temp, low_temp, conditions, feel, local_time, my_icon} = await getWeather(location);

                backgroundWeather(conditions);

                console.log(`Current Temp: ${current_temp} Conditions: ${conditions} High: ${high_temp} Low: ${low_temp} Feels like ${feel}`); 
                //making sure we extracted the information

                feelslike.textContent = `Feels like: ${feel}°C`;
                highlow.textContent = `H: ${high_temp}°C L: ${low_temp}°C `
                currentTime.textContent =  local_time;
                weather_icon.src = my_icon;

                //--For each, seperating them to un clutter my code

                current_locale.forEach(function(e){
                    e.textContent = location;
                
                })
                current_temperature.forEach(function(item){
                    item.textContent = `${current_temp}°C`;
                })

                current_conditions.forEach(function(e){
                    e.textContent = conditions
                })


            }catch (error) { console.error('Error fetching weather data:', error)};
            
            
        }
    })

    
})

//searching improvements

function displayResults(result){
    let content = "<ul>"

    result.forEach((list)=>{
        content += `<li><h5>${list.name}, ${list.region}, ${list.country}</h5></li>`
    })

    content += "</ul>"
    dropdown.innerHTML = content;

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

    listSelect.forEach(function(e){

        e.addEventListener("click", function(){
            searchBar.value = e.textContent;
        })
        
    })
    
}

const getMyLocation = async () => {

    const url = "http://ip-api.com/json/";

    const response = await fetch(url);
    const data = await response.json();

    console.log(data.city);

    return data.city;

}

window.addEventListener("load", async function(){
    let DefaultLocation = await getMyLocation();

    console.log(DefaultLocation);
    try{
        const {current_temp, high_temp, low_temp, conditions, feel, local_time, my_icon} = await getWeather(DefaultLocation);

        backgroundWeather(conditions);
        //making sure we extracted the information

        feelslike.textContent = `Feels like: ${feel} °C`;
        highlow.textContent = `H: ${high_temp} °C L: ${low_temp} °C `
        currentTime.textContent =  local_time;
        weather_icon.src = my_icon;

        //--For each, seperating them to un clutter my code

        current_locale.forEach(function(e){
            e.textContent = DefaultLocation;
        
        })
        current_temperature.forEach(function(item){
            item.textContent = `${current_temp}°C`;
        })

        current_conditions.forEach(function(e){
            e.textContent = conditions
        })


    }catch (error) { console.error('Error fetching weather data:', error)};


})











   

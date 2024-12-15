import { config } from "./config.js";

const days = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const d = new Date();

const todayIndex = d.getDay();
let today = days[todayIndex];

//forecast for the week data extraction:

const mini_icon = document.querySelectorAll('.day-icons');
const small_temp = document.querySelectorAll('.small-temp');
const days_week = document.querySelectorAll('.daysWeek')

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

function backgroundWeather(condition){
    if (condition == "Moderate rain at times" || condition == "Cloudy" || condition == "Overcast"){
        elements.location_widgets.classList.add('cloudy-day')
        elements.main_pageBG.classList.add('cloudy-day');

        elements.weather_icon.src = "./icons/cloudy.png"

        //removals
        elements.location_widgets.classList.remove('not-as-cloudy-day')
        elements.main_pageBG.classList.remove('not-as-cloudy-day')
        elements.location_widgets.classList.remove('not-cloudy-day')
        elements.main_pageBG.classList.remove('not-cloudy-day')
    }
    else if(condition == "Partly cloudy"){
        elements.location_widgets.classList.add('not-as-cloudy-day')
        elements.main_pageBG.classList.add('not-as-cloudy-day')
        elements.weather_icon.src = "./icons/cloudy-sun.png"

        //removals
        elements.location_widgets.classList.remove('cloudy-day')
        elements.main_pageBG.classList.remove('cloudy-day')
        elements.location_widgets.classList.remove('not-cloudy-day')
        elements.main_pageBG.classList.remove('not-cloudy-day')
    }
    else if (condition == "Sunny" || condition == "Clear"){
        elements.location_widgets.classList.add('not-cloudy-day')
        elements.main_pageBG.classList.add('not-cloudy-day')
        elements.weather_icon.src = "./icons/sun.png"

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

        mini_icon.forEach((e, index) =>{
            let i = index+1;
            
            const day_icon = data.forecast.forecastday[i].day.condition.icon;
            e.src = day_icon;
        })

        small_temp.forEach((e,index)=>{
            let i = index + 1;
            const day_temp = data.forecast.forecastday[i].day.avgtemp_c
            e.textContent = `${day_temp} °C`

        })

        days_week.forEach((e,index)=>{
            //the day today
            let i = index + (todayIndex + 1);
            if (i >= days.length){
                i = 0 + index;
            }
            e.textContent = days[i].substring(0,3);

        })

    
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

    localStorage.setItem('YourLocation', data.city)

    console.log(`If this thing needs to trigger, then you are in: ${data.city}`)

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

                

                console.log(`Current Temp: ${current_temp} Conditions: ${conditions} High: ${high_temp} Low: ${low_temp} Feels like ${feel}`); 
                //making sure we extracted the information

                elements.feelslike.textContent = `Feels like: ${feel}°C`;
                elements.highlow.textContent = `H: ${high_temp}°C L: ${low_temp}°C `
                elements.currentTime.textContent =  local_time;
                

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
                backgroundWeather(conditions);
                


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
    let DefaultLocation
    if (!localStorage.getItem('YourLocation')){
        DefaultLocation = await getMyLocation();
    }
    else{
        DefaultLocation = this.localStorage.getItem('YourLocation')
    }
    


    try{
        const {current_temp, high_temp, low_temp, conditions, feel, local_time, my_icon} = await getWeather(DefaultLocation);

        
        //making sure we extracted the information

        elements.feelslike.textContent = `Feels like: ${feel} °C`;
        elements.highlow.textContent = `H: ${high_temp} °C L: ${low_temp} °C `
        elements.currentTime.textContent =  local_time;
        

        

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
        backgroundWeather(conditions);

        


    }catch (error) {console.error('Error fetching weather data:', error)};


})















   

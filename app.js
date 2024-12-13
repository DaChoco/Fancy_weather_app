import { config } from "./config.js";

let searchBar = document.getElementById('search-bar');

const sidebar = document.getElementById('sidebar');

const current_locale = document.querySelectorAll('.current-location')
const current_temperature = document.querySelectorAll('.current-temp')
const current_conditions = document.getElementById('condition')
const feelslike = document.getElementById('feel-like')
const highlow = document.getElementById('high-low')

let arrayTemps = []; //for each day of this week



//this function extracts the current temperatire, the current high, current low, and current conditions
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

        console.log(feel);
    
        return {current_temp, high_temp, low_temp, conditions, feel, local_time};

    } catch (error) {
            console.error('Error fetching weather data:', error);
            return null;
        };
     
} 

window.addEventListener('DOMContentLoaded', function(){

    searchBar.addEventListener('keydown', async function(e){
        if (e.key === 'Enter'){
            let location = searchBar.value;

            try{
                const {current_temp, high_temp, low_temp, conditions, feel, local_time} = await getWeather(location);

                console.log(`Current Temp: ${current_temp} Conditions: ${conditions} High: ${high_temp} Low: ${low_temp} Feels like ${feel}`); 
                //making sure we extracted the information

                current_locale.forEach(function(e){
                    e.textContent = location;
                
                })
                current_temperature.forEach(function(item){
                    item.textContent = current_temp;
                })
                feelslike.textContent = `Feels like: ${feel}`;
                current_conditions.textContent = conditions;
                highlow.textContent = `H: ${high_temp}°C L: ${low_temp}°C `


            }catch (error) { console.error('Error fetching weather data:', error)};
            
            
        }
    })

    
})



   

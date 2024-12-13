import { config } from "./config.js";

let searchBar = document.getElementById('search-bar');

const sidebar = document.getElementById('sidebar');



//this function extracts the current temperatire, the current high, current low, and current conditions
const getWeather = async (location) =>{
    const url = `${config.MY_API_URL}/forecast.json?key=${config.MY_API_KEY}&q=${location}&days=7&aqi=no&alerts=no`;

    try{
        const response = await fetch(url);
        const data =  await response.json();
        console.log(data);

        const current_temp = data.current.temp_c;
        const high_temp = data.forecast.forecastday[0].day.max_temp_c;
        const low_temp = data.forecast.forecastday[0].day.min_temp_c;
        const conditions = data.current.condition.text;
    
        return {current_temp, high_temp, low_temp, conditions};

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
                const {current_temp, high_temp, low_temp, conditions} = await getWeather(location);

                console.log(`The current temp is ${current_temp} while the conditions are ${conditions}`);

            }catch (error) { console.error('Error fetching weather data:', error)};
            
            
        }
    })

    
})



   

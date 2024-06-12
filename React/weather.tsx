import { fetchWeatherApi } from "./node_modules/openmeteo/lib/index";
import React from "react";
import { root_img, root_text } from "./main";

interface weather {
    time: string,
    temperature: number,
    humidity: number,
    code: number
}

let weatherVariables: string[] = [];

weatherVariables[0] = "Чистое небо", weatherVariables[1] = "Преимущественно ясно",
    weatherVariables[2] = "Переменная облачность", weatherVariables[3] = "Пасмурно",
    weatherVariables[45] = "Туман", weatherVariables[48] = "Отложение инейного тумана",
    weatherVariables[51] = "Слабая морось", weatherVariables[53] = "Умеренная морось",
    weatherVariables[55] = "Плотная интенсивная морось", weatherVariables[56] = "Лёгкий ледяной дождь",
    weatherVariables[57] = "Плотный ледяной дождь", weatherVariables[61] = "Слабый дождь",
    weatherVariables[63] = "Умеренный дождь", weatherVariables[65] = "Сильный дождь",
    weatherVariables[66] = "Лёгкий ледяной дождь", weatherVariables[67] = "Сильный интенсивный ледяной дождь",
    weatherVariables[71] = "Слабый снегопад", weatherVariables[73] = "Умеренный снегопад",
    weatherVariables[75] = "Сильный снегопад", weatherVariables[77] = "Град",
    weatherVariables[80] = "Слабые ливни", weatherVariables[81] = "Умеренный ливни",
    weatherVariables[82] = "Сильные ливни", weatherVariables[85] = "Слабые снежные ливни",
    weatherVariables[86] = "Сильные снежные ливни", weatherVariables[95] = "Гроза",
    weatherVariables[96] = "Гроза с небольшим градом", weatherVariables[99] = "Гроза с сильным градом";


export async function getWeather(lat: number, long: number) {
    let wStr: string[] = ["temperature_2m", "relative_humidity_2m", "weather_code"];
    const url = "https://api.open-meteo.com/v1/forecast";

    let hourlies = [];
    let response;

    for (let i = 0; i < wStr.length; i++) {
        const params_temp = {
            "latitude": lat,
            "longitude": long,
            "hourly": wStr[i]
        };

        const responses = await fetchWeatherApi(url, params_temp);
        response = responses[0];
        hourlies[i] = response.hourly()!;
    }

    const utcOffsetSeconds = response?.utcOffsetSeconds();
    const range = (start: number, stop: number, step: number) =>
        Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

    if (utcOffsetSeconds != undefined) {
        const weatherData = {
            hourly: {
                time: range(Number(hourlies[0].time()), Number(hourlies[0].timeEnd()), hourlies[0].interval()).map(
                    (t) => new Date((t + utcOffsetSeconds) * 1000)
                ),
                temperature2m: hourlies[0].variables(0)!.valuesArray()!,
                relative_humidity_2m: hourlies[1].variables(0)!.valuesArray()!,
                weather_code: hourlies[2].variables(0)!.valuesArray()
            },
        };

        if (weatherData.hourly.weather_code != null) {
            let weathers: weather[] = [];

            for (let i = 0; i < 24; i++) {
                weathers[i] = {
                    time: weatherData.hourly.time[i].toISOString(),
                    temperature: +weatherData.hourly.temperature2m[i].toFixed(2),
                    humidity: weatherData.hourly.relative_humidity_2m[i],
                    code: weatherData.hourly.weather_code[i]
                }
                let s: string[] = weathers[i].time.split("T", 2);
                s[1] = s[1].replace(".000Z", '');
                weathers[i].time = s[0] + " " + s[1];
            }

            root_text?.render(
                <div className="block">
                    <pre className="text"> Долгота: {long}, Широта: {lat}</pre>
                    {weathers.map((w) => <pre className="text"> Время: {w.time} Температура: {w.temperature + "°C"} Влажность: {w.humidity + "%"} Погода: {weatherVariables[w.code]}</pre>)}
                </div>
            );
        }
    }
}
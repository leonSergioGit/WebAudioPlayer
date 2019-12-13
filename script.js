//Declaración de las variables de los elementos del DOM
const playBtn = document.querySelector("#play");
const songContainer = document.querySelector(".cancionesNombres");
const reproductor = document.querySelector("#rep");
const cancionActual = document.querySelector('.cancionActual');

//Objeto que funcionará como estado para controlar la aplicación
let state = {
    isPlaying: false,
    data: []
}


//Event listener que obtiene los títulos de las canciones del musica.json al cargar la página
window.addEventListener("load", () => {
    fetch('musica.json')
    .then(data => data.text())
    .then(songs => {
        const songsArray = JSON.parse(songs);
        state.data = JSON.parse(songs);
        songContainer.innerHTML = songsArray.map(song => `<h1>${song.cancion}</h1>`).join('');
        const titulos = document.querySelectorAll('h1');   
        seleccionCancion(titulos, cancionActual);
    })
})



playBtn.addEventListener("click", () => {
    state.isPlaying  = !state.isPlaying;
    if(state.isPlaying){
        playBtn.value = 'PAUSE';
        reproductor.play();
    } else {
        playBtn.value = 'PLAY';
        reproductor.pause();
    }
    
})

reproductor.addEventListener("ended", () => {
    let cancion = cancionActual.innerText;
    let siguienteCancion = "";
    for(let i = 0; i < state.data.length; i++){
        if(cancion === state.data[i].cancion){
            if(i === state.data.length - 1){
                siguienteCancion = state.data[0].ruta;
            } else {
                siguienteCancion = state.data[i + 1].ruta;
            }
           
        }
    }
    reproductor.src = siguienteCancion;
    reproductor.play();
})

function seleccionCancion(arrayTitulos, cancionActual){
    arrayTitulos.forEach(titulo => {
        titulo.addEventListener("click", () => {
            let nombre = titulo.innerText;
            cancionActual.innerText = nombre;
            const cancionElegida = state.data.filter(cancion => cancion.cancion === cancionActual.innerText);
            const rutaCancionElegida = cancionElegida[0].ruta;
            reproductor.src = rutaCancionElegida;   
        })
    });
}


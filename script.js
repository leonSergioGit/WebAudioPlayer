//Declaración de las variables de los elementos del DOM
const playBtn = document.querySelector("#play");
const songContainer = document.querySelector(".cancionesNombres");
const reproductor = document.querySelector("#rep");
const cancionActual = document.querySelector('.cancionActual');
const barraProgreso = document.querySelector('.progress-bar');
const subirVol = document.querySelector('.subirVol');
const bajarVol = document.querySelector('.bajarVol');

//Declaración de la variable que servirá como intervalo para controlar el tiempo de la canción
let intervaloProgreso;

//Objeto que funcionará como estado para controlar la aplicación
let state = {
    isPlaying: false,   //Booleano que nos sirve para controla el botón play/pause
    data: []    //Array en el que guardamos el array extraído del json
}

/************  EVENT LISTENERS ***********/

//Event listener que obtiene los títulos de las canciones del musica.json al cargar la página
window.addEventListener("load", cargarCanciones);

//Event listener del botón play/pause
playBtn.addEventListener("click", playPauseCancion);

//Evento que detecta si una canción termina e inicializa la siguiente canción
reproductor.addEventListener("ended", siguienteCancionAutomatica)

//Control del volumen
subirVol.addEventListener("click", controlVolumen);
bajarVol.addEventListener("click", controlVolumen);




/****************** FUNCIONES ************/

//Carga las canciones desde el json
function cargarCanciones(){
    fetch('musica.json')
    .then(data => data.text())
    .then(songs => {
        const songsArray = JSON.parse(songs);
        state.data = JSON.parse(songs);
        songContainer.innerHTML = songsArray.map(song => `<h1>${song.cancion}</h1>`).join('');
        const titulos = document.querySelectorAll('h1');   
        seleccionCancion(titulos, cancionActual);
    })
}

function playPauseCancion(){
    if(cancionActual.innerText === ""){
        console.log("elige una canción");
        mensajeError();
    } else {
        state.isPlaying  = !state.isPlaying;
        if(state.isPlaying){
            playBtn.value = 'PAUSE';
            reproductor.play();
            intervalo = setInterval(()=>{
                let tiempoActual = parseInt(reproductor.currentTime);
                let tiempoPorcentaje = (tiempoActual * 100) /reproductor.duration;
                barraProgreso.style.width = `${tiempoPorcentaje}%`;
            }, 100);
        } else {
            playBtn.value = 'PLAY';
            clearInterval(intervalo);
            reproductor.pause();
        }
    } 
}


function siguienteCancionAutomatica(){
    let cancion = cancionActual.innerText;
    let siguienteCancion = "";
    let tituloCancion = "";
    for(let i = 0; i < state.data.length; i++){
        if(cancion === state.data[i].cancion){
            if(i === state.data.length - 1){
                siguienteCancion = state.data[0].ruta;
                tituloCancion = state.data[0].cancion;
                cancionActual.innerText = tituloCancion;
            } else {
                siguienteCancion = state.data[i + 1].ruta;
                tituloCancion = state.data[i + 1].cancion;
                cancionActual.innerText = tituloCancion;
            }
           
        }
    }

    reproductor.src = siguienteCancion;
    reproductor.play();
}


//Función que añade los event listeners a los títulos de las canciones para que al pinchar sobre una canción
//el reproductor capture el título y coja la ruta de la canción elegida
//El primer parámetro es el de el array de los títulos de las canciones.
//El segundo es el del elemento html en el que se guarda la canción.
function seleccionCancion(arrayTitulos, cancionActual){
    arrayTitulos.forEach(titulo => {
        titulo.addEventListener("click", () => {
            let nombre = titulo.innerText;
            playBtn.value = 'PLAY';
            state.isPlaying = false;
            cancionActual.innerText = nombre;
            const cancionElegida = state.data.filter(cancion => cancion.cancion === cancionActual.innerText);
            const rutaCancionElegida = cancionElegida[0].ruta;
            reproductor.src = rutaCancionElegida;   
        })
    });
}


//funcion que muestra un mensaje de error en el caso de que una canción no haya sido seleccionada
function mensajeError(){
    const div = document.createElement('div');
    div.innerHTML = "<h2 class='text-danger'> Seleccione una canción, por favor </h2>";
    cancionActual.parentElement.appendChild(div);
    setTimeout(() => {
        div.remove();
    }, 2000);
}

function controlVolumen(){
    if(this.textContent === '+'){
        if(reproductor.volume < 1){
            reproductor.volume += 0.1;
        }
    } else if(this.textContent === '-') {
        if(reproductor.volume > 0.1){
            reproductor.volume -= 0.1;
        }
    }
}
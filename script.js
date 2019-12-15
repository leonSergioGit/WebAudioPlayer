//Declaración de las variables de los elementos del DOM
const playBtn = document.querySelector("#play");
const songContainer = document.querySelector(".cancionesNombres");
const reproductor = document.querySelector("#rep");
const cancionActual = document.querySelector('.cancionActual');
const barraProgreso = document.querySelector('.progress-bar');
const subirVol = document.querySelector('.subirVol');
const bajarVol = document.querySelector('.bajarVol');
const progresoActual = document.querySelector('.span1');
const tiempoRestante = document.querySelector('.span2');
const slider = document.querySelector('#myRange');
const nextSong = document.querySelector('#next');
const prevSong = document.querySelector('#previous');
const stop = document.querySelector('#stop');

//Declaración de la variable que servirá como intervalo para controlar el tiempo de la canción
let intervaloProgreso;



//Objeto que funcionará como estado para controlar la aplicación
let state = {
    isPlaying: false,   //Booleano que nos sirve para controla el botón play/pause
    data: [],    //Array en el que guardamos el array extraído del json
    minutos: 0,
    segundos: 0,
    duracionTotal: 0,
    segundosRestantes: 0,
    minutosRestantes: 0,
    tiempoRestante: 0
}


/************  EVENT LISTENERS ***********/

//Event listener que obtiene los títulos de las canciones del musica.json al cargar la página
window.addEventListener("load", cargarCanciones);

//Event listener del botón play/pause
playBtn.addEventListener("click", playPauseCancion);

//Evento que detecta si una canción termina e inicializa la siguiente canción
reproductor.addEventListener("ended", siguienteCancionAutomatica);

//Evento que nos permite controlar el tiempo en caso de que avancemos o retrocedamos
reproductor.addEventListener("playing", () => {
    let tiempoRestante = reproductor.duration - reproductor.currentTime;
    if(tiempoRestante >= 60){
        state.minutosRestantes = parseInt(tiempoRestante / 60);
        state.segundosRestantes = parseInt(tiempoRestante % 60);
    } else if(tiempoRestante < 60){
        state.minutosRestantes = 0;
        state.segundosRestantes = parseInt(tiempoRestante);
    }

    state.segundos = parseInt(reproductor.currentTime % 60);
    if(reproductor.currentTime >= 60){
        state.minutosRestantes = parseInt(reproductor.currentTime / 60);
        state.segundos = parseInt(reproductor.currentTime % 60);
    } else {
        state.minutos = 0;
        state.segundos = parseInt(reproductor.currentTime);
    }

})

//Evento para el stop de na canción
stop.addEventListener('click', () => {
    if(typeof intervalo != 'undefined') clearInterval(intervalo);
    reproductor.pause();
    avanceBarra();
    reproductor.currentTime = 0;
    playBtn.value = 'PLAY';
    state.segundos = 0;
    state.minutos = 0;
    state.isPlaying = false;
})

//Siguiente y anterior
nextSong.addEventListener('click', siguienteCancionAutomatica);
prevSong.addEventListener('click', cancionAnterior);


//Control del volumen
subirVol.addEventListener("click", controlVolumen);
bajarVol.addEventListener("click", controlVolumen);

slider.addEventListener('change', controlSlider)


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

//Función que hace un toggle del boton play/pausa
function playPauseCancion(){
    state.segundosRestantes = 0;
    state.minutosRestantes = 0;
    if(cancionActual.innerText === ""){
        mensajeError();
    } else {
        state.isPlaying  = !state.isPlaying;
        if(state.isPlaying){
            playBtn.value = 'PAUSE';
            reproductor.play();
            avanceBarra();
        } else {
            playBtn.value = 'PLAY';
            clearInterval(intervalo);
            reproductor.pause();
        }
    } 
}


//Función que controla el tiempo de la canción y lo muestra en pantalla
function avanceDelTiempo(){
    if(state.isPlaying){
        state.segundos++;
        if(state.segundos >= 60){
            state.minutos++;
            state.segundos = 0;
        } 
    }

   state.tiempoRestante = parseInt(reproductor.duration - reproductor.currentTime);
   if(state.tiempoRestante > 59){
       state.minutosRestantes = parseInt(state.tiempoRestante / 60);
       state.segundosRestantes = parseInt(state.tiempoRestante % 60);
   } else if(state.tiempoRestante < 60){
       state.minutosRestantes = 0;
       state.segundosRestantes = state.tiempoRestante;
   }

    let auxiliarSegundos = state.segundos < 10 ? 0 : "";
    let auxSegRest = state.segundosRestantes < 10 ? 0 : "";
    progresoActual.innerHTML = `0${state.minutos}:${auxiliarSegundos}${state.segundos}`;
    tiempoRestante.innerHTML = `0${state.minutosRestantes}:${auxSegRest}${state.segundosRestantes}`;
}

//Función para la funcionalidad de la barra
function avanceBarra(){
    if(typeof intervalo != 'undefined') clearInterval(intervalo);
    intervalo = setInterval(()=>{
        let tiempoActual = parseInt(reproductor.currentTime);
        let tiempoPorcentaje = (tiempoActual * 100) /reproductor.duration;
        barraProgreso.style.width = `${tiempoPorcentaje}%`;
        slider.value = tiempoPorcentaje;
        avanceDelTiempo();
    }, 1000);
}

//Función que inicializa la siguiente canción de forma automática o cuando le damos al botoón siguiente
function siguienteCancionAutomatica(){
    state.isPlaying = true;
    state.segundos = 0;
    state.minutos = 0;
    state.segundosRestantes = 0;
    state.minutosRestantes = 0;
    clearInterval(intervalo);
    avanceBarra();
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

//Función que inicializa la anterior canción de forma automática o cuando le damos a anterior.
function cancionAnterior(){
    state.isPlaying = true;
    state.segundos = 0;
    state.minutos = 0;
    state.segundosRestantes = 0;
    state.minutosRestantes = 0;
    clearInterval(intervalo);
    avanceBarra();
    let cancion = cancionActual.innerText;
    let siguienteCancion = "";
    let tituloCancion = "";
    for(let i = 0; i < state.data.length; i++){
        if(cancion === state.data[i].cancion){
            if(i === 0){
                siguienteCancion = state.data[state.data.length - 1].ruta;
                tituloCancion = state.data[state.data.length - 1].cancion;
                cancionActual.innerText = tituloCancion;
            } else {
                siguienteCancion = state.data[i - 1].ruta;
                tituloCancion = state.data[i - 1].cancion;
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
            if(typeof intervalo != 'undefined') clearInterval(intervalo);
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

function controlSlider() {
    let sliderP = this.value;
    let segundos = 0;
    let min = (this.value * reproductor.duration) / 100;
    reproductor.currentTime = min;
 
    if(min >= 60){
        state.minutos = parseInt(min / 60);
        state.segundos = parseInt(min % 60);
    } else if( min < 60){
        state.minutos = 0;
        state.segundos = parseInt(min);
    }
 }
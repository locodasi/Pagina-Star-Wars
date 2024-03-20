const imageFilms = {
    1: "./extras/newHope.jpg",
    2: "./extras/contrataca.jpg",
    3: "./extras/retunJedi.jpg",
    4: "./extras/fantasma.jpeg",
    5: "./extras/clones.jpg",
    6: "./extras/sith.jpg"
}

let films = []

let filmParaMostrar;

// Ventana modal
const modal = document.getElementById("ventanaModal");
let filmId;
let modalId;

//Funciones genericas
const crearDatoElement = (titulo, dato) => {
    const p = document.createElement("p")
    p.innerHTML = `<b>${titulo}:</b> ${dato}`
    return p
}

const vaciarElemento = e => {
    e.innerHTML = ""
}

const getIdFromUrl = url => {
    const aux = url.split("/")
    return aux[aux.length - 2]
}

const invertirHidden = element => {

    if(element.getAttribute("hidden")){
        element.removeAttribute("hidden")
    }else{
        element.setAttribute("hidden","true")
    }
}

const variosAppendChild = (padre, hijos) => {
    const fragment = document.createDocumentFragment()
    for(const hijo of hijos){
        fragment.appendChild(hijo)
    }
    padre.appendChild(fragment)
}

//Fin de funciones genericas

const createImgYTecnicData = () => {

    const filmdiv = document.getElementById("film")
    vaciarElemento(filmdiv)

    const img = document.createElement("img")
    img.setAttribute("src",filmParaMostrar.image)
    img.setAttribute("alt",filmParaMostrar.title)

    const episodeInfo = document.createElement("i")
    episodeInfo.classList.add("episodeInfo")
    episodeInfo.textContent = filmParaMostrar.opening_crawl

    const div = document.createElement("div")
    div.classList.add("tecnicData")

    const p1 = crearDatoElement("Director",filmParaMostrar.director)
    const p2 = crearDatoElement("Productor",filmParaMostrar.producer)
    const p3 = crearDatoElement("Estreno",filmParaMostrar.release_date)

    variosAppendChild(div, [p1,p2,p3])
    variosAppendChild(filmdiv, [img,episodeInfo,div])

}



const getPages = values => {
    const ids = values.map(getIdFromUrl) 

    const pages = []
    for(let id of ids){
        let page;

        page = Math.ceil(id/10)
        
        if(!pages.includes(page)) pages.push(page)
    }
    return pages;
}

const getRealValuesWithPages = async (pages, baseUrl, values) => {
    const url = baseUrl + "/?page="

    const realValues = []
    for(let page of pages){
        try {
            const results = await axios(url + page)
            const data = results.data.results
            for(let element of data){
                if(values.includes(element.url)){
                    realValues.push(element)
                }
            }
        } catch (error) {
            console.log("Error en getRealValuesWithPages");
        }
        
    }

    return realValues
}

const getRealValuesWithoutPages = async (baseUrl, values) => {

    const realValues = []
    let url = baseUrl

    while(url){
        const results = await axios(url)
        const data = results.data.results
        url = results.data.next
        for(let element of data){
            if(values.includes(element.url)){
                realValues.push(element)
            }
        }
    }

    return realValues
}

const abrirModal = () => {

    modal.style.display = "block";
    // Si el usuario hace click fuera de la ventana, se cierra.
    window.addEventListener("click",function(event) {
        if (event.target == modal) {
        modal.style.display = "none";
        }
    });
    const span = document.getElementsByClassName("cerrar")[0];
    // Si el usuario hace click en la x, la ventana se cierra
    span.addEventListener("click",function() {
        modal.style.display = "none";
    });
}

const getDataFromURL = async url => {
    const data = await axios(url)
    return data.data.name
} 

const llenarModal = async(url) => {
    const aux = url.split("/")
    modalId = aux[aux.length - 3] + "/" + aux[aux.length - 2]

    const auxModalId = modalId 


    const res = await axios(url)
    const data = res.data;

    document.getElementById("tituloModal").innerText = data.name

    const infoDiv = document.getElementById("infoDiv")
    vaciarElemento(infoDiv)

    const fragment = document.createDocumentFragment()

    const datosParaElFinal = []

    for(let dataParticular in data){
        if(["films", "created", "edited", "name", "url"].includes(dataParticular)) continue
        if(data[dataParticular].length === 0) continue
        if(Array.isArray(data[dataParticular])) {
            datosParaElFinal.push(dataParticular)
            continue
        }

        let p;
        if(data[dataParticular].startsWith("https")){
            p = crearDatoElement(dataParticular, await getDataFromURL(data[dataParticular]) )
        }else{
            p = crearDatoElement(dataParticular, data[dataParticular])
        }
        
        fragment.appendChild(p)
    }

    for(const atributo of datosParaElFinal){
        const datos = data[atributo]
        const span = document.createElement("span")
        span.innerHTML = `<b>${atributo}:</b>`
        for(const dato of datos) {
            span.innerHTML += `<p>${await getDataFromURL(dato)}</p>`
        }

        fragment.appendChild(span)
    }

    if(auxModalId === modalId) infoDiv.appendChild(fragment)
}

const mostrarDataDelDetalle = async url => {
    await llenarModal(url)
    abrirModal()
}

const createDataCard = (realValues) => {
    const fragment = document.createDocumentFragment();
    for(let value of realValues){
        const p = document.createElement("p")
        p.innerText = value.name

        p.addEventListener("click", () => mostrarDataDelDetalle(value.url) )
        fragment.appendChild(p)
    }

    return fragment
}

const createCards = async atributo => {
    const values = filmParaMostrar[atributo];

    const divCard = document.createElement("div")
    divCard.classList.add("card")

    if(atributo === "characters") divCard.classList.add("personajes")

    const nameAtributoElement = document.createElement("b")
    nameAtributoElement.innerHTML = `<u>${atributo}:</u>` 
    divCard.appendChild(nameAtributoElement)

    const divdata = document.createElement("div")
    divdata.classList.add("data")    

    const baseUrl = atributo === "characters" ? "https://swapi.dev/api/people" : "https://swapi.dev/api/" + atributo

    let realValues;
    if(atributo === "starships" || atributo === "vehicles"){
        realValues = await getRealValuesWithoutPages(baseUrl, values)
    }else{
        const pages = getPages(values)

        realValues = await getRealValuesWithPages(pages, baseUrl,values)
    }

    const fragment = createDataCard(realValues);

    divdata.appendChild(fragment)

    divCard.appendChild(divdata)

    return divCard
}

const invertirHiddensDePags = () => {
    invertirHidden(document.getElementById("filmPage"))
    invertirHidden(document.getElementById("filmsPage"))
}

const createCardsFromFilm = async (id) => {
    const cards = document.getElementById("cards")
    vaciarElemento(cards)

    const cardsElemets = []
    
    cardsElemets.push(await createCards("characters"))
    cardsElemets.push(await createCards("planets"))
    cardsElemets.push(await createCards("starships"))
    cardsElemets.push(await createCards("vehicles"))
    cardsElemets.push(await createCards("species"))

    if(id === filmId){
        variosAppendChild(cards, cardsElemets)
    }

}

const crearHtmlParaPeli = async () => {
    const id = filmId;
    invertirHiddensDePags()

    document.getElementById("back").addEventListener("click", invertirHiddensDePags)

    const title = document.createElement("h2")
    title.setAttribute("id","title")

    title.innerText = filmParaMostrar.title

    const header = document.getElementById("pageHeader")
    vaciarElemento(header)
    header.appendChild(title)

    createImgYTecnicData();

    createCardsFromFilm(id)
}

const eventosDeBotonesDeOrdenar = () => {
    document.getElementById("episode").addEventListener("click",()=>{
        //Ordenar por espidosio
        films.sort((a,b)=> a.episode_id - b.episode_id)

        crearHtmlPelis()
    })

    document.getElementById("date").addEventListener("click",()=>{
        //Ordenar por fecha de lanzamiento
        films.sort((a,b)=> Date.parse(a.release_date) - Date.parse(b.release_date))

        crearHtmlPelis()
    })
}

const createElementFilmCard = film => {
    const filmElement = document.createElement("div")
    filmElement.classList.add("film")

    const principalDataElement = document.createElement("div")
    principalDataElement.classList.add("parincipalData")
    
    const h3Element = document.createElement("h3")
    h3Element.innerText = film.title

    const imgElement = document.createElement("img")
    imgElement.setAttribute("src",film.image)
    imgElement.setAttribute("alt",film.title)

    const episodeInfoElement = document.createElement("div")
    episodeInfoElement.classList.add("espisodeInfo")

    const pFecha = crearDatoElement("Fecha de lanzamiento",film.release_date)

    const pEpisode = crearDatoElement("Episodio",film.episode_id)

    variosAppendChild(episodeInfoElement, [pFecha,pEpisode])

    variosAppendChild(principalDataElement, [h3Element,imgElement,episodeInfoElement])


    filmElement.addEventListener("click", () => {
        filmParaMostrar = film;
        filmId = getIdFromUrl(film.url)
        crearHtmlParaPeli();
    })

    filmElement.appendChild(principalDataElement)

    return filmElement
}

const crearHtmlPelis = () => {
    const fragment = document.createDocumentFragment();

    const filmsElement = document.querySelector(".films")
    vaciarElemento(filmsElement)

    for(let film of films) {
        const filmElement = createElementFilmCard(film)

        fragment.appendChild(filmElement)
        /*<div class="film">
            <div class="principalData">
                <h3>A New Hope</h3>
                <img src="./extras/newHope.jpg" alt="A new Hope">
                <div class="episodeInfo">
                    <p><b>Fecha de lanzamiento:</b> 1982-22-22</p>
                    <p><b>Episodio:</b> 4</p>
                </div>
            </div>
        </div>*/
    }

    filmsElement.appendChild(fragment)
}

const obtenerPeliculas = async () => {
    const data = await axios("https://swapi.dev/api/films");
    films = data.data.results.map((e,i) => {
        e.image = imageFilms[i+1]
        e.id = i+1
        return e
    });
    crearHtmlPelis()

}



eventosDeBotonesDeOrdenar()
obtenerPeliculas();
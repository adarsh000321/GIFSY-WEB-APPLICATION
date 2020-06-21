
document.querySelector("#date").textContent=timeConverter(unix_time);
const limit = 6;
let URL=`${window.location.origin}/random?q=${search}&limit=${limit}`;
const gifContainer = document.querySelector(".gif-container");
let tenor_ids=0;



loadContent();

function timeConverter(UNIX_timestamp){
    const a = new Date(UNIX_timestamp * 1000);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const year = a.getFullYear();
    const month = months[a.getMonth()];
    const date = a.getDate();
    const hour = a.getHours();
    const min = a.getMinutes();
    const sec = a.getSeconds();
    const time = date + ' ' + month + ' ' + year ;
    return time;
}

function loadContent(){
    fetch(URL)
    .then(response=>response.json())
    .then(result=>{
        result = result.results;
        result.forEach(gif=>{
            const gifInfo = {
                created:gif.created,
                url:gif.media[0].mediumgif.url,
                dims:gif.media[0].mediumgif.dims,//array (x*y form)
            };
            sessionStorage.setItem(`tenor-${tenor_ids}`,JSON.stringify(gifInfo));// storing gif data in sessionStorage for show page
            const div = document.createElement("div");
            div.setAttribute("id",`tenor-${tenor_ids}`); //form of ids tenor-0,tenor-1...
            div.className="col-lg-12 col-md-6";
            const img = document.createElement("img");
            img.className="rounded coloumn";
            const gifUrl = gif.media[0].tinygif.url;
            img.setAttribute("src",gifUrl);
            div.appendChild(img);
            gifContainer.appendChild(div);
            document.querySelector(`#tenor-${tenor_ids}`).addEventListener("click",function(){
                const parsedGif = JSON.parse(sessionStorage.getItem(this.id)); // get data from session
                //create form and post data on click
                const form = document.createElement("form");
                form.action = `${window.location.origin}/show-tenor-gif`;
                form.method = "POST";
                for(const key in parsedGif){
                    const input = document.createElement("input");
                    input.type="text";
                    input.name=key;
                    input.value=parsedGif[key];
                    form.appendChild(input);
                }
                //search field
                const input = document.createElement("input");
                input.type="text";
                input.name="search";
                input.value=search;
                form.appendChild(input);
                
                document.querySelector("body").appendChild(form);
                form.submit();//submit form
            });
            document.querySelector(`#tenor-${tenor_ids}`).addEventListener('contextmenu', event => event.preventDefault());
            tenor_ids++;
        });

    });
}
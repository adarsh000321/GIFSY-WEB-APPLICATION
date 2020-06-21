document.querySelector(".share-url").textContent=window.location.href;
const editBtn = document.querySelector("#edit");
const limit = 6;
let URL=`http://localhost:8080/random?q=${search}&limit=${limit}`;
const gifContainer = document.querySelector(".gif-container");
let tenor_ids=0;


loadContent();

editBtn.addEventListener("click",(e)=>{
    e.preventDefault();
    const gifDetails = document.querySelector(".gif-details");
    gifDetails.innerHTML = `<div class="edit-form" style="line-height: 2.5rem; max-width: 400px;">
                            <form action="/gif/${name}?_method=PATCH" method="POST">
                                <div class="form-group">
                                    <label for="title">Title</label>
                                    <input type="text" value="${title}" name="title" required id="title" class="form-control" placeholder="Title">
                                <div>
                                <div class="form-group">
                                    <label for="keyword">Keywords</label>
                                    <input type="text" value="${keywords}" name="keywords" id="keyword" class="form-control" placeholder="Keywords (,) separated">
                                <div>
                                <input type="submit" value="submit" class="btn btn-primary edit-form-btn" style="margin-top:10px">
                            </form>
                            </div>`;
});

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
                form.action = "http://localhost:8080/show-tenor-gif";
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

document.getElementById("date").textContent=getDate(date);

function getDate(date){
    const d=new Date(date);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return d.getDate()+" "+months[d.getMonth()]+" "+d.getFullYear();
}
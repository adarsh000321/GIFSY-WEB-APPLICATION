const search = document.querySelector("#search-term").getAttribute("data-search");
let skip = 0; //only for db
const gifContainer = document.querySelector(".gif-container");// contains all gifs
const loadMore = document.querySelector("#loadMore"); //loading gif
const limit = 50;
const URLTenor =  `http://localhost:8080/get-more?q=${search}&limit=${limit}&`;
const URLGifsy = `http://localhost:8080/searchdb?search=${search}&limit=${limit}&`;
let URL;
let loading = false;
let next;//4
let db_ids = 0;
let tenor_ids=0;


if(server==="TENOR"){
    URL=URLTenor;
    loadContent();
}else {
    URL=URLGifsy;
    loadDB();
}




document.addEventListener("scroll",()=>{
    const rect = loadMore.getBoundingClientRect();//3
    //1
    if(rect.top<window.innerHeight && !loading){//2
        if(server==="TENOR"){
            loadContent();
        }else{
            loadDB();
        }
    }
    // console.log(rect);
});



function loadContent(){
    loading=true;
    fetch(`${URL}${next?"next="+next:""}`)
    .then(response=>response.json())
    .then(result=>{
        next=result.next;//update next
        result = result.results;
        result.forEach((gif)=>{
            const gifInfo = {
                created:gif.created,
                url:gif.media[0].mediumgif.url,
                dims:gif.media[0].mediumgif.dims,//array (x*y form)
            };
            sessionStorage.setItem(`tenor-${tenor_ids}`,JSON.stringify(gifInfo));// storing gif data in sessionStorage for show page
            const div = document.createElement("div");
            div.setAttribute("id",`tenor-${tenor_ids}`); //form of ids tenor-0,tenor-1...
            div.className="col-lg-3 col-md-4 col-sm-6";
            const img = document.createElement("img");
            img.className="rounded";
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
        loading=false;
    });
}

function loadDB(){
    loading=true;
    fetch(`${URL}skip=${skip}`)
    .then(response=>response.json())
    .then(result=>{
        result.forEach((gif)=>{
            const div = document.createElement("div");
            const a = document.createElement("a");
            a.setAttribute("id",`db-${db_ids}`); // form of ids = db-0,db-1...
            div.className="col-lg-3 col-md-4 col-sm-6 card";
            const img = document.createElement("img");
            const gifUrl = `http://localhost:8080/gif/${gif.name}`;
            img.setAttribute("src",gifUrl);
            img.className="rounded img-thumbnail";
            // img.style="max-width:300px; margin-right:10px";
            a.appendChild(img);
            a.href=`http://localhost:8080/show/gif/${gif.name}`;
            div.appendChild(a);
            gifContainer.appendChild(div);
            // // querySelector cannot select element with id, starting with a number
            // document.querySelector(`#db-${db_ids}`).addEventListener("click",()=>{  
            //     window.location=;
            // });
            db_ids++;
        });
        loading=false;
        skip+=limit;
    });
}

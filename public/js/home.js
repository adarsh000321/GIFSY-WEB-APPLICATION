
const URL =  `https://${window.location.host}/get-more`;
const gifContainer = document.querySelector(".gif-container");// contains all gifs
const loadMore = document.querySelector("#loadMore"); //loading gif
const limit = 50;
let loading = false;
let next;//4
let tenor_ids=0; // tenor ids

loadContent();
document.addEventListener("scroll",()=>{
    const rect = loadMore.getBoundingClientRect();//3
    //1
    if(rect.top<window.innerHeight && !loading){//2
        loadContent();
    }
    // console.log(rect);
});


function loadContent(){
    loading=true;
    fetch(`${URL}?limit=${limit}&${next?"next="+next:""}`)
    .then(response=>response.json())
    .then(result=>{
        next=result.next;//update next
        result = result.results;
        result.forEach((gif)=>{
            //store this in session
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
                form.action = `https://${window.location.host}/show-tenor-gif`;
                form.method = "POST";
                for(const key in parsedGif){
                    const input = document.createElement("input");
                    input.type="text";
                    input.name=key;
                    input.value=parsedGif[key];
                    form.appendChild(input);
                }
                document.querySelector("body").appendChild(form);
                form.submit();//submit form
            });
            document.querySelector(`#tenor-${tenor_ids}`).addEventListener('contextmenu', event => event.preventDefault());
            tenor_ids++;
        });
        loading=false;
    });
}








//1. avoiding multiple function calls
//2. top reduces as we go down and starts its visibility as (approx)window.innerHeight
//3. returns size and relative positon
//4. used in getting gifs from where we left
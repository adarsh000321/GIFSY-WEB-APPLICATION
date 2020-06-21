
const limit = 6;
const skip = page*limit-limit;
const gifContainer = document.querySelector(".gif-container");

loadMore();

function visitPrev(){
    const prev = Math.max(1,page-1);
    if(prev===page)return;
    window.location=`http://localhost:8080/gif/show-all/${username}/${prev}`;
}
function visitNext(){
    const next = page + 1;
    window.location=`http://localhost:8080/gif/show-all/${username}/${next}`;
}

 function loadMore(){
    fetch(`http://localhost:8080/gif-json/${username}?limit=${limit}&skip=${skip}`)
    .then(res=>res.json())
    .then(gifs=>{
        if(gifs.length==0 && page!==1){
            window.location=`http://localhost:8080/gif/show-all/${username}/1`;
            return;
        }
        gifs.forEach((gif)=>{
            const div = document.createElement("div");
            const img = document.createElement("img");
            img.setAttribute("src",`/gif/${gif.name}`);
            img.className="card-img-top";
            div.appendChild(img);
            div.className="col-lg-4 col-md-4 col-sm-6 card";
            const a =document.createElement("a");
            a.textContent="Show";
            a.className = "btn btn-primary show-btn";
            const div_card_body = document.createElement("div");
            div_card_body.className="card-body text-center";
            div_card_body.appendChild(a);
            a.setAttribute("href",`/show/gif/${gif.name}`);
            div.appendChild(div_card_body);
            gifContainer.appendChild(div);
        });
    });
} 
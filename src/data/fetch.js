const got = require("got");

const KEY = process.env.TENOR_KEY;



async function get(limit,pos,search){
    try{
        const url=`https://api.tenor.com/v1/${!search?"trending":"search?q="+encodeURIComponent(search)}?key=${KEY}&limit=${limit}&${pos?"pos="+pos:""}`;
        const res = await got(url);
        return res.body;
    }catch(e){
        throw new Error(e);
    }
}

async function random(search="excited",limit){
    try{
        const url=`https://api.tenor.com/v1/random?limit=${limit}&q=${encodeURIComponent(search)}&key=${KEY}`;
        const res = await got(url);
        return res.body;
    }catch(e){
        throw new Error(e);
    }
}



module.exports = {
    get:get,
    random:random
};

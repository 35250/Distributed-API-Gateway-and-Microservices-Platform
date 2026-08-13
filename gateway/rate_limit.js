const { createClient } = require("redis");
const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.on("error", (err) => {
    console.error("Redis Client Error:", err);
});

async function connectRedis() {
    await redisClient.connect();
    console.log("Gateway connected to Redis");
}

async function rateLimit(ip){
    try{
        const key= `rate_limit:${ip}`;
        const count= await redisClient.incr(key);

        if(count == 1){
            await redisClient.expire(key, 60);
        }

        if(count > 100){
            return{
                withinLimit: false
            }
        }

        return{
            withinLimit: true
        }
    
    } catch {
        console.log("Rate limiter logic failed!");
    }
};

module.exports = {
    connectRedis,
    rateLimit
}

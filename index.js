const Twit = require('twit');
const config = require('./config');
const fs = require('fs');
let products;

const T = new Twit(config.twitConfig);
const tweetStream = T.stream('statuses/filter', {
    track: '#'
});
const userStream = T.stream('user');

fs.readFile('./products.json', 'utf8', (err, data) => {
    if (err) throw err;
    products = JSON.parse(data);
    tweetStream.on('tweet', tweet => {
        let productUrls = [];
        let name = tweet.user.name;
        let screenName = tweet.user.screen_name;
        tweet.entities.hashtags.forEach(tag => {
            products.forEach(product => {
                let index = product.keywords.indexOf(tag.text);
                if (index >= 0) {
                    productUrls.push(product.url);
                }
            });
        });
        if (productUrls.length > 0) {
            let urls = productUrls.join(", ");
            tweetIt({status:`Hi @${screenName}, Visit these links ${urls}`});
        }
    });

    userStream.on('tweet', (event) => {
        let productUrls = [];
        let replyTo = event.in_reply_to_screen_name;
        let name = event.user.name;
        let screenName = event.user.screen_name;
        event.entities.hashtags.forEach(tag => {
            products.forEach(product => {
                let index = product.keywords.indexOf(tag.text);
                if (index >= 0) {
                    productUrls.push(product.url);
                }
            });
        });
        if (productUrls.length > 0) {
            if(replyTo === config.botUser){
                let urls = productUrls.join(", ");
                tweetIt({
                    status:`Hi @${screenName}, Visit these links ${urls}`,
                    in_reply_to_status_id: '' + event.id_str
                });
            }
        }
    })
});

const tweetIt = (res) => {
    T.post('statuses/update', res, (err, data, response) => {
        console.log(data);
    });
}

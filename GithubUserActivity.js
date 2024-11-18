const http = require("http");

function fetchGithubUserActivity(username) {
    const url = `https://api.github.com/users/${username}/events`;

    const options = {
        method: 'GET',
        headers: {
            'User-Agent': 'github-activity-cli',
        },
    };

    const req = http.request(url, options ,(res)=>{
        let data = ''
        if (res.statusCode === 200) {
            console.log(res.statusMessage);
            process.exit()
        }
        else if (res.statusCode === 404) {
            console.log(res.statusMessage);
            process.exit()
        }

        res.on('data', (chunk)=>{
            data += chunk;
        })

        res.on('end', (chunk)=>{
            console.log('full response received ' + data)
            try{
                const events = JSON.parse(data)
                if (events.length === 0){
                    console.log("No activity found")
                    return
                }
                //TODO call a function
            }catch (e) {

            }
        })

        res.on('error', (err) => {
            console.error('Error:', err);
        })

    })
}
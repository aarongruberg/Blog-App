import express from "express";
import bodyParser from "body-parser";
import _ from 'lodash';

const app = express();
const port = 3000;

const homeContent = "Lorem Ipsum"
const previewContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua..."

// Set static directories for "/" and "/posts" routes
app.use('/', express.static("public/"));
app.use('/posts', express.static('public'))

app.use(bodyParser.urlencoded({ extended: true}));

var postsArray = [];

// Date and time
let date = '';
let time = '';

// Path for display image
let imagePath = '';

// Homepage route
app.get("/", (req, res) => {
    res.render("index.ejs", {homeContent: homeContent,
         previewContent: previewContent,
         postsArray: postsArray});
         console.log(postsArray);
});

// Compose a blog post
app.post("/compose", (req, res) => {
    res.render("create.ejs");
  });

// Submit your blog post
app.post("/submit", (req, res) => {

    time = new Date().toLocaleTimeString('default', {timeStyle: 'short'});
    date = new Date().toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric'});

    imagePath = 'images/rex.jpeg'

    const post = [
        req.body["title"],
        req.body["content"],
        req.body["your-name"],
        time,
        date,
        imagePath
    ];
    postsArray.push(post);
    res.redirect("/");
});

// Navigate to a specific blog post
app.get("/posts/:test", (req, res) => {
    
    // Convert url input text to lowercase using Lodash
    const requestedTitle = _.lowerCase(req.params.test);

    // Convert postArray title to lowercase using Lodash
    if (postsArray != undefined) {
        for (let i = 0; i < postsArray.length; i++) {

            // Keep original title to pass to post.ejs file
            const title = postsArray[i][0];

            // Author name
            const author = postsArray[i][2];

            // Convert title to lower case
            postsArray[i][0] =  _.lowerCase(postsArray[i][0]);

            console.log(postsArray[i][0]);
            console.log(requestedTitle);

             // Check if postsArray includes the requestedTitle
            if (postsArray[i][0].includes(requestedTitle)) {

                //console.log("match found");

                // Send user to selected post
                res.render("post.ejs", {
                    title: title, 
                    content: postsArray[i][1],
                    author: author,
                    time: postsArray[i][3],
                    date: postsArray[i][4],
                    imagePath: postsArray[i][5]
                });
            }
          }
        
    }

});

//Run app
app.listen(port, () => {
    console.log("Server is running on port " + port);
});


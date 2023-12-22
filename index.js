import express from "express";
import bodyParser from "body-parser";
import _ from 'lodash';

const app = express();
const port = 3000;

const homeContent = "Lorem Ipsum"
const previewContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua..."

app.use(express.static("public/"));
app.use(bodyParser.urlencoded({ extended: true}));

var postsArray = [];

// Homepage route
app.get("/", (req, res) => {
    res.render("index.ejs", {homeContent: homeContent,
         previewContent: previewContent,
         postsArray: postsArray});
         //console.log(postsArray);
});

// Compose a blog post
app.post("/compose", (req, res) => {
    res.render("create.ejs");
  });

// Submit your blog post
app.post("/submit", (req, res) => {
    const post = [
        req.body["title"],
        req.body["content"]
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
                    content: postsArray[i][1]
                });
            }
          }
        
    }

});

//Run app
app.listen(port, () => {
    console.log("Server is running on port " + port);
});


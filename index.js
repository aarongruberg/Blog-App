import express from "express";
import bodyParser from "body-parser";
import _ from 'lodash';
import fileUpload from 'express-fileupload';

const app = express();
const port = 3000;

const homeContent = "Horn Miller"
const previewContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua..."

// Use the express-fileupload middleware
app.use(fileUpload());

// Set static directories for "/" and "/posts" routes
app.use('/', express.static("public/"));
app.use('/posts', express.static('public'))

app.use(bodyParser.urlencoded({ extended: true, limit: '2000kb'}));

var postsArray = [];
var featured = 0;
var oldFeatured = 0;

// Date and time
let date = '';
let time = '';

// Path for display image
let imagePath = '';

// Homepage route
app.get("/", (req, res) => {

   //Set a random post to be featured
   featured = postsArray[Math.floor(Math.random()*postsArray.length)];
   //console.log(featured);

   while (featured === oldFeatured && postsArray.length > 1) {
    featured = postsArray[Math.floor(Math.random()*postsArray.length)];
    }
    //console.log(featured);
    if (featured != undefined) {
        var featuredTitle = featured[0];
        var featuredSubtitle = featured[7];
        var featuredAuthor = featured[2];
        var featuredImage = featured[5];
        //console.log(featuredSubtitle);
        //console.log(featuredAuthor);
    }
    
    res.render("index.ejs", {featuredTitle: featuredTitle,
        featuredSubtitle: featuredSubtitle,
        featuredAuthor: featuredAuthor,
        featuredImage: featuredImage,
         postsArray: postsArray});
         //console.log(postsArray);
         oldFeatured = featured;
});

// Compose a blog post
app.post("/compose", (req, res) => {
    res.render("create.ejs");
  });

// Submit your blog post
app.post("/submit", (req, res) => {

    time = new Date().toLocaleTimeString('default', {timeStyle: 'short'});
    date = new Date().toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric'});

    // log the image file that was uploaded
    //console.log(req.files);

    // Get file that was uploaded to our "image" form field
    const { image } = req.files;

    // Move the uploaded image to our upload folder
    image.mv('public/images/' + image.name);
    
    //imagePath is relatative to public folder
    imagePath = 'images/' + image.name
    //console.log(imagePath);

    const post = [
        req.body["title"],
        req.body["content"],
        req.body["your-name"],
        time,
        date,
        imagePath,
        req.body["category"],
        req.body["subtitle"]
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

            //console.log(postsArray[i][0]);
            //console.log(requestedTitle);

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
                    imagePath: postsArray[i][5],
                    category: postsArray[i][6]
                });
            }
          }
        
    }

});

//Run app
app.listen(port, () => {
    console.log("Server is running on port " + port);
});


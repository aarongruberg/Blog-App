import express from "express";
import bodyParser from "body-parser";
//import _, { result } from 'lodash';
import _ from 'lodash';
import fileUpload from 'express-fileupload';
import pg from "pg";

const { result } = _;
const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "dinocrunch",
  password: "dorian",
  port: 5432
});
db.connect();

// Use the express-fileupload middleware
app.use(fileUpload());

// Set static directories for "/" and other routes
app.use('/', express.static("public/"));
app.use('/posts', express.static('public/'));
app.use('/admin', express.static('public/'));
app.use('/admin/posts', express.static('public/'));
app.use('/categories', express.static('public/'));

app.use(bodyParser.urlencoded({ extended: true, limit: '2000kb'}));

var featured = 0;
var oldFeatured = 0;
var pinned = 0;
let articles = [];
let categories = [];
let articlesInCategory = [];

// Date and time
let date = '';
let time = '';

// Path for display image
let imagePath = '';

// Homepage route
app.get("/", async (req, res) => {
    // Read from db
    try {
        let result = await db.query("select * from articles order by id asc");
        articles = result.rows;
        //console.log(articles);
      }
      catch(err) {
        console.log(err.message);
      }

   //Set a random post to be featured
   featured = articles[Math.floor(Math.random()*articles.length)];
   //console.log(featured);

   while (featured === oldFeatured && articles.length > 1) {
    featured = articles[Math.floor(Math.random()*articles.length)];
    }
    //console.log(featured);
    if (featured != undefined) {
        var featuredTitle = featured.title;
        var featuredSubtitle = featured.subtitle;
        var featuredAuthor = featured.author;
        var featuredImage = featured.image_path;
        //console.log(featuredSubtitle);
        //console.log(featuredAuthor);
    }

    let pinnedArray = [];
    let chosenIndices = new Set();

    //Pin a maximum of 4 random articles
    while (pinnedArray.length < 4 && pinnedArray.length < articles.length) {
        let index = Math.floor(Math.random() * articles.length);
        if (!chosenIndices.has(index)) {
            chosenIndices.add(index);
            pinnedArray.push(articles[index]);
        }
    }
    
    //Get categories from db
    try {
        let result = await db.query("select category from articles");
        categories = result.rows;
        //console.log(categories);
      }
      catch(err) {
        console.log(err.message);
      }
    res.render("index.ejs", {featuredTitle: featuredTitle,
        featuredSubtitle: featuredSubtitle,
        featuredAuthor: featuredAuthor,
        featuredImage: featuredImage,
        pinnedArray: pinnedArray,
        categories: categories,
        articles: articles});
         //console.log(articles);

         oldFeatured = featured;
});

// Admin Homepage
app.get("/admin", async (req, res) => {
    // Read from db
    try {
        let result = await db.query("select * from articles order by id asc");
        articles = result.rows;
        //console.log(articles);
      }
      catch(err) {
        console.log(err.message);
      }

   //Set a random post to be featured
   featured = articles[Math.floor(Math.random()*articles.length)];
   //console.log(featured);

   while (featured === oldFeatured && articles.length > 1) {
    featured = articles[Math.floor(Math.random()*articles.length)];
    }
    //console.log(featured);
    if (featured != undefined) {
        var featuredTitle = featured.title;
        var featuredSubtitle = featured.subtitle;
        var featuredAuthor = featured.author;
        var featuredImage = featured.image_path;
        //console.log(featuredSubtitle);
        //console.log(featuredAuthor);
    }

    let pinnedArray = [];
    let chosenIndices = new Set();

    //Pin a maximum of 4 random articles
    while (pinnedArray.length < 4 && pinnedArray.length < articles.length) {
        let index = Math.floor(Math.random() * articles.length);
        if (!chosenIndices.has(index)) {
            chosenIndices.add(index);
            pinnedArray.push(articles[index]);
        }
    }
    
    //Get categories from db
    try {
        let result = await db.query("select category from articles");
        categories = result.rows;
        //console.log(categories);
      }
      catch(err) {
        console.log(err.message);
      }

    res.render("admin.ejs", {featuredTitle: featuredTitle,
        featuredSubtitle: featuredSubtitle,
        featuredAuthor: featuredAuthor,
        featuredImage: featuredImage,
        pinnedArray: pinnedArray,
        categories: categories,
        articles: articles});
         //console.log(articles);

         oldFeatured = featured;
});

// Compose a blog post
app.post("/admin/compose", async (req, res) => {
    //Get categories from db
    try {
        let result = await db.query("select category from articles");
        categories = result.rows;
        //console.log(categories);
      }
      catch(err) {
        console.log(err.message);
      }
    res.render("create.ejs", {
        categories: categories
    });
  });

// Submit your blog post
app.post("/admin/submit", async (req, res) => {

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

    // Add article to db
    try {
      await db.query("insert into articles (image_path, title, subtitle, article_content, author, category, time, date)"
      + "values ($1, $2, $3, $4, $5, $6, $7, $8)", 
      [imagePath, req.body["title"], req.body["subtitle"], req.body["content"], req.body["your-name"], req.body["category"], time, date]);
      }
      catch(err) {
        console.log(err.message);
      }

    res.redirect("/admin");
});

// Navigate to a specific blog post
app.get("/posts/:test", async (req, res) => {
    //Get categories from db
    try {
        let result = await db.query("select category from articles");
        categories = result.rows;
        //console.log(categories);
      }
      catch(err) {
        console.log(err.message);
      }
    
    // Convert url input text to lowercase using Lodash
    const requestedTitle = _.lowerCase(req.params.test);

    // Convert postArray title to lowercase using Lodash
    if (articles != undefined) {
        for (let i = 0; i < articles.length; i++) {

            // Keep original title to pass to post.ejs file
            const title = articles[i].title;

            // Author name
            const author = articles[i].author;

            // Create a copy of postArray title element and 
            // convert that copy of title to lower case
            var copyTitle = articles[i].title;
            copyTitle =  _.lowerCase(copyTitle);

            //console.log(copyTitle);
            //console.log(requestedTitle);

             // Check if articles includes the requestedTitle
            if (copyTitle.includes(requestedTitle)) {

                //console.log("match found");

                // Send user to selected post
                res.render("post.ejs", {
                    title: title, 
                    content: articles[i].article_content,
                    author: author,
                    time: articles[i].time,
                    date: articles[i].date,
                    imagePath: articles[i].image_path,
                    category: articles[i].category,
                    categories:categories
                });
            }
          }
        
    }

});

//Admin view specific post
app.get("/admin/posts/:test", async (req, res) => {
    //Get categories from db
    try {
        let result = await db.query("select category from articles");
        categories = result.rows;
        //console.log(categories);
      }
      catch(err) {
        console.log(err.message);
      }
    
    // Convert url input text to lowercase using Lodash
    const requestedTitle = _.lowerCase(req.params.test);

    // Convert postArray title to lowercase using Lodash
    if (articles != undefined) {
        for (let i = 0; i < articles.length; i++) {

            // Keep original title to pass to post.ejs file
            const title = articles[i].title;

            // Author name
            const author = articles[i].author;

            // Create a copy of postArray title element and 
            // convert that copy of title to lower case
            var copyTitle = articles[i].title;
            copyTitle =  _.lowerCase(copyTitle);

            //console.log(copyTitle);
            //console.log(requestedTitle);

             // Check if articles includes the requestedTitle
            if (copyTitle.includes(requestedTitle)) {

                //console.log("match found");

                // Send user to selected post
                res.render("admin-post.ejs", {
                    title: title, 
                    content: articles[i].article_content,
                    author: author,
                    time: articles[i].time,
                    date: articles[i].date,
                    imagePath: articles[i].image_path,
                    category: articles[i].category,
                    categories: categories
                });
            }
          }
        
    }

});

//Admin edit a post
app.post("/admin/edit-post", async (req, res) => {
    //Get categories from db
    try {
        let result = await db.query("select category from articles");
        categories = result.rows;
        //console.log(categories);
      }
      catch(err) {
        console.log(err.message);
      }

    //Fetch article from db that matches the current article's title
    let currentTitle = req.body.title;
    let currentArticle = [];
    try {
        let result = await db.query("select * from articles where title = $1", [currentTitle]);
        currentArticle = result.rows;
        //console.log(currentArticle);
      }
      catch(err) {
        console.log(err.message);
      }

    res.render("edit.ejs", {
        currentArticle: currentArticle,
        categories: categories
    });
  });

//Submit an edit
app.post("/admin/submit-edit", async (req, res) => {

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

    // Need to get id of old current title, this is giving the changed current title!!
    let originalTitle = req.body.originalTitle;
    let currentId = 0;
    //console.log(originalTitle);
    try {
        let result = await db.query("select * from articles where title = $1", [originalTitle]);
        if (result.rows.length > 0) {
            currentId = result.rows[0].id;
            //console.log(currentId);
        } else {
            // Handle case where no rows were found (e.g., log a message, set a default value, etc.)
            console.log("No article found with title:", originalTitle);
        }
      }
      catch(err) {
        console.log(err.message);
      }
    
    //Update article where id matches current article's id
    try {
        let result = await db.query("update articles set image_path = $1, title = $2, subtitle = $3, article_content = $4, author = $5, category = $6, time = $7, date = $8 where id = $9", [imagePath, req.body["title"], req.body["subtitle"], req.body["content"], req.body["your-name"], req.body["category"], time, date, currentId]);
      }
      catch(err) {
        console.log(err.message);
      }

    res.redirect("/admin");
});

//Delete an Article
app.post("/admin/delete-post", async (req, res) => {
    //Fetch article from db that matches the current article's title
    let currentTitle = req.body.title;
    let currentId = 0;
    try {
        let result = await db.query("select * from articles where title = $1", [currentTitle]);
        if (result.rows.length > 0) {
            currentId = result.rows[0].id;
            //console.log(currentId);
        } else {
            // Handle case where no rows were found (e.g., log a message, set a default value, etc.)
            console.log("No article found with title:", currentTitle);
        }
      }
      catch(err) {
        console.log(err.message);
      }
    try {
        //Delete the article from db where id matches currentId
        await db.query("delete from articles where id = $1", [currentId]);
    }
      catch(err){
        console.log(err.message);
      }
    res.redirect("/admin");
});

//Select category from menu and view those articles
app.get('/categories/:category', async (req, res) => {
    //Get categories from db
    try {
        let result = await db.query("select category from articles");
        categories = result.rows;
        //console.log(categories);
      }
      catch(err) {
        console.log(err.message);
      }

    // Convert category text from header.ejs form to lowercase using Lodash
    const requestedCategory = _.lowerCase(req.params.category);
    //console.log(requestedCategory);

    // Convert article's category to lowercase using Lodash
    if (articles != undefined) {
        for (let i = 0; i < articles.length; i++) {

            // Keep original category
            let category = articles[i].category;
            //console.log(category);

            // Create a copy of article category element and 
            // convert that copy of title to lower case
            var copyCategory = articles[i].category;
            copyCategory =  _.lowerCase(copyCategory);
            //console.log(copyCategory);

             // Check if articles category includes the requestedCategory
            if (copyCategory.includes(requestedCategory)) {
                //console.log("match found");
                //Get all the articles in selected category
                try {
                    let result = await db.query("select * from articles where category = $1", [category]);
                    articlesInCategory = result.rows;
                    console.log(articlesInCategory);
                  }
                  catch(err) {
                    console.log(err.message);
                  }
            }
          } 
    }
    res.render("category.ejs", {
        featuredTitle: featured.title,
        categories: categories,
        articlesInCategory: articlesInCategory
    });
});


//Run app
app.listen(port, () => {
    console.log("Server is running on port " + port);
});


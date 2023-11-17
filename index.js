import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

const homeContent = "Lorem Ipsum"
const previewContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua..."

app.use(express.static("public/"));
app.use(bodyParser.urlencoded({ extended: true}));

app.get("/", (req, res) => {
    res.render("index.ejs", {homeContent: homeContent, previewContent: previewContent});
});

app.post("/compose", (req, res) => {
    res.render("create.ejs");
  });

app.post("/submit", (req, res) => {
    const title = req.body["title"]
    const post = req.body["post"]
    res.render("index.ejs", {homeContent: homeContent, 
        previewContent: previewContent, title: title, post: post});
});

//Run app
app.listen(port, () => {
    console.log("Server is running on port " + port);
});
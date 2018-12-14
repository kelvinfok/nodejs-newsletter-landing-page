//jshint esversion: 6

const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/signup.html");
});

const API_KEY = "6a17ade70353dff761cc3017da9de5c9-us7";
const LIST_ID = "16ac7e3400";

app.post("/", function(req, res) {

    var firstName = req.body.fName
    var lastName = req.body.lName
    var email = req.body.email

    var data = {
        "members" : [
            {
                email_address : email,
                status : "subscribed",
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName
                }
            }
        ]
    };

    let jsonData = JSON.stringify(data);

    var options = {
        url: "https://us7.api.mailchimp.com/3.0/lists/" + LIST_ID,
        method: "POST",
        headers: {
            "Authorization" : "Bearer " + API_KEY
        },
        body: jsonData
    };

    request(options, function(error, response, body) {
        if (error) {
            res.sendFile(__dirname + "/failure.html")
            // res.send("There was an error with signing up. Please try again.");
            console.log(error);
        } else {
            if (response.statusCode === 200) {
                res.sendFile(__dirname + "/success.html");
            } else {
                res.sendFile(__dirname + "/failure.html");
            }
        }
    })
})

app.get("/records", function(req, res) {

    var options = {
        url: "https://us7.api.mailchimp.com/3.0/lists/" + LIST_ID + "/members",
        method: "GET",
        headers: {
            "Authorization" : "Bearer " + API_KEY
        }
    };

    request(options, function(error, response, body) {
        if (error) {
            res.send("There was an error getting lists." + error);
        } else {
            if (response.statusCode === 200) {

                var result = [];

                let data = JSON.parse(body);
                let members = data.members;

                for (var member of members) {
                    var email = member.email_address;
                    var name = member.merge_fields.FNAME;
                    result.push({name: name, email: email});
                }

                res.contentType('application/json');
                res.send(JSON.stringify(result));
                                
            } else {
                res.send("There was an error getting lists.");
            }
        }
    })
})

app.post("/root", function(req, res) {
    res.redirect("/");
});

app.listen(process.env.PORT || 3000, function() {
    console.log("Server is running on port 3000");
});
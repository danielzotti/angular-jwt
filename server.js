var express = require("express");

var app = express();

const PORT = 5500;

const access_token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZW1haWwuY29tIiwibmFtZSI6Ik15IE5hbWUiLCJpYXQiOjIwMjgyMzkwMjJ9.VY6BpPrJatEA5u719nQAjjGoFYXX3XkH6Rn-m-SR8LE";
const refresh_token = "9c2ce01c-c235-46ca-ae35-6554b2bc402b";

function decodeToken(token) {
  if (!token) {
    return null;
  }
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace("-", "+").replace("_", "/");
  return JSON.parse(window.atob(base64));
}

app.post("/api/auth/login", function (req, res) {
  if (Math.random() > 0.75) {
    res.status(400).send({
      error: 'invalid_grant',
      error_description: 'invalid_grant_full'
    });
    return;
  }
  res.status(200).send({
    access_token: access_token,
    token_type: "bearer",
    expires_in: 59,
    refresh_token: refresh_token
  });
});

app.get("/api/user", function (req, res) {
  if (Math.random() > 0.75) {
    res.statusMessage = "invalid_token";
    res.status(401).send();
    return;
  }
  res
    .status(200)
    .send([{
        id: 1,
        name: "Mario",
        surname: "Rossi"
      },
      {
        id: 2,
        name: "Luigi",
        surname: "Bianchi"
      },
      {
        id: 3,
        name: "Marco",
        surname: "Rossini"
      },
      {
        id: 4,
        name: "Maria",
        surname: "Verdi"
      }
    ]);
});

app.get("*", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.listen(PORT, function () {
  console.log(`Server listening on port ${PORT}!`);
});

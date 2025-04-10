// Node.js server file
//    Description:
//      This Node.js server handles user authentication for a movie
//      platform application. It listens on localhost port 3000 and
//      supports login, logout, and checking login status.
//      MongoDB is used for storing and retrieving user credentials,
//      and the password is encrypted using the SHA-256 algorithm.

const express = require('express');
const {createHash} = require('node:crypto');
const { MongoClient } = require("mongodb");
const ObjectId = require('mongodb').ObjectId; 
const bodyParser = require('body-parser');
const dbName = "moviePlatformDb";
const accColName = "accountLogin";
const movColName = "movies";
const app = express();
const port = 3000;
const loginAttempt = 3;
let remainingAttempt = loginAttempt;
let isLoggedIn = false;
let currentUser = "";

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

let db;

async function connectToDatabase() {
  try {
    await client.connect();
    db = client.db(dbName);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
  }
}


// Route handler for login POST request
//    Input Parameters: 
//        req: object containing user data
//        res: object to send back data
//    Output: 
//        none
//    Description: 
//        This function processes the login request. It encrypts 
//        the provided password using SHA-256, checks the database 
//        for matching credentials, and returns a success or error
//        message depending on the result.
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  //encrypt password
  const hashPassword = createHash('sha256').update(password)
  .digest('hex');

  if (username && hashPassword) {
    // Call the function to check the database for the username 
    // and password
    checkAccountInfo(username, hashPassword)
      .then((result) => {
        if (result.success) {
          // Send success message
          res.json({ success: true, message: result.message });  
        } else {
          // Send error message
          res.json({ success: false, message: result.message });  
        }
      })
      .catch((err) => {
        res.status(500).send("An error occurred while processing the"+
          " request.");
        console.error(err);
      });
  } else {
    res.json({ success: false, message: "Username and password are "+
      "required." });
  }
});

app.post('/create', async (req, res) => {
  const { username, password } = req.body;
  const hashPassword = createHash('sha256').update(password)
  .digest('hex');

  try {
    const mycollection = db.collection(accColName);

    const existingUser = 
      await mycollection.findOne({ "username": username });

    if (existingUser) {
      res.json({ success: false, message: `Account with username `+
          `${username} already exists.`});
    } else {
      await mycollection.insertOne({
        "username": username,
        "password": hashPassword,
        "role": ["Viewer"],
        "likedMovies": [],
        "dislikedMovies": []
      })
      res.json({ success: true, message: "Account created!"});
    }
  } catch (error) {
      console.error("Error creating account", error);
      res.status(500).json({ success: false, message: 
                              'Failed to check account' });
  }
});

// Endpoint to check if user is logged in
//    Input Parameters: 
//        req: object containing user data
//        res: object to send back data
//    Output: 
//        none
//    Description: 
//        This function checks if the user is logged in by 
//        verifying the `isLoggedIn` status. If logged in, 
//        it sends a success message and indicates redirection 
//        to the Gallery page. If not logged in, it prompts the 
//        user to log in to visit the Gallery.
app.get('/checkLogin', (req, res) => {
  if (isLoggedIn) {
    res.json({ loggedIn: true, message: "You are already logged in."+
    "\nRedirecting to Gallery..."});
  } else {
    res.json({ loggedIn: false, message: "Please Login to visit"+
      " Gallery"});
  }
});

// Handle logout (reset the session or login status)
//    Input Parameters: 
//        req: object containing user data
//        res: object to send back data
//    Output: 
//        none
//    Description: 
//        This function handles the logout process by resetting 
//        the login status or session. It sets the `isLoggedIn` 
//        flag to false and sends a success message in the response.
app.post('/logout', (req, res) => {
  // Reset login status or session here
  isLoggedIn = false;
  currentUser = "";
  console.log("Logout successful.");
  res.json({ success: true, message: "Logged out successfully." });
});

app.get('/user/likedMovies', async (req, res) => {
  if (!currentUser) {
    return res.status(401).json({ success: false, message: "Not logged in" });
  }

  try {
    const users = db.collection(accColName);
    const movies = db.collection(movColName);

    const user = await users.findOne({ username: currentUser });
    if (!user || !user.likedMovies) {
      return res.json([]);
    }

    const likedMovieTitles = user.likedMovies;
    const likedMovies = await movies.find(
      { title: { $in: likedMovieTitles } }).toArray();

    res.json(likedMovies);
  } catch (err) {
    console.error("Error fetching liked movies:", err);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {}
});

// Endpoint to get all movies from the "movies" collection
app.get('/movies', async (req, res) => {
  try {
    const movies = await db.collection(movColName).find().toArray();
    res.json(movies);
  } catch (error) {
    console.error("Failed to fetch movies:", error);
    res.status(500).json({ error: "Failed to fetch movies" });
  }
});

// Endpoint to get a movie's details by ID
app.get('/movie', async (req, res) => {
  const movieId = req.query.id; // Get movie ID from query parameter

  if (!movieId) {
    return res.status(400).json({ error: "Movie ID is required." });
  }

  try {
    const movie = await db.collection(movColName).findOne({ _id: new ObjectId(movieId) });

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }
    res.json(movie);
  } catch (error) {
    console.error("Error fetching movie details:", error);
    res.status(500).json({ error: "Failed to fetch movie details" });
  }
});

app.post('/movie/updateLikeDislike', async (req, res) => {
  const { movieId, type } = req.body;

  if (!movieId || !type || (type !== 'like' && type !== 'dislike')) {
      return res.status(400).json({ success: false, message: 'Invalid request.' });
  }

  try {
      const oId = new ObjectId(movieId);
      const movie = await db.collection(movColName).
                                    findOne({ _id: oId });
      const mycollection = db.collection(accColName);

      if (!movie) {
          return res.status(404).json({ success: false, message: 
                                    'Movie not found.' });
      }

      const isLiked = await mycollection.findOne({ username: 
        currentUser, likedMovies: movie.title });
      const isDisliked = await mycollection.findOne({ username: 
        currentUser, dislikedMovies: movie.title });

      // Increment the likes or dislikes count
      if (type === 'like') {
          if(!isLiked && !isDisliked) {
            await db.collection(movColName).updateOne(
              { _id: oId },
              { $inc: { likes: 1 } } // Increment the likes count by 1
            );
            await mycollection.updateOne(
              { username: currentUser},
              { $push: { likedMovies: movie.title } }
            );
          }
          else if(isDisliked){
            await db.collection(movColName).updateOne(
              { _id: oId },
              { $inc: { likes: 1, dislikes:-1 } } // Increment the likes count by 1
            );
            await mycollection.updateOne(
              { username: currentUser },
              { $push: {likedMovies: movie.title } },
            );
            await mycollection.updateOne(
              { username: currentUser },
              { $pull: { dislikedMovies: movie.title }}
            );
          }
      } else if (type === 'dislike') {
          if(!isLiked && !isDisliked) {
            await db.collection(movColName).updateOne(
              { _id: oId },
              { $inc: { dislikes: 1 } } // Increment the likes count by 1
            );
            await mycollection.updateOne(
              { username: currentUser},
              { $push: { dislikedMovies: movie.title } }
            );
          }
          else if(isLiked){
            await db.collection(movColName).updateOne(
              { _id: oId },
              { $inc: { likes: -1, dislikes:1 } } // Increment the likes count by 1
            );
            await mycollection.updateOne(
              { username: currentUser },
              { $pull: {likedMovies: movie.title } }
            );
            await mycollection.updateOne(
              { username: currentUser },
              { $push: { dislikedMovies: movie.title }}
            );
          }
      }

      // Fetch the updated movie to return the new count
      const updatedMovie = await db.collection(movColName).
                                            findOne({ _id: oId });

      res.json({ success: true, movie: updatedMovie });
  } catch (error) {
      console.error("Error updating like/dislike:", error);
      res.status(500).json({ success: false, message: 
                              'Failed to update like/dislike.' });
  }
});


// Function to check account credentials (username/password)
//    Input Parameters: 
//        myname: the inputted username
//        mypass: the inputted password
//    Output: 
//        { success: boolean, message: string }
//    Description: 
//        This function checks if the provided username exists in 
//        the database. If it exists, it checks if the password is 
//        correct. If the password matches, login is successful. 
//        If incorrect, the remaining attempts are tracked. After 
//        3 incorrect attempts, the account is deleted. If the 
//        username does not exist, an error message is returned.
async function checkAccountInfo(myname, mypass) {
  try {
    const mycollection = db.collection(accColName);

    const existingUser = 
      await mycollection.findOne({ username: myname });

    if (existingUser) {
      if (existingUser.password === mypass) {
        console.log("Login successful.");
        isLoggedIn = true;
        currentUser = myname;
        return { success: true, message: "Login successful!\n"+
          "Redirecting to Gallery..." };
      } else {
        remainingAttempt = remainingAttempt-1;
        if(remainingAttempt==0){
          remainingAttempt = loginAttempt;
          deleteAccount(myname);
          return { success: false, message: `You have used all 3 `+
            `attempts. \nAccount with username ${myname} has been`+
            ` removed.`};
        } else
          return { success: false, message: `Incorrect password.\n`+
            `You have ${remainingAttempt} attempt(s) remaining.` };
      }
    } else
      return { success: false, message: "Username is not valid."};
  } finally {}
}

// Function to delete the user account from the database
//    Input Parameters: 
//        username: the username to delete from the database
//    Output: 
//        none
//    Description: 
//        This function deletes the user account from the database 
//        by searching for the username and removing the matching 
//        document. If the account is deleted successfully, a log 
//        message is displayed. If no matching account is found, 
//        an error message is logged.
async function deleteAccount(username) {
  try {
    const mycollection = db.collection(accColName);

    const result = await mycollection.deleteOne({ username });
    if (result.deletedCount === 1) {
      console.log(`Account with username ${username} has been `+
        `deleted.`);
    } else {
      console.log(`No account found with username ${username}.`);
    }
  } finally {}
}

// Start the server and listen for incoming requests
//    Input Parameters: 
//        port: the port number for the server to listen on
//    Output: 
//        none
//    Description: 
//        This function starts the server on the specified port 
//        and logs a message indicating the server is running.
connectToDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});

// Serve the home.html file when the root URL is accessed
//    Input Parameters: 
//        req: the request object
//        res: the response object to send back data
//    Output: 
//        none
//    Description: 
//        This function serves the home.html file located in the 
//        public directory when the root URL ("/") is accessed.
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/home.html');
});

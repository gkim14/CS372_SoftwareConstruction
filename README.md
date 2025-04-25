# SC Movie Watching Platform Project
This project was made for CS372 by:
- Grace Kim
- Daniel Kim
- Jonathan Brough
## Prerequisites
To start and run this server, make sure you have Node.js and MongoDB installed. You may also need to install express by running:
```bash
npm install express
```

## Installation
Download the git repo or clone it on your device. In MongoDB, create a database named "moviePlatformDB" and create two collections in there named "accountLogin" and "movies."
Then, from the git repo in the folder `moviePlatformDB`, there should be two `.json` files with the same name as the collections. Import them to the respective colletions in MongoDB.

Once that's done, from the `Project2_Code` folder start the server by running:
```bash
node server.js
```
The server should now be up and the platform can be accessed from `http://localhost:3000`

## Functionality
There are 3 roles, the Viewer, Content Editor, and Marketing Manager. Creating an account from the login page will automatically assign the new account with the Viewer role.
Accounts can be accessed from the database and given new roles by adding "Content Editor" or "Marketing Manager" to the `roles` array.

Below is some information on the roles.
| Role | Accessible Pages | Features |
| --- | --- | --- |
| Viewer | Home, Login, Gallery, and Movie pages | Can watch, like, dislike, and see a list of liked movies |
| Content Editor | Same as Viewer + Add Movie and Edit Movie pages | Same a Viewer + add, edit, and remove movies, and view Marketing Manager comment on the Movie page |
| Marketing Manager | Same as Viewer | Same as Viewer + add comments to each movie and view the total likes/dislikes on the Movie page |

In addition to the functions of each role, there's also an option to logout at the top right that appears after logging in, a "Change Role" dropdown menu to 
easily switch roles if an account has access to multiple roles, and a search bar to search for movies. Hovering over movies on the gallery page will cause a 
miniplayer to appear and play in the bottom right, and clicking on the movie image will take you to the Movie page for that specific movie, which has the like/dislike
button for that movie. 





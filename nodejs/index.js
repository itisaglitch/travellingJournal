
var firebaseConfig = 

{
  apiKey: "AIzaSyD_Yb9rvMMbPMRtaZBq_tzhY2DOYlCVoKM",
  authDomain: "travel-ad081.firebaseapp.com",
  databaseURL: "https://travel-ad081.firebaseio.com",
  projectId: "travel-ad081",
  storageBucket: "travel-ad081.appspot.com",
  messagingSenderId: "359971394324",
  appId: "1:359971394324:web:8b170ba254cbd30c61e801",
  measurementId: "G-9WCG7Y7H4E"
};
  // Initialize Firebase
if (!firebase.apps.length) {
   firebase.initializeApp(firebaseConfig);
}
var db = firebase.firestore();
var auth = firebase.auth();


var Users = [];
var UserIndex;
var UserIDs = [];
var pos;

var FollowersListName = [];
var FollowersListID = [];
var FollowingListName = [];
var FollowingListID = [];

var review = {
  Name:"",
  Review:"",
  Photo: "",
  Latitude: 0,
  Longitude: 0
};
var reviews = [];
var map = null;
var marker = [];
var UserSeeingHere,UserSeeingHereName;




function login(){
  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;
  firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  window.alert("Error: " + errorMessage);
  // ...
});
}

function logout(){
  auth.signOut().then(function() {
  console.log('Signed Out');
  }, function(error) {
  console.error('Sign Out Error', error);
  
  });

}
function placesVisited(){
  firebase.auth().onAuthStateChanged(function(user){
    if(user){
      var Uid = user.uid;
      var docRef = db.collection("users").doc(Uid);
      docRef.get().then(function(doc) {
        if (doc.exists) {
        console.log("Document data:", doc.data());
        var arr = doc.data();
        var Posts = arr.reviews;
        var map=new MapmyIndia.Map("map2",{ center:[28.61, 77.23], zoomControl: true, hybrid:true, search:true, location:true})
        for(var i=0;i<Posts.length;i++)
        {
          L.marker([Posts[i].Latitude, Posts[i].Longitude]).addTo(map);
        }
        
        } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
        }
      }).catch(function(error) {
        console.log("Error getting document:", error);
      });
        } else {
        // No user is signed in.
        }
      });
        
      
}
function imageURL(){
  var UID = "";
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
    // User is signed in.
    UID = user.uid;
    var docRef = db.collection("users").doc(UID);
    var url = ""
    docRef.get().then(function(doc) {
      if (doc.exists) {
        console.log("Document data:", doc.data());
        var arr = doc.data();
        var name = arr.name;
		var Posts = arr.reviews;
		
		document.getElementById("image").src = arr.photo;
    document.getElementById("username").innerHTML = name;

		for(var i=1;i<=Posts.length&&i<=6;i++)
		{
			document.getElementById("Heading"+i).innerHTML = Posts[i-1].Name;
			document.getElementById("article"+i).innerHTML = Posts[i-1].Review;
      document.getElementById("list"+i).style.backgroundColor = "white";
      document.getElementById("list"+i).style.opacity = "0.5";
		}
        
        return arr.photo;
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    }).catch(function(error) {
      console.log("Error getting document:", error);
    });
      } else {
      // No user is signed in.
      }
  });
  

}

function AddReview(){
  var name = document.getElementById("NameOfPlace").value;
  var view = document.getElementById("Review").value;
  console.log("Reached Here");
  firebase.auth().onAuthStateChanged(function(user){
    if(user){
      var Uid = user.uid;
      let storageRef = firebase.storage().ref(Uid+'/'+name+'.jpg');
      let fileUpload = document.getElementById("fileButton");
      console.log("Logged In");
      fileUpload.addEventListener('change', function(evt) {
      let firstFile = evt.target.files[0] // upload the first file only
      let uploadTask = storageRef.put(firstFile)
      console.log("Photo taken");
      uploadTask.on('state_changed', function(snapshot){
      // Observe state change events such as progress, pause, and resume
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log('Upload is ' + progress + '% done');
      switch (snapshot.state) {
      case firebase.storage.TaskState.PAUSED: // or 'paused'
        console.log('Upload is paused');
        break;
      case firebase.storage.TaskState.RUNNING: // or 'running'
        console.log('Upload is running');
        break;
      }
    }, function(error) {
      // Handle unsuccessful uploads
    }, function() {
      // Handle successful uploads on complete
      // For instance, get the download URL: https://firebasestorage.googleapis.com/...
      uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
      console.log('File available at', downloadURL);
      review.Review = view;
      review.Name = name;
      review.Latitude = pos.lat;
      review.Longitude = pos.lng;
      var docRef = db.collection("users").doc(Uid);
      
      review.Photo = downloadURL;
      docRef.get().then(function(doc) {
      if (doc.exists) {
        console.log("Document data:", doc.data());
        var arr = doc.data();
        reviews = arr.reviews;
        reviews.push(review);
        db.collection("users").doc(Uid).update({
          reviews:reviews
          })
        .then(function(docRef) {
          console.log("Document written with ID: ", Uid);
          alert("Review has been posted");
          window.location.href = "home.html"; 

          //window.location.href = "home.html";
        })
        .catch(function(error) {
          console.error("Error adding document: ", error);
        });
        
        
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    }).catch(function(error) {
      console.log("Error getting document:", error);
    });
      });
    });
      })
    }
  });

}

function setGuestUserAccount(ID)
{
	firebase.auth().onAuthStateChanged(function(user){
		if(user){
			console.log("User ID selected is: "+ID);
			var Uid = user.uid;
			db.collection("users").doc(Uid).update({
				UserSeeing: ID
			})
		  .then(function(docRef) {
			console.log("Document written with ID: ", Uid);
			window.location.href = "viewothersarticle.html";
		  })
		  .catch(function(error) {
			console.error("Error adding document: ", error);
		  });
		}
	});
}


function register(){
  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;
  var passconfrm = document.getElementById("confirmpassword").value;
  var phone = document.getElementById("phone").value;
  var name = document.getElementById("name").value;
  if(password===passconfrm)
  {
  firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // ...
  });
  firebase.auth().onAuthStateChanged(function(user){
    
    if(user!=null)
    {
      console.log("User is not here");
      var Uid = user.uid;
	  console.log("This is going to be written "+ Uid);
      console.log(Uid+" is the ID");
      db.collection("users").doc(Uid).set({
        name: name,
        phone:phone,
        email:email,
        password:password,
        Followers: [],
        FollowersName: [],
        Following: [],
        FollowingName: [],
        reviews: [],
        photo:"https://firebasestorage.googleapis.com/v0/b/travel-ad081.appspot.com/o/no-profile-picture.jpg?alt=media&token=b4d8dcad-fba3-4276-8bb2-275e1eb27550"
        })
      .then(function(docRef) {
        console.log("Document written with ID: ", Uid);
        window.location.href = "home.html";
      })
      .catch(function(error) {
        console.error("Error adding document: ", error);
      });
    } 
  });
  
  }
}

function exploreList(){
  var count=1;
  db.collection("users")
  .get()
  .then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, " => ", doc.data());
      var a = doc.data();
      Users.push(a.name);
      UserIDs.push(doc.id);
      var x = document.createElement("li");  
      x.setAttribute("class", "liclass");
      var id = toString(count);
      x.setAttribute("id", id);
      var t = document.createTextNode(a.name);
      x.appendChild(t);
      document.getElementById("List").appendChild(x);
      count ++ ;

    });
  })
  .catch(function(error) {
    console.log("Error getting documents: ", error);
  });
  
}

function mapLoad()
{
  //var map = new MapmyIndia.Map("map",{center: [28.549948, 77.268241], zoomControl: true, hybrid: true});
  map=new MapmyIndia.Map("map",{ center:[28.61, 77.23], zoomControl: true, hybrid:true, search:true, location:true});
  console.log("Doing it");
  map.on("dblclick", function (e) {
    var title = "Text marker sample! "+e.latlng;
    marker.push(addMarker(e.latlng, "", title));
    pos = e.latlng;
    
  });
}

function addMarker(position, icon, title, draggable) {
  /* position must be instance of L.LatLng that replaces current WGS position of this object. Will always return current WGS position.*/
  var event_div = document.getElementById("event-log");
  if (icon == '') {
    var mk = new L.Marker(position, {draggable: draggable, title: title});/*marker with a default icon and optional param draggable, title */
    mk.bindPopup(title);
  } else {
    var mk = new L.Marker(position, {icon: icon, draggable: draggable, title: title});/*marker with a custom icon */
    mk.bindPopup(title);
  }
  map.addLayer(mk);/*add the marker to the map*/
  /* marker events:*/
  mk.on("click", function (e) {
    event_div.innerHTML = "Marker clicked<br>" + event_div.innerHTML;
  });

  return mk;
}

function Thisone(){
  var index1 = document.getElementById("selection").value;
  console.log("Value Selected is: "+ index1);
  //+ parseInt(index)-1);
  UserIndex = parseInt(index1)-1;
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
    // User is signed in.
    var Uid = user.uid;
    db.collection("users").doc(Uid).set({
      UserSeeing: UserIDs[UserIndex]
      })
    .then(function(docRef) {
      console.log("Document written with ID: ", Uid);
      window.location.href = "guestAccount.html";
    })
    .catch(function(error) {
      console.error("Error adding document: ", error);
    });
    
    } else {
    // No user is signed in.
    }
  });
  window.location.href = "test.html";
} 

function Display(){
  //document.getElementById("test").innerHTML = Users[UserIndex];
}

 function listofpeople(){
    $("#List").on("click", ".liclass", function(event){
       
      setGuestUserAccount(UserIDs[Users.indexOf(this.innerHTML)]);
      console.log( this.innerHTML + ' clicked');
    }).css('cursor','pointer');
 }

function guestAccount(){
	var name;
	var UserPhoto;
	
  firebase.auth().onAuthStateChanged(function(user){
		if(user){
			var Uid = user.uid;
			var docRef = db.collection("users").doc(Uid);
			docRef.get().then(function(doc) {
			  if (doc.exists) {
				console.log("Document data:", doc.data());
				var arr = doc.data();
				var Now = arr.UserSeeing;
				UserSeeingHere = Now;
				var docRef1 = db.collection("users").doc(Now);
				docRef1.get().then(function(doc1){
					if(doc1.exists){
						console.log("Document data:", doc.data());
						var arr1 = doc1.data();
						name = arr1.name;
						UserSeeingHereName = arr1.name;
						UserPhoto = arr1.photo;
						Posts = arr1.reviews;
						document.getElementById("photo").src = UserPhoto;
						document.getElementById("Username").innerHTML = name;
						var count = 0;
						var map=new MapmyIndia.Map("map1",{ center:[28.61, 77.23], zoomControl: true, hybrid:true, search:true, location:true})
						for(var i=1;i<=Posts.length;i++)
						{
						  document.getElementById("Heading"+i).innerHTML = Posts[i-1].Name;
              document.getElementById("article"+i).innerHTML = Posts[i-1].Review;
              document.getElementById("list"+i).style.backgroundColor = "white";
              document.getElementById("list"+i).style.opacity = "0.5";
						  var title = Posts[i].Name;
						  L.marker([Posts[i].Latitude, Posts[i].Longitude]).addTo(map);
						  //var mark = new L.Marker([Posts[i].Latitude, Posts[i].Longitude]);
						  //mark.bindPopup(title);
						}
						
						
					}
				});
			}
	});
}
  });
}

function FollowInitiate(){
	Follow(UserSeeingHere,UserSeeingHereName);
}


function Follow(ID, IDname){
  // var index1 =document.getElementById("selection").value;
  console.log("Value Selected is: "+ ID);
  //+ parseInt(index)-1);
  var ApnaNaame;
  //UserIndex = parseInt(index1);
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
    // User is signed in.
    var Uid = user.uid;
    var docRef = db.collection("users").doc(Uid);
    docRef.get().then(function(doc) {
      if (doc.exists) {
        console.log("Document data:", doc.data());
        var arr = doc.data();
		    ApnaNaame = arr.name;
        var Following = arr.Following;
        var FollowingName = arr.FollowingName;
        Following.push(ID);
        FollowingName.push(IDname);
        db.collection("users").doc(Uid).update({
          Following: Following,
          FollowingName: FollowingName
          })
        .then(function(docRef) {
          console.log("Document written with ID: ", Uid);
          //window.location.href = "home.html";
        })
        .catch(function(error) {
          console.error("Error adding document: ", error);
        });
        var ref = db.collection("users").doc(ID);
        ref.get().then(function(doc1){
          if(doc1.exists){
            var d = doc1.data();
            var Followers = d.Followers;
            var FollowersName = d.FollowersName;
            Followers.push(Uid);
            FollowersName.push(ApnaNaame);
            db.collection("users").doc(ID).update({
              Followers: Followers,
              FollowersName: FollowersName
            })
            .then(function(docRef) {
              console.log("Document written with ID: ", ID);
              alert("You've followed "+ IDname );
              //window.location.href = "home.html";
            });
          }
        })
        
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    }).catch(function(error) {
      console.log("Error getting document:", error);
    });
    
    
    } else {
    // No user is signed in.
    }
  });
  //window.location.href = "test.html";
} 
function changePassword(){
  firebase.auth().onAuthStateChanged(function(user){
    if(user){
      var Uid = user.uid;
      var passconfrm = document.getElementById("passChange").value;
      db.collection("users").doc(Uid).update({
        password: passconfrm
        })
      .then(function(docRef) {
        console.log("Document written with ID: ", Uid);
        user.updatePassword(passconfrm).then(function() {
          // Update successful.
          document.getElementById("PassChange").innerHTML = "Password Changed";
        }).catch(function(error) {
          // An error happened.
        });
      })
      .catch(function(error) {
        console.error("Error adding document: ", error);
      });
    }
  });
}

function photoChange(){
  firebase.auth().onAuthStateChanged(function(user){
    if(user){
      var Uid = user.uid;
      let storageRef = firebase.storage().ref(Uid)
        let fileUpload = document.getElementById("PhotoChange")

        fileUpload.addEventListener('change', function(evt) {
        let firstFile = evt.target.files[0] // upload the first file only
        let uploadTask = storageRef.put(firstFile)
        uploadTask.on('state_changed', function(snapshot){
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
        case firebase.storage.TaskState.PAUSED: // or 'paused'
          console.log('Upload is paused');
          break;
        case firebase.storage.TaskState.RUNNING: // or 'running'
          console.log('Upload is running');
          break;
        }
        }, function(error) {
        // Handle unsuccessful uploads
        }, function() {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
        console.log('File available at', downloadURL);
          db.collection("users").doc(Uid).update({
          photo:downloadURL
          })
        .then(function() {
          document.getElementById("PhotoChange123").innerHTML="Photo Changed";
        })
        .catch(function(error) {
          console.error("Error adding document: ", error);
        });
        });
        });
        })
    }
  });
}
function followingLists(){
  var count =0;
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
    // User is signed in.
    var Uid = user.uid;
    var docRef = db.collection("users").doc(Uid);
    docRef.get().then(function(doc) {
      if (doc.exists) {
        console.log("Document data:", doc.data());
        var arr = doc.data();
        FollowingListName = arr.FollowingName;
        FollowingListID = arr.Following;
        for (var i = 0; i < FollowingListName.length; i++) {
          var x = document.createElement("li");  
          x.setAttribute("class", "followingclass");
          var id = toString(count);
          x.setAttribute("id", id);
          console.log(FollowingListName[i]);
          var t = document.createTextNode(FollowingListName[i]);
          x.appendChild(t);
          document.getElementById("followinglist").appendChild(x);
          count ++ ;
        }
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    }).catch(function(error) {
      console.log("Error getting document:", error);
    });
    
    
    } else {
    // No user is signed in.
    }
  });
}

function listoffollowing(){
  $("#followinglist").on("click", ".followingclass", function(event){
      setGuestUserAccount(FollowingListID[FollowingListName.indexOf(this.innerHTML)]);
      console.log( this.innerHTML + ' clicked');
    }).css('cursor','pointer');
}



function followersLists(){
  var count =0;
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
    // User is signed in.
    var Uid = user.uid;
    var docRef = db.collection("users").doc(Uid);
    docRef.get().then(function(doc) {
      if (doc.exists) {
        console.log("Document data:", doc.data());
        var arr = doc.data();
        FollowersListName = arr.FollowersName;
        FollowersListID = arr.Followers;
        for (var i = 0; i < FollowersListName.length; i++) {
          var x = document.createElement("li");  
          x.setAttribute("class", "followersclass");
          var id = toString(count);
          x.setAttribute("id", id);
          var t = document.createTextNode(FollowersListName[i]);
          x.appendChild(t);
          document.getElementById("followerslist").appendChild(x);
          count ++ ;
        }
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    }).catch(function(error) {
      console.log("Error getting document:", error);
    });
    
    
    } else {
    // No user is signed in.
    }
  });
}

function listoffollower(){
  $("#followerslist").on("click", ".followersclass", function(event){
      setGuestUserAccount(FollowersListID[FollowersListName.indexOf(this.innerHTML)]);
      console.log( this.innerHTML + ' clicked');
    }).css('cursor','pointer');
}

/*$("#btn-login").click(function(){
    var email = $("#email").val();
    var password = $("#password").val();
    if(email != "" && password != "" ){
        var result = firebase.auth().signInWithEmailandPassword(email,password);
        result.catch(function(error){
          var errorCode = error.code;
          var errorMessage = error.message;

          window.alert("Message : " + errorMessage  );
        });
    }
    else{
      window.alert("Put valid inputs!!")
    }
});*/

/*$("#btn-signup").click(function(){
    var email = $("#email").val();
    var name = $("#name").val();
    var phone = $("#phone").val();
    var password = $("#password").val();
    var cPassword = $("#confirmpassword").val();
    if(email != "" && password != "" && name != "" && phone != ""&& cPassword != "" ){
        if(password==cPassword){
          var result = firebase.auth().createUserWithEmailandPassword(email,password);
          result.catch(function(error){
          var errorCode = error.code;
          var errorMessage = error.message;

          window.alert("Message : " + errorMessage  );
        });
        }
        else { 
          window.alert("Passwords don't match");
        }
    }
    else{
      window.alert("Put valid inputs!!")
    }
});*/
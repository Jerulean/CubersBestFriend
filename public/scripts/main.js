/** namespace. */
var rhit = rhit || {};

/** globals */
rhit.authMan = null;

/** Page controllers */
rhit.LoginPageController = class {
	constructor() {
		document.getElementById("rosefireButton").onclick = (event) => {
			rhit.authMan.signIn();
		};
	}
}

rhit.drawerPageController = class {
	constructor() {
		console.log("Drawer page controller is here!");
		document.querySelector("#menuSignOut").onclick = () => {
			rhit.authMan.signOut();
		};
	}
}

/** Managers */
rhit.AuthenticationManager = class {
	constructor() {
		this._user = null;
	}

	beginListening(changeListener) {
		firebase.auth().onAuthStateChanged((user) => {
			this._user = user;
			changeListener();
		});
	}

	signIn(){
		//TODO: implement loging in via RoseFire
	}

	signOut() {
		firebase.auth().signOut().catch((error) => {
			console.log("Sign out error");
		});
	}

	get isSignedIn() {return !!this._user;}
	get uid() {return this._user.uid};
}

/** Miscellaneous functions */
rhit.initalizePage = () => {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);

	if(document.querySelector("#loginPage")) {
		rhit.startFirebaseUI();
		new rhit.LoginPageController();
	}

	if(document.querySelector(".bmd-layout-drawer")) {
		new rhit.drawerPageController();
	}
}

rhit.checkForRedirects = () => {
	if (document.querySelector("#loginPage") && rhit.authMan.isSignedIn) {
		window.location.href = "/homepage.html";
	}
	if (!document.querySelector("#loginPage") && !rhit.authMan.isSignedIn) {
		window.location.href = "/";
	}
}

rhit.startFirebaseUI= () => {
	var uiConfig = {
        signInSuccessUrl: '/homepage.html',
        signInOptions: [
			firebase.auth.GoogleAuthProvider.PROVIDER_ID,
			firebase.auth.EmailAuthProvider.PROVIDER_ID
        ],
      };
      const ui = new firebaseui.auth.AuthUI(firebase.auth());
      ui.start('#firebaseui-auth-container', uiConfig);
}

/* Main */
rhit.main = function () {
	console.log("Ready");
	rhit.authMan = new rhit.AuthenticationManager();
	rhit.authMan.beginListening(() => {
		rhit.checkForRedirects();
		rhit.initalizePage();
	})
};

rhit.main();

/** namespace. */
var rhit = rhit || {};

/** globals */
rhit.C_NS = "namedScrambles";
rhit.C_RS = "randomScrambles";
rhit.C_LEADERBOARD = "Leaderboard";
rhit.K_SCRAMBLE_STEPS = "moves";
rhit.K_SCRAMBLE_NAME = "name";
rhit.K_MINUTES = "minutes";
rhit.K_SECONDS = "seconds";
rhit.K_SETBY = "setBy";
rhit.K_UPLOADED = "timeUploaded";


rhit.authMan = null;
rhit.nsMan = null;
rhit.SMan = null;

/** Data classes */
rhit.NSButtonInfo = class {
	constructor(id, name) {
		this.id = id;
		this.name = name;
	}
}

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

rhit.ListedScramblesController = class {
	constructor() {
		rhit.nsMan.beginListening(this.updateList.bind(this));
	}

	_createButton(p) {
		return htmlToElement(`<button class="btn">${p.name}</button>`);
	}

	updateList() {
		const newList = htmlToElement(`<div id="buttonList"></div>`);
		for (let i = 0; i < rhit.nsMan.length; i++) {
			const doc = rhit.nsMan.getEntry(i);
			const newButton = this._createButton(doc);
			newButton.onclick = (e) => {
				window.location.href = `/scramble.html?id=${doc.id}`
			};
			newList.appendChild(newButton);
		}
		const oldList = document.querySelector("#buttonList");
		oldList.removeAttribute("id");
		oldList.hidden = true;
		oldList.parentElement.appendChild(newList);
	}
}

rhit.SingleScrambleController = class {
	constructor() {

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

	signIn() {
		//TODO: implement loging in via RoseFire
	}

	signOut() {
		firebase.auth().signOut().catch((error) => {
			console.log("Sign out error");
		});
	}

	get isSignedIn() {
		return !!this._user;
	}
	get uid() {
		return this._user.uid
	};
}

rhit.NamedScramblesManager = class {
	constructor() {
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.C_NS);
		this._unsubscribe = null;
	}

	beginListening(changeListener) {
		let query = this._ref.orderBy(rhit.K_SCRAMBLE_NAME, "desc");
		this._unsubscribe = query.onSnapshot((querySnapshot) => {
			this._documentSnapshots = querySnapshot.docs;
			changeListener();
		})
	}

	stopListening() {
		this._unsubscribe;
	}

	get length() {
		return this._documentSnapshots.length;
	}

	getEntry(index) {
		const docSnapshot = this._documentSnapshots[index];
		return new rhit.NSButtonInfo(docSnapshot.id, docSnapshot.get(rhit.K_SCRAMBLE_NAME));
	}

}

rhit.SingleScrambleManager = class {
	constructor(id, type) {
		
	}
}

/** Miscellaneous functions */
rhit.initalizePage = () => {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);

	if (document.querySelector("#loginPage")) {
		rhit.startFirebaseUI();
		new rhit.LoginPageController();
	}

	if (document.querySelector(".bmd-layout-drawer")) {
		new rhit.drawerPageController();
	}

	if (document.querySelector("#scramblesList")) {
		rhit.nsMan = new rhit.NamedScramblesManager();
		new rhit.ListedScramblesController();
	}

	if (document.querySelector("puzzlePage")) {
		const puzzleID = urlParams.get("id");
		const puzzleType = urlParams.get("s");	//Distiguishes named scrambles from "random" scrambles
		if(!puzzleID || !puzzleType) {
			console.log("Missing required parameters!");
			window.location.href = "/TAmain.html";
		}
		rhit.SMan = new rhit.SingleScrambleManager(puzzleID, puzzleType);
		new rhit.SingleScrambleController();
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

rhit.startFirebaseUI = () => {
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

//from: https://stackoverflow.com/questions/494143/
function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
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
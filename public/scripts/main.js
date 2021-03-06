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
rhit.leadMan = null;
rhit.randMan = null;
rhit.timerRunning = false;
rhit.finishedSolve = false;

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
		return htmlToElement(`<button class="btn btn-block">${p.name}</button>`);
	}

	updateList() {
		const newList = htmlToElement(`<div id="buttonList"></div>`);
		for (let i = 0; i < rhit.nsMan.length; i++) {
			const doc = rhit.nsMan.getEntry(i);
			const newButton = this._createButton(doc);
			newButton.onclick = (e) => {
				window.location.href = `/scramble.html?id=${doc.id}&s=${rhit.C_NS}`
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
		let startButton = document.querySelector("#timerStart");
		let stopButton = document.querySelector("#timerStop");
		let timerText = document.querySelector("#timerText");
		let upload = document.querySelector("#upload");
		let reset = document.querySelector("#reset");

		document.body.onkeyup = (event) => {

			if (event.keyCode == 32 && !rhit.timerRunning) {
				rhit.timerRunning = true;
				let t = 0;
				rhit.SMan.startTimer(() => {
					t += 16;
					let s = Number.parseFloat(t / 1000).toFixed(3);
					const m = Math.trunc(s / 60);
					s = Number.parseFloat(s % 60).toFixed(3);

					timerText.innerHTML = (s < 10) ? `${m}:0${s}` : `${m}:${s}`;
				});

				startButton.hidden = true;
				stopButton.hidden = false;
			} else if (rhit.timerRunning) {
				const t = rhit.SMan.stopTimer();
				let s = Number.parseFloat(t / 1000).toFixed(3);
				const m = Math.trunc(s / 60);
				rhit.timerRunning = false;
				s = Number.parseFloat(s % 60).toFixed(3);

				startButton.hidden = false;
				stopButton.hidden = true;
				upload.hidden = false;
				reset.hidden = false;

				timerText.innerHTML = (s < 10) ? `${m}:0${s}` : `${m}:${s}`;

			}
		}

		stopButton.onclick = (event) => {
			const t = rhit.SMan.stopTimer();
			let s = Number.parseFloat(t / 1000).toFixed(3);
			const m = Math.trunc(s / 60);
			rhit.timerRunning = false;
			s = Number.parseFloat(s % 60).toFixed(3);

			startButton.hidden = false;
			stopButton.hidden = true;
			upload.hidden = false;
			reset.hidden = false;

			timerText.innerHTML = (s < 10) ? `${m}:0${s}` : `${m}:${s}`;
		}

		startButton.onclick = (event) => {
			rhit.timerRunning = true;
			let t = 0;
			rhit.SMan.startTimer(() => {
				t += 16;
				let s = Number.parseFloat(t / 1000).toFixed(3);
				const m = Math.trunc(s / 60);
				s = Number.parseFloat(s % 60).toFixed(3);

				timerText.innerHTML = (s < 10) ? `${m}:0${s}` : `${m}:${s}`;
			});
			upload.hidden = true;
			startButton.hidden = true;
			stopButton.hidden = false;
		}

		reset.onclick = (event) => {
			document.querySelector("#textArea").innerHTML = `Officially, a cuber is supposed to start with both hands on a timer mat. The timer is triggered when the cuber
			lifts their hands off the mat. If you are using a computer, the spacebar takes the place of the mat. The timer
			is triggered when the spacebar is released. This feature is not supported on mobile and thus must use the
			"Start Timer" button.`;
			upload.hidden = true;
			startButton.hidden = false;
			stopButton.hidden = true;
			reset.hidden = true;
			timerText.innerHTML = `0:00.000`
		}

		upload.onclick = (event) => {
			rhit.SMan.uploadTime(timerText.innerHTML);
			document.querySelector("#textArea").innerHTML = `Uploaded Successful!`;
		}

		document.querySelector("#viewLeaderboard").onclick = (event) => {
			const id = rhit.SMan.id;
			const type = rhit.SMan.type;
			window.location.href = `/leaderboard.html?id=${id}&s=${type}`;
		}

		rhit.SMan.beginListening(this.updateView.bind(this));

	}

	updateView() {
		document.querySelector(".navbar-brand").innerHTML = rhit.SMan.name;
		document.querySelector("#steps").innerHTML = rhit.SMan.steps;
	}
}

rhit.LeaderboardController = class {
	constructor() {
		document.querySelector("#menuDelete").onclick = () => {
			rhit.leadMan.delete();
		}

		rhit.leadMan.beginListening(this.updateList.bind(this));
	}

	_createRanking(name, timeString) {
		return htmlToElement(`<li>${name}<div>${timeString}</div><hr></li>`);
	}

	updateList() {
		const newList = htmlToElement(`<ol id="rankings"></ol>`);
		for (let i = 0; i < rhit.leadMan.length; i++) {
			const newRanking = this._createRanking(rhit.leadMan.getNameAt(i), rhit.leadMan.getTimeAt(i));
			newList.appendChild(newRanking);
		}
		const oldList = document.querySelector("#rankings");
		oldList.removeAttribute("id");
		oldList.hidden = true;
		oldList.parentElement.appendChild(newList);
	}

}

rhit.randomChoiceController = class {
	constructor() {
		document.querySelector("#seeRandomScramble").onclick = () => {
			rhit.randMan.retrieve();
		}
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
		Rosefire.signIn("88642965-068e-4d9e-9213-258038167bbd", (err, rfUser) => {
			if (err) {
				console.log("Rosefire error!", err);
				return;
			}
			console.log("Rosefire success!", rfUser);

			// Next use the Rosefire token with Firebase auth.
			firebase.auth().signInWithCustomToken(rfUser.token).catch((error) => {
				if (error.code === 'auth/invalid-custom-token') {
					console.log("The token you provided is not valid.");
				} else {
					console.log("signInWithCustomToken error", error.message);
				}
			});
		});
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
		this._startTime = null;
		this._endTime = null;
		this._timerID = null;
		this._type = type;

		this._documentSnapshot = {};
		this._unsubscribe = null;
		this._ref = firebase.firestore().collection(this._type).doc(id);
	}

	beginListening(changeListener) {
		this._unsubscribe = this._ref.onSnapshot((doc) => {
			if (doc.exists) {
				this._documentSnapshot = doc;
				changeListener();
			} else {
				console.log("The specified scramble does not exist.");
			}
		})
	}

	stopListening() {
		this._unsubscribe();
	}

	startTimer(timerEvent) {
		this._startTime = Date.now();
		this._endTime = null;
		this._timerID = setInterval(timerEvent, 16);
	}

	stopTimer() {
		this._endTime = Date.now();
		clearInterval(this._timerID);
		return this._endTime - this._startTime;
	}

	get name() {
		return (this.type == rhit.C_RS) ? "Random Scramble" : this._documentSnapshot.get(rhit.K_SCRAMBLE_NAME);
	}

	get steps() {
		return this._documentSnapshot.get(rhit.K_SCRAMBLE_STEPS);
	}

	get id() {
		return this._documentSnapshot.id;
	}

	get type() {
		return this._type;
	}

	uploadTime(t) {
		let query = this._ref.collection(rhit.C_LEADERBOARD).where(rhit.K_SETBY, "==", rhit.authMan.uid);
		let re1 = /\d*/;
		const min = Number(re1.exec(t)[0]);
		let re2 = /\d*\.\d*/;
		const sec = Number(re2.exec(t)[0]);

		console.log(min, sec);
		query.get().then((querySnapshot) => {
			if (querySnapshot.docs.length != 0) {
				querySnapshot.forEach(doc => {
					if (min < doc.get(rhit.K_MINUTES) || (min == doc.get(rhit.K_MINUTES) && sec < doc.get(rhit.K_SECONDS))) {
						doc.ref.update({
							[rhit.K_MINUTES]: min,
							[rhit.K_SECONDS]: sec,
							[rhit.K_UPLOADED]: firebase.firestore.Timestamp.now()
						})
					}
				});

			} else {
				this._ref.collection(rhit.C_LEADERBOARD).add({
					[rhit.K_MINUTES]: Number(min),
					[rhit.K_SECONDS]: Number(sec),
					[rhit.K_UPLOADED]: firebase.firestore.Timestamp.now(),
					[rhit.K_SETBY]: rhit.authMan.uid
				})
			}
		})

	}
}

rhit.LeaderboardManager = class {
	constructor(id, type) {
		this._documentSnapshots = [];
		this._unsubscribe = null;
		this._ref = firebase.firestore().collection(type).doc(id).collection(rhit.C_LEADERBOARD);
	}

	beginListening(changeListener) {
		let query = this._ref.orderBy(rhit.K_MINUTES).orderBy(rhit.K_SECONDS);
		this._unsubscribe = query.onSnapshot((querySnapshot) => {
			this._documentSnapshots = querySnapshot.docs;
			changeListener();
		});
	}

	stopListening() {
		this._unsubscribe();
	}

	delete() {
		let query = this._ref.where(rhit.K_SETBY, "==", rhit.authMan.uid)
			.get()
			.then((querySnapshot) => {
				if (querySnapshot.docs.length != 0) {
					querySnapshot.forEach(doc => {
						doc.ref.delete();
					});

				}
			})
	}

	get length() {
		return this._documentSnapshots.length;
	}

	getNameAt(index) {
		return this._documentSnapshots[index].get(rhit.K_SETBY);
	}

	getTimeAt(index) {
		const m = this._documentSnapshots[index].get(rhit.K_MINUTES);
		const s = this._documentSnapshots[index].get(rhit.K_SECONDS);
		return m + ":" + s;
	}
}

rhit.RandomManager = class {
	constructor() {
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.C_RS);
		this._unsubscribe = null;
	}

	retrieve() {
		this._ref.get()
		.then((querySnapshot) => {
			const a = querySnapshot.docs.length;
			const b = Math.floor(Math.random()*1000) % a;
			window.location.href = `/scramble.html?id=${querySnapshot.docs[b].id}&s=${rhit.C_RS}`
		})
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

	if (document.querySelector("#puzzlePage")) {
		const puzzleID = urlParams.get("id");
		const puzzleType = urlParams.get("s"); //Distiguishes named scrambles from "random" scrambles
		if (!puzzleID || !puzzleType) {
			console.log("Missing required parameters!");
			window.location.href = "/TAmain.html";
		}
		rhit.SMan = new rhit.SingleScrambleManager(puzzleID, puzzleType);
		new rhit.SingleScrambleController();
	}

	if (document.querySelector("#leaderboardPage")) {
		const puzzleID = urlParams.get("id");
		const puzzleType = urlParams.get("s");
		if (!puzzleID || !puzzleType) {
			console.log("Missing required parameters!");
			window.location.href = "/TAmain.html";
		}
		rhit.leadMan = new rhit.LeaderboardManager(puzzleID, puzzleType);
		new rhit.LeaderboardController();
	}

	if(document.querySelector("#seeRandomScramble")) {
		rhit.randMan = new rhit.RandomManager();
		new rhit.randomChoiceController();
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
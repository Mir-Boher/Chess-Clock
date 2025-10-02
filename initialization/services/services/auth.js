window.login = function (email, password) {
  return firebase.auth().signInWithEmailAndPassword(email, password);
};

window.signup = async function (email, password, username) {
  const userCredential = await firebase
    .auth()
    .createUserWithEmailAndPassword(email, password);
  await firebase
    .firestore()
    .doc("users/" + userCredential.user.uid)
    .set({
      username: username,
      email: email,
    });
  return userCredential;
};

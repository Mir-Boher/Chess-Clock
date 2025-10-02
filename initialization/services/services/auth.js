import { auth } from "../../../src/config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

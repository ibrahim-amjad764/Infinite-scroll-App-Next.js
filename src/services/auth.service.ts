import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
// import { auth } from "@/src/lib/firebase"
import { signOut } from "firebase/auth";
import { getAuth } from "firebase/auth"
import { app } from "@/src/lib/firebase"

// Sign UP
export async function signUp(email: string, password: string) {
  console.log("Sign-Up Start");
  //  firebase cred object return user info & provide token method
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  console.log("FireBase User Created:", cred.user.uid);

  const idToken = await cred.user.getIdToken(true);
  console.log("Token Issued");
  console.log("Token Recived:", idToken?.slice(0, 20));

  const res = await fetch("/api/auth/signup", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  })

  if (!res.ok) {
    const msg = await res.text();
    console.error("Backend DB Creation Failed:", msg);
    throw new Error("Signup DB Sync Failed");
  }
  return await res.json();
}

// Sign IN
export async function signIn(email: string, password: string) {
  console.log("Sign-IN Start", email);

  if (!email || !password) {
    console.error("Email or Password Missing");
    throw new Error("Email and Password are required");
  }
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    console.log("FireBase Login:", credential.user.uid);

    const token = await credential.user.getIdToken(true);
    console.log("Token Fetched:", token?.slice(0, 20), "...");

    const res = await fetch("/api/auth/login", {
      method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    })

    if (!res.ok) {
      const text = await res.text();
      console.error("Backend Auth Failed:", text);
      throw new Error("Bakend Authentication Failed");
    }

    const normalizeUser = (user: any) => ({
      ...user,
      displayName:
        user.firstName || user.lastName
          ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() // prefer real names
          : user.email.split("@")[0], // fallback to email username
    });

    const user = await res.json();
    console.log("DB User Fetched:", user);

    return normalizeUser(user);

  } catch (err: any) {
    if (err.code) {
      switch (err.code) {
        case "auth/invalid-email":
          console.error("Invalid Email Format");
          break;
        case "auth/user-not-found":
          console.error("User Not Found");
          break;
        case "auth/wrong-password":
          console.error("Wrong Password");
          break;
        default:
          console.error("Firebase Error:", err.code, err.message);
      }
    } else {
      console.error("Sign-In ERROR:", err.message || err);
    }
    throw err;
  }
}
// Logout

const auth = getAuth(app)
export const logout = async () => {
  try {
    // 1️⃣ Sign out from Firebase client
    await signOut(auth)

    // 2️⃣ Call server API to delete cookie
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include", // important so cookie is sent
    })

    console.log("Logout successful")
  } catch (error) {
    console.error("Logout failed:", error)
    throw error
  }
}




import { writable, get } from "svelte/store";

export const initialDate = writable(new Date());

const storedUser =
  typeof window !== "undefined" ? localStorage.getItem("userProfile") : null;
const initialUserData = storedUser
  ? JSON.parse(storedUser)
  : {
      email: "",
      firstName: "",
      lastName: "",
      title: "",
      squad: "",
      department: "",
      avatarUrl: "",
      // Default should never be "admin" to avoid flashing admin UI on first SSR paint.
      role: "user",
      startDate: "",
      projects: [],
      trainings: [],
      awards: [],
      certifications: [],
    };

export const userStore = writable(initialUserData);

if (typeof window !== "undefined") {
  userStore.subscribe((user) => {
    localStorage.setItem("userProfile", JSON.stringify(user));
  });
}

export function getUserDisplayName(): string {
  const user = get(userStore);
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  } else if (user.email) {
    return user.email;
  }
  return "User Profile";
}

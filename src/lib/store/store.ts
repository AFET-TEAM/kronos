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
      avatarUrl: "",
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

export function extractNameFromEmail(email: string) {
  try {
    const namePart = email.split("@")[0];
    const parts = namePart.split(".");

    if (parts.length >= 2) {
      return {
        firstName: capitalizeFirstLetter(parts[0]),
        lastName: capitalizeFirstLetter(parts[1]),
      };
    }

    return {
      firstName: capitalizeFirstLetter(namePart),
      lastName: "",
    };
  } catch (error) {
    console.error("Email parsing error:", error);
    return {
      firstName: "",
      lastName: "",
    };
  }
}

function capitalizeFirstLetter(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

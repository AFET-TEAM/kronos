const AVATAR_COLORS = [
  "bg-gradient-to-br from-blue-azure to-blue-ribbon",
  "bg-gradient-to-br from-sapphire to-blue-ribbon",
  "bg-gradient-to-br from-primary to-blue-ribbon",
  "bg-gradient-to-br from-ocean-blue to-sapphire",
  "bg-gradient-to-br from-blue-azure to-ocean-blue",
];

export const getInitials = (firstName: string, lastName: string): string => {
  if (!firstName || !lastName) return "";
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
};

export const getAvatarColor = (firstName: string, lastName: string): string => {
  if (!firstName || !lastName) return AVATAR_COLORS[0];
  const index =
    (firstName.charCodeAt(0) + lastName.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

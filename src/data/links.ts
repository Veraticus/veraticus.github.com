interface Link {
  readonly title: string;
  readonly href: string;
  readonly icon: string;
}

export const links: readonly Link[] = [
  { title: "GitHub", icon: "\uD83D\uDC19", href: "https://github.com/Veraticus" },
  { title: "LinkedIn", icon: "\uD83D\uDCBC", href: "https://linkedin.com/in/joshsymonds" },
  { title: "Email", icon: "\u2709\uFE0F", href: "mailto:josh@joshsymonds.com" },
  { title: "Resume", icon: "\uD83D\uDCC4", href: "/resume/" },
  { title: "Blog Archive", icon: "\uD83D\uDCDD", href: "/blog/" },
] as const;

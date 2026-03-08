export type QuickLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type SupportCard = {
  title: string;
  summary: string;
  bullets?: string[];
};

export type Stop = {
  time: string;
  title: string;
  area: string;
  narrative: string;
  details?: string[];
  image?: string;
  imageAlt?: string;
  reservation?: string;
  practical?: string;
  links?: QuickLink[];
  supportCards?: SupportCard[];
};

export type DayPlan = {
  id: string;
  label: string;
  subtitle: string;
  date: string;
  theme: string;
  summary: string;
  highlight: string;
  fixed: string[];
  stops: Stop[];
};

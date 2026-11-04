// "KI Movers" follows the supplied logo. Replace it and the marked values
// with the company's approved name and verified details before launch.
export interface Business {
  name: string;
  tagline: string;
  phone: string;
  phoneLink: string;
  whatsapp: string;
  email: string;
  address: string;
  website: string;
  yearsExperience: string;
  movesCompleted: string;
  teamSize: string;
  satisfaction: string;
  social: {
    instagram: string;
    facebook: string;
    linkedin: string;
  };
}

export const business: Business = {
  name: "KI Movers",
  tagline: "Relocation simplified",
  phone: "+971 55 793 0734",
  phoneLink: "+971557930734",
  whatsapp: "971557930734",
  email: "[Add verified email address]",
  address: "Dubai, United Arab Emirates",
  website: "https://example.com",
  yearsExperience: "[Add verified figure]",
  movesCompleted: "[Add verified figure]",
  teamSize: "[Add verified figure]",
  satisfaction: "[Add verified figure]",
  social: { instagram: "", facebook: "", linkedin: "" }
};

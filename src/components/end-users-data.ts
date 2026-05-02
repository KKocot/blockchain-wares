export interface Company {
  name: string;
  url: string;
  logoFile?: string;
}

export const companies: Company[] = [
  {
    name: "AT&T",
    url: "https://www.att.com",
    logoFile: "att.svg",
  },
  {
    // Atmel acquired by Microchip Technology in 2016
    name: "Atmel",
    url: "https://www.microchip.com",
  },
  {
    name: "BlockTrades",
    url: "https://blocktrades.us",
  },
  {
    name: "Fujitsu",
    url: "https://www.fujitsu.com",
    logoFile: "fujitsu.svg",
  },
  {
    name: "Hewlett-Packard",
    url: "https://www.hp.com",
    logoFile: "hp.svg",
  },
  {
    name: "IBM Corporation",
    url: "https://www.ibm.com",
    logoFile: "ibm.svg",
  },
  {
    name: "Intel Corporation",
    url: "https://www.intel.com",
    logoFile: "intel.svg",
  },
  {
    name: "Lexmark International Inc.",
    url: "https://www.lexmark.com",
  },
  {
    name: "Motorola",
    url: "https://www.motorola.com",
    logoFile: "motorola.svg",
  },
  {
    name: "NASA",
    url: "https://www.nasa.gov",
    logoFile: "nasa.svg",
  },
  {
    name: "Peerplays",
    url: "https://www.peerplays.com",
  },
  {
    name: "Phoenix Integration",
    url: "https://www.phoenix-int.com",
  },
  {
    name: "Phoenix Technologies",
    url: "https://www.phoenix.com",
  },
  {
    name: "Prointegra",
    url: "https://www.prointegra.com",
  },
  {
    name: "Texas Instruments",
    url: "https://www.ti.com",
  },
  {
    name: "US Government",
    url: "https://www.usa.gov",
  },
];

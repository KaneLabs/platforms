import { ApplicationStatus, Bed, CurrencyType, Organization } from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import _ from 'lodash';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export async function fetcher<JSON = any>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<JSON> {
  const response = await fetch(input, { ...init, cache: "no-store" });

  return response.json();
}

export const capitalize = (s: string) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const truncate = (str: string, num: number) => {
  if (!str) return "";
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + "...";
};

export const truncateMiddle = (fullStr: string, strLen: number, separator?: string) => {
  if (fullStr.length <= strLen) return fullStr;

  separator = separator || '...';

  var sepLen = separator.length,
      charsToShow = strLen - sepLen,
      frontChars = Math.ceil(charsToShow/2),
      backChars = Math.floor(charsToShow/2);

  return fullStr.substr(0, frontChars) + 
         separator + 
         fullStr.substr(fullStr.length - backChars);
};

export const getBlurDataURL = async (url: string | null) => {
  if (!url) {
    return "data:image/webp;base64,AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
  }
  try {
    const response = await fetch(
      `https://wsrv.nl/?url=${url}&w=50&h=50&blur=5`,
    );
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    return `data:image/png;base64,${base64}`;
  } catch (error) {
    return "data:image/webp;base64,AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
  }
};

export const placeholderBlurhash =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAoJJREFUWEfFl4lu4zAMRO3cx/9/au6reMaOdkxTTl0grQFCRoqaT+SQotq2bV9N8rRt28xms87m83l553eZ/9vr9Wpkz+ezkT0ej+6dv1X81AFw7M4FBACPVn2c1Z3zLgDeJwHgeLFYdAARYioAEAKJEG2WAjl3gCwNYymQQ9b7/V4spmIAwO6Wy2VnAMikBWlDURBELf8CuN1uHQSrPwMAHK5WqwFELQ01AIXdAa7XawfAb3p6AOwK5+v1ugAoEq4FRSFLgavfQ49jAGQpAE5wjgGCeRrGdBArwHOPcwFcLpcGU1X0IsBuN5tNgYhaiFFwHTiAwq8I+O5xfj6fOz38K+X/fYAdb7fbAgFAjIJ6Aav3AYlQ6nfnDoDz0+lUxNiLALvf7XaDNGQ6GANQBKR85V27B4D3QQRw7hGIYlQKWGM79hSweyCUe1blXhEAogfABwHAXAcqSYkxCtHLUK3XBajSc4Dj8dilAeiSAgD2+30BAEKV4GKcAuDqB4TdYwBgPQByCgApUBoE4EJUGvxUjF3Q69/zLw3g/HA45ABKgdIQu+JPIyDnisCfAxAFNFM0EFNQ64gfS0EUoQP8ighrZSjn3oziZEQpauyKbfjbZchHUL/3AS/Dd30gAkxuRACgfO+EWQW8qwI1o+wseNuKcQiESjALvwNoMI0TcRzD4lFcPYwIM+JTF5x6HOs8yI7jeB5oKhpMRFH9UwaSCDB2Jmg4rc6E2TT0biIaG0rQhNqyhpHBcayTTSXH6vcDL7/sdqRK8LkwTsU499E8vRcAojHcZ4AxABdilgrp4lsXk8oVqgwh7+6H3phqd8J0Kk4vbx/+sZqCD/vNLya/5dT9fAH8g1WdNGgwbQAAAABJRU5ErkJggg==";

export const toDateString = (date: Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const random = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

type RoomWithBedsType = {
  beds: { type: Bed["type"] }[];
};

export const calcRoomCapacity = (roomWithBedsType: RoomWithBedsType) =>
  roomWithBedsType.beds.reduce((total, bed) => {
    if (bed.type === "QUEEN" || bed.type === "KING") {
      return total + 2;
    } else {
      return total + 1;
    }
  }, 0);

export function calcAccommodationUnitCapacity(rooms: RoomWithBedsType[]) {
  return rooms.reduce((total, room) => total + calcRoomCapacity(room), 0);
}


export function replaceNullWithUndefined(obj: Record<any, any>) {
  return _.transform(obj, function(result: any, value, key) {
    if (_.isObject(value)) {
      result[key] = replaceNullWithUndefined(value);
    } else {
      result[key] = value === null ? undefined : value;
    }
  });
}

export function replaceUndefinedWithNull(obj: Record<any, any>) {
  return _.transform(obj, function(result: any, value, key) {
    if (_.isObject(value)) {
      result[key] = replaceUndefinedWithNull(value);
    } else {
      result[key] = value === undefined ? null : value;
    }
  });
}

export const FORA_BASE_URL = process.env.NEXT_PUBLIC_ROOT_DOMAIN === 'localhost:3000' ? `http://localhost:3000` : `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;
export const FORA_APP_URL = process.env.NEXT_PUBLIC_ROOT_DOMAIN === 'localhost:3000' ? `http://app.localhost:3000` : `https://app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;
export const FORA_API_URL = process.env.NEXT_PUBLIC_ROOT_DOMAIN === 'localhost:3000' ? `http://api.localhost:3000` : `https://api.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;

export const getCityUrl = (org: Organization) => {
  return process.env.NEXT_PUBLIC_ROOT_DOMAIN === 'localhost:3000' ? `http://${org.subdomain}.localhost:3000` : `https://${org.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;
}

export const getSubdomainUrl = (subdomain: string) => {
  return process.env.NEXT_PUBLIC_ROOT_DOMAIN === 'localhost:3000' ? `http://${subdomain}.localhost:3000` : `https://${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;
}

export const ETH_PRICE_IN_DOLLARS = 2347;  // this is just for testing/demo, TODO query Alchemy or something

export const getCurrencySymbol = (currency: CurrencyType | null | undefined) => {
  const symbols = {
    [CurrencyType.ETH]: "⟠",
    [CurrencyType.USDC]: "$",
    [CurrencyType.USDT]: "$",
  };
  return currency && symbols[currency] ? symbols[currency] : "";
}

export const getApplicationStatusText = (status: ApplicationStatus | null | undefined) => {
  const displayTexts = {
    [ApplicationStatus.ACCEPTED]: "Accepted",
    [ApplicationStatus.REJECTED]: "Rejected",
    [ApplicationStatus.PENDING]: "In review",
    [ApplicationStatus.TIMED_OUT]: "Error",
    [ApplicationStatus.NOT_SUBMITTED]: "Withdrew",
    [ApplicationStatus.NOT_REQUIRED]: "No review required",
  };
  return status && displayTexts[status] ? displayTexts[status] : "";
}

export const getApplicationStatusColor = (status: ApplicationStatus | null | undefined) => {
  const colors = {
    [ApplicationStatus.ACCEPTED]: "text-accent-green", 
    [ApplicationStatus.REJECTED]: "text-accent-red", 
    [ApplicationStatus.PENDING]: "text-accent-orange", 
    [ApplicationStatus.TIMED_OUT]: "text-accent-violet", 
    [ApplicationStatus.NOT_SUBMITTED]: "text-gray-800", 
    [ApplicationStatus.NOT_REQUIRED]: "text-accent-blue",
  };
  return status && colors[status] ? colors[status] : "";
}

export const getSupportedChainIds = () => [
  "11155111", // Eth Sepolia
  "11155420"  // OP Sepolia
];

export const getCampaignFactoryV1ContractAddress = (chainId: bigint) => {
  const campaignFactoryV1ContractAddresses: { [key: string]: string } = {
    "11155111": "0x2488b39a46e1ef74093b0b9b7a561a432ed97e29",   // Eth Sepolia
    "11155420": "0x289200BD3b7E865E7Ad6094276BD69E795fe2E17"    // OP Sepolia
  }

  return campaignFactoryV1ContractAddresses[chainId.toString()] || "";
}

export const getCurrencyTokenAddress = (chainId: bigint, currency: CurrencyType | null | undefined) => {
  const chain = chainId.toString();
  const addresses: { [key: string]: { [key: string]: string } } = {
    "11155111": {   // Eth Sepolia
      [CurrencyType.ETH]: "",
      [CurrencyType.USDC]: `0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8`,
      [CurrencyType.USDT]: `0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0`,
    },   
    "11155420": {   // OP Sepolia
      [CurrencyType.ETH]: "",
      [CurrencyType.USDC]: `0x5fd84259d66Cd46123540766Be93DFE6D43130D7`,
      [CurrencyType.USDT]: `0x5fd84259d66Cd46123540766Be93DFE6D43130D7`,
    }    
  }
  return currency && addresses[chain] && addresses[chain][currency] ? addresses[chain][currency] : "";
}

export const getCurrencyTokenDecimals = (currency: CurrencyType | null | undefined) => {
  const decimals = {
    [CurrencyType.ETH]: 18,
    [CurrencyType.USDC]: 6,
    [CurrencyType.USDT]: 6,
  };
  return currency && decimals[currency] ? decimals[currency] : 0;
}

export const getEtherscanUrl = (chainId: bigint) => {
  const url: { [key: string]: string } = {
    "11155111": "https://sepolia.etherscan.io/",              // Eth Sepolia
    "11155420": "https://optimism-sepolia.blockscout.com/"    // OP Sepolia
  }
  return url[chainId.toString()] || "";
}

export const getRPCUrl = (chainId: string) => {
  const url: { [key: string]: string } = {
    "11155111": `${process.env.NEXT_PUBLIC_ETH_SEPOLIA_RPC}`,  // Eth Sepolia
    "11155420": `${process.env.NEXT_PUBLIC_OP_SEPOLIA_RPC}`    // OP Sepolia
  }
  return url[chainId] || "";
}

export const getSubdomainFromDomain = (domain: string) => domain.replace('%3A', ':').endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)
? domain.replace('%3A', ':').replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, "")
: domain;

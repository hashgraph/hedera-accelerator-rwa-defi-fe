import type { Config } from "tailwindcss";

const config: Config = {
   content: [
      "../../node_modules/daisyui/dist/**/*.js",
      "../../node_modules/react-daisyui/dist/**/*.js",
      "./src/**/*.{js,ts,jsx,tsx,mdx}",
   ],
};

export default config;

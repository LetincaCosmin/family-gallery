/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        float: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(18px,-22px,0) scale(1.05)" },
        },
        float2: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(-22px,18px,0) scale(1.06)" },
        },
        float3: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(12px,26px,0) scale(1.04)" },
        },
      },
      animation: {
        "float-slow": "float 16s ease-in-out infinite",
        "float-slower": "float2 22s ease-in-out infinite",
        "float-slowest": "float3 28s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

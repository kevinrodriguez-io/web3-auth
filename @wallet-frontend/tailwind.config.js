module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/line-clamp"), require('@tailwindcss/forms')],
};

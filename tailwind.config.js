const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  mode: "jit",
  content: ["./client/**/*.js", "./server/views/**/*.ejs"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        toaster: {
          "0%": {
            transform: "translateX(100vh)",
            opacity: 0,
          },
          "100%": {
            transform: "translateX(0)",
            opacity: 1,
          },
        },
      },
      animation: {
        toaster: "toaster 1s ease-in-out",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
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
        from_right: {
          "0%": {
            transform: "translateX(100vw)",
            opacity: 0,
          },
          "100%": {
            transform: "translateX(0)",
            opacity: 1,
          },
        },
      },
      animation: {
        from_right: "from_right 0.8s ease-in-out",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
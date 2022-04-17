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
            transform: "translateX(100vh)",
            opacity: 0,
          },
          "50%": {
            transform: "translateX(0)",
            opacity: 1,
          },
          "100%": {
            opacity: 0,
          },
        },
      },
      animation: {
        from_right: "from_right 1s ease-in-out infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
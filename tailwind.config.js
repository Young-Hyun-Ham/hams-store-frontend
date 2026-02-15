/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/(sidebar-header)/admin/**/*.{js,ts,jsx,tsx,mdx}",
    // 혹시 admin에서 공용 컴포넌트를 쓰면 아래도 추가
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: { extend: {} },
  plugins: [],
};

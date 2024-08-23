import { defineConfig } from "vite";

export default defineConfig({
    // base: "./",
    server: {
        host: "127.0.0.1",
        https: {
            key: "/Users/wuxingyu/react_work/myGitHub/ssl/127.0.0.1-key.pem",
            cert: "/Users/wuxingyu/react_work/myGitHub/ssl/127.0.0.1.pem",
        },
    },
});

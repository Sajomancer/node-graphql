import { createServer } from "./createServer";

const databaseUrl = process.env.DATABASE_URL;
const { server } = createServer(databaseUrl);

server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`Server running at ${url}`);
});

import { app } from "./app";

const port = Number(process.env.PORT) || 3001;

app.listen(port, () => {
  console.log(`Notes API listening on port ${port}`);
});

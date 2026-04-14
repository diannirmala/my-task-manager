import express from "express";
import cors from "cors";
import taskRouter from "./routes";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use("/tasks", taskRouter);

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});

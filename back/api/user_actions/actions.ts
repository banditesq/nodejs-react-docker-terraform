import express from "express";
import { execFunction } from "../../utils/user_traits/traits";

const router = express();

router.get("/details", async (req: any, res) => {
  const { _id } = req.decoded;

  try {
    await execFunction(async (auth) => {
      const details = await auth.details({ _id });

      res.status(200).json(details);
    });
  } catch (error) {
    res.status(400).send(`could not get user: ${error}`);
  }
});

export default router;

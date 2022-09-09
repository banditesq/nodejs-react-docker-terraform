import express from "express";
import { execFunction } from "../../utils/user_traits/traits";

const router = express();

router.post("/signup", async (req, res) => {
  try {
    const { email, first_name, last_name, password } = req.body;    

    await execFunction(async (auth) => {
      const response = await auth.SignUp({
        email,
        first_name,
        last_name,
        password,
      });

      res.status(201).json(response);
    });
  } catch (error) {
    return res.status(400).send(`error creating user: ${error}`);
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    await execFunction(async (auth) => {
      const response = await auth.Login({ email, password });
      res.status(200).json({ auth_token: response });
    });
  } catch (error) {
    res.status(400).send(`error finding user: ${error}`);
  }
});
export default router;

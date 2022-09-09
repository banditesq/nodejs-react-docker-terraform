import userSchema from "../../model/user_model";
import { encode } from "../../routes_protection";
import bcrypt from "bcryptjs";

const saltRounds = 10;

interface Login {
  Login(params: { email: String; password: String }): Promise<any>;
}

interface SignUp {
  SignUp(params: {
    email: String;
    first_name: String;
    last_name: String;
    password: String;
  }): Promise<any>;
}
interface UserDetails {
  details(params: { _id: String }): Promise<any>;
}

export interface auth extends SignUp, Login, UserDetails {}

export async function execFunction<TMethod>(
  callback: (method: auth) => TMethod
): Promise<any> {
  const augmentedAPI = new Proxy<auth>({} as auth, {
    get<TMethodName extends keyof auth>(target: auth, p: TMethodName) {
      if (target[p] == null) {
        switch (p) {
          case "Login":
            target[p] = async function ({
              email,
              password,
            }: Parameters<auth["Login"]>[0]) {
              return new Promise((resolve, reject) => {
                userSchema
                  .findOne({ email })
                  .then(async (user: any) => {
                    if (!user) reject(user);
                    try {
                      const valid = await bcrypt.compare(
                        password.toString(),
                        user.password
                      );

                      if (!valid) return reject("invalid password");

                      encode({ _id: user._id }, (error, encoded) => {
                        error ? reject(error) : resolve(encoded);
                      });
                    } catch (error) {
                      reject(error);
                    }
                  })
                  .catch((error) => {
                    reject(error);
                  });
              });
            } as auth[TMethodName];

            break;

          case "SignUp":
            target[p] = async function ({
              email,
              first_name,
              last_name,
              password,
            }: Parameters<auth["SignUp"]>[0]) {
              return new Promise(async (resolve, reject) => {
                try {
                  const encryted_password = await bcrypt.hash(
                    password.toString(),
                    saltRounds
                  );

                  await new userSchema({
                    email,
                    first_name,
                    last_name,
                    password: encryted_password,
                  }).save();
                  resolve("user saved");
                } catch (error) {
                  reject(error);
                }
              });
            } as auth[TMethodName];
            break;

          case "details":
            target[p] = async function ({
              _id,
            }: Parameters<auth["details"]>[0]) {
              return new Promise(async (resolve, reject) => {
                const user = await userSchema.findOne({ _id }).exec();
                if (!user) {
                  return reject("user not found");
                }
                resolve(user);
              });
            } as auth[TMethodName];

          default:
            break;
        }
      }

      return target[p];
    },
  });
  return callback(augmentedAPI);
}

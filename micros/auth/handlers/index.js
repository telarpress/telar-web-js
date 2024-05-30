const { appConfig } = require("../config");
const authService = require("../services/auth.service");
const { sendEmail } = require("../utils/sendEmail");
const {
  generateDigits,
  hash,
  compareHash,
} = require("../../../core/utils/string.util");
const axios = require("axios").default;
const zxcvbn = require("zxcvbn");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");
const passport = require("passport");
var access_token = "";
const crypto = require("crypto");

//Auth const
const {
  signUpBodyValidation,
  logInBodyValidation,
} = require("../utils/validationSchema");
const generateTokens = require("../utils/generateTokens");

const log = require("../../../core/utils/errorLogger");
const utils = require("../../../core/utils/error-handler");
const { HttpStatusCode } = require("../../../core/utils/HttpStatusCode");
const { getPrettyURLf } = require("../../../core/utils/url.util");
const { validateToken } = require("../../../core/utils/token.util");
const {
  generateRandomNumber,
  generateSocialName,
  functionCall,
  initUserSetup,
  getURLSchemaHost,
} = require("../utils/common");
const { UserAuth } = require("../models/user");

// SignupPageHandler creates a handler for logging in
exports.signupPageHandler = async (req, res) => {
  const token = req.cookies.token;
  try {
    await authService.checkVerifyToken(token);
    res.redirect("/profile");
  } catch (error) {
    res.clearCookie("token");
    res.clearCookie("refreshToken");
  }

  var viewData = {
    Title: "Create User",
    OrgName: appConfig.ORG_NAME,
    OrgAvatar: appConfig.ORG_AVATAR,
    AppName: appConfig.APP_NAME,
    ActionForm: "/auth/signup",
    LoginLink: "/auth/login",
    RecaptchaKey: appConfig.RECAPTCHA_SITE_KEY,
    VerifyType: appConfig.VERIFY_TYPE,
  };
  res.render("signup", viewData);
};

// SignupTokenHandle create signup token
exports.signupTokenHandle = async (req, res) => {
  try {
    // TODO: Validation Implation
    // const { error } = UserAuthValidate(req.body);
    // if (error) {
    //   log.Error(error);
    //   log.Error("signupTokenHandle: missing validation");
    //   return res
    //     .status(HttpStatusCode.BadRequest)
    //     .send(
    //       new utils.ErrorHandler(
    //         "auth.missingvalidation",
    //         "Missing validation"
    //       ).json()
    //     );
    // }

    try {
      const passStrength = await zxcvbn(req.body.newPassword);

      if (passStrength.guesses < 37) {
        log.Error(
          ` *** WARNING *** - User With Email: ${req.body.email} Password Strength is: ${passStrength.guesses} and ${passStrength.crack_times_display.online_no_throttling_10_per_second} crack time estimations`
        );
        return res
          .status(HttpStatusCode.BadRequest)
          .send(
            new utils.ErrorHandler(
              "auth.needStrongerPassword",
              "Password is not strong enough!"
            ).json()
          );
      }
    } catch (error) {
      console.error("[Error][signupTokenHandle] ", error);
      return res
        .status(HttpStatusCode.InternalServerError)
        .send(
          new utils.ErrorHandler(
            "internal/password",
            "Error happened in verifying password!"
          ).json()
        );
    }

    // Verify Captha
    const resultRecaptch = await authService.verifyRecaptchaV2(
      req.body["g-recaptcha-response"],
      appConfig.RECAPTCHA_SECRET_KEY
    );

    if (!resultRecaptch) {
      log.Error(
        `Can not verify recaptcha ${appConfig.RECAPTCHA_SITE_KEY} error: ${resultRecaptch}`
      );
      return res
        .status(HttpStatusCode.InternalServerError)
        .send(
          new utils.ErrorHandler(
            "internal/recaptcha",
            "Error happened in verifying captcha!"
          ).json()
        );
    }

    // Check user exist
    const findUser = await authService
      .findByUsername(req.body.email)
      .catch((findError) => {
        const errorMessage = `Error while finding user by user name : ${findError}`;
        log.Error(errorMessage);
        return res
          .status(HttpStatusCode.Conflict)
          .send(
            new utils.ErrorHandler("auth.userAlreadyExist", errorMessage).json()
          );
      });

    if (findUser) {
      log.Error("userAlreadyExist", "User already exist - " + req.body.email);
      return res
        .status(HttpStatusCode.Conflict)
        .send(
          new utils.ErrorHandler(
            "userAlreadyExist",
            "User already exist - " + req.body.email
          ).json()
        );
    }

    // Create signup token
    const newUserId = uuidv4();

    const ip = req.clientIp;

    const emailTemplateFile = "email_code_verify-css";
    const code = generateDigits(6);

    const tokenData = {
      userId: newUserId,
      emailBody: emailTemplateFile,
      code: code,
      username: req.body.email,
      emailTo: req.body.email,
      emailSubject: "Your verification code",
      remoteIpAddress: ip,
      fullName: req.body.fullName,
      userPassword: req.body.newPassword,
    };

    try {
      // authService.createEmailVerificationToken is a function that returns a token
      console.log("createEmailVerificationToken ");
      const result = await authService.createEmailVerificationToken(tokenData);
      console.log("createEmailVerificationToken done! ");

      if (req.body.responseType === "spa") {
        return res.send({ token: result });
      }

      const prettyURL = getPrettyURLf(appConfig.BASE_ROUTE);
      const signupVerifyData = {
        title: "Login - Telar Social",
        orgName: appConfig.OrgName,
        orgAvatar: appConfig.OrgAvatar,
        appName: appConfig.AppName,
        actionForm: `${prettyURL}/signup/verify`,
        token: result,
        message: "",
      };

      return renderCodeVerify(req, res, signupVerifyData);
    } catch (error) {
      log.Error(`Error While Create Token: `, error);
      return res
        .status(HttpStatusCode.InternalServerError)
        .send(
          new utils.ErrorHandler(
            "internal/createTokenAuth",
            "Error happened in creating Token! - " + req.body.email
          ).json()
        );
    }

    // TODO: if Verfify By Link
    // link = `${appConfig.AUTH_WEB_URI}/user/verify/${emailVerification.code}`;
  } catch (error) {
    log.Error("Error happened in create signup!");
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "internal/sendEmailAuth",
          "Error happened in create signup! - " + error
        ).json()
      );
  }
};

// Verify Show Signup Handle
exports.verifyGetSignupHandle = async (req, res) => {
  var viewData = {
    Title: "Verifaction - Telar Social",
    AppName: appConfig.APP_NAME,
    OrgAvatar: appConfig.ORG_AVATAR,
    OrgName: appConfig.ORG_NAME,
    ActionForm: "/auth/signup/verify",
    SignupLink: "/auth/signup",
    Message: "You Can Signin To the Website",
  };
  res.render("code_verification", viewData);
};

// Verify Send Signup Handle
exports.verifySignupHandle = async (req, res) => {
  try {
    const remoteIpAddress = req.clientIp;

    const code = req?.body?.code;
    const token = req?.body?.verificaitonSecret;
    console.log("START decoding", appConfig.PublicKey, remoteIpAddress);
    const claim = await validateToken(appConfig.PublicKey, token);
    const userRemoteIp = claim.remoteIpAddress;
    const verifyType = claim.verifyType;
    const verifyMode = claim.mode;
    const verifyId = claim.verifyId;
    const userId = claim.userId;
    const fullName = claim.fullname;
    const email = claim.email;
    const phoneNumber = claim.phoneNumber;
    const password = claim.password;
    const verifyTarget = verifyType === "emv" ? email : phoneNumber;
    console.log(
      `userId: ${userId}, fullName: ${fullName}, email: ${email}, password: ${password}, userRemoteIp: ${userRemoteIp}, verifyType: ${verifyType}, verifyMode: ${verifyMode}, verifyId: ${verifyId}`
    );

    let emailVerified = false;
    let phoneVerified = false;

    if (verifyType === "emv") {
      emailVerified = true;
    } else {
      phoneVerified = true;
    }

    if (remoteIpAddress !== userRemoteIp) {
      log.Error("The request is from a different remote IP address!");
      return res.status(400).json({
        error: "invalidToken",
        message: "Error happened in validating token!",
      });
    }

    const verifyStatus = await authService.verifyUserByCode(
      userId,
      verifyId,
      remoteIpAddress,
      code,
      verifyTarget
    );
    if (!verifyStatus) {
      console.error("The code is wrong!");
      return res
        .status(400)
        .json({ error: "wrongCode", message: "The code is wrong!" });
    }

    const createdDate = Date.now();
    const hashPassword = await hash(password);

    if (!hashPassword) {
      const errorMessage = `Cannot hash the password!`;
      console.error(errorMessage);
      return res.status(500).json({
        error: "internal",
        message: "Error happened during verification!",
      });
    }

    const newUserAuth = new UserAuth({
      objectId: userId,
      username: email,
      password: hashPassword,
      access_token: token,
      emailVerified: emailVerified,
      role: "user",
      phoneVerified: phoneVerified,
      createdDate: createdDate,
      last_updated: createdDate,
    });
    try {
      await newUserAuth.save();
      const socialName = generateSocialName(fullName, userId);

      const newUserProfile = {
        objectId: userId,
        fullName: fullName,
        socialName: socialName,
        createdDate: createdDate,
        lastUpdated: createdDate,
        email: email,
        avatar: `https://util.telar.dev/api/avatars/${userId}`,
        banner: `https://picsum.photos/id/${generateRandomNumber(
          1,
          1000
        )}/900/300/?blur`,
        permission: "Public",
      };

      try {
        await saveUserProfile(newUserProfile);
      } catch (error) {
        console.error(`Save user profile ${error.message}`);
        return res.status(500).json({
          error: "canNotSaveUserProfile",
          message: "Cannot save user profile!",
        });
      }

      try {
        await initUserSetup(
          newUserAuth.objectId,
          newUserAuth.username,
          newUserProfile.avatar,
          newUserProfile.fullName,
          newUserAuth.role
        );
      } catch (error) {
        return res.status(500).json({
          error: "initUserSetupError",
          message: `Cannot initialize user setup! error: ${error.message}`,
        });
      }

      return res
        .status(200)
        .send("User authentication and profile setup successful");
    } catch (error) {
      console.error(
        `Error occurred during user authentication and profile setup: ${error.message}`
      );
      return res.status(500).json({
        error: "internal",
        message: "Error occurred during user authentication and profile setup",
      });
    }
  } catch (error) {
    log.Error("Error happened in verifying user signup code!", error);
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "internal/verifySignupHandle",
          "Error happened in verifying user signup code"
        ).json()
      );
  }
};

// verify link sent by email
exports.verifyEmailLink = async (req, res) => {
  const user = await authService.checkUserExistById(req.params.id);
  if (!user) {
    log.Error("verifyEmailHandle: Error happened in show verify Email Link!");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "auth.userverifactionmissing",
          "User exist missing"
        ).json()
      );
  }

  const token = await authService.checkTokenExistByUserId(
    user.objectId,
    req.params.token
  );
  if (!token) {
    log.Error("verifyEmailHandle: Error happened in check token exist");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "auth.tokenverifactionmissing",
          "Token exist missing"
        ).json()
      );
  }

  await authService.updateVerifyUser(user.objectId, true);
  await authService.findByIdAndRemoveToken(token.objectId);

  var viewData = {
    Message: "email verified sucessfully",
  };
  res.render("message", viewData);
};

// MainPageHandler creates a handler for Home Page
exports.mainPageHandler = async (req, res) => {
  var viewData = {
    Message: "Main Page",
  };
  res.render("message", viewData);
};

// LoginPageHandler creates a handler for logging in
exports.loginPageHandler = async (req, res) => {
  if (req.cookies.he && req.cookies.pa && req.cookies.si) {
    res.redirect("/profile");
  }

  let gitClientID = appConfig.GITHUB_CLIENT_ID
    ? "https://github.com/login/oauth/authorize?client_id=" +
      appConfig.GITHUB_CLIENT_ID +
      "&scope=user%20repo_deployment%20read:user"
    : "";

  var viewData = {
    AppName: appConfig.APP_NAME,
    OrgName: appConfig.ORG_NAME,
    ActionForm: "/auth/login",
    Message: "You Can Signin To the Website",
    ResetPassLink: "/auth/password/forgetwithcode",
    SignupLink: "/auth/signup",
    GithubLink: gitClientID,
    GoogleLink: "/auth/google",
    Title: "Login - Telar Social",
    OrgAvatar: appConfig.ORG_AVATAR,
  };
  res.render("login", viewData);
};

// POST login
exports.loginTelarHandler = async (req, res) => {
  const { error } = logInBodyValidation(req.body);
  if (error) {
    log.Error("loginHandler: missing validation", error);
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "auth.loginmissingvalidation",
          "Missing validation"
        ).json()
      );
  }
  const { state } = req.body;
  const foundUser = await authService.findByUsername(req.body.username);
  if (!foundUser) {
    log.Error(`loginHandler: Invalid email or password`);
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "auth.loginInvalid",
          "Invalid email or password"
        ).json()
      );
  }

  if (!foundUser.emailVerified && !foundUser.phoneVerified) {
    log.Error("loginHandler: Unverified email");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "auth.loginunverifiedemail",
          "Unverified email"
        ).json()
      );
  }

  const CompareHash = await compareHash(req.body.password, foundUser.password);

  if (!CompareHash) {
    log.Error(`loginHandler: Password doesn't match ${CompareHash}`);
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "auth.passwordNotMatch",
          "Password doesn't match!"
        ).json()
      );
  }

  try {
    const profileChannel = authService.getUserProfileByID(foundUser.objectId);

    const langChannel = authService.readLanguageSettingAsync(
      foundUser.objectId,
      {
        userId: foundUser.objectId,
        username: foundUser.username,
        systemRole: foundUser.role,
        avatar: "",
        displayName: "",
      }
    );
    const [profileResult, langResult] = await Promise.all([
      profileChannel,
      langChannel,
    ]);
    console.log("profileResult ", JSON.stringify(profileResult));
    let currentUserLang = "en";
    log.Error(`langResult.settings ${JSON.stringify(langResult.settings)}`);

    const langSettigPath = await authService.getSettingPath(
      foundUser.objectId,
      "lang",
      "current"
    );
    if (langResult.settings[langSettigPath] != undefined) {
      currentUserLang = langResult.settings[langSettigPath];
    } else {
      let userInfoReq = {
        userId: foundUser.objectId,
        username: foundUser.username,
        avatar: profileResult.avatar,
        displayName: profileResult.fullName,
        systemRole: foundUser.role,
      };
      await authService.createDefaultLangSetting(userInfoReq);
    }

    const tokenModel = {
      oauthProvider: null,
      providerName: "telar",
      profile: {
        name: foundUser.username,
        id: foundUser.objectId,
        login: foundUser.username,
      },
      organizationList: "Red Gold",
      name: profileResult.email,
      access_token: "ProviderAccessToken", // "token":  ProviderAccessToken
      organizations: "Red Gold",
      claim: {
        displayName: profileResult.fullName,
        socialName: profileResult.socialName,
        email: profileResult.email,
        avatar: profileResult.avatar,
        banner: profileResult.banner,
        tagLine: profileResult.tagLine,
        userId: foundUser.objectId,
        uid: foundUser.objectId,
        role: foundUser.role,
        createdDate: foundUser.created_date,
      },
    };
    const session = await generateTokens.createToken(tokenModel);
    if (!session) {
      log.Error(`Error creating session`);
      return res
        .status(HttpStatusCode.InternalServerError)
        .send(
          new utils.ErrorHandler(
            "auth.createToken",
            "Internal server error creating token"
          ).json()
        );
    }
    // Write session on cookie
    await generateTokens.writeSessionOnCookie(res, session);

    // Write user language on cookie
    await generateTokens.writeUserLangOnCookie(res, currentUserLang);

    let webURL = appConfig.EXTERNAL_REDIRECT_DOMAIN;

    // We don't expire token because it's complicating things
    // Also Google recommend it. https://developers.google.com/actions/identity/oauth2-implicit-flow
    const expiresIn = 0;

    const sessionQuery = `access_token=${session}&state=${state}&expires_in=${expiresIn}`;

    const redirect = req.query.r;
    log.info("SetCookie done, redirect to: %s", redirect);

    // Redirect to original requested resource (if specified in r=)
    if (redirect) {
      log.info(
        `Found redirect value "r"=${redirect}, instructing client to redirect`
      );

      // Note: unable to redirect after setting Cookie, so landing on a redirect page instead.
      webURL = `${getURLSchemaHost(
        redirect
      )}/auth/session?${sessionQuery}&r=${redirect}`;
    }

    return res.json({
      user: profileResult,
      accessToken: session,
      redirect: webURL,
    });
  } catch (error) {
    log.Error(`User profile  ${error}`);
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "auth.getUserProfile",
          "Can not find user profile!"
        ).json()
      );
  }
};

// CheckAdmin find user auth by userId
exports.checkAdminHandler = async (req, res) => {
  try {
    const checkAdmin = await authService.checkAdmin();
    res.send(checkAdmin);
  } catch (error) {
    log.Error("checkAdminHandler: Not Found Admin User");
    return res
      .status(HttpStatusCode.NotFound)
      .send(
        new utils.ErrorHandler(
          "auth.missingcheckadmin",
          "Not Found Admin User"
        ).json()
      );
  }
};

// AdminSignupHandle verify signup token
exports.adminSignupHandle = async (req, res) => {
  try {
    const email = appConfig.ADMIN_USERNAME;
    const password = appConfig.ADMIN_PASSWORD;
    const fullName = "admin";

    const userUUID = uuidv4();

    const createdDate = Math.floor(Date.now() / 1000);

    const salt = await bcrypt.genSalt(Number(appConfig.SALT));
    const hashPassword = await bcrypt.hash(password, salt);

    let newUserAuth = {
      objectId: userUUID,
      username: email,
      password: hashPassword,
      accessToken: "",
      role: "admin",
      emailVerified: true,
      phoneVerified: true,
      createdDate: createdDate,
      lastUpdated: createdDate,
    };
    await authService.saveUser(newUserAuth);

    const newUserProfile = {
      socialName: await this.generateSocialName(fullName, userUUID),
      id: userUUID,
      fullName: fullName,
      email: email,
      // password: profile.password,
      //TODO: Create one ENV for select Account && primary name (email or username)
      // emailUser: profile.email,

      avatar: "https://util.telar.dev/api/avatars/" + userUUID,
      banner: `https://picsum.photos/id/${this.generateRandomNumber(
        1,
        1000
      )}/900/300/?blur`,
      created_date: Math.floor(Date.now() / 1000),
      last_updated: Math.floor(Date.now() / 1000),
      permission: "Public",
    };

    try {
      await saveUserProfile(newUserProfile);
    } catch (error) {
      log.Error("Error happened in callAPIWithHMAC!");
      return res
        .status(HttpStatusCode.BadRequest)
        .send(
          new utils.ErrorHandler(
            "auth/callAPIWithHMAC",
            "Error happened in callAPIWithHMAC! - " + req.body.email
          ).json()
        );
    }

    try {
      await initUserSetup(
        newUserAuth.objectId,
        newUserAuth.username,
        newUserProfile.avatar,
        newUserProfile.fullName,
        newUserAuth.role
      );
    } catch (error) {
      log.Error("Cannot initialize user setup! error: " + error);
      return res
        .status(HttpStatusCode.BadRequest)
        .send(
          new utils.ErrorHandler(
            "auth/canNotSaveUserProfile",
            "Cannot initialize user setup!"
          ).json()
        );
    }

    const tokenModel = {
      token: { ProviderAccessToken: {} },
      oauthProvider: "",
      providerName: "telar",
      profile: { name: fullName, id: userUUID, login: email },
      organizationList: "Telar",
      claim: {
        displayName: fullName,
        socialName: newUserProfile.socialName,
        email: email,
        userId: userUUID,
        banner: newUserProfile.banner,
        tagLine: newUserProfile.tagLine,
        role: "admin",
        createdDate: newUserProfile.created_date,
      },
    };

    const session = await generateTokens.createToken(tokenModel);
    log.Error(`\nSession is created: ${session} \n`);

    return res.status(HttpStatusCode.OK).send({ token: session });
  } catch (error) {
    log.Error(
      "auth.adminSignupHandle",
      "Cannot save user authentication! error: " + error
    );
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "auth.adminSignupHandle",
          "Cannot save user authentication!"
        ).json()
      );
  }
};

// generateRandomNumber
exports.generateRandomNumber = function (min, max) {
  return Math.floor(Math.random() * max) + min;
};

// saveUserProfile Save user profile
async function saveUserProfile(newProfile) {
  const profileURL = "/profile/dto";
  try {
    return await functionCall("post", newProfile, profileURL);
  } catch (error) {
    log.Error("functionCall " + profileURL + error);
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler("auth.saveUserProfile", "Missing functionCall")
      );
  }
}

// LoginAdminHandler creates a handler for logging in telar social
exports.loginAdminHandler = async (req, res) => {
  const { error } = logInBodyValidation(req.body);
  if (error) {
    log.Error("loginHandler: missing validation");
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "auth.loginmissingvalidation",
          "Missing validation"
        ).json()
      );
  }
  const foundUser = await authService.findByUsername(req.body.username);
  if (!foundUser) {
    log.Error(`loginHandler: Invalid email or password`);
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "auth.loginInvalid",
          "Invalid email or password"
        ).json()
      );
  }

  const CompareHash = await authService.CompareHash(
    req.body.password,
    foundUser.password
  );

  if (!CompareHash) {
    log.Error(`loginHandler: Password doesn't match ${CompareHash}`);
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "auth.passwordNotMatch",
          "Password doesn't match!"
        ).json()
      );
  }

  try {
    const profileChannel = authService.getUserProfileByID(foundUser.objectId);
    if (!profileChannel) {
      log.Error(`loginHandler: Profile doesn't exist ${profileChannel}`);
    }
    let avatar;
    let socialName;
    await profileChannel.then((profile) => {
      avatar = profile.avatar;
      socialName = profile.socialName;
    });

    const langChannel = authService.readLanguageSettingAsync(
      foundUser.objectId,
      {
        userId: foundUser.objectId,
        username: foundUser.username,
        systemRole: foundUser.role,
        avatar: avatar,
        displayName: socialName,
      }
    );
    const [profileResult, langResult] = await Promise.all([
      profileChannel,
      langChannel,
    ]);
    let currentUserLang = "en";
    log.Error(`langResult.settings ${JSON.stringify(langResult.settings)}`);

    const langSettigPath = await authService.getSettingPath(
      foundUser.objectId,
      "lang",
      "current"
    );
    if (langResult.settings[langSettigPath] != undefined) {
      currentUserLang = langResult.settings[langSettigPath];
    } else {
      let userInfoReq = {
        userId: foundUser.objectId,
        username: foundUser.username,
        avatar: profileResult.avatar,
        displayName: profileResult.fullName,
        systemRole: foundUser.role,
      };
      await authService.createDefaultLangSetting(userInfoReq);
    }

    const tokenModel = {
      oauthProvider: null,
      providerName: "telar",
      profile: {
        name: foundUser.username,
        id: foundUser.objectId,
        login: foundUser.username,
      },
      organizationList: "Red Gold",
      name: profileResult.email,
      access_token: "ProviderAccessToken", // "token":  ProviderAccessToken
      organizations: "Red Gold",
      claim: {
        displayName: profileResult.fullName,
        socialName: profileResult.socialName,
        email: profileResult.email,
        avatar: profileResult.avatar,
        banner: profileResult.banner,
        tagLine: profileResult.tagLine,
        userId: foundUser.objectId,
        uid: foundUser.objectId,
        role: foundUser.role,
        createdDate: foundUser.created_date,
      },
    };

    try {
      const session = await generateTokens.createToken(tokenModel);
      log.Error(`\nSession is created: ${session} \n`);
      return res.status(HttpStatusCode.OK).send({ token: session });
    } catch (error) {
      log.Error(`Error creating session`);
      return res
        .status(HttpStatusCode.InternalServerError)
        .send(
          new utils.ErrorHandler(
            "auth.createToken",
            "Internal server error creating token"
          ).json()
        );
    }
  } catch (error) {
    log.Error(`User profile  ${error}`);
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "auth.getUserProfile",
          "Can not find user profile!"
        ).json()
      );
  }
};
exports.logout = (req, res) => {
  res.clearCookie("he");
  res.clearCookie("pa");
  res.clearCookie("si");
  var viewData = {
    Message: "User LogOut successfully.",
  };
  res.render("message", viewData);
};

// Get Change password Page
exports.getResetUserPassword = async (req, res) => {
  try {
    await authService.findUserById(res.locals.user.uid);
    var viewData = {
      AppName: appConfig.APP_NAME,
      ActionForm: "/auth/password/reset",
      LoginLink: "/auth/login",
      OrgName: appConfig.ORG_NAME,
      Title: "Reset User Password",
      OrgAvatar: appConfig.ORG_AVATAR,
    };
    res.render("reset_password", viewData);
  } catch (error) {
    log.Error("ResetPassHandle: Find User Problem");
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "auth.missingloginFind",
          "Missing Find User"
        ).json()
      );
  }
};

// Change User password
exports.resetUserPassword = async (req, res) => {
  try {
    const uid = res.locals.user.uid;
    if (!uid) {
      log.Error("ResetPassHandle: Authentication Problem");
      return res
        .status(HttpStatusCode.Unauthorized)
        .send(
          new utils.ErrorHandler(
            "auth.missingloginAuth",
            "Missing Authentication"
          ).json()
        );
    }
    await authService.changeUserPasswordByUserId(
      req.body.oldPassword,
      uid,
      req.body.newPassword
    );
    res.clearCookie("he");
    res.clearCookie("pa");
    res.clearCookie("si");
    var viewData = {
      Message: "change password sucessfully.",
    };
    return res.render("message", viewData);
  } catch (error) {
    log.Error("ResetPassHandle: An Error Occurred") + error;
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "missingResetPassword",
          "Missing Reset Password"
        ).json()
      );
  }
};

// Forget password With Code Page
exports.forgetPasswordWithCodePageHandler = async (req, res) => {
  var viewData = {
    AppName: appConfig.APP_NAME,
    LoginLink: "/auth/login",
    OrgName: appConfig.ORG_NAME,
    Title: "Forget Password",
    OrgAvatar: appConfig.ORG_AVATAR,
    ActionForm: "/auth/password/forgetwithcode",
  };
  res.render("forget_password_code", viewData);
};

// Forget password Page
exports.forgetPasswordPageHandler = async (req, res) => {
  if (req.cookies.token) return res.redirect("/profile");

  try {
    const token = req.cookies.token;
    await authService.checkVerifyToken(token);
    // res.redirect("/profile");
  } catch (error) {
    res.clearCookie("token");
    res.clearCookie("refreshToken");
  }

  var viewData = {
    AppName: appConfig.APP_NAME,
    LoginLink: "/auth/login",
    OrgName: appConfig.ORG_NAME,
    Title: "Forget Password",
    OrgAvatar: appConfig.ORG_AVATAR,
    ActionForm: "/auth/password/forget",
  };
  res.render("forget_password", viewData);
};

// Send reset password Code
exports.forgetPasswordCodeHandler = async (req, res) => {
  if (req.body.email == "") {
    log.Error("ForgetPassHandle: email field is empty");
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler("auth.missingEmail", "Missing Email").json()
      );
  }
  //TODO: Validation
  // const schema = Joi.object({ email: Joi.string().email().required() });
  // const { error } = schema.validate(req.body);
  // if (error) {
  //   log.Error("ForgetPassHandle: email field is empty");
  //   return res
  //     .status(HttpStatusCode.BadRequest)
  //     .send(
  //       new utils.ErrorHandler(
  //         "forgetpassmissingvalidation",
  //         "Missing validation"
  //       ).json()
  //     );
  // }

  const user = await authService.findByUsername(req.body.email);
  if (!user) {
    log.Error(`ForgetPassHandle : User not exist by email : ${user}`);
    return res
      .status(HttpStatusCode.Conflict)
      .send(
        new utils.ErrorHandler(
          "forgetNotExist",
          "User not exist - " + req.body.email
        ).json()
      );
  }
  const token = await authService.createToken(user.objectId);

  let sendMail = false;
  sendMail = await sendEmail(
    user.username,
    user.username,
    token.code,
    "email_code_verify-css",
    "Request to change your password",
    "" //additionalField
  );
  if (!sendMail) {
    log.Error("Error happened in sending Email!");
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "internal/sendEmailAuth",
          "Error happened in sending email! - " + req.body.email
        ).json()
      );
  }

  res.redirect("/auth/password/forgetwithcode");
};

// Send reset password Code
exports.forgetPasswordwithCodeFormHandler = async (req, res) => {
  if (req.body.email == "") {
    log.Error("ForgetPassHandle: email field is empty");
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler("auth.missingEmail", "Missing Email").json()
      );
  }
  //TODO: Validation
  // const schema = Joi.object({ email: Joi.string().email().required() });
  // const { error } = schema.validate(req.body);
  // if (error) {
  //   log.Error("ForgetPassHandle: email field is empty");
  //   return res
  //     .status(HttpStatusCode.BadRequest)
  //     .send(
  //       new utils.ErrorHandler(
  //         "forgetpassmissingvalidation",
  //         "Missing validation"
  //       ).json()
  //     );
  // }

  const {
    email,
    code1,
    code2,
    code3,
    code4,
    code5,
    code6,
    newPassword,
    confirmPassword,
  } = req.body;

  if (
    code1 == "" &&
    code2 == "" &&
    code3 == "" &&
    code4 == "" &&
    code5 == "" &&
    code6 == ""
  ) {
    log.Error("ForgetPassHandle: code field is empty");
    return res
      .status(HttpStatusCode.BadRequest)
      .send(new utils.ErrorHandler("auth.missingCode", "Missing Code").json());
  }

  const user = await authService.findByUsername(email);
  if (!user) {
    log.Error(`ForgetPassHandle : User not exist by email : ${user}`);
    return res
      .status(HttpStatusCode.Conflict)
      .send(
        new utils.ErrorHandler(
          "forgetNotExist",
          "User not exist - " + email
        ).json()
      );
  }

  const token = code1 + code2 + code3 + code4 + code5 + code6;
  // const checkCode = authService.checkCode(user.objectId)

  try {
    await authService.changeUserPasswordByCode(user, newPassword, token);
    await authService.emptyTokenCode(user.objectId);
    res.clearCookie("he");
    res.clearCookie("pa");
    res.clearCookie("si");

    var viewData = {
      Message: "change password sucessfully.",
    };
    return res.render("message", viewData);
  } catch (error) {
    log.Error("changePassHandle: Find User Problem");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "missingChangePassHandle",
          "Missing Change Password"
        ).json()
      );
  }
};

// Forget password Page
exports.getForgetPasswordPage = async (req, res) => {
  var viewData = {
    AppName: appConfig.APP_NAME,
    LoginLink: "/auth/login",
    OrgName: appConfig.ORG_NAME,
    Title: "Forget Password",
    OrgAvatar: appConfig.ORG_AVATAR,
    ActionForm: "/auth/password/forgetbyemail",
  };
  res.render("forget_password", viewData);
};

// Send reset password link
exports.forgetPassword = async (req, res) => {
  if (req.body.email == "") {
    log.Error("ForgetPassHandle: email field is empty");
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler("auth.missingEmail", "Missing Email").json()
      );
  }

  const schema = Joi.object({ email: Joi.string().email().required() });
  const { error } = schema.validate(req.body);
  if (error) {
    log.Error("ForgetPassHandle: email field is empty");
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "forgetpassmissingvalidation",
          "Missing validation"
        ).json()
      );
  }

  //TODO: why check exist(In Go) - NOW IS FIXED
  const user = await authService.findByUsername(req.body.email);
  if (!user) {
    log.Error(`ForgetPassHandle : User not exist by email : ${user}`);
    return res
      .status(HttpStatusCode.Conflict)
      .send(
        new utils.ErrorHandler(
          "forgetNotExist",
          "User not exist - " + req.body.email
        ).json()
      );
  }
  // let token = await authService.getTokenByUserId(user.objectId);
  // if (!token)
  const token = await authService.createToken(user.objectId);
  // const link = `${appConfig.AUTH_WEB_URI}/forget_password/${user.objectId}/${token.code}`;
  const link = `${appConfig.AUTH_WEB_URI}/password/forgetbyemail/${user.objectId}/${token.code}`;

  let sendMail = false;
  sendMail = await sendEmail(
    user.username,
    user.username,
    link,
    "email_link_verify_reset_pass-css",
    "Request to change your password",
    "" //additionalField
  );
  if (!sendMail) {
    log.Error("Error happened in sending Email!");
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "internal/sendEmailAuth",
          "Error happened in sending email! - " + req.body.email
        ).json()
      );
  }
  var viewData = {
    Message: "password reset link sent to your email account",
  };
  res.render("message", viewData);
};

// Forget password
exports.getForgetPassword = async (req, res) => {
  const reqUserId = req.params.userId;
  const reqToken = req.params.token;
  if (!reqUserId || !reqToken) {
    log.Error("ForgetPassHandle: Input Value Problem");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler("auth.missinginput", "Missing Value").json()
      );
  }

  const user = await authService.findUserById(reqUserId);
  if (!user) {
    log.Error("ForgetPassHandle: find user Problem");
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "missingforgetfinduser",
          "Missing find forget user"
        ).json()
      );
  }

  const token = await authService.checkTokenExistByUserId(
    user.objectId,
    req.params.token
  );

  if (!token) {
    log.Error("ForgetPassHandle: user Token Problem");
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "auth.missingforgettoken",
          "Missing Token forget password"
        ).json()
      );
  }
  await authService.addCounterAndLastUpdate(token.objectId);

  await authService.emptyTokenCode(user.objectId);

  const salt = await bcrypt.genSalt(Number(appConfig.SALT));
  const hashPassword = await bcrypt.hash("123456", salt);
  user.password = hashPassword;
  user.save();

  var viewData = {
    Message: `${user.username} change password to 123456 sucessfully. Please change the password immediately`,
  };
  return res.render("message", viewData);
};
// ChangePasswordHandler creates a handler for logging in
exports.changePasswordHandler = async (req, res) => {
  try {
    const uid = res.locals.user.uid;
    if (!uid) {
      log.Error("ResetPassHandle: Authentication Problem");
      return res
        .status(HttpStatusCode.Unauthorized)
        .send(
          new utils.ErrorHandler(
            "auth.missingloginAuth",
            "Missing Authentication"
          ).json()
        );
    }
    await authService.changeUserPasswordByUserId(
      req.body.oldPassword,
      uid,
      req.body.newPassword
    );
    res.clearCookie("he");
    res.clearCookie("pa");
    res.clearCookie("si");
    var viewData = {
      Message: "change password sucessfully.",
    };
    return res.render("message", viewData);
  } catch (error) {
    log.Error("ResetPassHandle: An Error Occurred") + error;
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "missingChangePassHandle",
          "Missing Change Password"
        ).json()
      );
  }
};

// Declare the github route
exports.loginGithubHandler = async (req, res) => {
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${appConfig.GITHUB_CLIENT_ID}`
  );
};

// Declare the callback github route
exports.loginGithubCallbackHandler = async (req, res) => {
  // The req.query object has the query params that were sent to this route.
  const requestToken = req.query.code;
  const gitCallback = await axios({
    method: "post",
    url: `https://github.com/login/oauth/access_token?client_id=${appConfig.GITHUB_CLIENT_ID}&client_secret=${appConfig.GITHUB_CLIENT_SECRET}&code=${requestToken}`,
    // Set the content type header, so that we get the response in JSON
    headers: {
      accept: "application/json",
    },
  });
  if (!gitCallback) {
    log.Error(`GithubHandle: callback Problem ${gitCallback}`);
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "auth.missinggitCallback",
          "Missing Callback Github"
        ).json()
      );
  }

  access_token = gitCallback.data.access_token;
  return res.redirect("/auth/gitsuccess");
};

// Github Authorization Successfully
exports.loginGithubSuccessHandler = async (req, res) => {
  const gitSuccess = await axios({
    method: "get",
    url: "https://api.github.com/user",
    headers: {
      Authorization: "token " + access_token,
    },
  });

  if (!gitSuccess) {
    log.Error(`GithubHandle: response Github Authorization Problem ${err}`);
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "auth.missinggitAuth",
          "Missing Authorization Github"
        ).json()
      );
  }
  var viewData = { userData: gitSuccess.data };
  res.render("success", viewData);
};

// Declare the google route
exports.loginGoogleHandler = passport.authenticate("google", {
  scope: ["profile", "email"],
});

// Declare the callback google route
(exports.loginGoogleCallbackHandler = passport.authenticate("google", {
  failureRedirect: "/",
})),
  (req, res) => {
    var viewData = { user: req.user._json };
    res.render("google", viewData);
  };

// Show all UsersAuth
exports.getUsers = async (req, res) => {
  const getUsers = await authService.getUsers();
  if (!getUsers) {
    log.Error("ForgetPassHandle: find user Problem");
    return res
      .status(HttpStatusCode.NotFound)
      .send(
        new utils.ErrorHandler(
          "missinggetAllUser",
          "Missing get all user data"
        ).json()
      );
  }
  return res.send(getUsers);
};
// Show all Tokens
exports.getTokens = async (req, res) => {
  const getToken = await authService.getTokens();

  if (!getToken) {
    log.Error("ForgetPassHandle: find user Problem");
    return res
      .status(HttpStatusCode.NotFound)
      .send(
        new utils.ErrorHandler(
          "missinggetAllTokens",
          "Missing Found Token"
        ).json()
      );
  }

  return res.send(getToken);
};

// generateSocialName
exports.generateSocialName = async function (name, uid) {
  return (
    name.toString().replace(" ", "").toLowerCase() +
    uid.toString().split("-")[0]
  );
};

/**
 * Returns signup verify page
 **/
function renderCodeVerify(req, res, data) {
  return res.render("code_verification", {
    Title: data.title,
    OrgName: data.orgName,
    OrgAvatar: data.orgAvatar,
    AppName: data.appName,
    ActionForm: data.actionForm,
    SignupLink: "",
    Secret: data.token,
    Message: data.message,
  });
}

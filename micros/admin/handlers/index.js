const adminService = require("../services/admin.service");
const utils = require("../../../core/utils/error-handler");
const { HttpStatusCode } = require("../../../core/utils/HttpStatusCode");
const log = require("../../../core/utils/errorLogger");
const { appConfig } = require("../config");

// SetupPageHandler creates a handler for logging in
exports.setupPageHandler = async function (req, res) {
  var viewData = {
    SetupAction: "/admin/actions/setup",
  };
  return res.render("start", viewData);
};

// SetupPageHandler creates a handler for logging in
exports.setupHandler = async function (req, res) {
  try {
    const currentUser = res.locals.user;
    if (!currentUser || currentUser == null) {
      log.Error("[SetupHandler] Can not get current user");
      return res
        .status(HttpStatusCode.Unauthorized)
        .send(
          new utils.ErrorHandler(
            "admin.invalidCurrentUser",
            "Can not get current user"
          ).json()
        );
    }

    // Create admin header for http request
    let adminHeaders = {};
    adminHeaders["uid"] = currentUser.userId;
    adminHeaders["email"] = currentUser.email;
    adminHeaders["avatar"] = currentUser.avatar;
    adminHeaders["displayName"] = currentUser.displayName;
    adminHeaders["role"] = currentUser.role;
    // Send request for setting
    const getSettingURL = "/setting";
    const adminSetting = await adminService.microCall(
      "get",
      "[]",
      getSettingURL,
      adminHeaders
    );

    if (!adminSetting) {
      log.Error(`[functionCallByHeader] ${getSettingURL} - ${adminSetting}`);

      return res
        .status(HttpStatusCode.BadRequest)
        .send(
          new utils.ErrorHandler(
            "admin.internal/functionCallByHeader",
            "Error happened while getting settings!"
          ).json()
        );
    }

    let setupStatus = "none";
    adminSetting.list.forEach((setting) => {
      if (setting.name == "status") {
        setupStatus = setting.value;
      }
    });

    if (setupStatus == "completed") {
      return homePageResponse();
    }
    // Create post index
    try {
      // const postIndexURL = appConfig.InternalGateway + "/profile/index";
      const postIndexURL = "http://localhost" + "/profile/index";
      await adminService.microCall("post", "[]", postIndexURL);
    } catch (error) {
      log.Error(
        `[createPostIndex] ${appConfig.InternalGateway + "/profile/index"}`
      );

      return res
        .status(HttpStatusCode.InternalServerError)
        .send(
          new utils.ErrorHandler(
            "internal/createPostIndex",
            "Error happened while creating post index!"
          ).json()
        );
    }

    // Create setting for setup compeleted status
    const settingModel = {
      type: "setup",
      list: [
        {
          name: "status",
          value: "completed",
        },
        ,
      ],
    };

    const settingBytes = JSON.stringify(settingModel);

    // Send request for setting
    const settingURL = "/setting";
    try {
      await adminService.microCall(
        "post",
        settingBytes,
        settingURL,
        adminHeaders
      );
    } catch (error) {
      log.Error(`[createSetting] ${settingURL}`);
      return res
        .status(HttpStatusCode.BadRequest)
        .send(
          new utils.ErrorHandler(
            "internal/createSetting",
            "Error happened while creating setting!"
          ).json()
        );
    }
    return res.render("home");
    // homePageResponse();
  } catch (error) {
    log.Error(`Admin Setup Handler Error ${error}`);
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "admin.setupHandler",
          "Update Admin Error!"
        ).json()
      );
  }
};

// homePageResponse login page response template
function homePageResponse(req, res) {
  return res.render("home");
}

// LoginPageHandler creates a handler for logging in
exports.loginPageHandler = async function (req, res) {
  var loginData = {
    title: "Login - Telar Social",
    orgName: appConfig.ORG_NAME,
    orgAvatar: appConfig.ORG_AVATAR,
    appName: appConfig.APP_NAME,
    actionForm: "",
    resetPassLink: "",
    signupLink: "/auth/signup",
    message: "",
  };
  return res.render("login", loginData);
};

// checkSetupEnabled check whether setup is done already
async function checkSetupEnabled() {
  const url = "/auth/check/admin";
  const adminCheck = await adminService.microCall("post", "[]", url);
  return adminCheck.admin;
}

// LoginAdminHandler creates a handler for logging in telar social
exports.loginAdminHandler = async function (req, res) {
  let loginData = {
    title: "Login - " + appConfig.APP_NAME,
    orgName: appConfig.ORG_NAME,
    orgAvatar: appConfig.ORG_AVATAR,
    appName: appConfig.APP_NAME,
    actionForm: "",
    resetPassLink: "",
    signupLink: "",
    message: "",
  };
  try {
    const { username, password } = req.body;

    if (username == "") {
      log.Error(" Username is empty");
      loginData.message = "Username is required!";
      return res.render("login", loginData);
    }

    if (password == "") {
      log.Error(" Password is empty");
      loginData.message = "Password is required!";
      return res.render("login", loginData);
    }

    const adminExist = await checkSetupEnabled();
    if (!adminExist) var token;
    log.Error(`Admin exist: ${adminExist}`);
    if (!adminExist) {
      const adminToken = await signupAdmin();
      token = adminToken;
    } else {
      const adminToken = await loginAdmin({ username, password });
      token = adminToken;
    }
    // writeTokenOnCookie wite session on cookie
    await adminService.writeSessionOnCookie(res, token);

    return res.render("redirect", { URL: "/admin/setup" });
  } catch (error) {
    log.Error(`Check setup enabled Error:  ${error}`);
    loginData.message = "Internal error while checking setup!";
    return res.render("login", loginData);
  }
};

// signupAdmin signup admin
async function signupAdmin() {
  const url = "/auth/signup/admin";
  const adminsignup = await adminService.microCall("post", "[]", url);
  return adminsignup.token;
}

// loginAdmin login admin
async function loginAdmin(model) {
  const url = "/auth/login/admin";
  const adminLogin = await adminService.microCall("post", model, url);
  return adminLogin.token;
}

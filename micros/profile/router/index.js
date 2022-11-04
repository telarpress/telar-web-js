const express = require("express");
const profileRouter = express.Router();
const { appConfig } = require("../config");
const {
  authCookie,
} = require("../../../core/middleware/authcookie/authcookie");

const { authHMAC } = require("../../../core/middleware/authHMAC/");
const hmacCookieHandlers = (hmacWithCookie) => (req, res, next) => {
  if (req.get(appConfig.HMAC_NAME) !== undefined || !hmacWithCookie) {
    return authHMAC(req, res, next);
  }
  return authCookie(req, res, next);
};

const handlers = require("../handlers");

profileRouter.get(
  "/profile/dto/id/:userId",
  hmacCookieHandlers(),
  handlers.readDtoProfileHandle
);
profileRouter.get("/profile/all", handlers.getProfiles);
// profileRouter.get("/profile/:id", handlers.getProfileById);

// Routers
profileRouter.get(
  "/profile/my",
  hmacCookieHandlers(true),
  handlers.readMyProfileHandle
);
profileRouter.get(
  "/profile",
  hmacCookieHandlers(true),
  handlers.queryUserProfileHandle
);
profileRouter.get(
  "/profile/id/:userId",
  hmacCookieHandlers(true),
  handlers.readProfileHandle
);
profileRouter.get(
  "/profile/social/:name",
  hmacCookieHandlers(true),
  handlers.getBySocialName
);

profileRouter.put(
  "/profile/last-seen",
  hmacCookieHandlers(false),
  handlers.updateLastSeen
);
profileRouter.post(
  "/profile/dto",
  hmacCookieHandlers(false),
  handlers.createDtoProfileHandle
);

profileRouter.put(
  "/profile/",
  hmacCookieHandlers(false),
  handlers.updateProfile
);

profileRouter.post(
  "/profile/index",
  hmacCookieHandlers(false),
  handlers.initProfileIndexHandle
);

// Invoke between functions and protected by HMAC
profileRouter.post(
  "/profile/dispatch",
  hmacCookieHandlers(false),
  handlers.dispatchProfilesHandle
);
profileRouter.post(
  "/profile/dto/ids",
  hmacCookieHandlers(false),
  handlers.getProfileByIds
);
profileRouter.put(
  "/profile/follow/inc/:inc/:userId",
  hmacCookieHandlers(false),
  handlers.increaseFollowCount
);
profileRouter.put(
  "/profile/follower/inc/:inc/:userId",
  hmacCookieHandlers(false),
  handlers.increaseFollowerCount
);

module.exports = profileRouter;

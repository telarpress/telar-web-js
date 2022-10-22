const express = require("express");
const profileRouter = express.Router();

const handlers = require("../handlers");

profileRouter.get("/profile/dto/id/:userId", handlers.readDtoProfileHandle);
profileRouter.get("/profile/all", handlers.getProfiles);
profileRouter.get("/profile/:id", handlers.getProfileById);

// Routers
profileRouter.get("/profile/my", handlers.readMyProfileHandle);
profileRouter.get("/profile", handlers.queryUserProfileHandle);
profileRouter.get("/profile/id/:userId", handlers.readProfileHandle);
profileRouter.get("/profile/social/:name", handlers.getBySocialName);

profileRouter.put("/profile/profile", handlers.updateProfileHandle); // With UserId From Profile
profileRouter.put("/profile/last-seen", handlers.updateLastSeen);
profileRouter.post("/profile/dto", handlers.createDtoProfileHandle);

profileRouter.put("/profile/", handlers.updateProfile); // With Token

profileRouter.post("/profile/index", handlers.initProfileIndexHandle);

// Invoke between functions and protected by HMAC
profileRouter.post("/profile/dispatch", handlers.dispatchProfilesHandle);
profileRouter.post("/profile/dto/ids", handlers.getProfileByIds);
profileRouter.put(
  "/profile/follow/inc/:inc/:userId",
  handlers.increaseFollowCount
);
profileRouter.put(
  "/profile/follower/inc/:inc/:userId",
  handlers.increaseFollowerCount
);

module.exports = profileRouter;

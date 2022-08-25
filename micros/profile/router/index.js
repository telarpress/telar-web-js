const express = require("express");
const profileRouter = express.Router();

const handlers = require("../handlers");

profileRouter.get("/profile/dto/id/:id", handlers.getProfileData);
profileRouter.get("/profile", handlers.getProfile);
profileRouter.get("/profile/:id", handlers.getProfileById);
profileRouter.get("/profile/all", handlers.getProfiles);
profileRouter.post("/profile/dto", handlers.setProfile);
profileRouter.put("/profile/", handlers.updateProfile);



// Routers
app.get("/profile/my",  handlers.readMyProfileHandle)


app.Get("/profile/", append(hmacCookieHandlers, handlers.QueryUserProfileHandle)...)
app.Get("/profile/id/:userId", append(hmacCookieHandlers, handlers.ReadProfileHandle)...)
app.Get("/profile/social/:name", append(hmacCookieHandlers, handlers.GetBySocialName)...)
app.Post("/profile/index", authHMACMiddleware(false), handlers.InitProfileIndexHandle)
app.Put("/profile/last-seen", authHMACMiddleware(false), handlers.UpdateLastSeen)

// Invoke between functions and protected by HMAC
app.Put("/profile/", authHMACMiddleware(false), handlers.UpdateProfileHandle)
app.Get("/profile/dto/id/:userId", authHMACMiddleware(false), handlers.ReadDtoProfileHandle)
app.Post("/profile/dto", authHMACMiddleware(false), handlers.CreateDtoProfileHandle)
app.Post("/profile/dispatch", authHMACMiddleware(false), handlers.DispatchProfilesHandle)
app.Post("/profile/dto/ids", authHMACMiddleware(false), handlers.GetProfileByIds)
app.Put("/profile/follow/inc/:inc/:userId", authHMACMiddleware(false), handlers.IncreaseFollowCount)
app.Put("/profile/follower/inc/:inc/:userId", authHMACMiddleware(false), handlers.IncreaseFollowerCount)


module.exports = profileRouter;

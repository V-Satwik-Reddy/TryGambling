const router = require("express").Router();
const auth = require("../middleware/auth");
router.get("/",auth, (req, res) => {
    res.send("This is a protected route");
});
 module.exports = router;
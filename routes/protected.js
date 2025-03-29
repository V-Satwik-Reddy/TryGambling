const router = require("express").Router();
const auth = require("../middleware/auth");
router.get("/",auth, (req, res) => {
    res.send({message:"This is a protected route",user:req.user});
});
 module.exports = router;
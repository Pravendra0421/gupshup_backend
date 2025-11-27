import jwt from 'jsonwebtoken'
function AuthMiddleware (req,res,next){
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({
            success:"false",
            message:"token is missing"
        })
    };
    try {
        const decode = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decode;
        next();
    } catch (error) {
        return res.status(401).json({
            success:"false",
            message:"Invalid token"
        })
    }
}
export default AuthMiddleware;
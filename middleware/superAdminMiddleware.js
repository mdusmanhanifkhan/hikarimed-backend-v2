export const authorizeRoles = (allowedRoles = []) => {
  return (req, res, next) => {
    const role = req.user?.role?.name;

    console.log(role, "**role**");

    if (!role) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Role not found",
      });
    }

    console.log(allowedRoles)

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied: You do not have permission",
      });
    }

    next();
  };
};

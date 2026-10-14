const jwt = require('jsonwebtoken');
const userService = require('../services/userService');
const { success, error } = require('../utils/response');

function signToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
}

async function register(req, res, next) {
  try {
    const { name, email, password, address } = req.body;
    const user = await userService.createUser({
      name,
      email,
      password,
      address,
      role: 'user',
    });

    const token = signToken(user);
    return success(
      res,
      { user: userService.sanitizeUser(user), token },
      'Registration successful',
      201
    );
  } catch (err) {
    if (err.status) return error(res, err.message, err.status);
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await userService.findByEmail(email);

    if (!user) {
      return error(res, 'Invalid email or password', 401);
    }

    const valid = await userService.verifyPassword(password, user.password_hash);
    if (!valid) {
      return error(res, 'Invalid email or password', 401);
    }

    const safeUser = userService.sanitizeUser(user);
    const token = signToken(safeUser);

    return success(res, { user: safeUser, token }, 'Login successful');
  } catch (err) {
    return next(err);
  }
}

async function me(req, res) {
  return success(res, { user: userService.sanitizeUser(req.user) }, 'Current user');
}

async function logout(req, res) {
  return success(res, null, 'Logged out successfully. Please discard your token on the client.');
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const fullUser = await userService.findByEmail(req.user.email);

    const valid = await userService.verifyPassword(currentPassword, fullUser.password_hash);
    if (!valid) {
      return error(res, 'Current password is incorrect', 400);
    }

    await userService.updatePassword(req.user.id, newPassword);
    return success(res, null, 'Password updated successfully');
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login, me, logout, changePassword };

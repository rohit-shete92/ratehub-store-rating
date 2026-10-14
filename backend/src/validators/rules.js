const { body, query, param, validationResult } = require('express-validator');
const { normalizeEmail, trimString } = require('../utils/normalize');
const { error } = require('../utils/response');

const NAME_MIN = 20;
const NAME_MAX = 60;
const ADDRESS_MAX = 400;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 16;

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,16}$/;

const nameValidator = (field = 'name') =>
  body(field)
    .customSanitizer(trimString)
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: NAME_MIN, max: NAME_MAX })
    .withMessage(`Name must be between ${NAME_MIN} and ${NAME_MAX} characters`);

const addressValidator = (field = 'address') =>
  body(field)
    .customSanitizer(trimString)
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ max: ADDRESS_MAX })
    .withMessage(`Address must be at most ${ADDRESS_MAX} characters`);

const emailValidator = (field = 'email') =>
  body(field)
    .customSanitizer(normalizeEmail)
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address');

const passwordValidator = (field = 'password') =>
  body(field)
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: PASSWORD_MIN, max: PASSWORD_MAX })
    .withMessage(`Password must be between ${PASSWORD_MIN} and ${PASSWORD_MAX} characters`)
    .matches(passwordRegex)
    .withMessage(
      'Password must include at least one uppercase letter, one lowercase letter, one digit, and one special character'
    );

const ratingValidator = (field = 'rating') =>
  body(field)
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5')
    .toInt();

const roleValidator = (field = 'role') =>
  body(field)
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['admin', 'user', 'store_owner'])
    .withMessage('Role must be admin, user, or store_owner');

const optionalSearch = (field) =>
  query(field).optional().customSanitizer(trimString).isLength({ max: 255 });

const sortValidator = (allowedFields) => [
  query('sortBy')
    .optional()
    .customSanitizer(trimString)
    .isIn(allowedFields)
    .withMessage(`sortBy must be one of: ${allowedFields.join(', ')}`),
  query('sortOrder')
    .optional()
    .customSanitizer((v) => String(v || 'asc').toLowerCase())
    .isIn(['asc', 'desc'])
    .withMessage('sortOrder must be asc or desc'),
];

function validate(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    return error(res, errors[0]?.message || 'Validation failed', 400, errors);
  }
  return next();
}

const registerRules = [nameValidator(), emailValidator(), passwordValidator(), addressValidator(), validate];

const loginRules = [
  body('email')
    .customSanitizer(normalizeEmail)
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  passwordValidator('newPassword'),
  body('newPassword')
    .custom((value, { req }) => value !== req.body.currentPassword)
    .withMessage('New password must be different from current password'),
  validate,
];

const createUserRules = [
  nameValidator(),
  emailValidator(),
  passwordValidator(),
  addressValidator(),
  roleValidator(),
  validate,
];

const createStoreRules = [
  nameValidator(),
  emailValidator(),
  addressValidator(),
  body('ownerId')
    .optional({ nullable: true })
    .custom((value) => value === null || value === '' || Number.isInteger(Number(value)))
    .withMessage('ownerId must be a valid integer or null'),
  validate,
];

const ratingRules = [ratingValidator(), validate];

const idParam = [param('id').isInt({ min: 1 }).withMessage('Invalid id').toInt(), validate];

const userListQuery = [
  optionalSearch('name'),
  optionalSearch('email'),
  optionalSearch('address'),
  query('role')
    .optional()
    .customSanitizer(trimString)
    .isIn(['admin', 'user', 'store_owner', ''])
    .withMessage('Invalid role filter'),
  ...sortValidator(['name', 'email', 'address', 'role', 'created_at']),
  validate,
];

const storeListQuery = [
  optionalSearch('name'),
  optionalSearch('email'),
  optionalSearch('address'),
  ...sortValidator(['name', 'email', 'address', 'average_rating', 'created_at']),
  validate,
];

module.exports = {
  NAME_MIN,
  NAME_MAX,
  ADDRESS_MAX,
  PASSWORD_MIN,
  PASSWORD_MAX,
  passwordRegex,
  validate,
  registerRules,
  loginRules,
  changePasswordRules,
  createUserRules,
  createStoreRules,
  ratingRules,
  idParam,
  userListQuery,
  storeListQuery,
};

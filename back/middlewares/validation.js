const { body, validationResult } = require('express-validator');

const userValidationRules = () => {
  return [
    body('firstName').trim().notEmpty().withMessage('Le prénom est requis')
      .isLength({ max: 50 }).withMessage('Le prénom ne doit pas dépasser 50 caractères'),
    
    body('lastName').trim().notEmpty().withMessage('Le nom est requis')
      .isLength({ max: 50 }).withMessage('Le nom ne doit pas dépasser 50 caractères'),
    
    body('email').trim().notEmpty().withMessage('L\'email est requis')
      .isEmail().withMessage('Email invalide')
      .normalizeEmail(),
    
    body('phoneNumber').trim().notEmpty().withMessage('Le numéro de téléphone est requis')
      .matches(/^[0-9+\s-]{8,20}$/).withMessage('Numéro de téléphone invalide'),
    
    body('password').notEmpty().withMessage('Le mot de passe est requis')
      .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
      .matches(/\d/).withMessage('Le mot de passe doit contenir au moins un chiffre')
      .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une majuscule'),
    
    body('birthDate').notEmpty().withMessage('La date de naissance est requise')
      .isISO8601().withMessage('Format de date invalide'),
    
    body('idExpirationDate').notEmpty().withMessage('La date d\'expiration est requise')
      .isISO8601().withMessage('Format de date invalide'),
    
    body('birthPlace').trim().notEmpty().withMessage('Le lieu de naissance est requis')
      .isLength({ max: 100 }).withMessage('Le lieu de naissance ne doit pas dépasser 100 caractères'),
    
    body('cardNumber').trim().notEmpty().withMessage('Le numéro de carte est requis')
      .isLength({ max: 50 }).withMessage('Le numéro de carte ne doit pas dépasser 50 caractères'),
    
    body('fatherFullName').trim().notEmpty().withMessage('Le nom complet du père est requis')
      .isLength({ max: 100 }).withMessage('Le nom du père ne doit pas dépasser 100 caractères'),
    
    body('motherFullName').trim().notEmpty().withMessage('Le nom complet de la mère est requis')
      .isLength({ max: 100 }).withMessage('Le nom de la mère ne doit pas dépasser 100 caractères'),
    
    body('address').trim().notEmpty().withMessage('L\'adresse est requise'),
    
    body('gender').trim().notEmpty().withMessage('Le genre est requis')
      .isIn(['male', 'female']).withMessage('Genre invalide'),
    
    body('civilStatusNumber').trim().notEmpty().withMessage('Le numéro d\'état civil est requis')
      .isLength({ max: 50 }).withMessage('Le numéro d\'état civil ne doit pas dépasser 50 caractères')
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  userValidationRules,
  validate
};
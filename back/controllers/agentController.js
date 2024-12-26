const Agent = require('../models/Agent');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
   
    // Check if agent exists
    const agent = await Agent.findByEmail(email);
    if (!agent) {
      return res.status(401).json({
        status: 'error',
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Validate password
    const isValidPassword = await Agent.validatePassword(password, agent.password);
    if (!isValidPassword) {
      return res.status(401).json({
        status: 'error',
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Remove sensitive data
    const { password: _, ...agentWithoutPassword } = agent;

    // Generate token
    const token = jwt.sign(
      {
        id: agent.id,
        email: agent.email,
        type: 'agent',
        agent_type: agent.agent_type
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      status: 'success',
      data: {
        agent: agentWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.register = async (req, res) => {
  try {
    const { email, password, first_name, last_name, agent_type } = req.body;
    
    // Validate agent_type
    if (!['insurance', 'conservation'].includes(agent_type)) {
      return res.status(400).json({
        status: 'error',
        message: 'Type d\'agent invalide'
      });
    }

    // Check if agent already exists
    const existingAgent = await Agent.findByEmail(email);
    if (existingAgent) {
      return res.status(400).json({
        status: 'error',
        message: 'Un agent avec cet email existe déjà'
      });
    }

    // Create new agent
    const agent = await Agent.create({
      email,
      password,
      first_name,
      last_name,
      agent_type
    });

    // Remove sensitive data
    delete agent.password;

    // Generate token
    const token = jwt.sign(
      {
        id: agent.id,
        email: agent.email,
        type: 'agent',
        agent_type: agent.agent_type
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      status: 'success',
      data: {
        agent,
        token
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};
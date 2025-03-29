// Simple in-memory User storage
// In a real application, this would use a database
const bcrypt = require('bcryptjs');

// In-memory database of users
const users = [];
let nextId = 1;

class User {
  constructor(name, email, password) {
    this.id = nextId++;
    this.name = name;
    this.email = email;
    this.password = password;
    this.createdAt = new Date();
  }

  // Verify password
  async verifyPassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  // Remove password before returning to client
  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}

module.exports = {
  // Create new user
  async create(name, email, password) {
    // Check if user with this email already exists
    if (this.findByEmail(email)) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and store user
    const user = new User(name, email, hashedPassword);
    users.push(user);
    return user;
  },

  // Find user by email
  findByEmail(email) {
    return users.find(user => user.email === email);
  },

  // Find user by ID
  findById(id) {
    return users.find(user => user.id === id);
  },

  // Get all users
  findAll() {
    return users;
  },
};

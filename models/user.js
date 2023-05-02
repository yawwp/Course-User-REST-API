'use strict';
const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  class User extends Model {}

  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull:{
          msg: "A first name is required"
        },
        notEmpty:{
          msg:'Please provide a first name'
        }
      }
    },
    lastName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull:{
          msg: "A last name is required"
        },
        notEmpty:{
          msg:'Please provide a last name'
        }
      }
    },
    emailAddress: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        notNull:{
          msg: "An email is required"
        },
        notEmpty:{
          msg:'Please provide an email'
        },
        isEmail: {
          msg: 'Please provide a valid email address'
        }
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull:{
          msg: "A password is required"
        },
        notEmpty:{
          msg:'Please provide a password'
        }
      },
      set(value){
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(value, salt);
        this.setDataValue('password',hash);
      } 
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
  },
},{
    sequelize,
    modelName: 'User',
    tableName: 'Users',
  });

  User.associate = (models) => {
    User.hasMany(models.Course, { foreignKey:'userId' }); 
  }

  return User;
};

module.exports = (sequelize, DataTypes) => {
  const Details = sequelize.define('Details', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  Details.associate = (models) => {
    Details.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Details;
};

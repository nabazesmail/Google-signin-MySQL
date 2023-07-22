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
    clicks: { // Add a field to hold clicks count
      type: DataTypes.INTEGER,
      defaultValue: 0, // Initialize clicks count to 0
    },
    visits: { // Add a field to hold visits count
      type: DataTypes.INTEGER,
      defaultValue: 0, // Initialize visits count to 0
    },
  });

  Details.associate = (models) => {
    Details.belongsTo(models.User, {
      foreignKey: 'userId'
    });
  };

  return Details;
};
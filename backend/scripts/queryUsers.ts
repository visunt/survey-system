import sequelize from '../src/config/database';
import User from '../src/models/User';

async function queryUsers() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected successfully');

    console.log('\n=== Querying users table ===');
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'password', 'role', 'createdAt'],
    });

    console.log(`Found ${users.length} users:`);
    users.forEach((user: any, index: number) => {
      console.log(`\n${index + 1}. ID: ${user.id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.createdAt}`);
    });

    console.log('\n=== Checking for visunt@sina.com email ===');
    const sinaUser = users.find((user: any) => user.email === 'visunt@sina.com');
    
    if (sinaUser) {
      console.log('\n✅ Found user with visunt@sina.com email:');
      console.log(`   ID: ${sinaUser.id}`);
      console.log(`   Username: ${sinaUser.username}`);
      console.log(`   Email: ${sinaUser.email}`);
      console.log(`   Role: ${sinaUser.role}`);
    } else {
      console.log('\n❌ No user found with visunt@sina.com email');
    }

    await sequelize.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error querying database:', error);
    process.exit(1);
  }
}

queryUsers();

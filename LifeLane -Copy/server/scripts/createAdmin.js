import bcrypt from 'bcryptjs';

const password = 'your_admin_password'; // Replace with your desired password
bcrypt.hash(password, 10).then(hash => {
    console.log('Hashed password:', hash);
    console.log('\nUse this SQL command to create admin:');
    console.log(`
    INSERT INTO admins (email, password, full_name, role)
    VALUES ('admin@example.com', '${hash}', 'Admin User', 'super_admin');
    `);
}); 
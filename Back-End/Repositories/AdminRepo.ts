// adminRepository.ts
import dotenv from 'dotenv';

dotenv.config();

const getAdminCredentials = () => {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
        throw new Error("Admin credentials are not configured properly");
    }

    return { adminEmail, adminPassword };
};

export default { getAdminCredentials };
